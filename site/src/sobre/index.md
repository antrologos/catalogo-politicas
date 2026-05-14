---
layout: layouts/base.njk
title: "Sobre o catálogo"
permalink: /sobre/
---

# Sobre o catálogo

O **Catálogo de Políticas** é uma das frentes do **Projeto Juventudes Fora da Escola sem Educação Básica**, da iniciativa **Rede EJA e Inclusão Produtiva**.

Reúne **{{ agregados.total }} políticas públicas únicas** federais e estaduais sobre Educação de Jovens e Adultos (EJA), qualificação profissional, inclusão produtiva e transferência de renda condicionada à educação — sendo {{ agregados.federaisCount }} políticas federais e {{ agregados.estaduaisUnicasCount }} políticas exclusivamente estaduais (cada uma cadastrada uma única vez, mesmo quando a federal é executada em vários estados). Para cada política, o catálogo registra metadados estruturados (vocabulário canônico controlado), referência à norma instituidora e, quando possível, **preservação do texto integral da norma**.

<figure class="my-xl bg-white p-md rounded border border-neutral-200">
  <img src="/assets/img/logos/barra-logos.png"
       alt="Logotipos das instituições envolvidas, organizadas por categoria. Iniciativa: Rede EJA e Inclusão Produtiva. Realização: Fundação Roberto Marinho e Fundação Bradesco. Parceiros: Fundação Itaú Educação e Trabalho e Fundação Arymax. Cooperação: UNESCO. Parceria Técnica: Ceres, MAPE e IESP-UERJ."
       class="w-full h-auto"
       loading="lazy">
  <figcaption class="visually-hidden">Barra institucional do projeto.</figcaption>
</figure>

## Iniciativa

**Rede EJA e Inclusão Produtiva** — articulação interinstitucional dedicada à integração entre EJA, qualificação profissional e inclusão produtiva como caminho para superar a desigualdade educacional brasileira.

## <a id="rede-eja"></a>Instituições que compõem a Rede EJA e Inclusão Produtiva

A Rede EJA e Inclusão Produtiva é uma articulação de organizações da sociedade civil, fundações, agências da ONU e do setor empresarial dedicadas à educação de jovens e adultos e à inclusão produtiva no Brasil. **Compor a Rede não significa realizar diretamente esta pesquisa nem ter cooperação técnica específica neste catálogo** — trata-se do espaço de articulação onde o estudo se inscreve. Os papéis institucionais específicos deste catálogo aparecem mais abaixo (Realizadores, Parceiros, Cooperação, Parceria Técnica).

<div class="grid sm:grid-cols-2 gap-2xs my-md not-prose">
{% for inst in equipe.redeEja %}
  <p class="m-0 py-2xs">
    {% if inst.url %}<a href="{{ inst.url }}" rel="external">{{ inst.nome }}</a>{% else %}{{ inst.nome }}{% endif %}
  </p>
{% endfor %}
</div>

## Realizadores

- **[Fundação Roberto Marinho (FRM)](https://www.frm.org.br/)**
- **[Fundação Bradesco](https://www.fundacaobradesco.org.br/)**

## Parceiros

- **[Fundação Itaú Educação e Trabalho](https://www.fundacaoitau.org.br/educacao-e-trabalho)**
- **[Fundação Arymax](https://arymax.org.br/)**

## Cooperação

- **[UNESCO](https://www.unesco.org/pt)** — Organização das Nações Unidas para a Educação, a Ciência e a Cultura

## Parceria Técnica

- **[Centro para o Estudo da Riqueza e da Estratificação Social (Ceres/IESP-UERJ)](https://ceres-iesp.uerj.br/)**
- **[Laboratório de Monitoramento e Avaliação de Políticas e Eleições (MAPE)](https://mape.org.br/)**
- **[Instituto de Estudos Sociais e Políticos (IESP-UERJ)](http://www.iesp.uerj.br/)**

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

- [Metodologia e alcance](metodologia/) — **levantamento, não censo**; como ler as contagens corretamente.
- [Acesso à informação (LAI)](transparencia/) — política de revisão, histórico, canal de relato.
- [Política de privacidade (LGPD)](privacidade/) — coleta, finalidade, retenção, transferência internacional.
- [Termos de uso](termos/) — licença CC BY 4.0, atribuição, redistribuição.
- [Acessibilidade](acessibilidade/) — declaração WCAG 2.2 AA + eMAG 3.1 + Lei 13.146/2015.
- [Cobertura e limites](cobertura/) — por que 9 UFs? O que ainda falta?

## Como citar o catálogo

```
BARBOSA, R. J. (org.). Catálogo de Políticas — Projeto Juventudes Fora
da Escola sem Educação Básica. Rede EJA e Inclusão Produtiva.
Rio de Janeiro: Ceres/IESP-UERJ, 2026. Disponível em:
https://antrologos.github.io/catalogo-politicas/.
```

**Como citar um verbete específico:** cada ficha de política tem aba "Como citar" com formatos ABNT, APA, BibTeX e RIS prontos para copiar. A autoria dos verbetes é da equipe de pesquisa (Maria Clara da Gama, Maria Julieta Ramalho Garcia, Cintia Maria Frazão, Jaqueline Sant'ana), com Rogério Barbosa como organizador da obra e publicação pelo Ceres/IESP-UERJ.

## Repositório

- **Código + dados em JSON**: [github.com/antrologos/catalogo-politicas](https://github.com/antrologos/catalogo-politicas)
- **Reportar erro / sugerir inclusão**: [issues do repositório](https://github.com/antrologos/catalogo-politicas/issues/new)