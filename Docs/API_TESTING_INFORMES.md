# 🧪 Testes de APIs - Página de Informes

## Documento de Testes e Validação
**Data:** 2025-10-09
**Versão:** 1.0
**Autor:** Claude Code

---

## 📋 Índice

1. [APIs Disponíveis](#apis-disponíveis)
2. [Testes de API](#testes-de-api)
3. [Resultados dos Testes](#resultados-dos-testes)
4. [Problemas Encontrados](#problemas-encontrados)
5. [Recomendações](#recomendações)

---

## 🔌 APIs Disponíveis

### 1. `/api/informes-unified`
**Descrição:** API unificada para obter todos os dados da página de informes
**Método:** GET
**Parâmetros:**
- `desde` (obrigatório): Data início (formato: YYYY-MM-DD)
- `hasta` (obrigatório): Data fim (formato: YYYY-MM-DD)
- `maquinaId` (obrigatório): ID(s) da(s) máquina(s) (pode ser múltiplo, separado por vírgula)
- `turnos` (opcional): ID(s) do(s) turno(s) (1=Manhã, 2=Tarde, 3=Noite)

**Resposta:**
```json
{
  "success": true,
  "metricas": {
    "oee": number,
    "disponibilidad": number,
    "rendimiento": number,
    "calidad": number,
    "piezasTotales": number,
    "piezasOK": number,
    "piezasNOK": number,
    "piezasRework": number,
    "planAttainment": number,
    "velocidad": number,
    "tiempoCiclo": number
  },
  "produccion": [...],
  "turnos": [...],
  "averias": [...],
  "incidencias": [...],
  "scrap": [],
  "timestamp": "ISO string"
}
```

**Tabelas Consultadas:**
- `his_prod` - Dados de produção
- `cfg_maquina` - Informações das máquinas
- `cfg_mnt_averia` - Registro de averías
- `his_prod_defecto` - Defeitos/incidências

---

### 2. `/api/qlikview/metrics`
**Descrição:** Métricas QlikView avançadas com cache
**Método:** GET
**Parâmetros:**
- `desde` (obrigatório): Data início (formato: YYYY-MM-DD)
- `hasta` (obrigatório): Data fim (formato: YYYY-MM-DD)
- `maquinaId` (opcional): ID da máquina
- `ofList` (opcional): Lista de OFs
- `turno` (opcional): ID do turno
- `departamento` (opcional): ID do departamento
- `tipoProducto` (opcional): Tipo de produto
- `forceRefresh` (opcional): Força atualização do cache (true/false)

**Resposta:**
```json
{
  "success": true,
  "dashboard": {
    "metricas": {...},
    "produccion": [...],
    "turnos": [...],
    "averias": [...],
    "incidencias": [...],
    "scrapFabricacion": [...],
    "scrapBailment": [...],
    "scrapWS": [...],
    "indicadores": {...},
    "periodo": {...}
  },
  "cacheInfo": {...}
}
```

---

### 3. `/api/informes-api`
**Descrição:** API legada de informes
**Método:** GET
**Parâmetros:** Variáveis

---

### 4. `/api/informes-api/of-list`
**Descrição:** Lista de Ordens de Fabricação
**Método:** GET

---

## 🧪 Testes de API

### Teste 1: API Informes Unified - Cenário Básico

**Endpoint:** `/api/informes-unified`

**Parâmetros de Teste:**
```
GET /api/informes-unified?desde=2025-10-01&hasta=2025-10-09&maquinaId=1
```

**Cenário:** Buscar dados de produção de uma única máquina para os últimos 9 dias

**Resultado Esperado:**
- ✅ Status: 200 OK
- ✅ Retorna objeto com `success: true`
- ✅ Contém todas as métricas calculadas
- ✅ Arrays de produção, turnos, averias e incidencias

**Validações:**
- [ ] OEE calculado corretamente (0-1)
- [ ] Disponibilidad entre 0-1
- [ ] Rendimiento entre 0-1
- [ ] Calidad entre 0-1
- [ ] Soma de piezas (OK + NOK + Rework) = piezasTotales
- [ ] Array de produção não vazio
- [ ] Turnos agregados corretamente

---

### Teste 2: API Informes Unified - Múltiplas Máquinas

**Endpoint:** `/api/informes-unified`

**Parâmetros de Teste:**
```
GET /api/informes-unified?desde=2025-10-01&hasta=2025-10-09&maquinaId=1,2,3
```

**Cenário:** Buscar dados de 3 máquinas simultaneamente

**Resultado Esperado:**
- ✅ Status: 200 OK
- ✅ Dados agregados de todas as máquinas
- ✅ Turnos separados por máquina

**Validações:**
- [ ] Dados de todas as 3 máquinas presentes
- [ ] Métricas agregadas corretamente
- [ ] Sem duplicação de registros

---

### Teste 3: API Informes Unified - Filtro por Turno

**Endpoint:** `/api/informes-unified`

**Parâmetros de Teste:**
```
GET /api/informes-unified?desde=2025-10-01&hasta=2025-10-09&maquinaId=1&turnos=1
```

**Cenário:** Filtrar apenas turno da manhã (6h-14h)

**Resultado Esperado:**
- ✅ Status: 200 OK
- ✅ Apenas dados do turno 1 (MAÑANA)

**Validações:**
- [ ] Todos os registros pertencem ao turno 1
- [ ] Horários entre 6h e 14h

---

### Teste 4: API Informes Unified - Parâmetros Inválidos

**Endpoint:** `/api/informes-unified`

**Parâmetros de Teste:**
```
GET /api/informes-unified?desde=2025-10-01
```

**Cenário:** Parâmetros obrigatórios faltando

**Resultado Esperado:**
- ✅ Status: 400 Bad Request
- ✅ Mensagem de erro clara

**Validações:**
- [ ] Retorna erro apropriado
- [ ] Mensagem indica parâmetros faltantes

---

### Teste 5: QlikView Metrics - Cenário Básico

**Endpoint:** `/api/qlikview/metrics`

**Parâmetros de Teste:**
```
GET /api/qlikview/metrics?desde=2025-10-01&hasta=2025-10-09
```

**Cenário:** Buscar todas as métricas QlikView

**Resultado Esperado:**
- ✅ Status: 200 OK
- ✅ Dashboard completo com 150+ métricas
- ✅ Indicadores calculados

**Validações:**
- [ ] Contém metricas OEE
- [ ] Arrays de scrap separados (Fabricacion, Bailment, WS)
- [ ] Indicadores (vIndOEE, vIndMTBF, vIndMTTR, etc.)
- [ ] Cache info presente

---

### Teste 6: QlikView Metrics - Force Refresh

**Endpoint:** `/api/qlikview/metrics`

**Parâmetros de Teste:**
```
GET /api/qlikview/metrics?desde=2025-10-01&hasta=2025-10-09&forceRefresh=true
```

**Cenário:** Forçar atualização do cache

**Resultado Esperado:**
- ✅ Status: 200 OK
- ✅ Cache atualizado
- ✅ Dados mais recentes

**Validações:**
- [ ] Cache invalidado
- [ ] Novos dados consultados
- [ ] Timestamp atualizado

---

### Teste 7: Performance - Grande Volume de Dados

**Endpoint:** `/api/informes-unified`

**Parâmetros de Teste:**
```
GET /api/informes-unified?desde=2025-01-01&hasta=2025-10-09&maquinaId=1,2,3,4,5
```

**Cenário:** Consulta de 10 meses com 5 máquinas

**Resultado Esperado:**
- ✅ Resposta em < 5 segundos
- ✅ Sem timeout

**Validações:**
- [ ] Tempo de resposta aceitável
- [ ] Dados corretos e completos
- [ ] Sem erros de memória

---

### Teste 8: Erro de Conexão com Banco

**Endpoint:** `/api/informes-unified`

**Cenário:** Simular erro de banco de dados

**Resultado Esperado:**
- ✅ Status: 500 Internal Server Error
- ✅ Mensagem de erro apropriada
- ✅ Não expõe informações sensíveis

**Validações:**
- [ ] Erro capturado corretamente
- [ ] Log de erro gerado
- [ ] Resposta JSON estruturada

---

## 📊 Resultados dos Testes

### Resumo de Execução

| Teste | Endpoint | Status | Tempo (ms) | Resultado |
|-------|----------|--------|------------|-----------|
| 1 | /api/informes-unified | ⏳ Pendente | - | - |
| 2 | /api/informes-unified | ⏳ Pendente | - | - |
| 3 | /api/informes-unified | ⏳ Pendente | - | - |
| 4 | /api/informes-unified | ⏳ Pendente | - | - |
| 5 | /api/qlikview/metrics | ⏳ Pendente | - | - |
| 6 | /api/qlikview/metrics | ⏳ Pendente | - | - |
| 7 | /api/informes-unified | ⏳ Pendente | - | - |
| 8 | /api/informes-unified | ⏳ Pendente | - | - |

---

## 🐛 Problemas Encontrados

### Issues Identificados

#### Issue #1: Scrap Array Vazio
**Severidade:** Média
**Descrição:** O array `scrap` sempre retorna vazio na API `/api/informes-unified`
**Linha:** route.ts:210
**Causa:** Tabela de scrap não identificada
**Solução Proposta:** Identificar tabela correta ou usar `his_prod_defecto` como alternativa

#### Issue #2: Cálculos Simplificados
**Severidade:** Baixa
**Descrição:** Fórmulas de OEE estão simplificadas
**Impacto:** Valores podem não refletir 100% a realidade
**Solução Proposta:** Implementar fórmulas completas conforme norma ISO 22400

#### Issue #3: Falta de Paginação
**Severidade:** Alta
**Descrição:** APIs não implementam paginação
**Impacto:** Pode causar timeout com grande volume de dados
**Solução Proposta:** Adicionar parâmetros `page` e `limit`

---

## 💡 Recomendações

### 1. Implementação de Cache
- ✅ Já implementado em `/api/qlikview/metrics`
- ❌ Falta em `/api/informes-unified`
- **Ação:** Adicionar cache Redis ou em memória

### 2. Validação de Parâmetros
- ✅ Validação básica implementada
- ⚠️ Falta validação de ranges de datas
- **Ação:** Limitar queries a máximo 1 ano

### 3. Rate Limiting
- ❌ Não implementado
- **Ação:** Adicionar rate limiting para evitar sobrecarga

### 4. Logging e Monitoramento
- ⚠️ Logs básicos implementados
- **Ação:** Implementar logging estruturado (Winston/Pino)

### 5. Tratamento de Erros
- ✅ Try-catch implementado
- ⚠️ Mensagens podem ser mais descritivas
- **Ação:** Padronizar códigos de erro

### 6. Documentação OpenAPI
- ❌ Não existe
- **Ação:** Criar especificação OpenAPI 3.0

### 7. Testes Automatizados
- ❌ Não implementados
- **Ação:** Criar suite de testes com Jest

---

## 🚀 Próximos Passos

1. **Executar todos os testes** manualmente ou via Postman
2. **Preencher tabela de resultados** com dados reais
3. **Resolver issues críticos** (paginação, scrap array)
4. **Implementar melhorias** recomendadas
5. **Criar testes automatizados**
6. **Documentar APIs** com OpenAPI/Swagger

---

## 📝 Notas Adicionais

### Comandos para Teste Manual

```bash
# Teste básico
curl "http://localhost:3000/api/informes-unified?desde=2025-10-01&hasta=2025-10-09&maquinaId=1"

# Teste com múltiplas máquinas
curl "http://localhost:3000/api/informes-unified?desde=2025-10-01&hasta=2025-10-09&maquinaId=1,2,3"

# Teste QlikView
curl "http://localhost:3000/api/qlikview/metrics?desde=2025-10-01&hasta=2025-10-09"

# Teste com force refresh
curl "http://localhost:3000/api/qlikview/metrics?desde=2025-10-01&hasta=2025-10-09&forceRefresh=true"
```

### Estrutura de Dados Retornados

**Produção:**
```typescript
{
  id_his_prod: number;
  id_maquina: number;
  Cod_maquina: string;
  id_actividad: number;
  Fecha_ini: string;
  Fecha_fin: string;
  Unidades_ok: number;
  Unidades_nok: number;
  Unidades_repro: number;
  segundos: number;
  id_turno: number;
  turno_descripcion: string;
}
```

**Turno Agregado:**
```typescript
{
  id_maquina: number;
  cod_maquina: string;
  id_turno: number;
  turno_descripcion: string;
  total_ok: number;
  total_nok: number;
  total_rwk: number;
  total_segundos: number;
}
```

**Avería:**
```typescript
{
  id_averia: number;
  id_maquina: number;
  Fecha: string;
  Cantidad: number;
  MinutosRealizacion: number;
  CodTipoMaquina: string;
}
```

---

**Fim do Documento de Testes**
