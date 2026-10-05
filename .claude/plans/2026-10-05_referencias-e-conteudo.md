# Referências e conteúdo — 05/10/2026

Pedido: resolver as frentes de referências externas e conteúdo do catálogo publicado.

1. Auditar referências das 366 fichas únicas aproveitando a rodada HTTP de 04/10. Pesquisar substitutos para fontes ausentes, quebradas ou inadequadas e corrigir inconsistências verificáveis. Acesso HTTP não comprova correspondência nem operação atual.
2. Registrar correções declarativas por ID com valor anterior, evidências, data e justificativa. Preservar planilhas, IDs, slugs e vocabulário. Documentar a curadoria em ADR.
3. Aplicar curadoria no ETL antes de hashes, datas e citações. Propagar somente campos corrigidos às réplicas federais e não atribuir a revisão automática à pesquisadora original.
4. Impedir captura rejeitada de virar evidência e corrigir atribuições territoriais indevidas. Preservar snapshots históricos.
5. Mostrar referências adicionais e limites específicos na ficha, mantendo Identificação, Finalidade, Território e Referências.
6. Regenerar em área isolada; validar schema, vocabulário, identidade, determinismo, testes e build. Promover apenas produto validado.
7. Documentar resolvidos e limites e publicar pelo fluxo de commit/push/deploy já autorizado.

O produto identifica experiências e referências para a Rede EJA, com defesa da educação pública e presencial. Não inventar vigência, números, orçamento ou resultados. Não equivale a revisão humana exaustiva de todas as políticas. A autorização atual é para implementar; não será exigida revisão do usuário em lotes.

## Fechamento

Concluído em 05/10/2026: 47 fichas únicas corrigidas por curadoria declarativa, 44 URLs principais substituídas, 11 ausências de referência resolvidas no conjunto publicado, auditoria de 385 URLs (363 atuais). Validação: 144 testes Python, 34 testes do site, geração determinística, dados e identidades preservados. Publicação do commit c6d7422796436af5e2f4b4405fbd45f860009bca confirmada pelos workflows 37265033098 e 37265032989 e por inspeção direta de quatro fichas em produção. Relatório completo em docs/RELATORIO_REFERENCIAS_E_CONTEUDO_2026-10-05.md; incertezas documentais e falhas externas de acesso permanecem explicitadas, sem inferir vigência.
