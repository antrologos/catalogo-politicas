---
layout: layouts/base.njk
title: "Metodologia e alcance"
permalink: /sobre/metodologia/
description: "Como o levantamento foi organizado e como interpretar as fichas, suas referências e os limites das informações disponíveis."
---

{% set crumbs = [
  { texto: "Início", href: "/" },
  { texto: "Sobre", href: "/sobre/" },
  { texto: "Metodologia e alcance" }
] %}
{% include "components/breadcrumb.njk" %}

# Metodologia e alcance

## Como o catálogo foi montado

O catálogo resulta de **levantamento e curadoria** conduzidos pela equipe de pesquisa. Foram consultados portais oficiais, repositórios legislativos, estudos e relatórios, e as informações foram organizadas segundo o vocabulário do catálogo. As descrições e referências disponíveis são apresentadas sem completar lacunas por inferência.

O levantamento foi realizado em três ondas, que reuniram políticas federais e experiências das 27 unidades da federação. A [página de cobertura](/sobre/cobertura/) identifica as UFs de cada onda.

O acervo inclui programas, planos, serviços, benefícios, normas e ofertas educacionais. A natureza de cada registro deve ser lida a partir da identificação, da descrição e das referências disponíveis: uma norma ou um plano não devem ser tomados, por si sós, como serviço implementado.

## Revisão das referências e do conteúdo

Em 5 de outubro de 2026, uma revisão documental com apoio de ferramentas automatizadas corrigiu referências e inconsistências de conteúdo em parte do acervo. Nas fichas revistas, as fontes consultadas e o alcance da revisão aparecem no bloco Referências.

A revisão distingue o território efetivamente descrito, o período da experiência e o tipo de evidência disponível. Quando só foi possível identificar um anúncio, uma norma ou um plano, isso é indicado. “Sem informação” pode sinalizar que o funcionamento atual não foi confirmado, sem significar encerramento.

Os arquivos originais do levantamento foram preservados. Cada correção tem histórico de valores, justificativa e referências no [registro de curadoria](https://github.com/antrologos/catalogo-politicas/tree/main/data/curadoria). Essa revisão não certifica a exatidão de todas as informações do acervo nem substitui pesquisa sobre implementação e resultados.

## Como ler a ficha

Cada ficha reúne quatro blocos:

- **Identificação:** nome, classificação, responsáveis e datas informadas no levantamento.
- **Finalidade:** finalidade, público, funcionamento e organização da oferta, conforme as informações disponíveis no levantamento.
- **Território:** vínculo territorial, abrangência e esfera de execução informados. Um recorte territorial previsto não comprova atendimento efetivo em todos os locais.
- **Referências:** instrumentos citados, fonte identificada e data de consulta, quando disponíveis, além da referência bibliográfica da própria ficha.

“Não informado no levantamento” indica uma lacuna do acervo. Isso não demonstra que a informação ou a experiência inexista. A reorganização das fichas facilita a consulta ao material disponível; uma compreensão operacional mais aprofundada pode exigir outras fontes.

## O que as referências permitem afirmar

**Existência jurídica, vigência da norma e implementação são informações distintas.** Uma lei pode instituir um programa sem comprovar que exista oferta atual. Uma página institucional também precisa ser examinada quanto ao período e ao conteúdo que documenta.

A **situação informada no levantamento** registra a classificação recebida pela ficha. Ela não equivale a uma verificação contínua de funcionamento. Experiências históricas podem ser úteis; a falta de confirmação atual não autoriza concluir que tenham sido encerradas.

**Objetivos declarados não são resultados demonstrados, e metas não são realizações.** Informações de atendimento precisam ser lidas com sua unidade, seu período e sua fonte. A abrangência prevista não substitui evidência de execução no território.

A **data de consulta da fonte** informa quando ela foi acessada ou verificada. Não substitui a data da norma nem o período a que a informação se refere. Um link inacessível em uma consulta não prova o encerramento ou a inexistência da experiência.

Links oficiais são apresentados quando identificados. Para parte do acervo, a equipe preserva uma cópia de arquivo para auditoria; essas cópias não são publicadas no site. As referências da ficha devem ser consultadas conforme a informação que efetivamente sustentam.

## Cobertura e contagens

**O catálogo é um levantamento, não um censo.** A seleção de experiências reflete os objetivos e o alcance da pesquisa. Uma política ausente do acervo pode existir no território.

O total de **{{ agregados.total }} verbetes únicos** corresponde a {{ agregados.federaisCount }} políticas federais, contadas uma única vez, e {{ agregados.estaduaisUnicasCount }} registros estaduais e distritais. As réplicas federais presentes na base de pesquisa não somam outra ficha na interface.

Diferenças de contagem entre UFs descrevem o universo catalogado. Não demonstram, por si sós, que um território tenha mais políticas vigentes, maior atendimento ou melhores resultados. O [mapa](/mapa/) e a [comparação de UFs](/comparacao/) ajudam a explorar esse universo, respeitando esse limite.

## Como contribuir

Para sugerir uma inclusão ou corrigir uma informação, use o link de relato ao final da ficha ou [abra uma issue no repositório](https://github.com/antrologos/catalogo-politicas/issues/new). Inclua o nome da experiência, o território, a informação a corrigir e a referência que a sustenta, com sua data ou período quando disponível.

A inclusão no catálogo depende dos critérios do levantamento e não representa recomendação ou comprovação de eficácia.

## Para saber mais

- [Finalidade e orientação editorial](/sobre/) — o direito à EJA pública presencial e o público do catálogo.
- [Como consultar](/sobre/comece-por-aqui/) — da busca às referências.
- [Cobertura](/sobre/cobertura/) — as três ondas do levantamento.
- [Acesso à informação](/sobre/transparencia/) — histórico e canais de relato.
- [Como citar o catálogo](/sobre/#como-citar).
