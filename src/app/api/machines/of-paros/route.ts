import { NextRequest, NextResponse } from 'next/server';

/**
 * Placeholder de paros por OF.
 *
 * O workflow atual ainda não expõe os paros individuais via webhook,
 * portanto devolvemos uma lista vazia mantendo a estrutura esperada
 * pelo front-end.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const machineCode = searchParams.get('machineCode');
  const codOf = searchParams.get('codOf');

  if (!machineCode || !codOf) {
    return NextResponse.json(
      {
        success: false,
        error: 'Parâmetros obrigatórios: machineCode e codOf.',
      },
      { status: 400 },
    );
  }

  return NextResponse.json({
    success: true,
    data: [],
    source: 'placeholder',
    timestamp: new Date().toISOString(),
  });
}
