---
descricao: Decisão arquitetural — captura por snapshot integral content-addressable, não live fetch. TTLs por tipo, revalidação HEAD+304, versionamento sem sobrescrita.
escopo: arquitetura · captura
versao: 1.0
ultima_revisao: 2026-05-01
---

# Estratégia de Captura

Decisão arquitetural sobre **como** o site armazena e serve o conteúdo externo (leis, decretos, portarias, páginas de programas) referenciado pelas fichas.

## Contexto

O catálogo tem ~412 links externos para portais governamentais (planalto, gov.br, in.gov.br, secretarias estaduais). Esses recursos têm três problemas conhecidos:

1. **Link rot** — gov.br migrou estrutura em 2020-2023, várias URLs antigas estão quebradas
2. **Disponibilidade** — portais governamentais têm períodos de instabilidade
3. **Versão** — uma lei consultada em 2026 pode ter sido revogada/alterada em 2028; precisamos preservar **qual versão** o pesquisador citou

## Decisão

**Snapshot integral content-addressable, não live fetch.**

Para cada URL referenciada por uma ficha:

1. Capturamos o conteúdo bruto (HTML, PDF, DOCX) **uma vez**
2. Armazenamos em `data/external_snapshots/<sha256[:2]>/<sha256>.<ext>` (nome = hash dos bytes)
3. Geramos metadata em `data/extracted_text/<sha256>.metadata.json`
4. O site referencia o snapshot local; o link externo está disponível como "ver na fonte original"
5. Revalidação periódica detecta mudança; nova versão = novo snapshot, antigo preservado

## Alternativas consideradas

### Alternativa A — Live fetch a cada request

Site faz `WebFetch` a cada visualização.

- Pró: sempre conteúdo "atual"
- Contra: lento, dependente de gov.br estar no ar; viola rate limit dos portais; impossível citar versão estável; sem auditoria histórica
- **Rejeitada**: incompatível com `@.claude/rules/captura-responsavel.md` R3 (rate limit) e R6 (versionamento).

### Alternativa B — Cache HTTP com TTL curto (1h–24h)

Proxy HTTP com cache; revalida regularmente.

- Pró: balanceia atualidade e carga
- Contra: ainda depende de gov.br no ar quando cache expira; sem versionamento histórico
- **Rejeitada**: não resolve link rot histórico.

### Alternativa C — Snapshot integral content-addressable (escolhida)

Cópia integral; nome = hash; versionamento natural.

- Pró: independente de gov.br após captura; auditoria histórica completa; deduplicação automática (mesmo hash = mesmo conteúdo); citação estável
- Contra: armazenamento (estimativa: ~825MB em 5 anos — trivial); precisa pipeline de revalidação
- **Escolhida**.

## Justificativa

1. **Acadêmico exige citação versionada** — pesquisador cita "PRONATEC conforme texto vigente em 2026-05-01"; o snapshot prova que aquele texto existia naquela data.
2. **Disponibilidade independente** — site funciona mesmo se gov.br cair.
3. **Custo trivial** — 412 docs × 2 versões/ano × 200KB médio = ~165MB/ano; em 5 anos ~825MB.
4. **Auditoria** — content-addressable + log JSONL = trilha completa.
5. **Conformidade legal** — Lei 9.610 art. 8º IV cobre reprodução; LAI ampara captura automatizada (`@.claude/rules/captura-responsavel.md`).

## TTLs por tipo de documento

Define quando revalidar:

| Tipo | TTL | Justificativa |
|---|---|---|
| Lei federal vigente | **365 dias** | Mudam raramente; quando mudam é por nova lei explícita |
| Decreto presidencial | **180 dias** | Mais rotativos; revisões editoriais |
| Portaria, IN | **90 dias** | Frequência alta de revisão/revogação |
| Página de programa governamental | **30 dias** | Conteúdo institucional muda (descrição, beneficiários, calendário) |
| Edição específica do DOU (data fixa) | **infinito** | Edição diária imutável |

## Revalidação: HEAD + 304

Pipeline mensal (cron ou GitHub Actions agendado) executa para cada snapshot próximo ou após o TTL:

1. **HEAD request** com headers `If-Modified-Since` (`Last-Modified` armazenado) e `If-None-Match` (`ETag` armazenado)
2. Se `304 Not Modified` → atualizar `ultimo_visto` na metadata e seguir
3. Se `200 OK` (cache miss) → comparar `Last-Modified`/`ETag` retornados; se mudaram, fazer GET completo
4. Se headers ausentes (comum em gov.br): GET completo + comparar SHA-256 dos bytes
5. Se SHA mudou:
   - salvar novo snapshot
   - atualizar `superseded_by_sha256` no antigo
   - manter o antigo arquivado
   - registrar evento em log

## Versionamento sem sobrescrita

```
data/external_snapshots/
├── ab/
│   ├── ab12cd...html        # capturado 2026-05-01, sha completo
│   └── ab12cd...html.meta.json
├── 7f/
│   ├── 7f00....pdf          # capturado 2026-08-15
│   └── 7f00....pdf.meta.json
└── index.json               # sha → {url_canonical, tipo, ...}
```

Cada snapshot tem metadata:

```json
{
  "sha256": "ab12cd...",
  "url_canonical": "https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2011/lei/l12513.htm",
  "url_capturada": "https://...",
  "data_captura_iso": "2026-05-01T14:23:00-03:00",
  "ultimo_visto_iso": "2026-08-01T09:00:00-03:00",
  "tipo": "lei",
  "content_type": "text/html; charset=utf-8",
  "tamanho_bytes": 45231,
  "encoding": "utf-8",
  "atribuicao": "Brasil. Presidência da República. Casa Civil.",
  "validacao_passou": true,
  "contem_pii": false,
  "superseded_by_sha256": null,
  "supersedes_sha256": null,
  "ttl_dias": 365
}
```

## Estimativa de armazenamento

- 412 URLs × 1ª captura = 412 snapshots
- ~30% mudam por ano → ~125 novas versões/ano
- Média 200KB/snapshot
- Em 5 anos: 412 + 5×125 = ~1037 snapshots × 200KB = **~207MB**
- Pico (incluindo PDFs maiores): ~825MB

Trivial frente ao Drive (15GB+) e a hosting típico.

## Quando capturar

1. **Carga inicial (Bloco D)** — capturar todos os 412 links da onda 1 antes do site ir ao ar
2. **Adição de ficha nova** — capturar imediatamente
3. **Revalidação periódica** — cron mensal verifica TTLs vencidos
4. **Sob demanda** — pessoa usuária pode forçar `just recapture <slug>` (Bloco D)

## Limites e exceções documentadas

- **Conteúdo que exige JavaScript** (raro em portais governamentais oficiais): `playwright` como fallback caso a caso, **com aprovação humana** e documentação em `decisions/`.
- **PDF muito grande** (>50MB): alerta para revisão; capturar streaming e talvez não OCR'ar todo.
- **Conteúdo dinâmico (consultas em formulário)** (ex.: SEI, e-MEC): NÃO capturar; armazenar URL + nota explicativa.
- **Conteúdo com PII** (>5 ocorrências de CPF/CNPJ): snapshot bruto arquivado com `contem_pii: true`; **não** disponibilizado na busca interna.

## Falhas previstas e tratamento

| Falha | Tratamento |
|---|---|
| 404 (link morto) | Marcar `link_status: 404` na ficha; tentar Wayback Machine como fallback (Bloco D) |
| 5xx | Backoff + retry; se persistir, marcar `link_status: instavel`, reagendar 24h |
| robots.txt bloqueia | Marcar `bloqueado_robots`; não capturar; documentar |
| SHA igual em revalidação | Atualizar `ultimo_visto`; não criar nova versão |
| Validação falha (página de erro retornando 200) | Não promover snapshot; marcar suspeito; revisão humana |

## Próximos passos

- **Bloco D** — implementar a skill `capturar-norma` (estrutura definida em `@.claude/rules/captura-responsavel.md`)
- **Bloco D.3** — implementar pipeline de revalidação (cron + relatório de mudanças)
- **Bloco G** — dashboard simples de monitoramento link rot

## Trade-offs aceitos

- **Espaço de disco** vs. independência: aceito (espaço é barato)
- **Captura inicial demorada** (412 URLs × 2s = ~14min puro; mais com retries) vs. site sempre disponível: aceito (carga inicial é one-shot)
- **Complexidade do pipeline de revalidação** vs. precisão de "qual versão estava vigente": aceito (núcleo do projeto acadêmico)