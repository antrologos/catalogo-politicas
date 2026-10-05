# Plano de curadoria do acervo a partir dos relatórios da Rede EJA

**Status:** APROVADO para execução pela solicitação do usuário em 05/10/2026: "precisamos fazer uma curadoria do restante do acervo. Faça isso". O usuário indicou sete documentos e determinou que todas as alterações controladas do Amazonas sejam aceitas para a leitura.

## Objetivo

Ler as seções de políticas dos sete relatórios, confrontá-las com o catálogo e executar a curadoria do acervo ainda não revisto, incorporando experiências ausentes e correções comprovadas. Preservar a finalidade de identificação, finalidade, território e referências para profissionais da Rede EJA, sem transformar norma, anúncio ou meta em afirmação de oferta atual.

## Sequência

1. Localizar os documentos; registrar hashes e versões. Ler as seções completas relevantes, suas tabelas, notas e referências. Projetar a leitura final do Amazonas em memória/extração interna, sem salvar alterações no DOCX; distinguir comentários editoriais.
2. Produzir matriz de correspondência entre experiências dos relatórios e fichas existentes: correspondência confirmada, candidata a nova ficha, divergência ou menção que não configura experiência individual. Registrar localizadores verificáveis no documento.
3. Conferir afirmações e referências públicas, priorizando fontes primárias documentais e distinguindo período, abrangência, objetivo, execução e resultados. Os relatórios em elaboração são insumo de pesquisa, não comprovação automática de atividade.
4. Cobrir as 319 fichas únicas fora da rodada anterior com registro individual de resultado; reapreciar fichas já corrigidas quando os relatórios acrescentarem evidência. Não declarar revisão substantiva integral por apenas executar filtros automáticos ou verificar HTTP.
5. Implementar correções por novos manifestos versionados, preservando os 47 registros anteriores. Se necessário, acrescentar uma entrada reprodutível de novas experiências ao pipeline com IDs e slugs persistentes, sem editar planilhas originais ou JSON canônico à mão. Documentar a extensão antes de implementá-la.
6. Gerar em cópia isolada, validar schema/vocabulário/identidades/replicação e determinismo. Para adições, ajustar testes de contagem mantendo invariantes e verificando preservação integral das identidades anteriores. Conferir busca, referências e apresentação.
7. Entregar relatório de cobertura e mudanças, com ressalvas e itens sem confirmação, atualizar a documentação de estado, fazer commit/push/publicação e confirmar produção conforme autorização persistente da sessão.

## Proteção de fontes e publicação

- Arquivos originais em Dropbox/Downloads e planilhas em data/raw são preservados; hashes conferidos ao final.
- Extrações integrais, comentários, alterações controladas e cópias dos relatórios em elaboração ficam exclusivamente na área privada interna .claude/working/curadoria-relatorios-2026-10-05/; não entram no repositório público.
- O repositório recebe sínteses de curadoria, evidências públicas e histórico das alterações de fichas. Não publicar manuscritos privados nem apresentar revisão automatizada como validação humana.
- Acesso externo usa as regras de captura responsável existentes. Links e datas não são prova de vigência ou implementação.
- Prioridade normativa: educação pública e presencial; trabalho em sentido amplo, cuidados, direitos e compreensão crítica; flexibilidade examinada concretamente, sem equipará-la automaticamente a EaD.

## Arquivos previstos

- data/curadoria/correcoes-2026-10-05b-relatorios.json e eventual entrada de novas experiências.
- scripts/etl apenas se a adição de fichas exigir extensão, com testes correspondentes e decisão registrada.
- data/auditoria com evidências públicas e cobertura; data/derived gerados pelo pipeline, preservando o produto anterior datado com versão distinta.
- docs/RELATORIO_CURADORIA_ACERVO_2026-10-05.md; CLAUDE.md e documentação operacional conforme implementação final.

## Validação

- Hashes dos sete originais, planilhas e snapshots preservados.
- Aceitação das alterações do Amazonas conferida estruturalmente; limitações de renderização explicitadas se aplicáveis.
- Correspondências e novas fichas sem duplicações, IDs/slugs anteriores estáveis, vocabulário fechado e fontes rastreáveis.
- Testes pertinentes, geração determinística, validação integral, preview funcional e CI/publicação.

## Estado inicial

Ambos os clones em 082824b; catálogo publicado com 366 fichas únicas/1158 registros e 47 fichas revistas na rodada precedente. Amazonas localizado em Downloads. Os seis caminhos indicados em D:/Dropbox não foram encontrados inicialmente; busca por localização alternativa em andamento.

## Atualização de localização e limites

Os sete documentos foram encontrados e tiveram hashes registrados. O diretório correto é Projs_FRM. Toda escrita fica dentro deste projeto, conforme regra expressa do usuário; nenhum relatório externo é alterado. O manifesto adicional recebe sufixo b para ordenar depois do manifesto anterior. O produto derivado desta rodada usará nome datado distinto, sem sobrescrever o anterior.


## Execução consolidada

Sete relatórios lidos sem alteração (hashes iguais); 319 remanescentes cobertas, 321 intervenções e 22 inclusões. Manifestos e pipeline implementados; 175 testes Python aprovados; identidades anteriores e produto datado preservados. Resultado, limites e verificação do site no relatório de curadoria. Publicação será confirmada após CI.
