---
layout: layouts/base.njk
title: "Sobre o catálogo"
permalink: /sobre/
---

# Sobre o catálogo

O **Catálogo de Políticas** é um produto permanente da **[Rede EJA e Inclusão Produtiva]({{ equipe.redeUrl }})**. Integra as *evidências* que a Rede reúne e disponibiliza para qualificar o debate e as decisões sobre Educação de Jovens e Adultos e inclusão produtiva no Brasil.

Reúne **{{ agregados.total }} políticas públicas únicas** federais e estaduais sobre Educação de Jovens e Adultos (EJA), qualificação profissional, inclusão produtiva e transferência de renda condicionada à educação — sendo {{ agregados.federaisCount }} políticas federais e {{ agregados.estaduaisUnicasCount }} políticas exclusivamente estaduais (cada uma cadastrada uma única vez, mesmo quando a federal é executada em vários estados). Para cada política, o catálogo registra metadados estruturados (vocabulário canônico controlado), referência à norma instituidora e, quando possível, **preservação do texto integral da norma**.

## <a id="rede-eja"></a>A Rede EJA e Inclusão Produtiva

A Rede EJA e Inclusão Produtiva nasce para colocar o desafio da educação de jovens e adultos e da inclusão produtiva em evidência: produzir e disseminar conhecimento, mapear políticas que funcionam, articular gestores públicos, sociedade civil, setor produtivo e organismos internacionais e incidir no debate nacional e nas políticas públicas, oferecendo dados e referências para a tomada de decisão. É formada por 16 instituições da sociedade civil e organismos multilaterais.

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

- [Metodologia e alcance](metodologia/) — **levantamento, não censo**; como ler as contagens corretamente.
- [Acesso à informação (LAI)](transparencia/) — política de revisão, histórico, canal de relato.
- [Política de privacidade (LGPD)](privacidade/) — coleta, finalidade, retenção, transferência internacional.
- [Termos de uso](termos/) — licença CC BY 4.0, atribuição, redistribuição.
- [Acessibilidade](acessibilidade/) — declaração WCAG 2.2 AA + eMAG 3.1 + Lei 13.146/2015.
- [Cobertura e limites](cobertura/) — quais UFs entraram em cada onda do levantamento.

## <a id="como-citar"></a>Como citar o catálogo

```
BARBOSA, R. J. (org.). Catálogo de Políticas da Rede EJA e Inclusão
Produtiva. Versão {{ site.versao }}. Rio de Janeiro: Rede EJA e Inclusão
Produtiva, 2026. Disponível em:
https://antrologos.github.io/catalogo-politicas/.
```

**Como citar um verbete específico:** cada ficha de política tem aba "Como citar" com formatos ABNT, APA, BibTeX e RIS prontos para copiar. A autoria dos verbetes é da equipe de pesquisa (Maria Clara da Gama, Maria Julieta Ramalho Garcia, Cintia Maria Frazão, Jaqueline Sant'ana), com Rogério Barbosa como organizador da obra e publicação pela Rede EJA e Inclusão Produtiva.

## Repositório

- **Código + dados em JSON**: [github.com/antrologos/catalogo-politicas](https://github.com/antrologos/catalogo-politicas)
- **Reportar erro / sugerir inclusão**: [issues do repositório](https://github.com/antrologos/catalogo-politicas/issues/new)