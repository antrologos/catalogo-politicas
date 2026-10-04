# Revisão para a equipe de pesquisa — outubro de 2026

Lista de pontos do catálogo que dependem de conferência humana. O site e os dados já estão consistentes com o vocabulário oficial; os itens abaixo são **decisões tomadas por regra ou por inferência** que a equipe deve confirmar ou corrigir **na planilha-fonte** (a próxima execução do ETL propaga a correção).

Gerado em 2026-10-04 a partir de `data/derived/latest.json`. Cada nome leva à ficha publicada.

## 1. Campos preenchidos com valor de outro campo

O valor não descreve o campo e foi publicado como **Sem informação**. Corrigir na planilha com o valor certo.

| UF | Política | Campo | Valor na planilha |
|---|---|---|---|
| PE | [Exame Supletivo Anual – Pernambuco](https://antrologos.github.io/catalogo-politicas/politica/exame-supletivo-anual-pernambuco-pe/) | Tipo de oferta | Presencial |
| PE | [Exame Supletivo Anual – Pernambuco](https://antrologos.github.io/catalogo-politicas/politica/exame-supletivo-anual-pernambuco-pe/) | Modalidade | Unidade fixa / oferta fixa |
| ES | [Estado Presente – eixo de inclusão social de jovens](https://antrologos.github.io/catalogo-politicas/politica/estado-presente-eixo-de-inclusao-social-de-jovens-es/) | Arranjo logístico | Territorializada (priorização de áreas vulneráveis) |
| RN | [Plano Estadual de Educação em Ambientes Prisionais RN (2015-2024)](https://antrologos.github.io/catalogo-politicas/politica/plano-estadual-de-educacao-em-ambientes-prisionais-rn-2015-2024-rn/) | Tipo de oferta | . |
| RR | [Plano Estadual de Educação (PEE)](https://antrologos.github.io/catalogo-politicas/politica/plano-estadual-de-educacao-pee-rr/) | Arranjo logístico | Mista (múltiplas modalidades sem predominância clara |
| DF | [ProJovem Urbano e Campo](https://antrologos.github.io/catalogo-politicas/politica/projovem-urbano-e-campo-df/) | Situação atual | Situação variável por modalidade |

## 2. Classificações decididas por inferência

| UF | Política | Campo | Valor na planilha | Publicado como | Motivo |
|---|---|---|---|---|---|
| DF | [ProJovem Urbano e Campo](https://antrologos.github.io/catalogo-politicas/politica/projovem-urbano-e-campo-df/) | Tipo de política | Misto | Proteção social com impacto educacional | mesma classificação do ProJovem federal |
| PI | [Qualifica Piauí](https://antrologos.github.io/catalogo-politicas/politica/qualifica-piaui-pi/) | Modalidade | Itinerante (equipes/unidades móveis; ações em comunidades) | Presencial | oferta em carretas-escola e espaços municipais |

**Arranjo logístico "Misto (…)" com descrição livre** (13 fichas): publicados como *Misto (fixa + itinerante)*, a única opção mista do dicionário. Confirmar se a descrição cabe nessa categoria; se não, a equipe pode propor uma categoria nova no dicionário.

| UF | Política | Valor na planilha |
|---|---|---|
| GO | [Educação de Jovens e Adultos (EJA) – Goiás](https://antrologos.github.io/catalogo-politicas/politica/educacao-de-jovens-e-adultos-eja-goias-go/) | Misto (fixa + polos/ofertas semipresenciais) |
| GO | [EJATec](https://antrologos.github.io/catalogo-politicas/politica/ejatec-go/) | Misto (polos fixos + ambiente virtual) |
| GO | [Goiás Tec – Ensino Médio ao Alcance de Todos](https://antrologos.github.io/catalogo-politicas/politica/goias-tec-ensino-medio-ao-alcance-de-todos-go/) | Misto (unidade fixa + mediação tecnológica) |
| GO | [Bolsa Futuro](https://antrologos.github.io/catalogo-politicas/politica/bolsa-futuro-go/) | Misto (fixa + polos/ofertas descentralizadas) |
| GO | [Escolas do Futuro do Estado de Goiás (EFG)](https://antrologos.github.io/catalogo-politicas/politica/escolas-do-futuro-do-estado-de-goias-efg-go/) | Misto (unidades fixas + ofertas presenciais e a distância, conforme curso) |
| GO | [Colégios Tecnológicos do Estado de Goiás (COTEC)](https://antrologos.github.io/catalogo-politicas/politica/colegios-tecnologicos-do-estado-de-goias-cotec-go/) | Misto (unidades fixas + ofertas descentralizadas/polos, conforme curso) |
| ES | [Educação de Jovens e Adultos (EJA) – Espírito Santo](https://antrologos.github.io/catalogo-politicas/politica/educacao-de-jovens-e-adultos-eja-espirito-santo-es/) | Misto (unidades fixas + arranjos flexíveis de oferta) |
| ES | [Centros Estaduais de Educação de Jovens e Adultos (CEEJAs)](https://antrologos.github.io/catalogo-politicas/politica/centros-estaduais-de-educacao-de-jovens-e-adultos-ceejas-es/) | Misto (centros fixos + apoio tecnológico/material impresso) |
| ES | [Núcleos Estaduais de Educação de Jovens e Adultos (NEEJAs)](https://antrologos.github.io/catalogo-politicas/politica/nucleos-estaduais-de-educacao-de-jovens-e-adultos-neejas-es/) | Misto (escola-sede + apoio tecnológico/material impresso) |
| ES | [Certificação e regularização escolar da EJA (serviços estaduais)](https://antrologos.github.io/catalogo-politicas/politica/certificacao-e-regularizacao-escolar-da-eja-servicos-estaduais-es/) | Misto (CEEJAs + superintendências regionais + atendimento administrativo) |
| ES | [Qualificar ES](https://antrologos.github.io/catalogo-politicas/politica/qualificar-es-es/) | Misto (ofertas on-line + turmas presenciais descentralizadas) |
| ES | [Programa Incluir – eixo Mundo do Trabalho / inclusão produtiva](https://antrologos.github.io/catalogo-politicas/politica/programa-incluir-eixo-mundo-do-trabalho-inclusao-produtiva-es/) | Misto (execução municipal cofinanciada + articulação intersetorial) |
| ES | [Nossocrédito](https://antrologos.github.io/catalogo-politicas/politica/nossocredito-es/) | Misto (rede territorial de agentes + atendimento local) |

## 3. Políticas com situação "Sem informação" (1)

| UF | Política | Valor na planilha |
|---|---|---|
| DF | [ProJovem Urbano e Campo](https://antrologos.github.io/catalogo-politicas/politica/projovem-urbano-e-campo-df/) | Situação variável por modalidade |

## 4. Políticas sem link para a fonte oficial (11)

A planilha não traz link (nem na base legal ou nas informações complementares). A ficha mostra "fonte oficial não identificada no levantamento".

| UF | Política |
|---|---|
| BR | [Programa Emprega + Mulheres e Jovens](https://antrologos.github.io/catalogo-politicas/politica/programa-emprega-mulheres-e-jovens-br/) |
| BA | [Plano Estadual de Educação para Pessoas Privadas de Liberdade e Egressas do Sistema Prisional Bahia (2021-2024)](https://antrologos.github.io/catalogo-politicas/politica/plano-estadual-de-educacao-para-pessoas-privadas-de-liberdade-e-egressas-do-sistema-prisional-bahia-2021-2024-ba/) |
| BA | [Programa Nacional de Integração da Educação Profissional com a Educação Básica (PROEJA)](https://antrologos.github.io/catalogo-politicas/politica/programa-nacional-de-integracao-da-educacao-profissional-com-a-educacao-basica-proeja-ba/) |
| PA | [Plano Estadual de Educação do Pará (PEE)](https://antrologos.github.io/catalogo-politicas/politica/plano-estadual-de-educacao-do-para-pee-pa/) |
| ES | [Programa Empodera+ (Programa de Trabalho Digno, Educação e Geração de Renda para Pessoas LGBTQIA+)](https://antrologos.github.io/catalogo-politicas/politica/programa-empodera-programa-de-trabalho-digno-educacao-e-geracao-de-renda-para-pessoas-lgbtqia-es/) |
| ES | [Estado Presente – eixo de inclusão social de jovens](https://antrologos.github.io/catalogo-politicas/politica/estado-presente-eixo-de-inclusao-social-de-jovens-es/) |
| AL | [Exame Nacional para Certificação de Competências de Jovens e Adultos (ENCCEJA) - Alagoas](https://antrologos.github.io/catalogo-politicas/politica/exame-nacional-para-certificacao-de-competencias-de-jovens-e-adultos-encceja-alagoas-al/) |
| AL | [Programa Escola 10](https://antrologos.github.io/catalogo-politicas/politica/programa-escola-10-al/) |
| AL | [Emprega Mais Alagoas](https://antrologos.github.io/catalogo-politicas/politica/emprega-mais-alagoas-al/) |
| RR | [Formação continuada de profissionais da educação](https://antrologos.github.io/catalogo-politicas/politica/formacao-continuada-de-profissionais-da-educacao-rr/) |
| SE | [Núcleo de Apoio ao Trabalho (NAT)/ SINE](https://antrologos.github.io/catalogo-politicas/politica/nucleo-de-apoio-ao-trabalho-nat-sine-se/) |

## 5. Fonte oficial inacessível na verificação de 04/10/2026 (78)

Links das fichas que não responderam na rodada de validação (`links-validados-onda-1-2026-10-04-final.csv`). Vários são bloqueios de robôs (403) em portais gov.br que abrem normalmente no navegador; vale conferir manualmente e atualizar o link na planilha quando ele tiver mudado (404).

| UF | Política | Status |
|---|---|---|
| PE | [SEJA Pro+ Trabalho e Emprego](https://antrologos.github.io/catalogo-politicas/politica/seja-pro-trabalho-e-emprego-pe/) | bloqueado_robots |
| PB | [Sistema Nacional de Emprego (SINE) - PB](https://antrologos.github.io/catalogo-politicas/politica/sistema-nacional-de-emprego-sine-pb-pb/) | bloqueado_robots |
| AL | [Programa Escola 10 – Vem que Dá Tempo](https://antrologos.github.io/catalogo-politicas/politica/programa-escola-10-vem-que-da-tempo-al/) | bloqueado_robots |
| AL | [Qualifica Educação](https://antrologos.github.io/catalogo-politicas/politica/qualifica-educacao-al/) | bloqueado_robots |
| AC | [Instituto Estadual de Educação Profissional e Tecnológica Ieptec/Dom Moacyr](https://antrologos.github.io/catalogo-politicas/politica/instituto-estadual-de-educacao-profissional-e-tecnologica-ieptec-dom-moacyr-ac/) | client_err_405 |
| BR | [Programa Nacional de Integração da Educação Profissional com a Educação Básica na Modalidade de Educação de Jovens e Adultos (PROEJA)](https://antrologos.github.io/catalogo-politicas/politica/programa-nacional-de-integracao-da-educacao-profissional-com-a-educacao-basica-na-modalidade-de-educacao-de-jovens-br/) | erro_rede |
| BR | [Programa Ensino Médio Inovador (ProEmi)](https://antrologos.github.io/catalogo-politicas/politica/programa-ensino-medio-inovador-proemi-br/) | erro_rede |
| BR | [Programa Ensino Médio Inovador/Jovem de Futuro (ProEMI/JF)](https://antrologos.github.io/catalogo-politicas/politica/programa-ensino-medio-inovador-jovem-de-futuro-proemi-jf-br/) | erro_rede |
| RJ | [Ensino Médio Inovador](https://antrologos.github.io/catalogo-politicas/politica/ensino-medio-inovador-rj/) | erro_rede |
| PR | [Programa Nacional de Integração da Educação Profissional com a Educação Básica na EJA (PROEJA)](https://antrologos.github.io/catalogo-politicas/politica/programa-nacional-de-integracao-da-educacao-profissional-com-a-educacao-basica-na-eja-proeja-pr/) | erro_rede |
| PR | [Ensino Médio Inovador](https://antrologos.github.io/catalogo-politicas/politica/ensino-medio-inovador-pr/) | erro_rede |
| PE | [Programa Nacional de Integração da Educação Profissional com a Educação Básica na Modalidade EJA (PROEJA)](https://antrologos.github.io/catalogo-politicas/politica/programa-nacional-de-integracao-da-educacao-profissional-com-a-educacao-basica-na-modalidade-eja-proeja-pe/) | erro_rede |
| CE | [EJA semipresencial – Centros de Educação de Jovens e Adultos (CEJAs)](https://antrologos.github.io/catalogo-politicas/politica/eja-semipresencial-centros-de-educacao-de-jovens-e-adultos-cejas-ce/) | erro_rede |
| CE | [Projeto Professor Diretor de Turma (PPDT)](https://antrologos.github.io/catalogo-politicas/politica/projeto-professor-diretor-de-turma-ppdt-ce/) | erro_rede |
| CE | [Programa Nacional de Integração da Educação Profissional com a Educação Básica na EJA (PROEJA)](https://antrologos.github.io/catalogo-politicas/politica/programa-nacional-de-integracao-da-educacao-profissional-com-a-educacao-basica-na-eja-proeja-ce/) | erro_rede |
| GO | [Busca Ativa: Acolher para Permanecer](https://antrologos.github.io/catalogo-politicas/politica/busca-ativa-acolher-para-permanecer-go/) | erro_rede |
| AM | [1º Plano Municipal de Políticas Públicas para Migração, Refúgio e Apátrida do Amazonas](https://antrologos.github.io/catalogo-politicas/politica/1o-plano-municipal-de-politicas-publicas-para-migracao-refugio-e-apatrida-do-amazonas-am/) | erro_rede |
| AM | [Programa Manuel Querino de Qualificação Social e Profissional (PMQ)](https://antrologos.github.io/catalogo-politicas/politica/programa-manuel-querino-de-qualificacao-social-e-profissional-pmq-am/) | erro_rede |
| MT | [Educação de Jovens e Adultos (EJA) – Mato Grosso](https://antrologos.github.io/catalogo-politicas/politica/educacao-de-jovens-e-adultos-eja-mato-grosso-mt/) | erro_rede |
| MT | [Exame Certificador de EJA (ECEJA / Certifica Mais MT)](https://antrologos.github.io/catalogo-politicas/politica/exame-certificador-de-eja-eceja-certifica-mais-mt-mt/) | erro_rede |
| MT | [Centros de Educação de Jovens e Adultos (CEJAs) – Mato Grosso](https://antrologos.github.io/catalogo-politicas/politica/centros-de-educacao-de-jovens-e-adultos-cejas-mato-grosso-mt/) | erro_rede |
| MT | [SER Família Capacita](https://antrologos.github.io/catalogo-politicas/politica/ser-familia-capacita-mt/) | erro_rede |
| MT | [Escolas Técnicas Estaduais / rede da Seciteci-MT](https://antrologos.github.io/catalogo-politicas/politica/escolas-tecnicas-estaduais-rede-da-seciteci-mt-mt/) | erro_rede |
| MT | [Plano Estadual de Educação para Pessoas Privadas de Liberdade (PEEP) do Mato Grosso (2025-2028)](https://antrologos.github.io/catalogo-politicas/politica/plano-estadual-de-educacao-para-pessoas-privadas-de-liberdade-peep-do-mato-grosso-2025-2028-mt/) | erro_rede |
| RN | [PROEJA / EJA-EPT no IFRN](https://antrologos.github.io/catalogo-politicas/politica/proeja-eja-ept-no-ifrn-rn/) | erro_rede |
| RN | [Instituto Estadual de Educação Profissional, Tecnologia e Inovação do RN  (IERN)](https://antrologos.github.io/catalogo-politicas/politica/instituto-estadual-de-educacao-profissional-tecnologia-e-inovacao-do-rn-iern-rn/) | erro_rede |
| DF | [EJA a distância no Distrito Federal](https://antrologos.github.io/catalogo-politicas/politica/eja-a-distancia-no-distrito-federal-df/) | erro_rede |
| DF | [EJA integrada à Educação Profissional e Tecnológica no DF](https://antrologos.github.io/catalogo-politicas/politica/eja-integrada-a-educacao-profissional-e-tecnologica-no-df-df/) | erro_rede |
| DF | [Programa DF Alfabetizado](https://antrologos.github.io/catalogo-politicas/politica/programa-df-alfabetizado-df/) | erro_rede |
| DF | [Programa Atitude](https://antrologos.github.io/catalogo-politicas/politica/programa-atitude-df/) | erro_rede |
| AC | [Conecta Trabalho](https://antrologos.github.io/catalogo-politicas/politica/conecta-trabalho-ac/) | erro_rede |
| BR | [Programa Brasil Alfabetizado](https://antrologos.github.io/catalogo-politicas/politica/programa-brasil-alfabetizado-br/) | forbidden_403 |
| BR | [Consórcio Social da Juventude](https://antrologos.github.io/catalogo-politicas/politica/consorcio-social-da-juventude-br/) | forbidden_403 |
| RJ | [Programa Brasil Alfabetizado (PBA)](https://antrologos.github.io/catalogo-politicas/politica/programa-brasil-alfabetizado-pba-rj/) | forbidden_403 |
| RJ | [Programa Primeiro Emprego Para Jovens Estudantes (PPE-RJ)](https://antrologos.github.io/catalogo-politicas/politica/programa-primeiro-emprego-para-jovens-estudantes-ppe-rj-rj/) | forbidden_403 |
| BA | [EMITec – Programa de Ensino Médio com Intermediação Tecnológica (Bahia)](https://antrologos.github.io/catalogo-politicas/politica/emitec-programa-de-ensino-medio-com-intermediacao-tecnologica-bahia-ba/) | forbidden_403 |
| BA | [Programa Educar para Trabalhar](https://antrologos.github.io/catalogo-politicas/politica/programa-educar-para-trabalhar-ba/) | forbidden_403 |
| PA | [Política Estadual para Migrantes, Refugiados e Apátridas do Pará (2022)](https://antrologos.github.io/catalogo-politicas/politica/politica-estadual-para-migrantes-refugiados-e-apatridas-do-para-2022-pa/) | forbidden_403 |
| CE | [Programa Ceará Educa Mais](https://antrologos.github.io/catalogo-politicas/politica/programa-ceara-educa-mais-ce/) | forbidden_403 |
| TO | [Bolsa Presente, Profe!](https://antrologos.github.io/catalogo-politicas/politica/bolsa-presente-profe-to/) | forbidden_403 |
| AP | [Novo Amapá Jovem](https://antrologos.github.io/catalogo-politicas/politica/novo-amapa-jovem-ap/) | forbidden_403 |
| AP | [Qualifica Amapá](https://antrologos.github.io/catalogo-politicas/politica/qualifica-amapa-ap/) | forbidden_403 |
| BR | [Programa Nacional de Acesso ao Ensino Técnico e Emprego (PRONATEC)](https://antrologos.github.io/catalogo-politicas/politica/programa-nacional-de-acesso-ao-ensino-tecnico-e-emprego-pronatec-br/) | not_found_404 |
| SP | [Centros Estaduais de Educação de Jovens e Adultos (CEEJA)](https://antrologos.github.io/catalogo-politicas/politica/centros-estaduais-de-educacao-de-jovens-e-adultos-ceeja-sp/) | not_found_404 |
| SP | [Via Rápida Emprego](https://antrologos.github.io/catalogo-politicas/politica/via-rapida-emprego-sp/) | not_found_404 |
| RJ | [PRONATEC (Programa Nacional de Acesso ao Ensino Técnico e Emprego)](https://antrologos.github.io/catalogo-politicas/politica/pronatec-programa-nacional-de-acesso-ao-ensino-tecnico-e-emprego-rj/) | not_found_404 |
| BA | [Projeto Conectar – Qualificação e Trabalho](https://antrologos.github.io/catalogo-politicas/politica/projeto-conectar-qualificacao-e-trabalho-ba/) | not_found_404 |
| SC | [Programa Avança Mais](https://antrologos.github.io/catalogo-politicas/politica/programa-avanca-mais-sc/) | not_found_404 |
| SC | [Qualifica SC](https://antrologos.github.io/catalogo-politicas/politica/qualifica-sc-sc/) | not_found_404 |
| AM | [Plano Estadual de Educação para Pessoas Privadas de Liberdade (PEEP) do Amazonas  (2025-2028)](https://antrologos.github.io/catalogo-politicas/politica/plano-estadual-de-educacao-para-pessoas-privadas-de-liberdade-peep-do-amazonas-2025-2028-am/) | not_found_404 |
| AM | [Aula em Casa](https://antrologos.github.io/catalogo-politicas/politica/aula-em-casa-am/) | not_found_404 |
| AM | [Programa de Aceleração do Desenvolvimento da Educação do Amazonas (Padeam)](https://antrologos.github.io/catalogo-politicas/politica/programa-de-aceleracao-do-desenvolvimento-da-educacao-do-amazonas-padeam-am/) | not_found_404 |
| AM | [Casa do Trabalhador em Manaus](https://antrologos.github.io/catalogo-politicas/politica/casa-do-trabalhador-em-manaus-am/) | not_found_404 |
| RN | [Aprendizagem Profissional (Jovem Aprendiz) APRENDIZ RN](https://antrologos.github.io/catalogo-politicas/politica/aprendizagem-profissional-jovem-aprendiz-aprendiz-rn-rn/) | not_found_404 |
| RR | [Programa Alfabetiza Roraima](https://antrologos.github.io/catalogo-politicas/politica/programa-alfabetiza-roraima-rr/) | not_found_404 |
| RR | [Plano Estadual de Educação em Ambientes Prisionais (PEESP) - 2025-2028](https://antrologos.github.io/catalogo-politicas/politica/plano-estadual-de-educacao-em-ambientes-prisionais-peesp-2025-2028-rr/) | not_found_404 |
| RO | [Programa Estadual de Correção de Fluxo Escolar – "Integrar para Concluir com Avanço"](https://antrologos.github.io/catalogo-politicas/politica/programa-estadual-de-correcao-de-fluxo-escolar-integrar-para-concluir-com-avanco-ro/) | not_found_404 |
| RO | [Plano Estadual de Educação (PEE)](https://antrologos.github.io/catalogo-politicas/politica/plano-estadual-de-educacao-pee-ro/) | not_found_404 |
| RO | [Plano Estadual de Educação em Ambientes Prisionais (PEESP) - 2025-2028](https://antrologos.github.io/catalogo-politicas/politica/plano-estadual-de-educacao-em-ambientes-prisionais-peesp-2025-2028-ro/) | not_found_404 |
| RO | [Escola do Novo Tempo](https://antrologos.github.io/catalogo-politicas/politica/escola-do-novo-tempo-ro/) | not_found_404 |
| PI | [Educação de Jovens e Adultos (EJA) do Piauí](https://antrologos.github.io/catalogo-politicas/politica/educacao-de-jovens-e-adultos-eja-do-piaui-pi/) | not_found_404 |
| PI | [Alfabetiza Piauí / Bolsa Alfabetiza](https://antrologos.github.io/catalogo-politicas/politica/alfabetiza-piaui-bolsa-alfabetiza-pi/) | not_found_404 |
| PB | [EJA semipresencial da Paraíba](https://antrologos.github.io/catalogo-politicas/politica/eja-semipresencial-da-paraiba-pb/) | server_err_500 |
| GO | [Aprendiz do Futuro](https://antrologos.github.io/catalogo-politicas/politica/aprendiz-do-futuro-go/) | server_err_503 |
| BR | [Programa Nacional de Inclusão de Jovens (ProJovem)](https://antrologos.github.io/catalogo-politicas/politica/programa-nacional-de-inclusao-de-jovens-projovem-br/) | timeout |
| BR | [Programa Nacional de Estímulo ao Primeiro Emprego (PNPE)](https://antrologos.github.io/catalogo-politicas/politica/programa-nacional-de-estimulo-ao-primeiro-emprego-pnpe-br/) | timeout |
| BR | [Lei da Liberdade Econômica](https://antrologos.github.io/catalogo-politicas/politica/lei-da-liberdade-economica-br/) | timeout |
| BR | [Cadastro da EJA (CADEJA)](https://antrologos.github.io/catalogo-politicas/politica/cadastro-da-eja-cadeja-br/) | timeout |
| RS | [Pacto Nacional pela Superação do Analfabetismo e Qualificação da EJA (Pacto EJA)](https://antrologos.github.io/catalogo-politicas/politica/pacto-nacional-pela-superacao-do-analfabetismo-e-qualificacao-da-eja-pacto-eja-rs/) | timeout |
| RS | [Programa Brasil Alfabetizado (PBA)](https://antrologos.github.io/catalogo-politicas/politica/programa-brasil-alfabetizado-pba-rs/) | timeout |
| RS | [Pronatec (Programa Nacional de Acesso ao Ensino Técnico e Emprego)](https://antrologos.github.io/catalogo-politicas/politica/pronatec-programa-nacional-de-acesso-ao-ensino-tecnico-e-emprego-rs/) | timeout |
| RR | [Cadastro do EJA (CadEJA)](https://antrologos.github.io/catalogo-politicas/politica/cadastro-do-eja-cadeja-rr/) | timeout |
| DF | [RenovaDF](https://antrologos.github.io/catalogo-politicas/politica/renovadf-df/) | timeout |
| DF | [Fábrica Social](https://antrologos.github.io/catalogo-politicas/politica/fabrica-social-df/) | timeout |
| DF | [Agências do Trabalhador do Distrito Federal](https://antrologos.github.io/catalogo-politicas/politica/agencias-do-trabalhador-do-distrito-federal-df/) | timeout |
| DF | [QualificaDF](https://antrologos.github.io/catalogo-politicas/politica/qualificadf-df/) | timeout |
| RO | [Cadastro do EJA (CadEJA)](https://antrologos.github.io/catalogo-politicas/politica/cadastro-do-eja-cadeja-ro/) | timeout |
| TO | [Cadastro do EJA (CadEJA)](https://antrologos.github.io/catalogo-politicas/politica/cadastro-do-eja-cadeja-to/) | timeout |

