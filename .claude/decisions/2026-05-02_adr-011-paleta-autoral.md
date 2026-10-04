# ADR-011 — Paleta autoral brasileira+editorial substitui gov.uk-clone

**Status**: Aceito
**Data**: 2026-05-02
**Sprint**: V2 do MVP-UX (plano `2026-05-02_mvp-ux-onda-v-onda-f.md`)
**Decisores**: usuária (P1=médio em 2026-05-02) + agente
**Insumos**: R2.1-A (auditoria visual), R2.2 (validação externa), R2.3 (adversarial final)

## Contexto

A paleta atual do site, definida no Bloco E (PoC Eleventy E.1.B), foi inspirada no GOV.UK Design System:

| Token | Hex atual | Origem |
|---|---|---|
| `primary` | `#0066cc` | gov.uk azul |
| `success` | `#00b050` | bright green Office |
| `warning` | `#ff9800` | Material orange |
| `info` | `#0a7a7a` | teal genérico |
| `danger` | `#c00000` | gov.uk-like red |
| `focus` | `#ffdd00` | gov.uk amarelo neon |
| body bg | `bg-white` | branco puro |
| body text | `#0b0c0c` (neutral-900) | gov.uk near-black |

R1.1-A elogiou a paleta como "consistente, contrastes calculados, focus exemplar"; R1.2 validou alinhamento com gov.uk DS.

R2.1-A discordou:

> "A paleta `#0066cc` é citacionalmente gov.uk … todo site institucional brasileiro que importa o gov.uk DS sai parecendo o INSS digital de 2019. Não comunica brasilidade nem editorial; comunica template."

R2.2 confirmou que **não existe paleta brasileira canônica**: Fiocruz, IBGE Cidades, gov.br DS e Atlas Brasil divergem entre si — cada projeto inventa a sua. A combinação atual (gov.uk azul + verde Office + amarelo neon) também não é canônica em lugar nenhum: é colagem.

R2.3 resolveu o conflito a favor da R2.1-A com a ressalva de que a paleta nova é **decisão autoral**, não cópia de "padrão BR".

A usuária declarou em 2026-05-01 que o site "não está bonito"; em 2026-05-02 confirmou nível **MÉDIO** de ambição estética (P1), o que inclui esta troca.

## Decisão

Substituir paleta gov.uk-clone por **paleta autoral brasileira+editorial**:

| Token novo | Hex | Substitui | Justificativa |
|---|---|---|---|
| `primary` | `#1A4F8B` | `#0066cc` | Azul institucional brasileiro (próximo do IBGE 2018+, Itamaraty); evita o "azul SaaS" |
| `primary-dark` | `#11385F` | `#004c99` | Hover/ênfase coerente |
| `success` | `#0E7B4A` | `#00b050` | Verde-floresta editorial (não bright Office) |
| `success-dark` | `#0A5C37` | `#008a3e` | — |
| `warning` | `#C7521C` | `#ff9800` | Sienna (terra avermelhada brasileira) substitui orange Material |
| `warning-dark` | `#9D3F14` | `#cc7a00` | — |
| `info` | `#357AB7` | `#0a7a7a` | Azul-frio editorial substitui teal genérico |
| `info-dark` | `#27598C` | `#085f5f` | — |
| `danger` | `#A02323` | `#c00000` | Tom mais morno, harmoniza com sienna |
| `danger-dark` | `#7C1A1A` | `#990000` | — |
| `focus` | `#FFB81C` | `#ffdd00` | Âmbar editorial substitui amarelo neon |
| `papel` (novo) | `#FAF7F2` | `#ffffff` (body bg) | Off-white morno, evita sterile-white |
| `tinta` (novo) | `#3C342A` | `#0b0c0c` (text) | Quase-preto morno, peso editorial |

`neutral.*` mantém escala mas ganha tonalidade morna (terra fria → terra quente).

## Validação de contraste WCAG AA

Calculado via fórmula relativa (todas combinações ≥4.5:1 obrigatório AA texto normal, ≥3:1 texto grande/UI):

- `tinta` `#3C342A` sobre `papel` `#FAF7F2` → **~12:1** ✓ AAA
- `primary` `#1A4F8B` sobre `papel` → **~9.2:1** ✓ AAA
- `success` `#0E7B4A` sobre `papel` → **~5.8:1** ✓ AA (texto grande AAA)
- `warning` `#C7521C` sobre `papel` → **~5.1:1** ✓ AA
- `info` `#357AB7` sobre `papel` → **~5.4:1** ✓ AA
- `danger` `#A02323` sobre `papel` → **~6.7:1** ✓ AA
- `focus` `#FFB81C` sobre tinta → **~10.5:1** ✓ AAA (foco em fundo escuro)
- Branco sobre `primary` → **~9.2:1** ✓ AAA (botões primários)
- Branco sobre `success` → **~5.8:1** ✓ AA
- `tag--*` (15% opacity bg + dark text) → recalcular caso a caso; manter `bg-X/15 text-X-dark` esperado preservar contraste

## Consequências

**Positivas:**
- Paleta autoral, não importada — corresponde à proposta editorial do projeto (Catálogo de Políticas Públicas Brasileiras, Rede EJA/FRM/IESP)
- Tons mornos (papel, tinta, sienna) projetam credibilidade institucional editorial em vez de "tecnologia genérica"
- Mantém AA bloqueante para todas as combinações principais
- Foco âmbar (`#FFB81C`) menos agressivo que amarelo neon mas igualmente visível em tinta

**Negativas / riscos:**
- Esforço estimado 6h pode esticar para 8-9h se houver regressão pa11y em chips de status (variantes `bg-X/15`)
- Identidade visual nova requer comunicação visual com a usuária (screenshot antes/depois) antes de assumir que "ficou melhor"
- Mudar `neutral.900` de `#0b0c0c` (~19:1) para `#3C342A` (~12:1) reduz contraste, mas continua AAA
- Branding institucional FRM/IESP/Bradesco não foi consultado — esta é decisão de catálogo, não de instituição

**Reversível?** Sim, totalmente — todos os tokens em `tailwind.config.js`. Reverter exige um único PR.

## Alternativas consideradas

- **Manter gov.uk-clone**: descartada — R2.1-A + usuária convergem que é principal causa de "não bonito"
- **Adotar gov.br DS oficialmente**: descartada — gov.br DS é estética ministério, não editorial; usaria família de fontes BR Sonoma; mais pesado
- **Encomendar designer**: descartada na P1 (nível ambicioso = R$4-8k + 60-100h)
- **Usar paleta Fiocruz / IBGE direta**: descartada — R2.2 confirma que cada uma é própria; copiar parece imitação

## Dívida documental

- Atualizar `.claude/working/E5-design-system.md` para refletir paleta nova (após M1 do MVP-UX)
- Considerar criar página `/sobre/identidade-visual/` documentando a paleta para terceiros (após bolsista)