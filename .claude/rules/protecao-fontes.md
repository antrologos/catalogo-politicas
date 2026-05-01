---
descricao: Proteção da planilha-fonte, dos snapshots externos e dos derivados. Hierarquia explícita de fontes; versionamento sem sobrescrita; lock files Excel.
escopo: dados · captura
versao: 1.0
ultima_revisao: 2026-05-01
paths:
  - "data/raw/**"
  - "*.xlsx"
  - "data/external_snapshots/**"
  - "data/derived/**"
---

# Proteção de Fontes

**Status:** OBRIGATÓRIA · **Escopo:** todo dado de origem ou snapshot do projeto

## Princípio

A integridade dos dados de origem é a base de tudo. Originais nunca são alterados in-place. Derivados ficam em pastas próprias, datadas e versionadas. Snapshots externos são imutáveis após captura.

## Hierarquia de fontes (precedência alta → baixa)

Em conflito de informação, prevalece a fonte mais alta:

1. **Original** — `data/raw/Fichas das Políticas - 1ª onda.xlsx` (planilha humana autoritativa)
2. **Snapshot externo** — `data/external_snapshots/<sha[:2]>/<sha>.<ext>` (cópia integral do recurso público)
3. **Derivado canônico** — `data/derived/policies-<onda>-<data>.json` (saída validada do pipeline)
4. **Anotação humana** — `data/annotations/*.md` (notas de revisor; não substituem fonte)

Anotação humana **complementa**, não sobrescreve, dado de fonte. Se anotação contradiz a planilha, registrar em `decisions/` e atualizar a planilha (não o derivado).

## Regras invioláveis

### R1. Planilha-fonte é imutável

`data/raw/Fichas das Políticas - 1ª onda.xlsx` é **fonte primária imutável**.

- Nunca sobrescrever sem confirmação humana explícita por mensagem
- Operações automatizadas (skill, hook, agente) **não podem** abrir, salvar ou alterar a planilha em modo de escrita
- Hook `block_xlsx_write.py` (configurado em `.claude/settings.json`) bloqueia Edit/Write/MultiEdit em `*.xlsx`
- Para alterações reais (próxima onda, correções): a pessoa abre no Excel, salva manualmente, e depois re-roda o pipeline

### R2. Leitura segura do .xlsx

- Usar `openpyxl(read_only=True)` ou `pandas.read_excel(...)` — seguros mesmo com Excel aberto
- Nunca usar `openpyxl.load_workbook(..., read_only=False)` em pipeline automatizado

### R3. Lock files Excel — verificar antes de qualquer operação

Quando o Excel está aberto, gera arquivo de lock `~$Fichas das Políticas - 1ª onda.xlsx`.

- **Antes** de gravar derivado: verificar se lock existe; se sim, **avisar** (não bloquear) que a planilha está aberta — derivado pode capturar versão não salva
- Hook `warn_lock_file.py` (PostToolUse) emite o aviso após Write em `data/derived/*.json`
- Lock file `~$*.xlsx` está no `.gitignore` (ver `@.claude/rules/operacao-drive.md`)

### R4. Derivados em pasta dedicada e datada

Toda saída do pipeline ETL vai para `data/derived/`, com nome contendo onda + tipo + data:

```
data/derived/policies-onda-1-2026-05-01.json
data/derived/policies-onda-1-2026-05-01.csv
data/derived/policies-onda-1-2026-05-15.json    # nova versão
```

- Nunca sobrescrever derivado anterior — sempre nova data
- Symlink `data/derived/latest.json` aponta para a versão mais recente (gerado pelo pipeline)
- Derivado validado contra `context/policies-schema.json` antes de promover a `latest`

### R5. Snapshots externos são imutáveis após captura

Snapshots em `data/external_snapshots/` (HTML/PDF/DOCX baixados de fontes públicas) são **content-addressable** — nome é o SHA-256 dos bytes brutos.

- Nunca editar um snapshot existente (mudaria o hash)
- Nova captura com bytes diferentes → novo snapshot com novo SHA + atualizar `superseded_by_sha256` no antigo
- Snapshot antigo permanece arquivado para auditoria histórica
- Detalhes em `@.claude/rules/captura-responsavel.md` e `@.claude/architecture/captura-estrategia.md`

### R6. Separação dado / edição humana

Dados canônicos (`data/derived/*.json`, `data/external_snapshots/`) são gerados/capturados por código e são **auditáveis**. Anotações de revisor humano vão para `data/annotations/` e nunca se misturam com canônico.

Se um derivado precisa de correção pontual derivada de revisão humana, a correção é feita na **fonte** (planilha) e o pipeline re-gera o derivado. Não editar JSON canônico à mão.

### R7. Versionamento sem sobrescrita

| Tipo de arquivo | Convenção |
|---|---|
| Derivado canônico | `data/derived/<tipo>-onda-<n>-<YYYY-MM-DD>.<ext>` |
| Snapshot externo | `data/external_snapshots/<sha[:2]>/<sha>.<ext>` (content-addressable) |
| Backup completo | `backups/snapshot-<YYYY-MM-DD>.tar.gz` (fora do controle de versão) |
| Anotação | `data/annotations/<tema>-<YYYY-MM-DD>.md` |

### R8. Operações automáticas não deletam

Skills, hooks e agentes nunca deletam arquivos sob `data/raw/`, `data/external_snapshots/`, ou `data/derived/`. Deleção é ação humana via Explorer/CLI consciente.

## Estrutura de diretórios de dados

```
data/
├── raw/                            # imutável
│   └── Fichas das Políticas - 1ª onda.xlsx
├── derived/                        # gerado pelo pipeline; versionado por data
│   ├── policies-onda-1-2026-05-01.json
│   ├── policies-onda-1-2026-05-01.csv
│   └── latest.json -> policies-onda-1-2026-05-01.json
├── external_snapshots/             # content-addressable; imutável
│   ├── ab/
│   │   └── ab12cd...ef.html
│   ├── 7f/
│   │   └── 7f00....pdf
│   └── index.json                  # sha → metadata curta
├── extracted_text/                 # texto extraído dos snapshots
│   └── <sha>.metadata.json
└── annotations/                    # notas de revisor humano
    └── duvidas-pe-2026-05-01.md
```

## Procedimento para nova onda

Quando chegar `Fichas das Políticas - 2ª onda.xlsx`:

1. Salvar em `data/raw/` (não substitui a 1ª onda)
2. Atualizar pipeline para reconhecer múltiplas ondas
3. Gerar derivado `policies-onda-2-<data>.json` em paralelo
4. Validar contra schema, comparar com onda 1 (mudanças de fichas)
5. Promover para `latest.json` apenas após revisão humana

## Anti-padrões proibidos

- Abrir a planilha-fonte para escrita em pipeline automatizado
- Sobrescrever derivado sem nova data no nome
- Editar manualmente um JSON em `data/derived/` em vez de corrigir a fonte
- Deletar snapshot externo "porque o link mudou"
- Misturar anotação humana e dado canônico no mesmo JSON

## Relação com outras regras

- `@.claude/rules/operacao-drive.md` — `.gitignore`, lock files, sync do Drive
- `@.claude/rules/captura-responsavel.md` — como gerar snapshots externos
- `@.claude/rules/dados-politicas.md` — schema, vocabulário, deduplicação dos derivados
- `@.claude/rules/pipeline-reproducible.md` — automação dos derivados
- `@.claude/architecture/captura-estrategia.md` — racional do snapshot integral