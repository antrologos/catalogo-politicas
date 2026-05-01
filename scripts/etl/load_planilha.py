"""C.1.a — Loader resiliente da planilha-fonte.

Lê todas as 11 abas de `data/raw/Fichas das Políticas - 1ª onda.xlsx`,
normaliza cabeçalhos (Id/ID/Coluna 1 → id_planilha; Link/Link oficial → link;
Dúvidas/Dúvida → duvidas_revisor; remove instrução
'(Verificar planilha Categorias)' embutida em headers de RS/BA/PE/CE),
remove colunas-fantasma vazias (RS: 3, PA: 4), adiciona coluna `uf` e
`aba_origem` por linha, e salva CSV bruto unificado em
`data/derived/_intermediate/raw_planilha.csv` para o próximo passo
(normalize.py).

Convenções: ver @.claude/rules/pipeline-python-etl.md
Schema canônico de saída: nomes internos snake_case ASCII (não os nomes
finais do schema — esses são aplicados em build_json.py).
"""
from __future__ import annotations

import re
import sys
import unicodedata
import warnings
from pathlib import Path

import pandas as pd

warnings.filterwarnings("ignore", category=UserWarning, module="openpyxl")

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
RAW_XLSX = ROOT / "data" / "raw" / "Fichas das Políticas - 1ª onda.xlsx"
OUT_CSV = ROOT / "data" / "derived" / "_intermediate" / "raw_planilha.csv"

# ─── Mapeamento aba → UF ────────────────────────────────────────────────
ABA_UF: dict[str, str | None] = {
    "Modelo categorias": None,                       # dicionário humano; pular
    "Políticas federais (comuns a to": "BR",          # nome truncado pelo Excel
    " Planilha SP": "SP",                             # espaço inicial!
    " Planilha RJ": "RJ",                             # espaço inicial!
    "Planilha MG": "MG",
    "Planilha Paraná": "PR",
    "Planilha Rio Grande do Sul": "RS",
    "Planilha Bahia": "BA",
    " Planilha Pará": "PA",                           # espaço inicial!
    "Planilha Pernambuco": "PE",
    "Planilha Ceará": "CE",
}

# ─── Mapeamento cabeçalho normalizado → nome canônico interno ────────────
# Chave: cabeçalho lowercased + ASCII (sem acentos) + sem instruções de revisor
HEADER_MAP: dict[str, str] = {
    "id": "id_planilha",
    "coluna 1": "id_planilha",                        # BA, PE têm col 1 quebrada
    "nome do programa": "nome",
    "nome do programa/politica": "nome",              # variante RJ
    "tipo de politica": "tipo_politica",
    "esfera de formulacao da politica": "esfera_formulacao",
    "origem da proposta/ diretriz": "origem_proposta",
    "origem da proposta/diretriz": "origem_proposta",
    "esfera da formulacao da politica detalhamento": "esfera_formulacao_detalhamento",
    "esfera da formulacao da politica - detalhamento": "esfera_formulacao_detalhamento",
    "esfera de execucao da politica": "esfera_execucao",
    "esfera de execucao da politica (apoios e parcerias)": "esfera_execucao_apoios_parcerias",
    "fonte de financiamento": "fonte_financiamento",
    "transferencia de recursos": "transferencia_recursos",
    "orgao(s) responsavel(eis)": "orgaos_responsaveis_resumo",
    "orgao (s) responsavel (eis)": "orgaos_responsaveis_resumo",
    "orgao(s) responsavel(s) com especificacoes": "orgaos_responsaveis_detalhe",
    "orgao(s) responsavel(is) com especificacoes": "orgaos_responsaveis_detalhe",
    "orgao (s) responsavel (s) com especificacoes": "orgaos_responsaveis_detalhe",
    "ano de criacao do programa": "ano_criacao",
    "situacao atual": "situacao_atual",
    "base legal": "base_legal",
    "abrangencia territorial": "abrangencia_territorial",
    "resumo": "resumo",
    "apresentacao": "apresentacao",
    "tipo de oferta": "tipo_oferta",
    "modalidade da oferta": "modalidade_oferta",
    "arranjo logistico-territorial": "arranjo_logistico",
    "arranjo logistico-territorial da oferta": "arranjo_logistico",
    "carga horaria": "carga_horaria",
    "integra com outras politicas": "integra_outras_politicas",
    "continuidade entre governos": "continuidade_governos",
    "link": "link",
    "link oficial": "link",
    "informacoes complementares": "informacoes_complementares",
    "duvidas": "duvidas_revisor",
    "duvida": "duvidas_revisor",
}

# Cabeçalhos de coluna fantasma a descartar
GHOST_HEADERS = {"coluna 2", "coluna 3", "coluna 4"}


def normalize_header(raw: object) -> str:
    """Lowercase + remove acentos + remove instrução '(Verificar planilha Categorias)'."""
    if raw is None:
        return ""
    s = str(raw).strip()
    if not s or s.lower() == "nan":
        return ""
    # Remove instrução '(Verificar planilha [Categorias])' (case-insensitive, com aspas opcionais)
    s = re.sub(
        r"\s*\(\s*verificar\s+planilha\s*[\"']?categorias[\"']?\s*\)\s*",
        "",
        s,
        flags=re.IGNORECASE,
    )
    # Remove acentos
    s = unicodedata.normalize("NFKD", s)
    s = s.encode("ascii", "ignore").decode("ascii")
    s = s.lower().strip()
    # Colapsa espaços múltiplos
    s = re.sub(r"\s+", " ", s)
    return s


def map_header(raw: object, *, position: int = -1) -> str | None:
    """Mapeia cabeçalho bruto → nome canônico interno; None se for ignorado.

    `position` é o índice da coluna (0-based). 'Coluna 1' só vira `id_planilha`
    quando é a primeira coluna; em outras posições é fantasma (RS, PA têm
    'Coluna 1' extra no fim das abas com `Id` real na pos 0).
    """
    norm = normalize_header(raw)
    if not norm:
        return None
    if norm in GHOST_HEADERS:
        return None
    if norm == "coluna 1" and position != 0:
        return None  # 'Coluna 1' fora da pos 0 é fantasma
    return HEADER_MAP.get(norm)


def load_aba(xlsx: Path, aba_nome: str, uf: str) -> tuple[pd.DataFrame, list[str]]:
    """Carrega 1 aba, normaliza cabeçalhos, retorna (df, lista de cabeçalhos brutos não mapeados)."""
    df_raw = pd.read_excel(xlsx, sheet_name=aba_nome, engine="openpyxl", header=None)
    df_raw = df_raw.dropna(how="all")  # corta linhas 100% vazias
    if df_raw.empty:
        return pd.DataFrame(), []

    headers_raw = df_raw.iloc[0].tolist()
    canonical: list[str | None] = []
    seen_names: set[str] = set()
    unmapped: list[str] = []

    for pos, h in enumerate(headers_raw):
        cn = map_header(h, position=pos)
        if cn is None:
            # Cabeçalho não mapeado: registra se não for vazio nem fantasma
            norm = normalize_header(h)
            if norm and norm not in GHOST_HEADERS:
                unmapped.append(str(h))
            canonical.append(None)
            continue
        # Lidar com duplicados (raro): sufixo numérico
        base = cn
        n = 1
        while cn in seen_names:
            n += 1
            cn = f"{base}_{n}"
        seen_names.add(cn)
        canonical.append(cn)

    # Construir DataFrame de dados (drop linha de cabeçalho), mantendo só colunas mapeadas
    df_data = df_raw.iloc[1:].reset_index(drop=True)
    keep_cols = [(i, name) for i, name in enumerate(canonical) if name is not None]

    if not keep_cols:
        return pd.DataFrame(), unmapped

    out = pd.DataFrame()
    for i, name in keep_cols:
        out[name] = df_data.iloc[:, i].reset_index(drop=True)

    # Remove linhas onde TODOS os campos canônicos estão vazios
    out = out.dropna(how="all").reset_index(drop=True)

    out.insert(0, "uf", uf)
    out.insert(0, "aba_origem", aba_nome)
    return out, unmapped


def main() -> int:
    if not RAW_XLSX.exists():
        print(f"ERRO: planilha não encontrada: {RAW_XLSX}", file=sys.stderr)
        return 1

    print(f"Carregando: {RAW_XLSX}")
    OUT_CSV.parent.mkdir(parents=True, exist_ok=True)

    dfs = []
    unmapped_global: dict[str, list[str]] = {}
    for aba_nome, uf in ABA_UF.items():
        if uf is None:
            print(f"  [pula] {aba_nome!r}")
            continue
        try:
            df, unmapped = load_aba(RAW_XLSX, aba_nome, uf)
        except ValueError as e:
            print(f"  [WARN] {aba_nome!r}: {e}", file=sys.stderr)
            continue
        if df.empty:
            print(f"  [WARN] {aba_nome!r}: vazia após normalização", file=sys.stderr)
            continue
        print(
            f"  [{uf}] {aba_nome!r:48s}  fichas={len(df):3d}  "
            f"cols_canon={len(df.columns)-2:2d}  "
            f"unmapped={len(unmapped)}"
        )
        if unmapped:
            unmapped_global[aba_nome] = unmapped
        dfs.append(df)

    if not dfs:
        print("ERRO: nenhuma aba carregada.", file=sys.stderr)
        return 1

    total = pd.concat(dfs, ignore_index=True)
    print(f"\nTotal: {len(total)} fichas em {len(dfs)} abas.")
    print(f"Colunas finais ({len(total.columns)}): {sorted(total.columns)}")

    if unmapped_global:
        print("\nCabeçalhos NÃO mapeados (revisar em normalize.py):")
        for aba, headers in unmapped_global.items():
            for h in headers:
                print(f"  [{aba}] {h!r}")

    total.to_csv(OUT_CSV, index=False, encoding="utf-8")
    print(f"\nSalvo: {OUT_CSV}  ({OUT_CSV.stat().st_size:,} bytes)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
