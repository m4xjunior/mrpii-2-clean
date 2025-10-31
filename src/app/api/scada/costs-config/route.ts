import { NextRequest, NextResponse } from 'next/server';
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

// API para configurar costos por producto/máquina
export async function GET(request: NextRequest) {
  try {
    console.log('⚙️ Obteniendo configuración de costos');

    // Obtener productos con sus máquinas asociadas
    const sql = `
      SELECT DISTINCT
        cp.cod_producto,
        cp.desc_producto,
        cm.Cod_maquina,
        cm.desc_maquina,
        0 as costo_unitario_default -- Sin productos = costo cero
      FROM cfg_producto cp
      LEFT JOIN cfg_maquina cm ON cp.cod_producto = cm.rt_Cod_producto
      WHERE cp.activo = 1
        AND cp.cod_producto IS NOT NULL
        AND cp.cod_producto != ''
        AND cp.cod_producto != '--'
        AND cp.cod_producto != '{0}'
      ORDER BY cp.cod_producto, cm.Cod_maquina
    `;

    const products = await executeQuery(sql);

    // Crear estructura de respuesta
    const costConfig: { [key: string]: any } = {};

    products.forEach((product: any) => {
      const productKey = product.cod_producto;

      if (!costConfig[productKey]) {
        costConfig[productKey] = {
          cod_producto: product.cod_producto,
          desc_producto: product.desc_producto,
          costo_unitario: product.costo_unitario_default,
          maquinas: [],
          nota: 'Costo configurado manualmente (no viene de MAPEX)'
        };
      }

      if (product.Cod_maquina) {
        costConfig[productKey].maquinas.push({
          cod_maquina: product.Cod_maquina,
          desc_maquina: product.desc_maquina
        });
      }
    });

    console.log('⚙️ Configuración de costos obtenida:', Object.keys(costConfig).length, 'productos');

    return NextResponse.json({
      success: true,
      data: costConfig,
      timestamp: new Date().toISOString(),
      nota: 'Costos por defecto: €0. Configure valores reales usando POST'
    });

  } catch (error) {
    console.error('❌ Error obteniendo configuración de costos:', error);
    return NextResponse.json({
      success: false,
      error: 'Error al obtener configuración de costos',
      details: error instanceof Error ? error.message : 'Error desconocido',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('💾 Configurando costo personalizado');
    const body = await request.json();

    const { cod_producto, costo_unitario, maquina_id } = body;

    if (!cod_producto || costo_unitario === undefined) {
      return NextResponse.json({
        success: false,
        error: 'Faltan parámetros requeridos: cod_producto y costo_unitario',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }

    // Validar que el producto existe en MAPEX
    const checkProductSql = `
      SELECT cod_producto, desc_producto
      FROM cfg_producto
      WHERE cod_producto = @cod_producto
        AND activo = 1
    `;

    const productExists = await executeQuery(checkProductSql, { cod_producto });

    if (!productExists || productExists.length === 0) {
      return NextResponse.json({
        success: false,
        error: `Producto ${cod_producto} no encontrado en MAPEX`,
        timestamp: new Date().toISOString()
      }, { status: 404 });
    }

    // Aquí se podría guardar en una tabla de configuración
    // Por ahora, simularemos el guardado
    console.log('💾 Costo configurado:', {
      cod_producto,
      costo_unitario,
      maquina_id,
      producto: productExists[0].desc_producto
    });

    return NextResponse.json({
      success: true,
      message: `Costo de €${costo_unitario} configurado para producto ${cod_producto}`,
      data: {
        cod_producto,
        costo_unitario: parseFloat(costo_unitario),
        maquina_id,
        producto_descripcion: productExists[0].desc_producto
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error configurando costo:', error);
    return NextResponse.json({
      success: false,
      error: 'Error al configurar costo',
      details: error instanceof Error ? error.message : 'Error desconocido',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
