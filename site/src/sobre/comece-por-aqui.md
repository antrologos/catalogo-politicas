---
layout: layouts/base.njk
title: "Comece por aqui"
description: "Três caminhos curados de entrada no Catálogo de Políticas Públicas Brasileiras — para técnico estadual, pesquisador acadêmico ou curioso sem ideia clara."
permalink: /sobre/comece-por-aqui/
---

{% set crumbs = [
  { texto: "Início", href: "/" },
  { texto: "Sobre", href: "/sobre/" },
  { texto: "Comece por aqui" }
] %}
{% include "components/breadcrumb.njk" %}

# Comece por aqui

Três caminhos curados pelas formas mais comuns de chegar ao catálogo. Escolha o que mais se aproxima do que você procura — cada um aponta para uma ficha-modelo onde dá pra ver toda a estrutura na prática.

---

## Você é técnico ou coordenador estadual?

Você provavelmente quer **comparar como sua UF organiza uma política com o que outros estados estão fazendo**, ou descobrir se uma política federal já tem réplica local executada.

**Caminho recomendado**:

1. Use a [busca](/buscar/) com a sigla ou tema (ex.: <a href="/buscar/?q=PRONATEC">PRONATEC</a>, <a href="/buscar/?q=EJA">EJA</a>).
2. Abra a ficha federal canônica — verá um bloco **"Esta política federal é executada em N UFs do catálogo"** com chips clicáveis.
3. Compare a versão da sua UF com 1-2 vizinhas usando a aba **Detalhes**.
4. Para visão agregada, vá em [/comparacao/](/comparacao/).

**Ficha-modelo**: [PRONATEC (federal canônica) →](/politica/programa-nacional-de-acesso-ao-ensino-tecnico-e-emprego-pronatec-br/)

---

## Você é pesquisador ou estudante de pós?

Você provavelmente quer **citar uma política em artigo, monografia ou relatório**, ou usar o catálogo como fonte primária de pesquisa.

**Caminho recomendado**:

1. Encontre a ficha pela [busca](/buscar/) ou pelo [hub /explorar/](/explorar/).
2. Na ficha, abra a aba **Como citar** — disponível em ABNT, APA, BibTeX e RIS, com botão Copiar individual.
3. **Bônus**: o site expõe meta tags Highwire Press no `<head>` de cada ficha. Se você usa o **conector Zotero ou Mendeley** no navegador, basta clicar no ícone do gerenciador para importar a referência completa, sem copiar/colar.
4. Para estatísticas agregadas (distribuições, cobertura), veja a [página inicial](/).

**Ficha-modelo**: [ENCCEJA (federal) →](/politica/exame-nacional-para-certificacao-de-competencias-de-jovens-e-adultos-encceja-br/)

---

## Você é gestor curioso, jornalista ou está chegando aqui pela primeira vez?

Você quer entender **o que existe, o que está ativo, o que mudou** — sem precisar saber nomes de programas de antemão.

**Caminho recomendado**:

1. Vá ao [hub /explorar/](/explorar/) — verá 7 cards visuais por dimensão (tipo, situação, modalidade, abrangência, UF, origem, snapshot).
2. Comece pela situação **"Ativa em execução"** ou pelo tipo **"Educacional direta"** para ver as políticas ainda vigentes.
3. Cada card de dimensão leva a uma página índice com KPIs e tabela completa.
4. Tags coloridas no header de cada ficha são clicáveis — encontrou "Modalidade EAD"? Clique e veja outras políticas na mesma modalidade.
5. Não sabe sigla? A [busca](/buscar/) reconhece termos coloquiais — *"curso pra adulto"*, *"voltar a estudar"*, *"transferência de renda"*.

**Ficha-modelo**: [EJA Federal (canônica, com 7 réplicas estaduais) →](/politica/educacao-de-jovens-e-adultos-eja-br/)

---

## O que você vai encontrar em cada ficha

Toda ficha do catálogo segue a mesma estrutura — uma vez que você se familiariza com uma, todas fazem sentido:

- **Header**: nome do programa + chips clicáveis (Situação, UF/Federal, Tipo, Modalidade) + ID universal + completude dos metadados
- **Bloco "Aparece em N UFs"** (apenas em fichas federais canônicas): chips das UFs onde a política tem execução estadual
- **5 abas**: Resumo · Detalhes · Base legal · Documentos (com snapshot integral capturado quando disponível) · **Como citar** (4 formatos)
- **Continue explorando** (rodapé): outras fichas relacionadas (mesma família federal, mesmo tipo na UF, mesma modalidade na UF)
- **Proveniência** (fim): revisor, próxima revisão, versão do catálogo, ID interno

---

## Glossário e siglas

Vocabulário técnico opaco? O [Glossário](/sobre/glossario/) tem 32 termos das áreas de educação, qualificação profissional, assistência social e estatística com definição curta e contexto.

Em qualquer página do site, siglas como {% abbr "EJA" %}, {% abbr "PRONATEC" %}, {% abbr "BPC" %} ou {% abbr "CRAS" %} aparecem com sublinhado pontilhado e mostram a expansão ao passar o mouse — sem precisar sair da página.

---

## Ainda perdido?

- **Cobertura e limites** — [/sobre/cobertura/](/sobre/cobertura/) explica quais 9 UFs estão na 1ª onda, por que essas e quais vêm a seguir.
- **Metodologia** — [/sobre/](/sobre/) traz equipe, vocabulário canônico, licença CC-BY 4.0 e cronograma.
- **Erro encontrado?** Cada ficha tem link "Abrir issue no GitHub" no rodapé.