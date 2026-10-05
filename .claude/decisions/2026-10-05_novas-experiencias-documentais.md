# Novas experiências documentais com identidade persistente

Data: 2026-10-05. Extensão autorizada do plano de curadoria dos relatórios.

As planilhas de origem permanecem imutáveis. Manifestos públicos data/curadoria/novas-*.json, versão1, acrescentam experiencias com chave_fonte ASCII estável, campos canônicos, justificativa, referencias públicas (url/titulo/consultado_em) e verificado_em. Os manuscritos e os localizadores privados ficam na área ignorada do projeto.

A entrada ocorre após dedupe e antes da atribuição de IDs. O registro_fichas.csv existente guarda a chave curadoria|chave_fonte, ID e slug. A chave não depende de posição ou título; alterações de nome preservam ID/slug; UF não pode mudar sob a mesma chave. Novas entradas são ordenadas pela chave antes da primeira atribuição. Chaves duplicadas, identidade nominal já existente, dados derivados e vocabulário não canônico interrompem a operação. Remoção não libera ID/slug para reutilização.

Novas fichas BR não são replicadas automaticamente: o estágio que replica federais já terminou. Abrangência normativa não demonstra execução estadual. Campos canônicos são aplicados antes da proveniência, hashes, datas e citações; correções declarativas posteriores continuam possíveis. Datas de consulta de referências não preenchem fonte_data_acesso, que depende de captura válida. Revisão automática não atribui autoria humana.

O site resolve as referências das novas entradas pelo mesmo CSV de registro, sem introduzir outro registro de identidade. O JSON anterior da primeira onda deve ser preservado: build_json.py admite --output para caminho distinto dentro do projeto, mantendo a atualização de latest.json.

Verificação: testes isolados de reordenação/renomeação/reinserção, colisões, schema/vocabulário, limites de proveniência, ausência de réplica automática e resolução das referências pelo registro. Testes de integração usam saída privada distinta e comparam contagens base mais novas entradas, além da última correção de cada campo.
