---
layout: layouts/base.njk
title: "Metodologia e alcance"
permalink: /sobre/metodologia/
description: "Como o Catálogo de Políticas foi montado, o que ele não é, e como ler as contagens corretamente."
---

{% set crumbs = [
  { texto: "Início", href: "/" },
  { texto: "Sobre", href: "/sobre/" },
  { texto: "Metodologia e alcance" }
] %}
{% include "components/breadcrumb.njk" %}

# Metodologia e alcance

## Como o catálogo foi montado

O Catálogo de Políticas foi produzido a partir de **trabalho de levantamento e curadoria** conduzido pela equipe de pesquisa. Para cada unidade da federação coberta, a equipe consultou portais oficiais (Diário Oficial, sites de secretarias estaduais, repositórios legislativos), agregou referências cruzadas em estudos e relatórios prévios, e organizou os resultados segundo o vocabulário canônico do catálogo (8 dimensões: tipo de política, esfera de formulação, esfera de execução, situação atual, abrangência territorial, modalidade da oferta, arranjo logístico, transferência de recursos).

Cada política recebeu metadados estruturados e, quando possível, **referência à norma instituidora** com preservação local do texto da fonte oficial.

A primeira onda do levantamento cobriu **políticas federais e nove unidades da federação**: Bahia, Ceará, Minas Gerais, Pará, Paraná, Pernambuco, Rio de Janeiro, Rio Grande do Sul e São Paulo. Outras unidades estão em planejamento para ondas futuras (ver [cobertura](/sobre/cobertura/)).

## O que este catálogo **não é**

> **Este catálogo não é um censo das políticas existentes em cada unidade da federação.**

Trata-se de **levantamento seguido de seleção** de políticas consideradas relevantes para os objetivos do estudo. Assim:

- **A ausência intencional ou não de uma política no catálogo não significa que ela não exista naquele território.**
- **Quando dois estados aparecem com contagens diferentes no catálogo**, isso reflete o universo da pesquisa, e não uma diferença censitária entre todas as políticas existentes nos territórios comparados. Um estado com 'mais políticas listadas' não tem necessariamente mais política pública vigente do que outro — pode apenas refletir variações no levantamento.

Ler as contagens como se fossem censitárias é o erro mais comum em catálogos curados como este. As páginas de [Mapa](/mapa/), [Comparar UFs](/comparacao/) e cada [página de UF](/explorar/) trazem um lembrete inline justamente para reforçar esse ponto.

## Como ler as contagens

| Contagem mostrada | O que significa | O que **não** significa |
|---|---|---|
| "{{ agregados.total }} políticas catalogadas" | Número de verbetes únicos ativos na 1ª onda do catálogo (federais canônicas + estaduais exclusivas; cada política federal é contada uma única vez mesmo que executada em vários estados). | "Existem exatamente esse número de políticas no Brasil sobre estes temas." |
| "BA: N políticas" | A equipe identificou e descreveu N políticas na Bahia segundo os critérios do estudo. | "A Bahia tem exatamente N políticas vigentes nesses eixos." |
| "PR: M políticas" (M ≠ N) | Idem, para o Paraná, com universo possivelmente distinto. | A diferença para BA não significa "o Paraná tem menos política pública do que a Bahia." |
| "{{ agregados.federaisCount }} políticas federais" | Verbetes de políticas com formulação na esfera federal, registradas uma única vez. | "Existem exatamente esse número de políticas federais em EJA, qualificação ou inclusão produtiva." |

A comparação útil é **dentro do universo do catálogo** — quais políticas estão estruturadas de forma X ou Y, como evoluem ao longo do tempo, quais aparecem em mais UFs. Comparações entre UFs com peso censitário exigiriam estratégia metodológica diferente.

## Como sugerir uma política ausente

Se você atua em uma das UFs cobertas e identificou uma política que **deveria estar no catálogo e não está**, queremos saber.

- **Abrir uma issue no GitHub** (público, rastreável): [novo registro de política](https://github.com/antrologos/catalogo-politicas/issues/new?title=Sugest%C3%A3o+de+inclus%C3%A3o+de+pol%C3%ADtica%3A+).
- **E-mail institucional**: contato com a coordenação (Rogério Jerônimo Barbosa).

Inclua, sempre que possível: nome do programa, esfera (federal/estadual/municipal), norma instituidora (lei/decreto/portaria), órgão responsável, situação atual e link para a fonte oficial.

A inclusão depende dos critérios de relevância para o estudo e é avaliada pela equipe de pesquisa.

## Para saber mais

- [Cobertura e cronograma](/sobre/cobertura/) — UFs já cobertas e as previstas para ondas futuras.
- [Acesso à informação](/sobre/transparencia/) — política de revisão, histórico, canal de relato.
- [Como citar](/sobre/#como-citar) — formatos ABNT, APA, BibTeX e RIS, no catálogo inteiro e por verbete individual.