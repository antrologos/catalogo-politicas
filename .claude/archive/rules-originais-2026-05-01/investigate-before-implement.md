---
paths:
  - "**"
---

# REGRA CRITICA: Investigar-Planejar-Testar ANTES de Implementar

**Status:** OBRIGATORIA — INVIOLAVEL
**Estabelecida:** 2026-04-15
**Escopo:** Todo o projeto Transcritorio
**Prioridade:** MAXIMA — prevalece sobre todas as outras regras

## Principio absoluto

**NUNCA implementar sem antes investigar, planejar e testar.**

Esta regra e inviolavel. Nao ha excecoes. Nao ha atalhos.

## O ciclo obrigatorio

```
┌─────────────┐
│  INVESTIGAR  │ ← Entender o problema completamente
└──────┬──────┘
       ▼
┌─────────────┐
│   PLANEJAR   │ ← Desenhar a solucao minima
└──────┬──────┘
       ▼
┌─────────────┐
│    TESTAR    │ ← Validar em contexto restrito
└──────┬──────┘
       ▼
   Certeza?
   NÃO → voltar a INVESTIGAR
   SIM → prosseguir
       ▼
┌──────────────┐
│  IMPLEMENTAR  │ ← So agora alterar o codigo real
└──────────────┘
```

## Detalhamento de cada fase

### INVESTIGAR

- Ler TODOS os arquivos relevantes antes de qualquer acao
- Entender o estado atual (git status, dist existente, venv, etc.)
- Identificar a causa raiz, nao apenas os sintomas
- Verificar se o problema ja foi resolvido em commits anteriores
- Documentar o que foi encontrado

### PLANEJAR

- Descrever a mudanca em texto ANTES de qualquer edit
- Listar arquivos afetados e linhas especificas
- Listar arquivos que NAO serao tocados
- Identificar riscos e efeitos colaterais
- Obter aprovacao do usuario via EnterPlanMode/ExitPlanMode

### TESTAR

- Criar toy example ou unit test que valide a mudanca
- Rodar o teste em contexto restrito (nao no pipeline completo)
- Se o teste falha: voltar a INVESTIGAR
- Se o teste passa: verificar se cobre todos os cenarios relevantes
- Documentar resultado do teste

### CERTEZA ABSOLUTA

Antes de implementar, responder TODAS estas perguntas com SIM:

- [ ] Entendo completamente a causa raiz do problema?
- [ ] A solucao proposta resolve a causa raiz (nao apenas o sintoma)?
- [ ] Tenho um teste que prova que a solucao funciona?
- [ ] A mudanca e minima e nao toca areas fora do escopo?
- [ ] Sei exatamente quais arquivos e linhas serao alterados?
- [ ] Nao vou introduzir regressoes em outras partes do sistema?

Se QUALQUER resposta for NAO: **voltar ao inicio do ciclo.**

### IMPLEMENTAR

- Seguir o plano aprovado, sem desvios
- Uma mudanca por vez
- Verificar apos cada mudanca
- Se algo inesperado ocorrer: PARAR e reportar ao usuario

## Quando esta regra se aplica

**SEMPRE.** Inclusive para:

- Correcoes de bugs
- Mudancas no build/packaging
- Alteracoes na GUI
- Qualquer mudanca em funcoes compartilhadas
- Refatoracoes
- Features novas

## O que acontece se esta regra for violada

Se eu (Claude) implementar algo sem ter completado o ciclo
investigar-planejar-testar:

1. A mudanca pode introduzir bugs novos (como o dist sem CUDA)
2. O usuario tera que gastar tempo revertendo e investigando
3. A confianca no processo de desenvolvimento e danificada

**Esta regra existe para prevenir exatamente esse tipo de dano.**

## Relacao com outras regras

Esta regra COMPLEMENTA e REFORÇA:
- `development-procedure.md` — mudancas minimas e cirurgicas
- `testing-protocol.md` — hierarquia de testes
- `plan-first.md` — fluxo plano-primeiro

Em caso de conflito, esta regra prevalece.
