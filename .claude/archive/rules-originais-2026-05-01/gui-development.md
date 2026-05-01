---
paths:
  - "transcribe_pipeline/review_studio_qt.py"
  - "transcribe_pipeline/app_service.py"
  - "transcribe_pipeline/project_store.py"
  - "transcribe_pipeline/review_store.py"
  - "transcribe_pipeline/status.py"
---

# Regras para desenvolvimento GUI (PySide6/Qt)

## Convencoes de UI
- Nome do app: "Transcritorio" (com acento). Nunca usar "Infocitizen" na UI.
- Barra principal: `Adicionar midia...`, `Transcrever`, `Salvar transcricao`, `Exportar...`
- Termos proibidos na UI: `QC`, `manifesto`, `fundir`, `merge`, `canonical`
- Termos corretos: `Arquivos do projeto` (nao `Entrevistas`), `Verificar arquivos` (nao `QC`), `Rotulo` (apelido exibido na lista), `Ordem manual`
- Menus: `Projeto`, `Arquivos`, `Arquivo aberto`, `Configuracoes`, `Ajuda`
- `Ferramentas` para fila de processamento e configuracao do motor
- Menu contextual na tabela de arquivos: clique direito → `Renomear rotulo...`, separador, `Mover arquivo para cima/baixo`, separador, `Apagar transcricao...`. Em area vazia, nao mostrar menu.

## Atalhos de teclado reservados
- `F5`: recarregar lista
- `Ctrl+O`: abrir arquivo
- `Ctrl+S`: salvar transcricao
- `Ctrl+Shift+S`: exportar como
- `Ctrl+Z` / `Ctrl+Y`: undo/redo do editor de turnos
- `F2`: renomear rotulo (ancorado na `interview_table`)
- `Ctrl+Alt+Up` / `Ctrl+Alt+Down`: reordenar arquivo (ancorado na `interview_table`)
- `Del`: mover arquivo selecionado para lixeira (ancorado na `interview_table`)
- `Ctrl+Z` (com foco na `interview_table`): desfaz ultima exclusao da sessao
- `Ctrl+Shift+Z` (com foco na `interview_table`): refaz ultima exclusao desfeita
- `Ctrl+Left` / `Ctrl+Right`: navegacao de audio

## Padroes tecnicos
- Selecao na `interview_table`: `ExtendedSelection` + `SelectRows`; items com `ItemIsSelectable`; regra Explorer via `effective_target_ids(cursor_row)` — checkbox > selecao visual > cursor. Funcoes puras em `_compute_effective_target_ids`, `_sanitize_rename_title`, `project_store._reorder_move`, `project_store._merge_interview_order`.
- Persistencia de ordem: `interview_order` e `manual_order_active` em `project.json` (via `project_store.normalize_project` defaults). Click em cabecalho de coluna desativa ordem manual.
- Menu contextual via `setContextMenuPolicy(Qt.ContextMenuPolicy.CustomContextMenu)` + `customContextMenuRequested`. Posicao: `viewport().mapToGlobal(pos)`. Tratar `pos` invalido (Shift+F10) via `visualItemRect(currentItem()).center()`.
- Actions da `interview_table` com `ShortcutContext.WidgetWithChildrenShortcut` devem ser anexadas via `interview_table.addAction(...)` para o atalho so disparar com foco na tabela.
- blockSignals(True) ao popular widgets programaticamente
- Sinais/slots: preferir conexoes tipadas
- Splitter vertical ajustavel para player/waveform, tabela de turnos, editor
- Player: ocultar painel de video para arquivos de audio puro
- Waveform: resolucao alta, antialiasing, zoom ancorado no cursor, regua de tempo
- Progresso: ponderado por etapa, percentuais reais do WhisperX, sem texto bruto no status
- Salvamento: estados persistentes (`Alteracoes pendentes`, `Salvando`, `Salvo`, `Erro`)

## review_studio_qt.py e muito grande (~2900 linhas)
- Ao editar, ler as secoes vizinhas para nao quebrar logica existente
- Ao adicionar features, verificar se ja nao existe algo semelhante
- Cuidado com imports duplicados e widgets orfaos
