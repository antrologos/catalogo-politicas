---
layout: layouts/base.njk
title: "Sobre o catálogo"
permalink: /sobre/
---

# Sobre o catálogo

O **Catálogo de Políticas** da **[Rede EJA e Inclusão Produtiva]({{ equipe.redeUrl }})** reúne experiências e referências relacionadas à Educação de Jovens, Adultos e Idosos no Brasil. Permite conhecer suas finalidades, os territórios envolvidos e as fontes disponíveis para aprofundar a pesquisa.

O catálogo parte do direito à educação ao longo da vida e da responsabilidade do Estado por sua garantia. A participação de organizações da sociedade civil contribui para o conhecimento e o aperfeiçoamento das políticas e instituições públicas.

A relação entre educação e trabalho abrange trabalho remunerado, trabalho doméstico, cuidados, direitos, desigualdades e participação social. A qualificação profissional integra esse conjunto, que inclui também a formação crítica e a compreensão das relações sociais a partir da experiência de vida dos estudantes.

## O que o acervo permite consultar

O acervo reúne **{{ agregados.total }} verbetes únicos**: {{ agregados.federaisCount }} federais e {{ agregados.estaduaisUnicasCount }} estaduais e distritais. Reúne políticas, programas, planos, serviços e outras experiências relacionadas à educação, ao trabalho, à inclusão produtiva e à proteção social. Cada política federal é contada uma única vez, mesmo quando executada em vários estados.

A presença de uma experiência no catálogo não significa recomendação, comprovação de eficácia ou confirmação de oferta atual. As fichas distinguem as informações das fontes e as observações da pesquisa.

As fichas organizam o conteúdo disponível em **Identificação, Finalidade, Território e Referências**. Lacunas são sinalizadas, sem preenchimento por inferência. Referências e links oficiais aparecem quando identificados no levantamento. Para parte das políticas, a equipe guarda uma cópia de arquivo para auditoria e proteção contra links quebrados; essa cópia não é publicada no site.

Veja [como consultar o catálogo](/sobre/comece-por-aqui/) e [como interpretar as fichas e suas referências](/sobre/metodologia/).

## <a id="rede-eja"></a>A Rede EJA e Inclusão Produtiva

A Rede EJA e Inclusão Produtiva nasce para colocar o desafio da educação de jovens e adultos e da inclusão produtiva em evidência: produzir e disseminar conhecimento, reunir experiências e referências sobre políticas públicas, articular gestores públicos, sociedade civil, setor produtivo e organismos internacionais e incidir no debate nacional e nas políticas públicas, oferecendo dados e referências para a tomada de decisão. É formada por 16 instituições da sociedade civil e organismos multilaterais.

{% include "components/painel-rede.njk" %}

## Pesquisa e desenvolvimento

O levantamento das políticas, a curadoria das fichas e o desenvolvimento deste site são feitos por:

- **[Centro para o Estudo da Riqueza e da Estratificação Social (Ceres/IESP-UERJ)](https://iesp.uerj.br/nucleo/ceres/)**
- **[Laboratório de Monitoramento e Avaliação de Políticas e Eleições (MAPE)](https://mape.org.br/)**
- **[Instituto de Estudos Sociais e Políticos (IESP-UERJ)](https://iesp.uerj.br/)**

## Apoio ao levantamento

O levantamento que deu origem ao catálogo foi realizado no âmbito do {{ equipe.programaGuarda }}, com:

- **Realização**: [Fundação Roberto Marinho](https://www.frm.org.br/) · [Fundação Bradesco](https://fundacao.bradesco/)
- **Parceiros**: [Fundação Itaú — Itaú Educação e Trabalho](https://www.itaueducacaoetrabalho.org.br/) · [Fundação Arymax](https://arymax.org.br/)
- **Cooperação**: [UNESCO](https://www.unesco.org/pt) — Organização das Nações Unidas para a Educação, a Ciência e a Cultura

## Equipe

### Coordenação

- **Rogério Jerônimo Barbosa** — Coordenação Geral
- **Hellen Guicheney** — Gerência Técnica e Integração das Equipes
- **Bruno Schaefer** — Coordenação da frente OQF
- **Maria Clara da Gama** — Coordenação da frente de Políticas

### Pesquisa

- **Maria Clara da Gama** — Coordenação da pesquisa
- **Maria Julieta Ramalho Garcia**
- **Cintia Maria Frazão**
- **Jaqueline Sant'ana**

### Design do aplicativo e site

- **Rogério Jerônimo Barbosa**

## Documentos institucionais

- [Metodologia e fontes](metodologia/) — fontes, critérios da pesquisa e interpretação das contagens.
- [Acesso à informação](transparencia/) — atualizações, histórico e canais de contribuição.
- [Política de privacidade (LGPD)](privacidade/) — coleta, finalidade, retenção, transferência internacional.
- [Termos de uso](termos/) — licença CC BY 4.0, atribuição, redistribuição.
- [Acessibilidade](acessibilidade/) — recursos de navegação e limites das verificações.
- [Cobertura do catálogo](cobertura/) — quais UFs entraram em cada onda do levantamento.

## <a id="como-citar"></a>Como citar o catálogo

```
BARBOSA, R. J. (org.). Catálogo de Políticas da Rede EJA e Inclusão
Produtiva. Versão {{ site.versao }}. Rio de Janeiro: Rede EJA e Inclusão
Produtiva, 2026. Disponível em:
https://antrologos.github.io/catalogo-politicas/.
```

**Como citar um verbete específico:** o bloco **Referências** de cada ficha oferece a opção **Como citar esta ficha**, com formatos ABNT, APA, BibTeX e RIS prontos para copiar. A autoria dos verbetes é da equipe de pesquisa (Maria Clara da Gama, Maria Julieta Ramalho Garcia, Cintia Maria Frazão, Jaqueline Sant'ana), com Rogério Barbosa como organizador da obra e publicação pela Rede EJA e Inclusão Produtiva.

## Repositório

- **Código + dados em JSON**: [github.com/antrologos/catalogo-politicas](https://github.com/antrologos/catalogo-politicas)
- **Reportar erro / sugerir inclusão**: [issues do repositório](https://github.com/antrologos/catalogo-politicas/issues/new)
