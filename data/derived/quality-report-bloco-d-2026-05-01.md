# Relatório consolidado — Bloco D (Captura integral em escala)

**Data**: 2026-05-01
**Plano**: `.claude/plans/2026-05-01_bloco-d-captura-integral.md`
**Status**: ✅ Concluído (D.0 → D.7)

---

## Sumário executivo

- **Tesseract OCR + LibreOffice** instalados via winget; idioma português baixado (`tessdata_fast/por.traineddata` em `data/external_tools/tessdata/`)
- **Skill `capturar-norma` v2.0** com GET fallback no 403, retry para planalto.gov.br, OCR para PDFs escaneados, suporte DOC/ODT, atualização do `index.json`
- **136 URLs capturadas integralmente** (124 HTML + 12 PDF; 0 PII detectada)
- **242 fichas** (de 439) agora têm snapshot capturado em `data/external_snapshots/` (federais replicadas em UFs compartilham mesma URL)
- **Schema v0.2** com 3 campos novos: `fonte_sha256`, `fonte_extensao`, `fonte_ocr_aplicado`
- **Pipeline de revalidação periódica** funcional (`just revalidar` / `just revalidar-todas`)
- **57/57 testes pytest** passam (43 anteriores + 14 novos do `unit_capturar_norma.py` com mock httpx)
- **0 erros** na validação do JSON canônico contra schema v0.2

---

## D.0 — Setup externo

| Item | Versão | Local |
|---|---|---|
| Tesseract OCR | 5.4.0.20240606 | `C:\Program Files\Tesseract-OCR\` |
| Idioma `por` | tessdata_fast | `data/external_tools/tessdata/por.traineddata` (1.9 MB) |
| LibreOffice | 26.2.2 | `C:\Program Files\LibreOffice\` |
| ocrmypdf | 17.4.2 | pip (`requirements.txt`) |

ADR: `.claude/decisions/2026-05-01_dependencias-externas.md`
Helper: `scripts/captura/_external_tools.py` (paths configuráveis via env vars)

## D.1 — Refinamento `capturar-norma` v2.0

Mudanças em `scripts/captura/capturar_norma.py`:

1. **Timeout específico por host** via `_http_helpers.timeout_for(url)` — `planalto.gov.br` ganha 90s read (default 30s)
2. **Retry com backoff** para planalto: 1 retry após 15s wait
3. **OCR fallback** em PDFs com `< 100 chars` extraídos: `ocrmypdf --language por --skip-text --force-ocr`
4. **DOC legado** via subprocess `soffice --headless --convert-to txt`
5. **ODT** via `odf.opendocument.load` + `teletype.extractText`
6. **DOCX** com extração de tabelas (não só parágrafos)
7. **`index.json`** content-addressable: a cada captura, atualiza `by_sha`, `by_url`, `ultima_atualizacao`
8. **Novos campos no resultado**: `extensao`, `ocr_aplicado`, `metodo_http`
9. **`relative_to(ROOT)` robusto** para testes com tmp_path (fallback para path absoluto)

`scripts/captura/validar_links.py` ganhou:
- GET fallback no 403 (não só 405/501) — recupera muitas gov.br
- Flag `--apenas-falhas` para revalidar só os não-2xx/3xx do CSV anterior

## D.2 — Re-validação de URLs falhas

`just validate-links` (versão `--apenas-falhas`) tentou 71 falhas; recuperou **25 OKs** novos.

| Status | Antes | Depois (consolidado) |
|---|---:|---:|
| `ok_200` | 111 | **136** |
| `forbidden_403` | 37 | 12 |
| `erro_rede` | 18 | 18 |
| `timeout` | 12 | 11 |
| `not_found_404` | 3 | 4 |
| `bloqueado_robots` | 1 | 1 |

CSV final: `data/derived/links-validados-onda-1-2026-05-01-final.csv`

## D.3 — Captura completa (~136 URLs OK)

Script: `scripts/captura/capturar_completo.py` (executado via `just capturar-completo`).

Tempo total: **649s (~11 min)** com rate-limit 1 req/2s por domínio.

| Status | n |
|---|---:|
| `ok` (snapshot novo) | 126 |
| `inalterado` (dedupe via SHA com snapshots da amostra C.3) | 10 |
| **Total OK** | **136** |

| Extensão | n |
|---|---:|
| html | 124 |
| pdf | 12 |

**Estatísticas de qualidade (chars extraídos):**
- mínimo: 0
- mediana: 3678
- média: 19125
- máximo: 562332
- com texto > 0 chars: 135/136
- com texto > 500 chars: 122
- com texto > 2000 chars: 94

**OCR aplicado em produção: 0** — porque dos 12 PDFs, apenas 1 tem texto curto (`<200` chars; PDF do RS de 5 MB que aparenta ser escaneado), e o `ocrmypdf` falhou nele com erro de path do `.hocr` no Windows. Pendência conhecida; tesseract direto via `subprocess` poderia recuperar — fica para Bloco G.

## D.4 — Schema v0.2 + JSON com snapshot info

Schema `policies-schema.json` ganhou 3 campos opcionais:

```json
"fonte_sha256":       { "type": ["string", "null"], "pattern": "^[a-f0-9]{64}$" }
"fonte_extensao":     { "enum": ["html", "pdf", "docx", "doc", "odt", "txt", "json", "xml", null] }
"fonte_ocr_aplicado": { "type": "boolean", "default": false }
```

ADR: `.claude/decisions/2026-05-01_schema-v0.2-snapshot-info.md`

`scripts/etl/build_json.py` agora carrega `index.json` e popula esses 4 campos (mais `fonte_arquivo_path`) para fichas cuja URL foi capturada:

- **242 de 439 fichas (55%)** com snapshot info preenchido
- 197 fichas sem snapshot: 20 sem `fonte_url` real; 71 com falha persistente (403/timeout/404); resto provavelmente com `fonte_url` extraído de campo livre que não bateu com URL canônica do snapshot

Re-validação: **439/439 fichas válidas** contra schema v0.2 (`just validate`). Completude média: **94.5%** (subiu de 94.2 antes).

Regra `dados-politicas.md` bumpada para v1.2: campos novos movidos de "Evoluções planejadas" para "Campos opcionais atuais".

## D.5 — Pipeline de revalidação periódica

`scripts/captura/revalidar.py` + targets `just revalidar` (só `proxima_revisao_prevista < hoje`) e `just revalidar-todas` (ignora data).

Algoritmo:
1. HEAD com timeout específico por host
2. Se 304 Not Modified → atualiza `ultima_validacao` no metadata
3. Se 200 e `Content-Length` igual ao tamanho_bytes anterior → assume inalterado
4. Senão GET completo → comparar SHA → se mudou, captura nova versão e marca antigo com `superseded_by_sha256`

Smoke test (5 fichas): 1 inalterado, 1 atualizado, 3 com 403 (gov.br WAF — pendência menor; HEAD precisa GET fallback aqui também).

Documentação de agendamento (cron / Task Scheduler / GH Actions semanal) fica para Bloco G.

## D.6 — Testes adicionais

`tests/unit_capturar_norma.py` com 14 testes via `pytest-httpx`:

- Captura HTML básica (200, snapshot, texto extraído)
- Dedupe por SHA (re-captura mesma URL → `inalterado`)
- 404 → `falha_status`
- Timeout → `falha_rede`
- Validação falhou para HTML < 1KB
- PII scan: flag se >5 CPFs, não flag se ≤5
- Regex CPF/CNPJ (toy)
- `extract_text` para HTML e TXT
- `update_snapshot_index` cria estrutura e é idempotente

**Total agregado: 57/57 testes passam** (43 do Bloco C + 14 novos), 9.85s.

## D.7 — Housekeeping

- ✅ ADRs registrados (`dependencias-externas`, `schema-v0.2-snapshot-info`)
- ✅ `dados-politicas.md` v1.2
- ✅ `policies-schema.json` v0.2
- ✅ `capturar-norma/SKILL.md` v2.0
- ✅ `requirements.txt` com `pytest-httpx`
- ✅ `justfile` com targets `capturar-completo`, `revalidar`, `revalidar-todas`
- ✅ Plano `.claude/plans/2026-05-01_bloco-d-captura-integral.md` → CONCLUIDO
- ✅ CLAUDE.md "Onde estamos agora" atualizado
- ✅ Memória do projeto atualizada

---

## Pendências conhecidas (Bloco G)

1. **OCR ocrmypdf falha no Windows** com erro `.hocr` not found — workaround: usar `tesseract` direto via subprocess, ou rodar `ocrmypdf` em WSL. 1 PDF afetado (RS plano de educação para PCD).
2. **Revalidação com HEAD em gov.br** retorna 403 — adicionar GET fallback no `revalidar.py` (mesma lógica de `validar_links.py`).
3. **18 erro_rede persistentes** — DNS / SSL não-recuperáveis; provavelmente links com domínio descontinuado (UFJF, IF Sertão, etc.). Decisão: marcar como "indisponível" e seguir.
4. **12 forbidden_403 mesmo após GET fallback** — provavelmente JS challenge ou cookie/session requerido. Aceitar como inviável; fora do escopo de scraping responsável.
5. **11 timeouts persistentes em planalto.gov.br** — servidor instável; mesmo com 90s read + retry. Decisão de longo prazo: capturar via Wayback Machine quando disponível.
6. **3 URLs 404 verdadeiramente quebradas** — registrar `data/annotations/links-quebrados-onda-1.md` para revisora corrigir na fonte (planilha onda 2).
7. **Re-validação periódica** — agendamento (cron/Task Scheduler/GH Actions) ainda não documentado em `docs/operacao.md`.
8. **DOC legado / ODT** — não testados em produção (não há doc com essa extensão na captura completa). Cobertura via testes unitários só.
9. **Schema v0.3** — `schema_version` interno + `base_legal_estruturada` + `publico_alvo_controlado` ficam para evolução futura.

---

## Artefatos gerados no Bloco D

### Snapshots
- `data/external_snapshots/<sha[:2]>/<sha>.html` (124 HTML novos + 24 da amostra C.3 = 148 únicos por SHA)
- `data/external_snapshots/<sha[:2]>/<sha>.pdf` (12 PDFs)
- `data/external_snapshots/index.json` (148 entradas)
- `data/extracted_text/<sha>.txt` + `.metadata.json` (148 textos + metadados)
- `data/logs/captura_2026-05-01.jsonl` (log auditável)
- `data/logs/captura_validacao_2026-05-01-retry.jsonl`
- `data/logs/robots_cache/<host>.txt` (cache 24h dos robots.txt)

### Derivados atualizados
- `data/derived/policies-onda-1-2026-05-01.json` (re-buildado com snapshot info; 439 fichas, 94.5% completude média)
- `data/derived/latest.json` (cópia)
- `data/derived/captura-completa-2026-05-01.json` (resultados de 136 capturas)
- `data/derived/revalidacao-2026-05-01.json` (smoke test)
- `data/derived/links-validados-onda-1-2026-05-01-retry.csv` + `-final.csv`

### Scripts novos
- `scripts/captura/_external_tools.py` (149 linhas)
- `scripts/captura/capturar_completo.py` (88 linhas)
- `scripts/captura/revalidar.py` (137 linhas)

### Scripts modificados
- `scripts/captura/capturar_norma.py` (291 → 562 linhas — refatorado v2.0)
- `scripts/captura/_http_helpers.py` (+ `timeout_for`, host overrides)
- `scripts/captura/validar_links.py` (GET fallback 403 + flag `--apenas-falhas`)
- `scripts/etl/build_json.py` (+ carregamento de `index.json`, populamento de 4 campos)

### Configuração
- `.claude/skills/capturar-norma/SKILL.md` v2.0
- `.claude/context/policies-schema.json` v0.2
- `.claude/rules/dados-politicas.md` v1.2
- `requirements.txt` (+ pytest-httpx)
- `justfile` (+ 3 targets D)

### Testes
- `tests/unit_capturar_norma.py` (14 novos testes; 281 linhas)

### ADRs
- `.claude/decisions/2026-05-01_dependencias-externas.md`
- `.claude/decisions/2026-05-01_schema-v0.2-snapshot-info.md`

### Documentação
- `data/derived/quality-report-bloco-d-2026-05-01.md` (este arquivo)

---

## Próximo bloco lógico

**Bloco E** — Pesquisa UI/UX + benchmark + decisão de stack do site web. Os dados estão prontos: 439 fichas validadas + 148 snapshots integrais + vocabulário canônico fechado.

Material já produzido em Blocos anteriores que alimenta Bloco E:
- `working/R3-A3.2-benchmark-catalogos.md` — 7 wireframes prioritários + 10 catálogos BR + 8 exterior analisados
- Schema v0.2 do JSON canônico (define o que pode aparecer em cada ficha)
- Vocabulário canônico (define filtros facetados possíveis)
- Snapshot info por ficha (define se o site vai exibir texto integral ou só linkar)
