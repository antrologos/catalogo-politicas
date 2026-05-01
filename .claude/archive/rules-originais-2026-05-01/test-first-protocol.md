# Regra: Protocolo Test-First com Loop de Investigação

**Status:** OBRIGATÓRIA
**Estabelecida:** 2026-04-15
**Escopo:** Todo o projeto mensalizacao_pnad

## Princípio

Toda mudança no código de produção deve ser **precedida por um teste**
em contexto restrito. Nunca implementar uma mudança diretamente no
código real como primeira ação. O fluxo correto é um **loop de
investigação** até certeza absoluta, seguido de implementação final.

## O Loop de Investigação (OBRIGATÓRIO)

```
┌─────────────────────────────────────────────────┐
│  1. INVESTIGAR                                  │
│     - Ler o código relevante                    │
│     - Entender o problema / requisito           │
│     - Mapear dependências (quem chama, quem     │
│       consome)                                  │
│     - Identificar funções afetadas              │
│                                                 │
│  2. PLANEJAR                                    │
│     - Descrever mudanças mínimas em TEXTO       │
│     - Listar QUAIS linhas mudam e POR QUÊ       │
│     - Identificar testes existentes afetados    │
│                                                 │
│  3. TESTAR (antes de implementar!)              │
│     - Criar unit test isolado que valide a      │
│       mudança pretendida                        │
│     - Usar helpers existentes (ver abaixo)      │
│     - O teste deve ser SIMPLES e FOCADO         │
│                                                 │
│  4. VERIFICAR                                   │
│     - Rodar APENAS o teste criado               │
│     - Se PASSAR: entender por quê (já funciona? │
│       teste mal escrito?)                       │
│     - Se FALHAR: a falha corresponde ao         │
│       problema investigado?                     │
│                                                 │
│  5. DECIDIR                                     │
│     ├─ Certeza absoluta? → Ir para IMPLEMENTAR  │
│     └─ Dúvida restante?  → Voltar ao passo 1   │
└─────────────────────────────────────────────────┘

    ▼ (só após certeza absoluta)

┌─────────────────────────────────────────────────┐
│  6. IMPLEMENTAR                                 │
│     - Fazer a edição mínima no código real      │
│     - Seguir o plano aprovado (sem desvios)     │
│                                                 │
│  7. VALIDAR                                     │
│     - Rodar o unit test criado (deve passar)    │
│     - Rodar devtools::test() completo           │
│     - Rodar devtools::check() --as-cran         │
│                                                 │
│  8. COMMITAR                                    │
│     - Só se TUDO passou                         │
│     - Sem menção a AI/Claude                    │
└─────────────────────────────────────────────────┘
```

## Critérios de "Certeza Absoluta" (passo 5)

Pode sair do loop APENAS quando TODOS forem verdadeiros:

- [ ] Entende a causa raiz do problema (não apenas o sintoma)
- [ ] Sabe exatamente quais linhas precisam mudar
- [ ] Sabe exatamente o que cada mudança faz
- [ ] O unit test cobre o caso principal E pelo menos um edge case
- [ ] A mudança não afeta funções protegidas (ou tem plano aprovado)
- [ ] Não há efeitos colaterais não mapeados

Se QUALQUER critério não for atendido, **voltar ao passo 1**.

## Hierarquia de testes

### Nível 1: Unit test isolado (OBRIGATÓRIO)

Teste focado em UMA função, usando `testthat`:

```r
test_that("nome descritivo da mudança", {
  # Arrange: criar dados de teste mínimos
  dt <- create_minimal_pnadc(n = 100)

  # Act: executar a função
  result <- funcao_alvo(dt)

  # Assert: verificar o resultado
  expect_true(...)
  expect_equal(...)
})
```

- Deve rodar em **< 30 segundos**
- Usar os helpers existentes em `tests/testthat/helper-test-data.R`
- NUNCA acessar API ou arquivos externos

### Nível 2: Teste de integração local (recomendado)

```r
devtools::test("PNADCperiods", filter = "nome_do_teste")
```

Rodar os testes existentes que cobrem a área afetada.

### Nível 3: R CMD check (obrigatório antes de commit)

```r
devtools::check("PNADCperiods", args = c("--as-cran", "--no-manual"))
```

Só rodar após os níveis 1 e 2 terem passado.

## Helpers disponíveis (helper-test-data.R)

NÃO reinventar — usar as funções que já existem:

| Helper | Uso |
|--------|-----|
| `create_realistic_pnadc()` | Dados PNADC sintéticos com campos consistentes |
| `create_minimal_pnadc()` | Dataset mínimo passando validação |
| `create_pnadc_for_calibration()` | Dados com colunas de calibração |
| `create_stacked_pnadc()` | Multi-trimestre para agregação cross-quarter |
| `create_monthly_targets()` | Alvos mensais SIDRA (mock) |
| `create_mock_rolling_quarters()` | Trimestres móveis sintéticos |
| `generate_yyyymm_seq()` | Sequência YYYYMM correta |

## Regras para Rscript no Windows

- **NUNCA usar `Rscript -e`** — causa segfault no Windows
- Sempre escrever código R em arquivo .R temporário, depois executar:
  ```bash
  cat > /tmp/test_script.R << 'EOF'
  # código R aqui
  EOF
  "C:\Program Files\R\R-4.5.0\bin\Rscript.exe" /tmp/test_script.R
  ```
- Se R der segfault: verificar processos R pendurados com `tasklist`
  e matar antes de re-tentar

## Quando um teste falha

1. **Ler a mensagem de erro COMPLETA** — não pular stacktrace
2. **Identificar a linha exata** do erro (número + arquivo)
3. **Criar um teste AINDA MENOR** que reproduz o erro isoladamente
4. **Investigar a causa raiz** — ler o código-fonte da função que falhou
5. **Corrigir no teste isolado primeiro** — só depois aplicar ao real
6. **NUNCA** editar uma função protegida como atalho para fazer o teste
   passar

## O que é proibido

- Implementar uma mudança sem unit test prévio
- Pular o loop de investigação ("já sei o que fazer")
- Editar código real antes de ter um teste que valide a intenção
- Fazer "fix" iterativo cego (editar → rodar → falha → editar → rodar)
  sem parar para investigar a causa raiz
- Rodar `devtools::check()` como substituto de unit test focado
- Commitar com testes falhando
- Ignorar WARNINGs no `R CMD check` ("depois eu resolvo")

## Exceções (não requer o loop completo)

- Correção de typo em documentação (1 linha, sem lógica)
- Atualização de URL em um link
- Adicionar/remover item de `.Rbuildignore` ou `.gitignore`
- Editar `CLAUDE.md`, `MEMORY.md`, ou arquivos em `.claude/`

Para TUDO MAIS, o loop de investigação é **obrigatório**.