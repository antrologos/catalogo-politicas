# RUNBOOK — Catálogo de Políticas Públicas

Manual operacional para mantenedor (Rogério ou sucessor). Atualizado em 2026-10-05 (curadoria documental e auditoria de referências).

## Onboarding em 1 dia

### 1. Pré-requisitos
- **Node.js 22 LTS** (`nvm install 22 && nvm use`).
- **Git** com `core.longpaths=true`, `core.autocrlf=false`, `core.quotepath=false`.
- **GitHub CLI** (`gh auth login`).
- **Editor**: VS Code recomendado (extensões: Eleventy, Tailwind CSS IntelliSense, ESLint).
- **Python 3.11+** (apenas se for tocar pipeline ETL/captura).

### 2. Clonar fora do Google Drive

> **Crítico**: NÃO desenvolva diretamente em `g:/Drives compartilhados/...`. Drive sync × `npm install` causa `EBADF` (file descriptor).

```bash
mkdir -p ~/dev
cd ~/dev
git clone https://github.com/antrologos/catalogo-politicas.git
cd catalogo-politicas/site
npm ci
```

### 3. Rodar localmente

```bash
cd site
npm run dev          # Eleventy --serve em http://localhost:8080
# em outro terminal:
npm run css:dev      # Tailwind --watch
```

Abrir http://localhost:8080/catalogo-politicas/.

### 4. Build de produção local

```bash
cd site
npm run build        # eleventy + tailwind + pagefind
ls _site/            # output
```

Build deve completar em <30s. Se demorar mais, investigar.

### 5. Deploy

Push em `main` dispara `.github/workflows/deploy.yml`:
1. **validate** — JSON Schema bloqueia se `data/derived/latest.json` violar contrato.
2. **build** — Eleventy + Tailwind + Pagefind.
3. **a11y** — axe-core em 4 páginas chave; bloqueia se violação WCAG 2.1 AA.
4. **lighthouse** — Perf ≥90, A11y ≥95, BP ≥90, SEO ≥95; bloqueia se abaixo.
5. **deploy** — só roda se tudo passou; publica em GH Pages.

Para deploy manual: `gh workflow run "Build & Deploy site"`.

## Correções documentais e referências externas

As planilhas originais permanecem preservadas. Desde 05/10/2026, correções documentadas podem entrar por `data/curadoria/correcoes-AAAA-MM-DD.json`, conforme o contrato de [curadoria](../data/curadoria/README.md). Arquivos `propostas-*.json` guardam a pesquisa, mas não são aplicados. Cada mudança deve registrar ID, valor anterior, valor novo, motivo e referências datadas; conflitos bloqueiam a geração.

1. Registrar as correções e fontes; distinguir vigência legal, oferta observada e ausência de informação.
2. Executar `just etl` em cópia isolada. A ordem é carga, normalização, deduplicação, IDs, JSON com curadoria e validação estrita.
3. Executar `python -B -m pytest tests/ -q` nessa cópia e, em `site/`, `npm test` e `npm run build`.
4. Conferir IDs/slugs, hashes dos originais e diferenças do conteúdo antes de promover JSON e registro de fichas.
5. Versionar os manifestos, dados derivados, evidências da auditoria e relatório da revisão.

Para uma checagem de acesso sem gerar novos snapshots:

```bash
python -B scripts/captura/auditar_referencias.py --input data/derived/latest.json --propostas data/curadoria --output data/auditoria/referencias-http-AAAA-MM-DD.json
```

O auditor verifica por GET as referências principais e as URLs documentadas na curadoria, respeita robots.txt, limita concorrência e intervalo por domínio e retoma resultados do mesmo dia. O relatório diferencia HTTP 404, restrição de acesso, timeout e redirecionamento suspeito, inclusive páginas de autenticação com HTTP 200. Não avalia vigência ou implementação. O site usa o relatório concluído de data mais recente para mostrar avisos específicos; falha de acesso não muda a situação da política.

Capturas rejeitadas não podem fornecer proveniência às fichas. Datas de consulta da pesquisa ficam nas referências da revisão; elas não geram datas de captura. Novas capturas continuam seguindo o procedimento de manutenção semestral abaixo.

## Manutenção mensal

### Cron automático (não exige ação humana)

| Workflow | Frequência | Função |
|---|---|---|
| `backup.yml` | 1º de cada mês | Release com tarball verificado: planilhas de `data/raw/`, `data/derived/`, índice e metadados dos snapshots, schema e vocabulário (os binários das fontes ficam só no Drive) |
| `deploy.yml` | A cada push no site/dados | Validação do schema + `npm test` + build + pa11y (20 páginas) + Lighthouse (9 páginas) + deploy |
| `tests.yml` | A cada push no ETL/dados | pytest: toy, unit e integração (roda o ETL completo sobre `data/raw/`) |

### Tarefa manual mensal (~30min)

1. **Conferir issues abertas** em https://github.com/antrologos/catalogo-politicas/issues — responder ou triagem.
2. **Conferir backup criado**: `gh release list --repo antrologos/catalogo-politicas | grep backup-`.
3. **Verificar Lighthouse no último deploy**: `gh run list --workflow="Build & Deploy site" --limit 1`.

## Manutenção semestral (4-8h)

### 1. Re-validação de URLs e snapshots

```bash
cd "g:/Drives compartilhados/FRM_CatalogoPoliticas"
just revalidar              # apenas snapshots com revisão vencida
# ou
just revalidar-todas        # todos os snapshots
```

Para uma **rodada completa** (inclui fontes de fichas novas), rodar em sequência:

```bash
python -B scripts/etl/extract_links.py
python -B scripts/captura/validar_links.py
python -B scripts/captura/validar_links.py --apenas-falhas
python -B scripts/captura/consolidar_links.py     # gera links-validados-onda-1-<hoje>-final.csv
python -B scripts/captura/capturar_completo.py
python -B scripts/captura/revalidar.py --todas
just etl                                        # vincula os snapshots e atualiza as datas de acesso
```

Saída em `data/derived/` e `data/external_snapshots/index.json`. Commitar o índice, os CSVs do dia e o `latest.json`.

### 2. Atualizar dependências npm

```bash
cd ~/dev/catalogo-politicas/site
npm outdated
npm update --save                          # patches
# Para majors, abrir PR específico por dependência:
npm install eleventy@4 --save-dev          # exemplo
```

**Regra**: NUNCA `npm update` direto em `main` sem CI verde. Sempre via PR.

### 3. Auditoria a11y manual

A cada 6 meses, fazer auditoria com leitor de tela real:
- **Windows**: NVDA + Firefox em http://localhost:8080/catalogo-politicas/
- **Mac**: VoiceOver + Safari
- **Mobile**: TalkBack (Android) ou VoiceOver iOS

Páginas mínimas a auditar: Home, Busca (com filtros), Ficha, Sobre, 404.

Documentar achados em issue. axe-core no CI cobre apenas violações automáticas — manual é insubstituível.

## Manutenção em emergência

### Site fora do ar

1. Verificar status GitHub Pages: https://www.githubstatus.com/
2. Verificar último deploy: `gh run list --workflow="Build & Deploy site" --limit 5`
3. Se workflow falhou: `gh run view <ID>` para detalhes.
4. Se Pages está OK mas site 404: conferir Settings → Pages → Source = GitHub Actions.

### Ataque de DDoS / pico de tráfego

GitHub Pages tem limite "soft" de 100GB/mês. Se exceder:
1. **Curto prazo**: aceitar throttling; site continua mas lento.
2. **Médio prazo**: ativar Cloudflare gratuito em frente do GH Pages (CONS-S-02 fallback).
3. **Documentar incidente** em issue.

### Pagefind quebrou

Se Pagefind falhar em build (improvável):
1. Verificar `pagefind --site _site` localmente.
2. Limpar cache: `rm -rf site/_site site/node_modules && npm ci && npm run build`.
3. Plano B documentado em ADR-008: migrar para Lunr.js (~30-60h).

### Snapshot externo perdido

Se um snapshot HTML/PDF em `data/external_snapshots/` for deletado por engano:
1. **Verificar release de backup** mais recente: `gh release list | grep backup-`.
2. Snapshots binários NÃO estão no backup (excluídos por tamanho — `.gitignore`).
3. **Recapturar via skill**:
   ```bash
   cd "g:/Drives compartilhados/FRM_CatalogoPoliticas"
   just capturar-uma <URL>
   ```

## Plano de continuidade (CONS-M-02)

Se o mantenedor (Rogério) ficar 6+ meses sem disponibilidade:

### Site continua no ar
- HTML estático já publicado em GH Pages permanece servido.
- Backup mensal em Releases continua rodando (cron).
- CI bloqueia merges quebrados (não há regressões silenciosas).

### O que para de funcionar
- Inclusão de novas políticas.
- Captura de snapshots novos quando políticas mudam.
- Resposta a issues e correções reportadas.

### Procedimento "modo dormente"
1. Adicionar issue template "Em hibernação" no repo (resposta automática "Mantenedor temporariamente indisponível; ver `/sobre/cobertura/`").
2. Atualizar `/sobre/status/` declarando estado dormente.
3. Chave-mestra do repo deve estar com FRM/IESP-UERJ (não só conta pessoal `antrologos`).

### Para quem assumir manutenção depois
- Ler este RUNBOOK.
- Ler ADRs em `.claude/decisions/` (sequenciais 001-010+).
- Ler CLAUDE.md (raiz) para contexto do projeto.
- Ler `.claude/README.md` para meta-estrutura.
- Reproduzir build local seguindo "Onboarding em 1 dia".

## Estrutura de pastas (referência rápida)

```
catalogo-politicas/
├── data/
│   ├── raw/                          # Planilha-fonte imutável
│   ├── derived/                      # JSON canônico (entrada do site)
│   └── external_snapshots/           # Snapshots integrais (binários gitignored)
├── scripts/                          # ETL Python + skill captura
├── site/                             # Frontend Eleventy 3 (DEV AQUI)
│   ├── src/                          # Templates Eleventy (.njk + .md)
│   ├── _site/                        # Output build (gitignored)
│   ├── eleventy.config.js
│   ├── tailwind.config.js
│   └── package.json
├── .github/workflows/
│   ├── deploy.yml                    # Build + a11y + Lighthouse + deploy
│   └── backup.yml                    # Backup mensal automático
├── .claude/
│   ├── rules/                        # 10 regras de operação
│   ├── decisions/                    # ADRs leves
│   ├── plans/                        # Planos por bloco
│   └── working/                      # Outputs intermediários (E.1-E.5)
├── docs/RUNBOOK.md                   # Este arquivo
├── CLAUDE.md
└── README.md
```

## Comandos úteis (cheat sheet)

```bash
# Dev
npm run dev                   # Eleventy --serve
npm run css:dev               # Tailwind --watch

# Build
npm run build                 # eleventy + tailwind + pagefind

# Test
npm test                      # testes dos dados do site (site/tests, node --test)

# CI local (antes de push)
npm run audit                 # npm audit high+critical
npx ajv-cli validate -s ../.claude/context/policies-schema.json -d ../data/derived/latest.json -c ajv-formats --strict=false

# Git
git status
git log --oneline -10
git pull --rebase

# GitHub
gh run list --workflow="Build & Deploy site"
gh run view <ID>
gh issue list
gh release list

# Pipeline ETL/captura (apenas se precisar regenerar dados)
cd "g:/Drives compartilhados/FRM_CatalogoPoliticas"
just etl                      # planilha → JSON canônico
just revalidar                # re-checa URLs com proxima_revisao_prevista < hoje
python -B -m pytest tests/ -q # suíte do ETL e da captura
```

## Pendências conhecidas (não-bloqueantes)

- OCR ocrmypdf no Windows: bug com `.hocr` path; afeta 1 PDF escaneado. Workaround: tesseract direto.
- GET fallback no `revalidar.py`: ainda não implementado; só `capturar_norma.py` tem.
- Documentação de agendamento (cron/Task Scheduler/GH Actions) para `revalidar`: a fazer em Bloco G.

## Onde reportar

- **Bug do site**: https://github.com/antrologos/catalogo-politicas/issues/new
- **Erro nos dados**: idem (template `correção`)
- **Dúvida sobre catálogo**: rogerio.barbosa@iesp.uerj.br