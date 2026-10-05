# Curadoria documental

Entrada adicional do ETL, implementada em 05/10/2026 para corrigir referências e inconsistências sem modificar as planilhas originais. A decisão está em `.claude/decisions/2026-10-05_curadoria-documentada.md`.

## Arquivos

- `correcoes-*.json`: manifestos efetivamente aplicados pelo pipeline, em ordem de nome/data.
- `novas-*.json`: inclusões documentais com chave estável, referências públicas e identidade no registro persistente; não geram réplicas estaduais automaticamente.
- `propostas-*.json`: registros de pesquisa e valores publicados antes da integração; preservados para auditoria, não aplicados diretamente.
- `../auditoria/`: evidências de acesso, reconciliação de metadados e diferenças do produto gerado.

## Contrato v1

Cada entrada contém ID estável, mudanças por campo (`anterior` e `novo`), justificativa, referências com título/URL/data real de consulta e data da verificação. Identidade (ID/slug/UF) é protegida; correções federais propagam somente os campos explícitos às réplicas vinculadas. A aplicação falha se um valor anterior divergir, exceto quando o valor já é igual ao novo.

O antecedente é confrontado após o saneamento dos metadados de fonte do pipeline. As diferenças em atribuição/licença em relação ao que estava publicado estão documentadas em `../auditoria/ajustes-metadados-curadoria-2026-10-05.json`.

Datas de consulta da pesquisa não geram snapshots nem substituem data de captura. Referência acessível não comprova vigência, implementação ou resultados. `revisado_por: null` evita atribuir estas correções automatizadas à revisão humana original.

## Nível e ausência de evidência

A correção pode declarar nivel como revisao_documental_limitada ou leitura_editorial_evidencia_insuficiente. Referências vazias somente são aceitas no nível editorial explícito, com justificativa e nota específica em duvidas_revisor. A data da revisão editorial não significa consulta externa.

Fonte principal incompatível pode ser retirada com fonte_url:null; proveniência, captura e citação não preservam dados residuais dessa URL. Novas experiências continuam exigindo fonte pública. O site distingue fonte herdada das URLs efetivamente consultadas na revisão mais recente.

## Reproduzir

Executar `just etl` (planilhas → normalização → deduplicação → IDs → JSON com curadoria → validação estrita). Para revisão, executar o pipeline em área isolada dentro deste projeto em G e comparar IDs/slugs, valores e hashes dos originais antes da promoção. Os arquivos de pesquisa datados anteriores devem ser preservados.

A rodada dos relatórios está documentada em [RELATORIO_CURADORIA_ACERVO_2026-10-05.md](../../docs/RELATORIO_CURADORIA_ACERVO_2026-10-05.md).
