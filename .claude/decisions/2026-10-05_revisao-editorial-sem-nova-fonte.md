# Curadoria editorial, ausência explícita de fonte e execução não governamental

Decisão aprovada na integração da revisão documental de 05/10/2026, sob o plano de referências e conteúdo e a regra de escrita exclusiva na raiz do projeto.

## Contrato

Correções documentais mantêm referências públicas obrigatórias. Excepcionalmente, `referencias: []` é aceita quando `nivel` é exatamente `leitura_editorial_evidencia_insuficiente`, com justificativa e novo texto não vazio em `duvidas_revisor`. Isso representa leitura e delimitação editorial, não consulta externa ou confirmação da política. O site diferencia esse nível e preserva a referência anterior quando pertinente.

`fonte_url` permanece obrigatória como chave, mas admite `null` para ausência explícita ou retirada de fonte incompatível, sem URL substituta inventada. Proveniência e citação não podem reutilizar captura antiga quando a fonte é retirada. Novas experiências ainda exigem uma URL pública comprovada.

O vocabulário de `esfera_execucao` recebe `Não governamental`: a EJA SESI/SENAI de Roraima estava incorretamente classificada como execução estadual. Não mudar a enumeração forçaria uma atribuição factual falsa. Órgãos nomeados mantêm a identificação precisa; não se presume financiamento exclusivamente privado.

## Implementação e verificação

Atualizar validador, schema de fonte, geração de proveniência/citação, vocabulário e documentação. Testes devem rejeitar referências vazias sem nível ou nota, admitir retirada explícita de fonte sem captura/citação residual e manter exigência de fonte pública nas novas entradas. Nenhuma planilha ou relatório original é alterado. Build, caches e publicação partem do próprio projeto G.

## Autoria da formulação não demonstrada

`esfera_formulacao` admite `Sem informação`. A Fábrica Esperança/PA tem execução não governamental documentada, mas a autoria da formulação não decorre da natureza jurídica ou do contrato público. Extensão coordenada e aprovada na integração.
