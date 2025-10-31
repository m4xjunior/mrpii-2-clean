# 📊 Análisis: Datos del Webhook vs APIs Antiguas

**Fecha:** 2025-10-15
**Webhook URL:** `http://localhost:5678/webhook/scada`

## ✅ Datos que VIENEN del Webhook

### Datos Básicos de Máquina
- ✅ `Cod_maquina` - Código de la máquina
- ✅ `desc_maquina` - Descripción de la máquina
- ✅ `id_maquina` - ID interno de la máquina

### Datos de Orden de Fabricación (OF)
- ✅ `Rt_Cod_of` - Código de la OF actual
- ✅ `rt_Cod_producto` - Código del producto
- ✅ `codigo_producto` - Código del producto (alternativo)
- ✅ `Rt_Desc_producto` - Descripción del producto
- ✅ `Rt_Unidades_planning` - Unidades planificadas
- ✅ `Rt_Unidades_planning2` - Unidades planificadas (alternativo)

### Datos de Producción de la OF
- ✅ `Rt_Unidades_ok_of` - Piezas OK de la OF
- ✅ `Rt_Unidades_nok_of` - Piezas NOK de la OF
- ✅ `Rt_Unidades_repro_of` - Piezas reprocesadas de la OF

### Datos de Producción del Turno
- ✅ `Rt_Unidades_ok_turno` - Piezas OK del turno
- ✅ `Rt_Unidades_nok_turno` - Piezas NOK del turno
- ✅ `Rt_Unidades_repro_turno` - Piezas reprocesadas del turno

### Datos de Producción Acumulados (no especificado si es OF o turno)
- ✅ `Rt_Unidades_ok` - Piezas OK acumuladas
- ✅ `Rt_Unidades_nok` - Piezas NOK acumuladas
- ✅ `Rt_Unidades_repro` - Piezas reprocesadas acumuladas

### Métricas OEE del Turno
- ✅ `Ag_Rt_Oee_Turno` - OEE del turno (%)
- ✅ `Ag_Rt_Disp_Turno` - Disponibilidad del turno (%)
- ✅ `Ag_Rt_Rend_Turno` - Rendimiento del turno (%)
- ✅ `Ag_Rt_Cal_Turno` - Calidad del turno (%)

### Datos de Velocidad y Rendimiento
- ✅ `f_velocidad` - Velocidad actual (unidades/hora)
- ✅ `Rt_Rendimientonominal1` - Rendimiento nominal 1 (unidades/hora)
- ✅ `Rt_Rendimientonominal2` - Rendimiento nominal 2
- ✅ `Rt_Factor_multiplicativo` - Factor multiplicativo
- ✅ `Rt_SegCicloNominal` - Segundos por ciclo nominal

### Datos de Paros
- ✅ `rt_id_paro` - ID del paro actual
- ✅ `rt_desc_paro` - Descripción del paro actual
- ✅ `Rt_Seg_paro` - Segundos de paro actual
- ✅ `Rt_Seg_paro_turno` - Segundos de paro del turno

### Datos de Actividad y Estado
- ✅ `rt_id_actividad` - ID de la actividad actual
- ✅ `Rt_Desc_actividad` - Descripción de la actividad (PRODUCCION, CERRADA, etc.)

### Datos de Turno y Operador
- ✅ `rt_desc_turno` - Descripción del turno (Mañana, Tarde, Noche)
- ✅ `Rt_Desc_operario` - Nombre del operario
- ✅ `rt_dia_productivo` - Día productivo

### Datos de Fechas
- ✅ `Rt_Fecha_ini` - Fecha/hora inicio de la OF
- ✅ `Rt_Fecha_fin` - Fecha/hora fin estimado de la OF

---

## ❌ Datos que NO VIENEN del Webhook

### Datos Calculados en Frontend
Estos se calculan a partir de los datos del webhook:
- ❌ **Efficiency (%)** - Calculado como `Ag_Rt_Oee_Turno`
- ❌ **Status** - Calculado a partir de `Rt_Desc_actividad` (ACTIVA, PARADA, PRODUCIENDO, CERRADA)
- ❌ **Remaining pieces** - Calculado: `Rt_Unidades_planning - (ok + nok + rw)`
- ❌ **Remaining time** - Calculado: `remaining_pieces / f_velocidad`
- ❌ **Production total** - Calculado: `ok + nok + rw`
- ❌ **Velocity ratio** - Calculado: `actual / nominal`
- ❌ **Paros en minutos** - Calculado: `Rt_Seg_paro_turno / 60`

### Métricas OEE de la OF Completa
⚠️ **IMPORTANTE:** El webhook solo trae métricas del **TURNO ACTUAL**, NO de toda la OF:
- ❌ **OEE General de la OF** - No disponible (solo tenemos `Ag_Rt_Oee_Turno`)
- ❌ **Disponibilidad General de la OF** - No disponible
- ❌ **Rendimiento General de la OF** - No disponible
- ❌ **Calidad General de la OF** - No disponible

**Solución actual:** Se usa `Ag_Rt_Oee_Turno` como proxy para OEE de la OF.

### Datos de Paros Detallados
- ❌ **Historial de paros** - No viene en el webhook
- ❌ **Categorías de paros** - No viene en el webhook
- ❌ **Duración de cada paro individual** - Solo viene el paro activo actual

### Datos de NOK por Defecto
- ❌ **NOK por tipo de defecto** - Se obtenía de `/api/scada/nok-turno` y `/api/scada/nok-of`
- ❌ **Categorías de defectos** - No disponible en webhook
- ❌ **Top defectos** - No disponible en webhook

**Estado actual:** Estos datos aún se obtienen de las APIs antiguas (`fetchNokTurnoData`, `fetchNokOfData`)

### Datos de Preparación de Máquina
- ❌ **Tiempo de preparación** - API `/api/scada/machine-preparation` (desactivada)
- ❌ **Estado de preparación** - No disponible en webhook

### Datos de Progreso de Turno (Shift Progress)
- ❌ **Progreso del turno por hora** - API `/api/shift-progress/state` (no existe)
- ❌ **Ventanas de producción** - No disponible en webhook
- ❌ **Distribución horaria** - No disponible en webhook

### Datos Históricos
- ❌ **Producción de turnos anteriores** - Solo turno actual
- ❌ **OEE de días anteriores** - Solo turno actual
- ❌ **Tendencias** - No disponible en webhook

### Campos Calculados Complejos (antes en `/api/scada/machine-fields`)
Estos campos se calculaban en el backend con queries complejas:
- ❌ **"Paros acumulados"** - Últimas 24h de paros (query a `his_prod`)
- ❌ **"Operativa estable"** - Basado en paros acumulados
- ❌ **"Seg/pieza"** - `3600 / velocidad_nominal`
- ❌ **"Tiempo restante"** - Calculado con velocidad actual vs nominal
- ❌ **"% completado"** - Basado en progreso de OF
- ❌ **"Calidad %"** - Eficiencia calculada
- ❌ **Métricas generales de OF** - Basado en `his_prod` histórico

---

## 🔄 Estado Actual de las APIs

### APIs Desactivadas (410 Gone)
1. ✅ `/api/scada/machines` - Reemplazada por webhook
2. ✅ `/api/scada/machine-details` - Reemplazada por webhook
3. ✅ `/api/scada/machine-fields` - Reemplazada por webhook
4. ✅ `/api/scada/machine-preparation` - Desactivada (no usada)

### APIs Aún Activas
1. ⚠️ `/api/scada/nok-turno` - **ACTIVA** - Obtiene NOK por defecto del turno
2. ⚠️ `/api/scada/nok-of` - **ACTIVA** - Obtiene NOK por defecto de la OF
3. ⚠️ `/api/scada/oee/turno` - Estado desconocido
4. ⚠️ `/api/analytics/*` - Rutas de analytics (monthly, shifts, of-summary)

### Componentes Desactivados
1. ✅ `<ShiftProgressBar>` - Llamaba a `/api/shift-progress/state` (no existe)

---

## 📝 Campos del Webhook Mapeados a MachineStatus

```typescript
// Estructura del webhook recibido:
[{
  data: [
    {
      Cod_maquina: "DOBL1",
      desc_maquina: "Dobladora 1",
      Rt_Cod_of: "OF123456",
      Rt_Unidades_planning: 10000,
      Rt_Unidades_ok_of: 8300,
      Rt_Unidades_nok_of: 50,
      Rt_Unidades_repro_of: 20,
      Ag_Rt_Oee_Turno: 85.5,
      Ag_Rt_Disp_Turno: 92.0,
      Ag_Rt_Rend_Turno: 95.0,
      Ag_Rt_Cal_Turno: 98.2,
      f_velocidad: 450,
      Rt_Rendimientonominal1: 500,
      rt_desc_turno: "Mañana",
      Rt_Desc_operario: "Juan Pérez",
      Rt_Desc_actividad: "PRODUCCION",
      rt_desc_paro: "",
      Rt_Seg_paro_turno: 1200,
      // ... más campos
    }
  ]
}]
```

```typescript
// Transformado a MachineStatus:
{
  machine: {
    Cod_maquina: "DOBL1",
    desc_maquina: "Dobladora 1",
    Rt_Unidades_planning: 10000,
    // ...
  },
  currentOF: "OF123456",
  production: {
    ok: 8300,
    nok: 50,
    rwk: 20,      // ⚠️ Nota: se llama 'rwk' no 'rw'
    total: 8370
  },
  oee_turno: 85.5,
  disponibilidad: 92.0,
  rendimiento: 95.0,
  calidad: 98.2,
  efficiency: 85,  // Redondeado de oee_turno
  status: "PRODUCIENDO", // Calculado de Rt_Desc_actividad
  operator: "Juan Pérez",
  order: {
    code: "OF123456",
    shift: "Mañana"
  },
  velocity: {
    actual: 450,    // ⚠️ Nota: se llama 'actual' no 'current'
    nominal: 500
  },
  downtime: null,   // Calculado si hay rt_desc_paro
  turnoOk: 2100,    // Del turno actual
  turnoNok: 15,
  turnoRwk: 5,
  turnoTotal: 2120
}
```

---

## ⚠️ Problemas de Tipo Identificados

### En `lib/webhook-transformer.ts`:

1. **`production.rwk` vs `production.rw`**
   - Webhook usa: `rwk` (línea 52)
   - Tipo esperado: `rw`
   - **Acción:** Verificar tipo `MachineStatus` y unificar

2. **`velocity.actual` vs `velocity.current`**
   - Webhook usa: `actual` (línea 62)
   - Tipo esperado: `current`
   - **Acción:** Verificar tipo y unificar

3. **`downtime` tipo incorrecto**
   - Webhook retorna: `{ active: string, duration: number }`
   - Tipo esperado: `string`
   - **Acción:** Corregir tipo o estructura

4. **`productionOF` campos faltantes**
   - Webhook solo tiene: `{ remainingPieces, remainingTime }`
   - Tipo requiere: `{ ok, nok, rw, total, progress, remainingPieces, remainingTime, ... }`
   - **Acción:** Completar todos los campos requeridos

5. **`ofInfo` campos faltantes**
   - Webhook solo tiene: `{ parosMinutes }`
   - Tipo requiere: `{ startDate, endDate, durationMinutes, estimatedFinishDate }`
   - **Acción:** Agregar campos de fechas desde webhook

---

## 🎯 Recomendaciones

### Opción 1: Mantener Webhook Simple (Actual)
✅ **Pros:**
- Solo una fuente de datos (webhook)
- Más rápido y simple
- Menos llamadas al servidor

❌ **Contras:**
- Perdemos datos históricos de la OF completa
- No tenemos desglose de defectos NOK
- No hay historial de paros
- Métricas solo del turno actual

### Opción 2: Webhook + APIs Complementarias
✅ **Pros:**
- Datos en tiempo real del webhook
- Datos históricos y detallados de APIs
- Análisis completo disponible

❌ **Contras:**
- Más complejo de mantener
- Más llamadas al servidor
- Necesidad de sincronizar datos

### Opción 3: Enriquecer el Webhook
✅ **Pros:**
- Una sola fuente de datos completa
- Toda la información disponible en tiempo real

❌ **Contras:**
- Requiere modificar n8n workflow
- Webhook más pesado
- Posible impacto en performance

---

## 📋 Siguiente Pasos Sugeridos

1. **Corregir tipos de TypeScript en `webhook-transformer.ts`**
2. **Decidir qué hacer con datos NOK detallados**
3. **Revisar si necesitamos métricas de OF completa o solo turno**
4. **Validar con el usuario qué datos son críticos**
5. **Documentar limitaciones actuales vs funcionalidad anterior**
