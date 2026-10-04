# Validar Visual Local Antes de Push

**Status:** OBRIGATÓRIA · **Escopo:** mudanças em código que renderiza visualmente em browser

## Princípio

Para qualquer mudança em **D3, Cytoscape, SVG inline, canvas, charts ou layouts visuais complexos**, é obrigatório validar visualmente em **puppeteer headless local** antes de commit + push. Iterar em produção (push → CI → deploy → cache → testar no browser → ver bug → repetir) é proibido como diagnóstico primário.

## Contexto

A regra nasceu em 2026-05-03 (Sprint 8.1+8.2 do F.3) quando o agente perdeu ~30 minutos em **6 commits sucessivos** tentando consertar o mapa coroplético D3 em produção. Cada ciclo: push → CI ~3min → deploy GitHub Pages ~1-2min → cache CDN/browser → testar no browser real do usuário → ver mesmo bug → próxima tentativa. Quando finalmente rodou puppeteer local, identificou a causa raiz (winding de rings) em **3 minutos**.

Ver: memória `feedback_validar_visual_local.md` e `reference_d3_geojson_pitfalls.md`.

## Quando aplica

| Mudança | Validar com puppeteer local? |
|---|---|
| D3 (mapa, gráfico, scale, projection) | **SIM, obrigatório** |
| Cytoscape (grafo) | **SIM, obrigatório** |
| SVG inline com lógica JS | **SIM, obrigatório** |
| Canvas (download PNG, gráfico) | **SIM, obrigatório** |
| Layout responsivo novo (grid, flexbox complexo) | SIM se houver lógica JS afetando |
| CSS puro Tailwind sem JS | NÃO obrigatório (pa11y-ci + lighthouse no CI cobrem) |
| Texto/markdown | NÃO obrigatório |
| Edição de templates Nunjucks sem JS | NÃO obrigatório |

## Procedimento mínimo

### 1. Garantir puppeteer instalado (one-shot)

```bash
cd C:/Users/antro/dev/catalogo-politicas/site
npm install --save-dev puppeteer
```

(~50 MB no node_modules; aceito porque repete em qualquer sprint visual.)

### 2. Rodar Eleventy serve local

```bash
cd C:/Users/antro/dev/catalogo-politicas/site
npx @11ty/eleventy --serve --port 8770 --quiet &
sleep 8  # aguardar build inicial
```

Use porta nova a cada sessão (8770, 8771, etc.) para evitar conflito.

### 3. Validar via puppeteer

Snippet padrão:

```js
import puppeteer from 'puppeteer';
import { writeFileSync } from 'node:fs';

const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 1200 });

// Captura console + erros + falhas de rede
const logs = [];
page.on('console', m => logs.push('[' + m.type() + '] ' + m.text()));
page.on('pageerror', e => logs.push('[ERROR] ' + e.message));
page.on('requestfailed', req => logs.push('[NETFAIL] ' + req.url()));

await page.goto('http://localhost:8770/catalogo-politicas/<rota>/', { waitUntil: 'networkidle0' });
await new Promise(r => setTimeout(r, 3000));  // aguardar JS async

// Screenshot
const buf = await page.screenshot({ type: 'png' });
writeFileSync('debug.png', buf);

// Inspeção específica
const info = await page.evaluate(() => {
  // Adapte para o que precisa verificar
  const el = document.querySelector('#meu-elemento');
  return { exists: !!el, html: el?.outerHTML?.substring(0, 200) };
});

console.log('CONSOLE:'); logs.forEach(l => console.log(' ', l));
console.log('INFO:', JSON.stringify(info, null, 2));

await browser.close();
```

### 4. Verificar resultado ANTES de push

- Console limpa (sem `pageerror`, sem `requestfailed`)?
- Screenshot mostra o que esperado (abrir `debug.png`)?
- Inspeção via `page.evaluate()` confirma estrutura DOM correta?

Se **qualquer** desses falhar, NÃO faça push. Itere local.

## Anti-padrões proibidos

- **Push para diagnosticar**: "vou commitar e ver no browser" sem rodar local
- **Push em sequência rápida** (>2 commits seguidos sem validação local entre eles)
- **Ignorar avisos pa11y/Lighthouse** assumindo que vão passar
- **Confiar em "build local com `npm run build`"** sem rodar o site servido — Eleventy `--serve` aplica pathPrefix corretamente; `npx serve _site` não

## Exceções

- **Hotfix urgente** com causa raiz já identificada (mudança 1 linha, sem nova lógica). Mesmo assim, recomendado validar.
- **Mudança puramente de conteúdo** (texto, microcopy, link). Lighthouse/pa11y no CI cobrem.

## Cleanup

Após sessão de debug:
- Matar processo Eleventy serve: `pkill -f "@11ty/eleventy"` (Linux/Mac) ou Windows: encerrar via Task Manager
- Apagar screenshots temporários (`debug.png`, `mapa-actual.png`, etc.) ANTES de commit; `.gitignore` deveria pegar mas verificar com `git status`

## Relação com outras regras

- `.claude/rules/ciclo-investigacao-teste.md` — esta regra é uma especialização do passo "VERIFICAR" para mudanças visuais
- `.claude/rules/mudancas-minimas-cirurgicas.md` — validação local é parte do escopo "mudança mínima"
- ADR-013 (GeoJSON+D3 setup) — explica os bugs que motivaram esta regra
- Memória `feedback_validar_visual_local.md` — relato concreto do incidente