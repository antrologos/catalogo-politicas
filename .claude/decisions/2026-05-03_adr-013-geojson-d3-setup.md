# ADR-013 — GeoJSON + D3 setup do mapa coroplético (F.3 Sprint 8.1+8.2)

**Status**: Aceito
**Data**: 2026-05-03
**Sprint**: 8.1+8.2 do Bloco F.3
**Decisores**: usuária (escolheu versão completa do Sprint 8) + agente
**Insumos**: pitfalls técnicos descobertos durante implementação (4 commits perdidos antes de identificar bug raiz)

## Contexto

F.3 Sprint 8.1 entrega mapa coroplético D3 dedicado em `/mapa/`. Decisões técnicas envolveram trade-offs em 4 dimensões: fonte do GeoJSON, simplificação, distribuição do D3 e setup da projection. Cada uma teve uma escolha errada inicialmente que custou commits/tempo até identificar a correta.

## Decisões e justificativas

### 1. Fonte do GeoJSON: Code for Germany "click_that_hood"

URL: `https://raw.githubusercontent.com/codeforgermany/click_that_hood/main/public/data/brazil-states.geojson`

**Por quê**:
- 27 features completas (todos os estados + DF)
- properties.sigla disponível para join com nossos dados
- Tamanho original 3.3 MB (aceitável pré-simplificação)
- Comunidade ativa, mantido

**Alternativas consideradas**:
- **IBGE oficial** (`https://servicodados.ibge.gov.br/api/v3/malhas/`): formato shapefile original, exige conversão; API com latência variável
- **`geobr`** (R package): exigiria adicionar R à toolchain
- **`brazilian-states-geojson`** (npm): menos features, properties incompletas
- **Wikipedia commons SVG**: SVG não-paramétrico, difícil colorir dinamicamente

**Pitfall conhecido** (ver §3): rings em CW (clockwise) — divergente do RFC 7946. Exige pré-processamento.

### 2. Simplificação: mapshaper Douglas-Peucker 10%

```bash
npx mapshaper br-orig.geojson -simplify dp 10% keep-shapes -o force br-simp.geojson
```

Resultado: 3378 KB → 225 KB (15× menor) preservando topologia visualmente correta para mapas em ≤600px.

**Por quê DP em vez do default weighted**:
- Default weighted (Visvalingam-Whyatt) introduzia segmentos para os cantos do bounding box global, criando artefatos visíveis
- DP (Douglas-Peucker) preserva geometria sem snap aos cantos
- `keep-shapes` impede que features pequenas (DF, AL) desapareçam por completo

**Trade-off**: DP perde um pouco mais de detalhe em curvas suaves vs weighted, mas para escala de mapa Brasil em 600×600 é imperceptível.

### 3. Pré-processamento: reverter rings (CW → CCW)

GeoJSON spec RFC 7946 + D3 esperam rings exteriores em ordem **counter-clockwise** (CCW). A fonte Code for Germany usa CW. Sem fix, D3 trata cada ring como "buraco no mundo todo" e adiciona moldura mercator infinita (`L0,0 L600,0 ... Z`) ao path, fazendo cada estado renderizar como retângulo enorme cobrindo todo o canvas.

**Fix definitivo** (Python script, parte do build):

```python
import json
with open('br-ufs.geojson', encoding='utf-8') as f: d = json.load(f)
for f_ in d['features']:
    g = f_['geometry']
    if g['type'] == 'Polygon':
        for ring in g['coordinates']: ring.reverse()
    elif g['type'] == 'MultiPolygon':
        for poly in g['coordinates']:
            for ring in poly: ring.reverse()
with open('br-ufs.geojson', 'w', encoding='utf-8') as f:
    json.dump(d, f, separators=(',', ':'))  # minified
```

**Detecção**: rodar Node test isolado:
```js
import * as d3 from 'd3';
const proj = d3.geoMercator().fitSize([600, 600], geo);
const pg = d3.geoPath().projection(proj);
console.log(pg(geo.features[0]).slice(-50));
// Se aparecer 'L0,0 L600,0 Z' → winding errado; reverter rings
```

**Alternativa**: usar `topojson` (não tem ambiguidade de winding por design). Não escolhida porque exigiria adicionar topojson-client + conversão; o pré-processamento Python é one-shot e simples.

### 4. Distribuição do D3: UMD via CDN

```html
<script src="https://cdn.jsdelivr.net/npm/d3@7.9.0/dist/d3.min.js" defer></script>
<script src="/assets/js/mapa.js" defer></script>
```

**Por quê UMD** em vez de ESM (`/+esm`):
- ESM falhou silenciosamente em produção (browser não rodava o init) apesar de funcionar em Node + d3 npm. Hipóteses: ad-blockers verificando URLs `+esm` específicas, MIME type não-reconhecido, política CSP. Inviável depurar sem reproduzir.
- UMD é universal — `<script defer>` simples, atribui `window.d3` global, funciona em qualquer setup
- Wait function para ordering:
  ```js
  function waitForD3(cb) {
    if (typeof window !== "undefined" && window.d3) return cb();
    setTimeout(() => waitForD3(cb), 30);
  }
  ```

**Trade-off**: UMD é ~95KB minified+gz vs ESM tree-shakeable que poderia ser ~30KB se pegar só `d3-geo`+`d3-selection`. Aceito porque mapa é página dedicada (não impacta bundle Home/LCP).

### 5. Setup canônico final da projection

```js
const projection = d3.geoMercator().fitSize([width, height], geo);
const pathGen = d3.geoPath().projection(projection);
```

`fitSize` AUTOMATICAMENTE calcula scale + translate ajustados ao bbox real do GeoJSON. Funciona desde que o GeoJSON tenha winding correto (§3).

Tentei alternativas que falharam:
- `scale(700) + center([-54,-15]) + translate([300,300])` — constantes mágicas que dependiam do GeoJSON exato; quebrou após simplificação
- `fitExtent([[20,20],[width-20,height-20]], geo)` — funcionou mas adicionava clipping que conflitava com winding bug

## Consequências

**Positivas**:
- GeoJSON 225 KB on-demand (apenas em /mapa/, não impacta Home)
- D3 ~95 KB UMD via CDN cacheado (jsdelivr + browser cache)
- 27 paths renderizam corretamente, click navega, tooltip funciona
- Renderiza em ~300ms incluindo fetch do GeoJSON

**Negativas / dívida**:
- GeoJSON pré-processado é commitado no repo (vs gerado em build): se fonte Code for Germany atualizar, precisamos re-baixar + re-processar manualmente
- Sem topojson, perdemos compactação adicional (~30-40%) e safety contra winding bug
- D3 UMD via CDN externo é dependência de terceiros (jsdelivr); fallback local seria 95KB extra no repo

**Reversível?** Sim totalmente. Trocar GeoJSON ou D3 distribution exige um único PR.

## Aplicabilidade futura

- **Sprint 9 (grafo Cytoscape)**: NÃO tem categoria de bug equivalente (Cytoscape é grafo node-edge, não geo). Mas reaproveitar:
  - UMD via CDN > ESM
  - Validar local com puppeteer antes de push
- **Próximas ondas (mais UFs)**: GeoJSON já tem 27 estados; adicionar DF não exige mudança
- **Mapa por município (futuro)**: precisaria GeoJSON de municípios (~5500 features), exigiria simplificação mais agressiva + topojson para compactar, com mesmas verificações de winding

## Documentação relacionada

- `.claude/rules/validar-visual-local.md` — regra que formaliza "puppeteer local antes de push"
- Memória `feedback_validar_visual_local.md` — relato concreto do tempo perdido
- Memória `reference_d3_geojson_pitfalls.md` — checklist técnico para reuso