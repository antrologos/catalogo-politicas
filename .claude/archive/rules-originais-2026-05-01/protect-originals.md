---
paths:
  - "**"
---

# Protecao de originais de projetos

Ao trabalhar em projetos abertos pelo Transcritorio:
- Arquivos de audio, video, TCLEs e imagens originais nunca devem ser alterados.
- Derivados devem ser gravados em `Transcricoes/` dentro do projeto.
- Este repositorio contem apenas o software; dados de pesquisa ficam nos projetos.

## Excecao aprovada: feature "Mover para lixeira" (2026-04-19)

A acao "Mover para lixeira" (Del na lista de arquivos) MOVE (nao apaga) o arquivo
original para `00_project/.trash/<trash_id>/files/` dentro do projeto. Criterios:

- Reversivel via Ctrl+Z na sessao atual (restaura o arquivo ao caminho original).
- Refazivel via Ctrl+Shift+Z.
- Ao fechar o projeto, o usuario e perguntado se deseja apagar definitivamente os
  itens da lixeira criados na sessao. Default: "Manter".
- Arquivos em `.trash/` podem ser recuperados manualmente via Explorer.
- A qualquer outra operacao automatica (transcricao, render, diarizacao, QC) continua
  vedado deletar ou mover originais.
