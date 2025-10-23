# 👆 Onde Clicar - Guia Visual do Node Redis

## 🎯 Tela do Node Redis Get - Passo a Passo

```
┌─────────────────────────────────────────────────────────┐
│ ◀ Redis Get                                     [×]     │
├─────────────────────────────────────────────────────────┤
│ Parameters │ Settings │ Docs                            │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ⓵ Credential to connect with                          │
│  ┌────────────────────────────────────────┐            │
│  │ Select Credential                    ▼ │ ← CLIQUE   │
│  └────────────────────────────────────────┘            │
│       ▲                                                 │
│       └── Se não tem credencial, crie uma nova!         │
│                                                         │
│  ⓶ Operation                                            │
│  ┌────────────────────────────────────────┐            │
│  │ Get                                  ▼ │ ← OK! ✓    │
│  └────────────────────────────────────────┘            │
│                                                         │
│  ⓷ Name                                                 │
│  ┌────────────────────────────────────────┐            │
│  │ propertyName                             │ ← OK! ✓    │
│  └────────────────────────────────────────┘            │
│                                                         │
│  ⓸ Key                                                  │
│  ┌────────────────────────────────────────┐            │
│  │ [DIGITE AQUI: cache:maquinas:all]      │ ← DIGITE!  │
│  └────────────────────────────────────────┘            │
│       ▲                                                 │
│       └── Cole: cache:maquinas:all                      │
│                                                         │
│  ⓹ Key Type                                             │
│  ┌────────────────────────────────────────┐            │
│  │ Automatic                            ▼ │ ← OK! ✓    │
│  └────────────────────────────────────────┘            │
│                                                         │
│  ⓺ Options                                              │
│  ┌────────────────────────────────────────┐            │
│  │ No properties                            │ ← OK! ✓    │
│  │ + Add option                             │            │
│  └────────────────────────────────────────┘            │
│                                                         │
│  ┌──────────────┐  ┌──────────────┐                   │
│  │ Test step    │  │ Execute Node │                   │
│  └──────────────┘  └──────────────┘                   │
│         ▲                                               │
│         └── Clique aqui para testar!                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📝 Passo 1: Selecionar Credencial

### O que você vê:

```
┌────────────────────────────────────────┐
│ Select Credential                    ▼ │ ← Clique aqui!
└────────────────────────────────────────┘
```

### Depois de clicar:

```
┌────────────────────────────────────────┐
│ Redis Local                          ✓ │ ← Selecione esta
├────────────────────────────────────────┤
│ + Create New Credential                │ ← Ou crie nova
└────────────────────────────────────────┘
```

**Se não tem "Redis Local":**
1. Clique em **"+ Create New Credential"**
2. Vai abrir nova janela:

```
┌──────────────────────────────────┐
│  Credential name                  │
│  ┌──────────────────────────┐    │
│  │ Redis Local              │    │ ← Nome qualquer
│  └──────────────────────────┘    │
│                                   │
│  Host                             │
│  ┌──────────────────────────┐    │
│  │ localhost                │    │ ← IP do Redis
│  └──────────────────────────┘    │
│                                   │
│  Port                             │
│  ┌──────────────────────────┐    │
│  │ 6379                     │    │ ← Porta padrão
│  └──────────────────────────┘    │
│                                   │
│  Password (optional)              │
│  ┌──────────────────────────┐    │
│  │                          │    │ ← Deixe vazio
│  └──────────────────────────┘    │
│                                   │
│  Database Number                  │
│  ┌──────────────────────────┐    │
│  │ 0                        │    │ ← Database padrão
│  └──────────────────────────┘    │
│                                   │
│  [Test] [Save]                    │
│     ▲      ▲                      │
│     │      └─ Depois de testar    │
│     └─ Clique aqui primeiro       │
└──────────────────────────────────┘
```

3. Clique **"Test"** → Se OK: ✅ "Connection successful"
4. Clique **"Save"**

---

## 📝 Passo 2: Operation - Deixar "Get"

```
┌────────────────────────────────────────┐
│ Get                                  ▼ │ ← Clique para ver opções
└────────────────────────────────────────┘
```

### Opções disponíveis:

```
┌────────────────────────────────────────┐
│ ✓ Get              ← Use esta!        │
│   Set                                  │
│   Del                                  │
│   Incr                                 │
│   Info                                 │
│   ...                                  │
└────────────────────────────────────────┘
```

✅ **Selecione:** `Get` (para BUSCAR cache)

---

## 📝 Passo 3: Name - Deixar "propertyName"

```
┌────────────────────────────────────────┐
│ propertyName                           │ ← Não mexer
└────────────────────────────────────────┘
```

✅ Este campo define onde o valor ficará salvo.
✅ Deixe como está!

---

## 📝 Passo 4: Key - DIGITE AQUI! ⚠️

### Campo vazio (como você vê):

```
┌────────────────────────────────────────┐
│                                        │ ← CLIQUE AQUI
└────────────────────────────────────────┘
        ▲
        └── Cursor piscando
```

### O que digitar:

```
cache:maquinas:all
```

### Como fica depois:

```
┌────────────────────────────────────────┐
│ cache:maquinas:all                     │ ← Pronto! ✅
└────────────────────────────────────────┘
```

**⚠️ IMPORTANTE:**
- Digite EXATAMENTE assim: `cache:maquinas:all`
- Sem espaços extras
- Sem aspas
- Tudo minúsculo

---

## 📝 Passo 5: Key Type - Deixar "Automatic"

```
┌────────────────────────────────────────┐
│ Automatic                            ▼ │
└────────────────────────────────────────┘
```

### Opções:

```
┌────────────────────────────────────────┐
│ ✓ Automatic        ← Use esta!        │
│   String                               │
│   Expression                           │
└────────────────────────────────────────┘
```

✅ **Deixe:** `Automatic`

**Quando usar outras opções:**
- `String` = valor fixo literal
- `Expression` = expressão dinâmica `{{ $json.algo }}`
- `Automatic` = N8N decide sozinho (recomendado)

---

## 📝 Passo 6: Options - Não precisa mexer

```
┌────────────────────────────────────────┐
│ No properties                          │
│ + Add option                           │
└────────────────────────────────────────┘
        ▲
        └── Só clique se precisar de opções avançadas
```

✅ Para cache básico, **não precisa adicionar nada aqui**!

---

## ✅ Configuração Final:

```
┌─────────────────────────────────────────────────────────┐
│ ◀ Redis Get                                     [×]     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Credential to connect with                             │
│  ┌────────────────────────────────────────┐            │
│  │ Redis Local                          ✓ │ ✅         │
│  └────────────────────────────────────────┘            │
│                                                         │
│  Operation                                              │
│  ┌────────────────────────────────────────┐            │
│  │ Get                                  ✓ │ ✅         │
│  └────────────────────────────────────────┘            │
│                                                         │
│  Name                                                   │
│  ┌────────────────────────────────────────┐            │
│  │ propertyName                           │ ✅         │
│  └────────────────────────────────────────┘            │
│                                                         │
│  Key                                                    │
│  ┌────────────────────────────────────────┐            │
│  │ cache:maquinas:all                     │ ✅         │
│  └────────────────────────────────────────┘            │
│                                                         │
│  Key Type                                               │
│  ┌────────────────────────────────────────┐            │
│  │ Automatic                              │ ✅         │
│  └────────────────────────────────────────┘            │
│                                                         │
│  Options                                                │
│  No properties                                ✅       │
│                                                         │
│  ┌──────────────┐                                      │
│  │ Test step    │ ← Clique aqui para testar!          │
│  └──────────────┘                                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🧪 Testar o Node:

### 1. Clique no botão "Test step"

```
┌──────────────┐
│ Test step    │ ← Clique aqui
└──────────────┘
```

### 2. Resultado esperado (primeira vez):

```
┌─────────────────────────────────────┐
│ OUTPUT                              │
├─────────────────────────────────────┤
│ {                                   │
│   "value": null                     │
│ }                                   │
└─────────────────────────────────────┘
        ▲
        └── Isso é NORMAL! Significa que não tem cache ainda.
```

### 3. Depois de salvar cache (segunda execução):

```
┌─────────────────────────────────────┐
│ OUTPUT                              │
├─────────────────────────────────────┤
│ {                                   │
│   "value": "[{...dados...}]"        │
│ }                                   │
└─────────────────────────────────────┘
        ▲
        └── Retornou o cache! ✅
```

---

## 🎯 Checklist:

- [ ] ✅ Credencial "Redis Local" criada e testada
- [ ] ✅ Operation = "Get"
- [ ] ✅ Name = "propertyName"
- [ ] ✅ Key = "cache:maquinas:all"
- [ ] ✅ Key Type = "Automatic"
- [ ] ✅ Testei o node (retornou null = OK!)

---

## 🚀 Próximo Passo:

Agora adicione o node **"IF"** depois deste!

Continue no **REDIS-VISUAL-TUTORIAL.md** → **NODE 3**! 🎉
