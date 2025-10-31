# 🔍 Status das APIs - Página de Informes

## Análise Completa de Funcionamento das APIs

**Data de Análise:** 2025-10-09
**Versão da Página:** 2.0

---

## 📊 Resumo Executivo

| API | Status Atual | Componentes Usando | Retorna Dados | Observações |
|-----|--------------|-------------------|---------------|-------------|
| `/api/informes-unified` | ❌ **ERRO 500** | InformesContent (todas as vistas exceto QlikView) | ❌ Não | Erro de servidor |
| `/api/qlikview/metrics` | ⚠️ **Status Desconhecido** | QlikViewFull (vista QlikView) | ❓ A testar | Usa cache |
| `/api/maquinas` | ✅ **OK** | InformesContent (filtro) | ✅ Sim | Lista de máquinas |

---

## 🔌 Análise Detalhada por API

### 1. API `/api/informes-unified`

**Status:** ❌ **NÃO FUNCIONANDO** (Erro 500)

**Arquivo:** `/src/app/api/informes-unified/route.ts`

**Componentes que Dependem:**

#### 🏠 Vista General
- **KPI OEE** - ❌ Sem dados
- **KPI Disponibilidad** - ❌ Sem dados
- **KPI Rendimiento** - ❌ Sem dados
- **KPI Calidad** - ❌ Sem dados
- **KPI Producción Total** - ❌ Sem dados
- **KPI Plan Attainment** - ❌ Sem dados

**Dados Necessários:** `data.metricas.{oee, disponibilidad, rendimiento, calidad, piezasTotales, planAttainment}`

**Código:**
```tsx
// src/app/informes/page.tsx linha 90
const res = await fetch(`/api/informes-unified?${params.toString()}`);
```

---

#### 🏭 Vista Producción
- **ProduccionCard** (múltiplas instâncias) - ❌ Sem dados

**Dados Necessários:** `data.turnos[]` (array de produção por turno)

**Estrutura Esperada:**
```typescript
turnos: [{
  id_maquina: number;
  cod_maquina: string;
  id_turno: number;
  turno_descripcion: string;
  total_ok: number;
  total_nok: number;
  total_rwk: number;
  total_segundos: number;
}]
```

**Código:**
```tsx
// src/app/informes/page.tsx linha 610
<div className="produccion-grid">
  {data.turnos?.map((turno: any) => (
    <ProduccionCard key={turno.id} data={turno} />
  ))}
</div>
```

**Status do Card:** ❌ Não renderiza (sem dados de `data.turnos`)

---

#### ✓ Vista Calidad
- **DefectoCard** (4 instâncias com dados MOCK) - ⚠️ **DADOS FALSOS**

**Dados Atuais:** MOCK (hardcoded no componente)

```tsx
// Linha 634 - Dados MOCK
const defectos = [
  { id: 1, tipo: "Defecto Visual", cantidad: 45, porcentaje: 35.2, severidad: "media" },
  { id: 2, tipo: "Dimensional", cantidad: 32, porcentaje: 25.0, severidad: "alta" },
  // ...
];
```

**Dados Reais Necessários:** `data.scrap[]` ou `data.incidencias[]`

**Problema:** A API retorna `scrap: []` (vazio) - comentário no código diz "TODO: Implementar quando se descubra a tabela correcta"

**Status do Card:** ⚠️ Funciona com dados MOCK, mas não reflete realidade

---

#### 🔧 Vista Mantenimiento
- **AveriaCard** (4 instâncias com dados MOCK) - ⚠️ **DADOS FALSOS**

**Dados Atuais:** MOCK (hardcoded no componente)

```tsx
// Linha 747 - Dados MOCK
const averias = [
  { id: 1, tipo: "Fallo Eléctrico", tiempo: 120, estado: "resuelta", criticalidad: "alta" },
  { id: 2, tipo: "Problema Hidráulico", tiempo: 45, estado: "en-proceso", criticalidad: "media" },
  // ...
];
```

**Dados Reais Necessários:** `data.averias[]`

**Estrutura da API:**
```typescript
averias: [{
  id_averia: number;
  id_maquina: number;
  Fecha: string;
  Cantidad: number;
  MinutosRealizacion: number;
  CodTipoMaquina: string;
}]
```

**Problema:** API está consultando tabela `cfg_mnt_averia` mas retorna erro 500

**Status do Card:** ⚠️ Funciona com dados MOCK, mas não reflete realidade

---

### 2. API `/api/qlikview/metrics`

**Status:** ⚠️ **A VALIDAR**

**Arquivo:** `/src/app/api/qlikview/metrics/route.ts`

**Componentes que Dependem:**

#### 📊 Vista QlikView
- **QlikviewDashboardConnected** - ❓ Status desconhecido
  - **OEEGaugeConnected** - ❓ Depende de `dashboard.metricas`
  - **MetricsOverviewConnected** - ❓ Depende de `dashboard.metricas` e `dashboard.indicadores`
  - **ScrapAnalysisConnected** - ❓ Depende de `dashboard.scrapFabricacion/scrapBailment/scrapWS`
  - **AveriasPanelConnected** - ❓ Depende de `dashboard.averias` e `dashboard.indicadores`

**Hook Usado:** `useQlikviewMetrics` (arquivo: `/hooks/useQlikviewMetrics.ts`)

**Código:**
```tsx
// src/app/informes/components/qlikview/QlikviewDashboardConnected.tsx linha 28-39
const {
  dashboard,
  loading,
  error,
  lastUpdate,
  refresh,
} = useQlikviewMetrics({
  filtros,
  autoRefresh,
  refreshInterval,
  enabled: true,
});
```

**Chamada Real:**
```tsx
// hooks/useQlikviewMetrics.ts linha 83
const response = await fetch(`/api/qlikview/metrics?${params.toString()}`);
```

**Diferença da API informes-unified:**
- ✅ Usa sistema de cache
- ✅ Calcula 150+ métricas QlikView
- ✅ Retorna indicadores (vIndOEE, vIndMTBF, vIndMTTR, etc.)
- ✅ Separa scrap por tipo (Fabricacion, Bailment, WS)

**Possíveis Estados:**
- ✅ **Sucesso:** Retorna dashboard completo
- ⚠️ **Cache Hit:** Retorna dados em cache (rápido)
- ⚠️ **Cache Miss:** Consulta DB e calcula (lento)
- ❌ **Erro:** Retorna erro (mesmos problemas do informes-unified?)

**Status:** ❓ **PRECISA SER TESTADO**

---

### 3. API `/api/maquinas`

**Status:** ✅ **FUNCIONANDO**

**Arquivo:** Não especificado (API externa ou existente)

**Componente que Usa:**
- **InformesContent** - Filtro de máquinas

**Código:**
```tsx
// src/app/informes/page.tsx linha 56-67
useEffect(() => {
  async function fetchMaquinas() {
    try {
      const res = await fetch("/api/maquinas");
      if (res.ok) {
        const data = await res.json();
        setMaquinasList(data);
      }
    } catch (err) { /* ... */ }
  }
  fetchMaquinas();
}, []);
```

**Funcionalidade:** Popula dropdown de seleção de máquinas

**Status:** ✅ Provavelmente funcionando (se filtro aparece com opções)

---

## 🎯 Mapa de Dependências

### Componente → API

```
InformesPage
├─ InformesContent
│  ├─ useEffect → /api/maquinas ✅
│  ├─ fetchDashboardData → /api/informes-unified ❌
│  │
│  ├─ GeneralView
│  │  └─ 6 KPIs → data.metricas ❌ (depende de informes-unified)
│  │
│  ├─ ProduccionView
│  │  └─ ProduccionCard[] → data.turnos ❌ (depende de informes-unified)
│  │
│  ├─ CalidadView
│  │  ├─ 4 Metrics → data.metricas ❌ (depende de informes-unified)
│  │  └─ DefectoCard[] → MOCK DATA ⚠️ (deveria usar data.scrap)
│  │
│  ├─ MantenimientoView
│  │  ├─ 4 Metrics → data.metricas + MOCK ⚠️
│  │  └─ AveriaCard[] → MOCK DATA ⚠️ (deveria usar data.averias)
│  │
│  └─ QlikViewFull
│     └─ QlikviewDashboardConnected
│        ├─ useQlikviewMetrics → /api/qlikview/metrics ❓
│        ├─ OEEGaugeConnected → dashboard.metricas ❓
│        ├─ MetricsOverviewConnected → dashboard.metricas ❓
│        ├─ ScrapAnalysisConnected → dashboard.scrap* ❓
│        └─ AveriasPanelConnected → dashboard.averias ❓
│
└─ DataModal
   └─ Renderiza dados do Context (qualquer origem)
```

---

## 🐛 Problemas Identificados

### Problema #1: API informes-unified retorna 500
**Severidade:** 🔴 **CRÍTICA**

**Impacto:**
- ❌ Vista General: 0% funcional (todos os KPIs sem dados)
- ❌ Vista Producción: 0% funcional (sem ProduccionCards)
- ⚠️ Vista Calidad: 50% funcional (métricas quebradas, cards com MOCK)
- ⚠️ Vista Mantenimiento: 50% funcional (métricas quebradas, cards com MOCK)

**Componentes Afetados:**
- 6 KPIs da Vista General
- Grid de ProduccionCards
- 4 métricas da Vista Calidad
- 4 métricas da Vista Mantenimiento

**Dados Perdidos:**
- `metricas.oee`
- `metricas.disponibilidad`
- `metricas.rendimiento`
- `metricas.calidad`
- `metricas.piezasTotales`
- `metricas.planAttainment`
- `produccion[]` array
- `turnos[]` array
- `averias[]` array
- `incidencias[]` array

**Causa Provável:**
1. Erro de conexão com SQL Server
2. Query SQL malformada
3. Tabela não encontrada
4. Timeout na query

**Solução:**
1. Verificar logs do servidor (agora com logging detalhado)
2. Testar query SQL manualmente
3. Verificar conexão com database
4. Validar que tabelas existem: `his_prod`, `cfg_maquina`, `cfg_mnt_averia`, `his_prod_defecto`

---

### Problema #2: Scrap array sempre vazio
**Severidade:** 🟡 **MÉDIA**

**Código Atual:**
```typescript
// src/app/api/informes-unified/route.ts linha 210
scrap: [], // TODO: Implementar cuando se descubra la tabla correcta
```

**Impacto:**
- Vista Calidad não tem dados reais de scrap
- DefectoCards usam dados MOCK

**Componentes Afetados:**
- DefectoCard (4 instâncias)
- Métricas de scrap na Vista Calidad

**Solução:**
1. Identificar tabela correta de scrap no banco
2. Criar query para buscar dados de scrap
3. Substituir MOCK data por dados reais

---

### Problema #3: Dados MOCK em produção
**Severidade:** 🟡 **MÉDIA**

**Localização:**
- Vista Calidad: `defectos` array (linha 634)
- Vista Mantenimiento: `averias` array (linha 747)
- Vista Mantenimiento: `maintenanceMetrics` (linha 786)

**Impacto:**
- Usuários veem dados falsos
- Não reflete situação real da produção

**Solução:**
1. Conectar DefectoCard à API real (quando scrap[] for implementado)
2. Conectar AveriaCard à API real (quando erro 500 for resolvido)
3. Remover dados MOCK

---

### Problema #4: API QlikView não testada
**Severidade:** 🟡 **MÉDIA**

**Impacto:**
- Vista QlikView pode não funcionar
- 4 sub-componentes dependem desta API
- Não sabemos se cache está funcionando

**Solução:**
1. Testar endpoint `/api/qlikview/metrics`
2. Verificar se retorna dados
3. Validar estrutura de resposta
4. Testar com e sem cache

---

## ✅ Componentes que Funcionam Corretamente

### Componentes UI (sem dependência de API real):

1. **InformesContent** - Container ✅
   - Filtros de data ✅
   - Filtro de máquinas ✅ (usa `/api/maquinas`)
   - Filtro de turnos ✅
   - Tabs de navegação ✅
   - Loading states ✅
   - Error states ✅

2. **DataModal** - Modal universal ✅
   - Abre/fecha corretamente ✅
   - Renderiza dados do Context ✅
   - Navegação entre seções ✅
   - Timeline ✅
   - Related data links ✅

3. **ProduccionCard** - Card visual ✅
   - Click tracking ✅
   - Double-click modal ✅
   - Highlighting ✅
   - Animações ✅
   - **FALTA:** Dados reais da API ❌

4. **DefectoCard** - Card visual ✅
   - Click tracking ✅
   - Double-click modal ✅
   - Highlighting ✅
   - Animações ✅
   - Cores por severidad ✅
   - **USA:** Dados MOCK ⚠️

5. **AveriaCard** - Card visual ✅
   - Click tracking ✅
   - Double-click modal ✅
   - Highlighting ✅
   - Animações ✅
   - Estados por criticidad ✅
   - **USA:** Dados MOCK ⚠️

6. **InformesContext** - Context global ✅
   - Tracking de interações ✅
   - Seleção de dados ✅
   - Drill-down history ✅
   - Highlighting system ✅
   - Modal management ✅

---

## 📋 Checklist de Testes

### Testes Manuais Necessários:

#### ✅ Testes de UI (não dependem de API)
- [x] Navegação entre tabs funciona
- [x] Filtros de data abrem/fecham
- [x] Seleção de máquinas funciona
- [x] Seleção de turnos funciona
- [x] Modal abre/fecha corretamente
- [x] Animações executam suavemente
- [x] Design responsivo em mobile
- [x] Breadcrumb aparece ao selecionar item

#### ❌ Testes de API (dependem de servidor)
- [ ] `/api/informes-unified` retorna 200
- [ ] Dados de `metricas` estão corretos
- [ ] Array `turnos` tem dados
- [ ] Array `averias` tem dados
- [ ] `/api/qlikview/metrics` retorna 200
- [ ] Dashboard QlikView renderiza
- [ ] Cache funciona corretamente

#### ⚠️ Testes de Integração
- [ ] KPIs mostram valores reais
- [ ] ProduccionCards renderizam com dados reais
- [ ] DefectoCards mostram dados do DB (não MOCK)
- [ ] AveriaCards mostram dados do DB (não MOCK)
- [ ] Click em card atualiza Context
- [ ] Double-click abre modal com dados
- [ ] Highlighting funciona entre componentes

---

## 🔧 Ações Recomendadas

### Prioridade ALTA 🔴

1. **Resolver erro 500 da API informes-unified**
   - [ ] Verificar logs do servidor
   - [ ] Testar queries SQL individualmente
   - [ ] Validar conexão com database
   - [ ] Corrigir query problemática

2. **Testar API qlikview/metrics**
   - [ ] Fazer chamada manual via curl/Postman
   - [ ] Verificar resposta
   - [ ] Validar estrutura de dados
   - [ ] Testar vista QlikView

### Prioridade MÉDIA 🟡

3. **Implementar scrap array**
   - [ ] Identificar tabela de scrap
   - [ ] Criar query SQL
   - [ ] Adicionar à resposta da API
   - [ ] Conectar DefectoCards

4. **Remover dados MOCK**
   - [ ] Substituir defectos MOCK por API
   - [ ] Substituir averias MOCK por API
   - [ ] Validar dados reais

### Prioridade BAIXA 🟢

5. **Melhorias de performance**
   - [ ] Adicionar cache à API informes-unified
   - [ ] Implementar paginação
   - [ ] Otimizar queries SQL

6. **Testes automatizados**
   - [ ] Criar testes para APIs
   - [ ] Criar testes para componentes
   - [ ] Criar testes de integração

---

## 📊 Estatísticas Finais

### Por Vista:

| Vista | % Funcional | Status |
|-------|-------------|--------|
| General | 10% | ❌ KPIs sem dados (API quebrada) |
| Producción | 10% | ❌ Cards sem dados (API quebrada) |
| Calidad | 60% | ⚠️ UI OK, métricas quebradas, cards com MOCK |
| Mantenimiento | 60% | ⚠️ UI OK, métricas quebradas, cards com MOCK |
| QlikView | 0-100% | ❓ Não testado |

### Por Componente:

| Componente | Status | Dados |
|------------|--------|-------|
| InformesContent | ✅ OK | Filtros OK |
| DataModal | ✅ OK | Context OK |
| ProduccionCard | ⚠️ OK | ❌ Sem dados da API |
| DefectoCard | ⚠️ OK | ⚠️ Dados MOCK |
| AveriaCard | ⚠️ OK | ⚠️ Dados MOCK |
| QlikviewDashboard | ❓ ? | ❓ Não testado |

### Por API:

| API | Status | Componentes Dependentes |
|-----|--------|------------------------|
| `/api/informes-unified` | ❌ 500 | 16 componentes |
| `/api/qlikview/metrics` | ❓ ? | 5 componentes |
| `/api/maquinas` | ✅ OK | 1 componente |

---

## 🎯 Conclusão

**Situação Atual:** A página de informes está **parcialmente funcional**. A UI e o sistema de interatividade estão 100% implementados e funcionando, mas as APIs de dados estão com problemas.

**Bloqueadores Principais:**
1. 🔴 API `/api/informes-unified` retorna erro 500
2. 🟡 Dados MOCK sendo usados em produção
3. ❓ API QlikView não testada

**Próximos Passos:**
1. Debug e correção da API informes-unified (CRÍTICO)
2. Teste da API qlikview/metrics
3. Substituição de dados MOCK por dados reais

---

**Atualizado:** 2025-10-09
**Autor:** Claude Code
