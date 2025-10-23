// Database validation utilities for ensuring data integrity and preventing runtime errors
import { executeQuery } from './connection';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface FieldValidation {
  fieldName: string;
  dataType: string;
  isNullable: boolean;
  maxLength?: number;
  precision?: number;
  scale?: number;
}

export interface TableValidation {
  tableName: string;
  exists: boolean;
  fields: FieldValidation[];
  primaryKey?: string[];
  foreignKeys?: Array<{
    field: string;
    references: {
      table: string;
      field: string;
    };
  }>;
}

type ColumnMetadataRow = {
  COLUMN_NAME: string;
  DATA_TYPE: string;
  IS_NULLABLE: string;
  CHARACTER_MAXIMUM_LENGTH: number | null;
  NUMERIC_PRECISION: number | null;
  NUMERIC_SCALE: number | null;
};

type PrimaryKeyRow = {
  COLUMN_NAME: string;
};

/**
 * Validates if a table exists in the database
 */
export async function validateTableExists(
  tableName: string,
  database: 'mapex' | 'sage' | 'whales' = 'mapex'
): Promise<ValidationResult> {
  const result: ValidationResult = {
    isValid: false,
    errors: [],
    warnings: []
  };

  try {
    // Query to check if table exists
    const sql = `
      SELECT TABLE_NAME
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_TYPE = 'BASE TABLE'
        AND TABLE_NAME = @tableName
    `;

    const queryResult = await executeQuery(sql, { tableName }, database);

    if (queryResult && queryResult.length > 0) {
      result.isValid = true;
    } else {
      result.errors.push(`Table '${tableName}' does not exist in database '${database}'`);
    }
  } catch (error) {
    result.errors.push(`Error checking table existence: ${error instanceof Error ? error.message : String(error)}`);
  }

  return result;
}

/**
 * Validates if fields exist in a table and returns field metadata
 */
export async function validateTableFields(
  tableName: string,
  fieldNames: string[],
  database: 'mapex' | 'sage' | 'whales' = 'mapex'
): Promise<ValidationResult> {
  const result: ValidationResult = {
    isValid: false,
    errors: [],
    warnings: []
  };

  try {
    // First check if table exists
    const tableCheck = await validateTableExists(tableName, database);
    if (!tableCheck.isValid) {
      result.errors.push(...tableCheck.errors);
      return result;
    }

    // Query to get field information
    const sql = `
      SELECT
        COLUMN_NAME,
        DATA_TYPE,
        IS_NULLABLE,
        CHARACTER_MAXIMUM_LENGTH,
        NUMERIC_PRECISION,
        NUMERIC_SCALE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = @tableName
        AND COLUMN_NAME IN (${fieldNames.map((_, i) => `@field${i}`).join(', ')})
      ORDER BY COLUMN_NAME
    `;

    const parameters: Record<string, string> = { tableName };
    fieldNames.forEach((field, index) => {
      parameters[`field${index}`] = field;
    });

    const queryResult = await executeQuery<ColumnMetadataRow>(sql, parameters, database);

    if (!queryResult || queryResult.length === 0) {
      result.errors.push(`None of the requested fields found in table '${tableName}'`);
      return result;
    }

    // Check which fields are missing
    const foundFields = queryResult.map((row) => row.COLUMN_NAME);
    const missingFields = fieldNames.filter(field => !foundFields.includes(field));

    if (missingFields.length > 0) {
      result.errors.push(`Fields not found in table '${tableName}': ${missingFields.join(', ')}`);
    }

    // Validate data types and nullability
    queryResult.forEach((field) => {
      if (field.IS_NULLABLE === 'YES') {
        result.warnings.push(`Field '${field.COLUMN_NAME}' allows NULL values`);
      }
    });

    result.isValid = missingFields.length === 0;

  } catch (error) {
    result.errors.push(`Error validating table fields: ${error instanceof Error ? error.message : String(error)}`);
  }

  return result;
}

/**
 * Gets complete table schema information
 */
export async function getTableSchema(
  tableName: string,
  database: 'mapex' | 'sage' | 'whales' = 'mapex'
): Promise<TableValidation> {
  const schema: TableValidation = {
    tableName,
    exists: false,
    fields: []
  };

  try {
    // Check table existence
    const tableCheck = await validateTableExists(tableName, database);
    schema.exists = tableCheck.isValid;

    if (!schema.exists) {
      return schema;
    }

    // Get field information
    const sql = `
      SELECT
        COLUMN_NAME,
        DATA_TYPE,
        IS_NULLABLE,
        CHARACTER_MAXIMUM_LENGTH,
        NUMERIC_PRECISION,
        NUMERIC_SCALE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = @tableName
      ORDER BY ORDINAL_POSITION
    `;

    const queryResult = await executeQuery<ColumnMetadataRow>(sql, { tableName }, database);

    schema.fields = queryResult.map((row) => ({
      fieldName: row.COLUMN_NAME,
      dataType: row.DATA_TYPE,
      isNullable: row.IS_NULLABLE === 'YES',
      maxLength: row.CHARACTER_MAXIMUM_LENGTH ?? undefined,
      precision: row.NUMERIC_PRECISION ?? undefined,
      scale: row.NUMERIC_SCALE ?? undefined
    }));

    // Get primary key information
    const pkSql = `
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
      WHERE OBJECTPROPERTY(OBJECT_ID(CONSTRAINT_SCHEMA + '.' + QUOTENAME(CONSTRAINT_NAME)), 'IsPrimaryKey') = 1
        AND TABLE_NAME = @tableName
      ORDER BY ORDINAL_POSITION
    `;

    const pkResult = await executeQuery<PrimaryKeyRow>(pkSql, { tableName }, database);
    if (pkResult && pkResult.length > 0) {
      schema.primaryKey = pkResult.map((row: { COLUMN_NAME: string }) => row.COLUMN_NAME);
    }

  } catch (error) {
    // Error handling without console statement
  }

  return schema;
}

/**
 * Validates data types for field values
 */
export function validateDataTypes(
  fieldSchema: FieldValidation[],
  data: { [key: string]: any }
): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  for (const field of fieldSchema) {
    const fieldName = field.fieldName;
    const value = data[fieldName];

    // Check NULL values
    if (value === null || value === undefined) {
      if (!field.isNullable) {
        result.errors.push(`Field '${fieldName}' does not allow NULL values`);
        result.isValid = false;
      }
      continue;
    }

    // Validate data type compatibility
    const validation = validateFieldValue(field, value);
    if (!validation.isValid) {
      result.errors.push(...validation.errors);
      result.isValid = false;
    }
    result.warnings.push(...validation.warnings);
  }

  return result;
}

/**
 * Validates a single field value against its schema
 */
export function validateFieldValue(
  field: FieldValidation,
  value: any
): ValidationResult {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  try {
    switch (field.dataType.toLowerCase()) {
      case 'int':
      case 'smallint':
      case 'tinyint':
      case 'bigint':
        if (typeof value !== 'number' || !Number.isInteger(value)) {
          result.errors.push(`Field '${field.fieldName}' expects integer, got ${typeof value}`);
          result.isValid = false;
        }
        break;

      case 'decimal':
      case 'numeric':
      case 'float':
      case 'real':
        if (typeof value !== 'number') {
          result.errors.push(`Field '${field.fieldName}' expects number, got ${typeof value}`);
          result.isValid = false;
        } else if (field.precision && Math.abs(value) >= Math.pow(10, field.precision - (field.scale || 0))) {
          result.errors.push(`Value for '${field.fieldName}' exceeds precision ${field.precision}`);
          result.isValid = false;
        }
        break;

      case 'varchar':
      case 'nvarchar':
      case 'char':
      case 'nchar':
        if (typeof value !== 'string') {
          result.errors.push(`Field '${field.fieldName}' expects string, got ${typeof value}`);
          result.isValid = false;
        } else if (field.maxLength && value.length > field.maxLength) {
          result.errors.push(`String length for '${field.fieldName}' exceeds maximum ${field.maxLength}`);
          result.isValid = false;
        }
        break;

      case 'datetime':
      case 'datetime2':
      case 'smalldatetime':
        if (!(value instanceof Date) && typeof value !== 'string') {
          result.errors.push(`Field '${field.fieldName}' expects Date or date string, got ${typeof value}`);
          result.isValid = false;
        } else {
          // Try to parse string as date
          if (typeof value === 'string') {
            const date = new Date(value);
            if (isNaN(date.getTime())) {
              result.errors.push(`Invalid date format for field '${field.fieldName}'`);
              result.isValid = false;
            }
          }
        }
        break;

      case 'bit':
        if (typeof value !== 'boolean' && value !== 0 && value !== 1) {
          result.errors.push(`Field '${field.fieldName}' expects boolean or 0/1, got ${typeof value}`);
          result.isValid = false;
        }
        break;

      default:
        // For unknown types, just check if value is not null/undefined
        result.warnings.push(`Unknown data type '${field.dataType}' for field '${field.fieldName}' - validation skipped`);
    }
  } catch (error) {
    result.errors.push(`Error validating field '${field.fieldName}': ${error instanceof Error ? error.message : String(error)}`);
    result.isValid = false;
  }

  return result;
}

/**
 * Comprehensive validation function that checks table, fields, and data
 */
export async function validateQueryData(
  tableName: string,
  fieldNames: string[],
  data?: { [key: string]: any },
  database: 'mapex' | 'sage' | 'whales' = 'mapex'
): Promise<ValidationResult> {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  try {
    // 1. Validate table exists
    const tableValidation = await validateTableExists(tableName, database);
    if (!tableValidation.isValid) {
      result.errors.push(...tableValidation.errors);
      result.isValid = false;
      return result;
    }

    // 2. Validate fields exist
    const fieldValidation = await validateTableFields(tableName, fieldNames, database);
    if (!fieldValidation.isValid) {
      result.errors.push(...fieldValidation.errors);
      result.isValid = false;
    }
    result.warnings.push(...fieldValidation.warnings);

    // 3. If data provided, validate data types
    if (data && result.isValid) {
      const schema = await getTableSchema(tableName, database);
      const dataValidation = validateDataTypes(schema.fields, data);
      if (!dataValidation.isValid) {
        result.errors.push(...dataValidation.errors);
        result.isValid = false;
      }
      result.warnings.push(...dataValidation.warnings);
    }

  } catch (error) {
    result.errors.push(`Validation error: ${error instanceof Error ? error.message : String(error)}`);
    result.isValid = false;
  }

  return result;
}

/**
 * Utility function to handle NULL values according to field schema
 */
export function handleNullValues(
  data: { [key: string]: any },
  fieldSchema: FieldValidation[]
): { [key: string]: any } {
  const processed = { ...data };

  for (const field of fieldSchema) {
    const fieldName = field.fieldName;
    const value = processed[fieldName];

    // Convert undefined to null
    if (value === undefined) {
      processed[fieldName] = null;
    }

    // Handle empty strings for non-nullable fields
    if (!field.isNullable && value === '') {
      processed[fieldName] = null;
    }

    // Handle zero values for non-nullable numeric fields
    if (!field.isNullable &&
        field.dataType.toLowerCase().includes('int') &&
        (value === null || value === undefined)) {
      processed[fieldName] = 0;
    }
  }

  return processed;
}

/**
 * Validates SQL query structure and referenced tables/fields
 */
export async function validateQueryStructure(
  sql: string,
  database: 'mapex' | 'sage' | 'whales' = 'mapex'
): Promise<ValidationResult> {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  try {
    // Extract table names from SQL using regex
    const tableRegex = /\bFROM\s+([`[]?[\w\d_]+[`]]?)\b|\bJOIN\s+([`[]?[\w\d_]+[`]]?)\b/gi;
    const tables: string[] = [];
    let match;

    while ((match = tableRegex.exec(sql)) !== null) {
      const tableName = (match[1] || match[2]).replace(/[`[\]]/g, '');
      if (!tables.includes(tableName)) {
        tables.push(tableName);
      }
    }

    // Extract field names from SELECT clause (simplified for basic validation)
    const selectRegex = /\bSELECT\s+(.+?)\bFROM\b/i;
    const selectMatch = sql.match(selectRegex);
    const fields: string[] = [];

    if (selectMatch) {
      const selectClause = selectMatch[1];
      // Split by commas and extract field names (basic implementation)
      const fieldItems = selectClause.split(',').map(item => item.trim());

      for (const item of fieldItems) {
        // Skip aggregate functions and complex expressions for now
        if (!item.includes('(') && !item.includes('COUNT') &&
            !item.includes('SUM') && !item.includes('AVG') &&
            !item.includes('*')) {
          const fieldName = item.split('.').pop()?.replace(/[`[\]]/g, '');
          if (fieldName && !fields.includes(fieldName)) {
            fields.push(fieldName);
          }
        }
      }
    }

    // Validate each table exists
    for (const tableName of tables) {
      const tableValidation = await validateTableExists(tableName, database);
      if (!tableValidation.isValid) {
        result.errors.push(`Table '${tableName}' referenced in query does not exist`);
        result.isValid = false;
      }
    }

    // For the first table, validate fields if we extracted any
    if (tables.length > 0 && fields.length > 0) {
      const fieldValidation = await validateTableFields(tables[0], fields, database);
      if (!fieldValidation.isValid) {
        result.errors.push(`Some fields in SELECT clause do not exist in table '${tables[0]}'`);
        result.isValid = false;
      }
      result.warnings.push(...fieldValidation.warnings);
    }

  } catch (error) {
    result.errors.push(`Error validating query structure: ${error instanceof Error ? error.message : String(error)}`);
    result.isValid = false;
  }

  return result;
}

/**
 * Creates a validation error with detailed context
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public validationResult: ValidationResult,
    public tableName?: string,
    public fieldNames?: string[]
  ) {
    super(message);
    this.name = 'ValidationError';
    // Mark unused parameters to avoid eslint warnings
    void this.tableName;
    void this.fieldNames;
  }
}
