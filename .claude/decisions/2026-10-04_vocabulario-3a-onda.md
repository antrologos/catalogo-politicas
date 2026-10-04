---
status: aceito
data: 2026-10-04
contexto: G · incorporação da 3ª onda e pendências pós-v1.0
substituido_por: null
---

# ADR — Vocabulário canônico ampliado pela 3ª onda e pelo dicionário oficial

## Contexto

A 3ª onda (MS, RR, DF, RO, PI, AC, SE, TO, AP) trouxe valores categóricos fora do vocabulário canônico, e as ondas anteriores já tinham 166 ocorrências desse tipo em fichas visíveis. Elas apareciam como categorias duplicadas em /explorar/ (por exemplo, "Curso/Formação" e "Curso/Formação (qualificação/capacitação)") e algumas derrubariam o job de validação do deploy.

A própria planilha da 3ª onda traz o dicionário oficial da equipe de pesquisa (aba "Modelos de Categorias"). Ele inclui categorias que faltavam no vocabulário, como "Infraestrutura educacional", "Insumo/Bem de apoio", "Sem informação" e "Distrito Federal" como esfera de execução.

## Alternativas consideradas

### Alternativa A — Manter os valores livres e só logar

- **Pró**: não interpreta nada.
- **Contra**: deixa categorias duplicadas e páginas de faceta espúrias no site, e quebra a validação (`situacao_atual`, `tipo_politica`).

### Alternativa B — Criar categorias novas para cada variante

- **Pró**: preserva a nuance.
- **Contra**: fragmenta facetas e contagens e diverge do dicionário oficial.

### Alternativa C — Mapear para o dicionário oficial (escolhida)

Cada variante vira a categoria oficial correspondente. Valores que pertencem a outro campo viram "Sem informação". O DF ganha só um rótulo de exibição.

- **Pró**: segue a fonte de verdade da equipe, fecha o vocabulário e mantém facetas e contagens coerentes.
- **Contra**: perde o detalhe descritivo do valor original. Na prática, esse detalhe costuma estar no Resumo e na Apresentação.

## Decisão

**Adotamos a Alternativa C.** Regras:

1. **Descrição entre parênteses ou erro de grafia**: vira a categoria curta. Exemplos: "Curso/Formação (qualificação/capacitação)" → "Curso/Formação"; "Compartilha da Interfederativa…" → "Compartilhada interfederativa: …".
2. **Categorias oficiais que faltavam**: entram em `canonical_values`. São elas "Infraestrutura educacional", "Insumo/Bem de apoio" e "Sem informação" em `tipo_oferta`.
3. **Arranjo misto**: "Misto" puro e os "Misto (…)" descritivos viram "Misto (fixa + itinerante)", única opção mista do dicionário.
4. **Valor de outro campo, ou que não descreve o campo**: vira "Sem informação". Exemplos: "Presencial" e "." em tipo de oferta; "Territorializada" e "Mista (múltiplas modalidades…" em arranjo.
5. **Distrito Federal** (decisão da usuária): "Distrital" (abrangência) e "Distrito Federal" (esferas) valem "Estadual"/"Estado" nos dados, buscas e listas, sem categoria separada. O site exibe o rótulo "Distrital"/"Distrito Federal" nas fichas do DF (`ficha.njk`).
6. **Casos pontuais decididos com evidência da ficha**:
   - "Itinerante" na modalidade do Qualifica Piauí vira "Presencial" (carretas-escola e espaços municipais);
   - "Misto" no tipo do ProJovem Urbano e Campo (DF) vira "Proteção social com impacto educacional", como o ProJovem federal;
   - "Situação variável por modalidade" vira "Sem informação".

## Consequências

- 0 valores fora do vocabulário (log `normalize_unmapped_2026-10-04.csv` vazio) e 0 erros de schema.
- Os casos das regras 4 e 6 constam da lista de revisão para a equipe de pesquisa (`docs/revisao-equipe-pesquisa-2026-10.md`).
- Testes: `tests/toy_onda3.py` e `tests/toy_vocab_correcoes.py`.
