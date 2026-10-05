# Suspensão temporária do acesso público

Status: em preparação; publicação imediata autorizada pelo usuário, sem depender de comunicação prévia.

Em 05/10/2026, o usuário cancelou expressamente a reversão para a versão antiga. Autorizou preservar integralmente a versão revisada e substituir o site público por página temporária de atualização até uma apresentação combinada. Em seguida autorizou fazê-lo imediatamente, sem consultar terceiros. Nenhuma mensagem a terceiros foi enviada.

Preservação: branch versao-revisada-2026-10-05 no commit c984d57. As alterações de manutenção ficam inicialmente na branch preparar-suspensao-publica, sem publicação automática.

Implementação: HTML neutro independente em site/atualizacao/, builder com allowlist em saída isolada site/_atualizacao/, modo de publicação versionado site/publicacao.json. O workflow publica somente índice, 404 e logo quando em atualização. Fonte, dados e build completo do catálogo continuam intactos. Novos pushes mantêm a suspensão enquanto o modo estiver ativado.

Verificar: somente arquivos permitidos no artefato, index e 404 iguais, ausência de conteúdo/índice de busca, visual desktop/celular e rotas antigas servindo o aviso com404. Nenhum relatório externo é alterado. Nada de novos serviços, mensagens ou links públicos para uma prévia sem instrução específica.

Retomada: alterar modo para catalogo e publicar após autorização. A cadeia normal de schema/testes/acessibilidade/desempenho permanece ativa para a retomada.

A branch de preservação é local. O envio de uma branch remota adicional foi bloqueado pela revisão automática por risco de exposição; não foi repetido. A versão c984d57 já existente no histórico permanece intacta. A suspensão altera somente o artefato publicado e sua configuração, sem reversão de conteúdo.
