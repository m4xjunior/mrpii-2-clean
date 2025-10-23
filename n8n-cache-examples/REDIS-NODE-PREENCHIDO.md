# 🔴 Como Preencher o Node Redis Get - Passo a Passo

## 📋 Tela do Node Redis:

Quando você abre o node Redis, vê esta tela:

```
┌────────────────────────────────────────┐
│  Parameters  Settings  Docs            │
├────────────────────────────────────────┤
│                                        │
│  Credential to connect with            │
│  ┌──────────────────────────────────┐  │
│  │ Select Credential              ▼ │  │ ← 1️⃣ CLICAR AQUI
│  └──────────────────────────────────┘  │
│                                        │
│  Operation                             │
│  ┌──────────────────────────────────┐  │
│  │ Get                            ▼ │  │ ← 2️⃣ Deixar "Get"
│  └──────────────────────────────────┘  │
│                                        │
│  Name                                  │
│  ┌──────────────────────────────────┐  │
│  │ propertyName                       │  │ ← 3️⃣ Deixar como está
│  └──────────────────────────────────┘  │
│                                        │
│  Key                                   │
│  ┌──────────────────────────────────┐  │
│  │                                    │  │ ← 4️⃣ PREENCHER AQUI!
│  └──────────────────────────────────┘  │
│                                        │
│  Key Type                              │
│  ┌──────────────────────────────────┐  │
│  │ Automatic                      ▼ │  │ ← 5️⃣ Deixar "Automatic"
│  └──────────────────────────────────┘  │
│                                        │
│  Options                               │
│  No properties                         │ ← 6️⃣ Não precisa mexer
│                                        │
└────────────────────────────────────────┘
```

---

## ✏️ O que Preencher em CADA Campo:

### 1️⃣ **Credential to connect with**

**Clique** na caixa "Select Credential"

Se você JÁ criou a credencial Redis:
- Vai aparecer na lista: **"Redis Local"** (ou o nome que você deu)
- **Selecione ela**

Se NÃO aparece nenhuma credencial:
- Clique em **"+ Create New"**
- Preencha:
  ```
  Name: Redis Local
  Host: localhost
  Port: 6379
  Password: (deixe vazio se não tem senha)
  Database: 0
  ```
- Clique **"Test"** → deve mostrar ✅ "Connection successful"
- Clique **"Save"**

---

### 2️⃣ **Operation**

**Deixe selecionado:** `Get`

(Não precisa mudar nada, já vem assim por padrão)

---

### 3️⃣ **Name**

**Deixe como está:** `propertyName`

(Este é o nome da propriedade onde o valor será salvo. Pode deixar assim mesmo)

---

### 4️⃣ **Key** ⚠️ **MAIS IMPORTANTE!**

**Cole exatamente isto:**

```
cache:maquinas:all
```

**Explicação:**
- `cache:` = prefixo para organizar (opcional, mas recomendado)
- `maquinas:all` = nome da chave que identifica TODAS as máquinas
- Se fosse uma máquina específica, seria: `cache:maquina:DOBL10`

**ATENÇÃO:** Esta key precisa ser **exatamente a mesma** que você vai usar no **Redis Set** mais tarde!

---

### 5️⃣ **Key Type**

**Deixe selecionado:** `Automatic`

(N8N detecta automaticamente se é string simples ou expressão)

**Alternativas:**
- `String` = usa valor literal fixo
- `Expression` = usa expressão dinâmica `{{ $json.algo }}`

Para este caso, use **Automatic** (N8N decide sozinho)

---

### 6️⃣ **Options**

**Não precisa adicionar nada aqui.**

Se quiser ver opções avançadas:
- Clique em **"Add Option"**
- Mas para cache básico, **não é necessário**

---

## ✅ Configuração Final Deve Ficar Assim:

```
┌────────────────────────────────────────┐
│  Credential to connect with            │
│  ┌──────────────────────────────────┐  │
│  │ Redis Local                    ▼ │  │ ✅
│  └──────────────────────────────────┘  │
│                                        │
│  Operation                             │
│  ┌──────────────────────────────────┐  │
│  │ Get                            ▼ │  │ ✅
│  └──────────────────────────────────┘  │
│                                        │
│  Name                                  │
│  ┌──────────────────────────────────┐  │
│  │ propertyName                       │  │ ✅
│  └──────────────────────────────────┘  │
│                                        │
│  Key                                   │
│  ┌──────────────────────────────────┐  │
│  │ cache:maquinas:all                 │  │ ✅ ← VOCÊ DIGITOU ISTO!
│  └──────────────────────────────────┘  │
│                                        │
│  Key Type                              │
│  ┌──────────────────────────────────┐  │
│  │ Automatic                      ▼ │  │ ✅
│  └──────────────────────────────────┘  │
└────────────────────────────────────────┘
```

---

## 🧪 Como Testar Este Node:

### Teste 1: Sem cache (primeira vez)

1. **Clique no botão** "Test step" (embaixo do node)
2. **Resultado esperado:**
   ```json
   {
     "value": null
   }
   ```
   **Ou:**
   ```json
   {}
   ```

   ✅ Isso é **NORMAL!** Significa que não tem cache ainda.

---

### Teste 2: Com cache (depois de salvar)

Depois que você rodar o workflow completo uma vez (e salvar no Redis Set):

1. **Execute o workflow inteiro**
2. **Volte neste node** e clique "Test step" novamente
3. **Resultado esperado:**
   ```json
   {
     "value": "[{\"Cod_maquina\":\"DOBL10\",...}]"
   }
   ```

   ✅ Retornou uma **string JSON** com os dados das máquinas!

---

## 🔍 Verificar no Redis Diretamente:

Se quiser confirmar que salvou, abra o terminal:

```bash
# Conectar ao Redis
redis-cli

# Ver o valor da chave
> GET cache:maquinas:all

# Se retornar dados JSON: ✅ Cache salvo!
# Se retornar (nil): ❌ Cache vazio

# Sair
> exit
```

---

## ⚠️ Erros Comuns:

### Erro: "Connection refused"

**Problema:** Redis não está rodando

**Solução:**
```bash
# Se usando Docker:
docker start redis-cache

# Ou rodar novo container:
docker run -d --name redis-cache -p 6379:6379 redis:alpine

# Se instalado localmente:
redis-server
```

---

### Erro: "Credential not found"

**Problema:** Você não criou a credencial Redis ainda

**Solução:**
1. Vá em **Menu → Credentials**
2. Clique **"New Credential"**
3. Busque **"Redis"**
4. Preencha e salve conforme descrito acima

---

### Node retorna sempre `null`

**Problema:** A chave não existe no Redis (normal na primeira vez)

**Solução:**
- Isso é esperado!
- Primeiro o workflow precisa executar até o "Redis Set" para salvar
- Depois disso, o "Redis Get" vai retornar dados

---

## 📊 Próximo Passo:

Agora que configurou o **Redis Get**, você precisa:

1. ✅ Redis Get (VOCÊ ACABOU DE FAZER!)
2. ⏭️ Adicionar node **"IF"** depois
3. ⏭️ Configurar fluxo TRUE/FALSE
4. ⏭️ Adicionar **"Redis Set"** no final

Continue seguindo o tutorial **REDIS-VISUAL-TUTORIAL.md** a partir do **NODE 3**! 🚀

---

## 📝 Resumo da Configuração:

```
Credential: Redis Local
Operation: Get
Name: propertyName
Key: cache:maquinas:all
Key Type: Automatic
```

**Cole este texto no campo "Key":**
```
cache:maquinas:all
```

Pronto! ✅
