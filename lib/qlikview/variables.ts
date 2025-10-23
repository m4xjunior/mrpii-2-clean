/**
 * QlikView Variables - Configurações e cores do painel QlikView
 * Estas variáveis replicam as configurações do QlikView original
 */

// ========================================
// VARIÁVEIS DE CONFIGURAÇÃO E COR
// ========================================

export const vFechaInicioCarga = new Date('2014-07-01');

export const getVFechaMax = (cal: Array<{ Fecha: Date }>) => {
  return new Date(Math.max(...cal.map(c => c.Fecha.getTime())));
};

export const getVPeriodoInicio = (vFechaMax: Date) => {
  return new Date(vFechaMax.getTime() - 7 * 24 * 60 * 60 * 1000);
};

export const getVPeriodoFin = (vFechaMax: Date) => {
  return vFechaMax;
};

// Cores
export const vColorFondo = 'rgb(190,200,235)';
export const vColorTitulo = 'rgb(255,255,255)';
export const vColorTituloFondo = 'rgb(30,55,100)';
export const vColorFondoObjeto = 'rgb(30,55,100)';
export const vColorFondoObjeto2 = 'rgba(30,55,100, 0.29)';
export const vColorBorde = 'rgb(255,0,0)';
export const vColorEjes = 'rgb(255,255,255)';
export const vColorLeyenda = 'rgb(255,255,255)';
export const vColorBordeTexto = 'rgb(255,255,255)';

export const vInd = 40;

// ========================================
// TIPOS PARA INDICADORES
// ========================================

export interface Indicador {
  Id: number;
  Nombre: string;
  Descripcion: string;
  ValorObjetivo: number;
  ValorMinimo: number;
  ValorMaximo: number;
  ValorCriticoMinimo: number;
  ValorCriticoMaximo: number;
}

export interface IndicadorValues {
  Descripcion: string;
  ValorObjetivo: number;
  ValorMinimo: number;
  ValorMaximo: number;
  ValorCriticoMinimo: number;
  ValorCriticoMaximo: number;
}

// ========================================
// FUNCIÓN HELPER PARA CREAR INDICADOR VALUES
// ========================================

export const createIndicadorValues = (
  indicadores: Indicador[],
  id: number,
  divisor: number = 100
): IndicadorValues => {
  const ind = indicadores.find(i => i.Id === id);
  if (!ind) {
    return {
      Descripcion: ``,
      ValorObjetivo: 0,
      ValorMinimo: 0,
      ValorMaximo: 0,
      ValorCriticoMinimo: 0,
      ValorCriticoMaximo: 0,
    };
  }

  return {
    Descripcion: `${ind.Nombre}\n\n${ind.Descripcion}`,
    ValorObjetivo: ind.ValorObjetivo / divisor,
    ValorMinimo: ind.ValorMinimo / divisor,
    ValorMaximo: ind.ValorMaximo / divisor,
    ValorCriticoMinimo: ind.ValorCriticoMinimo / divisor,
    ValorCriticoMaximo: ind.ValorCriticoMaximo / divisor,
  };
};

// ========================================
// INDICADORES PRINCIPALES
// ========================================

export const createIndicadoresMap = (indicadores: Indicador[]) => {
  return {
    // OEE (ID: 23)
    vIndOEE: createIndicadorValues(indicadores, 23),

    // Disponibilidad (ID: 26)
    vIndDisponibilidad: createIndicadorValues(indicadores, 26),

    // Rendimiento (ID: 28)
    vIndRendimiento: createIndicadorValues(indicadores, 28),

    // Calidad (ID: 27)
    vIndCalidad: createIndicadorValues(indicadores, 27),

    // Scrap Bailment (ID: 48) - multiplicado por turnos
    vIndScrapBal: createIndicadorValues(indicadores, 48, 1), // No dividir

    // Scrap WS (ID: 49) - multiplicado por turnos
    vIndScrapWS: createIndicadorValues(indicadores, 49, 1), // No dividir

    // Scrap VS (ID: 50) - multiplicado por turnos
    vIndScrapVS: createIndicadorValues(indicadores, 50, 1), // No dividir

    // Averías (ID: 56) - dividido por turnos
    vIndAverias: createIndicadorValues(indicadores, 56),

    // Averías Vehículos (ID: 57) - dividido por turnos
    vIndAveriasVehiculos: createIndicadorValues(indicadores, 57),

    // Incidencias Externas (ID: 58) - dividido por turnos
    vIndIncExternas: createIndicadorValues(indicadores, 58),

    // Incidencias Internas (ID: 59) - dividido por turnos
    vIndIncInternas: createIndicadorValues(indicadores, 59),

    // Incidencias Proveedor (ID: 60) - dividido por turnos
    vIndIncProveedor: createIndicadorValues(indicadores, 60),

    // Incidencias SGA (ID: 61)
    vIndIncSGA: createIndicadorValues(indicadores, 61),

    // Cumplimiento (ID: 52)
    vIndCumplimiento: createIndicadorValues(indicadores, 52),

    // Planificación (ID: 53)
    vIndPlanificacion: createIndicadorValues(indicadores, 53),

    // DEE Secundario (ID: 24)
    vIndDEESec: createIndicadorValues(indicadores, 24),

    // Disponibilidad Secundaria (ID: 26)
    vIndDisponibilidadSec: createIndicadorValues(indicadores, 26),

    // Rendimiento Secundario (ID: 28)
    vIndRendimientoSec: createIndicadorValues(indicadores, 28),

    // Calidad Secundaria (ID: 27)
    vIndCalidadSec: createIndicadorValues(indicadores, 27),

    // Cumplimiento Plan Producción (ID: 53)
    vIndCumplimientoPlanProd: createIndicadorValues(indicadores, 53),

    // VTTR (ID: 78)
    vIndVTTR: createIndicadorValues(indicadores, 78),
  };
};

// ========================================
// HELPER: CONTAR TURNOS ÚNICOS
// ========================================

export const countDistinctTurnos = (
  datos: Array<{ IdFecha: string; IdTurno: string }>,
  turnos: string[] = ['M', 'T', 'N']
): number => {
  const uniqueTurnos = new Set(
    datos
      .filter(d => turnos.includes(d.IdTurno))
      .map(d => `${d.IdFecha}-${d.IdTurno}`)
  );
  return uniqueTurnos.size;
};

// ========================================
// VARIABLES DE ESTADO
// ========================================

export const vObjetivoOEE = 0.8;
export const vMostraMenu = 0;
export const vVariableMenu = 'MenuP01';
export const vMenuP01 = 1;
export const vMenuP02 = 1;
export const vMenuP03 = 1;
export const vMenuP04 = 1;
export const vMenuP05 = 1;
export const vNombreDeVariable = 'MenuP05';

export const vGrupoIncidencia = 2;
export const vIndicador = 26;
export const vDatosCeroPeriodo = 0;
export const mPreparaTablas = 1;

export const vAñoInicioCarga = 2025;
export const vFechaFinCargaDEE = '08/10/2025';
export const i = '13/10/2025';

// OEE Secundário
export const mDisponibilidadSecFecha = `Sum({<Cal.Fecha={'$(vFechaMax)'}>} Ag.TiempoProductivo)/sum({<Cal.Fecha={'$(vFechaMax)'}>} Ag.TiempoProductivo)`;
export const mDisponibilidadSecPeriodo = `1`;
export const mCalidadSecFecha = `Sum({<Cal.Fecha={'$(vFechaMax)'}>} Ag.TiempoProductivo)/sum({<Cal.Fecha={'$(vFechaMax)'}>} Ag.TiempoProductivo)`;
export const mCalidadSecPeriodo = `1`;
export const mOEEsec = `$(mDisponibilidadSecPeriodo)]]*$(mRendimientoSecPeriodo)]]*$(mCalidadSecPeriodo)`;
export const mDatosSecFecha = `Sum({<Cal.Fecha={'$(vFechaMax)'}>} Ag.TiempoProductivo)/sum({<Cal.Fecha={'$(vFechaMax)'}>} Ag.TiempoProductivo)`;
export const vFechaTurno = `if(only(Cal.Fecha)=Match(left(only(Ave.CodTurno),1),only(Ave.CodTurno)),only(Ave.CodTurno),only(Ave.CodTurno))`;

// Rutas
export const vRutaDePlanificacion = 'v1\\dkh\\Produccion\\2 - Control de la produccion\\3 - Seguimiento produccion\\Planificaciones diarias\\R';
export const vRutaDVDTransformados = '\\Auxiliares';
export const vRutaArchivo = 'v1\\dkh\\Produccion\\2 - Control de la produccion\\3 - Seguimiento produccion\\Planificaciones diarias\\R';

// Indicadores secundários
export const vIndDEESec = {
  Descripcion: (tinId: string) => `only({1<[Tin.Id]={\'${tinId}\'}>} Tin.Nombre) & Chr(13) & Chr(13) &only({1 <[Tin.Id]={\'${tinId}\'}>} Tin.Descripcion)`,
  ValorObjetivo: (tinId: string) => `only({1 <[Tin.Id]={\'${tinId}\'}>} Tin.ValorObjetivo)/100`,
  ValorMinimo: (tinId: string) => `only({1 <[Tin.Id]={\'${tinId}\'}>} Tin.ValorMinimo)/100`,
  ValorMaximo: (tinId: string) => `only({1 <[Tin.Id]={\'${tinId}\'}>} Tin.ValorMaximo)/100`,
  ValorCriticoMinimo: (tinId: string) => `only({1 <[Tin.Id]={\'${tinId}\'}>} Tin.ValorCriticoMinimo)/100`,
  ValorCriticoMaximo: (tinId: string) => `only({1 <[Tin.Id]={\'${tinId}\'}>} Tin.ValorCriticoMaximo)/100`,
};

export const vIndDisponibilidadSec = {
  Descripcion: (tinId: string) => `only({1<[Tin.Id]={\'${tinId}\'}>} Tin.Nombre) & Chr(13) & Chr(13) &only({1 <[Tin.Id]={\'${tinId}\'}>} Tin.Descripcion)`,
  ValorObjetivo: (tinId: string) => `only({1 <[Tin.Id]={\'${tinId}\'}>} Tin.ValorObjetivo)/100`,
  ValorMinimo: (tinId: string) => `only({1 <[Tin.Id]={\'${tinId}\'}>} Tin.ValorMinimo)/100`,
  ValorMaximo: (tinId: string) => `only({1 <[Tin.Id]={\'${tinId}\'}>} Tin.ValorMaximo)/100`,
  ValorCriticoMinimo: (tinId: string) => `only({1 <[Tin.Id]={\'${tinId}\'}>} Tin.ValorCriticoMinimo)/100`,
  ValorCriticoMaximo: (tinId: string) => `only({1 <[Tin.Id]={\'${tinId}\'}>} Tin.ValorCriticoMaximo)/100`,
};

export const vIndRendimientoSec = {
  Descripcion: (tinId: string) => `only({1<[Tin.Id]={\'${tinId}\'}>} Tin.Nombre) & Chr(13) & Chr(13) &only({1 <[Tin.Id]={\'${tinId}\'}>} Tin.Descripcion)`,
  ValorObjetivo: (tinId: string) => `only({1 <[Tin.Id]={\'${tinId}\'}>} Tin.ValorObjetivo)/100`,
  ValorMinimo: (tinId: string) => `only({1 <[Tin.Id]={\'${tinId}\'}>} Tin.ValorMinimo)/100`,
  ValorMaximo: (tinId: string) => `only({1 <[Tin.Id]={\'${tinId}\'}>} Tin.ValorMaximo)/100`,
  ValorCriticoMinimo: (tinId: string) => `only({1 <[Tin.Id]={\'${tinId}\'}>} Tin.ValorCriticoMinimo)/100`,
  ValorCriticoMaximo: (tinId: string) => `only({1 <[Tin.Id]={\'${tinId}\'}>} Tin.ValorCriticoMaximo)/100`,
};

export const vIndCalidadSec = {
  Descripcion: (tinId: string) => `only({1<[Tin.Id]={\'${tinId}\'}>} Tin.Nombre) & Chr(13) & Chr(13) &only({1 <[Tin.Id]={\'${tinId}\'}>} Tin.Descripcion)`,
  ValorObjetivo: (tinId: string) => `only({1 <[Tin.Id]={\'${tinId}\'}>} Tin.ValorObjetivo)/100`,
  ValorMinimo: (tinId: string) => `only({1 <[Tin.Id]={\'${tinId}\'}>} Tin.ValorMinimo)/100`,
  ValorMaximo: (tinId: string) => `only({1 <[Tin.Id]={\'${tinId}\'}>} Tin.ValorMaximo)/100`,
  ValorCriticoMinimo: (tinId: string) => `only({1 <[Tin.Id]={\'${tinId}\'}>} Tin.ValorCriticoMinimo)/100`,
  ValorCriticoMaximo: (tinId: string) => `only({1 <[Tin.Id]={\'${tinId}\'}>} Tin.ValorCriticoMaximo)/100`,
};

// Fabricado
export const mFabricadoFecha = `count({<Cal.Fecha={'$(vFechaMax)'}>} Sec.E.ComienzoFinal='*' and Sec.Estacion={'PICKING'}>} Sec.E.ComienzoFinal)`;
export const mRackFinTurnoFecha = `count({<Cal.Fecha={'$(vFechaMax)'}>} RIt.Produccion='2')}`;
export const mRackFinTurnoPeriodo = `count({<Cal.Fecha={'>=$(vPeriodoInicio)<$(vPeriodoFin)'}>} RIt.Produccion='2')}`;

// Unidades de scrap
export const mScrapFabricacionUnidadesFecha = `Sum({<Cal.Fecha={'$(vFechaMax)'}>} SCF.Unidades)`;
export const mScrapBailmentUnidadesFecha = `Sum({<Cal.Fecha={'$(vFechaMax)'}>} SCB.Cantidad)`;
export const mScrapWSNumPeriodo = `Count({<Cal.Fecha={'>=$(vPeriodoInicio)<$(vPeriodoFin)'}>} SCB.IdArticulo)`;

// ========================================
// CÓDIGOS DE INDICADORES
// ========================================

export const INDICADOR_CODES = {
  OEE: 23,
  DISPONIBILIDAD: 26,
  RENDIMIENTO: 28,
  CALIDAD: 27,
  SCRAP_BAILMENT: 48,
  SCRAP_WS: 49,
  SCRAP_VS: 50,
  AVERIAS: 56,
  AVERIAS_VEHICULOS: 57,
  INC_EXTERNAS: 58,
  INC_INTERNAS: 59,
  INC_PROVEEDOR: 60,
  INC_SGA: 61,
  CUMPLIMIENTO: 52,
  PLANIFICACION: 53,
  VTTR: 78,
  DEE_SEC: 24,
  SCRAP_FAB: 40,
} as const;
