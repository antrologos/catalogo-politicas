---
layout: layouts/base.njk
title: "Cobertura geográfica e cronograma"
permalink: /sobre/cobertura/
---

# Cobertura geográfica e cronograma

## 1ª onda (concluída em maio de 2026)

| Esfera | UFs cobertas |
|---|---|
| Federal | Brasil (políticas federais canônicas) |
| Estadual — 1ª onda | SP, RJ, MG, PR, RS, BA, PA, PE, CE |
| Estadual — 2ª onda | GO, ES, SC, MA, AM, MT, RN, PB, AL |

## 2ª onda (incorporada em maio de 2026)

Em **{{ agregados.estaduaisUnicasCount }} políticas estaduais únicas** + **{{ agregados.federaisCount }} políticas federais canônicas** = **{{ agregados.total }} verbetes únicos** no catálogo, distribuídos por **{{ agregados.ufsCobertas | length - 1 }} unidades da federação** (mais Federal).

> **Importante:** o catálogo cobre majoritariamente a Norte, Nordeste e Centro-Oeste a partir desta 2ª onda. Ainda **não inclui** Distrito Federal, Acre, Amapá, Roraima, Rondônia, Tocantins, Sergipe, Piauí e Mato Grosso do Sul.
> Veja a [metodologia](/sobre/metodologia/) sobre como ler as contagens — o catálogo é **levantamento, não censo**.

## Critério de seleção das UFs

A seleção foi planejada conforme três critérios:

1. **Diversidade regional**: pelo menos 1 UF de cada região do país.
2. **Densidade de políticas**: estados com políticas estruturadas em EJA, qualificação e inclusão.
3. **Capacidade de pesquisa**: equipe com acesso aos documentos oficiais dessas UFs.

## Próximas ondas (a confirmar)

A continuidade do levantamento para as UFs ainda não cobertas (DF, AC, AP, RR, RO, TO, SE, PI, MS) depende de financiamento e disponibilidade de equipe. Acompanhe o [GitHub do projeto](https://github.com/antrologos/catalogo-politicas) para atualizações.

## Reportar política não catalogada

Se você gostaria de ver uma política específica adicionada, abra uma [issue no GitHub](https://github.com/antrologos/catalogo-politicas/issues/new) com o nome do programa e UF.
