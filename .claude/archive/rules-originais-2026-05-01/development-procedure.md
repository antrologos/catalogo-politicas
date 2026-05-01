---
paths:
  - "**"
---

# Regra: Mudancas Minimas e Cirurgicas

**Status:** OBRIGATORIA
**Estabelecida:** 2026-04-15
**Escopo:** Todo o projeto Transcritorio

## Principio

Toda alteracao no codigo deve ser **minima, cirurgica e planejada**.
Nunca modificar mais do que o estritamente necessario para o objetivo
imediato. Nao "aproveitar" para fazer correcoes ou melhorias em areas
nao solicitadas.

## Antes de editar qualquer arquivo

1. **Planejar**: descrever em texto as mudancas ANTES de fazer qualquer edit
2. **Delimitar escopo**: listar QUAIS linhas serao alteradas e POR QUE
3. **Verificar dependencias**: toda funcao alterada → quem a chama?
   todo import adicionado → quem o consome?
4. **Medir impacto**: quantos modulos sao afetados pela mudanca?
   O build/packaging sera invalidado?

## Regras de edicao

- **Uma mudanca por vez**: nao misturar fix de bug com feature nova
- **Sem refactor oportunista**: se nao foi pedido, nao refatorar
- **Sem "melhorias" cosmeticas**: nao renomear variaveis, adicionar
  comentarios, type hints ou reorganizar codigo que nao faz parte da tarefa
- **Sem editar funcoes compartilhadas** sem plano aprovado — afetam
  todo o pipeline
- **Testar ANTES de editar o arquivo real**: criar toy example ou unit test
  que valide a mudanca isoladamente
- **Preferir Edit a Write**: edicoes pontuais (Edit tool) sao mais seguras
  que reescritas completas (Write tool)

## Ordem obrigatoria de implementacao

```
1. Planejar (texto descritivo da mudanca)
2. Criar unit test / toy example que valide a mudanca
3. Rodar o test (deve passar)
4. Fazer a edicao minima no arquivo real
5. Verificar que a mudanca funciona (rodar, testar, inspecionar)
6. Validar output
7. Commitar (apenas se solicitado)
```

## Funcoes e arquivos compartilhados protegidos

As seguintes funcoes/arquivos NAO devem ser alterados sem plano aprovado:

| Funcao/Arquivo | Localizacao | Razao |
|----------------|-------------|-------|
| `review_studio_qt.py` | transcribe_pipeline/ | GUI principal ~2900 linhas, risco alto |
| `app_service.py` pipeline methods | transcribe_pipeline/ | Orquestra todo o pipeline |
| `runtime.resolve_executable()` | transcribe_pipeline/runtime.py | Afeta resolucao de todos os executaveis |
| `runtime.secure_hf_environment()` | transcribe_pipeline/runtime.py | Seguranca de tokens HF |
| `config.py` parser | transcribe_pipeline/config.py | Afeta toda configuracao |
| `whisperx_runner.py` | transcribe_pipeline/ | Execucao ASR, GPU, subprocessos |
| `build.ps1` | packaging/ | Build inteiro depende deste script |
| `transcritorio.spec` | packaging/ | PyInstaller spec, afeta bundle inteiro |
| `transcritorio.iss` | packaging/ | Instalador, afeta distribuicao |
| `runtime_hook.py` | packaging/ | Inicializacao do bundle frozen |

## O que fazer quando um teste falha

1. **NAO** editar a funcao compartilhada para "resolver"
2. Investigar: o teste esta errado ou a funcao tem um bug real?
3. Se for bug real: planejar o fix separadamente, com evidencia empirica
4. Se for limitacao conhecida: contornar no codigo local, nao na
   funcao compartilhada
5. **NUNCA** entrar em loop de "fix iterativo": editar → testar → falha →
   editar → testar → ... (sinal de que faltou planejamento)

## Anti-padroes proibidos

- Editar 3+ arquivos em uma unica mudanca sem plano aprovado
- Alterar `build.ps1` e `transcritorio.spec` simultaneamente sem plano
- Fazer build sem verificar que o build-venv tem CUDA
- Empacotar codigo sem verificar que `__build__` stamp esta correto
- Alterar `runtime.py` para resolver um problema de um unico modulo
- Adicionar features a `review_studio_qt.py` sem ler as secoes vizinhas
- Deletar dist ou build artifacts sem confirmacao do usuario

## Checklist antes de qualquer commit

- [ ] Mudanca e minima e focada em UM objetivo
- [ ] Nenhuma funcao compartilhada foi alterada sem necessidade
- [ ] Unit test existe e passa (quando aplicavel)
- [ ] Verificacao pos-implementacao feita
- [ ] Nenhum arquivo fora do escopo foi alterado
