# Avaliação da amostra capturada — onda 1 — 2026-05-01

Total de URLs capturadas: **25**

## Status

| Status | n |
|---|---:|
| ok | 24 |
| inalterado | 1 |

## Formatos capturados

| Formato | n |
|---|---:|
| html | 25 |

## Qualidade do texto extraído

| Nível | n | Critério |
|---|---:|---|
| alta  | 19 | ≥ 2000 chars |
| média |  6 | 100-1999 chars |
| baixa |  0 | < 100 chars ou erro |

Distribuição de caracteres extraídos:
  - mínimo: 451
  - mediana: 3252
  - média: 5552
  - máximo: 21919
  - com texto: 25/25
  - sem texto: 0/25

Distribuição de tamanho dos snapshots (bytes):
  - mínimo: 13,633
  - mediana: 89,447
  - máximo: 305,139
  - total armazenado: 2,581,751 bytes (2.5 MB)

## PII detectada

Snapshots com flag `contem_pii=true` (>5 ocorrências de CPF/CNPJ): **0**


## Snapshots por domínio

| Domínio | n | bytes total | chars total |
|---|---:|---:|---:|
| `www.al.sp.gov.br` | 4 | 92,929 | 57,115 |
| `portal.educacao.pe.gov.br` | 3 | 455,469 | 8,853 |
| `social.mg.gov.br` | 2 | 219,148 | 14,419 |
| `educacao.rs.gov.br` | 1 | 94,331 | 1,029 |
| `jornadapedagogica.educacao.ba.gov.br` | 1 | 179,553 | 11,208 |
| `www.educacao.mg.gov.br` | 1 | 104,984 | 6,286 |
| `legislacao.prefeitura.sp.gov.br` | 1 | 26,655 | 3,252 |
| `www.bahianoticias.com.br` | 1 | 119,373 | 2,475 |
| `www.desenvolvimentosocial.sp.gov.br` | 1 | 78,498 | 906 |
| `www.justica.sp.gov.br` | 1 | 86,520 | 2,900 |
| `www.ecoescolas.org.br` | 1 | 305,139 | 6,397 |
| `www.fomento.pr.gov.br` | 1 | 87,076 | 451 |
| `www.centec.org.br` | 1 | 105,341 | 3,859 |
| `jau.sp.gov.br` | 1 | 141,350 | 789 |
| `prefeitura.sp.gov.br` | 1 | 158,043 | 2,324 |
| `trabalho.rs.gov.br` | 1 | 72,385 | 699 |
| `agenciapara.com.br` | 1 | 79,970 | 4,492 |
| `www.agenciapara.com.br` | 1 | 85,540 | 8,977 |
| `www.parana.pr.gov.br` | 1 | 89,447 | 2,386 |

## Recomendações para Bloco D

- ℹ️ Nenhum PDF capturado nesta amostra (todos HTML). Ampliar amostra com URLs do Planalto/IN para testar pipeline PDF.
- ✅ Skill `capturar-norma` (v1.0) está funcional. Próximos passos: implementar OCR para PDFs escaneados, suporte a DOC legado via libreoffice, snapshot index.json com SHA→metadata.