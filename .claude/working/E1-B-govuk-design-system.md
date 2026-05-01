# E.1.B — gov.uk Design System + ObservaSampa para gestores brasileiros

> Output do agent que aprofundou gov.uk Design System (design-system.service.gov.uk) + ObservaSampa (observasampa.prefeitura.sp.gov.br) + gov.br/serviços, com lente "como adaptar para nosso catálogo voltado a gestores".

## gov.uk Design System

### Componentes essenciais (40+ documentados; 12 críticos para FRM)
1. **Button** — estados claros (default, secondary, warning, disabled). UM botão primário por página
2. **Text Input** — labels obrigatórios visíveis (nunca placeholder); hint text; validação inline
3. **Table** — `<caption>` descritiva, `scope` em headers, alinhamento direito para números, responsivo
4. **Tag** — 9 cores semânticas (cinza/verde/teal/azul/roxo/magenta/vermelho/laranja/amarelo); cor + texto SEMPRE
5. **Header & Footer** — padrão gov.uk com navegação serviço separada, rodapé com licença
6. **Tabs, Accordion, Pagination** — para volume sem sobrecarga visual

### Tom de voz / linguagem clara
- "Plain language" — sem jargão técnico de pesquisa
- Frases ativas e imperativas ("Filtrar políticas", não "Opções de filtragem")
- Labels em sentence case (não ALL CAPS), sem dois-pontos finais
- Hints contextuais explicando impacto

### WCAG 2.2 AA (rigoroso)
- Contraste mínimo **4.5:1** texto normal, **3:1** UI
- `aria-describedby` ligando inputs a hints/errors
- Tab order lógico, focus visível em **amarelo (#ffdd00)**
- Cor NUNCA é único indicador

### Tipografia (recomendação para FRM, NÃO usar GDS Transport — proprietária)
- **Open Sans** (Google Fonts, Apache License) — testada em gov.br, ótima legibilidade ✅
- ou **Inter** (GitHub, OFL) — moderna, ótima em telas, boa para data viz ✅

### Paleta recomendada FRM (5 semânticas + 4 neutras, todas WCAG ≥4.5:1)

| Uso | Hex | Contraste | Nota |
|---|---|---|---|
| Primária (ações, links, focus) | `#0066cc` | 8.6:1 | Azul-ciência reconhecível BR |
| Sucesso (ativa) | `#00b050` | 4.54:1 | Bright |
| Erro (revogada) | `#c00000` | 5.9:1 | gov.uk-like |
| Aviso (transição/piloto) | `#ff9800` | 4.52:1 | gov.uk + ObservaSampa |
| Informação (destaque neutro) | `#0a7a7a` | 5.2:1 | Teal calmo |
| Texto principal | `#0b0c0c` | 19:1 | Quase preto |
| Borders/divisores | `#757575` | 4.51:1 | Cinza médio |
| Backgrounds/cards | `#f5f5f5` | N/A | Cinza claro |
| Branco | `#ffffff` | N/A | Padrão |

### Escala de espaçamento (8 tokens)
```css
--spacing-2xs: 4px;
--spacing-xs:  8px;
--spacing-sm:  12px;
--spacing-md:  16px;
--spacing-lg:  24px;
--spacing-xl:  32px;
--spacing-2xl: 48px;
--spacing-3xl: 64px;
```

### Breakpoints (DESKTOP-FIRST — gestores em 13"+)
```css
@media (max-width: 1200px) { /* large desktop */ }
@media (max-width: 992px)  { /* desktop */ }
@media (max-width: 768px)  { /* tablet */ }
@media (max-width: 480px)  { /* mobile */ }
```
Max-width container: 1020px (gov.uk padrão — evita linhas longas).

## ObservaSampa — análise

### O que funciona
- Filtros 3D estruturados (Tema + Nível Regional + Localidade)
- Organização temática clara (cards por tema com link "ver painel completo")
- Integração IBGE (dados padronizados)
- Header navegável

### O que falha
1. **3 dropdowns separados causam fadiga** — sem preview ao vivo do resultado
2. **Sem timestamp visível** — gestor não sabe se dados são 2023, 2024 ou 2025
3. **Sem citação acadêmica formatada**
4. **Falta comparação lado-a-lado** (tipo Atlas Brasil)
5. **Sem export/API claro**

## gov.br — adaptações brasileiras

1. **Segmentação por público** (cidadão/empresa/órgão público/ONG/servidor) — adaptar como faceta "Público-alvo"
2. **Múltiplas vias de busca**: termos mais buscados + search + browse por órgão + browse por tema
3. **Paginação com contadores** — "30, 60 ou TODOS os itens" antes de clicar

## 12 componentes mínimos para FRM

| # | Componente | Propósito |
|---|---|---|
| 1 | Button | CTA primária/secundária; estados (default/hover/active/disabled/loading) |
| 2 | Search Input | Busca full-text proeminente; lupa + autocomplete |
| 3 | Filter/Facet | Filtros vocabulário canônico; checkbox + label + contador ao vivo |
| 4 | Tag | Status política (ativa/revogada/piloto); 9 variações semânticas |
| 5 | Card | Resumo de política; título + excerpt + tags + botão "Ver" |
| 6 | Table | Comparação lado-a-lado; caption + scope; números à direita |
| 7 | Badge | Completude metadados ("Bon 100%"); pequeno, não-clicável |
| 8 | Citation Box | Bloco "Como citar" com APA/ABNT/BibTeX + copiar |
| 9 | Tabs | Organizar seções (Descrição/Documentos/Relacionadas) |
| 10 | Pagination | Página 2 de 44 + próximo/anterior + ir para |
| 11 | Footer | Logo FRM/IESP + links (Sobre/Termos/Contato/CC-BY-4.0) |
| 12 | Navigation/Header | Sticky no topo; logo clicável → home; busca integrada |

## Top 5 padrões gov.uk para importar

1. **Text Input com Labels Explícitas + Hint** (design-system.service.gov.uk/components/text-input/) — sem labels = 40% erro de usuário
2. **Table com Caption + Scope Headers** — comparação acessível para leitores de tela
3. **Tag com 9 Variações Semânticas** — status crítico (Ativa/Revogada/Piloto)
4. **Button States** — evita múltiplos botões primários
5. **WCAG 2.2 AA via aria-describedby + 4.5:1** — Lei Brasileira de Inclusão (13.146/2015)

## Top 3 anti-padrões a evitar (especialmente do ObservaSampa)

1. **Dropdowns separados sem preview ao vivo** — solução: filtros facetados com contador "X políticas correspondem"
2. **Sem timestamp/versão visível** — solução: header de cada ficha "Revisado em DD/MM/AAAA | Próxima revisão em DD/MM/AAAA"
3. **Sem citação ou export** — solução: botão "Copiar citação" + "Baixar metadados JSON" em CADA ficha