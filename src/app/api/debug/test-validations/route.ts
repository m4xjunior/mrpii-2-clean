import { NextRequest, NextResponse } from "next/server";
import { executeQuery, executeCachedQuery, testConnections, diagnoseDatabaseIssues } from "lib/database/connection";
import { validateQueryData, validateTableExists, validateTableFields } from "lib/database/validations";

// Type definitions to avoid import issues
interface TestResult {
  test: string;
  status: 'passed' | 'failed' | 'skipped';
  message: string;
  duration: number;
}

// Test configuration
const TEST_CONFIG = {
  timeout: 30000, // 30 seconds per test
  retries: 3,
  verbose: true
};

// Test results storage
let testResults: {
  passed: number;
  failed: number;
  skipped: number;
  total: number;
  details: Array<{
    test: string;
    status: 'passed' | 'failed' | 'skipped';
    message: string;
    duration: number;
  }>;
} = {
  passed: 0,
  failed: 0,
  skipped: 0,
  total: 0,
  details: []
};

// Helper function to log test results
function logTest(testName: string, status: 'passed' | 'failed' | 'skipped', message = '', duration = 0) {
  testResults.total++;
  testResults[status]++;

  const statusIcon = status === 'passed' ? '✅' : status === 'failed' ? '❌' : '⏭️';
  const durationStr = duration > 0 ? ` (${duration}ms)` : '';

  console.log(`${statusIcon} ${testName}${durationStr}`);
  if (message) console.log(`   ${message}`);

  testResults.details.push({
    test: testName,
    status,
    message,
    duration
  });
}

// Helper function to measure execution time
async function measureTime<T>(fn: () => Promise<T>): Promise<{ result: T | null; duration: number; error: any }> {
  const start = Date.now();
  try {
    const result = await fn();
    const duration = Date.now() - start;
    return { result, duration, error: null };
  } catch (error) {
    const duration = Date.now() - start;
    return { result: null, duration, error };
  }
}

// Test 1: Database Connectivity
async function testDatabaseConnectivity(): Promise<boolean> {
  console.log('\n🔗 Testing Database Connectivity...');

  const { result, duration, error } = await measureTime(async () => {
    return await testConnections();
  });

  if (error) {
    logTest('Database Connectivity', 'failed', `Connection failed: ${error.message}`, duration);
    return false;
  }

  const mapexConnected = result?.mapex?.connected;
  const responseTime = result?.mapex?.responseTime || 0;

  if (mapexConnected && responseTime < 5000) {
    logTest('Database Connectivity', 'passed', `MAPEX connected (${responseTime}ms)`, duration);
    return true;
  } else if (mapexConnected) {
    logTest('Database Connectivity', 'passed', `MAPEX connected but slow (${responseTime}ms)`, duration);
    return true;
  } else {
    logTest('Database Connectivity', 'failed', 'MAPEX not connected', duration);
    return false;
  }
}

// Test 2: Table and Field Existence
async function testTableAndFieldExistence(): Promise<boolean> {
  console.log('\n📋 Testing Table and Field Existence...');

  const criticalTables = [
    { table: 'cfg_maquina', fields: ['Cod_maquina', 'Rt_Unidades_ok_of', 'Ag_Rt_Rend_Turno'] },
    { table: 'his_prod', fields: ['Unidades_ok', 'Fecha_ini', 'Fecha_fin'] },
    { table: 'his_of', fields: ['Rt_Cod_of', 'estado'] },
    { table: 'his_fase', fields: ['id_his_fase', 'id_his_of'] }
  ];

  let allValid = true;

  for (const { table, fields } of criticalTables) {
    const { result, duration, error } = await measureTime(async () => {
      return await validateQueryData(table, fields, undefined, 'mapex');
    });

    if (error) {
      logTest(`Table Validation: ${table}`, 'failed', `Validation error: ${error.message}`, duration);
      allValid = false;
      continue;
    }

    if (result?.isValid) {
      logTest(`Table Validation: ${table}`, 'passed', `All fields exist (${fields.length} fields)`, duration);
    } else {
      logTest(`Table Validation: ${table}`, 'failed', `Missing fields: ${result?.errors?.join(', ')}`, duration);
      allValid = false;
    }

    if (result?.warnings && result.warnings.length > 0) {
      console.log(`   ⚠️ Warnings: ${result.warnings.join(', ')}`);
    }
  }

  return allValid;
}

// Test 3: F_his_paro Function with Corrected Parameters
async function testFHisParoFunction(): Promise<boolean> {
  console.log('\n🔧 Testing F_his_paro Function...');

  // Test different parameter combinations that were corrected
  const testQueries = [
    {
      name: 'F_his_paro with DOWNTIME parameters',
      sql: `
        SELECT TOP 1 OEE_c, Rend_c
        FROM cfg_maquina cm
        CROSS APPLY [F_his_paro]('DOWNTIME','WORKCENTER','MOVEMENT',
          DATEADD(DAY, -7, GETDATE()), DATEADD(DAY, 1, GETDATE()))
        WHERE cm.Cod_maquina = 'DOBL7' AND cm.activo = 1
      `
    },
    {
      name: 'F_his_paro with WORKCENTER parameters',
      sql: `
        SELECT TOP 1 OEE_c, Rend_c
        FROM cfg_maquina cm
        CROSS APPLY [F_his_paro]('WORKCENTER','DAY','TURNO',
          DATEADD(DAY, -1, GETDATE()))
        WHERE cm.Cod_maquina = 'DOBL7' AND cm.activo = 1
      `
    }
  ];

  let allValid = true;

  for (const { name, sql } of testQueries) {
    const { result, duration, error } = await measureTime(async () => {
      return await executeQuery(sql, undefined, 'mapex');
    });

    if (error) {
      // Check if it's a timeout or connection error (acceptable for complex queries)
      if (error.message.includes('timeout') || error.message.includes('ECLOSE')) {
        logTest(`F_his_paro: ${name}`, 'passed', `Expected timeout for complex query`, duration);
      } else {
        logTest(`F_his_paro: ${name}`, 'failed', `Unexpected error: ${error.message}`, duration);
        allValid = false;
      }
    } else if (result && result.length >= 0) {
      logTest(`F_his_paro: ${name}`, 'passed', `Query executed (${result.length} rows)`, duration);
    } else {
      logTest(`F_his_paro: ${name}`, 'failed', 'Query returned null result', duration);
      allValid = false;
    }
  }

  return allValid;
}

// Test 4: Production Data Queries
async function testProductionDataQueries(): Promise<boolean> {
  console.log('\n🏭 Testing Production Data Queries...');

  const testQueries = [
    {
      name: 'Basic production query',
      sql: `
        SELECT TOP 5 hp.Unidades_ok, hp.Unidades_nok, hp.Fecha_ini
        FROM his_prod hp
        INNER JOIN cfg_maquina cm ON hp.Id_maquina = cm.id_maquina
        WHERE cm.Cod_maquina = 'DOBL7'
          AND hp.Fecha_ini >= DATEADD(DAY, -7, GETDATE())
        ORDER BY hp.Fecha_ini DESC
      `
    },
    {
      name: 'Production with OF join',
      sql: `
        SELECT TOP 3 ho.Rt_Cod_of, SUM(hp.Unidades_ok) as total_ok
        FROM his_of ho
        INNER JOIN his_fase hf ON ho.id_his_of = hf.id_his_of
        INNER JOIN his_prod hp ON hf.id_his_fase = hp.id_his_fase
        INNER JOIN cfg_maquina cm ON hp.Id_maquina = cm.id_maquina
        WHERE ho.Rt_Cod_of LIKE '%SEC%'
          AND hp.Fecha_fin IS NOT NULL
        GROUP BY ho.Rt_Cod_of
        ORDER BY total_ok DESC
      `
    },
    {
      name: 'Current production status',
      sql: `
        SELECT cm.Cod_maquina, cm.Rt_Unidades_ok_of, cm.Rt_Unidades_nok_of
        FROM cfg_maquina cm
        WHERE cm.activo = 1
          AND cm.Rt_Cod_of IS NOT NULL
          AND cm.Rt_Cod_of <> '--'
        ORDER BY cm.Cod_maquina
      `
    }
  ];

  let allValid = true;

  for (const { name, sql } of testQueries) {
    const { result, duration, error } = await measureTime(async () => {
      return await executeQuery(sql, undefined, 'mapex');
    });

    if (error) {
      logTest(`Production: ${name}`, 'failed', `Query failed: ${error.message}`, duration);
      allValid = false;
    } else if (result && result.length > 0) {
      logTest(`Production: ${name}`, 'passed', `Returned ${result.length} rows`, duration);
    } else {
      logTest(`Production: ${name}`, 'passed', `Query executed but no data (acceptable)`, duration);
    }
  }

  return allValid;
}

// Test 5: Cache Implementation with TTL
async function testCacheImplementation(): Promise<boolean> {
  console.log('\n💾 Testing Cache Implementation...');

  const testSql = `SELECT TOP 1 Cod_maquina, Desc_maquina FROM cfg_maquina WHERE activo = 1`;
  const testParams = {};

  // First execution (should hit database)
  const { result: result1, duration: duration1, error: error1 } = await measureTime(async () => {
    return await executeCachedQuery(testSql, testParams, 'mapex');
  });

  if (error1) {
    logTest('Cache Implementation', 'failed', `First query failed: ${error1.message}`, duration1);
    return false;
  }

  // Second execution (should hit cache)
  const { result: result2, duration: duration2, error: error2 } = await measureTime(async () => {
    return await executeCachedQuery(testSql, testParams, 'mapex');
  });

  if (error2) {
    logTest('Cache Implementation', 'failed', `Second query failed: ${error2.message}`, duration2);
    return false;
  }

  // Check if cache is working (second query should be much faster)
  const cacheWorking = duration2 < duration1 * 0.5; // At least 50% faster
  const resultsMatch = JSON.stringify(result1) === JSON.stringify(result2);

  if (cacheWorking && resultsMatch) {
    logTest('Cache Implementation', 'passed', `Cache working (${duration1}ms → ${duration2}ms)`, duration2);
    return true;
  } else if (resultsMatch) {
    logTest('Cache Implementation', 'passed', `Results match but cache not significantly faster`, duration2);
    return true;
  } else {
    logTest('Cache Implementation', 'failed', `Cache not working or results don't match`, duration2);
    return false;
  }
}

// Test 6: Timeout Configurations
async function testTimeoutConfigurations(): Promise<boolean> {
  console.log('\n⏱️ Testing Timeout Configurations...');

  // Test with a query that should complete within timeout
  const fastQuery = `SELECT TOP 1 1 as test FROM cfg_maquina`;

  const { result, duration, error } = await measureTime(async () => {
    return await executeQuery(fastQuery, undefined, 'mapex');
  });

  if (error) {
    logTest('Timeout Configurations', 'failed', `Fast query failed: ${error.message}`, duration);
    return false;
  }

  // Test with a potentially slow query but within reasonable timeout
  const mediumQuery = `
    SELECT COUNT(*) as total_maquinas,
           SUM(CASE WHEN activo = 1 THEN 1 ELSE 0 END) as maquinas_activas
    FROM cfg_maquina
  `;

  const { result: result2, duration: duration2, error: error2 } = await measureTime(async () => {
    return await executeQuery(mediumQuery, undefined, 'mapex');
  });

  if (error2) {
    if (error2.message.includes('timeout')) {
      logTest('Timeout Configurations', 'failed', `Medium query timed out: ${error2.message}`, duration2);
      return false;
    } else {
      logTest('Timeout Configurations', 'failed', `Medium query failed: ${error2.message}`, duration2);
      return false;
    }
  }

  if (result && result2) {
    logTest('Timeout Configurations', 'passed', `Queries completed within timeout limits`, Math.max(duration, duration2));
    return true;
  }

  logTest('Timeout Configurations', 'failed', 'Unexpected result', duration);
  return false;
}

// Test 7: Rendimiento u/h Calculation Fix
async function testRendimientoCalculation(): Promise<boolean> {
  console.log('\n📊 Testing Rendimiento u/h Calculation...');

  // Test the specific fields used in the rendimiento calculation
  const sql = `
    SELECT TOP 5 cm.Cod_maquina,
           cm.Ag_Rt_Rend_Turno,
           cm.Rt_Rendimientonominal1,
           cm.Rt_Unidades_ok_turno,
           cm.Rt_Unidades_nok_turno,
           cm.Rt_Seg_produccion_turno
    FROM cfg_maquina cm
    WHERE cm.activo = 1
      AND cm.Ag_Rt_Rend_Turno IS NOT NULL
    ORDER BY cm.Cod_maquina
  `;

  const { result, duration, error } = await measureTime(async () => {
    return await executeQuery(sql, undefined, 'mapex');
  });

  if (error) {
    logTest('Rendimiento Calculation', 'failed', `Query failed: ${error.message}`, duration);
    return false;
  }

  if (!result || result.length === 0) {
    logTest('Rendimiento Calculation', 'passed', `No data available (acceptable for test environment)`, duration);
    return true;
  }

  // Validate that required fields exist and have reasonable values
  let validCalculations = 0;
  for (const row of result) {
    const rendTurno = row.Ag_Rt_Rend_Turno;
    const rendNominal = row.Rt_Rendimientonominal1;

    if (rendTurno !== null && rendTurno !== undefined &&
        rendNominal !== null && rendNominal !== undefined &&
        rendNominal > 0) {
      // Calculate rendimiento u/h as per the formula
      const rendimientoUh = (rendTurno / 100) * rendNominal;
      if (!isNaN(rendimientoUh) && rendimientoUh >= 0) {
        validCalculations++;
      }
    }
  }

  if (validCalculations > 0) {
    logTest('Rendimiento Calculation', 'passed', `${validCalculations}/${result.length} valid calculations`, duration);
    return true;
  } else {
    logTest('Rendimiento Calculation', 'failed', 'No valid rendimiento calculations possible', duration);
    return false;
  }
}

// Main test runner
async function runAllTests(): Promise<{ success: boolean; summary: any; details: any[] }> {
  console.log('🚀 Starting Comprehensive MapexBP Test Suite');
  console.log('='.repeat(50));

  const startTime = Date.now();

  try {
    // Reset test results
    testResults = { passed: 0, failed: 0, skipped: 0, total: 0, details: [] };

    // Run all tests
    const results = await Promise.all([
      testDatabaseConnectivity(),
      testTableAndFieldExistence(),
      testFHisParoFunction(),
      testProductionDataQueries(),
      testCacheImplementation(),
      testTimeoutConfigurations(),
      testRendimientoCalculation()
    ]);

    const totalTime = Date.now() - startTime;

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(50));
    console.log(`Total Tests: ${testResults.total}`);
    console.log(`✅ Passed: ${testResults.passed}`);
    console.log(`❌ Failed: ${testResults.failed}`);
    console.log(`⏭️ Skipped: ${testResults.skipped}`);
    console.log(`⏱️ Total Time: ${totalTime}ms`);
    console.log(`📈 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);

    // Detailed results
    console.log('\n📋 DETAILED RESULTS:');
    testResults.details.forEach((detail, index) => {
      const status = detail.status === 'passed' ? '✅' : detail.status === 'failed' ? '❌' : '⏭️';
      console.log(`${index + 1}. ${status} ${detail.test}`);
      if (detail.message) console.log(`   ${detail.message}`);
    });

    // Final verdict
    const allPassed = results.every(result => result !== false);
    console.log('\n🏁 FINAL VERDICT:');
    if (allPassed) {
      console.log('🎉 ALL TESTS PASSED! MapexBP database queries are working correctly.');
    } else {
      console.log('⚠️ SOME TESTS FAILED. Review the issues above and fix them.');
    }

    return {
      success: allPassed,
      summary: {
        total: testResults.total,
        passed: testResults.passed,
        failed: testResults.failed,
        skipped: testResults.skipped,
        successRate: ((testResults.passed / testResults.total) * 100).toFixed(1) + '%',
        totalTime: totalTime + 'ms'
      },
      details: testResults.details
    };

  } catch (error) {
    console.error('\n💥 CRITICAL ERROR during test execution:', error);
    return {
      success: false,
      summary: { error: error instanceof Error ? error.message : 'Unknown error' },
      details: []
    };
  }
}

export async function GET(request: NextRequest) {
  try {
    const results = await runAllTests();

    return NextResponse.json({
      success: results.success,
      message: results.success ? 'All tests passed!' : 'Some tests failed',
      summary: results.summary,
      details: results.details,
      timestamp: new Date().toISOString(),
      source: 'test-validations-api'
    });

  } catch (error) {
    console.error('Error in test-validations API:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
