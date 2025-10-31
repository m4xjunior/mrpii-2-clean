import { executeQuery } from 'lib/database/connection';

// Función utilitaria para obtener costo de un producto
export async function getProductCost(cod_producto: string): Promise<number> {
  try {
    // Consulta simple para obtener costo configurado
    const sql = `
      SELECT TOP 1
        cp.cod_producto,
        0 as costo_default -- Por defecto
      FROM cfg_producto cp
      WHERE cp.cod_producto = @cod_producto
        AND cp.activo = 1
    `;

    const result = await executeQuery(sql, { cod_producto });

    if (!result || result.length === 0) {
      console.warn(`⚠️ Producto ${cod_producto} no encontrado, usando costo por defecto €0`);
      return 0;
    }

    // Por ahora, retornar costo por defecto
    // TODO: Implementar tabla de configuración real
    return 0;

  } catch (error) {
    console.error(`❌ Error obteniendo costo para ${cod_producto}:`, error);
    console.warn('⚠️ Usando costo por defecto debido a error de conexión');
    return 0; // Fallback a valor por defecto
  }
}

// Función para obtener todos los costos de productos para cálculos mensuales
export async function getAllProductCosts(): Promise<{ [key: string]: number }> {
  try {
    console.log('💰 Obteniendo todos los costos de productos');

    // Consulta para obtener todos los productos activos
    const sql = `
      SELECT DISTINCT
        cp.cod_producto,
        0 as costo_default -- Por defecto
      FROM cfg_producto cp
      WHERE cp.activo = 1
        AND cp.cod_producto IS NOT NULL
        AND cp.cod_producto != ''
        AND cp.cod_producto != '--'
        AND cp.cod_producto != '{0}'
    `;

    const products = await executeQuery(sql);
    const costMap: { [key: string]: number } = {};

    if (products && products.length > 0) {
      products.forEach((product: any) => {
        costMap[product.cod_producto] = product.costo_default;
      });
    }

    console.log(`💰 Costos obtenidos para ${Object.keys(costMap).length} productos`);
    return costMap;

  } catch (error) {
    console.error('❌ Error obteniendo todos los costos:', error);
    return {}; // Retornar mapa vacío como fallback
  }
}
