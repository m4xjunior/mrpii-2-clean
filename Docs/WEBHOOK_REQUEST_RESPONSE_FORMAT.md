# 📡 Formato de Request y Response del Webhook SCADA

**Fecha:** 2025-10-15
**URL Webhook:** `http://localhost:5678/webhook/scada`
**Método:** `POST`

---

## 📤 REQUEST - Body Enviado desde Frontend

El frontend ahora envía un body JSON con la siguiente estructura:

```json
{
  "includeMetrics": {
    "turno": true,
    "of": true
  },
  "machineId": "DOBL10"
}
```

### Campos del Request:

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| `includeMetrics` | Object | ✅ Sí | Objeto que especifica qué métricas incluir |
| `includeMetrics.turno` | Boolean | ✅ Sí | Si debe incluir métricas del turno actual |
| `includeMetrics.of` | Boolean | ✅ Sí | Si debe incluir métricas de toda la OF |
| `machineId` | String | ❌ No | Código de máquina específica (opcional, si no se envía = todas) |

### Ejemplos de Request:

**1. Pedir todas las máquinas con métricas completas:**
```json
{
  "includeMetrics": {
    "turno": true,
    "of": true
  }
}
```

**2. Pedir solo una máquina específica:**
```json
{
  "includeMetrics": {
    "turno": true,
    "of": true
  },
  "machineId": "DOBL10"
}
```

**3. Pedir solo métricas de turno (sin métricas de OF):**
```json
{
  "includeMetrics": {
    "turno": true,
    "of": false
  },
  "machineId": "DOBL10"
}
```

---

## 📥 RESPONSE - Estructura Esperada del Webhook

### Estructura Base (Actual - Datos de Máquinas)

```json
[
  {
    "data": [
      {
        "Cod_maquina": "DOBL10",
        "desc_maquina": "Dobladora 10",
        "Rt_Cod_of": "OF123456",
        "Rt_Unidades_planning": 10000,
        "Rt_Unidades_ok_of": 8300,
        "Rt_Unidades_nok_of": 50,
        "Rt_Unidades_repro_of": 20,
        "Rt_Unidades_ok_turno": 2100,
        "Rt_Unidades_nok_turno": 15,
        "Rt_Unidades_repro_turno": 5,
        "Ag_Rt_Oee_Turno": 85.5,
        "Ag_Rt_Disp_Turno": 92.0,
        "Ag_Rt_Rend_Turno": 95.0,
        "Ag_Rt_Cal_Turno": 98.2,
        "f_velocidad": 450,
        "Rt_Rendimientonominal1": 500,
        "rt_desc_turno": "Mañana",
        "Rt_Desc_operario": "Juan Pérez",
        "Rt_Desc_actividad": "PRODUCCION",
        "rt_desc_paro": "",
        "Rt_Seg_paro_turno": 1200,
        "Rt_Fecha_ini": "2025-10-15T06:00:00",
        "Rt_Fecha_fin": "2025-10-15T14:00:00"
      }
    ]
  }
]
```

### 🆕 NUEVA Estructura con Métricas Adicionales

Cuando `includeMetrics.of = true`, **agregar un segundo elemento al array principal** con las métricas de OF:

```json
[
  {
    "data": [
      {
        "Cod_maquina": "DOBL10",
        "desc_maquina": "Dobladora 10",
        // ... todos los campos actuales de máquinas ...
      },
      {
        "Cod_maquina": "DOBL1",
        // ... otra máquina ...
      }
    ]
  },
  {
    "metrics_turno": [
      {
        "Cod_maquina": "DOBL10",
        "oee_turno": 31.2,
        "disponibilidad_turno": 40.2,
        "rendimiento_turno": 93,
        "calidad_turno": 83.6,
        "nok_turno": 15
      },
      {
        "Cod_maquina": "DOBL1",
        "oee_turno": 88.2,
        "disponibilidad_turno": 92.0,
        "rendimiento_turno": 95.0,
        "calidad_turno": 98.0,
        "nok_turno": 5
      }
    ]
  },
  {
    "metrics_of": [
      {
        "Cod_maquina": "DOBL10",
        "Rt_Cod_of": "OF123456",
        "oee_of": 100,
        "disponibilidad_of": 98.84,
        "rendimiento_of": 100,
        "calidad_of": 10,
        "total_ok_of": 8300,
        "total_nok_of": 50,
        "total_repro_of": 20,
        "total_producido_of": 8370,
        "fecha_inicio_of": "2025-10-14T06:00:00",
        "fecha_fin_estimada_of": "2025-10-15T18:00:00",
        "duracion_minutos_of": 2160,
        "paros_acumulados_of": 145
      },
      {
        "Cod_maquina": "DOBL1",
        "Rt_Cod_of": "OF789012",
        // ... métricas de otra OF ...
      }
    ]
  }
]
```

**⚠️ IMPORTANTE:**
- O array principal sempre tem **1, 2 ou 3 elementos**:
  1. Elemento `[0]` = `{ data: [...] }` → **SEMPRE presente** (dados base das máquinas)
  2. Elemento `[1]` = `{ metrics_turno: [...] }` → **Opcional** (se `includeMetrics.turno = true`)
  3. Elemento `[2]` = `{ metrics_of: [...] }` → **Opcional** (se `includeMetrics.of = true`)

### Campos de Métricas de OF (Nuevo Array):

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `Cod_maquina` | String | Código de la máquina |
| `Rt_Cod_of` | String | Código de la OF |
| `oee_of` | Number | OEE de toda la OF (%) |
| `disponibilidad_of` | Number | Disponibilidad de toda la OF (%) |
| `rendimiento_of` | Number | Rendimiento de toda la OF (%) |
| `calidad_of` | Number | Calidad de toda la OF (%) |
| `total_ok_of` | Number | Total piezas OK de toda la OF |
| `total_nok_of` | Number | Total piezas NOK de toda la OF |
| `total_repro_of` | Number | Total piezas reprocesadas de toda la OF |
| `total_producido_of` | Number | Total producido (ok + nok + repro) |
| `fecha_inicio_of` | String (ISO) | Fecha/hora real de inicio de la OF |
| `fecha_fin_estimada_of` | String (ISO) | Fecha/hora estimada de fin |
| `duracion_minutos_of` | Number | Duración total de la OF en minutos |
| `paros_acumulados_of` | Number | Minutos totales de paros en la OF |

---

## 🔧 Lógica de n8n Sugerida

### Paso 1: Recibir Request Body
```javascript
// En n8n, capturar el body del webhook
const includeOFMetrics = $json.includeMetrics?.of || false;
const includeTurnoMetrics = $json.includeMetrics?.turno || false;
const machineId = $json.machineId || null;
```

### Paso 2: Query Base de Máquinas (Siempre)
```sql
-- Esta query ya existe, obtiene los datos actuales de las máquinas
SELECT
  cm.Cod_maquina,
  cm.desc_maquina,
  cm.Rt_Cod_of,
  cm.Rt_Unidades_planning,
  cm.Rt_Unidades_ok_of,
  cm.Rt_Unidades_nok_of,
  cm.Rt_Unidades_repro_of,
  cm.Rt_Unidades_ok_turno,
  cm.Rt_Unidades_nok_turno,
  cm.Rt_Unidades_repro_turno,
  cm.Ag_Rt_Oee_Turno,
  cm.Ag_Rt_Disp_Turno,
  cm.Ag_Rt_Rend_Turno,
  cm.Ag_Rt_Cal_Turno,
  -- ... resto de campos
FROM cfg_maquina cm
WHERE 1=1
  ${machineId ? `AND cm.Cod_maquina = '${machineId}'` : ''}
```

### Paso 3: Query de Métricas de OF (Condicional)
```javascript
// Solo ejecutar si includeOFMetrics = true
if (includeOFMetrics) {
  // Query para obtener métricas de OF completas desde his_prod
  const ofMetricsQuery = `
    SELECT
      cm.Cod_maquina,
      cm.Rt_Cod_of,
      -- Calcular OEE de toda la OF desde his_prod
      -- (implementar lógica según tu base de datos)
      AVG(hp.Ag_Oee) as oee_of,
      AVG(hp.Ag_Disp) as disponibilidad_of,
      AVG(hp.Ag_Rend) as rendimiento_of,
      AVG(hp.Ag_Cal) as calidad_of,
      SUM(hp.Unidades_ok) as total_ok_of,
      SUM(hp.Unidades_nok) as total_nok_of,
      SUM(hp.Unidades_repro) as total_repro_of,
      MIN(hp.Fecha_ini) as fecha_inicio_of,
      MAX(hp.Fecha_fin) as fecha_fin_estimada_of,
      DATEDIFF(MINUTE, MIN(hp.Fecha_ini), MAX(hp.Fecha_fin)) as duracion_minutos_of,
      SUM(DATEDIFF(MINUTE, hp.Fecha_ini_paro, hp.Fecha_fin_paro)) as paros_acumulados_of
    FROM cfg_maquina cm
    LEFT JOIN his_prod hp ON cm.id_maquina = hp.id_maquina
    WHERE hp.Cod_of = cm.Rt_Cod_of
      ${machineId ? `AND cm.Cod_maquina = '${machineId}'` : ''}
    GROUP BY cm.Cod_maquina, cm.Rt_Cod_of
  `;
}
```

### Paso 4: Construir Response
```javascript
// En n8n, combinar los resultados
const response = [
  {
    data: machinesData // Array de datos de máquinas (cfg_maquina)
  }
];

// Si se pidieron métricas de OF, agregar segundo elemento
if (includeOFMetrics && ofMetricsData.length > 0) {
  response.push({
    metrics_of: ofMetricsData // Array de métricas de OF (his_prod)
  });
}

return response;
```

---

## 📊 Ejemplo Completo de Response con Métricas de OF

```json
[
  {
    "data": [
      {
        "Cod_maquina": "DOBL10",
        "desc_maquina": "Dobladora 10",
        "Rt_Cod_of": "OF123456",
        "rt_Cod_producto": "PROD-001",
        "Rt_Desc_producto": "Pieza metálica A",
        "Rt_Unidades_planning": 10000,
        "Rt_Unidades_ok_of": 8300,
        "Rt_Unidades_nok_of": 50,
        "Rt_Unidades_repro_of": 20,
        "Rt_Unidades_ok_turno": 2100,
        "Rt_Unidades_nok_turno": 15,
        "Rt_Unidades_repro_turno": 5,
        "Ag_Rt_Oee_Turno": 85.5,
        "Ag_Rt_Disp_Turno": 92.0,
        "Ag_Rt_Rend_Turno": 95.0,
        "Ag_Rt_Cal_Turno": 98.2,
        "f_velocidad": 450,
        "Rt_Rendimientonominal1": 500,
        "rt_desc_turno": "Mañana",
        "Rt_Desc_operario": "Juan Pérez",
        "Rt_Desc_actividad": "PRODUCCION",
        "rt_desc_paro": "",
        "Rt_Seg_paro_turno": 1200,
        "Rt_Fecha_ini": "2025-10-15T06:00:00",
        "Rt_Fecha_fin": "2025-10-15T14:00:00"
      },
      {
        "Cod_maquina": "DOBL1",
        "desc_maquina": "Dobladora 1",
        "Rt_Cod_of": "OF789012",
        "Rt_Unidades_planning": 5000,
        "Rt_Unidades_ok_of": 4200,
        "Rt_Unidades_nok_of": 30,
        "Rt_Unidades_repro_of": 10,
        "Ag_Rt_Oee_Turno": 88.2,
        "rt_desc_turno": "Mañana",
        "Rt_Desc_operario": "María García",
        "Rt_Desc_actividad": "PRODUCCION"
      }
    ]
  },
  {
    "metrics_of": [
      {
        "Cod_maquina": "DOBL10",
        "Rt_Cod_of": "OF123456",
        "oee_of": 87.3,
        "disponibilidad_of": 93.5,
        "rendimiento_of": 96.2,
        "calidad_of": 97.1,
        "total_ok_of": 8300,
        "total_nok_of": 50,
        "total_repro_of": 20,
        "total_producido_of": 8370,
        "fecha_inicio_of": "2025-10-14T06:00:00",
        "fecha_fin_estimada_of": "2025-10-15T18:00:00",
        "duracion_minutos_of": 2160,
        "paros_acumulados_of": 145
      },
      {
        "Cod_maquina": "DOBL1",
        "Rt_Cod_of": "OF789012",
        "oee_of": 89.1,
        "disponibilidad_of": 94.2,
        "rendimiento_of": 97.0,
        "calidad_of": 97.5,
        "total_ok_of": 4200,
        "total_nok_of": 30,
        "total_repro_of": 10,
        "total_producido_of": 4240,
        "fecha_inicio_of": "2025-10-14T14:00:00",
        "fecha_fin_estimada_of": "2025-10-15T10:00:00",
        "duracion_minutos_of": 1200,
        "paros_acumulados_of": 72
      }
    ]
  }
]
```

---

## ✅ Checklist de Implementación en n8n

- [ ] **1. Webhook Node** - Configurar para recibir POST con JSON body
- [ ] **2. IF Node** - Verificar si `includeMetrics.of === true`
- [ ] **3. SQL Query 1** - Query base de máquinas (cfg_maquina)
- [ ] **4. SQL Query 2** - Query de métricas de OF (his_prod) - solo si includeMetrics.of = true
- [ ] **5. Set Node** - Combinar resultados en formato array con 2 elementos
- [ ] **6. Respond to Webhook** - Devolver JSON con estructura correcta

---

## 🧪 Prueba desde Frontend

Para probar, simplemente abre el dashboard y verás en la consola del navegador las peticiones:

```javascript
// Request enviado:
POST http://localhost:5678/webhook/scada
{
  "includeMetrics": {
    "turno": true,
    "of": true
  }
}

// Response esperado:
[
  { data: [...] },           // Datos de máquinas
  { metrics_of: [...] }      // Métricas de OF (nuevo)
]
```

---

## 📝 Notas Importantes

1. **Estructura del Response:**
   - El response SIEMPRE es un array con al menos 1 elemento
   - El primer elemento es `{ data: [...] }` con datos de máquinas
   - Si se piden métricas de OF, se agrega un segundo elemento `{ metrics_of: [...] }`

2. **Campos del Body:**
   - `machineId` es opcional - si no se envía, devolver todas las máquinas
   - `includeMetrics.turno` - actualmente no se usa (ya vienen en los datos base)
   - `includeMetrics.of` - si es `true`, agregar el array `metrics_of`

3. **Performance:**
   - Si solo se piden datos base (sin métricas de OF), solo hacer 1 query rápida
   - Si se piden métricas de OF, hacer query adicional a `his_prod` (más lenta)

4. **Frontend Ready:**
   - El frontend ya está configurado para enviar el body correcto
   - El frontend espera la estructura de respuesta con los 2 arrays
   - Solo falta implementar la lógica en n8n
