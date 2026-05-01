# Plano: Bloco D — Captura integral em escala (com OCR + DOC)

**Status**: CONCLUIDO (2026-05-01)
**Data**: 2026-05-01
**Bloco/Rodada**: D (executável após Blocos A+B+C concluídos)

## Contexto

Bloco C produziu skill `capturar-norma` v1.0 funcional (R1-R11 de captura-responsavel) + amostra de 25 snapshots HTML. Bloco D escala isso: refinamento da skill (GET fallback no 403, OCR, DOC, retry específico para planalto), captura completa das 111 URLs OK + retentativas das 37 forbidden_403 + 12 timeouts, atualização do JSON canônico com snapshot info, e pipeline de re-validação periódica.

## Decisões da usuária (via AskUserQuestion antes deste plano)

1. **Instalar AMBOS Tesseract OCR + LibreOffice** via winget (pipeline 100% completo: HTML+PDF+PDF-escaneado+DOCX+DOC+ODT)
2. **GET fallback automático no 403** (provavelmente recupera 25-30 das 37 forbidden gov.br)
3. **Captura completa de todos OK + retentativas** (~145 snapshots no total) + atualizar fichas JSON com `fonte_arquivo_path` + `fonte_sha256`

## Objetivo

Ampliar a captura para a escala completa do catálogo. Ao final do Bloco D:
- ~145 snapshots em `data/external_snapshots/` (todos os links válidos)
- Schema v0.2 com `fonte_sha256` + `fonte_extensao`
- JSON canônico (re-build) com `fonte_arquivo_path` + `fonte_sha256` preenchidos para fichas capturadas
- Pipeline de re-validação periódica (`just revalidar`)
- Skill `capturar-norma` v2.0 com OCR + DOC + GET fallback

## Abordagem

### D.0 — Setup externo (Tesseract + LibreOffice)

- [ ] `winget install -e --id UB-Mannheim.TesseractOCR.TesseractOCR` (com pacote PT)
- [ ] `winget install -e --id TheDocumentFoundation.LibreOffice`
- [ ] Verificar instalação:
  - `tesseract --version` → mostra versão + linguas instaladas
  - `tesseract --list-langs` → confirma 'por' presente
  - `soffice --version` (LibreOffice headless)
- [ ] Atualizar `requirements.txt` (já tem ocrmypdf; nada a adicionar)
- [ ] Atualizar `CLAUDE.md` seção Convenções com pré-requisitos externos
- [ ] Criar ADR `.claude/decisions/2026-05-01_dependencias-externas.md` documentando

### D.1 — Refinar `capturar-norma` para v2.0

Edição em `scripts/captura/capturar_norma.py`:

- [ ] **GET fallback no 403/405/501**: se HEAD ou GET retornar esses códigos, registrar e tentar (próxima tentativa) com método alternativo. Adicionar contador `retries`.
- [ ] **Retry com backoff específico para `www.planalto.gov.br`**: timeout aumentado (90s read), 1 retry após 30s wait. Configurável por host em `_http_helpers.py`.
- [ ] **OCR via ocrmypdf**: se PDF foi capturado mas `pdfplumber` extraiu < 100 chars de texto:
  - Salvar PDF em `data/external_snapshots/<sha[:2]>/<sha>.pdf`
  - Rodar `ocrmypdf --language por --skip-text --output-type pdf <input> <output_ocr>` (gera versão pesquisável)
  - Re-extrair texto com pdfplumber sobre output OCR
  - Marcar metadata: `ocr_aplicado: true`, `ocr_engine: tesseract+ocrmypdf-{ver}`
- [ ] **DOC legado via libreoffice**: se URL termina em `.doc` ou Content-Type indica msword:
  - Salvar `.doc` em snapshots
  - Subprocess: `soffice --headless --convert-to txt --outdir <tmp> <input.doc>` (timeout 30s)
  - Ler `<tmp>/<input>.txt` como texto extraído
- [ ] **ODT via odfpy**: já em `extract_text()`; testar com arquivo de exemplo
- [ ] **Index.json**: atualizar `data/external_snapshots/index.json` a cada captura nova:
  ```json
  {
    "by_sha": {
      "<sha>": {
        "url_original": "...",
        "url_canonica": "...",
        "extensao": "html",
        "data_captura": "2026-05-01T...",
        "tamanho_bytes": 12345,
        "ocr_aplicado": false,
        "fichas_referenciantes": ["FRM-CP-2026-EDU-0001", "..."]
      }
    },
    "by_url": {
      "<url_canonica>": "<sha>"
    },
    "ultima_atualizacao": "2026-05-01T..."
  }
  ```
- [ ] Atualizar `.claude/skills/capturar-norma/SKILL.md` para v2.0 (frontmatter `versao: 2.0`); documentar OCR/DOC/index.json
- [ ] **Plan mode obrigatório** porque toca `.claude/skills/`

### D.2 — Re-validar URLs problemáticas

Editar `scripts/captura/validar_links.py` para usar GET fallback no 403, depois:

- [ ] `python -B scripts/captura/validar_links.py --apenas-falhas` (lê CSV anterior, re-tenta os não-200)
- [ ] Salvar `data/derived/links-validados-onda-1-<data>-retry.csv`
- [ ] Esperado: recuperar 25-30 forbidden + 5-8 timeouts; `not_found_404` permanecem (genuinamente quebrados)

### D.3 — Captura completa de todos OK (~145 URLs)

- [ ] Editar `scripts/captura/capturar_amostra.py` ou criar `scripts/captura/capturar_completo.py` que:
  - Lê `links-validados-onda-1-*-retry.csv`
  - Filtra por status_class ∈ {ok_200, redirect_3xx}
  - Para cada URL: invoca `capturar()` (compartilha RobotsCache e RateLimiter)
  - Mostra progresso a cada 10 URLs
  - Tempo estimado: 145 × 2s = ~5 min + tempo de captura ≈ 10-15 min
- [ ] Saída: `data/derived/captura-completa-<data>.json`
- [ ] Adicionar target `just capturar-completo` ao justfile

### D.4 — Schema v0.2 + re-build JSON com snapshot info

- [ ] **Plan mode obrigatório** (toca `policies-schema.json`)
- [ ] ADR `.claude/decisions/2026-05-01_schema-v0.2-snapshot-info.md`
- [ ] Editar `policies-schema.json`:
  - Adicionar campo `fonte_sha256` (string nullable, pattern hex 64 chars)
  - Adicionar campo `fonte_extensao` (enum: html|pdf|docx|doc|odt|txt)
  - Adicionar campo `fonte_ocr_aplicado` (boolean, default false)
  - Bumpar `_versao` interna do schema (se houver)
- [ ] Atualizar `scripts/etl/build_json.py`:
  - Carregar `data/external_snapshots/index.json`
  - Para cada ficha cuja `fonte_url` tem snapshot capturado: preencher `fonte_arquivo_path`, `fonte_sha256`, `fonte_extensao`, `fonte_ocr_aplicado`
- [ ] Re-rodar pipeline: `just etl`
- [ ] Verificar via `just validate`: 439/439 fichas válidas no schema v0.2
- [ ] Atualizar `dados-politicas.md` v1.2 (mover `fonte_sha256` etc. de "Evoluções planejadas" para campos atuais)

### D.5 — Pipeline de re-validação periódica

Criar `scripts/captura/revalidar.py`:

- [ ] Lê `data/derived/latest.json` para `proxima_revisao_prevista` < hoje
- [ ] Para cada ficha devida:
  - HEAD com header `If-Modified-Since: <data_captura_anterior>`
  - Se 304 Not Modified: atualiza apenas `ultima_validacao` em metadata; nada novo
  - Se 200 + Last-Modified mais novo: GET completo, compara SHA do conteúdo
    - Se SHA igual: site enviou Last-Modified errado; só atualiza data_captura
    - Se SHA diferente: nova captura; antigo recebe `superseded_by_sha256: <novo_sha>` no metadata
  - Se erro: log; mantém metadata anterior
- [ ] Saída: `data/derived/revalidacao-<data>.json` + relatório
- [ ] Adicionar target `just revalidar` no justfile
- [ ] Documentar agendamento sugerido em `docs/operacao.md` (cron Linux / Task Scheduler Windows / GitHub Actions semanal)

### D.6 — Testes adicionais

- [ ] Instalar `pytest-httpx` para mock de HTTP nos testes
- [ ] `tests/unit_capturar_norma.py`:
  - test_get_fallback_em_403
  - test_dedupe_por_sha
  - test_pii_scan_flag
  - test_validacao_falhou_em_html_pequeno
- [ ] `tests/unit_ocr.py` (se Tesseract instalado):
  - test_ocr_pdf_escaneado (gera PDF de teste com PIL+ReportLab; aplica ocrmypdf; verifica texto)
  - **Skip se tesseract não disponível** (`@pytest.mark.skipif`)
- [ ] `tests/unit_doc_legado.py` (se LibreOffice instalado):
  - test_doc_para_txt_via_libreoffice
- [ ] `tests/unit_revalidar.py`:
  - test_304_nao_baixa_novamente
  - test_sha_diferente_atualiza_superseded_by
- [ ] Re-rodar `just test`: alvo ≥ 50 testes passando

### D.7 — Relatório consolidado + housekeeping

- [ ] `data/derived/quality-report-bloco-d-2026-05-01.md` com:
  - Snapshots totais (capturados em C + D)
  - % de URLs do catálogo com snapshot
  - % de fichas com `fonte_arquivo_path` preenchido
  - Distribuição por extensão (HTML/PDF/DOCX/DOC/ODT)
  - Quantos OCR aplicados
  - Lista de URLs que falharam permanentemente (404 + erros não-recuperáveis)
- [ ] Atualizar CLAUDE.md (seção "Onde estamos agora" → Bloco D concluído)
- [ ] Atualizar memória (`project_catalogo_politicas.md`) com estado pós-D
- [ ] Status do plano → CONCLUIDO

## Verificação pós-implementação

- [ ] Tesseract + LibreOffice instalados e funcionais
- [ ] Skill `capturar-norma` v2.0 com GET fallback + OCR + DOC
- [ ] ~145 snapshots em `data/external_snapshots/`
- [ ] `index.json` atualizado e consistente
- [ ] Schema v0.2 valida (`just validate` retorna 0 erros)
- [ ] JSON canônico com `fonte_arquivo_path` + `fonte_sha256` para fichas capturadas
- [ ] `just revalidar` roda e produz relatório
- [ ] ≥ 50 testes pytest passam
- [ ] Hook `validate_json_schema` continua bloqueando JSONs inválidos
- [ ] CLAUDE.md, MEMORY.md atualizados; ADRs registrados

## Arquivos a modificar/criar

### Novos
- `scripts/captura/capturar_completo.py` (orquestra captura batch)
- `scripts/captura/revalidar.py`
- `tests/unit_capturar_norma.py`, `unit_ocr.py`, `unit_doc_legado.py`, `unit_revalidar.py`
- `.claude/decisions/2026-05-01_dependencias-externas.md`
- `.claude/decisions/2026-05-01_schema-v0.2-snapshot-info.md`
- `data/derived/captura-completa-<data>.json`
- `data/derived/revalidacao-<data>.json`
- `data/derived/links-validados-onda-1-<data>-retry.csv`
- `data/derived/quality-report-bloco-d-<data>.md`
- `data/external_snapshots/index.json`
- `docs/operacao.md` (agendamento de revalidação)

### Modificados
- `scripts/captura/capturar_norma.py` (v2.0: GET fallback, OCR, DOC, retry planalto)
- `scripts/captura/_http_helpers.py` (config por host)
- `scripts/captura/validar_links.py` (flag `--apenas-falhas`, GET fallback)
- `scripts/etl/build_json.py` (snapshot info via index.json)
- `.claude/context/policies-schema.json` (v0.2: + fonte_sha256, + fonte_extensao, + fonte_ocr_aplicado)
- `.claude/rules/dados-politicas.md` (v1.2)
- `.claude/skills/capturar-norma/SKILL.md` (v2.0)
- `requirements.txt` (verificar ocrmypdf >=)
- `justfile` (+ targets `revalidar`, `capturar-completo`, `instalar-deps-externas`)
- `CLAUDE.md` (Onde estamos agora + Convenções com pré-requisitos)
- Memória do projeto (`project_catalogo_politicas.md`)

### NÃO tocados
- Planilha original em `data/raw/`
- Hooks `block_xlsx_write.py`, `warn_lock_file.py`, `validate_json_schema.py`
- Regras universais (mudancas-minimas, planejamento, ciclo-investigacao, recuperacao-sessao)
- 11 regras antigas em `.claude/archive/`
- Vocabulário canônico v1.0 (já estável)
- ID/slug de fichas existentes (estabilidade)

## Riscos e mitigações

- **winget pode pedir admin** → executar manual se subprocess falhar; instruir no chat
- **Tesseract instalação demora ~3-5 min** → aceitável; pacote pt deve vir com main install
- **LibreOffice instalação ~1 GB** → grande mas tolerável; alternativa: skip DOC se causar problema
- **OCR é lento** (~10-30s por PDF) → para corpus pequeno (<10 PDFs escaneados estimados) é OK
- **planalto.gov.br pode continuar timeout mesmo com retry** → aceitar; marcar como `falha_persistente`; revisar manualmente
- **Schema v0.2 quebra hook validate_json_schema** se campo virar required → manter `fonte_sha256` opcional (nullable)
- **Drive sync com 145 snapshots** → snapshots HTML/PDF estão em `.gitignore` mas SINCAM no Drive; aceitar sync gradual
- **403 que não respondem ao GET** → marcar `forbidden_persistente`; aceitar como link inviável

## Tempo estimado total

- D.0 (winget): 5-10 min
- D.1 (skill v2.0): 30-45 min
- D.2 (re-validar): 5 min
- D.3 (captura completa): 10-15 min
- D.4 (schema v0.2 + rebuild): 15 min
- D.5 (revalidar.py): 20 min
- D.6 (testes): 30 min
- D.7 (relatório + housekeeping): 15 min

**Total: ~2-2.5 horas**

## Relação com outras regras/planos

- `@.claude/rules/captura-responsavel.md` v1.0 (R1-R11; mantém)
- `@.claude/rules/protecao-fontes.md` (R5/R6: snapshots imutáveis, versionamento)
- `@.claude/rules/pipeline-python-etl.md` (httpx, pathlib, encoding)
- `@.claude/rules/pipeline-reproducible.md` (justfile + idempotência)
- `@.claude/rules/dados-politicas.md` v1.1 → v1.2 ao fim de D.4
- `@.claude/rules/planejamento-obrigatorio.md` (D.1, D.4 exigem plan mode próprio)
- `@.claude/architecture/captura-estrategia.md` (TTL por tipo)
- `.claude/plans/2026-05-01_bloco-c-exploracao-dados.md` (plano anterior; CONCLUIDO)
- `C:\Users\antro\.claude\plans\meu-intuito-criar-composed-pixel.md` (plano macro)
