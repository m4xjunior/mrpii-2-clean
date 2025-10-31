import { NextRequest, NextResponse } from 'next/server';
import { roundToDecimal } from 'lib/shared';
import { calcCalidad, calcOEE } from 'lib/oee/calculations';
import { getMachineStatusByCode } from 'lib/data-processor';

const toFiniteOrNull = (value: unknown): number | null => {
  if (value === null || value === undefined) {
    return null;
  }
  const numeric = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : null;
};

const pickMetric = (...values: Array<number | null | undefined>): number | null => {
  for (const value of values) {
    const numeric = toFiniteOrNull(value);
    if (numeric !== null) {
      return numeric;
    }
  }
  return null;
};

const toRounded = (value: number | null | undefined, decimals = 1): number | null => {
  const numeric = toFiniteOrNull(value);
  return numeric === null ? null : roundToDecimal(numeric, decimals);
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const machineId = searchParams.get('machineId');

    if (!machineId) {
      return NextResponse.json(
        { success: false, error: 'machineId é obrigatório' },
        { status: 400 },
      );
    }

    const status = await getMachineStatusByCode(machineId);
    if (!status) {
      return NextResponse.json({
        success: true,
        data: {
          machineId,
          turno: {
            kpis: {},
            production: { ok: null, nok: null, rwk: null, total: null },
            velocity: {},
            times: {},
          },
          updatedAt: new Date().toISOString(),
        },
      });
    }

    const turnoProduction = status.turnoProduction ?? null;

    const productionOk = pickMetric(
      turnoProduction?.ok,
      status.production?.ok
    );
    const productionNok = pickMetric(
      turnoProduction?.nok,
      status.production?.nok
    );
    const productionRw = pickMetric(
      turnoProduction?.rw,
      status.production?.rw
    );

    const computedTotal =
      productionOk !== null && productionNok !== null && productionRw !== null
        ? productionOk + productionNok + productionRw
        : null;
    const productionTotal = computedTotal ?? toFiniteOrNull(status.production?.total) ?? toFiniteOrNull(status.machine?.Rt_Unidades_turno);

    const disponibilidad = pickMetric(
      status.disponibilidad,
      status.oeeBreakdown?.disponibilidad,
      status.disponibilidad_of,
      status.machine.disponibilidad,
      status.machine.Ag_Rt_Disp_Turno
    );
    const rendimientoPct = pickMetric(
      status.rendimiento,
      status.oeeBreakdown?.rendimiento,
      status.rendimiento_of,
      status.machine.rendimiento,
      status.machine.Ag_Rt_Rend_Turno
    );

    const calidadFromStatus = pickMetric(
      status.calidad,
      status.oeeBreakdown?.calidad,
      status.calidad_of,
      status.machine.calidad,
      status.machine.Ag_Rt_Cal_Turno
    );
    const calidadCalculated = calcCalidad(productionOk, productionNok) ?? undefined;
    const calidadPct = pickMetric(calidadFromStatus, calidadCalculated ?? null);

    const oee = pickMetric(
      status.oee_turno,
      status.oee,
      status.machine.Ag_Rt_Oee_Turno,
      calcOEE(disponibilidad, rendimientoPct, calidadPct) ?? null
    );

    const nominalVelocity = pickMetric(
      status.velocity?.nominal,
      status.machine.Rt_Rendimientonominal1
    );
    const realVelocity = pickMetric(
      status.velocity?.current,
      status.rt_velocidad,
      status.nominalCycleSeconds ? 3600 / status.nominalCycleSeconds : null
    );
    const secondsPerPiece = pickMetric(
      status.rt_tiempo_pieza,
      realVelocity && realVelocity > 0 ? 3600 / realVelocity : null
    );

    const turnoKpis = {
      oee: toRounded(oee),
      disponibilidad: toRounded(disponibilidad),
      rendimiento_pct: toRounded(rendimientoPct),
      rendimiento_uh: toRounded(realVelocity),
      calidad: toRounded(calidadPct),
      seconds_per_piece: toRounded(secondsPerPiece, secondsPerPiece && secondsPerPiece >= 10 ? 1 : 2),
    };

    const data = {
      machineId,
      turno: {
        kpis: turnoKpis,
        production: {
          ok: productionOk,
          nok: productionNok,
          rwk: productionRw,
          total: productionTotal,
        },
        velocity: {
          nominal_uh: toRounded(nominalVelocity),
          real_uh: toRounded(realVelocity),
          seconds_per_piece: turnoKpis.seconds_per_piece,
        },
        times: {
          productiveSeconds: null,
          downtimeSeconds: null,
          totalSeconds: null,
        },
      },
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Erro ao obter OEE' },
      { status: 500 },
    );
  }
}
