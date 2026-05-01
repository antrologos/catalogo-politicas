---
descricao: Política de privacidade do projeto. Sem GA/Matomo padrão; cookies mínimos; dados de usuário em localStorage; LGPD princípios; PII em snapshots filtrada.
escopo: arquitetura · privacidade
versao: 1.0
ultima_revisao: 2026-05-01
---

# Privacidade e LGPD

Política do projeto FRM_CatalogoPoliticas em relação a dados pessoais — tanto de pessoas usuárias do site quanto de PII em snapshots externos.

## Princípio

**Privacy by default.** O site cumpre LGPD não pelo que adiciona em "configurações", mas por **não coletar** dados pessoais por padrão. Funcionalidades que dependem de dados de pessoa usuária são opcionais e processadas localmente (`localStorage`/`IndexedDB`); nada vai para servidor.

## Decisões de produto

### Sem analytics de terceiros por padrão

**Não usar** Google Analytics, Matomo, Plausible, Mixpanel, Hotjar ou similar.

- Zero rastreamento entre páginas
- Zero envio de telemetria para terceiros
- Zero "pixel" social (Facebook, LinkedIn)

Se em algum momento for necessário medir uso (ex.: para escrever paper), considerar:
1. Logs de servidor agregados (sem cookie, sem IP completo)
2. Pesquisa explícita opt-in com formulário consentido
3. Em último caso: Plausible Self-Hosted ou Matomo on-premise — **com decisão registrada em `.claude/decisions/`**

### Cookies mínimos

Cookies estritamente necessários apenas:
- Cookie de sessão (se houver autenticação no Bloco G — não previsto na 1ª versão)
- Cookie de preferência de idioma (se i18n no Bloco F)
- **Não** cookies de tracking, profiling, advertising

Como zero cookie de tracking, **não há banner de consent** (Decreto 8.771/2016 não exige consent para cookies estritamente necessários). Se em algum momento o site adicionar tracking, **aí sim** banner se torna obrigatório (e o projeto vai contra a decisão atual; reabrir ADR).

### Funcionalidades opt-in com armazenamento local

Funcionalidades de UX (ex.: favoritos, histórico de busca, comparação salva) são:
- Opt-in (pessoa precisa criar/ativar)
- Armazenadas em `localStorage` ou `IndexedDB` no navegador da pessoa
- Nunca enviadas para servidor
- "Limpar dados" no rodapé permite reset total

### Sem login obrigatório (1ª versão)

Site é público; não exige cadastro nem autenticação para qualquer funcionalidade básica (busca, comparação, leitura). Caso autenticação seja adicionada (ex.: para gestores que queiram alertas — Bloco G), seguir LGPD com finalidade específica.

## LGPD — princípios aplicados

### Finalidade
Coleta de dado pessoal (se houver) tem **finalidade declarada e limitada**. Pesquisa acadêmica é a única finalidade prevista.

### Necessidade
Coletar **o mínimo** necessário. Se não é necessário para o serviço, não coletar.

### Adequação
Tratamento alinhado com a finalidade declarada.

### Livre acesso
Pessoa pode consultar seus dados (no caso, só `localStorage` — totalmente sob controle dela).

### Qualidade dos dados
Dados exatos, claros, atualizados.

### Transparência
Política de privacidade pública e clara no rodapé do site.

### Segurança
Dados em trânsito sob HTTPS; dados em repouso (snapshots) com controle de acesso.

### Prevenção
Filtro de PII em snapshots (R8 de `@.claude/rules/captura-responsavel.md`).

### Não discriminação
Sem tratamento que cause discriminação.

### Responsabilização e prestação de contas
Logs de captura auditáveis (`logs/captura_*.jsonl`).

## PII em snapshots externos

Snapshots de portais governamentais podem conter PII inadvertidamente:
- Editais com nomes/CPFs de servidores
- Páginas que listam beneficiários
- Atas de reunião com participantes

### Mitigação obrigatória

Antes de extrair texto de um snapshot:

```python
# Em scripts/captura/extrair_texto.py
import re
PII_CPF = re.compile(r"\d{3}\.\d{3}\.\d{3}-\d{2}")
PII_CNPJ = re.compile(r"\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2}")

def detectar_pii(texto: str) -> dict:
    return {
        "cpf_count": len(PII_CPF.findall(texto)),
        "cnpj_count": len(PII_CNPJ.findall(texto)),
    }

resultado = detectar_pii(texto_extraido)
if resultado["cpf_count"] > 5 or resultado["cnpj_count"] > 5:
    metadata["contem_pii"] = True
    # NÃO incluir texto no índice de busca interno
    # Snapshot bruto continua arquivado mas com flag
```

### O que **não** publicar

- Texto extraído com `contem_pii: true`
- Listas nominais de beneficiários
- Documentos com dados de menores

### O que **pode** publicar

- Texto de leis, decretos, portarias (Lei 9.610 art. 8º IV — sem proteção autoral)
- Páginas institucionais sobre programas (sem PII)
- Atos normativos em geral

## Footer obrigatório do site (Bloco F)

```
[Política de Privacidade] [Termos de Uso] [Sobre os Dados] [Como Citar]

FRM_CatalogoPoliticas — IESP/UERJ — 2026
Conteúdo sob licença CC BY 4.0
Snapshots externos atribuídos às fontes originais
```

Política de Privacidade (página dedicada, escrita simples) deve declarar:
- Não usamos analytics de terceiros
- Cookies estritamente necessários
- Favoritos/histórico armazenados no seu navegador
- Direitos LGPD: acesso, correção, exclusão (no caso, "limpar dados" no rodapé)
- Contato para dúvidas: rogerio.barbosa@iesp.uerj.br

## Hospedagem

Quando decidida (Bloco E):
- Preferir hosting com servidores em jurisdição com LGPD-equivalente (BR ou UE)
- Logs de servidor: rotacionar diariamente; reter no máximo 90 dias; não armazenar IP completo (truncar últimos 3 octetos)

## Comunicações com pessoa usuária

- Sem newsletter padrão
- Se Bloco G adicionar alertas: opt-in explícito, opt-out fácil

## Revisão periódica

Esta política é revista:
- A cada nova feature que toque dado de pessoa usuária
- Anualmente, mesmo sem mudança
- Quando ANPD publicar nova diretriz

## Riscos identificados

| Risco | Probabilidade | Mitigação |
|---|---|---|
| PII em snapshot publicado | Média | Filtro CPF/CNPJ obrigatório; flag `contem_pii` |
| Logs de servidor expondo IP | Baixa (sem analytics) | Truncar IP; rotação diária |
| Cookie de terceiro adicionado por engano | Baixa | CSP estrito; revisão de PR |
| Vazamento de `localStorage` (XSS) | Baixa | CSP; sanitização de HTML; sem `dangerouslyHTML` |

## Anti-padrões proibidos

- Adicionar GA/Matomo "para ver se funciona"
- Cookie de tracking sem consent
- Publicar texto extraído sem checagem de PII
- Coletar email "para newsletter futura"
- Login federado de terceiro (Google/Facebook) por conveniência

## Relação com outras regras

- `@.claude/rules/captura-responsavel.md` R8 — filtro PII
- `@.claude/architecture/captura-estrategia.md` — armazenamento de snapshots
- `@.claude/decisions/` — registro de qualquer mudança nesta política