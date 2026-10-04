---
layout: layouts/base.njk
title: "Cobertura geográfica e cronograma"
permalink: /sobre/cobertura/
---

# Cobertura geográfica e cronograma

## Ondas do levantamento

| Esfera | UFs cobertas | Incorporação |
|---|---|---|
| Federal | Brasil (políticas federais canônicas) | maio de 2026 |
| Estadual — 1ª onda | SP, RJ, MG, PR, RS, BA, PA, PE, CE | maio de 2026 |
| Estadual — 2ª onda | GO, ES, SC, MA, AM, MT, RN, PB, AL | maio de 2026 |
| Estadual — 3ª onda | MS, RR, DF, RO, PI, AC, SE, TO, AP | outubro de 2026 |

Com a 3ª onda, o catálogo passa a cobrir **todas as {{ agregados.ufsCobertas | length - 1 }} unidades da federação** (26 estados + Distrito Federal) e a esfera federal: **{{ agregados.estaduaisUnicasCount }} políticas estaduais únicas** + **{{ agregados.federaisCount }} políticas federais canônicas** = **{{ agregados.total }} verbetes únicos**.

Nas fichas do Distrito Federal, a abrangência territorial aparece como **Distrital**; em buscas e listas ela é tratada como **Estadual**.

> **Importante:** cobrir todas as UFs não significa ter catalogado todas as políticas de cada uma.
> Veja a [metodologia](/sobre/metodologia/) sobre como ler as contagens — o catálogo é **levantamento, não censo**.

## Critério de seleção das UFs

A seleção foi planejada conforme três critérios:

1. **Diversidade regional**: pelo menos 1 UF de cada região do país.
2. **Densidade de políticas**: estados com políticas estruturadas em EJA, qualificação e inclusão.
3. **Capacidade de pesquisa**: equipe com acesso aos documentos oficiais dessas UFs.

## Atualizações

O catálogo é atualizado em rodadas, com correções e novas fichas. Acompanhe o [GitHub do projeto](https://github.com/antrologos/catalogo-politicas) para atualizações.

## Reportar política não catalogada

Se você gostaria de ver uma política específica adicionada, abra uma [issue no GitHub](https://github.com/antrologos/catalogo-politicas/issues/new) com o nome do programa e UF.
