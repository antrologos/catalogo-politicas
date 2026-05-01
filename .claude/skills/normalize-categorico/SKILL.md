---
name: normalize-categorico
description: "Normaliza variantes ortográficas de campos categóricos para vocabulário canônico"
when_to_use: "Antes de agregar/comparar políticas; após extrair colunas categóricas da planilha; quando relatório/filtro mostra valores duplicados por drift gráfico"
argument-hint: "<campo> <valor_bruto> [--verbose]"
allowed-tools: "Read Grep Bash"
disable-model-invocation: false
effort: low
versao: 0.1
---

# Skill: normalize-categorico

Mapeia valores ortográficos variantes (gráficos, hífens, aspas, capitalização, acentos) para o vocabulário canônico em **7 campos categóricos críticos** da planilha-fonte `Fichas das Políticas - 1ª onda.xlsx`.

## Propósito e contexto

A planilha apresenta drift ortográfico severo (ver `CLAUDE.md`, armadilha #5):

- `Esfera de execução`: 31 valores únicos para um vocabulário oficial de ~20 — mistura de hífen `-` / en-dash `–`, aspas retas/curvas, dois-pontos duplos `::`, capitalização variável.
- `Arranjo logístico-territorial`: variantes com/sem aspas tipográficas.
- Ceará tem ainda 16 células com `Opção 2` (placeholder de dropdown quebrado).

**Sem normalização, qualquer agregação/filtro/comparação multiplica falsamente os valores únicos.** Esta skill é blocador para qualquer análise séria sobre os dados.

Os 7 campos cobertos são:

1. `Esfera de formulação`
2. `Esfera de execução`
3. `Tipo de oferta`
4. `Modalidade da oferta`
5. `Arranjo logístico-territorial`
6. `Abrangência territorial`
7. `Situação atual`

## Inputs

| Argumento | Tipo | Descrição |
|---|---|---|
| `<campo>` | string obrigatório | Um dos 7 nomes canônicos acima (case-insensitive aceito; será re-normalizado). |
| `<valor_bruto>` | string obrigatório | Valor bruto vindo da planilha (ex.: `"Municípios – com parcerias"`). |
| `--verbose` | flag opcional | Retorna também o mapeamento usado, confiança e método (lookup direto / edit distance / falha). |

## Outputs

Saída padrão (modo simples) — uma linha em stdout:

```
✓ normalizado: "Municipal - com parcerias"
```

Ou, em caso de valor desconhecido:

```
⚠ valor não reconhecido. Candidatos próximos: "Municipal - com parcerias", "Municipal", "Estadual com apoio municipal"
```

Modo `--verbose` — JSON em stdout:

```json
{
  "campo": "Esfera de execução",
  "input": "Municípios – com parcerias",
  "resultado": "Municipal - com parcerias",
  "metodo": "variante_lookup",
  "confianca": 1.0,
  "edit_distance": 0,
  "candidatos_proximos": []
}
```

Exit codes:
- `0` — normalização bem-sucedida (lookup direto OU edit distance ≤ 2)
- `1` — valor não reconhecível (edit distance > 2 ou campo inválido)
- `2` — vocabulário ausente/corrompido (problema de infraestrutura)

## Algoritmo (9 passos)

1. **Carregar vocabulário.** Ler `.claude/context/vocabulario-canonico.json` com estrutura:
   ```json
   {
     "Esfera de execução": {
       "canonical_values": ["Federal", "Estadual", "Municipal", ...],
       "variants": {
         "federal": "Federal",
         "fed.": "Federal",
         "municipios": "Municipal",
         "município": "Municipal",
         "municipal–com apoios": "Municipal - com parcerias"
       }
     }
   }
   ```
   Se arquivo ausente/corrompido, tentar fallback `.claude/cache/canonico_backup.json`. Se ambos falharem, exit 2 com instrução clara.

2. **Validar campo.** Conferir que `campo` (após normalização cosmética leve) está em chaves do JSON. Se não, exit 1 com lista dos 7 campos válidos.

3. **Recortar `variants` do campo.**

4. **Normalização cosmética uniforme** (aplicada antes do lookup):
   - `trim()` + colapsar múltiplos espaços (`\s{2,}` → ` `)
   - lowercase para chave de lookup
   - unificar hífens: `[–—‒−]` → `-`
   - unificar aspas: `[""''«»]` → `"`
   - remover dois-pontos duplos: `::` → `:`

5. **Lookup direto** em `variants[chave_normalizada]`.

6. **Se encontrado**, retornar o `canonical_value` correspondente. Confiança 1.0, método `variante_lookup`.

7. **Se não encontrado**, calcular edit distance (`difflib.get_close_matches`, n=3, cutoff=0.7) contra todas as chaves de `variants` E contra `canonical_values`:
   - Se melhor match tem distância ≤ 2: retornar canonical correspondente, confiança 0.7-0.9, método `edit_distance`.
   - Se 2 < distância ≤ 4: retornar lista de candidatos sem decidir, confiança 0, método `sugestao`.
   - Se sem match útil: exit 1 com mensagem `"valor não reconhecido"` + sugerir registrar em `decisions/novo-mapeamento.md`.

8. **Se `--verbose`**, devolver o JSON completo descrito em "Outputs".

9. **Logar auditoria.** Append linha JSONL em `data/logs/normalize-categorico_YYYY-MM-DD.jsonl`:
   ```json
   {"ts": "2026-05-01T14:30:00Z", "campo": "...", "input": "...", "output": "...", "metodo": "..."}
   ```

## Casos de erro

| Cenário | Comportamento | Exit code |
|---|---|---|
| Campo inválido | Mensagem com lista dos 7 campos válidos | 1 |
| Valor 100% desconhecido (edit dist > 4) | Mensagem `"valor não reconhecido"` + sugerir registrar em `decisions/novo-mapeamento.md` | 1 |
| `vocabulario-canonico.json` ausente | Tentar `.claude/cache/canonico_backup.json`. Se falhar, exit 2 com instrução de regerar via Bloco C | 2 |
| `vocabulario-canonico.json` corrompido (JSON inválido) | Idem fallback acima | 2 |
| Valor vazio / `None` | Mensagem `"valor vazio — verifique célula da planilha"` | 1 |
| Valor é literal `"Opção 2"` (placeholder Ceará) | Mensagem específica `"valor é placeholder de dropdown quebrado (Ceará); ficha precisa revisão manual"` | 1 |

## Dependências

Apenas Python stdlib — **sem instalações adicionais**:

- `json` (parse vocabulário)
- `pathlib` (navegação de paths Unicode/Windows-safe)
- `difflib` (`get_close_matches` para edit distance)
- `re` (normalização cosmética)
- `sys`, `argparse`

## Pré-requisitos

- Arquivo `.claude/context/vocabulario-canonico.json` existente. Sua estrutura é definida em `.claude/context/vocabulario-canonico.md` e o **conteúdo** será preenchido durante o Bloco C (exploração rica dos dados). Até lá, este SKILL pode ser testado contra um stub mínimo do vocabulário.
- Diretório `data/logs/` existente (criado pelo pipeline ou manualmente).

## Testes esperados (5 cenários)

1. **Mapeamento direto.** `normalize-categorico "Esfera de execução" "municipios"` → `"Municipal"`, exit 0.
2. **Variante ortográfica + en-dash.** `normalize-categorico "Esfera de execução" "Município – com parcerias"` → `"Municipal - com parcerias"`, exit 0, método `variante_lookup`.
3. **Sugestão por edit distance.** `normalize-categorico "Esfera de execução" "Municpiaios"` (typo) → sugestão `"Municipal"`, exit 0, método `edit_distance`, confiança ~0.8.
4. **Campo inválido.** `normalize-categorico "Campo Inexistente" "valor"` → mensagem listando 7 campos válidos, exit 1.
5. **Placeholder Ceará.** `normalize-categorico "Tipo de oferta" "Opção 2"` → mensagem dedicada de placeholder de dropdown quebrado, exit 1.

## Como testar manualmente

```bash
# Sucesso — lookup direto
python -m claude_skills.normalize_categorico "Esfera de execução" "federal"

# Sucesso — variante com en-dash
python -m claude_skills.normalize_categorico "Esfera de execução" "Município – com parcerias"

# Verbose — ver método e confiança
python -m claude_skills.normalize_categorico "Tipo de oferta" "Presencial" --verbose

# Falha esperada — valor desconhecido
python -m claude_skills.normalize_categorico "Esfera de execução" "Algo Totalmente Inventado"
echo "exit code: $?"   # 1
```

(Os módulos Python concretos serão criados pela Rodada que implementar o pipeline; este SKILL.md descreve a interface contratual.)

## Risco e mitigação

| Risco | Mitigação |
|---|---|
| **Vocabulário desatualizado** vs. nova onda de fichas → erros silenciosos por valores desconhecidos. | A skill `rodar-pipeline` deve reportar `valores_desconhecidos_por_campo` no `onda{N}_report.json` e exigir revisão humana antes de marcar onda como concluída. |
| **Falsos positivos no edit distance** (typo aproxima de outro valor canônico errado). | Cutoff 0.7 + max distância 2 minimiza isso; modo `--verbose` permite auditar; valor com confiança < 0.9 marcado em log para revisão amostrada. |
| **Cache desatualizado** (`canonico_backup.json` defasado) escondendo mudanças no canônico. | Cache regerado a cada execução bem-sucedida do pipeline; data de regeneração presente no JSON. |
| **Drift no próprio nome dos 7 campos** entre abas (ex.: `Link` vs. `Link oficial`). | Esta skill recebe **nome canônico do campo**; a tarefa de normalizar o cabeçalho é da etapa `load` do `rodar-pipeline`, não desta skill. |

## Referências

- `CLAUDE.md`, seção "Armadilhas conhecidas", item 5 (drift ortográfico).
- `.claude/working/R1-A1.3-lacunas.md`, lacuna #3.
- `.claude/working/R2-A2.3-skills-agents-hooks-RAW.md`, seção A.1.
- `.claude/context/vocabulario-canonico.md` (esquema do vocabulário; conteúdo a preencher no Bloco C).