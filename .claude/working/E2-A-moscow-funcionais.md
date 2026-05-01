# E.2.A — MoSCoW de Requisitos Funcionais (lente: o que o sistema FAZ)

> **Avaliador consensual A** do sub-bloco E.2. Lente: **REQUISITOS FUNCIONAIS** (comportamento observável).
> Não-funcionais (performance, a11y técnica, segurança, infra) ficam para o avaliador B.
> Data: 2026-05-01

## Premissas herdadas do Checkpoint E.1

- **Persona primária**: Técnico/Coordenador estadual (operacional, sessão ~30min)
- **Persona secundária**: Pesquisador acadêmico (citação + DOI + downloads brutos)
- **Hospedagem**: GitHub Pages estático (`antrologos.github.io/catalogo-politicas/`)
- **Analytics**: GoatCounter (free, sem cookies, LGPD-friendly)
- **Mantenedor**: Rogério sozinho — automação prioritária, manutenção minimizada
- **Identidade**: gov.uk-inspired
- **Escopo**: 8 wireframes + mapa coroplético + grafo de relacionamentos (mantidos com fallbacks textuais)
- **Dados**: 439 fichas (9 UFs + Federal), schema v0.2, 148 snapshots, vocabulário canônico v1.0

## Princípios de classificação MoSCoW

- **Must** = sem isso o site não pode ir ao ar como "catálogo de políticas". Bloqueia lançamento.
- **Should** = importante para a proposta de valor; lançar sem ele degrada UX, mas não invalida. Hotfix em 4 semanas.
- **Could** = desejável; entra se sobrar tempo no Bloco F sem comprometer Must/Should.
- **Won't** (this MVP) = decidido fora do MVP; retorna como candidato no Bloco G.

Todo requisito deve ser **observável** (a pessoa usuária consegue dizer "sim, faz isso" ou "não faz") e **testável** (existe um caminho de validação manual ou automática).

---

## MUST — bloqueia lançamento (15 itens)

| ID | Cat | Nome | Descrição | Justificativa |
|---|---|---|---|---|
| F-M01 | NAVEGACAO | Página inicial agregada | Home `/` exibe contadores totais (439 políticas / 9 UFs+Federal / data última atualização) e 4 atalhos primários (Buscar, Comparar, Mapa, Sobre). | Sem entrada cognitiva clara, gestor abandona em <10s (E.1.C). Wireframe #1 do plano. |
| F-M02 | BUSCA | Busca textual nos metadados | Caixa única na home + header, busca em `nome_programa`, `resumo`, `apresentacao`, `orgao_responsavel`, `base_legal` com normalização (lowercase, sem acento). | Persona técnico-operacional procura por nome/sigla específica em 30min de sessão; sem busca, catálogo vira lista cega. |
| F-M03 | FILTRO | Filtros facetados por vocabulário canônico | Pelo menos 5 facetas obrigatórias na página `/buscar`: UF, Tipo de Política (3 valores), Situação atual (5 valores), Esfera de execução, Modalidade da oferta. Cada faceta mostra contador ao vivo. | Vocabulário canônico v1.0 já existe; sem facetas, 439 fichas são inutilizáveis. Anti-padrão ObservaSampa: dropdowns sem preview foram explicitamente rejeitados. |
| F-M04 | FILTRO | Combinação multi-faceta com URL determinística | Filtros combinados aparecem em query string (`/buscar?uf=sp,mg&situacao=ativa&eixo=edu`) e estado é restaurável por bookmark/compartilhamento. | "Your URL is Your State" foi consenso forte de 5 agents (E.1.F). Sem isso, comparações não são compartilháveis. |
| F-M05 | FICHA | Página individual da política | URL `/politica/<slug>` exibe TODOS os ~50 campos do schema v0.2, agrupados em seções (Identificação, Vigência, Execução, Oferta, Documentos, Metadados). | Razão de existir do catálogo. Sem ficha completa, é apenas índice. |
| F-M06 | FICHA | Snapshot integral acessível na ficha | Ficha exibe link "Ver no oficial [↗]" + "Baixar snapshot local [↓]" para cada `fonte_arquivo_path` (148 snapshots em `data/external_snapshots/`). | Princípio fundador: link rot é inaceitável; snapshot é o ativo central do projeto (Bloco D). |
| F-M07 | FICHA | Indicador de status e completude | Tag visual de `situacao_atual` (5 cores semânticas) + badge `completude_pct` (já no schema). | Gestor precisa saber em 3s se a política está ativa; pesquisador precisa ler completude antes de citar. |
| F-M08 | NAVEGACAO | Página executiva por UF | URL `/uf/<sigla>` exibe KPIs (total/federal/estadual/eixos), distribuição por eixo, e lista filtrável das políticas daquela UF. Para 9 UFs do catálogo. | Wireframe #6 do plano; persona primária é gestor estadual que entra direto pelo seu estado. |
| F-M09 | NAVEGACAO | Cabeçalho e rodapé persistentes | Header sticky com logo+busca; footer com Sobre, Metodologia, Privacidade, Transparência, Licença CC-BY 4.0, link GitHub. | Padrão gov.uk + LAI; sem footer institucional, catálogo perde credibilidade acadêmica. |
| F-M10 | NAVEGACAO | Página "Sobre" + Metodologia + Cobertura | `/sobre`, `/sobre/metodologia`, `/sobre/cobertura` (esta declarando explicitamente "9 UFs catalogadas + cronograma das próximas"). | Combate ao viés de seleção (Blind spot 2 do adversarial). Bloqueia lançamento por questão metodológica. |
| F-M11 | NAVEGACAO | Página de Privacidade (LGPD) + Termos | `/sobre/privacidade` + `/sobre/termos` declarando: GoatCounter sem cookies, logs anonimizados, hospedagem GitHub (transferência internacional), CC-BY 4.0. | Lei 13.709/2018 obriga; adversarial elevou de "se houver analytics" para "obrigatório no MVP". |
| F-M12 | NAVEGACAO | Página 404 com fuzzy match | `/404` busca o slug requisitado em tabela de redirects + sugere até 5 alternativas próximas (fuzzy match) + lista 5 políticas mais consultadas. | Slugs vão mudar; sem 404 cuidadosa, link rot interno aniquila SEO e confiança. |
| F-M13 | METADADOS | ID universal imutável + slug mutável | Cada ficha tem `id_universal` (`FRM-CP-2026-EDU-0042`, imutável) separado de `slug` legível; tabela de redirects para slugs antigos. | Padrão CELEX (E.1.D); fundação para citação acadêmica e link rot interno. |
| F-M14 | METADADOS | Data de revisão visível em cada ficha | Toda ficha mostra "Revisado em DD/MM/AAAA" e "Versão do catálogo: vYYYY-MM" no topo. | Anti-padrão ObservaSampa explícito: gestor nunca deve perguntar "este dado é de quando?". |
| F-M15 | AUTOMACAO | Build reproduzível a partir do JSON canônico | `data/derived/policies-onda-1-*.json` + `latest.json` é a fonte única; build estático regenera 100% do site sem edição manual. | Rogério mantém sozinho; sem reproducibilidade, manutenção colapsa em 18 meses (Blind spot 3). |

---

## SHOULD — importante, hotfix pós-lançamento (12 itens)

| ID | Cat | Nome | Descrição | Justificativa |
|---|---|---|---|---|
| F-S01 | BUSCA | Full-text dos snapshots integrais | Busca opcional em `/buscar?modo=fulltext` indexa o texto extraído dos 148 snapshots (HTML + PDF OCR + DOC/ODT convertidos). | Snapshots já existem; índice Lunr/MiniSearch resolve. Diferencial competitivo enorme vs catálogos brasileiros. |
| F-S02 | BUSCA | Autocomplete por nome de programa | Caixa de busca sugere até 8 programas conforme digita (matching prefix + fuzzy nos nomes). | Persona técnica busca por sigla/nome conhecido; reduz cliques drasticamente. |
| F-S03 | FILTRO | Facetas avançadas opcionais | Adicionar facetas: Esfera de formulação, Origem da proposta, Fonte de financiamento, Transferência de recursos, Arranjo logístico, Continuidade entre governos, Ano de criação (range). | Schema tem 27 colunas; 5 facetas no Must cobrem 80% dos casos, demais entram aqui. |
| F-S04 | COMPARACAO | Comparação inter-UF lado-a-lado (até 9 UFs) | URL `/comparacao?ufs=sp,mg,ba&dimensoes=total,por_eixo,situacao` exibe tabela comparativa com seleção via mapa OU dropdown searchable. | Wireframe explícito do escopo (E.1.A). Adversarial questionou uso real, mas decisão E.1 manteve. Hotfix se travar lançamento. |
| F-S05 | COMPARACAO | Modo política-cêntrico na comparação | Aba 4 da comparação: dropdown seleciona 1 política federal → mostra "Presente em [UFs] / ausente em [UFs]" + diferenças de execução por UF. | Captura a redundância intencional do dataset (33 federais replicadas com órgão executor estadual). Valor único. |
| F-S06 | MAPA | Mapa coroplético do Brasil na home | SVG do Brasil clicável; cor proporcional ao nº de políticas; hover mostra "SP: 87 políticas"; clique → `/uf/sp`; UFs não-cobertas em padrão hatch + label "fora do catálogo". | Wireframe #1 + decisão E.1; combate adversarial via hatch+label explícito. |
| F-S07 | MAPA | Lista textual paralela ao mapa (a11y) | Abaixo do mapa, lista ordenada `<ol>` de UFs com contagem; mesmo conteúdo informacional, navegável por teclado e leitor de tela. | Adversarial cortaria o mapa por a11y; mantemos com fallback textual obrigatório. |
| F-S08 | GRAFO | Grafo de relacionamentos tipados | Página `/politica/<id>/relacionadas` com nós (políticas) e arestas tipadas (`substitui`, `altera`, `regulamenta`, `integra-com`, `revoga`). | Padrão CourtListener (E.1.D); decisão E.1 manteve. Schema v0.3 (futuro próximo). |
| F-S09 | GRAFO | Lista textual de relacionamentos como fallback | Mesma página exibe lista `<dl>` agrupada por tipo de relação; conteúdo informacional 100% acessível sem o grafo SVG. | Mesma lógica do F-S07; padrão WCAG. |
| F-S10 | CITACAO | Bloco "Como citar" em cada ficha | Ficha mostra citação em ABNT, APA e BibTeX, com botão "Copiar"; usa `id_universal`, data de revisão e versão do catálogo. | Persona secundária (pesquisador) é viabilizada. Padrão E.1.B + E.1.C. |
| F-S11 | EXPORT | Download CSV/JSON da listagem filtrada | Em qualquer página de busca/listagem, botão "Baixar resultados (CSV)" e "(JSON)" gera arquivo refletindo filtros ativos. | Persona pesquisador; padrão dados.gov.br/CKAN; sem isso o catálogo não cumpre função de dados abertos. |
| F-S12 | METADADOS | Changelog público | Página `/sobre/changelog` lista versões `vYYYY-MM` com diff humano (políticas adicionadas/revistas/removidas). | Padrão LAI (E.1.E); transparência metodológica. Pode ser gerado por script de diff entre `policies-onda-N` e `latest`. |

---

## COULD — entra se sobrar tempo (9 itens)

| ID | Cat | Nome | Descrição | Justificativa |
|---|---|---|---|---|
| F-C01 | BUSCA | Sintaxe de busca avançada | Operadores `"frase exata"`, `-exclusao`, `campo:valor` (ex.: `eixo:edu uf:sp`). | Persona pesquisador beneficiada; UX adicional, não bloqueia busca básica. |
| F-C02 | COMPARACAO | Exportar comparação como PDF customizado | Botão "Baixar PDF" gera PDF da comparação atual (Puppeteer/Playwright na build, ou print stylesheet). | Padrão OECD GPS; persona pesquisador apresenta em reunião. PDF completo via print-CSS é bem mais barato. |
| F-C03 | MAPA | Animação temporal do mapa | Slider de ano (2000-2026) anima coloração do mapa conforme políticas foram criadas. | Atlas Violência IPEA tem; visualmente forte; complexidade média. |
| F-C04 | GRAFO | Filtro por tipo de relação no grafo | No grafo, checkboxes "mostrar apenas: substitui / altera / regulamenta" filtram arestas. | UX adicional; valor incremental sobre lista textual. |
| F-C05 | EXPORT | Endpoint API JSON estável | `/api/politica/<id>.json`, `/api/uf/<sigla>.json`, `/api/dataset.json` (CKAN/DCAT-AP-BR). | Federação futura com dados.gov.br (E.1.E); preparação para Bloco G. |
| F-C06 | EXPORT | Export PDF compilado de uma ficha individual | Botão "Baixar PDF desta ficha" empacota ficha + snapshot integral em PDF único. | Útil para gestor que arquiva offline; complexidade média. |
| F-C07 | NAVEGACAO | Breadcrumb consistente | Toda página interna tem breadcrumb (`Home > UFs > PE > Programa Ler Brasil`). | Padrão gov.uk; orientação cognitiva; pequeno mas trabalhoso de manter consistente. |
| F-C08 | NAVEGACAO | Política "anterior/próxima" na ficha | Botões `← Anterior | Próxima →` na ficha individual, navegando ordem alfabética dentro da UF. | Browse acidental; valor baixo mas barato. |
| F-C09 | METADADOS | Schema.org markup estruturado | JSON-LD em cada ficha (`@type: GovernmentService` ou `Dataset`). | SEO + indexação por Google Dataset Search; preparação para divulgação (Blind spot 5). |

---

## WON'T — fora do MVP, candidato a Bloco G (5 itens)

| ID | Cat | Nome | Descrição | Justificativa para EXCLUIR |
|---|---|---|---|---|
| F-W01 | CITACAO | DOI institucional do catálogo | Registro DOI via Zenodo ou IESP-UERJ para citação canônica do dataset; cada versão tem DOI próprio. | Decisão E.1: citação formatada SIM; DOI ainda exige decisão institucional FRM/IESP — fora do MVP. |
| F-W02 | METADADOS | Sistema de alertas por tag (subscriptions) | Endpoint `/api/subscribe?tag=educacao` envia notificação quando nova política daquela tag é incluída. | Padrão GovTrack (E.1.D); exige backend dinâmico (e-mail, banco de assinantes); MVP é estático. Schema preparado, infra fora. |
| F-W03 | FICHA | Sistema de comentários públicos / feedback identificado | Visitantes deixam correções/sugestões em cada ficha com nome e e-mail. | Exige LGPD reforçada, moderação humana contínua, banco dinâmico. Mantenedor único = inviável. Substituído por link "reportar erro" pré-preenchido em formulário externo. |
| F-W04 | NAVEGACAO | Multilíngue (PT/EN/ES) | Tradução completa da interface e de campos selecionados das fichas. | Custo de tradução proibitivo para 439 fichas; público-alvo é brasileiro. Bloco G se houver demanda internacional. |
| F-W05 | FICHA | Página "Como adotar uma política" | Manual de implementação por política, com passos para outro estado replicar. | Promete o que o catálogo não pode entregar (Adversarial Cortar 2). Risco reputacional alto. Substituído por seção "Documentos de implementação" (subset de F-M05). |

---

## AUTOMACAO — requisitos transversais (4 itens)

Funcionais do **sistema de manutenção**, viabilizam operação solo do mantenedor.

| ID | Cat | Nome | Descrição | MoSCoW | Justificativa |
|---|---|---|---|---|---|
| F-A01 | AUTOMACAO | Cron de validação de schema | GitHub Action diária roda `validate_json_schema` em `data/derived/latest.json` e abre issue se falhar. | **Must** | Sem isso, drift de schema passa silencioso; já existe hook local, falta CI. |
| F-A02 | AUTOMACAO | Link checker programado | GitHub Action semanal verifica HTTP status de todas as `link` das fichas; abre issue listando 4xx/5xx novos. | **Must** | 71 URLs já têm falha persistente; sem monitoramento, número cresce. |
| F-A03 | AUTOMACAO | Re-fetch de snapshots com diff SHA | Cron mensal roda `just revalidar-todas`; compara SHA-256 e marca `superseded_by_sha256` quando muda. | **Should** | Já implementado em CLI; falta agendamento + relatório consolidado. |
| F-A04 | AUTOMACAO | Build automatizado em push para `main` | GitHub Action: ao push em `main`, roda testes (57/57) + build estático + deploy GitHub Pages. | **Must** | Mantenedor único; deploy manual = catálogo desatualizado. |

(F-A01, F-A02 e F-A04 estão também contabilizados como Must — F-M15 abrange-os no nível de princípio, mas explicito-os aqui pelo recorte de categoria.)

---

## Ressalvas e fronteiras com o avaliador B (não-funcionais)

Deliberadamente NÃO incluídos (escopo do avaliador B):

- Performance (LCP, INP, tamanho de bundle, lazy loading)
- WCAG 2.2 AA / eMAG técnico (contraste, focus ring, ARIA detalhado, VLibras widget)
- Segurança (CSP, HTTPS-only, rate limiting de scrapers)
- LGPD operacional (retenção de logs, banner de cookies se necessário)
- SEO técnico (sitemap.xml, robots.txt, Open Graph)
- TCO 5 anos (Blind spot 4 do adversarial)

A camada funcional **declara** o que o sistema faz; a camada não-funcional **qualifica** como faz.

## Dependências críticas entre Must

```
F-M15 (build reproduzível) ──┬── F-M01 (home)
                             ├── F-M05 (ficha)
                             ├── F-M08 (UF)
                             └── F-M02 (busca)

F-M13 (id_universal) ───────── F-M05, F-M12, F-M14, F-S10

F-M03 (filtros) ──── depende de vocabulario-canonico.json v1.0 (já existe)

F-M06 (snapshot na ficha) ──── depende de data/external_snapshots/ + index.json (já existe)
```

Nenhum Must depende de schema v0.3 ou de feature ainda não construída no Bloco D.

---

## Resumo executivo

| Categoria | Quantidade |
|---|---:|
| **Must** | 15 → bloqueia lançamento |
| **Should** | 12 → hotfix pós-lançamento, 4 semanas |
| **Could** | 9 → entra se sobrar tempo no Bloco F |
| **Won't (this MVP)** | 5 → candidatos para Bloco G |
| **Total mapeado** | **41 requisitos funcionais** |

Distribuição por categoria (M / S / C / W):
- BUSCA: 4 (1 / 2 / 1 / 0)
- FILTRO: 3 (2 / 1 / 0 / 0)
- FICHA: 5 (3 / 1 / 0 / 1; +1 W consolidado)
- COMPARACAO: 3 (0 / 2 / 1 / 0)
- MAPA: 3 (0 / 2 / 1 / 0)
- GRAFO: 3 (0 / 2 / 1 / 0)
- CITACAO: 2 (0 / 1 / 0 / 1)
- EXPORT: 3 (0 / 1 / 2 / 0)
- NAVEGACAO: 8 (5 / 0 / 2 / 1)
- METADADOS: 4 (2 / 1 / 1 / 1)
- ACESSIBILIDADE: 0 (escopo do avaliador B; o fallback textual de mapa/grafo está em MAPA/GRAFO)
- AUTOMACAO: 4 (3 / 1 / 0 / 0)

**Recomendação ao Checkpoint E.2**: validar com mantenedor único (Rogério) se 15 Must são realmente sustentáveis em horas/semana disponíveis. Se não, candidatos óbvios para rebaixar a Should: **F-M08** (página por UF — substituível pela combinação F-M02 busca + F-M03 filtro UF) e **F-M12** (404 com fuzzy match — degradação aceitável para 404 estática). Ambos mantêm o site funcionalmente íntegro sendo apenas Should.