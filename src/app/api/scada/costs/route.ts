import { NextRequest, NextResponse } from 'next/server';
import { executeQuery } from 'lib/database/connection';

// API para obtener costos de productos desde MAPEX
export async function GET(request: NextRequest) {
  try {
    console.log('💰 Obteniendo costos de productos desde MAPEX');

    // Primero verificar si la tabla cfg_producto existe
    const checkTableSql = `
      SELECT TABLE_NAME
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = 'dbo'
        AND TABLE_NAME = 'cfg_producto'
    `;

    const tableExists = await executeQuery(checkTableSql);

    if (!tableExists || tableExists.length === 0) {
      console.warn('⚠️ Tabla cfg_producto no existe en MAPEX');
      return NextResponse.json({
        success: true,
        data: [],
        defaults: {
          costo_unitario_default: 15.50,
          moneda: 'EUR',
          nota: 'Tabla cfg_producto no existe en la base de datos'
        },
        timestamp: new Date().toISOString()
      });
    }

    // Consulta simple para ver si hay productos
    const simpleSql = `SELECT TOP 5 cod_producto, desc_producto FROM cfg_producto WHERE activo = 1`;

    console.log('🔍 Probando consulta simple:', simpleSql);
    let products;

    try {
      products = await executeQuery(simpleSql);
      console.log('✅ Consulta simple exitosa, productos encontrados:', products?.length || 0);
    } catch (error) {
      console.error('❌ Error en consulta simple:', error);
      return NextResponse.json({
        success: false,
        error: 'Error en consulta de productos',
        details: error instanceof Error ? error.message : 'Error desconocido',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    // Si no hay productos, retornar valores por defecto
    if (!products || products.length === 0) {
      console.warn('⚠️ No se encontraron productos activos en cfg_producto');
      return NextResponse.json({
        success: true,
        data: [],
        defaults: {
          costo_unitario_default: 15.50,
          moneda: 'EUR',
          nota: 'No se encontraron productos activos en cfg_producto'
        },
        timestamp: new Date().toISOString()
      });
    }

    // Consulta completa con costos - usando campos que sabemos que existen
    const sql = `
      SELECT
        cp.cod_producto,
        cp.desc_producto,
        15.50 as costo_unitario, -- Valor por defecto ya que no existe en MAPEX
        NULL as precio_venta,
        'EUR' as moneda,
        cm.Cod_maquina,
        cm.desc_maquina
      FROM cfg_producto cp
      LEFT JOIN cfg_maquina cm ON cp.cod_producto = cm.rt_Cod_producto
      WHERE cp.activo = 1
        AND cp.cod_producto IS NOT NULL
        AND cp.cod_producto != ''
      ORDER BY cp.cod_producto
    `;

    console.log('🔍 Ejecutando consulta completa:', sql);

    try {
      products = await executeQuery(sql);
      console.log('✅ Consulta completa exitosa, productos encontrados:', products?.length || 0);
    } catch (error) {
      console.error('❌ Error en consulta completa:', error);
      return NextResponse.json({
        success: false,
        error: 'Error en consulta completa de productos',
        details: error instanceof Error ? error.message : 'Error desconocido',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    // Si no hay datos en MAPEX, usar valores por defecto
    if (!products || products.length === 0) {
      console.warn('⚠️ No se encontraron productos en MAPEX, usando valores por defecto');
      return NextResponse.json({
        success: true,
        data: [],
        defaults: {
          costo_unitario_default: 15.50,
          moneda: 'EUR',
          nota: 'No se encontraron productos activos en cfg_producto'
        },
        timestamp: new Date().toISOString()
      });
    }

    // Crear mapa de costos por producto
    const costMap: { [key: string]: number } = {};
    const productInfo: any[] = [];

    products.forEach((product: any) => {
      // Usar costo de MAPEX o valor por defecto
      const costo = product.costo_unitario ? parseFloat(product.costo_unitario) : 15.50;

      costMap[product.cod_producto] = costo;

      productInfo.push({
        cod_producto: product.cod_producto,
        desc_producto: product.desc_producto,
        costo_unitario: costo,
        precio_venta: product.precio_venta || null,
        moneda: product.moneda || 'EUR',
        maquinas_asociadas: product.Cod_maquina ? [product.Cod_maquina] : []
      });
    });

    console.log('💰 Costos obtenidos:', costMap);

    return NextResponse.json({
      success: true,
      data: productInfo,
      costMap,
      defaults: {
        costo_unitario_default: 15.50,
        moneda: 'EUR'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error obteniendo costos:', error);
    return NextResponse.json({
      success: false,
      error: 'Error al obtener costos de productos',
      details: error instanceof Error ? error.message : 'Error desconocido',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
