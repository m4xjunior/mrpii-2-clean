import { NextRequest, NextResponse } from 'next/server';

interface ShiftData {
  turno: string;
  fecha: string;
  tiempo_total_s: number;
  tiempo_prod_s: number;
  tiempo_paro_s: number;
  piezas: { ok: number; nok: number; rwk: number };
  velocidad: { seg_por_pza: number; u_por_hora: number };
  oee: number;
  rendimiento: number;
  operadores: OperatorData[];
}

interface OperatorData {
  nombre: string;
  tiempo_total_s: number;
  tiempo_prod_s: number;
  tiempo_paro_s: number;
  eficiencia: number;
  piezas: { ok: number; nok: number; rwk: number };
  velocidad: { seg_por_pza: number; u_por_hora: number };
}

export async function POST(request: NextRequest) {
  try {
    const { of, fecha_desde, fecha_hasta, format, data } = await request.json();

    if (!of || !data || !Array.isArray(data)) {
      return NextResponse.json({
        success: false,
        error: 'Parâmetros obrigatórios: of, data'
      }, { status: 400 });
    }

    const shiftsData = data as ShiftData[];

    // Gerar conteúdo baseado no formato
    let content: string;
    let mimeType: string;
    let filename: string;

    switch (format) {
      case 'csv':
        content = generateCSV(shiftsData, of);
        mimeType = 'text/csv';
        filename = `informe_${of}_${fecha_desde}_${fecha_hasta}.csv`;
        break;

      case 'excel':
        // Para Excel, vamos gerar um CSV com separadores que o Excel pode abrir
        content = generateExcelCSV(shiftsData, of);
        mimeType = 'application/vnd.ms-excel';
        filename = `informe_${of}_${fecha_desde}_${fecha_hasta}.csv`;
        break;

      case 'pdf':
        // Para PDF, vamos gerar um HTML que pode ser impresso
        content = generatePDFHTML(shiftsData, of, fecha_desde, fecha_hasta);
        mimeType = 'text/html';
        filename = `informe_${of}_${fecha_desde}_${fecha_hasta}.html`;
        break;

      default:
        return NextResponse.json({
          success: false,
          error: 'Formato não suportado. Use: excel, csv ou pdf'
        }, { status: 400 });
    }

    // Retornar arquivo
    return new Response(content, {
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache'
      }
    });

  } catch (error) {
    console.error('❌ Erro ao exportar dados:', error);
    return NextResponse.json({
      success: false,
      error: 'Erro ao gerar arquivo de exportação',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}

function formatSecondsToHHMM(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

function generateCSV(shiftsData: ShiftData[], of: string): string {
  const headers = [
    'OF',
    'Fecha',
    'Turno',
    'Tiempo Total (hh:mm)',
    'Tiempo Productivo (hh:mm)',
    'Tiempo Paros (hh:mm)',
    'Velocidad (u/h)',
    'Velocidad (seg/pza)',
    'OEE (%)',
    'Rendimiento (%)',
    'Piezas OK',
    'Piezas NOK',
    'Piezas RW',
    'Operador',
    'Tiempo Total Op. (hh:mm)',
    'Tiempo Prod. Op. (hh:mm)',
    'Tiempo Paros Op. (hh:mm)',
    'Velocidad Op. (u/h)',
    'Velocidad Op. (seg/pza)',
    'Eficiencia Op. (%)',
    'Piezas OK Op.',
    'Piezas NOK Op.',
    'Piezas RW Op.'
  ];

  const rows: string[] = [headers.join(',')];

  shiftsData.forEach(shift => {
    const tiempoTotalHHMM = formatSecondsToHHMM(shift.tiempo_total_s);
    const tiempoProdHHMM = formatSecondsToHHMM(shift.tiempo_prod_s);
    const tiempoParoHHMM = formatSecondsToHHMM(shift.tiempo_paro_s);

    if (shift.operadores && shift.operadores.length > 0) {
      shift.operadores.forEach(operator => {
        const tiempoTotalOpHHMM = formatSecondsToHHMM(operator.tiempo_total_s);
        const tiempoProdOpHHMM = formatSecondsToHHMM(operator.tiempo_prod_s);
        const tiempoParoOpHHMM = formatSecondsToHHMM(operator.tiempo_paro_s);

        const row = [
          `"${of}"`,
          `"${shift.fecha}"`,
          `"${shift.turno}"`,
          `"${tiempoTotalHHMM}"`,
          `"${tiempoProdHHMM}"`,
          `"${tiempoParoHHMM}"`,
          shift.velocidad.u_por_hora.toFixed(2),
          shift.velocidad.seg_por_pza.toFixed(2),
          shift.oee.toFixed(1),
          shift.rendimiento.toFixed(1),
          shift.piezas.ok.toString(),
          shift.piezas.nok.toString(),
          shift.piezas.rwk.toString(),
          `"${operator.nombre}"`,
          `"${tiempoTotalOpHHMM}"`,
          `"${tiempoProdOpHHMM}"`,
          `"${tiempoParoOpHHMM}"`,
          operator.velocidad.u_por_hora.toFixed(2),
          operator.velocidad.seg_por_pza.toFixed(2),
          operator.eficiencia.toFixed(1),
          operator.piezas.ok.toString(),
          operator.piezas.nok.toString(),
          operator.piezas.rwk.toString()
        ];
        rows.push(row.join(','));
      });
    } else {
      // Linha para turno sem operadores
      const row = [
        `"${of}"`,
        `"${shift.fecha}"`,
        `"${shift.turno}"`,
        `"${tiempoTotalHHMM}"`,
        `"${tiempoProdHHMM}"`,
        `"${tiempoParoHHMM}"`,
        shift.velocidad.u_por_hora.toFixed(2),
        shift.velocidad.seg_por_pza.toFixed(2),
        shift.oee.toFixed(1),
        shift.rendimiento.toFixed(1),
        shift.piezas.ok.toString(),
        shift.piezas.nok.toString(),
        shift.piezas.rwk.toString(),
        '""',
        '""',
        '""',
        '""',
        '0.00',
        '0.00',
        '0.0',
        '0',
        '0',
        '0'
      ];
      rows.push(row.join(','));
    }
  });

  return rows.join('\n');
}

function generateExcelCSV(shiftsData: ShiftData[], of: string): string {
  // CSV otimizado para Excel com separadores e formatação espanhola
  const headers = [
    'OF;Fecha;Turno;Tiempo Total (hh:mm);Tiempo Productivo (hh:mm);Tiempo Paros (hh:mm);Velocidad (u/h);Velocidad (seg/pza);OEE (%);Rendimiento (%);Piezas OK;Piezas NOK;Piezas RW;Operador;Tiempo Total Op. (hh:mm);Tiempo Prod. Op. (hh:mm);Tiempo Paros Op. (hh:mm);Velocidad Op. (u/h);Velocidad Op. (seg/pza);Eficiencia Op. (%);Piezas OK Op.;Piezas NOK Op.;Piezas RW Op.'
  ];

  const rows: string[] = [headers[0]];

  shiftsData.forEach(shift => {
    const tiempoTotalHHMM = formatSecondsToHHMM(shift.tiempo_total_s);
    const tiempoProdHHMM = formatSecondsToHHMM(shift.tiempo_prod_s);
    const tiempoParoHHMM = formatSecondsToHHMM(shift.tiempo_paro_s);

    if (shift.operadores && shift.operadores.length > 0) {
      shift.operadores.forEach(operator => {
        const tiempoTotalOpHHMM = formatSecondsToHHMM(operator.tiempo_total_s);
        const tiempoProdOpHHMM = formatSecondsToHHMM(operator.tiempo_prod_s);
        const tiempoParoOpHHMM = formatSecondsToHHMM(operator.tiempo_paro_s);

        const row = [
          of,
          shift.fecha,
          shift.turno,
          tiempoTotalHHMM,
          tiempoProdHHMM,
          tiempoParoHHMM,
          shift.velocidad.u_por_hora.toFixed(2),
          shift.velocidad.seg_por_pza.toFixed(2),
          shift.oee.toFixed(1),
          shift.rendimiento.toFixed(1),
          shift.piezas.ok.toString(),
          shift.piezas.nok.toString(),
          shift.piezas.rwk.toString(),
          operator.nombre,
          tiempoTotalOpHHMM,
          tiempoProdOpHHMM,
          tiempoParoOpHHMM,
          operator.velocidad.u_por_hora.toFixed(2),
          operator.velocidad.seg_por_pza.toFixed(2),
          operator.eficiencia.toFixed(1),
          operator.piezas.ok.toString(),
          operator.piezas.nok.toString(),
          operator.piezas.rwk.toString()
        ];
        rows.push(row.join(';'));
      });
    } else {
      // Linha para turno sem operadores
      const row = [
        of,
        shift.fecha,
        shift.turno,
        tiempoTotalHHMM,
        tiempoProdHHMM,
        tiempoParoHHMM,
        shift.velocidad.u_por_hora.toFixed(2),
        shift.velocidad.seg_por_pza.toFixed(2),
        shift.oee.toFixed(1),
        shift.rendimiento.toFixed(1),
        shift.piezas.ok.toString(),
        shift.piezas.nok.toString(),
        shift.piezas.rwk.toString(),
        '',
        '',
        '',
        '',
        '0.00',
        '0.00',
        '0.0',
        '0',
        '0',
        '0'
      ];
      rows.push(row.join(';'));
    }
  });

  return rows.join('\n');
}

function generatePDFHTML(shiftsData: ShiftData[], of: string, fechaDesde: string, fechaHasta: string): string {
  const totalShifts = shiftsData.length;
  const totalOperators = shiftsData.reduce((sum, shift) => sum + shift.operadores.length, 0);
  const avgOEE = shiftsData.length > 0 ?
    shiftsData.reduce((sum, shift) => sum + shift.oee, 0) / shiftsData.length : 0;
  const avgRendimiento = shiftsData.length > 0 ?
    shiftsData.reduce((sum, shift) => sum + shift.rendimiento, 0) / shiftsData.length : 0;
  const totalPiecesOK = shiftsData.reduce((sum, shift) =>
    sum + shift.piezas.ok, 0);
  const totalPiecesNOK = shiftsData.reduce((sum, shift) =>
    sum + shift.piezas.nok, 0);
  const totalPiecesRWK = shiftsData.reduce((sum, shift) =>
    sum + shift.piezas.rwk, 0);
  const totalTiempoProd = shiftsData.reduce((sum, shift) => sum + shift.tiempo_prod_s, 0);
  const totalTiempoParo = shiftsData.reduce((sum, shift) => sum + shift.tiempo_paro_s, 0);

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Informe Consolidado - ${of}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
        }
        .summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 15px;
            margin-bottom: 30px;
        }
        .summary-card {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            border: 1px solid #dee2e6;
        }
        .summary-card h3 {
            margin: 0;
            color: #333;
            font-size: 22px;
            font-weight: bold;
        }
        .summary-card p {
            margin: 5px 0 0 0;
            color: #666;
            font-size: 13px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
            font-size: 12px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 6px 8px;
            text-align: left;
        }
        th {
            background-color: #f8f9fa;
            font-weight: bold;
            color: #495057;
        }
        .shift-section {
            margin-bottom: 40px;
        }
        .shift-title {
            background-color: #e9ecef;
            padding: 12px;
            font-weight: bold;
            font-size: 16px;
            border-left: 4px solid #007bff;
        }
        .shift-summary {
            background-color: #f8f9fa;
            padding: 10px;
            margin-bottom: 15px;
            border-radius: 6px;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 10px;
            font-size: 13px;
        }
        .shift-summary div {
            text-align: center;
        }
        .shift-summary .label {
            color: #666;
            font-size: 11px;
            margin-bottom: 2px;
        }
        .shift-summary .value {
            font-weight: bold;
            color: #333;
        }
        .page-break {
            page-break-before: always;
        }
        .oee-good { color: #28a745; }
        .oee-warning { color: #ffc107; }
        .oee-danger { color: #dc3545; }
        @media print {
            body { margin: 0; }
            .page-break { page-break-before: always; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Informe Consolidado de Producción</h1>
        <h2>OF: ${of}</h2>
        <p>Período: ${fechaDesde} a ${fechaHasta}</p>
        <p>Generado: ${new Date().toLocaleString('es-ES')}</p>
    </div>

    <div class="summary">
        <div class="summary-card">
            <h3>${totalShifts}</h3>
            <p>Turnos</p>
        </div>
        <div class="summary-card">
            <h3>${totalOperators}</h3>
            <p>Operadores</p>
        </div>
        <div class="summary-card">
            <h3>${avgOEE.toFixed(1)}%</h3>
            <p>OEE Médio</p>
        </div>
        <div class="summary-card">
            <h3>${avgRendimiento.toFixed(1)}%</h3>
            <p>Rendimiento Médio</p>
        </div>
        <div class="summary-card">
            <h3>${totalPiecesOK.toLocaleString('es-ES')}</h3>
            <p>Peças OK</p>
        </div>
        <div class="summary-card">
            <h3>${totalPiecesNOK.toLocaleString('es-ES')}</h3>
            <p>Peças NOK</p>
        </div>
        <div class="summary-card">
            <h3>${totalPiecesRWK.toLocaleString('es-ES')}</h3>
            <p>Peças RWK</p>
        </div>
        <div class="summary-card">
            <h3>${formatSecondsToHHMM(totalTiempoProd)}</h3>
            <p>Tiempo Productivo</p>
        </div>
        <div class="summary-card">
            <h3>${formatSecondsToHHMM(totalTiempoParo)}</h3>
            <p>Tiempo de Paros</p>
        </div>
    </div>

    ${shiftsData.map((shift, index) => {
      const oeeClass = shift.oee >= 65 ? 'oee-good' : shift.oee >= 50 ? 'oee-warning' : 'oee-danger';

      return `
    <div class="shift-section ${index > 0 ? 'page-break' : ''}">
        <div class="shift-title">
            ${shift.turno} - ${new Date(shift.fecha).toLocaleDateString('es-ES')}
        </div>

        <div class="shift-summary">
            <div>
                <div class="label">OEE</div>
                <div class="value ${oeeClass}">${shift.oee.toFixed(1)}%</div>
            </div>
            <div>
                <div class="label">Rendimiento</div>
                <div class="value">${shift.rendimiento.toFixed(1)}%</div>
            </div>
            <div>
                <div class="label">Velocidad</div>
                <div class="value">${shift.velocidad.u_por_hora.toFixed(1)} u/h</div>
            </div>
            <div>
                <div class="label">Tiempo Total</div>
                <div class="value">${formatSecondsToHHMM(shift.tiempo_total_s)}</div>
            </div>
            <div>
                <div class="label">Tiempo Prod.</div>
                <div class="value">${formatSecondsToHHMM(shift.tiempo_prod_s)}</div>
            </div>
            <div>
                <div class="label">Tiempo Paros</div>
                <div class="value">${formatSecondsToHHMM(shift.tiempo_paro_s)}</div>
            </div>
            <div>
                <div class="label">OK/NOK/RWK</div>
                <div class="value">${shift.piezas.ok}/${shift.piezas.nok}/${shift.piezas.rwk}</div>
            </div>
            <div>
                <div class="label">Operadores</div>
                <div class="value">${shift.operadores.length}</div>
            </div>
        </div>

        ${shift.operadores && shift.operadores.length > 0 ? `
        <table>
            <thead>
                <tr>
                    <th>Operador</th>
                    <th>Tiempo Total</th>
                    <th>Tiempo Prod.</th>
                    <th>Tiempo Paros</th>
                    <th>Velocidad (u/h)</th>
                    <th>Eficiencia</th>
                    <th>OK</th>
                    <th>NOK</th>
                    <th>RWK</th>
                </tr>
            </thead>
            <tbody>
                ${shift.operadores.map(operator => `
                <tr>
                    <td>${operator.nombre}</td>
                    <td>${formatSecondsToHHMM(operator.tiempo_total_s)}</td>
                    <td>${formatSecondsToHHMM(operator.tiempo_prod_s)}</td>
                    <td>${formatSecondsToHHMM(operator.tiempo_paro_s)}</td>
                    <td>${operator.velocidad.u_por_hora.toFixed(1)}</td>
                    <td>${operator.eficiencia.toFixed(1)}%</td>
                    <td>${operator.piezas.ok.toLocaleString('es-ES')}</td>
                    <td>${operator.piezas.nok.toLocaleString('es-ES')}</td>
                    <td>${operator.piezas.rwk.toLocaleString('es-ES')}</td>
                </tr>
                `).join('')}
            </tbody>
        </table>
        ` : '<p style="text-align: center; color: #666; padding: 20px;">Sin operadores registrados para este turno</p>'}
    </div>
    `}).join('')}

    <div style="margin-top: 50px; text-align: center; font-size: 11px; color: #666; border-top: 1px solid #ddd; padding-top: 20px;">
        <p><strong>Sistema SCADA MRPII</strong> - © 2024 Grupo KH</p>
        <p>Informe generado automáticamente el ${new Date().toLocaleString('es-ES')}</p>
    </div>
</body>
</html>
  `;
}
