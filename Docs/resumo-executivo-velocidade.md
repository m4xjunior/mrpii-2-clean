# Resumo Executivo: Correção de Unidades de Velocidade

## Problema

O componente `DashboardOrderCard.tsx` está exibindo "u/h" (unidades por hora) ou "s/u" (segundos por unidade) quando deveria exibir "u/s" (unidades por segundo) em alguns casos.

## Causa Raiz

1. A função `formatSecondsPerPieceLabel` retorna "s/u" em vez de converter para "u/s"
2. Não há conversão de segundos por unidade para unidades por segundo
3. A API retorna dados em ambos os formatos (`piezas_hora` e `segundos_pieza`), mas o frontend não está tratando corretamente

## Solução

Modificar a função `formatSecondsPerPieceLabel` no arquivo `src/app/components/DashboardOrderCard.tsx` para:

1. Converter o valor de segundos por unidade para unidades por segundo (cálculo: 1/valor)
2. Exibir a unidade correta "u/s" em vez de "s/u"

## Código da Solução

```typescript
const formatSecondsPerPieceLabel = (
  value: number | null | undefined,
): string => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "— seg/pza";
  }
  const decimals = value >= 10 ? 1 : 2;
  
  // Converter para unidades por segundo
  const unitsPerSecond = value > 0 ? 1 / value : 0;
  const upsDecimals = unitsPerSecond >= 10 ? 1 : 2;
  
  return `${numberFormatter(upsDecimals).format(unitsPerSecond)} u/s`;
};
```

## Impacto

- **Positivo**: Exibição correta das unidades de velocidade como "u/s"
- **Risco mínimo**: A mudança afeta apenas a formatação da exibição, não a lógica de negócio
- **Testes necessários**: Verificar se a exibição está correta em todos os cenários

## Próximos Passos

1. Implementar a correção no arquivo `src/app/components/DashboardOrderCard.tsx`
2. Testar a exibição em diferentes cenários
3. Verificar se não há impactos em outros componentes
4. Documentar a mudança para referência futura

## Arquivos de Referência

- `src/app/components/DashboardOrderCard.tsx` - Arquivo principal a ser modificado
- `hooks/useFechasOF.ts` - Hook que fornece os dados de velocidade
- `Docs/solucao-unidades-velocidade.md` - Análise detalhada do problema
- `Docs/guia-implementacao-correcao.md` - Guia passo a passo para implementação