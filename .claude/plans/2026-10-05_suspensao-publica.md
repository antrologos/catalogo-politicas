# Suspensão temporária do acesso público

Status: concluído e publicado em 05/10/2026; suspensão conferida no endereço público.

Em 05/10/2026, o usuário cancelou expressamente a reversão para a versão antiga. Autorizou preservar integralmente a versão revisada e substituir o site público por página temporária de atualização até uma apresentação combinada. Em seguida autorizou fazê-lo imediatamente, sem consultar terceiros. Nenhuma mensagem a terceiros foi enviada.

Preservação: branch versao-revisada-2026-10-05 no commit c984d57. As alterações de manutenção ficam inicialmente na branch preparar-suspensao-publica, sem publicação automática.

Implementação: HTML neutro independente em site/atualizacao/, builder com allowlist em saída isolada site/_atualizacao/, modo de publicação versionado site/publicacao.json. O workflow publica somente índice, 404 e logo quando em atualização. Fonte, dados e build completo do catálogo continuam intactos. Novos pushes mantêm a suspensão enquanto o modo estiver ativado.

Verificar: somente arquivos permitidos no artefato, index e 404 iguais, ausência de conteúdo/índice de busca, visual desktop/celular e rotas antigas servindo o aviso com404. Nenhum relatório externo é alterado. Nada de novos serviços, mensagens ou links públicos para uma prévia sem instrução específica.

Retomada: alterar modo para catalogo e publicar após autorização. A cadeia normal de schema/testes/acessibilidade/desempenho permanece ativa para a retomada.

A branch de preservação é local. O envio de uma branch remota adicional foi bloqueado pela revisão automática por risco de exposição; não foi repetido. A versão c984d57 já existente no histórico permanece intacta. A suspensão altera somente o artefato publicado e sua configuração, sem reversão de conteúdo.

## Resultado

- Commit de implementação: af4c179. Publicação aprovada na execução https://github.com/antrologos/catalogo-politicas/actions/runs/37313650078.
- Artefato publicado contém somente index.html, 404.html e assets/rede-eja-logo.svg. A cadeia completa do catálogo permanece preservada e volta a executar apenas no modo catalogo.
- Validação local em 1440/390/320 px, sem overflow ou erros, logo carregado e conteúdo disponível sem JavaScript. Rotas antigas de UF, busca, ficha, JSON e Pagefind exibem o aviso com404.
- Conferência pública às 13:03:44 UTC: raiz200 e logo200; seis rotas antigas404. Os sete HTML recebidos são idênticos ao aviso local porSHA256, e o logo também confere. Requisições novas sem conteúdo anterior em cache. Evidência privada em qa-suspensao/resultado-publico.json.
- git diff c984d57 -- data site/src sem diferenças: nenhum conteúdo revisado do catálogo foi revertido ou apagado.

## Retomada (09/10/2026)

- O usuário pediu para ativar a versão revisada. `site/publicacao.json` voltou a `catalogo`; nenhuma mudança de conteúdo (`git diff c984d57 HEAD -- data site/src` vazio). Testes Node locais: 47/47.
- A publicação passa pela cadeia completa do CI (schema, testes, build, pa11y, Lighthouse, deploy).

## Nova suspensão (09/10/2026)

- No mesmo dia da retomada, o usuário pediu para retirar o site do ar e voltar à página temporária. `site/publicacao.json` voltou a `atualizacao`; página, builder e workflow são os mesmos de af4c179 (sem diferenças). O builder validou localmente o artefato restrito (index.html, 404.html, assets/rede-eja-logo.svg). Conteúdo do catálogo intacto.
