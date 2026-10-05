# Reorganização editorial do catálogo — entrega local

Data: 4 de outubro de 2026.

**Status: concluída e validada localmente, sem commit, push ou publicação.**

Este registro orienta a continuidade pelo Claude. A rodada aplica as [diretrizes editoriais aprovadas](DIRETRIZES_E_PLANO_EDITORIAL_2026-10-04.md), aproveitando o acervo existente. O [plano técnico](../.claude/plans/2026-10-04_reorganizacao-editorial-leve.md) está concluído localmente.

## Resultado

- **Finalidade pública:** o catálogo apoia membros, coordenadores e profissionais da Rede EJA no fortalecimento da educação pública, presencial e de qualidade para jovens, adultos e idosos e no diálogo com os governos.
- **Fichas:** quatro seções visíveis, com navegação por âncoras: **Identificação, Finalidade, Território e Referências**. Finalidade reúne descrição, funcionamento e organização da oferta; Território apresenta vínculo territorial, abrangência e esfera de execução informados. Descrições complementares e citações ficam em blocos expansíveis.
- **Consulta:** home reduzida a apresentação e busca, síntese da cobertura e painel institucional. Navegação principal: **Início → Buscar → Explorar → Sobre**. Mapa, comparação e demais rotas continuam acessíveis. A busca mantém os filtros e o percurso até a ficha e suas referências.
- **Incertezas e fontes:** rótulos distinguem situação registrada de funcionamento confirmado, abrangência de atendimento efetivo e datas da fonte e do catálogo. Lacunas permanecem reconhecíveis. A ficha federal de EJA recebeu uma nota sobre a divergência entre o vínculo BR e a descrição referente a São Paulo; o registro original foi preservado. Placeholders de fonte não viram links oficiais.
- **Metadados:** identificador interno não é apresentado como DOI; uma referência HTML não é apresentada como PDF.

As páginas Sobre, Metodologia e Como consultar explicam a finalidade e a leitura das fichas. A orientação editorial defende a EJA pública presencial, preserva a responsabilidade estatal e não recomenda EaD para EJA. O uso digital admitido como complemento pontual no Ensino Médio não se estende à EJA Fundamental nem às pessoas idosas. Estão explicitados educação e trabalho em perspectiva crítica, trabalho remunerado e doméstico, cuidados e gênero sem reducionismo, flexibilidade sem equivalência automática a EaD e interlocução construtiva com governos, especialmente com a SECADI.

## Validação desta rodada

| Verificação | Resultado registrado |
|---|---|
| Testes do site | **14 testes passaram**. |
| Build e indexação | **428 arquivos gerados; Pagefind com 366 páginas e 4 filtros**. |
| Busca combinada | **EJA + filtro DF: 6 resultados, todos do DF**. |
| Metadados das fichas | **366 fichas verificadas, sem falhas**. |
| Links internos | **426 páginas verificadas, zero links internos quebrados**. |
| Navegação em navegador | **80 verificações em desktop e celular**. |
| Acessibilidade automatizada | **Zero violações axe nas regras WCAG 2 A/AA nas páginas testadas**. |

O build local foi concluído. O smoke final conferiu a home, a ficha de ProJovem DF com os quatro blocos e a busca EJA + DF, sem erros JavaScript. A verificação de links internos não certifica a disponibilidade das fontes externas. Os testes de acessibilidade cobrem somente as páginas e regras executadas; **não constituem auditoria completa nem substituem avaliação manual com leitor de tela**.

## Prévia e continuidade

Prévia local: **http://localhost:8774/catalogo-politicas/**.

A prévia usa uma **saída temporária isolada**: um servidor antigo sobrescreve `site/_site`, por isso esse diretório não deve ser usado para identificar a versão desta prévia. A saída temporária é artefato de validação; o código-fonte editado está nos dois clones:

- `G:/Drives compartilhados/FRM_CatalogoPoliticas`
- `C:/Users/antro/dev/catalogo-politicas`

A rodada não realizou commit, push ou publicação. Para continuar, partir do conteúdo local e deste registro, sem confundir o site publicado anteriormente com a versão em prévia.

## Limites preservados

Planilhas, dados canônicos, IDs, slugs, schema, vocabulário, ETL e fontes originais foram preservados. **Não houve novo levantamento substantivo, verificação atual de todas as ofertas nem avaliação de resultados.** A reorganização melhora a apresentação do material disponível e não confirma a correção substantiva de todas as fichas. Experiências históricas continuam no acervo; ausência de confirmação não foi convertida em encerramento.

Grafo oculto, identidade da Rede, créditos, endereço público e escopo institucional foram mantidos. A [lista de revisão da equipe de pesquisa](revisao-equipe-pesquisa-2026-10.md) continua como referência para questões substantivas, sem transformar toda a lista em condição desta entrega.
