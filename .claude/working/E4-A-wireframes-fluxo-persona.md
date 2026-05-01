# E.4.A — Wireframes prioritários (lente: FLUXO DE USO da persona Técnico/Coordenador estadual)

> Output do avaliador consensual A do sub-bloco E.4.
> Lente declarada: **fluxo de uso operacional do técnico/coordenador estadual** (sessão ~30min, busca por nome de programa específico, quer detalhes implementacionais e exportação CSV/PDF).
> Foco: cenários, estados, passos, dados consumidos do schema, URLs determinísticas, complexidade.
> Fora de escopo: design visual fino e auditoria a11y técnica (avaliador B).

---

## Resumo executivo — 5 bullets sobre a persona técnica e prioridades

1. **Sessão típica é dirigida por nome ou sigla.** O técnico de SEDUC chega com "preciso achar o que é equivalente do PRONATEC aqui no PE para enviar à Secretária amanhã" — não chega para "explorar o catálogo". Prioridade: caixa de busca proeminente em todas as páginas, autocomplete por `nome` e `slug`, atalho `/` para focar no input, atalho `Esc` para limpar.

2. **Detalhes implementacionais > abstrações conceituais.** O técnico precisa: órgão executor local (`orgaos_responsaveis`), base legal exata para citar em ofício (`base_legal` + `fonte_url` + snapshot), ano de criação, situação atual ("ainda está rodando?"), arranjo logístico, modalidade. As descrições simples/técnicas são secundárias — o que ele copia para o ofício é a base legal e o link oficial. Por isso a ficha individual tem **duas zonas**: cabeçalho operacional (acima da dobra, copiável) + corpo descritivo (abaixo).

3. **Exportação não é luxo, é a saída do fluxo.** O resultado típico de uma sessão é um anexo de email ou um trecho de relatório. Botões "Baixar CSV" e "Baixar PDF" devem aparecer em **3 contextos**: ficha individual (1 política), busca facetada (lista filtrada), página UF (resumo executivo). Sem isso, a sessão termina em copiar-e-colar manual e o site perde valor.

4. **URLs precisam ser bookmarkáveis e compartilháveis.** O técnico envia link em email para colega ("olha esse programa"). Toda combinação de filtros, toda comparação inter-UF, toda página UF com filtros locais aplicados, toda ficha — tem URL determinística que pode ser colada no email. **Ausência de URL persistente = falha de produto** para esta persona (lição direta do anti-padrão Atlas Brasil PNUD).

5. **Profundidade > onipresença.** Os 8 wireframes não são todos visitados em uma sessão. O fluxo dominante é: Home → Busca facetada → Ficha individual → Exportação. Os wireframes 5 (Comparação), 6 (Mapa), 7 (Grafo) atendem casos secundários (planejamento de política, estudo comparado) e podem ter peso menor de tráfego mas alto valor analítico. O wireframe 4 (UF executiva) é o segundo mais importante depois de 3 (Ficha) — é a "página de entrada da própria UF" que o técnico bookmarkkea.

---

## 1. Home / Dashboard agregado nacional (`/`)

### Cenário
Técnico de SEDUC-PE acabou de receber link em email da chefia, abre pela primeira vez e quer entender em 30 segundos: "isso aqui tem PE? quantas políticas? como faço para chegar até as de PE?". Ou já conhece o site e usa Home como porta de entrada (atalho `/` para a busca).

### Wireframe ASCII (estado inicial)
```
+------------------------------------------------------------------+
|  FRM Catalogo de Politicas Publicas                              |
|  [Inicio] [Buscar] [Comparar UFs] [Mapa] [Sobre]    [Buscar...]  |
+------------------------------------------------------------------+
|  CATALOGO DE POLITICAS PUBLICAS BRASILEIRAS — 1a onda            |
|  EJA, qualificacao profissional, inclusao produtiva, transferencia
|  de renda condicionada a educacao. 9 UFs + Federal.              |
|                                                                  |
|  [ Buscar politica por nome, eixo, UF, ano...           [lupa] ] |
|  Atalho: tecle / para focar    Exemplos: PRONATEC, EJA, Bolsa    |
+------------------------------------------------------------------+
|  KPIs AGREGADOS                                                  |
|  +------------+  +------------+  +------------+  +------------+  |
|  |   439      |  |  9 UFs +   |  |  148       |  |  Atualiz.  |  |
|  | politicas  |  |  Federal   |  | snapshots  |  | 01/05/2026 |  |
|  +------------+  +------------+  +------------+  +------------+  |
|  Distribuicao por tipo:                                          |
|   Educ. direta            ##############  186 (42%)              |
|   Trab/qualif. direta     ###########     142 (32%)              |
|   Protecao social/educ.   ########        111 (25%)              |
+------------------------------------------------------------------+
|  MAPA DO BRASIL — politicas por UF (clique para abrir)           |
|       [SVG coropletico Brasil; UFs cobertas em azul-escuro;      |
|        UFs nao cobertas em cinza claro com hatch pattern;        |
|        hover mostra "PE: 47 politicas" + link]                   |
|  Legenda: 0 | 1-30 | 31-50 | 51+      [Lista textual >]          |
|  9 UFs cobertas: SP RJ MG PR RS BA PA PE CE                      |
|  Outras UFs: ainda nao mapeadas (ver "Proximas ondas")           |
+------------------------------------------------------------------+
|  ACESSOS RAPIDOS                                                 |
|  [Por UF]   [Comparar UFs]  [Busca avancada]  [Baixar dados]     |
+------------------------------------------------------------------+
|  EM DESTAQUE        [Mais consultadas | Recentes | Em revisao]   |
|  [Card PRONATEC] [Card Bolsa-Familia] [Card EJA Integrada]       |
+------------------------------------------------------------------+
|  PROXIMAS ONDAS                                                  |
|  Cobrindo hoje: 9 UFs + Federal. Em estudo (2a onda): NE/CO.     |
+------------------------------------------------------------------+
| Sobre | Metodologia | Privacidade | Citacao | CC-BY 4.0 | GitHub |
+------------------------------------------------------------------+
```

### Estados
- **Inicial**: KPIs carregados em build-time.
- **Pós-ação**: usuário digita "PRONATEC" → autocomplete dropdown 1 sugestão "PRONATEC (Federal)" + 5 fichas estaduais; Enter → `/buscar/?q=PRONATEC`.
- **Vazio**: N/A na Home.
- **Erro**: se `latest.json` falhar, fallback estático com KPIs hardcoded em build + mensagem.
- **Loading**: SVG coroplético placeholder ~200-400ms; resto já renderizado.

### Fluxo (3 caminhos)
1. Acessa raiz; lê KPIs em <3s.
2. **(a) Sabe nome**: input header (ou `/`) → autocomplete → Enter → `/buscar/?q=...`.
3. **(b) Quer sua UF**: clica PE no mapa → `/uf/pe/`.
4. **(c) Quer explorar**: "Busca avançada" → `/buscar/`.
5. (Opcional) Bookmark da Home como ponto de partida.

### Dados consumidos
Agregados build-time: `count(politicas)`, `count_distinct(uf)`, `count(politicas com fonte_arquivo_path != null)`, `data_versao_catalogo`, `count(politicas where uf = X)` para mapa, `count by tipo_politica`. Em destaque: top 3 fichas por critério. Autocomplete: `nome`, `slug`, `id_interno` indexados pelo Pagefind.

### Interações
- `/` foca input do header; `Esc` limpa.
- Click estado mapa → `/uf/<sigla>/`; hover → tooltip "PE: 47 políticas".
- Click "Lista textual >" abre lista alternativa (a11y).
- Abas "Mais consultadas | Recentes | Em revisão" trocam 3 cards.
- "Baixar dados" → `/sobre/dados/`.

### URL determinística
`/` (sem query params; estado fixo).

### Complexidade
**Média** (~16-24h): KPIs estáticos 4h; mapa coroplético D3 + lista textual paralela 8-12h (reutilizável W6); autocomplete Pagefind 2-4h; em destaque 2-4h.

---

## 2. Busca facetada (`/buscar/`)

### Cenário
Técnico quer "todas as políticas federais ativas em qualificação profissional que rodam em PE" — combinação de filtros para relatório gerencial. Pode chegar de busca textual ("PRONATEC") e ir refinando.

### Wireframe ASCII (estado inicial)
```
+------------------------------------------------------------------+
| Header                                                           |
+------------------------------------------------------------------+
|  Inicio > Buscar                                                 |
|  BUSCAR POLITICAS                                                |
|  [ Digite nome, sigla, eixo, UF...              [lupa]  [Esc x] ]|
|  +-----------------+  +------------------------------------------+
|  | FILTROS         |  | RESULTADOS: 439 politicas                |
|  |                 |  |   Ordenar por: [ Relevancia v ]          |
|  | UF              |  |   Mostrando: [ 20 v ] de 439             |
|  | [ ] Federal(33) |  |                                          |
|  | [ ] SP    (53)  |  | (1) PRONATEC                             |
|  | ...             |  |     Federal | Educ. direta | Ativa       |
|  | [ ] CE    (45)  |  |     Lei 12.513/2011 | 2011               |
|  |                 |  |     [Ver ficha >] [Snapshot disponivel]  |
|  | TIPO POLITICA   |  | ...                                      |
|  | [ ] Educ.(186)  |  |                                          |
|  | [ ] Trab.(142)  |  |  << 1 2 3 ... 22 >>  Pagina 1 de 22      |
|  | [ ] PSoc.(111)  |  +------------------------------------------+
|  | SITUACAO        |                                             |
|  | [ ] Ativa(312)  |  ACOES SOBRE A LISTA                        |
|  | [ ] Encerr.(48) |  [Baixar CSV (439)] [Baixar JSON]           |
|  | ...             |  [Copiar link da busca]                     |
|  | ANO CRIACAO     |                                             |
|  | [1990 -- 2026]  |                                             |
|  | TEM SNAPSHOT?   |                                             |
|  | [ ] Sim (242)   |                                             |
|  | [ ] Nao (197)   |                                             |
|  | [Limpar filtros]|                                             |
|  +-----------------+                                             |
+------------------------------------------------------------------+
```

### Estados
- **Inicial**: 439 fichas, default ordem alfabética.
- **Pós-ação**: marca "Federal"+"Educacional direta"+"Ativa"; URL `/buscar/?uf=BR&tipo=edu_direta&situacao=ativa`; lista atualiza ao vivo; contadores em outras facetas refletem subset compatível; chip-tags acima.
- **Vazio**: combinação impossível → card "Nenhuma política. [Remover filtro X] [Limpar todos]". NUNCA tela em branco.
- **Erro Pagefind**: fallback grep client-side em JSON canônico embutido (~80KB). Mensagem inline.
- **Loading**: Pagefind ~45KB lazy; skeleton 5 cards cinza ~100-300ms; depois instantâneo.

### Fluxo
1. Chega via `/buscar/` (header) ou redirect Home.
2. Digita "PRONATEC" → resultados ao vivo (debounced ~150ms).
3. Marca facetas: "UF: PE" + "Situação: Ativa".
4. Lê 3-5 resultados; reconhece pelo nome+ano+base legal.
5. **(a)** Click "[Ver ficha >]" → `/politica/<slug>/`.
6. **(b)** "Baixar CSV" → CSV com 9 colunas das fichas filtradas.
7. **(c)** "Copiar link" → URL com filtros no clipboard, toast "Link copiado".

### Dados consumidos
Indexado Pagefind: `nome`, `slug`, `id_interno`, `descricao_simples`, `descricao_tecnica`, `resumo`, `apresentacao`, `base_legal`, `orgaos_responsaveis`, `publico_alvo`. Facetas: `uf`, `tipo_politica`, `situacao_atual`, `esfera_execucao`, `modalidade_oferta`, `ano_criacao`, `fonte_arquivo_path != null`. CSV: 9 campos default.

### Interações
- `/` foca input; `Esc` limpa.
- Filtros mudam URL imediatamente (sem botão Aplicar).
- Multivalor por faceta (OR dentro; AND entre facetas — gov.uk).
- Click chip-tag remove filtro; "Limpar filtros" reset total.
- Click coluna re-ordena (ASC/DESC).
- "Mostrar TODAS (439)" em vez de paginação cega (gov.br anti-padrão).

### URL determinística
```
/buscar/?q=<termo>&uf=BR,PE&tipo=edu_direta&situacao=ativa
&esfera_exec=estadual&modalidade=presencial
&ano_min=2010&ano_max=2026&snapshot=sim
&ordenar=nome:asc&pagina=1&mostrar=20&v=2026-05
```
Bookmarkável + compartilhável + History API back/forward.

### Complexidade
**Alta** (~30-50h): Pagefind 4-6h; UI facetas com contadores ao vivo 12-16h (custom — Pagefind UI default não cobre); URL state binding 6-10h; export CSV/JSON 4-6h; estados loading/erro/vazio 4-6h; "Mostrar TODAS" 0-6h.

---

## 3. Ficha individual (`/politica/<slug>/`)

### Cenário
Técnico encontrou "PRONATEC" na busca, abre ficha para extrair: base legal exata, situação atual, órgão executor local em PE, link oficial. Tem 5 minutos. Vai copiar 3-4 trechos para email.

### Wireframe ASCII (zona operacional acima + abas)
```
+------------------------------------------------------------------+
|  Inicio > Buscar > PRONATEC (PE)                                 |
|  PRONATEC                                                        |
|  Programa Nacional de Acesso ao Ensino Tecnico e Emprego         |
|  [Ativa]  [Federal -- replica em PE]  [Educacional direta]       |
|  ID: FRM-CP-2026-EDU-0001  |  Atualizado: 01/05/2026             |
|  Completude metadados: [##########] 92%                          |
+------------------------------------------------------------------+
|  INFORMACOES OPERACIONAIS  (zona copiavel rapida)                |
|  Esfera de formulacao : Federal                                  |
|  Esfera de execucao   : Estadual: SEDUC-PE                       |
|  Orgaos responsaveis  : MEC, SETEC, SEDUC-PE                     |
|  Base legal           : Lei 12.513/2011                  [copiar]|
|                         Decreto 7.589/2011                       |
|  Fonte oficial        : planalto.gov.br/.../l12513.htm   [link^]|
|  Snapshot local       : disponivel (HTML, 01/05/2026)    [baixar]|
|  Ano de criacao       : 2011                                     |
|  Vigencia             : 2011-10-26 -- presente                   |
|  Modalidade           : Presencial                               |
|  Carga horaria        : 160 horas                                |
|  Publico-alvo         : Jovens, adultos, trabalhadores           |
|  Financiamento        : Tesouro / FUNDEB                         |
+------------------------------------------------------------------+
|  ACOES                                                           |
|  [Copiar citacao] [Baixar PDF da ficha] [Baixar JSON]            |
|  [Compartilhar link] [Ver no oficial ^] [Baixar snapshot]        |
|  [Comparar com outra UF] [Ver politicas relacionadas]            |
+------------------------------------------------------------------+
|  ABAS                                                            |
|  [DESCRICAO] [DOCUMENTOS] [RELACIONADAS] [CITACAO] [HISTORICO]   |
|                                                                  |
|  DESCRICAO  (aba ativa)                                          |
|  Em linguagem simples: Programa que oferece cursos profissio...  |
|  Tecnica: Instituido pela Lei 12.513/2011...                     |
|  Resumo: [...]                                                   |
|  Apresentacao: [...]                                             |
|  Integra com outras politicas: Sim, com FIES e ProUni.           |
|  Continuidade entre governos: Mantido com mudancas de desenho.   |
+------------------------------------------------------------------+
|  PROVENIENCIA                                                    |
|  Revisado por: Maria Clara Gama                                  |
|  Proxima revisao prevista: 2026-08-01                            |
|  Versao do catalogo: 2026-05-01                                  |
|  Snapshot SHA-256: ab12cd34...   |  OCR aplicado: nao            |
+------------------------------------------------------------------+
```

### Estados
- **Inicial**: aba "Descrição" ativa.
- **Aba Documentos**: lista normativos com [Ver oficial^] [Snapshot HTML].
- **Aba Relacionadas**: Substitui/Substituída/Cita/Citada por (14)/Replicada em UFs.
- **Aba Citação**: APA/ABNT/BibTeX/RIS com [copiar] cada.
- **Vazio**: campos opcionais não-preenchidos → linha omitida (não mostrar "Modalidade: -").
- **Erro snapshot**: linha "Snapshot local: indisponível" + tooltip explicativo. Não quebra ficha.
- **Erro slug inexistente**: 404 com sugestões similares.
- **Loading**: estática, sem loading real.

### Fluxo
1. Chega `/politica/pronatec/` (busca ou link email).
2. Lê zona operacional ~10s.
3. Click [copiar] base legal → "Lei 12.513/2011; Decreto 7.589/2011" no clipboard, toast.
4. Click "Ver no oficial ^" → planalto.gov.br nova aba.
5. Click "Baixar snapshot" → HTML local.
6. (Opcional) "Baixar PDF da ficha" → PDF anexar email.
7. (Opcional) Aba "Citação" → "Copiar ABNT" → cola em relatório acadêmico.

### Dados consumidos
**Praticamente todo o schema** (página mais densa):
- ID: `id_interno`, `slug`, `nome`, `versao`, `data_versao_catalogo`.
- Tags: `situacao_atual`, `is_federal_replica`, `federal_source_id`, `tipo_politica`, `completude_pct`.
- Operacional: `esfera_formulacao/execucao`, `orgaos_responsaveis`, `base_legal`, `fonte_url`, `fonte_arquivo_path`, `fonte_extensao`, `fonte_data_acesso`, `ano_criacao`, `data_validade_inicio/fim`, `modalidade_oferta`, `tipo_oferta`, `arranjo_logistico`, `carga_horaria`, `publico_alvo`, `fonte_financiamento`, `transferencia_recursos`.
- Descrição: `descricao_simples/tecnica`, `resumo`, `apresentacao`, `integra_outras_politicas`, `continuidade_governos`, `informacoes_complementares`, `duvidas_revisor`.
- Relacionadas: `supersedes_id`, `superseded_by_id`, `integra_outras_politicas`, citadas-por (build-time), réplicas UFs.
- Citação: `citacao_apa`, `citacao_bibtex`, `atribuicao` + ABNT/RIS gerados.
- Proveniência: `revisado_por`, `proxima_revisao_prevista`, `criado_em`, `atualizado_em`, `fonte_sha256`, `fonte_ocr_aplicado`.

### Interações
- [copiar] usa Clipboard API + fallback `<textarea>`.
- "Ver no oficial ^" `target="_blank" rel="noopener"`.
- "Baixar snapshot" link direto para arquivo.
- Abas via JS sem reload + atualizam URL: `?aba=documentos`.
- Atalho `c` copia citação APA padrão; `g` foca aba "Relacionadas".

### URL determinística
- `/politica/<slug>/`
- `/politica/<slug>/?aba=documentos|relacionadas|citacao|historico`
- Slug antigo redireciona via `redirect_from` (301 estático).

### Complexidade
**Média-Alta** (~24-40h): layout + zona operacional 6-8h; abas JS minimal 2-4h; geração citação 4 formatos 4-8h (build-time); botões copiar 2-4h; aba Relacionadas com "citada-por" 4-6h; PDF (Puppeteer/print-stylesheet) 4-8h; estados erro 2-4h; aba Histórico 0-8h se diferida.

---

## 4. Página executiva por UF (`/uf/<sigla>/`)

### Cenário
Técnico chega `/uf/pe/` (bookmark; ou via mapa Home) — quer panorama em 10min: "quais políticas em PE, separadas por eixo, com situação atual". Página mais bookmarkkada por persona estadual depois da Home.

### Wireframe ASCII
```
+------------------------------------------------------------------+
|  PERNAMBUCO -- Catalogo de Politicas Publicas                    |
|  Ultima atualizacao: 01/05/2026 | 44 politicas mapeadas          |
|  [Buscar nesta UF...                                  [lupa] ]   |
|  ACOES   [Baixar resumo PDF] [Baixar CSV (44)] [Comparar com...] |
+------------------------------------------------------------------+
|  KPI CARDS                                                       |
|  | 44 total | 33 federais | 11 estaduais | 6/9 eixos cobertos |  |
+------------------------------------------------------------------+
|  DISTRIBUICAO POR EIXO  (clicavel)                               |
|  Educ. direta            ##############  16 (36%)                |
|  Trab/qualif. direta     ###########     12 (27%)                |
|  Protecao social/educ.   ##########       9 (20%)                |
|  Outras                  ######           7 (16%)                |
|  POR SITUACAO  (clicavel)                                        |
|  Ativa  ##################  31 (70%)                             |
+------------------------------------------------------------------+
|  FILTROS LOCAIS                                                  |
|  Eixo: [Todos v]  Situacao: [Todos v]  Origem: [Todas v]         |
|  [Limpar]                                Resultado: 44 politicas |
+------------------------------------------------------------------+
|  LISTA DE POLITICAS  (default ordem alfabetica)                  |
|  # | Nome             | Eixo | Origem    | Situacao              |
|  1 | Bolsa Familia    | PSO  | Federal   | Ativa                 |
|  2 | EJA Integ. (PE)  | EDU  | Estadual  | Ativa                 |
|  ...                                                             |
|  [Mostrar todas (44)]  ou [<< 1 2 3 >>]                          |
+------------------------------------------------------------------+
```

### Estados
- **Inicial**: 44 políticas listadas.
- **Pós-ação filtro**: click barra "Educ. direta" → URL `/uf/pe/?eixo=edu_direta`; lista filtra para 16; barra destacada.
- **Vazio (UF sem políticas)**: N/A no MVP.
- **Vazio filtro impossível**: card "Nenhuma política. [Limpar filtros]".
- **Erro**: estática; build quebrado → fallback HTML mínimo.
- **Loading**: instantâneo (filtros client-side).

### Fluxo
1. Digita `/uf/pe/` ou click PE no mapa Home.
2. Lê KPIs ~10s: 44 total, 33 federais, 11 estaduais únicas, 6/9 eixos.
3. Click barra "Educ. direta" → 16 políticas.
4. Click "Origem: Estadual" → 4 políticas (estaduais únicas em educ. direta).
5. "Mostrar todas (44)" OU "Baixar CSV" → CSV das 44 fichas de PE.
6. "Comparar com..." → `/comparacao/?estados=pe,ce` pré-preenchido.
7. Click política → `/politica/<slug>/`.

### Dados consumidos
Subset onde `uf == "PE"` OR (federal replicada em PE). KPIs: count total/federal/estadual/distinct(eixo). Distribuição: group by tipo_politica, situacao_atual. Lista: `nome`, `slug`, `tipo_politica`, `is_federal_replica`, `situacao_atual`, `orgaos_responsaveis` (primeiro item local). Header: `data_versao_catalogo`.

### Interações
- Click barra distribuição filtra (URL muda).
- Click chip-tag remove filtro.
- `b` foca input busca dentro UF.
- Search local (filtra lista visual já renderizada — sem network).
- "Comparar com..." abre dropdown.

### URL determinística
```
/uf/<sigla>/?eixo=edu_direta&situacao=ativa&origem=estadual&q=<termo>&ordenar=nome:asc
```

### Complexidade
**Média** (~16-24h): layout+KPI 4-6h; barras horizontais clicáveis 4-6h (D3 simples ou CSS); filtros locais URL state 4-8h (reuso parcial W2); lista paginada 2-4h; PDF resumo 4-6h (reuso W3); geração 9 páginas via Eleventy `pagination` 1-2h.

---

## 5. Comparação inter-UF (`/comparacao/`)

### Cenário
Técnico precisa preparar nota técnica "como PE se compara a CE e BA em qualificação profissional" — input para Secretária. Sessão 30min, output tabela em PDF.

### Wireframe ASCII
```
+------------------------------------------------------------------+
|  COMPARAR POLITICAS ENTRE ESTADOS                                |
|  Selecione 2 a 9 UFs para comparar lado-a-lado.                  |
|  +-------------------------+  +-------------------------------+  |
|  | SELECIONE UFS           |  | OU CLIQUE NO MAPA             |  |
|  | [x] SP   [x] BA         |  | [SVG mapa Brasil clicavel;    |  |
|  | [ ] RJ   [ ] PA         |  |  UFs selecionadas em azul]    |  |
|  | [ ] MG   [x] PE         |  |                               |  |
|  | [ ] PR   [x] CE         |  |                               |  |
|  | [ ] RS   [ ] Federal    |  |                               |  |
|  +-------------------------+  +-------------------------------+  |
|  Selecionadas: SP x  BA x  PE x  CE x      [Limpar]              |
|  DIMENSOES                                                       |
|  [x] Numero total  [x] Distribuicao por eixo                     |
|  [x] Federal vs Estadual  [x] Politicas ativas                   |
|  [ ] Modalidades  [ ] Arranjo logistico  [ ] Publico-alvo        |
+------------------------------------------------------------------+
|  ABAS                                                            |
|  [TABELA] [GRAFICO] [MAPA] [POR POLITICA]                        |
|  TABELA COMPARATIVA                                              |
|  Dimensao             | SP  | BA  | PE  | CE  | Media           |
|  Total politicas      | 53  | 53  | 44  | 45  | 48.8            |
|  Politicas ativas     | 42  | 35  | 31  | 33  | 35.3            |
|  Federais replicadas  | 33  | 33  | 33  | 33  | 33.0            |
|  Estaduais unicas     | 20  | 20  | 11  | 12  | 15.8            |
|  Por eixo:                                                       |
|   Educ. direta        | 19  | 18  | 16  | 17  | 17.5            |
|   Trab. direta        | 16  | 18  | 12  | 14  | 15.0            |
|   Protec. social      | 10  |  9  |  9  |  8  |  9.0            |
+------------------------------------------------------------------+
|  ACOES                                                           |
|  [Baixar CSV] [Baixar PDF] [Copiar link] [Imprimir]              |
+------------------------------------------------------------------+
```

### Estados
- **Inicial sem seleção**: checkboxes vazios; mapa cinza+hatch; mensagem "Selecione 2 a 9 UFs"; export disabled.
- **Pós-ação 4 UFs**: tabela renderiza.
- **Aba Gráfico**: barras horizontais com média.
- **Aba Por Política** (modo política-cêntrico Atlas Brasil):
  ```
  POR POLITICA      Selecione: [PRONATEC v]
  Presente em: SP x BA x PE x CE x  (todos)
  Variacoes locais: SP -- SEDUC-SP, Modalidade Pres+EAD; ...
  ```
- **Vazio 1 ou 0 UF**: tabela placeholder + tooltip "Selecione ao menos 2 UFs".
- **Erro >9 UFs**: bloqueia 10a com toast "Máximo 9".
- **Loading**: client-side <100ms; fallback "Carregando..." se >300ms.

### Fluxo
1. Chega `/comparacao/`.
2. Click BA, PE, CE no mapa (ou checkboxes).
3. Tabela default (4 dims) renderiza.
4. (Opcional) Adiciona dimensão "Modalidades" → cresce 3 linhas.
5. (Opcional) Aba "Gráfico" → diferenças visuais.
6. "Baixar PDF" → PDF com cabeçalho + tabela + data + URL completa.
7. "Copiar link" → URL com filtros no clipboard.
8. Cola URL no email.

### Dados consumidos
Subset por UF + (federal replicada inclui X). Agregação **client-side** sobre `latest.json` (combinação explosiva impede pré-build). Campos: `uf`, `tipo_politica`, `situacao_atual`, `is_federal_replica`, `modalidade_oferta`, `arranjo_logistico`, `publico_alvo`, `nome`, `slug`. Aba Por Política: agrupa por `nome`/`federal_source_id` mostrando UFs onde aparece + diferenças em `orgaos_responsaveis`, `modalidade_oferta`, `arranjo_logistico`.

### Interações
- Click mapa adiciona/remove UF (toggle).
- Checkbox sincronizado com mapa.
- Limite 9 UFs (toast 10a).
- Drag-to-select retângulo no mapa (OECD GPS) — fase 2.
- Click célula tabela → drill-down `/buscar/?uf=PE&tipo=edu_direta`.
- Click coluna re-ordena.

### URL determinística (CRÍTICO)
```
/comparacao/?estados=sp,ba,pe,ce
            &dimensoes=total,ativas,federais,estaduais,por_eixo
            &view=tabela
            &ordenar_por=total:desc
            &politica=pronatec   (so na aba "Por politica")
            &v=2026-05
```
**Sem URL persistente perde 80% do valor** (lição Atlas Brasil).

### Complexidade
**Alta** (~40-60h): mapa interativo seleção múltipla 12-16h (reuso W1+W6); 4 abas 16-24h; URL state >5 params 4-6h; agregação client-side 7+ dimensões 4-6h; PDF custom 4-8h; edge cases 2-4h.

---

## 6. Mapa coroplético dedicado (`/mapa/`)

### Cenário
Técnico quer ver visualmente "onde no país há mais políticas de educ. direta" — exploração geográfica. Caso secundário, valor visual e de descoberta.

### Wireframe ASCII
```
+------------------------------------------------------------------+
|  MAPA COROPLETICO -- Politicas Publicas no Brasil                |
|  +-------------------------+   +------------------------------+  |
|  | DIMENSAO COLORIDA       |   | [SVG mapa Brasil grande;     |  |
|  | (x) Total politicas     |   |  UFs coloridas escala azul;  |  |
|  | ( ) Politicas ativas    |   |  UFs nao mapeadas com hatch  |  |
|  | ( ) Educ. direta        |   |  + label "nao mapeada"]      |  |
|  | ( ) Trab. direta        |   |                              |  |
|  | ...                     |   |                              |  |
|  | FILTROS                 |   |                              |  |
|  | Eixo: [Todos v]         |   |                              |  |
|  | Situacao: [Todos v]     |   |                              |  |
|  | Modalidade: [Todas v]   |   |                              |  |
|  | LEGENDA                 |   |                              |  |
|  |  0    [hatch]           |   |                              |  |
|  |  1-30 [azul claro]      |   |                              |  |
|  |  31-50[azul medio]      |   |                              |  |
|  |  51+  [azul escuro]     |   |                              |  |
|  +-------------------------+   +------------------------------+  |
|  HOVER UF: PE -- 44 politicas (16 educ. direta) [Ver pagina UF >]|
|  ACOES                                                           |
|  [Baixar PNG] [Baixar SVG] [Baixar CSV] [Lista textual]          |
+------------------------------------------------------------------+
|  LISTA TEXTUAL PARALELA (acessivel; expansivel)                  |
|  UF | Total | Ativas | Educ | Trab | PSoc                        |
|  SP | 53 | 42 | 19 | 16 | 10                                     |
|  BA | 53 | 35 | 18 | 18 |  9                                     |
|  ...                                                             |
+------------------------------------------------------------------+
```

### Estados
- **Inicial**: dim "Total políticas"; sem filtros; lista textual colapsada.
- **Pós-ação filtro**: cores recalculam ao vivo; URL muda; lista textual sincroniza.
- **Pós-ação UF clicada**: abre `/uf/<sigla>/`.
- **Vazio**: combinação extrema → mapa todo cinza+hatch + legenda "Nenhuma corresponde".
- **Erro GeoJSON**: lista textual como fallback total.
- **Loading**: SVG ~50KB GeoJSON + colorimetria ~300-600ms; placeholder "Carregando mapa..." `role="status"`.

### Fluxo
1. Chega `/mapa/`.
2. Lê mapa default.
3. Troca dim "Educ. direta" → re-pinta.
4. Aplica filtro `situacao=ativa` → re-pinta.
5. Hover PE → tooltip "PE: 16 educ. direta ativas".
6. Click PE → `/uf/pe/`.
7. (Opcional) "Baixar PNG" → estático para apresentação.
8. (Opcional) Expande "Lista textual".

### Dados consumidos
GeoJSON UFs estático: `assets/geo/br_ufs.json`. Por UF (build-time agregado): `total`, `ativas`, `por_tipo_politica`, `por_situacao`, `federais_replicadas`, `estaduais_unicas`. Filtros re-agregam client-side.

### Interações
- Radio button muda dimensão.
- Hover UF tooltip.
- Click UF navega.
- Tab navega entre UFs do mapa via teclado (cada `<path>` `tabindex="0"` + `aria-label`).
- Tecla Enter ativa.
- "Lista textual paralela" expansível — necessária a11y (NF-M-09 + F-S07).
- Download PNG: serializa SVG via `canvas.toDataURL`.

### URL determinística
```
/mapa/?dimensao=educ_direta&situacao=ativa&eixo=edu_direta
       &modalidade=presencial&origem=estadual&v=2026-05
```

### Complexidade
**Alta** (~30-50h): D3 mapa coroplético com escala 12-16h; lista textual paralela acessível sincronizada 6-10h (NF-M-09); filtros + URL state 4-6h; download PNG/SVG 2-4h; a11y (tabindex, aria-label por path, focus visível) 6-10h; estados erro 2-4h.

---

## 7. Grafo de relacionamentos (`/politica/<slug>/relacionadas/`)

### Cenário
Técnico quer entender "qual ecossistema legal envolve PRONATEC" — quais leis ele cita, quais o citam, quais o substituem. Caso secundário, alta densidade informacional.

### Wireframe ASCII
```
+------------------------------------------------------------------+
|  RELACIONADAS A PRONATEC                                         |
|  [ Voltar a ficha PRONATEC ]                                     |
|  TIPO DE RELACAO  (filtros de aresta)                            |
|  [x] Substitui      [x] Substituida por                          |
|  [x] Cita           [x] Citada por                               |
|  [ ] Replicada em UFs                                            |
|  PROFUNDIDADE  ( ) 1 nivel  (x) 2 niveis  ( ) 3 niveis           |
+------------------------------------------------------------------+
|  +------------------------------------------------------------+  |
|  | [ Cytoscape canvas: nos circulares com label;              |  |
|  |   arestas dirigidas com cor por tipo;                      |  |
|  |   no central PRONATEC destacado em azul-escuro;            |  |
|  |   drag/zoom/pan;  hover destaca conexoes ]                 |  |
|  |                                                            |  |
|  |   Exemplo simplificado:                                    |  |
|  |     [Lei 12.513/11]                                        |  |
|  |          v cita                                            |  |
|  |      [PRONATEC] -- replica em --> [SP RJ MG ...]           |  |
|  |          v substituiu                                      |  |
|  |     [Programa anterior X]                                  |  |
|  +------------------------------------------------------------+  |
|  CONTROLES  [Reset zoom] [Centralizar] [Toggle labels]           |
+------------------------------------------------------------------+
|  LISTA TEXTUAL PARALELA (sempre visivel; F-S09)                  |
|  Substitui: -- (PRONATEC nao substitui catalogada)               |
|  Substituida por: -- (vigente)                                   |
|  Cita: > FIES [Ver ficha >]   > ProUni [Ver ficha >]             |
|  Citada por (14): > Programa Mulheres Mil   > Brasil Profis...   |
|     [Mostrar todas 14]                                           |
|  Replicada em UFs: > SP RJ MG PR RS BA PA PE CE                  |
+------------------------------------------------------------------+
```

### Estados
- **Inicial**: grafo centrado PRONATEC, profundidade 2, todos tipos de aresta ligados.
- **Pós-ação filtro aresta**: desligar "Citada por" → arestas desse tipo somem; nós folhas também.
- **Pós-ação nó clicado**: click FIES → `/politica/fies/relacionadas/` (nova URL).
- **Vazio política isolada**: mensagem "Nenhuma política relacionada catalogada. [Voltar à ficha]". Lista mostra "-".
- **Erro Cytoscape**: fallback total para "Lista textual paralela" + banner "Visualização em grafo indisponível" (NF-M-10 + F-S09).
- **Loading**: Cytoscape ~150KB lazy ~300-800ms; placeholder; lista textual já renderiza imediatamente.

### Fluxo
1. Em `/politica/pronatec/`, click "Ver políticas relacionadas" → `/politica/pronatec/relacionadas/`.
2. Lê lista textual primeiro (sempre visível) — entende ~30s as 4 categorias.
3. (Opcional) Olha grafo visualmente.
4. Click FIES (lista ou grafo) → `/politica/fies/relacionadas/`.
5. (Opcional) "Voltar à ficha PRONATEC" → `/politica/pronatec/`.

### Dados consumidos
`id_interno` (foco), `slug`, `nome`. Arestas:
- `supersedes_id` → "Substitui"
- `superseded_by_id` → "Substituída por"
- `integra_outras_politicas` → "Cita"
- "Citada por" — calculado build-time (grep reverso) em `assets/data/citacoes-reversas.json`
- `is_federal_replica` + `federal_source_id` → "Replicada em UFs"
Display nós: `nome` truncado, `tipo_politica` (cor), `situacao_atual` (ícone).

### Interações
- Toggle tipo aresta.
- Profundidade 1/2/3.
- Click nó folha navega.
- Drag/zoom/pan canvas.
- Lista textual fonte de verdade para a11y.
- Tab navega nós da lista; Enter abre.

### URL determinística
```
/politica/<slug>/relacionadas/?profundidade=2
                                &tipos=substitui,substituida,cita,citada_por
                                &v=2026-05
```

### Complexidade
**Alta** (~40-60h): Cytoscape integration+estilo 12-16h; cálculo citações reversas build-time 4-6h; lista textual paralela completa (NF-M-10 + F-S09) 6-10h; a11y do canvas 8-12h; filtros aresta+profundidade dinâmica 4-6h; estados 4-6h; geração ~439 páginas em build-time 2-4h.

---

## 8. Sobre + Privacidade + Citação (`/sobre/`)

### Cenário
Técnico clicou no rodapé "Sobre" — quer entender quem fez, qual versão, como citar, quando 2a onda. Ou: precisa do contato para reportar erro. Ou: chegou via colega acadêmico que pediu DOI Zenodo.

### Wireframe ASCII (parcial)
```
+------------------------------------------------------------------+
|  SOBRE O CATALOGO                                                |
|  NAVEGACAO INTERNA  [sticky lateral em desktop; tabs em mobile]  |
|  > O projeto                                                     |
|  > Equipe e revisao                                              |
|  > Como citar                                                    |
|  > Cobertura e proximas ondas                                    |
|  > Metodologia                                                   |
|  > Privacidade e LGPD                                            |
|  > Licenca e uso                                                 |
|  > Reportar erro                                                 |
|  > Dados abertos / API                                           |
|  > Changelog                                                     |
+------------------------------------------------------------------+
|  ## O PROJETO                                                    |
|  Versao atual: 2026-05-01 | 439 politicas; 9 UFs+Federal; 148 ss |
|  Iniciativa: FRM e IESP-UERJ                                     |
|  Coordenacao: Rogerio Barbosa (rogerio.barbosa@iesp.uerj.br)     |
|                                                                  |
|  ## EQUIPE E REVISAO                                             |
|  Revisora principal: Maria Clara Gama                            |
|  Revisores por UF: M.J.R. Garcia (PR), Cintia Frazao (resoluc.), |
|     Hellen Guicheney (categorias), Jaqueline Sant'ana (RJ).      |
|                                                                  |
|  ## COMO CITAR                                                   |
|  ABNT: BARBOSA, R. et al. Catalogo... [Copiar]                   |
|  APA: Barbosa, R. et al. (2026)... [Copiar]                      |
|  BibTeX: @misc{frm_catalogo_2026, ...} [Copiar]                  |
|  CITATION.cff: [link arquivo no repo]                            |
|  DOI Zenodo: 10.5281/zenodo.XXXXXXX [Ver no Zenodo ^]            |
|                                                                  |
|  ## COBERTURA E PROXIMAS ONDAS                                   |
|  1a onda: 9 UFs + Federal.                                       |
|  2a onda: NE/CO em estudo. Cronograma: 2027.                     |
|  Snapshots faltando: 197 fichas (WAF gov.br: 71; planalto: 23)   |
|                                                                  |
|  ## PRIVACIDADE E LGPD                                           |
|  - Sem cookies de rastreamento.                                  |
|  - GoatCounter (IPs anonimizados, 30 dias).                      |
|  - Politica completa: [Politica de privacidade] [linkado]        |
|                                                                  |
|  ## REPORTAR ERRO                                                |
|  Encontrou erro? [Formulario] [email] [issue GitHub]             |
|  SLA: revisao em ate 90 dias.                                    |
|                                                                  |
|  ## DADOS ABERTOS / API                                           |
|  Baixar tudo: [latest.json] [snapshots.tar.gz]                   |
|  API estatica: /api/politica/<slug>.json /api/uf/<sigla>.json    |
|                                                                  |
|  ## CHANGELOG                                                    |
|  - 2026-05-01: Versao 1.0 publica.                               |
+------------------------------------------------------------------+
```

### Estados
- **Inicial**: todas seções renderizadas em scroll. Nav lateral em desktop; tabs/accordion mobile.
- **Pós-ação link interno**: click "Como citar" → scroll-to seção com hash `/sobre/#como-citar`. Highlight 1s.
- **Pós-ação copiar citação**: click [Copiar] → texto no clipboard, toast.
- **Vazio/Erro/Loading**: N/A; estática.

### Fluxo
1. Click "Sobre" no rodapé.
2. Lê "O projeto" + "Equipe" para entender fonte.
3. **(a)** acadêmico: scroll "Como citar" → [Copiar] ABNT → cola em paper.
4. **(b)** reportar erro: scroll "Reportar erro" → formulário.
5. **(c)** dados: scroll "Dados abertos" → baixa CSV.
6. **(d)** privacidade: scroll "Privacidade" → lê política.

### Dados consumidos
Metadata global do catálogo: `data_versao_catalogo`, `total_politicas`, `total_ufs`, `total_snapshots`. Lista revisores: `_data/equipe.yml`. DOI Zenodo: hardcoded `_data/site.js`. Cobertura faltante: `count where fonte_arquivo_path == null`. Citação catálogo: gerada build-time.

### Interações
- Nav lateral sticky (desktop) com `aria-current` na seção em viewport.
- [Copiar] em cada formato.
- Links externos `rel="noopener"` + ícone `^`.
- Hashes URL bookmarkáveis.

### URL determinística
- `/sobre/` (default).
- `/sobre/#o-projeto`, `/sobre/#equipe-e-revisao`, `/sobre/#como-citar`, ...
- Alternativa páginas separadas: `/sobre/privacidade/`, `/sobre/citacao/`, `/sobre/cobertura/`, `/sobre/contato/`. Decisão secundária.

### Complexidade
**Simples** (~12-20h): conteúdo Markdown 4-6h (~10 seções, ~1500 palavras); botões copiar 2-4h; nav lateral sticky 2-4h; geração citação catálogo build-time 2-4h; integração Zenodo (link manual) 0-2h.

---

## Tabela final consolidada

| # | Wireframe | Cenário-resumo | Dados principais | URL determinística? | Complexidade | Horas est. |
|---|---|---|---|---|---|---:|
| 1 | Home/Dashboard | Porta entrada. KPIs em 30s, decide caminho. | Agregados; nome+slug autocomplete | Não (`/`) | Média | 16-24h |
| 2 | Busca facetada | Sabe nome OU combina facetas. Exporta CSV/JSON. | Pagefind index; 7 facetas | Sim (10+ params) | Alta | 30-50h |
| 3 | Ficha individual | Copia base legal + link + snapshot para email. | TODO o schema | Sim | Média-Alta | 24-40h |
| 4 | Página UF executiva | Bookmark da própria UF. KPIs+lista filtrável. PDF. | Subset UF; agregados locais | Sim | Média | 16-24h |
| 5 | Comparação inter-UF | Nota técnica 2-9 UFs em N dimensões. PDF. | Subset UFs; 7+ dims client-side | Sim | Alta | 40-60h |
| 6 | Mapa coroplético | Exploração geográfica visual. | GeoJSON + agregados-uf | Sim | Alta | 30-50h |
| 7 | Grafo relacionamentos | Ecossistema legal de 1 política. | id, supersedes, integra, citações reversas | Sim | Alta | 40-60h |
| 8 | Sobre+Priv+Citação | Citação, equipe, LGPD, contato, dados. | Metadata global | Sim (hashes) | Simples | 12-20h |

**Total estimado wireframes (lente fluxo):** 208-328h. Compatível com Bloco F (380-1040h) que inclui itens transversais (a11y completa, schema.org, citação por ficha, automação, CI, hosting).

---

## Recomendação de ordem de implementação no Bloco F

### Onda F.1 — Esqueleto operacional (~80-120h)
**Objetivo**: persona técnica completa sessão de 30min com export.

1. **W3 Ficha individual** (24-40h) — destino do fluxo dominante; força schema ponta a ponta.
2. **W2 Busca facetada** (30-50h) — caminho mais usado para chegar na ficha.
3. **W1 Home/Dashboard** (16-24h) — porta entrada; MVP sem mapa coroplético inicialmente (mapa entra em F.2).
4. **W8 Sobre+Privacidade+Citação** (12-20h) — conformidade legal LGPD + citação acadêmica. Bloqueador.

### Onda F.2 — Profundidade UF + comparação (~60-90h)
**Objetivo**: persona estadual tem página dedicada e pode comparar.

5. **W4 Página executiva UF** (16-24h) — segundo destino mais comum.
6. **W5 Comparação inter-UF** (40-60h) — caso valioso para nota técnica.

### Onda F.3 — Visualizações ricas (~70-110h)
**Objetivo**: explorar visualmente; valor analítico.

7. **W6 Mapa coroplético dedicado** (30-50h) — reusa SVG + lista textual já feitos na Home.
8. **W7 Grafo relacionamentos** (40-60h) — maior custo a11y; pode esperar.

### Justificativa da ordem
- **Fluxo dominante primeiro**: Ficha (3) é a única página que técnico extrai conteúdo. Sem ela, busca não tem destino, UF não tem detalhe.
- **Busca antes da Home**: técnico que sabe o que quer pula direto para `/buscar/` (atalho `/`). Home pode ser MVP simples e ganhar mapa em F.3.
- **Sobre cedo**: bloqueio jurídico (LGPD CONS-M-05) + atribuição acadêmica (CONS-M-03) — risco retrabalho se deixar para o fim.
- **UF + Comparação juntas em F.2**: dependem do mesmo agregado por UF.
- **Mapa e Grafo por último**: maior custo a11y combinado (60-100h); valor analítico mas não bloqueia fluxo.

### Marcos sugeridos
- **Marco 1 (fim F.1)**: site no ar com 5 fichas-piloto + busca + Sobre. Beta privado para 2-3 gestores reais.
- **Marco 2 (fim F.2)**: 9 UFs + comparação. Convite à equipe FRM.
- **Marco 3 (fim F.3)**: mapa + grafo + 439 fichas + DOI Zenodo. **Lançamento público.**

### Dependências transversais (paralelas às ondas)
- **a11y axe-core CI** (NF-S-22, NF-M-04): integrar desde F.1; auditar cada wireframe.
- **Schema.org JSON-LD por ficha** (F-M14): adicionar quando W3 entregue.
- **CI build reproduzível** (F-A04): desde F.1.
- **GoatCounter + Política Privacidade** (CONS-M-05): F.1 (junto W8).
- **Backup off-Drive** (CONS-M-01): GH Action mensal — F.1.
- **Plano continuidade** (CONS-M-02): RUNBOOK redigido em F.1; testado em F.3.