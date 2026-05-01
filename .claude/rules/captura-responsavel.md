---
descricao: Regras invioláveis para captura de conteúdo público brasileiro. User-Agent identificável, robots.txt, rate limiting, snapshot integral, atribuição, PII, fundamentação legal.
escopo: captura externa
versao: 1.0
ultima_revisao: 2026-05-01
paths:
  - "scripts/captura/**"
  - "data/external_snapshots/**"
  - "data/extracted_text/**"
---

# Captura Responsável

**Status:** OBRIGATÓRIA · **Escopo:** todo código que faz HTTP request a portal externo no projeto

Toda captura deve ser **auditável, identificável, respeitosa e juridicamente fundamentada**.

## Princípios

1. **Transparência** — tráfego identificável nos logs do servidor remoto
2. **Reprodutibilidade** — snapshot integral preserva o conteúdo no momento da captura
3. **Cidadania de rede** — respeitar limites declarados (`robots.txt`, `Crawl-delay`, `Retry-After`) e implícitos (não hammer)
4. **Fundamento legal** — Lei 9.610/98 art. 8º IV; Lei 12.527/11 (LAI); Lei 13.709/18 (LGPD); Decreto 8.777/16 (dados abertos)

## Fundamentação legal

### Lei 9.610/1998 — Direitos Autorais

**Art. 8º** — NÃO são objeto de proteção como direitos autorais:
- IV — **textos de tratados, convenções, leis, decretos, regulamentos, decisões judiciais e demais atos oficiais**

→ Nosso corpus (leis, decretos, portarias, INs, resoluções) **não tem barreira autoral**. Reprodução do texto integral é livre.

**Art. 46** — autoriza citação para estudo/crítica/polêmica e reprodução para uso pessoal/acadêmico sem fins lucrativos.

### Lei 12.527/2011 — Lei de Acesso à Informação (LAI)

- **Art. 7º** assegura acesso a informação produzida ou custodiada por órgão público
- **Art. 8º §3º III** exige publicação em **formato aberto, estruturado, legível por máquina**, e permite **acesso automatizado por sistemas externos**

→ A LAI **ampara explicitamente o scraping** de conteúdo público.

### Lei 13.709/2018 — LGPD

- **Art. 7º §4º** dispensa consentimento para dados manifestamente públicos
- **Art. 4º II** isenta tratamento exclusivamente acadêmico

→ Cobre uso acadêmico. Riscos: páginas que listam beneficiários por CPF/nome; editais com servidores. **Mitigação obrigatória** = filtro PII (R8).

### Decreto 8.777/2016 — Dados Abertos

Define dados abertos como acessíveis "sob licença que permite livre utilização, **limitando-se a creditar autoria/fonte**".

→ Confirma: conteúdo gov.br livre com atribuição.

## Regras invioláveis

### R1. User-Agent identificável

Todo request DEVE enviar:

```
User-Agent: FRM-CatalogoPoliticas/<versao> (+<url-projeto>; mailto:rogerio.barbosa@iesp.uerj.br) python-httpx/<versao>
```

**PROIBIDO:** imitar navegador, ocultar identidade, usar tokens `GPT`, `Claude`, `Bot`, `AI` (in.gov.br bloqueia esses tokens via robots.txt).

### R2. Robots.txt

Antes de capturar URL de domínio novo: baixar e respeitar `<dominio>/robots.txt`. Cachear 24h.

- `Disallow` para nosso UA OU para `*` ⇒ pular URL, logar `bloqueado_robots`
- `Crawl-delay` ⇒ usar como intervalo mínimo entre requests (Senado declara `10`)
- Sem robots.txt ⇒ default conservador 1 req / 2s

### R3. Rate limiting

| Cenário | Valor |
|---|---|
| Default global por domínio | **1 req / 2s** (0.5 RPS) |
| Concorrência por domínio | **1 conexão simultânea** |
| Domínios em paralelo | até 5 |
| 429/503 | backoff exponencial 2s, 4s, 8s, 16s, 32s + jitter ±25% |
| `Retry-After` no header | sempre respeitar |
| Tentativas máximas por URL | 5 |

### R4. Timeouts

- Connect: 10s · Read: 30s · Total: 60s
- Em timeout: retry com backoff (R3)

### R5. Snapshot integral, content-addressable

Salvar bytes brutos (não texto extraído) em:

```
data/external_snapshots/<sha256[:2]>/<sha256>.<ext>
```

Metadata em `data/extracted_text/<sha256>.metadata.json`.

### R6. Versionamento, nunca sobrescrever

Se nova captura tiver SHA diferente:
- criar novo snapshot
- atualizar `superseded_by_sha256` no antigo
- **NUNCA** deletar snapshot

Detalhes em `@.claude/rules/protecao-fontes.md` R5.

### R7. Validação obrigatória pré-armazenamento

Antes de marcar snapshot como válido:
- Status HTTP final = 200
- Tamanho ≥ 1KB (HTML) ou ≥ 5KB (PDF)
- Sem regex de página de erro: `/(página\s+não\s+encontrada|erro\s+404|acesso\s+negado)/i`
- Para `lei`: contém `Art\.|Artigo`
- Para `portaria`: contém `PORTARIA\s+N`

Se falhar: NÃO marcar como válido; logar `validacao_falhou`.

### R8. PII e LGPD

ANTES de extrair texto:
- Regex CPF: `\d{3}\.\d{3}\.\d{3}-\d{2}`
- Regex CNPJ: `\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2}`

Se > 5 ocorrências:
- marcar `contem_pii: true` na metadata
- NÃO incluir no corpus de análise interna
- Snapshot bruto continua arquivado **com flag**, nunca republicado

### R9. Atribuição obrigatória em metadata

Campo `atribuicao` obrigatório. Defaults por domínio:

| Domínio | Atribuição |
|---|---|
| `planalto.gov.br` | "Brasil. Presidência da República. Casa Civil." |
| `gov.br` | "Governo Federal — gov.br (CC BY-ND 3.0)" |
| `in.gov.br` | "Diário Oficial da União — Imprensa Nacional" |
| `camara.leg.br` | "Câmara dos Deputados" |
| `senado.leg.br` | "Senado Federal" |
| `mec.gov.br` | "Ministério da Educação" |
| `educacao.<uf>.gov.br` | "Secretaria de Educação do Estado do <UF>" |

### R10. Logs de captura

Cada request gera 1 linha JSONL em `logs/captura_<YYYY-MM-DD>.jsonl`:

```json
{
  "timestamp_iso": "2026-05-01T14:23:01-03:00",
  "url_solicitada": "https://...",
  "url_final": "https://...",
  "http_status": 200,
  "content_type": "text/html; charset=utf-8",
  "sha256": "ab12cd...",
  "tamanho_bytes": 45231,
  "tempo_ms": 1342,
  "encoding": "utf-8",
  "validacao_passou": true,
  "caminho_snapshot": "data/external_snapshots/ab/ab12cd...html",
  "retries": 0,
  "erro_tipo": null,
  "erro_msg": null
}
```

### R11. Proibido

- Anti-detection (`cloudscraper`, `undetected-chromedriver`, fingerprint spoofing)
- Rotação de IP / proxies
- Capturar páginas que listem dados pessoais nominais como conteúdo principal
- Re-distribuir snapshot bruto sem cuidados (corpus interno, não republicado)
- Usar User-Agent de navegador (Mozilla/Chrome) ou genérico

## TTL por tipo de documento

Define quando re-capturar:

| Tipo | TTL | Justificativa |
|---|---|---|
| Lei federal vigente | **365d** | Mudam raramente |
| Decreto presidencial | **180d** | Mais rotativos |
| Portaria, IN | **90d** | Frequência alta de revisão/revogação |
| Página de programa governamental | **30d** | Conteúdo institucional muda |
| Edição específica do DOU | **infinito** | Edição diária imutável |

Estratégia de revalidação detalhada em `@.claude/architecture/captura-estrategia.md`.

## Stack de captura

Detalhes em `@.claude/rules/pipeline-python-etl.md`. Resumo:

- HTTP: `httpx` (HTTP/2)
- Robots: `urllib.robotparser` (stdlib) + parsing manual de `Crawl-delay`
- Retry: `tenacity` (decorators)
- HTML extraction: `trafilatura`
- PDF: `pdfplumber` (texto-nativo) + `ocrmypdf` (escaneado)
- DOCX: `python-docx`; DOC legado: `libreoffice --headless`
- Encoding: `charset-normalizer`
- MIME magic: `puremagic`
- Hash: `hashlib.sha256` (stdlib)

## Auditoria

Toda mudança nesta regra requer revisão humana e atualização da skill `capturar-norma` (Bloco D). Versão atual: 1.0 · 2026-05-01.

## Relação com outras regras

- `@.claude/rules/protecao-fontes.md` — imutabilidade dos snapshots
- `@.claude/rules/pipeline-python-etl.md` — stack Python, encoding, paths
- `@.claude/architecture/captura-estrategia.md` — racional snapshot vs. live; TTLs; revalidação
- `@.claude/architecture/privacidade-lgpd.md` — política LGPD do projeto