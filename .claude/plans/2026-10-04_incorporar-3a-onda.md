# Plano: Incorporar a 3ª onda (9 UFs) + revisão da 2ª onda

**Status**: APROVADO (2026-10-04, com ajustes da usuária — ver "Decisões")
**Data**: 2026-10-04
**Bloco/Rodada**: G · nova onda

## Contexto

O catálogo em produção tem 822 fichas (287 verbetes únicos), com 18 UFs + Federal (1ª e 2ª ondas).
A usuária deixou em `C:\Users\antro\Downloads\Catalogo políticas\` duas planilhas:

- **`Ficha de Políticas - 3ª Onda.xlsx`** traz 9 UFs novas: MS, RR, DF, RO, PI, AC, SE, TO, AP. Com elas o catálogo passa a cobrir as **27 UFs**.
- **`Ficha das Políticas - 2ª onda (1).xlsx`** é uma revisão da 2ª onda, com 61 células diferentes da versão em `data/raw/`:
  - 58 estão na aba federal, que o ETL ignora.
  - 3 estão em abas estaduais: MA/PEESP (Integra com outras políticas), MA/Bolsa Família (Apresentação) e AM/PMQ (Resumo).

O pipeline completo foi simulado numa cópia isolada (scratchpad), sem tocar no repositório.
Antes da simulação, a cópia reproduziu o `latest.json` de produção byte a byte, com exceção das citações, que levam a data de acesso.

## Achados da simulação

1. **Variante de cabeçalho nova.** O cabeçalho `Órgão(s) responsável(eis) com especificações` aparece em RR, AC, SE, TO e AP e não está no `HEADER_MAP`. Sem correção, a coluna inteira (185 valores) seria descartada sem aviso.
2. **Colunas-fantasma novas.** `Coluna 5`–`8` e `Column 36` estão vazias. Basta incluí-las em `GHOST_HEADERS`, o que só limpa o log.
3. **Aba federal duplicada.** A aba federal da 3ª onda repete a da 1ª (32/33 fichas), então é pulada, como já acontece com a 2ª onda.
4. **Detecção de réplicas consistente com as ondas anteriores.** Variantes estaduais continuam únicas, como antes: "ENCCEJA via IFRO" (RO) e "ProJovem Urbano e Campo" (DF).
5. **7 erros de schema em 6 fichas** (5 em `situacao_atual` e 1 em `tipo_politica = "Misto"`). Eles derrubariam o job `validate` do deploy, como aconteceu em 13/mai.
6. **15 valores fora do vocabulário em facetas do site** (abrangência e modalidade). Cada um geraria uma página de faceta espúria.
7. **Bug anterior, introduzido em `d538e70` (14/mai).**
   - `build_ids.py` ainda usa os nomes antigos de `tipo_politica`, por isso 637 fichas receberam ID `OUTR-xxxx` em vez de `EDU`/`TRAB`.
   - Dos 302 IDs curados em `articulacoesCuradas.js` (grafo oculto), só 54 resolvem hoje. Com a correção, os 302 voltam a resolver.
8. **Teste de integração desatualizado.** 3 dos 14 testes já falham em produção, porque esperam 439 fichas, 9 UFs e os nomes antigos de tipo.

## Resultado esperado (verificado no sandbox)

- 1158 fichas, sendo 792 réplicas e **366 únicas (+79)**, cobrindo **27 UFs + Federal**.
- **0 erros de schema**.
- Nenhum valor novo nas facetas do site, exceto "Sem informação" em Situação, que já é um valor canônico.
- Nas fichas já publicadas os slugs não mudam. Mudam só as 3 correções de texto e, se D2 for aprovada, os IDs, que voltam a `EDU`/`TRAB`.
- Fichas únicas novas por UF: DF 13, RO 11, SE 11, RR 10, MS 9, AC 7, TO 7, AP 6, PI 5.

## Abordagem

### Repo Drive (ETL)

- [ ] 0. Rodar `git pull` (fast-forward de `5b20014`). O `ficha.njk` está "modificado" só por timestamp, sem mudança de conteúdo.
- [ ] 1. Atualizar `data/raw/`:
  - Copiar a 3ª onda como `Fichas das Políticas - 3ª onda.xlsx`.
  - Copiar a 2ª onda revisada como `Fichas das Políticas - 2ª onda (rev. 2026-10).xlsx`, mantendo o arquivo original (R7: sem sobrescrita).
- [ ] 2. Escrever o teste `tests/toy_onda3.py` **antes** de editar o código. Ele verifica:
  - que a variante de cabeçalho é mapeada;
  - que `ABA_UF_ONDA3` casa com as abas reais;
  - que cada variante nova normaliza para um valor canônico;
  - que `TIPO_TO_EIXO` cobre todos os valores canônicos de `tipo_politica`, o que pega o bug do `OUTR`.
- [ ] 3. Editar `scripts/etl/load_planilha.py`:
  - apontar `RAW_XLSX_ONDA2` para a planilha revisada;
  - criar `RAW_XLSX_ONDA3` e `ABA_UF_ONDA3` e incluir a 3ª onda em `SOURCES`;
  - acrescentar 1 entrada ao `HEADER_MAP` e 5 ao `GHOST_HEADERS`;
  - atualizar a docstring.
- [ ] 4. Acrescentar 20 variantes a `.claude/context/vocabulario-canonico.json` (tabela abaixo).
- [ ] 5. Em `scripts/etl/build_ids.py`, trocar as chaves de `TIPO_TO_EIXO` pelos nomes novos. Vai num commit separado (D2).
- [ ] 6. Atualizar 3 asserções desatualizadas em `tests/integration_etl_completo.py`: total, UFs e nomes de tipo.
- [ ] 7. Rodar `just etl`, que gera `policies-onda-1-2026-10-04.json` e `latest.json`. Depois rodar o validate (precisa dar 0 erros) e o pytest.
- [ ] 8. Atualizar o histórico em `scripts/etl/README.md` e o status no `CLAUDE.md`.
- [ ] 9. Fazer os commits (dados+ETL; fix de IDs) e o push.

### Repo do site (`C:/Users/antro/dev/catalogo-politicas`)

- [ ] 10. Rodar `git pull` para receber o `latest.json`.
- [ ] 11. Corrigir os textos de cobertura, que já estão errados e ficariam ainda mais:
  - `sobre/cobertura.md` diz "ainda não inclui DF, AC, AP…";
  - dizem "9 UFs": `buscar.njk:23`, `index.njk:224`, `mapa.njk:4`, `sobre/comece-por-aqui.md:89`, `sobre/index.md:84` e `sobre/transparencia.md:52`.
- [ ] 12. Fazer o build local e validar com puppeteer: home, `/uf/df/`, `/uf/ms/`, `/mapa/` (D3, 27 UFs coloridas), `/tipo/educacional/`, `/buscar/` e uma ficha nova.
- [ ] 13. Fazer commit e push para disparar o deploy. Conferir o CI e o site no ar.

## Variantes de vocabulário (passo 4)

| Campo | Valor na planilha | → Canônico |
|---|---|---|
| situacao_atual | Ativa / em execução conforme UF (2×) | Ativa / em execução |
| situacao_atual | Ativa / em desenvolvimento | Ativa / em execução |
| situacao_atual | Ativa / em execução ou com implementação vinculada à rede | Ativa / em execução |
| situacao_atual | Situação variável por modalidade (DF ProJovem) | Sem informação |
| situacao_atual | Sem informação / indeterminada (Não dá para afirmar…) | Sem informação |
| tipo_politica | Misto (DF ProJovem Urbano e Campo) | **D1** — sugestão: Proteção social com impacto educacional (igual ao ProJovem federal) |
| modalidade_oferta | Misto (combina múltiplos tipos…) | Mista |
| modalidade_oferta | Itinerante (equipes/unidades móveis…) | Presencial |
| abrangencia_territorial | Distrital (10×, DF) | Estadual (a definição é "cobertura em uma UF") |
| abrangencia_territorial | Estadual, com … / Estadual/distrital, com … (9 valores) | Estadual |
| abrangencia_territorial | Nacional, com … (2 valores) | Nacional |

## Arquivos que NÃO serão tocados

- `normalize.py`, `dedupe.py`, `build_json.py`, `validate.py`, `policies-schema.json`
- O banner do Encontro, o grafo e as URLs da Rede EJA, que são assuntos separados
- Os 160 valores livres não canônicos em campos sem faceta (arranjo, tipo de oferta, esferas). Eles aparecem como texto na ficha e entram numa lista para a equipe de pesquisa.
- A captura de snapshots dos links novos (follow-up opcional) e a flag `coberta` em `ufs.js`, que não é usada

## Riscos e mitigações

- **IDs voltam a `EDU`/`TRAB` (D2).** Isso afeta 637 IDs, que são públicos só em meta tags, JSON-LD e citações. Eles voltam aos valores de antes de 14/mai, e nenhuma URL muda.
- **Mapear a abrangência descritiva perde o detalhe.** Exemplo: "via campi do IFRR" vira só "Estadual". O detalhe costuma estar no Resumo e na Apresentação.
- **Git dentro do Drive.** O pull é fast-forward e não pode ter edição concorrente.

## Decisões (aprovadas pela usuária em 2026-10-04)

- **D1** "Misto" → Proteção social com impacto educacional (segue a sugestão)
- **D2** corrigir bug dos IDs OUTR → sim
- **D3** adotar 2ª onda revisada → sim
- **D4** commit + push + publicar → sim
- **Distrital**: manter o NOME "Distrital", mas tratar como Estadual em buscas/listas, sem categoria separada.
  Implementação: no dado, `Distrital` → `Estadual` (variante de vocabulário); na ficha (`ficha.njk`),
  exibir "Distrital" quando `uf == DF` e abrangência == Estadual. Agrupamentos (/abrangencia/estadual/,
  agregados, explorar) passam a incluir DF automaticamente.
- **Itinerante** → Presencial, confirmado pela ficha (Qualifica Piauí: carretas-escola + cursos presenciais em espaços municipais)
- **Situação variável por modalidade** (DF ProJovem Urbano e Campo): a usuária não tinha contexto. A ficha descreve
  experiência passada em Planaltina/DF ("referência histórica") e a fonte é notícia do relançamento federal de 2024;
  não há evidência de situação atual no DF → **Sem informação** (não afirma o que a fonte não afirma). Sinalizar à equipe.

## Decisões pendentes (originais)

- **D1**: classificação do valor "Misto" (DF ProJovem Urbano e Campo)
- **D2**: corrigir o bug dos IDs `OUTR` agora (recomendado)
- **D3**: adotar a 2ª onda revisada (recomendado)
- **D4**: publicar no final (commit + push + deploy) (recomendado)

## Verificação pós-implementação

- [ ] `toy_onda3` e as suítes toy e integração passam
- [ ] `validation_report.json` com 0 erros
- [ ] Puppeteer local: console limpo, contagens novas, mapa com 27 UFs
- [ ] CI de deploy verde e site no ar com 366 verbetes
- [ ] MEMORY.md atualizado
