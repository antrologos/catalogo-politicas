# Curadoria documentada sem alterar as planilhas originais

Data: 05/10/2026. Status: adotada para cumprir o pedido explícito de resolver referências externas e conteúdo.

## Problema

As planilhas contêm links ausentes/incorretos e textos copiados entre territórios. A regra histórica R6 de protecao-fontes previa corrigir exclusivamente por edição humana da planilha; o usuário solicita resolução direta e não dispõe de tempo para revisão em lotes.

## Decisão

Criar data/curadoria/correcoes-2026-10-05.json como entrada adicional versionada do ETL. Cada correção identifica ID, campo, valor anterior esperado, novo valor, justificativa, referências e data da consulta. Divergências e campos de identidade são bloqueados. Aplicação após IDs e antes de hashes/datas/citações; somente campos explícitos propagam às réplicas por federal_source_id.

Esta é uma exceção delimitada ao procedimento antigo de edição da planilha, sustentada pela autorização atual. Preserva os objetivos de R1/R5/R6: fontes originais e snapshots imutáveis, geração por código e rastreabilidade. Não altera schema ou vocabulário. Não se edita o JSON canônico manualmente.

## Limites e validação

Consulta web, captura e confirmação de operação são evidências distintas. A data da curadoria não inventa captura nem vigência. Captura rejeitada não é promovida; a revisão automatizada não é atribuída ao revisor humano original. O site expõe referências e limites da revisão.

Testes de aplicação/conflito/identidade/réplica/proveniência, schema estrito, comparação de IDs/slugs e fontes originais, regeneração determinística e testes/build do site precedem a promoção. Relatório informa resolvidos e pendências efetivas.
