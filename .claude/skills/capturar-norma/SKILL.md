---
name: capturar-norma
description: "Captura responsável de URL pública (lei/decreto/portaria/programa) gerando snapshot integral content-addressable + texto extraído + metadata + index.json, conforme @.claude/rules/captura-responsavel.md (R1-R11)"
when_to_use: "Quando uma URL nova precisa ser arquivada no catálogo; em revalidações periódicas; após o usuário identificar link a capturar"
argument-hint: "<url> [--tipo lei|decreto|portaria|instrucao_normativa|resolucao|edital|pagina_programa|outros]"
allowed-tools: "Bash Read"
disable-model-invocation: true
effort: medium
versao: 2.0
---

> **v2.0 (2026-05-01, Bloco D)** — adicionado: GET fallback no 403/405/501 (gov.br WAF anti-HEAD); retry específico para `planalto.gov.br` (timeout 90s + 1 retry); OCR fallback para PDFs escaneados via `ocrmypdf` + Tesseract pt; conversão de DOC legado via LibreOffice headless; ODT via `odfpy`; atualização automática de `data/external_snapshots/index.json`; campos novos no resultado: `extensao`, `ocr_aplicado`, `metodo_http`. Cobertura testes: 14 unit (mock httpx). Pré-requisitos externos: ver `.claude/decisions/2026-05-01_dependencias-externas.md`.

# Skill: capturar-norma

Implementa o protocolo de `@.claude/rules/captura-responsavel.md` (R1-R11) e produz snapshot reprodutível de uma URL pública brasileira.

## Quando usar

- Catálogo registra link novo (lei/decreto/portaria/página de programa) que ainda não tem snapshot local
- Revalidação periódica conforme TTL de `@.claude/architecture/captura-estrategia.md` (lei: 365d; decreto: 180d; portaria: 90d; página: 30d)
- Usuário pede captura pontual durante revisão
- Bloco D usa esta skill em batch

## Quando NÃO usar

- Para coleta exploratória de uma única URL durante chat (use `WebFetch` direto)
- Para conteúdo NÃO listado no catálogo de políticas
- Para sites privados/autenticados (skill é pública, sem credenciais)

## Pré-requisitos

- Python 3.9+
- Dependências: `httpx`, `tenacity`, `trafilatura`, `pdfplumber`, `pypdf`, `python-docx`, `charset-normalizer`, `puremagic` (instaladas via `pip install -r requirements.txt`)
- Estrutura de diretórios: `data/external_snapshots/`, `data/extracted_text/`, `data/logs/` (criadas em C.0)

## Como invocar

### Via slash command (uma URL por vez)
```
/capturar-norma https://www.planalto.gov.br/ccivil_03/leis/l9394.htm --tipo lei
```

### Via Bash direto (batch, em scripts)
```bash
python -B scripts/captura/capturar_norma.py "<url>" --tipo lei
```

### Programaticamente (em outro script)
```python
from capturar_norma import capturar
res = capturar("https://...", tipo_documento="lei")
if res.status == "ok":
    print(res.caminho_snapshot)
```

## Algoritmo (11 etapas — R1-R11)

1. **Robots.txt** (R2): baixa `<dominio>/robots.txt` e verifica `Disallow` para nosso UA. Cache 24h. Captura `Crawl-delay` se presente.
2. **Rate limit** (R3): aguarda 2s desde último request ao mesmo domínio (ou `Crawl-delay` se maior — Senado declara 10s).
3. **GET** (R4): com User-Agent identificável (R1), timeouts (10/30/60s), follow redirects (5 max), backoff em 429/503.
4. **Validação bruta** (R7): status=200, tamanho ≥ 1KB (HTML) ou 5KB (PDF), MIME bate.
5. **Hash SHA-256** (R5): dos bytes brutos. Path canônico `data/external_snapshots/<sha[:2]>/<sha>.<ext>`.
6. **Dedupe content-addressable** (R6): se SHA já existe, retorna `inalterado`. Se novo bytes, salva novo snapshot; antigo permanece com `superseded_by_sha256` (não implementado em v1.0; na re-captura a skill apenas detecta novo SHA).
7. **Extração de texto** por formato:
   - HTML → `trafilatura.extract` (fallback bs4 + lxml)
   - PDF → `pdfplumber` (fallback `pypdf`)
   - DOCX → `python-docx`
   - DOC, ODT, OCR de PDFs escaneados → **NÃO implementados em v1.0** (Bloco D)
8. **Validação extraída** (R7): texto livre de regex de erro (`página não encontrada`, `erro 404`, `acesso negado`).
9. **PII scan** (R8): regex CPF (`\d{3}\.\d{3}\.\d{3}-\d{2}`) e CNPJ (`\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2}`). Se > 5 ocorrências → flag `contem_pii: true` e **NÃO** salvar texto extraído (snapshot bruto continua arquivado para auditoria).
10. **Metadata** (R9): atribuição inferida do domínio (planalto → "Brasil. Presidência da República. Casa Civil.", gov.br → CC BY-ND 3.0, etc.). Salvo em `data/extracted_text/<sha>.metadata.json`.
11. **Log** (R10): linha JSONL em `data/logs/captura_<YYYY-MM-DD>.jsonl` com timestamp, URL, status, sha256, tamanho, tempo, encoding, validação, retries, erro.

## Status retornados

| Status | Significado | Reagendar? |
|---|---|---|
| `ok` | Snapshot novo capturado e validado | Conforme TTL |
| `inalterado` | SHA bate com snapshot existente; só atualiza `ultimo_visto` | Conforme TTL |
| `bloqueado_robots` | robots.txt nega; pular URL | Não (a menos que política mude) |
| `falha_status` | HTTP != 200 (404, 403, 5xx) | 24h (transitório) ou marcar como link morto |
| `falha_rede` | Timeout / DNS / conexão | 1h |
| `validacao_falhou` | Snapshot existe mas texto suspeito (página de erro 200, ou tamanho mínimo violado) | Revisão manual |

## Saídas no filesystem

```
data/external_snapshots/<sha[:2]>/<sha>.<ext>     # bytes brutos imutáveis
data/extracted_text/<sha>.txt                     # texto extraído (se passou validação + sem PII)
data/extracted_text/<sha>.metadata.json           # url_original, atribuição, licença, encoding, etc.
data/logs/captura_<YYYY-MM-DD>.jsonl              # 1 linha por request (auditoria)
data/logs/robots_cache/<host>.txt                 # cache do robots.txt para inspeção
```

## Casos de erro tratados

- URL inválida → erro de validação local antes de network
- Servidor lento (planalto.gov.br) → timeout 30s, marca `falha_rede`
- 404 / 403 / 5xx → `falha_status`, log
- robots.txt 4xx/5xx → assume permissivo (default conservador), continua
- Encoding indetectável → fallback latin-1 com flag
- PDF escaneado (sem texto nativo) → texto vazio; **v2.0 (Bloco D)**: OCR via ocrmypdf
- Conteúdo gigante (>100MB) → **v2.0**: streaming + size limit

## Anti-padrões (R11 — proibido)

- User-Agent contendo "bot", "AI", "Claude", "GPT" (in.gov.br bloqueia via robots.txt)
- Imitar navegador
- Anti-detection: `cloudscraper`, `undetected-chromedriver`, fingerprint spoofing
- Rotação de IP/proxies
- Capturar páginas com listas de PII como conteúdo principal
- Re-distribuir snapshot bruto sem cuidados (corpus interno, não republicado)

## Dependências externas

- `httpx>=0.27` — HTTP/2-aware client
- `trafilatura>=1.10` — extração de texto principal de HTML (F1=0.945)
- `pdfplumber>=0.11` + `pypdf>=4.0` — PDF (com fallback)
- `python-docx>=1.1` — DOCX
- `charset-normalizer>=3.3` — detecção de encoding
- `puremagic>=1.27` — MIME detection (zero deps; melhor que python-magic em Windows)

## Testes esperados

(Implementação em Bloco D quando captura entrar em produção)

1. Captura HTML simples: status `ok`, snapshot existe, texto >100 chars
2. Re-captura mesma URL: status `inalterado` (deduplicado por SHA)
3. URL com robots.txt Disallow: status `bloqueado_robots`
4. URL 404: status `falha_status`, log entry
5. URL com timeout (servidor lento): status `falha_rede`, retry
6. PDF escaneado: snapshot salvo, texto vazio (v1.0); OCR em v2.0

## Riscos e mitigações

- **IP ban por scraping agressivo** → User-Agent identificável; rate-limit 1 req/2s; respeita robots/Crawl-delay
- **Captura de PII** → regex CPF/CNPJ pré-armazenamento; flag e não-publicação se > 5 ocorrências
- **Direitos autorais** → corpus alvo (atos normativos) coberto pela Lei 9.610 art. 8º IV; demais conteúdos com uso citado para fins acadêmicos (art. 46)
- **Link rot** → snapshot local preserva versão capturada; revalidação periódica detecta mudanças

## Conformidade

Esta skill implementa R1-R11 de `@.claude/rules/captura-responsavel.md` v1.0.

**Mudanças que requerem bump de versão e revisão humana:**
- Alterar User-Agent
- Reduzir rate-limit
- Desabilitar PII scan
- Habilitar anti-detection
- Mudar política de versionamento
