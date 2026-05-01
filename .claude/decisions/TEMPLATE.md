---
status: proposto    # proposto | aceito | depreciado | substituido
data: YYYY-MM-DD
contexto: [bloco/rodada se aplicável; ex.: A · Rodada 4]
substituido_por: null  # path para ADR sucessor, se status = substituido
---

# ADR-NNNN — [Título sucinto da decisão]

## Contexto

[Por que esta decisão precisa ser tomada agora? Qual o problema, restrição, ou pergunta? 2-4 parágrafos.]

## Alternativas consideradas

### Alternativa A — [nome]

[Descrição em 1-2 frases.]

- **Pró**: ...
- **Contra**: ...

### Alternativa B — [nome]

[Descrição em 1-2 frases.]

- **Pró**: ...
- **Contra**: ...

### Alternativa C — [nome] (escolhida)

[Descrição em 1-2 frases.]

- **Pró**: ...
- **Contra**: ...

## Decisão

**Adotamos a Alternativa [letra].**

[1-2 parágrafos explicando exatamente o que foi decidido. Concreto: "fazemos X usando Y, com Z como fallback".]

## Justificativa

[Por que esta alternativa, e não as outras? Critérios principais.]

1. ...
2. ...
3. ...

## Trade-offs

- **Aceitamos**: [coisa que perdemos com essa escolha]
- **Aceitamos**: [outra coisa]
- **Mitigamos**: [coisa que podia doer mas resolvemos com Z]

## Consequências

### Positivas
- ...

### Negativas
- ...

### Neutras
- ...

## Próximos passos

- [ ] [Ação concreta com responsável]
- [ ] [Ação concreta com responsável]
- [ ] Atualizar `MEMORY.md` com decisão
- [ ] Atualizar `CLAUDE.md` se a decisão muda convenções

## Referências

- `@.claude/rules/<relevante>.md`
- `@.claude/architecture/<relevante>.md`
- Discussão original: `.claude/working/<arquivo>.md`
- Issue/PR (se aplicável): #N

## Histórico

- YYYY-MM-DD: criado como `proposto`
- YYYY-MM-DD: aprovado, status → `aceito`