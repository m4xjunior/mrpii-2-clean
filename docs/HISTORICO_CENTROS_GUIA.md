# Guía de Uso: Histórico de Centros de Trabajo

## 📋 Descripción

Sistema completo de visualización de histórico de centros de trabajo con gráfico tipo Gantt/Timeline que muestra estados y paradas de las máquinas en línea de tiempo.

**Características:**
- ✅ Solo lectura (sin modificaciones en BD)
- ✅ Interfaces TypeScript tipadas
- ✅ Service con queries SQL Server optimizadas
- ✅ API REST con validación
- ✅ Visualización interactiva tipo Gantt
- ✅ Filtros avanzados (fecha, línea, área)
- ✅ Modal pop-up responsivo con animaciones
- ✅ Tema claro y minimalista
- ✅ Cache inteligente para performance
- ✅ Totalmente en castellano

---

## 🚀 Instalación

### 1. Importar los estilos en tu layout global

En `src/app/layout.tsx`:

```typescript
import './styles/historico-centros.css';
```

### 2. Usar el componente en tu aplicación

```typescript
import GooeyNavConHistorico from './components/GooeyNavConHistorico';

export default function MiPagina() {
  return (
    <div>
      {/* El tercer icono abrirá el modal de histórico */}
      <GooeyNavConHistorico />
    </div>
  );
}
```

---

## 📊 Estructura de Archivos

```
/types/
  └─ historico-centros.ts          # Interfaces TypeScript

/lib/historico-centros/
  └─ service.ts                     # Service con queries SQL

/src/app/api/historico-centros/
  ├─ route.ts                       # API principal
  ├─ centros/route.ts              # Lista de centros
  ├─ lineas/route.ts               # Lista de líneas
  ├─ areas/route.ts                # Lista de áreas
  └─ agrupado/route.ts             # Datos agrupados

/src/app/components/historico-centros/
  ├─ ModalHistoricoCentros.tsx     # Modal principal
  ├─ HistoricoCentrosTimeline.tsx  # Visualización timeline
  └─ FiltrosHistorico.tsx          # Panel de filtros

/src/app/components/
  └─ GooeyNavConHistorico.tsx      # Integración con GooeyNav

/src/app/styles/
  └─ historico-centros.css         # Estilos
```

---

## 🔌 API Endpoints

### GET /api/historico-centros

Obtener histórico completo (estados + paradas).

**Parámetros de query:**
- `fechaInicio` (requerido): Fecha inicio en formato ISO 8601
- `fechaFin` (requerido): Fecha fin en formato ISO 8601
- `idLinea` (opcional): ID de línea para filtrar
- `idArea` (opcional): ID de área para filtrar
- `idsCentros` (opcional): IDs de centros separados por coma
- `incluirInactivos` (opcional): true/false

**Ejemplo:**
```bash
GET /api/historico-centros?fechaInicio=2025-01-10T00:00:00Z&fechaFin=2025-01-11T00:00:00Z&idLinea=1
```

**Respuesta:**
```json
{
  "exito": true,
  "datos": {
    "centros": [...],
    "estados": [...],
    "paradas": [...]
  },
  "mensaje": "Obtenidos 245 estados y 18 paradas para 12 centros"
}
```

### GET /api/historico-centros/centros

Obtener lista de centros de trabajo.

**Parámetros:**
- `idLinea` (opcional)
- `idArea` (opcional)
- `idTipo` (opcional)
- `activo` (opcional): true/false

### GET /api/historico-centros/lineas

Obtener líneas de producción.

**Parámetros:**
- `activa` (opcional): true/false

### GET /api/historico-centros/areas

Obtener áreas.

**Parámetros:**
- `activa` (opcional): true/false

### GET /api/historico-centros/agrupado

Obtener datos agrupados por hora, día, turno o línea.

**Parámetros:**
- `fechaInicio` (requerido)
- `fechaFin` (requerido)
- `agrupamiento` (opcional): 'hour' | 'day' | 'shift' | 'line'
- `idLinea` (opcional)
- `idArea` (opcional)

---

## 💻 Uso Programático

### Uso básico del modal

```typescript
import { useState } from 'react';
import ModalHistoricoCentros from './components/historico-centros/ModalHistoricoCentros';

function MiComponente() {
  const [modalAbierto, setModalAbierto] = useState(false);

  return (
    <>
      <button onClick={() => setModalAbierto(true)}>
        Abrir Histórico
      </button>

      <ModalHistoricoCentros
        abierto={modalAbierto}
        alCerrar={() => setModalAbierto(false)}
      />
    </>
  );
}
```

### Uso del timeline standalone

```typescript
import HistoricoCentrosTimeline from './components/historico-centros/HistoricoCentrosTimeline';
import type { FiltroTimeline } from '@/types/historico-centros';

function MiDashboard() {
  const filtro: FiltroTimeline = {
    fechaInicio: new Date(Date.now() - 24 * 60 * 60 * 1000),
    fechaFin: new Date(),
    idLinea: 1,
    incluirInactivos: false
  };

  return (
    <div style={{ width: '100%', height: '600px' }}>
      <HistoricoCentrosTimeline
        filtro={filtro}
        altura={600}
        mostrarLeyenda={true}
      />
    </div>
  );
}
```

### Consultar datos directamente desde el service

```typescript
import { HistoricoCentrosService } from '@/lib/historico-centros/service';

async function obtenerDatos() {
  // Obtener centros de trabajo
  const centros = await HistoricoCentrosService.obtenerCentros({
    idLinea: 1,
    activo: true
  });

  // Obtener histórico de estados
  const estados = await HistoricoCentrosService.obtenerEstados({
    fechaInicio: new Date('2025-01-10'),
    fechaFin: new Date('2025-01-11'),
    idLinea: 1
  });

  // Obtener paradas
  const paradas = await HistoricoCentrosService.obtenerParadas({
    fechaInicio: new Date('2025-01-10'),
    fechaFin: new Date('2025-01-11'),
    idLinea: 1
  });

  return { centros, estados, paradas };
}
```

---

## 🎨 Personalización de Estilos

Los estilos están definidos en variables CSS que puedes sobrescribir:

```css
:root {
  --historico-primary: #2196F3;      /* Color principal */
  --historico-secondary: #FF9800;    /* Color secundario */
  --historico-success: #4CAF50;      /* Verde (productivo) */
  --historico-danger: #F44336;       /* Rojo (paradas) */
  --historico-bg: #FFFFFF;           /* Fondo */
  --historico-radius: 12px;          /* Border radius */
  --historico-spacing: 16px;         /* Espaciado */
}
```

### Ejemplo de personalización

```css
/* Cambiar colores del tema */
:root {
  --historico-primary: #6366F1;      /* Indigo */
  --historico-success: #10B981;      /* Emerald */
  --historico-radius: 16px;          /* Más redondeado */
}
```

---

## 📝 Queries SQL Utilizadas

### 1. Centros de Trabajo
```sql
SELECT
  m.id_maquina AS id,
  m.Cod_maquina AS codigo,
  m.Desc_maquina AS nombre,
  m.id_linea AS idLinea,
  l.Desc_linea AS nombreLinea
FROM cfg_maquina m
LEFT JOIN cfg_linea l ON m.id_linea = l.id_linea
WHERE m.activo = 1
ORDER BY m.Orden, m.Desc_maquina
```

### 2. Estados (his_prod)
```sql
SELECT
  hp.id_his_prod AS id,
  hp.id_maquina AS idCentro,
  hp.id_actividad AS idActividad,
  a.Desc_actividad AS nombreActividad,
  a.Color AS colorActividad,
  hp.fecha_ini AS fechaInicio,
  hp.fecha_fin AS fechaFin,
  DATEDIFF(MINUTE, hp.fecha_ini, ISNULL(hp.fecha_fin, GETDATE())) AS duracionMinutos
FROM his_prod hp
INNER JOIN cfg_maquina m ON hp.id_maquina = m.id_maquina
LEFT JOIN cfg_actividad a ON hp.id_actividad = a.id_actividad
WHERE hp.fecha_ini >= @fechaInicio
  AND hp.fecha_ini < @fechaFin
ORDER BY m.Orden, hp.fecha_ini
```

### 3. Paradas (his_paro)
```sql
SELECT
  hp.id_his_paro AS id,
  hp.id_maquina AS idCentro,
  tp.Desc_tipo_paro AS nombreTipoParada,
  tp.Color AS colorParada,
  hp.fecha_ini AS fechaInicio,
  hp.fecha_fin AS fechaFin,
  DATEDIFF(MINUTE, hp.fecha_ini, ISNULL(hp.fecha_fin, GETDATE())) AS duracionMinutos,
  hp.Justificado AS justificado
FROM his_paro hp
INNER JOIN cfg_tipo_paro tp ON hp.id_tipo_paro = tp.id_tipo_paro
WHERE hp.fecha_ini >= @fechaInicio
  AND hp.fecha_ini < @fechaFin
ORDER BY hp.fecha_ini
```

---

## 🔍 Funcionalidades del Timeline

### Interacción
- **Click en barra**: Muestra panel de detalles del evento
- **Hover en barra**: Resalta y muestra tooltip
- **Scroll vertical**: Navegar por centros
- **Filtros**: Cambiar período y filtros en tiempo real

### Panel de Detalles
Muestra información completa del evento seleccionado:
- Nombre del centro
- Fecha/hora de inicio y fin
- Duración calculada
- Detalles específicos (OF, cantidad, observaciones)

### Leyenda
Indica colores para cada tipo de estado:
- 🟢 Verde: Productivo
- 🟠 Naranja: Setup
- 🔴 Rojo: Parada
- ⚫ Gris: Inactivo

---

## ⚙️ Configuración de Cache

El sistema utiliza cache inteligente para optimizar performance:

```typescript
// En lib/database/connection.ts
const CACHE_TTL_FAST = 30 * 1000;      // 30s para queries rápidas
const CACHE_TTL_MEDIUM = 5 * 60 * 1000;  // 5min para queries médias
const CACHE_TTL_HEAVY = 15 * 60 * 1000;  // 15min para queries pesadas
```

---

## 🐛 Troubleshooting

### El modal no se abre
1. Verificar que `framer-motion` está instalado: `npm install framer-motion`
2. Comprobar que los estilos CSS están importados
3. Verificar consola del navegador para errores

### No se muestran datos
1. Verificar conexión a base de datos en `.env`
2. Comprobar que las tablas existen: `cfg_maquina`, `his_prod`, `his_paro`
3. Verificar permisos de lectura en SQL Server
4. Comprobar logs del servidor en la consola

### Error de tipos TypeScript
```bash
# Reconstruir tipos
npm run build
```

### Performance lenta
1. Reducir rango de fechas en filtros
2. Filtrar por línea o área específica
3. Verificar índices en tablas SQL:
   - `his_prod`: índice en `(id_maquina, fecha_ini)`
   - `his_paro`: índice en `(id_maquina, fecha_ini)`

---

## 📱 Responsive Design

El modal se adapta automáticamente a diferentes tamaños de pantalla:

- **Desktop (>768px)**: Filtros laterales, vista completa
- **Tablet/Mobile (<768px)**: Filtros en overlay, vista optimizada
- **Print**: Versión imprimible sin controles

---

## 🔐 Seguridad

- ✅ **Solo lectura**: Ninguna operación modifica la base de datos
- ✅ **Validación de entrada**: Todos los parámetros son validados
- ✅ **SQL parametrizado**: Protección contra SQL injection
- ✅ **Rate limiting**: Cache previene sobrecarga del servidor

---

## 🚀 Roadmap

Próximas funcionalidades:
- [ ] Exportar a Excel/PDF
- [ ] Filtro por operario
- [ ] Vista agrupada por línea
- [ ] Comparación de períodos
- [ ] Alertas automáticas
- [ ] Dashboard de métricas OEE

---

## 📞 Soporte

Para problemas o sugerencias:
1. Revisar esta documentación
2. Verificar logs en consola del navegador y servidor
3. Comprobar configuración de base de datos
4. Revisar queries SQL en `lib/historico-centros/service.ts`

---

## 📄 Licencia

Este código es parte del sistema MRPII MapexBP.
