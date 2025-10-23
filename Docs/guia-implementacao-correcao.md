# Guia de Implementação da Correção de Unidades de Velocidade

## Resumo do Problema

O componente `DashboardOrderCard.tsx` está exibindo "u/h" (unidades por hora) ou "s/u" (segundos por unidade) quando deveria exibir "u/s" (unidades por segundo) em alguns casos.

## Arquivos a Modificar

1. `src/app/components/DashboardOrderCard.tsx`

## Passo a Passo para Implementação

### 1. Localizar as Funções de Formatação

No arquivo `src/app/components/DashboardOrderCard.tsx`, localize as seguintes funções:

- `formatUnits` (aproximadamente linha 239)
- `formatSecondsPerPieceLabel` (aproximadamente linha 261)

### 2. Modificar a Função `formatSecondsPerPieceLabel`

Substitua a função atual por esta versão corrigida:

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

### 3. (Opcional) Adicionar Nova Função para Unidades por Segundo

Caso queira manter ambas as opções, adicione esta nova função:

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

### 4. Verificar o Uso das Funções

No componente, verifique onde as funções são utilizadas:

- `velActualLabel` (linha 1349): Usa `formatUnits` para exibir "u/h"
- `velSegLabel` (linha 1351-1354): Usa `formatSecondsPerPieceLabel` para exibir "s/u"
- `turnoVelocidadRealLabel` (linha 1388-1390): Usa `formatUnits` para exibir "u/h"

### 5. Testar a Implementação

Após fazer as modificações:

1. Inicie o aplicativo
2. Verifique se as velocidades são exibidas corretamente como "u/s"
3. Confirme se os valores numéricos estão corretos (conversão de 1/segundos para unidades/segundo)
4. Teste com diferentes valores para garantir a formatação correta

## Verificação de Regressão

Para garantir que as mudanças não afetam outras partes do sistema:

1. Verifique se há outros componentes que usam as mesmas funções
2. Teste outras partes do dashboard que exibem informações de velocidade
3. Confirme que os cálculos de OEE e outras métricas não são afetados

## Considerações Adicionais

1. **Performance**: A conversão de segundos por unidade para unidades por segundo é uma operação simples e não deve impactar a performance.

2. **Consistência**: Certifique-se de que todas as exibições de velocidade no sistema usem unidades consistentes.

3. **Documentação**: Atualize qualquer documentação que possa fazer referência às unidades de velocidade.

## Alternativas

Caso a solução proposta não atenda aos requisitos:

1. **Manter ambas as unidades**: Exibir tanto "u/h" quanto "u/s" em locais diferentes do componente.
2. **Configuração de preferência**: Adicionar uma configuração para permitir que o usuário escolha a unidade preferida.
3. **Contexto dinâmico**: Exibir "u/h" ou "u/s" dependendo do contexto ou magnitude do valor.

## Conclusão

A correção principal é modificar a função `formatSecondsPerPieceLabel` para converter o valor de segundos por unidade para unidades por segundo e exibir a unidade correta "u/s".