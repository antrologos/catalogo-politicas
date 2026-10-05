# Catálogo de Políticas da Rede EJA e Inclusão Produtiva

Levantamento de experiências e referências para apoiar membros, coordenadores e profissionais da Rede EJA no fortalecimento do direito à **educação pública, presencial e de qualidade** e no diálogo com os governos. As fichas permitem consultar identificação, finalidade, território e referências, explicitando os limites da informação disponível. Produto permanente da **[Rede EJA e Inclusão Produtiva](https://www.frm.org.br/projeto/rede-eja)**, com registros nas **27 unidades da federação** e na esfera federal.

**Site público:** https://antrologos.github.io/catalogo-politicas/

> **Versão 1.0 (2026-10-04):** 366 verbetes únicos (33 federais + 333 estaduais) cobrindo as 27 UFs + esfera federal, levantados em três ondas. Busca facetada, mapa, comparação entre UFs, páginas por UF e por categoria, citação em ABNT/APA/BibTeX/RIS.

## Rede EJA e Inclusão Produtiva

A Rede é formada por 16 instituições da sociedade civil e organismos multilaterais: Ação Educativa, Ashoka, Conhecimento Social, Conselho Nacional do SESI, Fundação Arymax, Fundação Bradesco, Fundação Itaú (Itaú Educação e Trabalho), Fundação Roberto Marinho, GIFE, Instituto Rodrigo Mendes, Pacto Global da ONU – Rede Brasil, Redes da Maré, Todos Pela Educação, UNESCO, UNICEF e United Way Brasil (Juventudes Potentes).

### Pesquisa e desenvolvimento
- [Centro para o Estudo da Riqueza e da Estratificação Social (Ceres/IESP-UERJ)](https://iesp.uerj.br/nucleo/ceres/)
- [Laboratório de Monitoramento e Avaliação de Políticas e Eleições (MAPE)](https://mape.org.br/)
- [Instituto de Estudos Sociais e Políticos (IESP-UERJ)](https://iesp.uerj.br/)

### Apoio ao levantamento
O levantamento que deu origem ao catálogo foi realizado no âmbito do Projeto Juventudes Fora da Escola sem Educação Básica — realização: [Fundação Roberto Marinho](https://www.frm.org.br/) e [Fundação Bradesco](https://fundacao.bradesco/); parceiros: [Itaú Educação e Trabalho](https://www.itaueducacaoetrabalho.org.br/) e [Fundação Arymax](https://arymax.org.br/); cooperação: [UNESCO](https://www.unesco.org/pt).

### Equipe

**Coordenação**: Rogério Jerônimo Barbosa (Geral) · Hellen Guicheney (Gerência Técnica) · Bruno Schaefer (Frente OQF) · Maria Clara da Gama (Frente de Políticas).

**Pesquisa**: Maria Clara da Gama (Coord.) · Maria Julieta Ramalho Garcia · Cintia Maria Frazão · Jaqueline Sant'ana.

**Design do aplicativo e site**: Rogério Jerônimo Barbosa.

## O que tem aqui

- **366 verbetes únicos** (1158 fichas com as réplicas estaduais das políticas federais) cobrindo Federal + 27 UFs, em três ondas de levantamento
- **Cópias de arquivo das fontes oficiais** (HTML + PDF + DOC + ODT) para parte das políticas, guardadas fora do repositório público; o índice fica em `data/external_snapshots/index.json`
- **Pipeline ETL reproduzível** que transforma a planilha-fonte em JSON canônico validado contra JSON Schema v0.2
- **Skill de captura responsável** com OCR (Tesseract pt), conversão de documentos legados (LibreOffice), retry específico para gov.br/planalto, dedup SHA-256
- **Vocabulário canônico** controlado para todos os campos categóricos
- **Site Eleventy 3** com busca Pagefind (4 facetas: UF, Situação, Tipo, Modalidade), mapa D3, comparação entre UFs, Tabs ARIA W3C, citação ABNT/APA/BibTeX/RIS
- **CI bloqueante** com WCAG 2 AA (pa11y-ci) + Lighthouse + JSON Schema
- **Backup mensal** automatizado em GitHub Releases
- **Documentação completa** das decisões em `.claude/decisions/` e dos planos em `.claude/plans/`

## Estrutura

```
├── data/
│   ├── raw/                      # Planilha-fonte imutável
│   ├── derived/                  # JSON canônico + relatórios
│   └── external_snapshots/       # Snapshots integrais (binários ignorados; index.json versionado)
├── scripts/
│   ├── etl/                      # Pipeline planilha → JSON
│   └── captura/                  # Skill de scraping responsável
├── tests/                        # testes pytest do ETL e da captura (toy + unit + integração)
├── site/                         # Frontend Eleventy 3
│   ├── src/                      # Templates + componentes + dados Eleventy
│   ├── _site/                    # Output build (gitignored)
│   └── package.json
├── docs/RUNBOOK.md               # Manual operacional
└── .claude/                      # Infraestrutura Claude Code
    ├── rules/                    # 10 regras de operação
    ├── skills/                   # 3 skills
    ├── hooks/                    # 3 hooks Python
    ├── context/                  # Schema + vocabulário canônico
    ├── decisions/                # ADRs (10 publicados)
    ├── plans/                    # Planos por bloco
    └── working/                  # Outputs intermediários (E.1-E.5)
```

## Reproduzir localmente

```bash
git clone https://github.com/antrologos/catalogo-politicas.git
cd catalogo-politicas

# Pipeline ETL (Python)
pip install -r requirements.txt
just etl              # planilha → JSON canônico
python -B -m pytest tests/ -q   # suíte do ETL e da captura

# Site (Node)
cd site
npm ci
npm run dev           # http://localhost:8080
npm run build         # build de produção em _site/
```

Detalhes em [`docs/RUNBOOK.md`](docs/RUNBOOK.md).

## Como citar

```bibtex
@misc{catalogoPoliticasRedeEja2026,
  editor       = {Barbosa, Rogério Jerônimo},
  title        = {Catálogo de Políticas da Rede EJA e Inclusão Produtiva},
  publisher    = {Rede EJA e Inclusão Produtiva},
  address      = {Rio de Janeiro},
  year         = {2026},
  version      = {1.0},
  url          = {https://antrologos.github.io/catalogo-politicas/},
  note         = {Licenciado sob CC BY 4.0}
}
```

Veja [`CITATION.cff`](CITATION.cff) ou os botões "Como citar" em cada ficha do site para 4 formatos prontos (ABNT, APA, BibTeX, RIS).

## Licença

Conteúdo (dados + textos + documentação) sob **[CC BY 4.0](LICENSE)** — atribuição obrigatória.

Código (scripts ETL, skill de captura, frontend Eleventy) também sob CC BY 4.0.

Snapshots de atos normativos: domínio público (Lei 9.610/1998 art. 8º IV).