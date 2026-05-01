---
paths:
  - "**"
---

# Fluxo Plano-Primeiro

**Status:** OBRIGATORIA
**Estabelecida:** 2026-04-15
**Escopo:** Todo o projeto Transcritorio

**Para qualquer tarefa nao-trivial, entrar em modo planejamento antes de escrever codigo.**

## O Protocolo

1. **Entrar em modo plano** — usar `EnterPlanMode`
2. **Consultar MEMORY.md** — ler entradas relevantes a tarefa
3. **Redigir o plano** — quais mudancas, em quais arquivos, em que ordem
4. **Salvar em disco** — gravar em `.claude/plans/YYYY-MM-DD_descricao-curta.md`
5. **Apresentar ao usuario** — aguardar aprovacao via `ExitPlanMode`
6. **Implementar** — seguir o plano aprovado, sem desvios
7. **Atualizar MEMORY.md** — registrar decisoes e descobertas relevantes

## Planos em Disco

Planos sobrevivem a compressao de contexto. Salvar todo plano em:

```
.claude/plans/YYYY-MM-DD_descricao-curta.md
```

Formato do arquivo de plano:

```markdown
# Plano: [titulo]

**Status**: RASCUNHO | APROVADO | CONCLUIDO
**Data**: YYYY-MM-DD

## Objetivo
[O que sera feito e por que]

## Abordagem
[Como sera feito — passos concretos]

## Arquivos a modificar
- [ ] transcribe_pipeline/[modulo].py — [o que muda]
- [ ] packaging/[arquivo] — [o que muda]

## Arquivos que NAO serao tocados
- [lista explicita do que esta fora do escopo]

## Verificacao
- [ ] Unit test criado e passando
- [ ] Funcionalidade testada manualmente
- [ ] Build/packaging verificado (se aplicavel)
- [ ] MEMORY.md atualizado
```

## O que e nao-trivial (REQUER plano)

- Qualquer mudanca no build/packaging (build.ps1, .spec, .iss)
- Mudancas em funcoes compartilhadas (ver tabela em development-procedure.md)
- Qualquer mudanca que afete mais de 2 arquivos
- Mudancas na GUI (review_studio_qt.py)
- Adicionar nova feature ao pipeline
- Corrigir bug que afeta multiplos modulos
- Qualquer alteracao em runtime.py, config.py, whisperx_runner.py

## O que e trivial (sem plano necessario)

- Corrigir typo em arquivo unico
- Adicionar comentario ou documentacao
- Atualizar MEMORY.md ou .claude/ files
- Ler e reportar estado de arquivos
- Responder perguntas sobre o codigo

## Regras durante implementacao

- **Seguir o plano aprovado** — nao adicionar extras nao planejados
- **Se surgir necessidade de mudanca adicional**: PARAR, reportar ao
  usuario, e pedir para expandir o plano
- **Se um teste falha durante implementacao**: PARAR, reportar ao
  usuario, nao tentar fixes nao planejados
- **Marcar cada item do plano como concluido** conforme progresso
