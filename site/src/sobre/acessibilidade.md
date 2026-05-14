---
layout: layouts/base.njk
title: "Acessibilidade"
permalink: /sobre/acessibilidade/
description: "Declaração formal de conformidade com WCAG 2.2 AA, eMAG 3.1 e Lei Brasileira de Inclusão (Lei 13.146/2015)."
---

# Declaração de acessibilidade

O **Catálogo de Políticas** busca conformidade com:

- **[WCAG 2.2 nível AA](https://www.w3.org/TR/WCAG22/)** — Web Content Accessibility Guidelines do W3C;
- **[eMAG 3.1](https://emag.governoeletronico.gov.br/)** — Modelo de Acessibilidade em Governo Eletrônico do Brasil;
- **[Lei Brasileira de Inclusão (Lei 13.146/2015)](http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2015/lei/l13146.htm)** — Estatuto da Pessoa com Deficiência.

## Práticas adotadas

### Estrutura semântica
- HTML5 semântico (`<main>`, `<nav>`, `<article>`, `<section>`, `<aside>`).
- Hierarquia de cabeçalhos correta (um único `<h1>` por página; `<h2>`/`<h3>` aninhados).
- Tabelas com `<caption>`, `<th scope="col">` e `<th scope="row">`.
- Listas semânticas (`<ul>`, `<ol>`, `<dl>`) onde apropriado.

### Navegação por teclado
- **Tab order** lógico, ditado pela ordem do DOM (sem `tabindex` positivo).
- **Skip-link** ("Pular para o conteúdo principal") visível ao receber foco.
- **Foco visível** com contorno amarelo (`#ffdd00`) de 3px + offset 2px + sombra interna preta — combinação testada para passar contraste em qualquer fundo (padrão gov.uk).
- **Atalho `/`** foca a caixa de busca.
- **Tabs ARIA W3C-compliant** (Authoring Practices Guide) nas fichas individuais: setas ←→ entre abas, Home/End para primeira/última, Enter/Space ativa.

### Cor e contraste
- **Contraste mínimo 4.5:1** para texto normal e **3:1** para componentes de UI (verificado em CI a cada commit via pa11y-ci com padrão WCAG 2 AA).
- **Cor nunca é o único indicador**: tags de status sempre incluem ícone (`●`, `■`, `▲`, `○`, `◆`) + texto + cor.

### Suporte a tecnologia assistiva
- Atributos `aria-label`, `aria-current`, `aria-describedby` onde necessário.
- Live regions (`role="status" aria-live="polite"`) para feedback de cópia de citação e contagem de resultados de busca.
- Ícones decorativos com `aria-hidden="true"`; ícones funcionais com `aria-label`.
- Texto alternativo em todas as imagens (atualmente o site não usa imagens decorativas).

### Movimento e animação
- Respeito a `@media (prefers-reduced-motion: reduce)` — desliga todas as animações para usuários com sensibilidade vestibular.

### Toques táteis (mobile)
- Alvos interativos com **mínimo 44×44 pixels** (botões, links, checkboxes) conforme padrão gov.uk.

## Limitações conhecidas

Esta declaração é honesta sobre o que ainda **não está validado**:

- **Auditoria automatizada** (pa11y-ci) roda a cada deploy nas páginas Home, Buscar, Sobre e Política de Privacidade. **Não cobre todas as fichas individuais** (assumimos que o template é uniforme).
- **Auditoria manual com leitor de tela** (NVDA + Firefox, JAWS + Edge, VoiceOver + Safari) ainda não foi realizada formalmente. Está prevista para o lançamento público (pós-MVP).
- **VLibras** (tradução automática para Libras) ainda não foi integrado. Está previsto para sprint posterior.
- **Versão alto-contraste** ainda não está disponível como toggle, mas o site respeita `prefers-color-scheme: dark` parcialmente.
- **Mapa coroplético** (já em produção) e visualizações de rede (em estudo) sempre terão **lista textual paralela canônica** como fonte acessível por padrão.

## Tecnologias compatíveis

Testado em (auditoria automatizada):

- **Chrome / Edge** (versões atuais)
- **Firefox** (versão atual)

Esperado funcionar bem em:

- **Safari** (versão atual)
- **Leitores de tela**: NVDA, JAWS, VoiceOver, TalkBack — auditoria manual pendente.

## Conformidade

- **WCAG 2.2 AA**: conformidade automatizada validada em CI; conformidade manual completa pendente.
- **eMAG 3.1**: aderência aos princípios; checklist formal pendente.
- **Lei 13.146/2015**: site é gratuito, sem barreiras técnicas conhecidas; canal de relato disponível abaixo.

## Encontrou uma barreira?

Se você encontrou alguma dificuldade de acesso, **queremos saber**. Não consideramos isso uma queixa, mas sim **informação valiosa para melhorar**.

Canais:

1. **[Abrir issue no GitHub](https://github.com/antrologos/catalogo-politicas/issues/new?title=Acessibilidade:+)** (preferido — público e rastreável).
2. **E-mail institucional** com a coordenação.

**SLA público: análise em até 30 dias** (mais rápido que o SLA geral porque acessibilidade é prioritária).

## Compromisso de melhoria contínua

A acessibilidade é uma prática contínua, não um estado final. Cada nova versão do catálogo passa por:

- **Auditoria automática WCAG 2 AA** em CI (bloqueia deploy se falhar);
- **Auditoria de Lighthouse** para acessibilidade (alvo: pontuação ≥ 95);
- **Revisão manual** de novos componentes complexos (Tabs, mapa) com leitor de tela.

## Revisão desta declaração

- **Última atualização**: 2026-05-01.
- **Próxima revisão prevista**: a cada release do catálogo.