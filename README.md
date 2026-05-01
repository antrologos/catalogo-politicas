# Catálogo de Políticas Públicas Brasileiras

Catálogo interativo de políticas públicas federais e estaduais brasileiras com foco em **EJA, qualificação profissional, inclusão produtiva e transferência de renda condicionada à educação**.

> **Status (2026-05-01):** infraestrutura completa, dados validados, captura integral de 148 snapshots normativos. Site web em construção (Bloco F do roadmap).

## O que tem aqui

- **439 fichas** de políticas públicas (1ª onda) cobrindo Federal + 9 UFs (SP, RJ, MG, PR, RS, BA, PA, PE, CE)
- **148 snapshots** integrais de leis, decretos, portarias e resoluções (HTML + PDF + DOC + ODT)
- **Pipeline ETL reproduzível** que transforma a planilha-fonte em JSON canônico validado contra JSON Schema
- **Skill de captura responsável** com OCR (Tesseract pt), conversão de documentos legados (LibreOffice), retry específico para gov.br/planalto, dedup SHA-256
- **Vocabulário canônico** controlado para todos os campos categóricos
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
├── site/                         # (em construção) Frontend Eleventy/Astro
└── .claude/                      # Infraestrutura Claude Code
    ├── rules/                    # 10 regras de operação
    ├── skills/                   # 3 skills (normalize, rodar, testar pipeline)
    ├── hooks/                    # 3 hooks Python
    ├── context/                  # Schema + vocabulário canônico
    ├── architecture/             # Decisões arquiteturais
    ├── decisions/                # ADRs leves
    ├── plans/                    # Planos aprovados por bloco
    └── working/                  # Outputs intermediários das rodadas
```

## Site

O site interativo será publicado em **https://antrologos.github.io/catalogo-politicas/** após conclusão do Bloco F (construção do site).

Stack candidata (a confirmar via PoC empírico): **Eleventy 3 + Tailwind + Pagefind + Alpine.js + D3 + Cytoscape**.

## Reproduzir

Pré-requisitos: Python 3.11+, [just](https://just.systems), Tesseract 5+, LibreOffice 26+.

```bash
git clone https://github.com/antrologos/catalogo-politicas.git
cd catalogo-politicas
pip install -r requirements.txt
just etl              # planilha → JSON canônico
just captura          # captura snapshots integrais
just testar           # roda os 57 testes
```

## Como citar

```bibtex
@misc{frmIespCatalogoPoliticas2026,
  author       = {{FRM/IESP-UERJ}},
  title        = {Catálogo de Políticas Públicas Brasileiras (1ª onda)},
  year         = {2026},
  howpublished = {Site interativo},
  url          = {https://antrologos.github.io/catalogo-politicas/},
  note         = {Licenciado sob CC BY 4.0}
}
```

## Licença

Conteúdo (dados + textos + documentação) sob **[CC BY 4.0](LICENSE)**.

Código (scripts ETL, skill de captura, futuro frontend) também sob CC BY 4.0 — atribuição obrigatória.
