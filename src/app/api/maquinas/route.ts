import { NextResponse } from "next/server";
import { executeQuery } from "lib/database/connection";

const GET_MAQUINAS_QUERY = `
    SELECT
        cm.Id_maquina,
        cm.Cod_maquina,
        cm.Desc_maquina,
        cm.activo,
        COALESCE(cm.rt_id_actividad, 0) as rt_id_actividad,
        COALESCE(cm.rt_id_paro, 0) as rt_id_paro,
        COALESCE(cm.rt_desc_paro, '') as rt_desc_paro,
        COALESCE(cm.rt_desc_actividad, '') as rt_desc_actividad,
        COALESCE(cm.Rt_Cod_of, '') as Rt_Cod_of,
        COALESCE(cm.rt_Cod_producto, '') as rt_Cod_producto,
        COALESCE(cm.Rt_Desc_producto, '') as Rt_Desc_producto,
        COALESCE(cm.Rt_Unidades_ok, 0) as Rt_Unidades_ok,
        COALESCE(cm.Rt_Unidades_nok, 0) as Rt_Unidades_nok,
        COALESCE(cm.Rt_Unidades_repro, 0) as Rt_Unidades_repro,
        COALESCE(cm.Rt_Unidades_planning, 0) as Rt_Unidades_planning,
        COALESCE(cm.f_velocidad, 0) as f_velocidad,
        COALESCE(cm.Rt_Seg_produccion, 0) as Rt_Seg_produccion,
        COALESCE(cm.Rt_Seg_preparacion, 0) as Rt_Seg_preparacion,
        COALESCE(cm.Rt_Seg_paro, 0) as Rt_Seg_paro,
        COALESCE(cm.Rt_Rendimientonominal1, 0) as Rt_Rendimientonominal1,
        COALESCE(cm.rt_dia_productivo, 0) as rt_dia_productivo,
        COALESCE(cm.rt_desc_turno, '') as rt_desc_turno,
        COALESCE(cm.rt_id_turno, 0) as rt_id_turno,
        COALESCE(cm.rt_num_operario, 0) as rt_num_operario,
        COALESCE(cm.rt_id_operario, 0) as rt_id_operario,
        COALESCE(cm.Rt_Desc_operario, '') as Rt_Desc_operario
    FROM
        cfg_maquina cm
    WHERE
        cm.activo = 1
    ORDER BY
        cm.Cod_maquina;
`;

type MaquinaData = {
  Id_maquina: number;
  Cod_maquina: string;
  Desc_maquina: string;
  activo: number;
  rt_id_actividad: number;
  rt_id_paro: number;
  rt_desc_paro: string;
  rt_desc_actividad: string;
  Rt_Cod_of: string;
  rt_Cod_producto: string;
  Rt_Desc_producto: string;
  Rt_Unidades_ok: number;
  Rt_Unidades_nok: number;
  Rt_Unidades_repro: number;
  Rt_Unidades_planning: number;
  f_velocidad: number;
  Rt_Seg_produccion: number;
  Rt_Seg_preparacion: number;
  Rt_Seg_paro: number;
  Rt_Rendimientonominal1: number;
  rt_dia_productivo: number;
  rt_desc_turno: string;
  rt_id_turno: number;
  rt_num_operario: number;
  rt_id_operario: number;
  Rt_Desc_operario: string;
};

type MaquinaResponse = {
  Id_maquina: number;
  Cod_maquina: string;
  Desc_maquina: string;
  Estado: "produciendo" | "activa" | "parada";
  EstadoDetalle: string;
  OF_Actual: string;
  Producto: string;
  Operarios: string;
  Velocidad: number;
  UnidadesOK: number;
  UnidadesNOK: number;
  UnidadesRework: number;
  UnidadesPlanificadas: number;
};

function determinarEstado(maquina: MaquinaData): {
  estado: "produciendo" | "activa" | "parada";
  detalle: string;
} {
  // Si hay paro activo
  if (maquina.rt_id_paro > 0) {
    if (maquina.rt_desc_paro === "PAUSA") {
      return { estado: "parada", detalle: "En pausa" };
    } else if (maquina.rt_desc_paro === "SIN OPERARIO") {
      return { estado: "parada", detalle: "Sin operario" };
    } else {
      return { estado: "parada", detalle: maquina.rt_desc_paro || "Parada" };
    }
  }

  // Si está produciendo (actividad 2)
  if (maquina.rt_id_actividad === 2) {
    return { estado: "produciendo", detalle: "Produciendo" };
  }

  // Si está en preparación, ajustes, etc. (actividades activas)
  if (
    maquina.rt_id_actividad > 0 &&
    [3, 5, 11, 20, 21].includes(maquina.rt_id_actividad)
  ) {
    return { estado: "activa", detalle: maquina.rt_desc_actividad || "Activa" };
  }

  // Si no hay actividad ni paro, pero está activa
  if (maquina.activo === 1) {
    return { estado: "activa", detalle: "Disponible" };
  }

  // Por defecto, parada
  return { estado: "parada", detalle: "Inactiva" };
}

function procesarOperarios(descOperarios: string): string {
  if (!descOperarios || descOperarios.trim() === "") {
    return "";
  }

  // Limpiar y formatear lista de operarios
  const operarios = descOperarios
    .split("+")
    .map((op) => op.trim())
    .filter((op) => op !== "")
    .join(" + ");

  return operarios;
}

export async function GET() {
  try {
    console.log("🔍 Obteniendo lista de máquinas...");

    const result = await executeQuery<MaquinaData>(GET_MAQUINAS_QUERY);

    const maquinasProcesadas: MaquinaResponse[] = result.map((maquina) => {
      const estado = determinarEstado(maquina);
      const operarios = procesarOperarios(maquina.Rt_Desc_operario);

      return {
        Id_maquina: maquina.Id_maquina,
        Cod_maquina: maquina.Cod_maquina,
        Desc_maquina: maquina.Desc_maquina,
        Estado: estado.estado,
        EstadoDetalle: estado.detalle,
        OF_Actual: maquina.Rt_Cod_of,
        Producto: maquina.Rt_Desc_producto,
        Operarios: operarios,
        Velocidad: maquina.f_velocidad,
        UnidadesOK: maquina.Rt_Unidades_ok,
        UnidadesNOK: maquina.Rt_Unidades_nok,
        UnidadesRework: maquina.Rt_Unidades_repro,
        UnidadesPlanificadas: maquina.Rt_Unidades_planning,
      };
    });

    console.log(`✅ ${maquinasProcesadas.length} máquinas procesadas com sucesso`);

    return NextResponse.json(maquinasProcesadas);
  } catch (error) {
    console.error("❌ Error al obtener la lista de máquinas:", error);

    // Tentar novamente com retry em caso de erro transitório
    if (isRetryableError(error)) {
      console.log("🔄 Tentando novamente obtener máquinas...");
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const retryResult = await executeQuery<MaquinaData>(GET_MAQUINAS_QUERY);

        const maquinasProcesadas: MaquinaResponse[] = retryResult.map((maquina) => {
          const estado = determinarEstado(maquina);
          const operarios = procesarOperarios(maquina.Rt_Desc_operario);

          return {
            Id_maquina: maquina.Id_maquina,
            Cod_maquina: maquina.Cod_maquina,
            Desc_maquina: maquina.Desc_maquina,
            Estado: estado.estado,
            EstadoDetalle: estado.detalle,
            OF_Actual: maquina.Rt_Cod_of,
            Producto: maquina.Rt_Desc_producto,
            Operarios: operarios,
            Velocidad: maquina.f_velocidad,
            UnidadesOK: maquina.Rt_Unidades_ok,
            UnidadesNOK: maquina.Rt_Unidades_nok,
            UnidadesRework: maquina.Rt_Unidades_repro,
            UnidadesPlanificadas: maquina.Rt_Unidades_planning,
          };
        });

        console.log(`✅ Retry exitoso: ${maquinasProcesadas.length} máquinas procesadas`);
        return NextResponse.json(maquinasProcesadas);
      } catch (retryError) {
        console.error("❌ Error en retry:", retryError);
      }
    }

    const errorMessage =
      error instanceof Error
        ? error.message
        : "Error desconocido en el servidor";

    return NextResponse.json(
      {
        error: "Error al obtener la lista de máquinas.",
        details: errorMessage,
      },
      { status: 500 },
    );
  }
}

// Função auxiliar para identificar erros que podem ser resolvidos com retry
function isRetryableError(error: any): boolean {
  const retryableCodes = ['ETIMEOUT', 'ECONNRESET', 'ENOTFOUND', 'EAI_AGAIN', '08001', '08003', '08004'];
  return retryableCodes.includes(error.code) || error.message?.includes('timeout') || error.message?.includes('connection');
}
