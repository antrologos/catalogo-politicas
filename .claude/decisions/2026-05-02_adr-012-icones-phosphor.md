# ADR-012 — Phosphor Icons inline SVG substitui emojis funcionais

**Status**: Aceito
**Data**: 2026-05-02
**Sprint**: V3 do MVP-UX
**Decisores**: usuária (P1=médio em 2026-05-02) + agente
**Insumos**: R2.1-A (auditor visual identificou emojis como "sintoma mais visível de feio"), R2.2 (validou via inline SVG, não webfont 3MB)

## Contexto

R2.3 verificou empiricamente: **26 ocorrências de emojis funcionais em 9 arquivos** sendo usados como ícones (em vez de marcadores tipográficos). R2.1-A:

> "Emojis (🔍 🧭 📊 🗺️) como ícones funcionais é o sintoma mais visível de 'feio': cross-platform inconsistency (cada SO renderiza diferente), registro casual incompatível com FRM/IESP/Bradesco, e zero alinhamento com identidade institucional."

R2.2 validou Phosphor mas refinou: **inline SVG sob demanda**, não webfont 3MB. Phosphor regular tem peso editorial neutro coerente com IBM Plex Sans.

## Decisão

Substituir emojis funcionais por SVG inline via shortcode Eleventy `{% icon "<name>" %}` que lê de `node_modules/@phosphor-icons/core/assets/regular/<name>.svg`.

**Manter** caracteres tipográficos legítimos: `↗` (link externo), `→` (CTA setas), `✕` (close button), `←→` (em comentários doc), `●` (marker em CSS-content), backslashes/setas em código JS.

## Tabela de mapeamento (26 substituições)

| Emoji | Phosphor regular | Onde |
|---|---|---|
| 🔍 | `magnifying-glass` | Hero card "Sei o que procuro" (index.njk:30); seção busca rápida (index.njk:91); strong "Buscar com filtros" (index.njk:223); 404 (404.njk:20); footer link (footer.njk:42); /explorar/ link (explorar.njk:279) |
| 🧭 | `compass` | Hero card "Quero explorar" (index.njk:42); footer link (footer.njk:41) |
| 📊 | `chart-bar` | Hero card "Comparar UFs" (index.njk:54); strong "Comparar UFs" (index.njk:229); footer link (footer.njk:43); /explorar/ link (explorar.njk:283) |
| 🗺️ | `map-trifold` | Hero card "Minha UF" (index.njk:66); strong "Cobertura" (index.njk:235); /explorar/ card UF (explorar.njk:122); /explorar/ link (explorar.njk:287) |
| 🌎 | `globe` | /explorar/ card "Por abrangência" (explorar.njk:100); abrangencia/pagina-abrangencia.njk:13 (frontmatter `dimensaoIcone`) |
| 🏫 | `buildings` | /explorar/ card "Por modalidade" (explorar.njk:78); modalidade/pagina-modalidade.njk:13 (frontmatter) |
| 📚 | `books` | /explorar/ card "Por tipo" (explorar.njk:33); tipo/pagina-tipo.njk:13 (frontmatter) |
| ⚖️ | `scales` | /explorar/ card "Por origem" (explorar.njk:145) |
| 📄 | `file-text` | /explorar/ card "Por snapshot" (explorar.njk:167) |
| 🖨️ | `printer` | /comparacao/ botão imprimir (comparacao.njk:82) |
| 📦 | `package` | Footer link GitHub (footer.njk:79) |
| ● | `circle-fill` | tag-status (statusKey="ativa"); index.njk:157; uf/pagina-uf.njk:102; situacao/pagina-situacao.njk:13 (frontmatter); explorar.njk:55 (header card) |
| ✓ | `check` | "✓ Disponível" em explorar.njk:178, dimensao.njk:151, uf/pagina-uf.njk:174 |

## Arquivos novos / modificados

**Criados**:
- `.claude/decisions/2026-05-02_adr-012-icones-phosphor.md` (este)

**Modificados**:
- `site/eleventy.config.js`: imports + shortcode `{% icon %}` + cache em memória
- `site/src/assets/css/tailwind.css`: classe `.icon` (1em quadrado) + variantes `size-lg/xl/2xl`
- `site/package.json`: dependência `@phosphor-icons/core`
- 9 templates listados na tabela
- 4 arquivos de pagination (frontmatter `dimensaoIcone` muda de emoji para nome Phosphor)
- `site/src/_includes/components/tag-status.njk`: emojis `●■▲○◆` → Phosphor (mantém função "cor não é único indicador")

## Consequências

**Positivas**:
- Renderização consistente em qualquer SO/browser/familia de fonte
- Peso visual editorial (Phosphor regular) coerente com Plex
- `fill="currentColor"` herda paleta semântica (tag--ativa verde, tag--encerrada vermelho)
- ~6.5 KB total adicionado ao HTML (26 SVGs inline, ~250 bytes cada)
- Cache em memória evita re-leitura disco

**Negativas**:
- Adiciona dependência `@phosphor-icons/core` (~6 MB no node_modules, mas só os 13 SVGs usados são copiados ao build)
- Templates ficam ligeiramente mais verbosos (`{% icon "magnifying-glass" %}` vs `🔍`)
- Risco de typo em nome do ícone (mitigado: shortcode loga warning + render vazio em vez de quebrar)

## Alternativas consideradas

- **Webfont Phosphor**: descartada (R2.2): ~3 MB, exige FOUT, adiciona request, baixo controle de peso
- **eleventy-plugin-phosphoricons** (plugin de terceiros): descartada — adiciona camada extra, mesmo resultado que shortcode próprio
- **Lucide icons**: alternativa válida mas Phosphor tem 6 weights (regular/thin/light/bold/fill/duotone) caso precisemos extender depois
- **Heroicons**: Tailwind-related, ok mas menos completo que Phosphor regular (~9k ícones vs ~3k Heroicons)