# Regra: Mudanças Mínimas e Cirúrgicas

**Status:** OBRIGATÓRIA
**Estabelecida:** 2026-04-15
**Escopo:** Todo o projeto mensalizacao_pnad (pacote, dashboard, papers, scripts)

## Princípio

Toda alteração no código deve ser **mínima, cirúrgica e planejada**.
Nunca modificar mais do que o estritamente necessário para o objetivo
imediato. Não "aproveitar" para fazer correções ou melhorias em áreas
não solicitadas.

## Antes de editar qualquer arquivo

1. **Investigar**: ler o código existente, entender o fluxo, mapear
   dependências
2. **Planejar**: descrever em texto as mudanças ANTES de fazer qualquer
   edit — quais linhas serão alteradas e POR QUÊ
3. **Verificar dependências**: toda função alterada → quem a chama?
   toda coluna/variável adicionada → quem a consome?
4. **Medir impacto**: quantos testes são afetados? A mudança quebra
   exemplos, vignettes, ou o dashboard?

## Regras de edição

- **Uma mudança por vez**: não misturar fix de bug com feature nova
- **Sem refactor oportunista**: se não foi pedido, não refatorar
- **Sem "melhorias" cosméticas**: não renomear variáveis, adicionar
  comentários, docstrings ou reorganizar código que não faz parte da
  tarefa
- **Sem editar funções protegidas** sem plano aprovado pelo usuário
  (ver tabela abaixo)
- **Testar ANTES de editar o arquivo real**: criar unit test que valide
  a mudança isoladamente (ver `test-first-protocol.md`)

## Ordem obrigatória de implementação

```
1. INVESTIGAR o problema (ler código, entender dependências)
2. PLANEJAR as mudanças mínimas (texto descritivo)
3. CRIAR unit test que valide a mudança
4. RODAR o test (deve falhar antes da mudança, passar depois)
5. FAZER a edição mínima no arquivo real
6. RODAR devtools::test() nos testes afetados
7. RODAR devtools::check() para garantir zero ERRORs/WARNINGs
8. COMMITAR (sem menção a AI)
```

## Funções protegidas

As seguintes funções NÃO devem ser alteradas sem plano aprovado pelo
usuário — afetam múltiplos componentes do projeto:

| Função | Arquivo | Impacto |
|--------|---------|---------|
| `pnadc_identify_periods()` | `pnadc-identify-periods.R` | Crosswalk inteiro, todos os testes de período |
| `pnadc_apply_periods()` | `pnadc-apply-periods.R` | Calibração de pesos, invariante de calibração |
| `pnadc_experimental_periods()` | `pnadc-experimental-periods.R` | Estratégias experimentais |
| `.process_sidra_response()` | `fetch-sidra-series.R` | Processamento de todas as 86+ séries SIDRA |
| `mensalize_sidra_series()` | `mensalize-sidra-series.R` | Toda a mensalização, y0, séries derivadas |
| `compute_series_starting_points()` | `mensalize-sidra-series.R` | Pontos iniciais de todas as séries |
| Tabela de metadados SIDRA | `sidra-series-metadata.R` | 86+ séries, API paths, categorias |
| `validate_pnadc()` | `utils-validation.R` | Validação de input de todo o pipeline |
| Funções de data `.ibge_*` | `utils-dates.R` | Lookup tables de data IBGE |
| `helper-test-data.R` | `tests/testthat/` | Todos os 17 arquivos de teste |

## O que fazer quando um teste falha

1. **NÃO** editar a função protegida para "resolver" rapidamente
2. Investigar: o teste está errado ou a função tem um bug real?
3. Se for bug real: planejar o fix separadamente, com evidência empírica
4. Se for limitação conhecida: contornar no código específico, não na
   função protegida
5. Seguir o loop de investigação (ver `test-first-protocol.md`)

## Anti-padrões proibidos

- Editar 3+ arquivos R em uma única mudança sem plano aprovado
- Alterar `.process_sidra_response()` para resolver problema de uma série
- Modificar `helper-test-data.R` E funções de produção ao mesmo tempo
- Rodar `devtools::check()` sem saber quais testes serão afetados
- Fazer "fix" iterativo cego: editar → testar → falha → editar → testar
  sem entender a causa raiz (sinal de que faltou investigação)
- Adicionar dependências ao DESCRIPTION sem necessidade comprovada
- Alterar a DESCRIPTION (versão, imports) junto com mudanças de código
- Modificar vignettes E código R ao mesmo tempo

## Escopo por sub-projeto

| Sub-projeto | Diretório | Cuidado especial |
|-------------|-----------|------------------|
| R Package | `PNADCperiods/` | CRAN compliance, invariante de calibração |
| Dashboard | `PNADCperiods-dashboard/` | Unidades (mil → milhões), i18n |
| Papers | `papers/` | Figuras de dados reais, NUNCA simulados |
| Scripts | `code/` | Outputs em `output/`, dados em `data/processed/` |

## Checklist antes de qualquer commit

- [ ] Mudança é mínima e focada em UM objetivo
- [ ] Nenhuma função protegida foi alterada sem plano aprovado
- [ ] Unit test existe e passa
- [ ] `devtools::test()` passa nos testes afetados
- [ ] `devtools::check()` sem ERRORs nem WARNINGs
- [ ] Sem menção a AI/Claude no commit, código ou docs
- [ ] Exemplos `@examples` ainda funcionam (se alterados)