# E.1.C — Atlas Violência IPEA + dashboards executivos por UF

> Output do agent que aprofundou Atlas da Violência IPEA + Atlas Brasil PNUD (perfil) + Painel Monitora MDS, com lente "gestor de PE com 10 minutos para entender o estado".

## Análise comparativa dos 3 atlas

| Aspecto | Atlas Violência IPEA | Atlas Brasil PNUD | Monitora MDS |
|---|---|---|---|
| **Entrada rápida** | Filtros sequenciais ❌ | Perfil pré-renderizado ✅ | KPI dashboard ✅ |
| **Visualização primária** | Tabelas + infográficos | Gráficos + mapa | KPI cards + mapa |
| **Comparação** | Manual (2 abas) ❌ | Integrada (dropdown) ✅ | Implícita (Brasil baseline) |
| **Granularidade geo** | UF + Brasil | Município + estado + região | Município + estado |
| **Série temporal** | Longa (1979–2022) ✅ | Média (20 anos) ✅ | Curta (3-5 anos) |
| **Foco primário** | Análise temática | Desenvolvimento humano | Gestão operacional |
| **Performance visual** | Datado ⚠️ | Moderno ✅ | Médio |

### O que cada um faz melhor

1. **Atlas Violência**: série temporal longa + API pública (40 anos; integrável)
2. **Atlas Brasil**: comparação integrada + 360+ indicadores (lado-a-lado em gráficos; cobertura ampla)
3. **Monitora MDS**: KPI destaque + dados quase-real-time (gestor sabe impacto em 3s)

## Especificação Wireframe #6 — Página executiva por UF

**Propósito**: gestor de PE com 10 min entende "o que temos no estado" sem fricção
**URL**: `/uf/<sigla>` (ex.: `/uf/pe`) — bookmarkável

### Layout (top-to-bottom)

#### 1. Cabeçalho
```
[Home] / [Todas as UFs] / Pernambuco              [🔍 Buscar nesta UF]

🗺️  PERNAMBUCO — Catálogo de Políticas Públicas
Última atualização: 01/05/2026
[📥 Exportar Resumo] [⚖️ Comparar com outra UF] [Voltar]
```

#### 2. KPI Cards (4-5 cards proeminentes)
- **47** Políticas Total
- **12** Federais Replicadas
- **35** Estaduais Únicas
- **5/9** Eixos Cobertos
- *Última revisão*: 01/05/2026

#### 3. Distribuição por Eixo (gráfico horizontal, clicável)
```
Educação/EJA      ████████████░░░░  15 (31%)
Qualificação      █████████░░░░░░░░   9 (19%)
Trabalho/Inclusão ████████████░░░░  12 (25%)
Assistência       ███░░░░░░░░░░░░░░   5 (10%)
Inovação          ██░░░░░░░░░░░░░░░   3 (6%)
Outras            ░░░░░░░░░░░░░░░░░   3 (6%)
```
Clique em barra → filtra lista abaixo (UX reativa)

#### 4. Filtros locais (linha compacta)
```
Eixo: [Todos ▼]  Situação: [Todos ▼]  Tipo: [Todos ▼]
Resultado: 47 políticas
```
Cada dropdown mostra **contagem ao vivo** (ex.: "Ativa (32)" / "Planejamento (8)")

#### 5. Lista de políticas (tabela, paginada se >20)
```
# │ Nome                           │ Eixo │ Situação    │ Ação
1 │ Programa Ler Brasil            │ EDU  │ Ativa       │ [→ Ver]
2 │ EJA Integrada Qualificação     │ EDU  │ Ativa       │ [→ Ver]
3 │ ProJovem Integrado             │ QUAL │ Ativa       │ [→ Ver]
4 │ Política Currículo PE          │ EDU  │ Planejamento│ [→ Ver]
```

#### 6. Comportamento
- Filtro por eixo (clique barra) + dropdown = interseção
- URL muda com filtros: `/uf/pe?eixo=EDU&situacao=ativa` (bookmarkável)
- Sem limite linhas — paginação ou lazy-load

## Especificação Wireframe #1 — Home / Dashboard agregado nacional

**URL**: `/` (homepage)

### Layout

#### 1. Header de navegação
- Logo: `🏛️ FRM Catálogo de Políticas Públicas`
- Botão "Busca Avançada"
- Menu (mobile: hambúrguer)

#### 2. Hero — busca proeminente
```
🔍  Buscar políticas por nome, eixo, localidade...

[Busca Avançada] [Usar Filtros] [Exemplo: "EJA SP"]
```

#### 3. KPI Agregados (3 cards grandes)
- **439** Políticas Mapeadas
- **9 estados + Federal** (+ Municipal — expansão)
- **Atualizado em 01/05/2026** (47 novas/revisadas neste mês)

Distribuição: 🟦 EDU (188) | 🟩 TRAB (160) | 🟪 PSOC (91)

#### 4. Mapa Brasil clicável (coroplético)
- Cor proporcional ao nº de políticas por UF
- Hover mostra "SP: 87 políticas"
- Clique → leva para `/uf/sp`
- Legenda escala 0-20 / 21-40 / 41-60 / 61+
- Alternativa mobile: lista ordenada (se mapa pequeno demais)

#### 5. Fichas em destaque (3-5 cards, com abas)
Abas: **Mais consultadas** | Mais recentes | Em revisão

Cada card: ícone eixo + título + esfera + eixo + data + botão "Ver ficha completa →"

#### 6. Acesso Rápido (4 atalhos)
- 📊 Comparar Estados
- 🔍 Busca Avançada
- ℹ️ Sobre os dados
- 📥 API/Dados Abertos

#### 7. Footer
Sobre | Metodologia | Contato | Licença CC-BY 4.0 | GitHub

## Top 5 features a importar (com URL precisa)

1. **EUR-Lex CELEX como ID universal + deep linking** (eur-lex.europa.eu/legal-content/PT/TXT/?uri=CELEX%3A32016R0679) — schema com `id_universal` (imutável) separado de `slug` (bookmarkável); redirect old → new
2. **data.gouv.fr badge de qualidade** — campo `completude_pct` calculado; badge no card (verde 90+, amarelo 70-89, vermelho <70)
3. **OECD Education GPS rede visual de políticas** (gpseducation.oecd.org/revieweducationpolicies) — página `/grafo` com nós (políticas) e arestas tipadas (substitui/altera/regulamenta/citada-por). D3.js ou Cytoscape.js
4. **CourtListener Authorities + Citator** — ficha mostra "Esta política é citada por X" e "Esta política cita X"
5. **GovTrack alertas granulares por TAG** — schema com `tags` (vocabulário fechado); endpoint `/api/subscribe?tag=educacao`

## Top 5 anti-padrões a evitar

1. **Planalto** — links sem snapshot e sem responsividade. Solução: `fonte_arquivo_path` + `fonte_data_acesso` + botão "Ver no oficial [↗]" + "Baixar snapshot local [↓]"
2. **MDS** — fragmentação subdomínios sem design system. Solução: URL canônica única + componentes padronizados (Storybook)
3. **gov.br/serviços** — paginação cega sem contadores. Solução: "47 de 439 políticas (mostrando 1-20)" + facetas com contagem antes do clique
4. **ObservaSampa/Atlas Violência** — sem citação acadêmica formatada. Solução: botão "Copiar Citação" em cada ficha (APA/ABNT/BibTeX)
5. **Catálogo IPEA** — homepage sem contagem total. Solução: "439 políticas | 9 estados+Federal | Atualizado DD/MM/AAAA" + 3-5 fichas em destaque

## Próximos passos (E.4)

1. Refinar wireframes #6 e #1 com prototipagem (estados interativos, hover, dropdown filters, loading, erro)
2. Validar responsividade mobile
3. Especificar dataset de políticas de teste para validar mockups
4. Criar Design System Storybook
5. Validar com 2-3 gestores reais (teste A/B home vs /uf vs busca)
6. Especificar endpoints API (Bloco F): `/api/politica/<id>`, `/api/uf/<sigla>`, `/api/search?...`, `/api/subscribe?...`