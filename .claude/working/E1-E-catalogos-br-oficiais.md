# E.1.E — Catálogos brasileiros oficiais (avaliador adicional)

> Output do avaliador consensual adicional, com lente "padrões brasileiros oficiais — LAI, LGPD, eMAG, gov.br". Sites: Portal da Transparência (portaltransparencia.gov.br), dados.gov.br (CKAN), INEP (inep.gov.br), Câmara dos Deputados (camara.leg.br), Senado Federal (senado.leg.br), portais estaduais (SP, MG, RJ, BA, PE).

## 5 padrões brasileiros a importar

### 1. Lei 12.527/2011 (LAI) — visibilidade explícita
- Portais governamentais brasileiros têm **link "Acesso à Informação" sempre visível** (header ou footer).
- Compromisso público com transparência.

**Aplicar ao FRM:** página `/sobre/transparencia` com:
- Política de revisão (semestral)
- Histórico de versões do catálogo
- Registro de erros corrigidos (changelog visível)
- Canal de "achei um erro / sugiro inclusão"

### 2. CKAN compatibility — formato dados.gov.br
- Padrão **CKAN** (Comprehensive Knowledge Archive Network) é o formato canônico para dados abertos no Brasil.
- Schema DCAT-AP-BR (extensão brasileira do DCAT-AP europeu).
- Permite federação automática com dados.gov.br.

**Aplicar ao FRM:**
- Endpoint `/api/dataset.json` no formato CKAN/DCAT-AP-BR.
- Permite que o catálogo seja indexado em dados.gov.br futuramente (Bloco G).
- Schema-mapping: `politica` → `dataset` CKAN.

### 3. Vocabulário federalizado — alinhar termos
- Câmara/Senado usam taxonomia oficial: "Lei", "Decreto", "Portaria", "Instrução Normativa", "Resolução", "Medida Provisória".
- INEP usa taxonomias para níveis de ensino, modalidades, situações.

**Aplicar ao FRM:** vocabulario-canonico.json (já existe) deve ser **conferido contra**:
- Taxonomia legislativa Câmara: <camara.leg.br/proposicoesWeb/fichadetramitacao>
- Vocabulário INEP: <inep.gov.br/dados/dicionarios>

Se houver divergência, usar termo oficial federal como canônico.

### 4. eMAG + Lei 13.146/2015 + VLibras
- **eMAG** (Modelo de Acessibilidade em Governo Eletrônico) — versão brasileira do WCAG, mais detalhada para PT-BR.
- **VLibras** (vlibras.gov.br) — widget gratuito de tradução automática para Libras, usado em todos portais .gov.br.

**Aplicar ao FRM:**
- Conformidade declarada com eMAG 3.1 + WCAG 2.2 AA.
- Widget VLibras integrado (componente livre, fácil de adicionar).
- Página `/sobre/acessibilidade` declarando conformidade.

### 5. Padrão de URL gov.br
- Subdomínio por órgão: `educacao.gov.br`, `saude.gov.br`.
- URL canônica única (sem proliferação de subdomínios secundários).
- HTTPS obrigatório.
- Sem `?utm_*` em links internos.

**Aplicar ao FRM:**
- URL canônica única (não subdomínios para EDU/TRAB/etc).
- HTTPS obrigatório.

## Paleta institucional gov.br (alternativa à FRM/IESP)

Identidade visual gov.br oficial:
- Azul primário: **#1351b4** (gov.br azul)
- Verde sucesso: **#168821** (gov.br verde)
- Amarelo aviso: **#FFCD07**
- Vermelho erro: **#E52207**
- Cinza escuro: **#333333**

**Decisão pendente:** usar paleta gov.br (alinhamento brasileiro forte) vs paleta gov.uk-inspired (cosmopolita) vs paleta FRM/IESP-UERJ (institucional acadêmica). Sub-checkpoint em E.5.

## Top 5 padrões brasileiros a importar

1. **LAI** — link "Acesso à Informação" + página `/sobre/transparencia` com changelog.
2. **CKAN/DCAT-AP-BR** — endpoint `/api/dataset.json` para federação futura com dados.gov.br.
3. **Vocabulário federalizado** — conferir vocabulário-canonico contra Câmara/INEP.
4. **eMAG + VLibras** — widget Libras + conformidade declarada.
5. **URL canônica única** — não fragmentar em subdomínios.

## Top 3 anti-padrões a evitar (especialmente catálogos estaduais)

1. **Mistura HTTP+HTTPS** (alguns portais estaduais ainda) — só HTTPS.
2. **Cookies sem aviso LGPD** — banner obrigatório, opt-in para não-essenciais.
3. **Termos de uso ausentes** — página `/sobre/termos` obrigatória + licença CC-BY 4.0 visível.

## Compliance LGPD — implicações concretas

A Lei Geral de Proteção de Dados (Lei 13.709/2018) **exige**:
- Banner de cookies com opt-in granular para não-essenciais (analytics, marketing).
- Página de Política de Privacidade detalhada.
- Encarregado de Dados (DPO) declarado se houver tratamento sistemático.
- Direito de acesso/correção/exclusão para visitantes identificáveis.

**Implicação para o catálogo:**
- Se houver **analytics** (Google Analytics, Plausible, Matomo) → banner LGPD obrigatório.
- Se for **só estático sem analytics** → banner não obrigatório (mas Política de Privacidade ainda recomendada).
- **Não coletar dados pessoais no MVP** (sem cadastro, sem comments, sem alerts) elimina muito risco.