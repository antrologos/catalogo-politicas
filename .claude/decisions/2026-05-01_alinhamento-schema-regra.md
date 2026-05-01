---
status: aceito
data: 2026-05-01
contexto: "Schema policies-schema.json (escrito pelo Agent 4.3 do Bloco A) e regra dados-politicas.md (escrita pelo Agent 4.1) divergiram em nomes de campo e tipos. Detectado no início do Bloco C, antes do pipeline ETL ser implementado."
---

# Alinhamento `dados-politicas.md` ↔ `policies-schema.json`

## Contexto

Durante o início do Bloco C (exploração rica dos dados), ao investigar o pipeline ETL que vai gerar `data/derived/policies-onda-1-*.json`, ficou evidente que o schema JSON (`.claude/context/policies-schema.json` v0.1) e a regra (`.claude/rules/dados-politicas.md` v1.0) usavam **nomes de campo diferentes** para a mesma coisa, e em alguns casos **tipos diferentes**.

Como o hook `validate_json_schema.py` (PostToolUse) valida derivados contra o schema, o pipeline ETL precisa produzir JSON conforme o schema — não conforme a regra. Continuar com a divergência geraria pipeline quebrado e regra inútil.

## Alternativas consideradas

1. **Alinhar a regra ao schema** ✅ ESCOLHIDO
   - Pro: schema é o contrato concreto validado pelo hook; mais conservador e auditável
   - Pro: schema tem mais campos (ex.: `redirect_from`, `licenca_inferida`, `superseded_by_id`) que a regra omitia
   - Con: alguns nomes da regra eram mais semânticos (`nome_programa` mais específico que `nome`)

2. **Alinhar o schema à regra**
   - Pro: nomes mais semânticos, separação `duvidas_marcador`/`duvidas_revisor` melhor
   - Con: alterar schema requer atualizar hook + reprocessar derivados (ainda não há nenhum); risco de cascata
   - Con: schema teria mais campos do que aceita validar bem agora

3. **Compromisso híbrido**
   - Renomear alguns campos de cada lado
   - Con: complexidade desnecessária; nenhuma versão fica clara

4. **Adiar e seguir com schema atual**
   - Pro: pipeline pode rodar
   - Con: deixa regra desalinhada e gera dívida técnica imediata

## Decisão

**Alinhar a regra ao schema (alternativa 1).** Schema mantém-se intocado; regra `dados-politicas.md` foi reescrita em vários pontos para usar exatamente os nomes de campo do schema. Bumps: regra `1.0 → 1.1`.

## Renomeações aplicadas (regra → schema)

| Antes (regra v1.0) | Depois (regra v1.1 = schema v0.1) |
|---|---|
| `id` | `id_interno` |
| `nome_programa` | `nome` |
| `categorias` | `categorias_temas` |
| `duvidas` + `duvidas_revisao_humana` | `duvidas_revisor` (campo único) |
| `arranjo_logistico_territorial` | `arranjo_logistico` |
| `uf_replicada` | `uf` |
| `orgao_responsavel` (singular) + `orgao_responsavel_detalhe` | `orgaos_responsaveis` (array) |
| `base_legal` (array de objetos `{tipo, numero, ano, url}`) | `base_legal` (string concatenada) |
| `publico_alvo` (array controlado) | `publico_alvo` (texto livre) |
| `carga_horaria` (number) + `unidade_medida` | `carga_horaria` (string) + `unidade_medida` (string nullable) |
| `succeeds: <id>` | `supersedes_id: <id_interno>` |

## Justificativa

Alinhar a regra ao schema tem ROI imediato: o pipeline pode começar a rodar AGORA produzindo JSON válido contra o hook. Schema ficou estável e bem documentado; alterá-lo agora introduziria risco maior do que perder pequena granularidade semântica.

## Trade-offs

- **Perda de granularidade semântica**: `duvidas_marcador` e `duvidas_revisor` colapsam em um só campo (`duvidas_revisor`); `base_legal` perde estrutura de array de normas.
- **Mitigação**: registradas como **"Evoluções planejadas"** na seção homônima de `dados-politicas.md`. Promoção para schema v0.2 requerirá ADR próprio.
- **Risco de churn**: pipeline já espera nomes do schema; futura promoção exigirá migração + bump de `schema_version`.

## Próximos passos

1. ✅ Editar `.claude/rules/dados-politicas.md` com nomes do schema (FEITO 2026-05-01)
2. ✅ Adicionar seção "Evoluções planejadas" listando campos planejados para v0.2 (FEITO)
3. Implementar pipeline ETL conforme nomes do schema (Bloco C.1.a–C.1.g)
4. Quando promover schema v0.2 (futuro): ADR próprio + bump de `schema_version` em todo JSON gerado + atualizar regra novamente

## Relacionado

- `.claude/rules/dados-politicas.md` v1.1
- `.claude/context/policies-schema.json` v0.1
- `.claude/plans/2026-05-01_bloco-c-exploracao-dados.md` (sub-bloco C.0)
- `.claude/decisions/2026-05-01_estrutura-completa-bloco-a.md` (decisão original do Bloco A)