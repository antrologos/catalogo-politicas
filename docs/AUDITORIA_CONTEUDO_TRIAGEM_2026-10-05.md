# Auditoria de conteúdo — triagem de 5 de outubro de 2026

## Escopo e método

Leitura dos 366 registros únicos de `data/derived/latest.json` (1.158 registros brutos; 792 réplicas federais excluídas da triagem), do documento `docs/revisao-equipe-pesquisa-2026-10.md` e das regras de dados e proteção de fontes. A análise foi feita no clone `C:/Users/antro/dev/catalogo-politicas`, sem executar ETL, captura ou validador que grave arquivos. Na etapa inicial, somente este relatório foi escrito. A etapa posterior de propostas documentais está delimitada no apêndice ao final.

SHA-256 do JSON examinado: `d06c27b765118dcd45f9972e5f6bc6fc8fbfab04e0bc2bf81d6bdccbcea7af4a`.

A busca por nomes de estados e por termos de encerramento serviu para localizar candidatos. Cada caso abaixo foi lido no contexto; ocorrências legítimas em uma política nacional e relatos de retomada não foram classificadas como erro. A triagem não comprova a situação de oferta atual, a validade jurídica, a execução territorial nem a exatidão de cada dado da ficha. Não houve, nesta triagem, consulta nova às fontes externas. Pesquisas posteriores de fontes devem ser registradas separadamente.

## Síntese das contagens verificadas

- 12 registros estaduais contêm órgãos ou textos explicitamente relativos a outra UF; os campos e valores estão reproduzidos abaixo.
- 2 registros classificados como federais apresentam formulação descritiva centrada numa execução estadual sem separar claramente os níveis.
- 11 registros usam `placeholder.frm-catalogo.local` em `fonte_url`: não são endereços de fontes oficiais. Correspondem exatamente aos 11 casos da seção 4 do documento da equipe.
- 121 registros não têm `fonte_arquivo_path`, `fonte_sha256` ou `fonte_data_acesso`; 245 têm esses três campos preenchidos. Ausência de snapshot não significa ausência de fonte externa nem inexistência da experiência.
- 1 ficha (BA, EDU-0110) não possui `resumo`, `descricao_tecnica` ou `apresentacao`; também não possui modalidade, abrangência ou tipo de oferta preenchidos.
- Situação registrada: 344 Ativa / em execução; 13 Encerrada; 7 Descontinuada; 1 Suspensa / pausada; 1 Sem informação. Esses rótulos não demonstram oferta atual.
- `data_validade_fim` está vazia nas 366 fichas; vazio não comprova vigência.

## Prioridade 1 — doze cruzamentos textuais comprováveis entre UFs

O fato verificável é a divergência entre a UF da ficha e o local ou órgão explicitamente nomeado no campo. Isso indica necessidade de corrigir ou delimitar o trecho, mas não autoriza substituir apenas o nome do estado: números, instituições e formas de execução também precisam corresponder à experiência. O restante da ficha não foi automaticamente considerado incorreto.

### FRM-CP-2026-TRAB-0117 — Agências do Trabalho/Casas do Trabalhador (articuladas ao Sine)

- UF: `BA`.
- Slug: `agencias-do-trabalho-casas-do-trabalhador-articuladas-ao-sine-ba`.
- [Ficha publicada](https://antrologos.github.io/catalogo-politicas/politica/agencias-do-trabalho-casas-do-trabalhador-articuladas-ao-sine-ba/).

**`orgaos_responsaveis` — valor atual:**

> Secretaria de Estado de Assistência Social, Trabalho, Emprego e Renda do Pará (Seaster). Gerência de Trabalho e Emprego (Seaster). Coordenação de Intermediação de Mão de Obra. Superintendência Regional do Trabalho e Emprego no Pará (SRTE/PA)

**Constatação:** a ficha está associada a BA, enquanto o(s) campo(s) acima descreve(m) PA. Conferir a fonte específica antes de repor detalhes locais.

### FRM-CP-2026-EDU-0145 — EMTI – Política de Fomento à Implementação de Escolas de Ensino Médio em Tempo Integral

- UF: `PA`.
- Slug: `emti-politica-de-fomento-a-implementacao-de-escolas-de-ensino-medio-em-tempo-integral-pa`.
- [Ficha publicada](https://antrologos.github.io/catalogo-politicas/politica/emti-politica-de-fomento-a-implementacao-de-escolas-de-ensino-medio-em-tempo-integral-pa/).

**`descricao_tecnica` — valor atual:**

> A EMTI no Paraná amplia o tempo de permanência do estudante na escola, reorganiza o currículo e busca melhorar o desempenho escolar, reduzir evasão e fortalecer o projeto de vida dos jovens

**`transferencia_recursos` — valor atual:**

> Transferência da União para o estado do Paraná, conforme adesão e número de matrículas em tempo integral

**Constatação:** a ficha está associada a PA, enquanto o(s) campo(s) acima descreve(m) PR. Conferir a fonte específica antes de repor detalhes locais.

### FRM-CP-2026-EDU-0148 — Educação de Jovens e Adultos (EJA) - Rede Estadual de Pernambuco

- UF: `PE`.
- Slug: `educacao-de-jovens-e-adultos-eja-rede-estadual-de-pernambuco-pe`.
- [Ficha publicada](https://antrologos.github.io/catalogo-politicas/politica/educacao-de-jovens-e-adultos-eja-rede-estadual-de-pernambuco-pe/).

**`resumo` — valor atual:**

> A Educação de Jovens e Adultos (EJA) da rede estadual da Bahia é a modalidade de ensino destinada a jovens, adultos e idosos que não tiveram oportunidade de concluir os estudos na idade regular

**Constatação:** a ficha está associada a PE, enquanto o(s) campo(s) acima descreve(m) BA. Conferir a fonte específica antes de repor detalhes locais.

### FRM-CP-2026-EDU-0261 — Plano Estadual de Educação em Ambientes Prisionais (PEESP) - 2025-2028

- UF: `MA`.
- Slug: `plano-estadual-de-educacao-em-ambientes-prisionais-peesp-2025-2028-ma`.
- [Ficha publicada](https://antrologos.github.io/catalogo-politicas/politica/plano-estadual-de-educacao-em-ambientes-prisionais-peesp-2025-2028-ma/).

**`resumo` — valor atual:**

> Os Planos Estaduais de Educação no Sistema Prisional são elaborados de forma conjunta entre a Secretaria de Estado da Educação e a Secretaria de Estado da Justiça e Cidadania, com a participação ampla de representantes dos diversos segmentos sociais. Eles têm por objetivo a garantia da escolarização básica, no nível fundamental e médio, na modalidade de Educação de Jovens e Adultos (EJA) e a educação profissional às pessoas em privação de liberdade, no Sistema Penitenciário do Estado do Paraná, por meio dos Centros Estaduais de Educação Básica para Jovens e Adultos (CEEBJA) e/ou Ações Pedagógicas Descentralizadas (APED)

**Constatação:** a ficha está associada a MA, enquanto o(s) campo(s) acima descreve(m) PR. Conferir a fonte específica antes de repor detalhes locais.

### FRM-CP-2026-TRAB-0216 — Sine Amazonas / Portal do Trabalhador

- UF: `AM`.
- Slug: `sine-amazonas-portal-do-trabalhador-am`.
- [Ficha publicada](https://antrologos.github.io/catalogo-politicas/politica/sine-amazonas-portal-do-trabalhador-am/).

**`descricao_tecnica` — valor atual:**

> O Sistema Nacional de Emprego (SINE) foi instituído em 1975 como principal política pública de intermediação de mão de obra no Brasil. Em São Paulo, o SINE é executado pela rede de Postos de Atendimento ao Trabalhador (PAT), em regime de parceria entre o Governo do Estado e as prefeituras municipais. O sistema utiliza a plataforma "Emprega Brasil" (antigo "Mais Emprego"), que integra as bases de dados de trabalhadores e vagas em todo o território nacional. Além da intermediação, o SINE oferece serviços como habilitação ao seguro-desemprego, orientação profissional e emissão da Carteira de Trabalho Digital

**`resumo` — valor atual:**

> O SINE é uma política federal de intermediação de mão de obra, criada em 1975, que conecta trabalhadores a vagas de emprego formais. Em São Paulo, o sistema é operacionalizado pelos Postos de Atendimento ao Trabalhador (PAT), que utilizam a plataforma federal "Emprega Brasil" para cadastro de currículos, captação de vagas, encaminhamento para entrevistas e habilitação ao seguro-desemprego

**Constatação:** a ficha está associada a AM, enquanto o(s) campo(s) acima descreve(m) SP. Conferir a fonte específica antes de repor detalhes locais.

### FRM-CP-2026-TRAB-0228 — Sine Mato Grosso

- UF: `MT`.
- Slug: `sine-mato-grosso-mt`.
- [Ficha publicada](https://antrologos.github.io/catalogo-politicas/politica/sine-mato-grosso-mt/).

**`descricao_tecnica` — valor atual:**

> O Sistema Nacional de Emprego (SINE) foi instituído em 1975 como principal política pública de intermediação de mão de obra no Brasil. Em São Paulo, o SINE é executado pela rede de Postos de Atendimento ao Trabalhador (PAT), em regime de parceria entre o Governo do Estado e as prefeituras municipais. O sistema utiliza a plataforma "Emprega Brasil" (antigo "Mais Emprego"), que integra as bases de dados de trabalhadores e vagas em todo o território nacional. Além da intermediação, o SINE oferece serviços como habilitação ao seguro-desemprego, orientação profissional e emissão da Carteira de Trabalho Digital

**`resumo` — valor atual:**

> O SINE é uma política federal de intermediação de mão de obra, criada em 1975, que conecta trabalhadores a vagas de emprego formais. Em São Paulo, o sistema é operacionalizado pelos Postos de Atendimento ao Trabalhador (PAT), que utilizam a plataforma federal "Emprega Brasil" para cadastro de currículos, captação de vagas, encaminhamento para entrevistas e habilitação ao seguro-desemprego

**Constatação:** a ficha está associada a MT, enquanto o(s) campo(s) acima descreve(m) SP. Conferir a fonte específica antes de repor detalhes locais.

### FRM-CP-2026-TRAB-0258 — Sistema Nacional de Emprego (SINE) - Alagoas

- UF: `AL`.
- Slug: `sistema-nacional-de-emprego-sine-alagoas-al`.
- [Ficha publicada](https://antrologos.github.io/catalogo-politicas/politica/sistema-nacional-de-emprego-sine-alagoas-al/).

**`descricao_tecnica` — valor atual:**

> O Sistema Nacional de Emprego (SINE) foi instituído em 1975 como principal política pública de intermediação de mão de obra no Brasil. Em São Paulo, o SINE é executado pela rede de Postos de Atendimento ao Trabalhador (PAT), em regime de parceria entre o Governo do Estado e as prefeituras municipais. O sistema utiliza a plataforma "Emprega Brasil" (antigo "Mais Emprego"), que integra as bases de dados de trabalhadores e vagas em todo o território nacional. Além da intermediação, o SINE oferece serviços como habilitação ao seguro-desemprego, orientação profissional e emissão da Carteira de Trabalho Digital

**`resumo` — valor atual:**

> O SINE é uma política federal de intermediação de mão de obra que conecta trabalhadores a vagas de emprego formais. Em São Paulo, o sistema é operacionalizado pelos Postos de Atendimento ao Trabalhador (PAT), que utilizam a plataforma federal "Emprega Brasil" para cadastro de currículos, captação de vagas, encaminhamento para entrevistas e habilitação ao seguro-desemprego

**Constatação:** a ficha está associada a AL, enquanto o(s) campo(s) acima descreve(m) SP. Conferir a fonte específica antes de repor detalhes locais.

### FRM-CP-2026-TRAB-0268 — SINE RN

- UF: `RN`.
- Slug: `sine-rn-rn`.
- [Ficha publicada](https://antrologos.github.io/catalogo-politicas/politica/sine-rn-rn/).

**`descricao_tecnica` — valor atual:**

> O Sistema Nacional de Emprego (SINE) foi instituído em 1975 como principal política pública de intermediação de mão de obra no Brasil. Em São Paulo, o SINE é executado pela rede de Postos de Atendimento ao Trabalhador (PAT), em regime de parceria entre o Governo do Estado e as prefeituras municipais. O sistema utiliza a plataforma "Emprega Brasil" (antigo "Mais Emprego"), que integra as bases de dados de trabalhadores e vagas em todo o território nacional. Além da intermediação, o SINE oferece serviços como habilitação ao seguro-desemprego, orientação profissional e emissão da Carteira de Trabalho Digital

**`resumo` — valor atual:**

> O SINE é uma política federal de intermediação de mão de obra, criada em 1975, que conecta trabalhadores a vagas de emprego formais. Em São Paulo, o sistema é operacionalizado pelos Postos de Atendimento ao Trabalhador (PAT), que utilizam a plataforma federal "Emprega Brasil" para cadastro de currículos, captação de vagas, encaminhamento para entrevistas e habilitação ao seguro-desemprego

**Constatação:** a ficha está associada a RN, enquanto o(s) campo(s) acima descreve(m) SP. Conferir a fonte específica antes de repor detalhes locais.

### FRM-CP-2026-EDU-0388 — Plano Estadual de Educação em Ambientes Prisionais (PEESP) - 2025-2028

- UF: `RR`.
- Slug: `plano-estadual-de-educacao-em-ambientes-prisionais-peesp-2025-2028-rr`.
- [Ficha publicada](https://antrologos.github.io/catalogo-politicas/politica/plano-estadual-de-educacao-em-ambientes-prisionais-peesp-2025-2028-rr/).

**`resumo` — valor atual:**

> Os Planos Estaduais de Educação no Sistema Prisional são elaborados de forma conjunta entre a Secretaria de Estado da Educação e a Secretaria de Estado da Justiça e Cidadania, com a participação ampla de representantes dos diversos segmentos sociais. Eles têm por objetivo a garantia da escolarização básica, no nível fundamental e médio, na modalidade de Educação de Jovens e Adultos (EJA) e a educação profissional às pessoas em privação de liberdade, no Sistema Penitenciário do Estado do Paraná, por meio dos Centros Estaduais de Educação Básica para Jovens e Adultos (CEEBJA) e/ou Ações Pedagógicas Descentralizadas (APED)

**Constatação:** a ficha está associada a RR, enquanto o(s) campo(s) acima descreve(m) PR. Conferir a fonte específica antes de repor detalhes locais.

### FRM-CP-2026-EDU-0416 — Plano Estadual de Educação em Ambientes Prisionais (PEESP) - 2025-2028

- UF: `RO`.
- Slug: `plano-estadual-de-educacao-em-ambientes-prisionais-peesp-2025-2028-ro`.
- [Ficha publicada](https://antrologos.github.io/catalogo-politicas/politica/plano-estadual-de-educacao-em-ambientes-prisionais-peesp-2025-2028-ro/).

**`resumo` — valor atual:**

> Os Planos Estaduais de Educação no Sistema Prisional são elaborados de forma conjunta entre a Secretaria de Estado da Educação e a Secretaria de Estado da Justiça e Cidadania, com a participação ampla de representantes dos diversos segmentos sociais. Eles têm por objetivo a garantia da escolarização básica, no nível fundamental e médio, na modalidade de Educação de Jovens e Adultos (EJA) e a educação profissional às pessoas em privação de liberdade, no Sistema Penitenciário do Estado do Paraná, por meio dos Centros Estaduais de Educação Básica para Jovens e Adultos (CEEBJA) e/ou Ações Pedagógicas Descentralizadas (APED)

**Constatação:** a ficha está associada a RO, enquanto o(s) campo(s) acima descreve(m) PR. Conferir a fonte específica antes de repor detalhes locais.

### FRM-CP-2026-EDU-0485 — Plano Estadual de Educação em Ambientes Prisionais (PEESP) - 2025-2028

- UF: `TO`.
- Slug: `plano-estadual-de-educacao-em-ambientes-prisionais-peesp-2025-2028-to`.
- [Ficha publicada](https://antrologos.github.io/catalogo-politicas/politica/plano-estadual-de-educacao-em-ambientes-prisionais-peesp-2025-2028-to/).

**`resumo` — valor atual:**

> Os Planos Estaduais de Educação no Sistema Prisional são elaborados de forma conjunta entre a Secretaria de Estado da Educação e a Secretaria de Estado da Justiça e Cidadania, com a participação ampla de representantes dos diversos segmentos sociais. Eles têm por objetivo a garantia da escolarização básica, no nível fundamental e médio, na modalidade de Educação de Jovens e Adultos (EJA) e a educação profissional às pessoas em privação de liberdade, no Sistema Penitenciário do Estado do Paraná, por meio dos Centros Estaduais de Educação Básica para Jovens e Adultos (CEEBJA) e/ou Ações Pedagógicas Descentralizadas (APED)

**Constatação:** a ficha está associada a TO, enquanto o(s) campo(s) acima descreve(m) PR. Conferir a fonte específica antes de repor detalhes locais.

### FRM-CP-2026-TRAB-0376 — Conecta Trabalho

- UF: `TO`.
- Slug: `conecta-trabalho-to`.
- [Ficha publicada](https://antrologos.github.io/catalogo-politicas/politica/conecta-trabalho-to/).

**`orgaos_responsaveis` — valor atual:**

> Secretaria de Estado de Indústria, Ciência e Tecnologia do Acre

**Constatação:** a ficha está associada a TO, enquanto o(s) campo(s) acima descreve(m) AC. Conferir a fonte específica antes de repor detalhes locais.

## Prioridade 1 — dois verbetes federais com recorte estadual não delimitado

### FRM-CP-2026-EDU-0001 — Educação de Jovens e Adultos (EJA)

- UF: `BR`.
- Slug: `educacao-de-jovens-e-adultos-eja-br`.
- [Ficha publicada](https://antrologos.github.io/catalogo-politicas/politica/educacao-de-jovens-e-adultos-eja-br/).

**`orgaos_responsaveis` — valor atual:**

> SEDUC-SP; Diretorias de Ensino; Escolas Estaduais; CEEJAs; CIEJAs

**`descricao_tecnica` — valor atual:**

> A Educação de Jovens e Adultos no estado de São Paulo é organizada pela Seduc-SP para garantir o direito à educação de quem não teve acesso ou não concluiu os estudos na idade adequada. O estado oferece dois modelos complementares: a EJA de presença regular, com aulas presenciais em horários definidos (noturno), disponível em 600 escolas; e a EJA de presença flexível, inspirada nos CEEJAs, que permite ao estudante organizar seu percurso formativo de forma personalizada. Em 2026, o modelo flexível será ampliado para 151 escolas

**`transferencia_recursos` — valor atual:**

> Repasse automático "fundo a fundo" do Fundeb. A União (FNDE) transfere recursos ao Fundo de Educação do Estado de São Paulo, gerido pela Sefaz-SP, que os distribui à Seduc-SP (rede estadual) e as redes municipais de ensino que ofertam EJA

**`fonte_url` — valor atual:**

> https://www.educacao.sp.gov.br/educacao-jovens-adultos

**Constatação:** UF BR e abrangência Nacional coexistem com descrição, órgãos e fonte centrados em São Paulo. Não generalizar as 600 escolas e a expansão prevista para 151 escolas para o país. A distinção entre experiência nacional e exemplo paulista precisa ficar explícita.

### FRM-CP-2026-EDU-0010 — Busca Ativa Escolar

- UF: `BR`.
- Slug: `busca-ativa-escolar-br`.
- [Ficha publicada](https://antrologos.github.io/catalogo-politicas/politica/busca-ativa-escolar-br/).

**`descricao_tecnica` — valor atual:**

> A Busca Ativa Escolar no Rio de Janeiro envolve a adesão do Governo do Estado à estratégia do UNICEF/Undime  e a articulação de ações intersetoriais para identificar e acompanhar crianças e adolescentes fora da escola ou em risco de evasão.No RJ, pode ser adotada por municípios para monitorar evasão e infrequência, acionar equipes intersetoriais e registrar encaminhamentos. Atua na prevenção do abandono escolar e na garantia do direito à educação, com forte componente de trabalho territorial

**`fonte_url` — valor atual:**

> https://buscaativaescolar.org.br/

**Constatação:** o verbete federal inicia sua descrição pela execução no Rio de Janeiro. É preciso apresentar a estratégia nacional e delimitar o exemplo estadual, ou usar uma descrição nacional sustentada por fonte própria.

## Prioridade 1 — onze referências provisórias e uma ficha sem descrição

Os valores abaixo são marcadores internos, não links de documentação pública. O site pode ocultá-los, mas eles continuam presentes no JSON e podem repercutir nas citações geradas. Não criar uma fonte por aproximação de nome: confirmar que o documento corresponde à experiência, ao território e ao período.

| ID | UF | Slug |
|---|---|---|
| FRM-CP-2026-TRAB-0010 | BR | `programa-emprega-mulheres-e-jovens-br` |
| FRM-CP-2026-EDU-0110 | BA | `plano-estadual-de-educacao-para-pessoas-privadas-de-liberdade-e-egressas-do-sistema-prisional-bahia-2021-2024-ba` |
| FRM-CP-2026-EDU-0112 | BA | `programa-nacional-de-integracao-da-educacao-profissional-com-a-educacao-basica-proeja-ba` |
| FRM-CP-2026-EDU-0127 | PA | `plano-estadual-de-educacao-do-para-pee-pa` |
| FRM-CP-2026-PSOC-0106 | ES | `programa-empodera-programa-de-trabalho-digno-educacao-e-geracao-de-renda-para-pessoas-lgbtqia-es` |
| FRM-CP-2026-PSOC-0116 | ES | `estado-presente-eixo-de-inclusao-social-de-jovens-es` |
| FRM-CP-2026-EDU-0323 | AL | `exame-nacional-para-certificacao-de-competencias-de-jovens-e-adultos-encceja-alagoas-al` |
| FRM-CP-2026-EDU-0335 | AL | `programa-escola-10-al` |
| FRM-CP-2026-TRAB-0257 | AL | `emprega-mais-alagoas-al` |
| FRM-CP-2026-EDU-0381 | RR | `formacao-continuada-de-profissionais-da-educacao-rr` |
| FRM-CP-2026-TRAB-0355 | SE | `nucleo-de-apoio-ao-trabalho-nat-sine-se` |

**Ficha mais incompleta:** `FRM-CP-2026-EDU-0110`, plano prisional da Bahia 2021–2024, tem órgãos e base legal geral, mas não tem resumo, descrição técnica ou apresentação. Além do link, falta explicar a finalidade e o funcionamento básico. Seu título delimita 2021–2024 enquanto a situação é Ativa / em execução; isso pede conferência do ciclo e de eventual sucessão, sem presumir que a política educacional prisional inteira tenha encerrado.

## Prioridade 2 — classificações por inferência documentadas pela equipe

O documento de revisão já distingue corretamente decisões por regra e inferência. Continuam pendentes de validação editorial:

- 6 ocorrências de valor inadequado em campo, distribuídas por 5 fichas: PE Exame Supletivo (tipo de oferta e modalidade), ES Estado Presente (arranjo), RN plano prisional 2015–2024 (tipo de oferta), RR PEE (arranjo), DF ProJovem (situação).
- 2 inferências pontuais: tipo do ProJovem Urbano e Campo/DF e modalidade de Qualifica Piauí.
- 13 arranjos com descrição livre de Misto convertidos em Misto (fixa + itinerante): 6 GO e 7 ES. A menção a polo fixo, apoio tecnológico, semipresencialidade ou descentralização não demonstra, por si só, itinerância. Não corrigir automaticamente para uma categoria nova.

As 13 fichas de arranjo são listadas nominalmente na seção 2 do documento de origem; ele deve permanecer vinculado à revisão. Dados normalizados válidos no schema não garantem equivalência conceitual entre as categorias.

## Prioridade 2 — situação temporal: casos para conferir, não erros concluídos

### FRM-CP-2026-PSOC-0002 — Programa Nacional de Inclusão de Jovens (ProJovem)

- UF: `BR`.
- Slug: `programa-nacional-de-inclusao-de-jovens-projovem-br`.
- [Ficha publicada](https://antrologos.github.io/catalogo-politicas/politica/programa-nacional-de-inclusao-de-jovens-projovem-br/).

**`situacao_atual` — valor atual:**

> Ativa / em execução

**`informacoes_complementares` — valor atual:**

> Entre 2005 e 2014, o ProJovem operou com repasses regulares e bolsas para as modalidades Urbano, Campo e Trabalhador, enquanto o Adolescente se consolidou como serviço do SUAS. Em 2014, a suspensão das bolsas descontinuou completamente o ProJovem Trabalhador e reduziu drasticamente a oferta do Urbano e Campo, que sobreviveram apenas de forma residual em alguns municípios, como São Paulo; já o ProJovem Adolescente manteve-se contínuo por não depender de bolsa. Em 2024, o programa foi retomado com o novo ciclo nacional 2024-2027, que investe R$ 828 milhões para ofertar 100 mil vagas nas modalidades Urbano e Campo, com bolsas restabelecidas, além do relançamento do ProJovem Trabalhador pelo Ministério do Trabalho

### FRM-CP-2026-TRAB-0111 — Jovem Empreendedor

- UF: `BA`.
- Slug: `jovem-empreendedor-ba`.
- [Ficha publicada](https://antrologos.github.io/catalogo-politicas/politica/jovem-empreendedor-ba/).

**`situacao_atual` — valor atual:**

> Ativa / em execução

**`informacoes_complementares` — valor atual:**

> O Programa Juventude Produtiva adota uma lógica de atuação territorializada, com diferentes ações em diferentes regiões para ampliar o alcance e evitar sobreposição. A Península Itapagipana concentra bairros com indicadores sociais que demandam atenção prioritária em políticas de juventude e trabalho.                                                                                 A primeira edição do projeto foi concluída em dezembro de 2023. A cerimônia de encerramento do Programa Juventude Produtiva, realizada no Museu Nacional da Cultura Afro-Brasileira (Muncab), no Centro Histórico de Salvador, incluiu um desfile de moda com peças produzidas pelos participantes do Jovem Empreendedor. O desfile exibiu peças de banho (praia e piscina) e outras confeccionadas com material reciclável e jeans reutilizado, destacando a preocupação com a sustentabilidade

### FRM-CP-2026-TRAB-0112 — Programa Força Jovem

- UF: `BA`.
- Slug: `programa-forca-jovem-ba`.
- [Ficha publicada](https://antrologos.github.io/catalogo-politicas/politica/programa-forca-jovem-ba/).

**`situacao_atual` — valor atual:**

> Ativa / em execução

**`continuidade_governos` — valor atual:**

> O projeto foi executado em 2023 como parte do Programa Juventude Produtiva. Mesmo ativo, as inscrições estão encerradas e não há, até o momento, informação sobre novas edições

### FRM-CP-2026-TRAB-0113 — Acelerando seu Corre Bahia

- UF: `BA`.
- Slug: `acelerando-seu-corre-bahia-ba`.
- [Ficha publicada](https://antrologos.github.io/catalogo-politicas/politica/acelerando-seu-corre-bahia-ba/).

**`situacao_atual` — valor atual:**

> Ativa / em execução

**`continuidade_governos` — valor atual:**

> O projeto foi executado em 2023 como parte do Programa Juventude Produtiva. Mesmo ativo, as inscrições estão encerradas e não há, até o momento, informação sobre novas edições

### FRM-CP-2026-EDU-0127 — Plano Estadual de Educação do Pará (PEE)

- UF: `PA`.
- Slug: `plano-estadual-de-educacao-do-para-pee-pa`.
- [Ficha publicada](https://antrologos.github.io/catalogo-politicas/politica/plano-estadual-de-educacao-do-para-pee-pa/).

**`situacao_atual` — valor atual:**

> Ativa / em execução

**`informacoes_complementares` — valor atual:**

> O plano estabelece metas educacionais para 10 anos (2015-2025) e inclui estratégias para ampliar a EJA integrada à educação profissional, principalmente para populações do campo, indígenas e quilombolas

**Leitura correta dos casos:** ProJovem agrega modalidades com trajetórias distintas; a ficha não permite transformar a situação de uma modalidade na situação do conjunto. Nos projetos da Bahia, inscrições encerradas ou conclusão de uma edição não provam extinção do programa, mas impedem anunciar matrícula atual sem nova evidência. No PEE do Pará, o intervalo 2015–2025 pede verificar eventual prorrogação ou sucessão; o mero decurso do prazo não resolve a situação jurídica ou a implementação.

## Outros cuidados identificados

- Os verbetes federais `FRM-CP-2026-TRAB-0006` (PRONATEC), `FRM-CP-2026-TRAB-0008` (SINE) e `FRM-CP-2026-TRAB-0009` (Liberdade Econômica) citam São Paulo como exemplo. A referência estadual é explícita e, isoladamente, não é erro. Verificar se o exemplo está delimitado e se o leitor consegue identificar a finalidade nacional.
- Menções a estados e Distrito Federal como destinatários de programas nacionais, bem como a listas de estados participantes, não foram classificadas como troca de UF.
- Relatos de interrupção seguida de retomada (PBA, MOVA, ProJovem/PE) e menções à revogação de normas por outra política não comprovam status errado da política descrita.

## Notas de revisão já explícitas na base

Quatro fichas preservam dúvida direta sobre sua base legal: MG `FRM-CP-2026-EDU-0054` e `FRM-CP-2026-EDU-0055` (bancas de certificação: dúvida sobre decreto e marco de criação), BA `FRM-CP-2026-TRAB-0102` (Projeto Conectar: norma instituidora não encontrada) e CE `FRM-CP-2026-TRAB-0158` (Qualificar Ceará: base de criação não identificada). São pendências declaradas pelo levantamento, não prova de ausência de instrumento legal.

## Teste de links registrado em 4 de outubro — limite da evidência

A seção 5 do documento da equipe relaciona 78 fichas: 26 erro_rede, 20 not_found_404, 14 timeout, 11 forbidden_403, 4 bloqueado_robots, 1 client_err_405, 1 server_err_500 e 1 server_err_503. Isso reproduz o relatório antigo; não é uma nova validação de disponibilidade. Falhas 403, robots, rede ou timeout não demonstram que uma fonte deixou de existir. Os 20 casos 404 merecem busca da página correspondente ou histórico, preservando a referência anterior.

## Encaminhamento seguro

1. Tratar primeiro os 12 cruzamentos de UF, os 2 verbetes federais com recorte não delimitado e a ficha prisional da Bahia sem descrição.
2. Associar fontes primárias específicas às 11 referências provisórias, distinguindo instrumento normativo de evidência de implementação.
3. Rever classificações por inferência e situações temporais com o contexto de cada experiência.
4. Preservar IDs, slugs, proveniência e os originais; qualquer correção deve ter regra ou anotação rastreável na rota de produção autorizada.
5. Não publicar números, público ou execução de outra UF por simples troca nominal do território.

## Complemento — cruzamentos sem nome explícito do outro estado

Este complemento foi elaborado em 05/10/2026 sobre o mesmo JSON/SHA acima, após busca dirigida por 600 escolas, 151 escolas, CEEBJA/APED e Tempo Formativo. Não constitui avaliação de todas as políticas nem comprovação de ausência de oferta. As contagens iniciais continuam sendo as do levantamento anterior à aplicação das propostas.

### Ocorrências adicionais e limites

- O texto sobre 600 escolas ocorre nos resumos de BR EDU-0001, RN EDU-0339, DF EDU-0389 e PI EDU-0422. BR já está entre os 14 casos iniciais. Os outros 3 repetem o mesmo trecho; isso é fato textual. A atribuição de origem paulista resulta da comparação com a descrição e a referência paulista da ficha federal, não de uma inspeção de todo o processo de autoria.
- O número 151 foi encontrado somente no registro BR EDU-0001, já descrito. Nenhum novo caso foi criado apenas por esse número.
- CEEBJA/APED aparece em PR EDU-0074 (compatível com o território) e nos registros prisionais MA EDU-0261, AL EDU-0337, RR EDU-0388, RO EDU-0416 e TO EDU-0485. AL é o caso adicional sem menção literal a Paraná no resumo.
- Tempo Formativo/Portaria 2815/2025 aparece nas bases legais de PE EDU-0148 e PE EDU-0149. Não foi confirmada a aplicabilidade dessa portaria a Pernambuco. A inferência de origem baiana não foi tratada como fato provado; a proposta retira a referência não sustentada e registra a limitação.

#### FRM-CP-2026-EDU-0339 — RN

Slug: `educacao-de-jovens-e-adultos-eja-na-rede-estadual-rn`.

**resumo — valor original:**

```json
"Modalidade da educação básica destinada a jovens (15+) e adultos que não concluíram a escolaridade na idade regular. Presença regular (aulas presenciais em horários fixos, em 600 escolas) e presença flexível (modelo semipresencial com estudo autônomo)"
```

#### FRM-CP-2026-EDU-0389 — DF

Slug: `eja-presencial-no-distrito-federal-df`.

**resumo — valor original:**

```json
"Modalidade da educação básica destinada a jovens (15+) e adultos que não concluíram a escolaridade na idade regular. Presença regular (aulas presenciais em horários fixos, em 600 escolas) e presença flexível (modelo semipresencial com estudo autônomo)"
```

**modalidade_oferta — valor original:**

```json
"Mista"
```

**arranjo_logistico — valor original:**

```json
"Misto (fixa + itinerante)"
```

**abrangencia_territorial — valor original:**

```json
"Nacional"
```

#### FRM-CP-2026-EDU-0422 — PI

Slug: `educacao-de-jovens-e-adultos-eja-do-piaui-pi`.

**resumo — valor original:**

```json
"Modalidade da educação básica destinada a jovens (15+) e adultos que não concluíram a escolaridade na idade regular. Presença regular (aulas presenciais em horários fixos, em 600 escolas) e presença flexível (modelo semipresencial com estudo autônomo)"
```

#### FRM-CP-2026-EDU-0337 — AL

Slug: `plano-estadual-de-educacao-em-ambientes-prisionais-peesp-2025-2028-al`.

**resumo — valor original:**

```json
"Os Planos Estaduais de Educação no Sistema Prisional são elaborados de forma conjunta entre a Secretaria de Estado da Educação e a Secretaria de Estado da Justiça, com a participação ampla de representantes dos diversos segmentos sociais. Eles têm por objetivo a garantia da escolarização básica, no nível fundamental e médio, na modalidade de Educação de Jovens e Adultos (EJA) e a educação profissional às pessoas em privação de liberdade, no Sistema Penitenciário do Estado, por meio dos Centros Estaduais de Educação Básica para Jovens e Adultos (CEEBJA) e/ou Ações Pedagógicas Descentralizadas (APED)"
```

**base_legal — valor original:**

```json
"Decreto N.º 7626/2011 (instituição do Plano Estratégico de Educação no âmbito do Sistema Prisional - PEESP). Lei N.º 12.433/2011 - Altera a Lei Nº 7.210, de 11 de julho de 1984 (Lei de Execução Penal), para dispor sobre a remição de parte do tempo de execução da pena por estudo ou por trabalho e Lei N.º 19.130/2017 - Institui a diária especial por atividade extrajornada voluntária, a gratificação intra muros, e adota outras providências. Também relaciona-se com Lei de Execução Penal nº 7.210/1984, na Lei de Diretrizes e Bases da Educação Nacional nº 9.394/1996 e na Resolução CNE/CEB nº 2/2010"
```

**orgaos_responsaveis — valor original:**

```json
[
  "MEC, Secretaria de Estado da Educação (Seduc-AL) e Secretaria de Estado da Justiça e Cidadania"
]
```

#### FRM-CP-2026-EDU-0149 — PE

Slug: `eja-campo-pe`.

**base_legal — valor original:**

```json
"Lei Federal nº 9.394/1996 (LDB) (diretrizes nacionais sobre o EJA. Decreto Federal nº 7.352/ 2010 (dispõe sobre a política de educação do campo e o Programa Nacional de Educação na Reforma Agrária (Pronera)). PORTARIA n° 2815/2025 (normatização e implementação da oferta de ensino do Tempo Juvenil e Tempo Formativo). Instrução Normativa SEE nº 8, de 22 de setembro de 2020 ( principal marco regulatório estadual, que fixa diretrizes e orienta procedimentos pedagógicos para a oferta da EJA na Educação do Campo)"
```

**descricao_tecnica — valor original:**

```json
"A oferta é organizada nos princípios da Pedagogia de Alternância, contemplando Tempo Escola (atividades presenciais) e Tempo Comunidade (atividades práticas nas comunidades). As aulas ocorrem em escolas localizadas preferencialmente em espaço rural, com 35 vagas por turma e matrícula em livre demanda. A EJA Campo é destinada às populações do campo, compreendendo: Agricultores familiares; Extrativistas; Pescadores artesanais; Ribeirinhos; Assentados e acampados; Trabalhadores rurais; Caiçaras; Indígenas; Quilombolas; Povos da floresta; Povos ciganos; Demais povos que vivem no campo"
```

### Verificação primária posterior e propostas

Foram preparados dois manifestos de curadoria com valores anteriores exatos, novos valores, justificativa e referências. Nenhum deles é uma alteração direta do arquivo canônico. Todos os registros corrigidos recebem revisado_por=null e nota específica de limite; a atribuição humana original fica preservada em anterior. As URLs novas estão também em referencias[].

- `data/curadoria/propostas-dados-2026-10-05.json`:6 fichas e 51 campos (BA plano prisional/PROEJA; PA PEE; AL ENCCEJA/Escola 10/Emprega Mais).
- `data/curadoria/propostas-dados-territorio-2026-10-05.json`:8 fichas e 82 campos (BA TRAB-0117; PA EDU-0145; PE EDU-0148/0149; TO TRAB-0376; RN EDU-0339; DF EDU-0389; AL EDU-0337).
- PI EDU-0422 e os demais casos territoriais foram entregues à coordenação da rodada para integração em outros manifestos; este relatório não presume que já tenham sido aplicados.

As seguintes verificações delimitam o que pode ser afirmado:

1. **Bahia, Casa do Trabalhador:** fonte oficial de 10/04/2025 identifica Setre/MTE e inauguração de uma unidade em Salvador. Não é prova da criação de toda a rede nem de continuidade futura entre governos. [Notícia oficial](https://www.ba.gov.br/casacivil/noticias/2025-04/2679/casa-do-trabalhador-e-inaugurada-com-novos-servicos-e-suporte-aos).
2. **Pará, EMTI:** diretrizes de 2023 são especificamente da Seduc-PA. Os trechos Paraná são substituídos por finalidade documentada, sem declarar repasses ou matrículas locais atuais. [Diretrizes](https://www.seduc.pa.gov.br/site/public/upload/arquivo/emti/DiretrizesEMTI_2023_versaofinal-27-02-23-6da24.pdf).
3. **Pernambuco, EJA Campo:** DOE 23/09/2020 contém IN SEE 08/2020, com alternância Tempo Escola/Comunidade. Art.14 distingue limite de 25 estudantes no Fundamental e 35 no Médio;35 não se aplica indistintamente a todas as turmas. Essa norma histórica não demonstra vagas abertas nem resolve eventual atualização posterior. [DOE, páginas 4–6](https://cepebr-prod.s3.amazonaws.com/1/cadernos/2020/20200923/1-PoderExecutivo/PoderExecutivo(20200923).pdf).
4. **Tocantins, Conecta Trabalho:** órgão original é acreano e a fonte primária encontrada descreve lançamento no Acre em 18/03/2026. Não se encontrou correspondência tocantinense nesta revisão delimitada. Proposta mantém ID/slug/UF, explicita dúvida e situação Sem informação; não converte falta de confirmação em inexistência. [Fonte do Acre](https://agencia.ac.gov.br/estado-lanca-projeto-conecta-trabalho-para-fortalecer-geracao-de-empregos-e-aproximar-empresas-e-trabalhadores/).
5. **RN:** texto indexado do DOE 23/12/2025 contém Portaria-SEI 11041/2025, matrícula contínua e idades 15/18. Substitui resumo 600 escolas; não revalida todos os quantitativos e mecanismos financeiros remanescentes. [DOE-RN](https://webdisk.diariooficial.rn.gov.br/Jornal/12025-12-23.pdf).
6. **DF:** carta de serviços distingue presencial e EaD; a proposta é restrita à presencial e não estende automaticamente 105 unidades do conjunto da EJA a esse recorte. As páginas consultadas datam 2024/2025 e não demonstram disponibilidade atual. [Carta](https://www.educacao.df.gov.br/carta-de-servicos-educacao-especializada/), [listagem](https://www.educacao.df.gov.br/eja-2/).
7. **AL prisional:** capa 2024, período 2025–2028, Seduc/Seris. Retira nomes organizacionais paranaenses e Lei 19.130/2017. Plano inclui a Resolução CEE/AL 02/2014; metas não equivalem a resultados. [Plano AL](https://www.gov.br/senappen/pt-br/acesso-a-informacao/politicas-acoes-e-programas/politicas-penais/educacao/2025-2028/al.pdf). A lei 19.130/2017 é paranaense e trata de diária extrajornada/gratificação, conforme [texto na AssembleiaPR](https://storage.assembleia.pr.leg.br/ccj/4MhcBtuJgA0CMc5fHifrKLaVpkC2Fp6ryqiG4t7t.pdf).
8. **Plano histórico BA:** foi localizado documento posterior na pasta SENAPPEN 2025–2028. O próprio PDF afirma vigência 2025–2029 na primeira página. A proposta mantém a ficha 2021–2024 e registra essa divergência, sem inferir prorrogação nem cumprimento das metas. [Plano posterior](https://www.gov.br/senappen/pt-br/acesso-a-informacao/politicas-acoes-e-programas/politicas-penais/educacao/2025-2028/ba.pdf).

### Limites de acesso e revisão

Consulta de conteúdo oficial indexado não equivale a GET bem-sucedido ou URL estável. Algumas páginas foram legíveis em resultados indexados, mas a abertura pelo navegador de pesquisa retornou erro interno/cachemiss (entre elas, páginas SEEDF e notícia SEE-PE). A auditoria HTTP da rodada, realizada separadamente, deve registrar o acesso real e redirecionamentos, sem transformar erro de acesso em encerramento da política. Não houve recaptura massiva ou geração de snapshots nesta frente.

As propostas corrigem divergências identificadas e delimitam fontes; não certificam todos os campos restantes. Em particular, RN retém quantitativos/carga/financiamento do levantamento fora do trecho corrigido; PE mantém classificações de modalidade/arranjo pendentes; DF mantém relações com órgãos/programas não revalidadas. PROEJA teve removidos o financiamento PEJA, o fluxo SiGPC/prazo e a carga generalizada sem confirmação específica. PEE-PA teve retirada a afirmação genérica de continuidade diante da falta de confirmação de prorrogação.
