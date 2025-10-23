# Correção da Query N8N para Tempo de Preparação

## Problema Identificado

A query atual está filtrando dados por shift (turno) específico, o que faz com que o tempo de preparação de uma OF que começou no dia anterior não seja capturado no turno atual. Isso resulta em "prep_minutes": "0h 00m" mesmo quando há preparação registrada.

## Análise do Problema

1. A query usa `WHERE hp.Fecha_fin <= @ini` para filtrar o turno atual, excluindo registros de preparação do dia anterior.
2. Para OFs que cruzam turnos/dias, o tempo de preparação é perdido se a preparação foi no turno anterior.
3. A agregação por shift não considera o histórico completo da OF.

## Query Corrigida

A solução é modificar a query para agregar o tempo de preparação da OF completa, independentemente do turno, e depois filtrar por shift apenas para produção e paros.

### Query Completa e Executável

Esta query assume que `@ini` e `@fim` são parâmetros definidos no N8N. No N8N, você pode definir essas variáveis no Code Node antes da query ou usar valores fixos para teste.

```sql
DECLARE @ini DATETIME = '2025-10-23 06:00:00';  -- Início do turno atual
DECLARE @fim DATETIME = '2025-10-23 14:00:00';  -- Fim do turno atual

-- CTE para dados base das máquinas
WITH base AS (
  SELECT DISTINCT
    b.Id_maquina,
    b.Cod_maquina,
    b.Desc_maquina
  FROM cfg_maquina b
  WHERE 1=1
),

-- CTE para tempo de preparação da OF completa (histórico total)
agg_preparacion AS (
  SELECT 
    hp.Id_maquina,
    SUM(
      CASE 
        WHEN LOWER(a.Desc_actividad) LIKE '%preparación%' OR LOWER(a.Desc_actividad) LIKE '%preparation%' OR LOWER(a.Desc_actividad) LIKE '%setup%'
        THEN DATEDIFF(MINUTE, 
          CASE WHEN hp.Fecha_ini < hp.Fecha_fin THEN hp.Fecha_ini ELSE hp.Fecha_fin END,
          CASE WHEN hp.Fecha_fin > hp.Fecha_ini THEN hp.Fecha_fin ELSE hp.Fecha_ini END
        )
        ELSE 0
      END
    ) AS prep_minutes_total_of
  FROM his_prod hp
  LEFT JOIN cfg_actividad a ON a.Id_actividad = hp.Id_actividad
  WHERE hp.Cod_of IS NOT NULL 
    AND hp.Cod_of != '--'
    AND (LOWER(a.Desc_actividad) LIKE '%preparación%' OR LOWER(a.Desc_actividad) LIKE '%preparation%' OR LOWER(a.Desc_actividad) LIKE '%setup%')
  GROUP BY hp.Id_maquina
),

-- CTE para tempo de produção por shift (turno atual)
agg_produccion_shift AS (
  SELECT 
    hp.Id_maquina,
    SUM(
      CASE 
        WHEN LOWER(a.Desc_actividad) LIKE '%producción%' OR LOWER(a.Desc_actividad) LIKE '%production%'
        THEN DATEDIFF(MINUTE, 
          CASE WHEN hp.Fecha_ini < @ini THEN @ini ELSE hp.Fecha_ini END,
          CASE WHEN hp.Fecha_fin > @fim THEN @fim ELSE hp.Fecha_fin END
        )
        ELSE 0
      END
    ) AS prod_minutes_shift
  FROM his_prod hp
  LEFT JOIN cfg_actividad a ON a.Id_actividad = hp.Id_actividad
  WHERE hp.Fecha_ini >= @ini OR hp.Fecha_fin >= @ini
    AND (LOWER(a.Desc_actividad) LIKE '%producción%' OR LOWER(a.Desc_actividad) LIKE '%production%')
  GROUP BY hp.Id_maquina
),

-- CTE para tempo de ajustes por shift
agg_ajustes_shift AS (
  SELECT 
    hp.Id_maquina,
    SUM(
      CASE 
        WHEN LOWER(a.Desc_actividad) LIKE '%ajuste%' OR LOWER(a.Desc_actividad) LIKE '%adjustment%'
        THEN DATEDIFF(MINUTE, 
          CASE WHEN hp.Fecha_ini < @ini THEN @ini ELSE hp.Fecha_ini END,
          CASE WHEN hp.Fecha_fin > @fim THEN @fim ELSE hp.Fecha_fin END
        )
        ELSE 0
      END
    ) AS ajust_minutes_shift
  FROM his_prod hp
  LEFT JOIN cfg_actividad a ON a.Id_actividad = hp.Id_actividad
  WHERE hp.Fecha_ini >= @ini OR hp.Fecha_fin >= @ini
    AND (LOWER(a.Desc_actividad) LIKE '%ajuste%' OR LOWER(a.Desc_actividad) LIKE '%adjustment%')
  GROUP BY hp.Id_maquina
),

-- CTE para tempo de paros por shift
agg_paros_shift AS (
  SELECT 
    hp.Id_maquina,
    SUM(
      CASE 
        WHEN LOWER(a.Desc_actividad) LIKE '%paro%' OR LOWER(a.Desc_actividad) LIKE '%downtime%'
        THEN DATEDIFF(MINUTE, 
          CASE WHEN hp.Fecha_ini < @ini THEN @ini ELSE hp.Fecha_ini END,
          CASE WHEN hp.Fecha_fin > @fim THEN @fim ELSE hp.Fecha_fin END
        )
        ELSE 0
      END
    ) AS paros_minutes_shift
  FROM his_prod hp
  LEFT JOIN cfg_actividad a ON a.Id_actividad = hp.Id_actividad
  WHERE hp.Fecha_ini >= @ini OR hp.Fecha_fin >= @ini
    AND (LOWER(a.Desc_actividad) LIKE '%paro%' OR LOWER(a.Desc_actividad) LIKE '%downtime%')
  GROUP BY hp.Id_maquina
)

-- Query final combinando tudo
SELECT 
  b.Id_maquina AS machine_id,
  b.Cod_maquina AS machine_code,
  b.Desc_maquina AS machine_name,
  @ini AS shift_start,
  @fim AS shift_end,
  DATEDIFF(MINUTE, @ini, @fim) AS shift_total_minutes,
  
  -- Tempo de preparação total da OF (de qualquer turno/dia)
  COALESCE(ap.prep_minutes_total_of, 0) AS prep_minutes,
  
  -- Tempo de produção do shift atual
  COALESCE(ps.prod_minutes_shift, 0) AS prod_minutes,
  
  -- Tempo de ajustes do shift atual
  COALESCE(aj.ajust_minutes_shift, 0) AS ajust_minutes,
  
  -- Tempo de paros do shift atual
  COALESCE(ps.paros_minutes_shift, 0) AS paros_minutes,
  
  -- Tempo ocioso do shift atual
  CASE 
    WHEN DATEDIFF(MINUTE, @ini, @fim) - (COALESCE(ps.prod_minutes_shift, 0) + COALESCE(aj.ajust_minutes_shift, 0) + COALESCE(ps.paros_minutes_shift, 0)) < 0 
    THEN 0
    ELSE DATEDIFF(MINUTE, @ini, @fim) - (COALESCE(ps.prod_minutes_shift, 0) + COALESCE(aj.ajust_minutes_shift, 0) + COALESCE(ps.paros_minutes_shift, 0))
  END AS idle_minutes

FROM base b
LEFT JOIN agg_preparacion ap ON ap.Id_maquina = b.Id_maquina
LEFT JOIN agg_produccion_shift ps ON ps.Id_maquina = b.Id_maquina
LEFT JOIN agg_ajustes_shift aj ON aj.Id_maquina = b.Id_maquina
LEFT JOIN agg_paros_shift ps ON ps.Id_maquina = b.Id_maquina;
```

## Como Usar no N8N

### Opção 1: Definir Parâmetros no Code Node (Recomendado)

Adicione um Code Node antes da query SQL para definir `@ini` e `@fim`:

```javascript
// Code Node: Definir Parâmetros de Turno
const now = new Date();
const shiftStart = new Date(now.getTime() - (now.getHours() % 8) * 60 * 60 * 1000);  // Início do turno atual
const shiftEnd = new Date(shiftStart.getTime() + 8 * 60 * 60 * 1000);  // Fim do turno atual

return [{
  json: {
    ini: shiftStart.toISOString(),
    fim: shiftEnd.toISOString()
  }
}];
```

### Opção 2: Parâmetros Fixos para Teste

Para testar, substitua as declarações no início da query:

```sql
-- Para teste: Definir turno fixo
DECLARE @ini DATETIME = '2025-10-23 06:00:00';  -- Exemplo: início do turno manhã
DECLARE @fim DATETIME = '2025-10-23 14:00:00';  -- Exemplo: fim do turno manhã
```

## Resultado Esperado

Com esta query, para uma OF que teve preparação no dia anterior:

```json
[
  {
    "prep_minutes": "1.5h",  // Tempo total de preparação da OF (incluindo dias anteriores)
    "prod_minutes": "5h 44m",  // Tempo de produção apenas do shift atual
    "ajust_minutes": "0h 00m",
    "paros_minutes": "0h 36m"
  }
]
```

## Teste da Query

1. Execute a query diretamente no SQL Server Management Studio com valores de `@ini` e `@fim` para o turno atual.
2. Verifique se `prep_minutes` retorna o tempo total de preparação da OF, incluindo dias anteriores.
3. Confirme que `prod_minutes` e `paros_minutes` são apenas para o shift atual.

Esta correção garante que o tempo de preparação seja capturado corretamente, mesmo para OFs que cruzam turnos/dias.