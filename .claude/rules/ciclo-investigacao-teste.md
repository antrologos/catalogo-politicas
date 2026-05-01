---
descricao: Ciclo inviolável INVESTIGAR → PLANEJAR → TESTAR → VERIFICAR → DECIDIR → IMPLEMENTAR → VALIDAR → COMMITAR. Hierarquia de testes toy/unit/integração. Protocolo de debug.
escopo: universal · todo o projeto
versao: 1.0
ultima_revisao: 2026-05-01
prioridade: MAXIMA
---

# Ciclo de Investigação e Teste

**Status:** OBRIGATÓRIA — INVIOLÁVEL · **Prioridade:** MÁXIMA — prevalece sobre todas as outras regras

## Princípio absoluto

**NUNCA implementar sem antes investigar, planejar e testar.** Não há exceções nem atalhos.

## O ciclo

```
┌─────────────┐
│ INVESTIGAR  │ ← entender o problema completamente; causa raiz, não sintoma
└──────┬──────┘
       ▼
┌─────────────┐
│  PLANEJAR   │ ← desenhar a solução mínima; texto antes de código
└──────┬──────┘
       ▼
┌─────────────┐
│   TESTAR    │ ← criar toy/unit test em contexto restrito
└──────┬──────┘
       ▼
┌─────────────┐
│  VERIFICAR  │ ← rodar APENAS o teste criado; entender o resultado
└──────┬──────┘
       ▼
┌─────────────┐
│   DECIDIR   │ ← certeza absoluta? (checklist 6 itens)
│             │   NÃO → voltar a INVESTIGAR
│             │   SIM → prosseguir
└──────┬──────┘
       ▼
┌──────────────┐
│ IMPLEMENTAR  │ ← edição mínima no arquivo real; sem desvios
└──────┬───────┘
       ▼
┌──────────────┐
│   VALIDAR    │ ← rodar suite afetada; integração se aplicável
└──────┬───────┘
       ▼
┌──────────────┐
│  COMMITAR    │ ← apenas se TUDO passou
└──────────────┘
```

## Detalhamento

### INVESTIGAR
- Ler todos os arquivos relevantes antes de qualquer ação
- Identificar a causa raiz, não apenas o sintoma
- Verificar se o problema já foi resolvido em commit anterior (`git log -p`)
- Mapear dependências (quem chama, quem consome)
- Documentar o que foi encontrado

### PLANEJAR
- Descrever a mudança em texto ANTES de qualquer edit
- Listar arquivos afetados e linhas específicas
- Listar arquivos que NÃO serão tocados
- Identificar riscos e efeitos colaterais
- Para tarefa não-trivial: salvar plano (ver `@.claude/rules/planejamento-obrigatorio.md`)

### TESTAR (antes de implementar)
- Criar toy/unit test que valide a mudança pretendida
- O teste deve ser SIMPLES e FOCADO em uma única função/comportamento
- Para mudanças em código existente: escrever teste que **falha agora** e deve **passar depois** da correção
- Localização: `tests/toy_*.py` (sintético, <30s) ou `tests/unit_*.py` (dados reais, <2min)

### VERIFICAR
- Rodar APENAS o teste criado (não a suite inteira ainda)
- Se passar inesperadamente: entender por quê (já funciona? teste mal escrito?)
- Se falhar: a falha corresponde ao problema investigado?

### DECIDIR — Checklist de certeza absoluta

Pode sair do loop APENAS quando TODOS forem verdadeiros:

- [ ] Entendo a causa raiz do problema (não apenas o sintoma)
- [ ] A solução proposta resolve a causa raiz
- [ ] Tenho um teste que prova que a solução funciona
- [ ] Sei exatamente quais arquivos e linhas serão alterados
- [ ] A mudança é mínima e não toca áreas fora do escopo
- [ ] Não vou introduzir regressões em outras partes do sistema

Se QUALQUER resposta for NÃO: **voltar ao início do ciclo.**

### IMPLEMENTAR
- Seguir o plano aprovado, sem desvios
- Uma mudança por vez
- Verificar após cada mudança
- Se algo inesperado ocorrer: PARAR e reportar à pessoa usuária

### VALIDAR
- Rodar o teste criado (deve passar)
- Rodar a suite que cobre a área afetada
- Para mudanças em pipeline: rodar integração com subset (ver `@.claude/rules/pipeline-reproducible.md`)
- Para mudanças em schema: validar `data/derived/*.json` contra `context/policies-schema.json`

### COMMITAR
- Só se tudo passou
- Mensagem objetiva em PT-BR
- Sem menção a Claude/AI no commit, código ou docs

## Hierarquia de testes

### Nível 1 — Toy test (obrigatório para toda mudança)

Script autônomo (Python ou outra linguagem) que:
- Cria dados sintéticos OU usa subset mínimo de dados reais
- Executa APENAS a função alterada
- Verifica resultado com `assert` ou comparação explícita
- Roda em **< 30 segundos**
- Sem rede, sem I/O pesado

Localização: `tests/toy_<funcao>.py`

```python
# Exemplo: tests/toy_normalize_esfera.py
"""Toy test para normalize_esfera()."""
from etl.normalize import normalize_esfera

# Casos com drift ortográfico
casos = {
    "Estadual:: SEDUC": "Estadual: SEDUC",
    "Estadual – SEDUC": "Estadual: SEDUC",  # en-dash
    "estadual: seduc": "Estadual: SEDUC",
}
for entrada, esperado in casos.items():
    saida = normalize_esfera(entrada)
    assert saida == esperado, f"{entrada!r} → {saida!r}, esperava {esperado!r}"

print("PASS: toy_normalize_esfera")
```

### Nível 2 — Unit test com dados reais (recomendado)

- Usa dados reais mínimos (10 fichas, 1/UF + federal)
- Roda em **< 2 minutos**
- Localização: `tests/unit_<funcao>.py`

### Nível 3 — Integração (só após níveis 1 e 2)

- Pipeline completo ou build completo
- Só rodar quando níveis 1 e 2 passaram
- Localização: `tests/integration_<pipeline>.py`

## Protocolo de debug em falha

1. **Ler a mensagem de erro COMPLETA** — não pular o stacktrace
2. **Identificar a linha exata** do erro (número + arquivo)
3. **Criar um teste AINDA MENOR** que reproduz o erro isoladamente
4. **Investigar a causa raiz** — ler o código-fonte da função que falhou
5. **Corrigir no toy test primeiro** — só depois aplicar ao real
6. **NUNCA** entrar em loop cego: editar → rodar → falhou → editar → rodar (sinal de que faltou investigação)

## O que é proibido

- Implementar uma mudança sem teste prévio
- Pular o loop de investigação ("já sei o que fazer")
- Editar código real antes de ter um teste que valide a intenção
- Fazer "fix" iterativo cego sem parar para investigar a causa raiz
- Rodar testes de integração como substituto de toy test focado
- Commitar com testes falhando ou warnings novos
- Editar uma função compartilhada como atalho para fazer o teste passar

## Exceções (NÃO requerem o ciclo completo)

- Correção de typo em documentação (1 linha, sem lógica)
- Atualização de URL em link
- Adicionar/remover item de `.gitignore`
- Editar `CLAUDE.md`, `MEMORY.md`, ou arquivo em `.claude/` que NÃO seja `rules/` ou `hooks/`

Para tudo mais, o ciclo é obrigatório.

## Política de tracking de testes

- `tests/toy_*.py` e `tests/unit_*.py` — **versionados em git**, rodam no CI
- `tests/integration_*.py` — versionados; podem ser marcados `@slow` e rodar manual
- `tests/.tmp/` e `tests/benchmarks/` — gitignored

## Relação com outras regras

- `@.claude/rules/mudancas-minimas-cirurgicas.md` — escopo da mudança
- `@.claude/rules/planejamento-obrigatorio.md` — quando o plano é obrigatório
- `@.claude/rules/pipeline-python-etl.md` — convenções específicas da stack Python
- `@.claude/rules/pipeline-reproducible.md` — testes de pipeline (ETL → JSON)

Em conflito, **esta regra prevalece** sobre todas as outras.