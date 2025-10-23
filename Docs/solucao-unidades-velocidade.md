# Solução para o Problema de Unidades de Velocidade (u/h vs u/s)

## Problema Identificado

O componente `DashboardOrderCard.tsx` está exibindo "u/h" (unidades por hora) em vez de "u/s" (unidades por segundo) em alguns casos onde deveria mostrar a velocidade em unidades por segundo.

## Análise do Problema

1. **Função `formatUnits` (linha 239-251)**: Sempre retorna "u/h" como unidade, independentemente do valor:
```typescript
const formatUnits = (
  value: number | null | undefined,
  decimals: number = 1,
  dashWhenZero: boolean = false,
): string => {
  // ... validações
  return `${numberFormatter(decimals).format(value)} u/h`; // Sempre "u/h"
};
```

2. **Função `formatSecondsPerPieceLabel` (linha 261-269)**: Retorna "s/u" (segundos por unidade) quando deveria converter para "u/s" (unidades por segundo):
```typescript
const formatSecondsPerPieceLabel = (
  value: number | null | undefined,
): string => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "— seg/pza";
  }
  const decimals = value >= 10 ? 1 : 2;
  return `${numberFormatter(decimals).format(value)} s/u`; // Retorna "s/u"
};
```

3. **Dados da API**: O sistema recebe dados da API que incluem:
   - `piezas_hora`: unidades por hora
   - `segundos_pieza`: segundos por unidade

## Solução Proposta

### 1. Criar nova função para formatar unidades por segundo

Adicionar uma nova função que converte segundos por unidade para unidades por segundo:

```typescript
const formatUnitsPerSecond = (
  value: number | null | undefined,
  decimals: number = 2,
  dashWhenZero: boolean = false,
): string => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "—";
  }
  if (dashWhenZero && Math.abs(value) < 0.00001) {
    return "—";
  }
  
  // Converter de segundos por unidade para unidades por segundo
  const unitsPerSecond = value > 0 ? 1 / value : 0;
  
  return `${numberFormatter(decimals).format(unitsPerSecond)} u/s`;
};
```

### 2. Modificar a função `formatSecondsPerPieceLabel`

Alterar a função para retornar "u/s" em vez de "s/u":

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

### 3. Modificar onde a função é utilizada

No componente, a variável `velSegLabel` é usada para exibir a velocidade em segundos por unidade. Precisamos garantir que ela esteja exibindo "u/s" em vez de "s/u".

## Implementação

Para implementar esta solução, siga estes passos:

1. Abra o arquivo `src/app/components/DashboardOrderCard.tsx`
2. Localize a função `formatSecondsPerPieceLabel` (aproximadamente na linha 261)
3. Substitua a função pela versão corrigida acima
4. Verifique se há outros locais no código que precisam de ajustes semelhantes

## Testes

Após implementar a solução:

1. Verifique se a velocidade é exibida corretamente como "u/s" nos locais apropriados
2. Confirme que os valores numéricos estão corretos (conversão de 1/segundos para unidades/segundo)
3. Teste com diferentes valores para garantir a formatação correta
4. Verifique se não há impactos em outros componentes que possam usar as mesmas funções

## Alternativa

Caso prefira manter ambas as unidades (u/h e u/s), você pode:

1. Manter a função `formatUnits` para exibir "u/h"
2. Usar a nova função `formatUnitsPerSecond` para exibir "u/s"
3. Adicionar uma lógica no componente para decidir qual unidade exibir com base no contexto ou preferência do usuário

## Conclusão

O problema é que o sistema está exibindo "s/u" (segundos por unidade) quando deveria exibir "u/s" (unidades por segundo). A solução é modificar a função `formatSecondsPerPieceLabel` para converter o valor e exibir a unidade correta.