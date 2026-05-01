---
layout: layouts/base.njk
title: "Acesso à informação"
permalink: /sobre/transparencia/
description: "Compromissos de transparência do Catálogo de Políticas, conforme princípios da Lei de Acesso à Informação (Lei 12.527/2011)."
---

# Acesso à informação

Compromissos de transparência do **Catálogo de Políticas** conforme princípios da [Lei de Acesso à Informação (Lei 12.527/2011)](http://www.planalto.gov.br/ccivil_03/_ato2011-2014/2011/lei/l12527.htm) e prática consolidada de portais governamentais brasileiros.

## Política de revisão dos dados

- **Versão atual**: PoC 2026-05-01 (1ª onda).
- **Próxima revisão geral**: prevista para **outubro de 2026** (revisão dos 197 snapshots ainda não capturados + atualização de status de políticas).
- **Frequência futura**: **semestral** após o lançamento público (ver [cobertura e cronograma](../cobertura/)).
- **Política de captura de snapshots**: conforme regra `captura-responsavel` do projeto — robots.txt respeitado, rate-limit 0,5 req/s por domínio, atribuição preservada.

## Qualidade dos dados

- **Validação automática**: cada ficha valida contra **JSON Schema v0.2** (32 campos canônicos) em CI a cada commit.
- **Vocabulário canônico**: 8 dimensões categóricas com lista fechada (tipo de política, situação atual, esfera de execução, modalidade, etc).
- **Cobertura de snapshots**: 242 das 439 fichas (55%) com texto integral preservado; 197 ainda sem snapshot por:
  - **WAF gov.br**: 71 URLs bloqueiam scraping (em revisão).
  - **Timeout planalto.gov.br**: 23 URLs com instabilidade persistente.
  - **Outras causas**: 13 URLs com erro de DNS/SSL ou conteúdo dinâmico.

## Histórico de versões

| Versão | Data | Mudanças principais |
|---|---|---|
| PoC 2026-05-01 | 2026-05-01 | 1ª publicação — 439 fichas em 9 UFs + Federal |
| (próximas) | (a vir) | Aumento de cobertura de snapshots; novas UFs |

Acompanhe o [histórico completo de commits no GitHub](https://github.com/antrologos/catalogo-politicas/commits/main).

## Canal de relato — encontrou erro?

**SLA público: revisão em até 90 dias.**

Três canais:
1. **Issue no GitHub** (preferido — público, rastreável): [abrir issue](https://github.com/antrologos/catalogo-politicas/issues/new).
2. **E-mail institucional**: contato direto com a coordenação (Rogério Jerônimo Barbosa).
3. **Pull request** (para correções pequenas): forke o repositório e abra PR.

## O que NÃO temos

Para ser explícito sobre limites:

- **Não somos órgão público**. Não temos relação institucional com órgãos das UFs catalogadas. Não respondemos a pedidos via e-SIC.
- **Não somos fonte primária**. Para a versão atual da norma, sempre consulte o portal oficial (link "Acessar no portal oficial" em cada ficha).
- **Não garantimos cobertura completa**. A 1ª onda cobre 9 UFs intencionalmente; outras 17 UFs estão em planejamento (ver [cobertura](../cobertura/)).

## Reuso e atribuição

Conteúdo do catálogo é licenciado sob [CC BY 4.0](../termos/). Reuso permitido com atribuição. Para tirar dúvidas sobre atribuição, consulte os [termos de uso](../termos/).