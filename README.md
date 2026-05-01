# Catálogo de Políticas

Catálogo interativo de políticas públicas brasileiras (federais e estaduais) sobre **EJA, qualificação profissional, inclusão produtiva e transferência de renda condicionada à educação** — uma frente do **Projeto Juventudes Fora da Escola sem Educação Básica**.

**Site público:** https://antrologos.github.io/catalogo-politicas/

> **Status (2026-05-01):** Bloco F.1 do roadmap em andamento — site MVP no ar com Home, Busca facetada, 439 fichas individuais com 5 abas ARIA + Citation Box (4 formatos), Sobre completo. Próximas sprints: 404 fuzzy + sub-rotas Sobre + header/footer polish + (depois) Página por UF + Comparação inter-UF + Mapa coroplético + Grafo de relacionamentos.

## Iniciativa

**Rede EJA e Inclusão Produtiva**

### Realizadores
- [Fundação Roberto Marinho (FRM)](https://www.frm.org.br/)
- [Fundação Bradesco](https://www.fundacaobradesco.org.br/)

### Parceiros
- [Fundação Itaú Educação e Trabalho](https://www.fundacaoitau.org.br/educacao-e-trabalho)
- [Fundação Arymax](https://arymax.org.br/)

### Cooperação
- [UNESCO](https://www.unesco.org/pt)

### Parceria técnica
- Centro para o Estudo da Riqueza e da Estratificação Social (Ceres/IESP-UERJ)
- Laboratório de Monitoramento e Avaliação de Políticas e Eleições (MAPE/IESP-UERJ)
- [Instituto de Estudos Sociais e Políticos (IESP-UERJ)](http://www.iesp.uerj.br/)

### Equipe

**Coordenação**: Rogério Jerônimo Barbosa (Geral) · Hellen Guicheney (Gerência Técnica) · Bruno Schaefer (Frente OQF) · Maria Clara da Gama (Frente de Políticas).

**Pesquisa**: Maria Clara da Gama (Coord.) · Maria Julieta Ramalho Garcia · Cintia Maria Frazão · Jaqueline Sant'ana.

**Design do aplicativo e site**: Rogério Jerônimo Barbosa.

## O que tem aqui

- **439 fichas** de políticas públicas (1ª onda) cobrindo Federal + 9 UFs (SP, RJ, MG, PR, RS, BA, PA, PE, CE)
- **148 snapshots** integrais de leis, decretos, portarias e resoluções (HTML + PDF + DOC + ODT)
- **Pipeline ETL reproduzível** que transforma a planilha-fonte em JSON canônico validado contra JSON Schema v0.2
- **Skill de captura responsável** com OCR (Tesseract pt), conversão de documentos legados (LibreOffice), retry específico para gov.br/planalto, dedup SHA-256
- **Vocabulário canônico** controlado para todos os campos categóricos
- **Site Eleventy 3** com 5 facetas Pagefind, Tabs ARIA W3C, citação ABNT/APA/BibTeX/RIS
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
├── tests/                        # 57 testes (toy + unit + integração)
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
just testar           # 57 testes

# Site (Node)
cd site
npm ci
npm run dev           # http://localhost:8080
npm run build         # build de produção em _site/
```

Detalhes em [`docs/RUNBOOK.md`](docs/RUNBOOK.md).

## Como citar

```bibtex
@misc{catalogoPoliticasJuventudes2026,
  author       = {Barbosa, Rogério Jerônimo and Gama, Maria Clara da and
                  Guicheney, Hellen and Schaefer, Bruno},
  title        = {Catálogo de Políticas — Projeto Juventudes Fora da Escola
                  sem Educação Básica},
  publisher    = {Rede EJA e Inclusão Produtiva (FRM, Fundação Bradesco, IESP-UERJ)},
  year         = {2026},
  url          = {https://antrologos.github.io/catalogo-politicas/},
  note         = {Licenciado sob CC BY 4.0}
}
```

Veja [`CITATION.cff`](CITATION.cff) ou os botões "Como citar" em cada ficha do site para 4 formatos prontos (ABNT, APA, BibTeX, RIS).

## Licença

Conteúdo (dados + textos + documentação) sob **[CC BY 4.0](LICENSE)** — atribuição obrigatória.

Código (scripts ETL, skill de captura, frontend Eleventy) também sob CC BY 4.0.

Snapshots de atos normativos: domínio público (Lei 9.610/1998 art. 8º IV).