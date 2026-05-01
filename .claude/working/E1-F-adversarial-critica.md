# E.1.F — Crítica adversarial dos outputs E.1.A–E

> Output do agent ADVERSARIAL: leu integralmente os 5 outputs anteriores (E.1.A, B, C, D, E) e criticou pressupostos, identificou blind spots, apontou vieses, sugeriu o que ficou de fora. Missão explícita: "discordar com fundamento; achar buracos".

## 5 blind spots críticos identificados

### Blind spot 1 — LGPD não foi tratada como obrigatória

**O que foi dito (E.1.E):** "Se houver analytics → banner LGPD obrigatório".

**Crítica:** Mesmo SEM analytics, Lei 13.709/2018 exige Política de Privacidade visível em qualquer site brasileiro de interesse público que possa ser identificado por usuário (logs de servidor já são dados pessoais). Não é "se houver analytics" — é **obrigatório**.

**Recomendação:**
- Página `/sobre/privacidade` obrigatória no MVP (não opcional).
- Declarar explicitamente: "Este site coleta apenas logs de acesso anonimizados, retidos por X dias, para finalidade de Y."
- Se houver hospedagem fora do Brasil (Vercel, Netlify), declarar transferência internacional.

### Blind spot 2 — Viés de seleção: 9 UFs ≠ Brasil

**O que foi dito (E.1.A, C):** especificações de "comparação inter-UF", "wireframe executivo por UF", "439 políticas em 9 estados + Federal".

**Crítica:** O catálogo tem **9 UFs específicas** (não amostra aleatória, não todas as 27). Apresentar como "Brasil" no MVP é **enganoso e tendencioso**. Gestor de UF não-coberta (ex.: Acre, Roraima) verá Mapa Brasil colorido em SP/MG/BA/PE/etc e seu estado em cinza — pode interpretar mal ("não temos políticas?" / "fomos esquecidos?").

**Recomendação:**
- Mapa Brasil **deve ter legenda visível** em todo lugar: "Catálogo cobre 9 UFs (SP, MG, BA, PE, ...). Outras UFs em fase de inclusão futura."
- Footer + Home + cada Wireframe UF: bloco "Próximas UFs" com cronograma transparente.
- Página `/sobre/cobertura` explicando critério de seleção (por que essas 9? como foram escolhidas?).
- **Não dizer "Brasil"** quando os dados são "9 UFs". Dizer "9 UFs do catálogo" / "amostra catalogada".

### Blind spot 3 — Manutenção pós-MVP foi ignorada

**O que foi dito (todos):** features ricas (badge multidimensional, relacionamentos tipados, 8 wireframes, design system completo).

**Crítica:** Quem mantém o catálogo após o lançamento? Quem revisa as 439 fichas semestralmente? Quem captura snapshots novos quando políticas mudam? Quem responde à página "/sobre/transparencia" se um usuário relata erro? **Sem um plano de manutenção, o catálogo vira lixo digital em 18 meses.**

**Recomendação:**
- **Decisão crítica antes do MVP:** quem mantém? Bolsista FRM? Pesquisadora pós-doc? Estagiária IESP-UERJ?
- Definir **carga de trabalho semanal estimada** (revisão de links quebrados, inclusão de novas políticas, resposta a feedback).
- Definir **gatilho de re-validação** (cron mensal? semestral? por demanda?).
- Se ninguém mantém: **MVP deve ser ainda mais enxuto** (cortar relacionamentos tipados, cortar badge multidimensional, manter só ficha + busca).

### Blind spot 4 — TCO 5 anos não foi calculado

**O que foi dito (E.1.A, B, C, E):** "deploy gratuito Vercel/Netlify/GitHub Pages".

**Crítica:** Site estático é gratuito, mas:
- **Domínio** custa R$ 40-100/ano.
- Se cresce além do free tier (>100GB bandwidth/mês), Vercel/Netlify cobram.
- **Custo de manutenção humana** é o maior — bolsista 4h/semana × 50 semanas × 5 anos = 1.000h.
- Snapshots crescem (148 snapshots × 5 ondas anuais × 5 anos = 3.700+ arquivos). Storage não é zero.

**Recomendação:**
- Calcular **TCO 5 anos** explícito antes de decidir stack:
  - Domínio (R$ 250-500 / 5 anos)
  - Hospedagem (free tier vs pago — definir limite)
  - Manutenção humana (R$ X / mês × 60 meses)
  - Storage snapshots (R$ Y / mês × 60 meses)
- Comparar TCO entre Vercel free, Netlify free, GitHub Pages, hospedagem IESP-UERJ.
- Decisão informada, não "deploy é grátis".

### Blind spot 5 — Marketing/divulgação ausente

**O que foi dito (todos):** focado em UX e arquitetura.

**Crítica:** Catálogo perfeito que ninguém acha **não existe**. Como gestor público de SP descobre que o catálogo existe? SEO? Divulgação institucional? Eventos? Newsletter acadêmica? Twitter/LinkedIn? Sem plano de divulgação, nem o melhor site é encontrado.

**Recomendação:**
- Plano de divulgação como **parte do Bloco F**, não G:
  - Anúncio na lista FRM e IESP-UERJ.
  - Press release para portais acadêmicos (Folha de S. Paulo Educação, Nexo).
  - Apresentação em evento (ANPED, ENGEMA, ANPOCS).
  - Citação acadêmica formal (DOI Zenodo? ISBN?).
- Schema.org + sitemap.xml + robots.txt para SEO desde o MVP.

## 3 features para CORTAR do MVP

### Cortar 1 — Wireframe próprio de mapa (E.1.A, E.1.C)

**Razão:** Plotly.js / D3 mapa coroplético interativo é **complexo, pesa muito (200KB+), exige acessibilidade adicional** (screen reader navega como?), e o valor para o público (gestor que conhece seu próprio estado) é baixo.

**Substituir por:** lista ordenada de UFs com contador. Mais acessível, mais leve, mesmo conteúdo informacional. Mapa pode entrar no Bloco G se houver demanda.

### Cortar 2 — Página "Como adotar uma política" (E.1.B)

**Razão:** Promete o que o catálogo não pode entregar. Gestor que adota política precisa de **manual de implementação real**, não wireframe genérico. Pode gerar **expectativa frustrada** e dano reputacional.

**Substituir por:** ficha individual com seção "Documentos de implementação" linkando o que existir (decretos, portarias, manuais). Sem promessa de "como adotar".

### Cortar 3 — Rede visual de políticas / grafo (E.1.C)

**Razão:** OECD GPS faz isso bem, mas custou anos de iteração. D3.js / Cytoscape.js é **complexo demais para MVP**. Acessibilidade de grafo interativo é desafio sério (screen reader não navega bem em SVG complexo). Valor incremental sobre lista textual de relacionamentos é incerto.

**Substituir por:** lista textual de relacionamentos tipados na ficha. Grafo pode entrar no Bloco G se houver demanda real e tempo.

## 3 features para ADICIONAR ao MVP

### Adicionar 1 — Página 404 cuidadosa

Slugs vão mudar. Links vão quebrar. Página `/404` precisa:
- Buscar o slug requisitado em redirects + sugerir alternativas próximas (fuzzy match).
- Listar 5 políticas mais consultadas como fallback.
- Botão "Reportar link quebrado" pré-preenchido.

### Adicionar 2 — Política de Privacidade + LGPD

Conforme Blind spot 1: obrigatória, não opcional.

### Adicionar 3 — Seção "Próximas UFs" + cronograma transparente

Conforme Blind spot 2: combate viés de seleção, gera transparência metodológica.

## 7 decisões a revisitar com a usuária ANTES de E.2

1. **Público-alvo real:** "gestor público" é muito amplo. Persona prioritária:
   - (a) Secretário/Diretor estadual (decisão estratégica, 5min)
   - (b) Técnico/Coordenador estadual (busca operacional, 30min)
   - (c) Pesquisador acadêmico (uso indireto, mas é o público real do FRM/IESP)
   - **Decisão afeta wireframes (P1).**

2. **Pesquisadores como público secundário formal?** Se sim:
   - Citação acadêmica formatada em todo lugar (já em E.1.B).
   - DOI institucional para o catálogo.
   - **Decisão afeta features de citação (P2).**

3. **Hospedagem real:** Vercel free? GitHub Pages? IESP-UERJ?
   - Vercel/Netlify: free + fácil + dependência externa + transferência internacional (LGPD).
   - GitHub Pages: free + estável + sem domínio próprio fácil.
   - IESP-UERJ: institucional + autonomia + custo de manutenção interno.
   - **Decisão afeta deploy + LGPD (P3).**

4. **Analytics:** Plausible (LGPD-friendly, pago R$ 50/mês), Matomo self-hosted (free + complexo), Google Analytics (free + invasivo + banner LGPD), nada (privacidade total).
   - **Decisão afeta privacidade + insights de uso (P4).**

5. **Manutenção pós-MVP:** quem? carga? gatilho?
   - Sem plano: cortar features.
   - Com plano: pode manter ambição.
   - **Decisão afeta escopo MVP (P5).**

6. **Identidade visual:** gov.uk-inspired (E.1.B) vs gov.br oficial (E.1.E) vs FRM/IESP-UERJ acadêmica?
   - **Decisão afeta paleta + tipografia + tom (P6).**

7. **MVP enxuto = 4 ou 8 wireframes?**
   - 4 (mínimo viável): Home / Busca / Ficha individual / Sobre.
   - 8 (ambicioso): + Comparação inter-UF + Página executiva por UF + 404 + Privacidade.
   - **Decisão afeta tempo de Bloco F (P7).**

## Revisão crítica dos consensos vs divergências entre E.1.A–E

### Consensos fortes (5+ agents concordam)
- **URL determinística com estado** ("Your URL is Your State") — A, B, C, D consensuais.
- **WCAG 2.2 AA mínimo** — A, B, C, D, E consensuais.
- **Citação acadêmica formatada** — A, B, C, D consensuais.
- **Vocabulário canônico controlado** — todos consensuais.
- **Snapshot integral + atribuição** — todos consensuais.

### Divergências
- **Paleta:** gov.uk-inspired (B) vs gov.br oficial (E) vs neutra acadêmica.
- **Mapa coroplético:** A e C insistem; **adversarial discorda** (acessibilidade + peso).
- **Comparação inter-UF profunda:** A insiste; **adversarial questiona** (uso real por gestor é incerto).
- **8 vs 4 wireframes no MVP:** depende de manutenção (decisão 5).

## Conclusão adversarial — recomendação geral

O conjunto E.1.A–E é **rico, mas otimista demais sobre escopo MVP**. Recomendo:

1. **Antes de E.2 (Requisitos MoSCoW):** decidir as 7 questões acima com a usuária.
2. **Cortar 3 features** (mapa, "como adotar", grafo) para ganhar foco.
3. **Adicionar 3 features** (404, privacidade, próximas UFs) para ganhar robustez.
4. **Tratar manutenção e marketing como itens críticos**, não acessórios.
5. **Calcular TCO 5 anos explícito** antes de decidir stack em E.3.

A pergunta certa não é "que features podemos ter?" mas "que features vamos manter funcionando por 5 anos com X horas/semana de bolsista?".