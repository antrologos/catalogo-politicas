# Plano: reorganização editorial leve do catálogo

**Status:** CONCLUÍDO LOCALMENTE — implementação e validação concluídas; sem commit, push ou publicação.
**Data:** 2026-10-04.

## Objetivo

Implementar a finalidade e os quatro blocos aprovados, aproveitando o acervo existente, sem exigir pesquisa ou revisão do usuário em lotes. Referência: docs/DIRETRIZES_E_PLANO_EDITORIAL_2026-10-04.md.

## Investigação inicial

No início da rodada, os dois clones estavam em 6e4b2a2. O clone local estava limpo; o Drive continha somente o documento editorial ainda não rastreado. A ficha anterior usava cinco abas, descrições repetidas e indicadores que podiam sugerir confirmação substantiva. A base não contém confirmação estruturada de vigência, atendimento territorial ou oferta atual. O site pode ser reorganizado sem alterações dos dados.

## Implementação e arquivos

1. Interface: index.njk, _data/site.js, components/footer.njk, sobre/index.md, sobre/metodologia.md e sobre/comece-por-aqui.md. Priorizar busca, uma síntese da cobertura, identidade e orientações públicas; preservar rotas secundárias.
2. Ficha: layouts/ficha.njk em quatro seções visíveis (Identificação, Finalidade, Território, Referências), com descrições complementares e citações em details. Preservar filtros Pagefind e links. Usar notasEditoriais.js para sinalizar a divergência comprovada entre BR e descrição de São Paulo na ficha federal de EJA.
3. Qualificações: components/tag-status.njk, ficha-meta.njk, _data/policies.js somente datas/apresentação, uf/pagina-uf.njk, layouts/dimensao.njk, situacao/pagina-situacao.njk, explorar.njk, comparacao.njk e assets/js/comparacao.js; rótulos de mapa se necessário. Preservar valores internos dos filtros. Distinguir situação registrada, referência territorial e datas do catálogo. Corrigir metadados que apresentem ID interno como DOI ou URL HTML como PDF.
4. Busca: buscar.njk, ajustes mínimos de linguagem e inicialização para tornar consulta e filtros acessíveis. Confirmar API local Pagefind antes de qualquer mudança funcional.
5. Registro: CLAUDE.md e documento editorial, com mudanças, validação e limitações.

## Preservação

Não alterar dados canônicos, planilhas, IDs, slugs, schema, vocabulário, ETL ou fontes. Não remover registros por inferência. Não excluir rotas. Não commitar nem publicar nesta rodada. Não pesquisar todas as políticas.

## Validação

Teste semântico de renderização da ficha antes/depois em site/tests/editorial.test.mjs. Testes existentes do site. Build completo com Eleventy, Tailwind e Pagefind. Puppeteer em desktop/celular, fontes ausentes, ficha federal/DF, quatro seções, busca/filtros, links e erros locais. Rever diff e integridade dos dados. Texto e cosmética não exigem testes que apenas repitam a redação.

Usar dependências já instaladas no clone local. Antes de copiar os arquivos da tarefa, verificar destinos contra HEAD para preservar trabalho concorrente; copiar somente arquivos específicos. Escrita da ferramenta apply_patch ficou pendente por vários minutos, sem erro, e foi encerrada. A implementação pode usar escrita local controlada com permissão da sandbox quando necessária.

## Riscos

Reorganizar não equivale a validar substantivamente as políticas. Ressalvas devem acompanhar situações, datas e territórios pertinentes. Preservar descoberta por busca, citação, identidade e URLs.

## Resultado

Implementação concluída nos dois clones, com fichas em quatro blocos, home e navegação simplificadas, diretrizes públicas, notas de incerteza, referências e busca ajustadas. Dados originais, IDs, slugs, schema, vocabulário e ETL foram preservados; não houve novo levantamento substantivo.

Validação: build local concluído; 14 testes passaram; consulta EJA + DF com 6 resultados; metadados das 366 fichas sem falhas; 426 páginas com zero links internos quebrados; 80 verificações de navegador em desktop/celular. Axe registrou zero violações WCAG 2 A/AA nas páginas testadas, sem constituir auditoria completa de acessibilidade.

Prévia em http://localhost:8774/catalogo-politicas/, usando saída temporária isolada porque o servidor antigo sobrescreve site/_site. Sem commit, push ou publicação.

Detalhes de entrega e continuidade: [docs/IMPLEMENTACAO_EDITORIAL_2026-10-04.md](../../docs/IMPLEMENTACAO_EDITORIAL_2026-10-04.md).
