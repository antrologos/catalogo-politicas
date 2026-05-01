"""C.1.c — Normaliza valores categóricos via vocabulario-canonico.json.

- Lê data/derived/_intermediate/raw_planilha.csv (saída de load_planilha.py)
- Para cada campo categórico (definido em vocabulário): aplica lookup direto
  em variants → canonical; se não mapeado, preserva valor original e loga
- Caso especial esfera_execucao: detecta sufixos descritivos
  (`+ rede X`, `+ Sistema S`, `- Setor privado`, etc.) e migra para
  esfera_execucao_apoios_parcerias (concatenando se já houver conteúdo)
- Saída: data/derived/_intermediate/normalized.csv
- Log de não-mapeados: data/logs/normalize_unmapped_<data>.csv

Convenções: ver @.claude/rules/pipeline-python-etl.md, @.claude/rules/dados-politicas.md.
"""
from __future__ import annotations

import json
import re
import sys
import unicodedata
from datetime import datetime
from pathlib import Path

import pandas as pd

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent
IN_CSV = ROOT / "data" / "derived" / "_intermediate" / "raw_planilha.csv"
OUT_CSV = ROOT / "data" / "derived" / "_intermediate" / "normalized.csv"
VOCAB_JSON = ROOT / ".claude" / "context" / "vocabulario-canonico.json"
LOG_CSV = ROOT / "data" / "logs" / f"normalize_unmapped_{datetime.now().strftime('%Y-%m-%d')}.csv"


def cosmetic_clean(s: str) -> str:
    """Limpeza cosmética: aspas curvas → retas; en-dash → hífen; dois-pontos duplos.

    Aplica-se ANTES de qualquer lookup ou comparação. Idempotente.
    """
    if not isinstance(s, str):
        return s
    s = s.strip()
    # En-dash, em-dash → hífen (faz ANTES de qualquer ASCII-fold)
    s = s.replace("–", "-").replace("—", "-")
    # Aspas curvas → retas
    s = s.replace("“", '"').replace("”", '"')
    s = s.replace("‘", "'").replace("’", "'")
    # Aspas tipográficas francesas «» (vistas em arranjo_logistico)
    s = s.replace("«", "").replace("»", "")
    # Aspas duplas/simples ENVOLVENTES (toda a string entre aspas)
    if len(s) >= 2 and s[0] == s[-1] and s[0] in ('"', "'"):
        s = s[1:-1].strip()
    # Dois-pontos duplos → simples
    s = re.sub(r":{2,}", ":", s)
    # Espaços múltiplos
    s = re.sub(r"\s+", " ", s)
    return s.strip()


def text_normalize(s: str) -> str:
    """Lowercase, sem acentos, sem aspas, sem espaços extras — chave de lookup."""
    s = cosmetic_clean(str(s).strip())
    s = unicodedata.normalize("NFKD", s)
    s = s.encode("ascii", "ignore").decode("ascii")
    s = s.lower()
    # Remover aspas internas (não envolventes) — text_normalize é lookup-only
    s = s.replace('"', "").replace("'", "")
    s = re.sub(r"\s+", " ", s)
    return s.strip()


def normalize_value(raw: object, variants_map: dict[str, str], canonical_set: set[str]) -> tuple[str | None, str]:
    """Normaliza um valor.

    Retorna (canonical_value | None, status):
        status ∈ {'canonical', 'mapped', 'unmapped', 'empty'}
    """
    if raw is None or (isinstance(raw, float) and pd.isna(raw)):
        return None, "empty"
    s_raw = str(raw).strip()
    if not s_raw or s_raw.lower() == "nan":
        return None, "empty"
    s_clean = cosmetic_clean(s_raw)
    # Já canônico (case-sensitive)?
    if s_clean in canonical_set:
        return s_clean, "canonical"
    # Lookup em variants (chave normalizada)
    key = text_normalize(s_clean)
    if key in variants_map:
        return variants_map[key], "mapped"
    # Não mapeado — preserva valor (após cosmetic clean)
    return s_clean, "unmapped"


# Padrão para detectar sufixo descritivo em esfera_execucao:
#   "<tronco>{ + | - | : | ;} <sufixo>" onde sufixo começa com substantivo
#   típico: "rede", "Sistema", "Empresas", "Setor", "Redes", "instituições", etc.
SUFIXO_PATTERN = re.compile(
    r"^(?P<tronco>.+?)\s*[+\-]\s*(?P<sufixo>(?:rede|sistema|setor|empresas?|entidades?|instituic|industrias?|sociedade)[^+]*?)\s*$",
    re.IGNORECASE,
)


def split_esfera_execucao(value: str) -> tuple[str, list[str]]:
    """Separa tronco e TODOS os sufixos descritivos encadeados.

    Aplica SUFIXO_PATTERN iterativamente: enquanto o regex casar, separa o
    último sufixo (rede X / Sistema S / Empresas / Setor privado / Sociedade) do
    tronco e empilha. Para com tronco que não tem mais sufixo descritivo.
    Retorna (tronco_canonico_ish, [sufixo1, sufixo2, ...] em ordem original).
    """
    if not isinstance(value, str):
        return value, []
    tronco = cosmetic_clean(value)
    sufixos_reverso: list[str] = []
    # Lazy: só faz até 5 iterações pra não loop infinito
    for _ in range(5):
        m = SUFIXO_PATTERN.match(tronco)
        if not m:
            break
        tronco = m.group("tronco").strip(" -+:;")
        sufixos_reverso.append(m.group("sufixo").strip())
    return tronco, list(reversed(sufixos_reverso))


def main() -> int:
    if not IN_CSV.exists():
        print(f"ERRO: rodar load_planilha.py primeiro (ausente: {IN_CSV})", file=sys.stderr)
        return 1
    if not VOCAB_JSON.exists():
        print(f"ERRO: vocabulário ausente: {VOCAB_JSON}", file=sys.stderr)
        return 1

    print(f"Lendo: {IN_CSV}")
    df = pd.read_csv(IN_CSV, encoding="utf-8", dtype=str, keep_default_na=False, na_values=[""])
    print(f"  {len(df)} fichas, {len(df.columns)} colunas")

    print(f"Lendo vocabulário: {VOCAB_JSON}")
    vocab = json.loads(VOCAB_JSON.read_text(encoding="utf-8"))
    campos = vocab["campos"]

    # Normalizar chaves de `variants` para a mesma forma que text_normalize produz
    # (lowercase + sem acentos + sem espaços extras). Isso garante que o lookup
    # case com qualquer variação do valor original.
    for campo_def in campos.values():
        raw_variants = campo_def.get("variants", {})
        campo_def["variants"] = {text_normalize(k): v for k, v in raw_variants.items()}

    LOG_CSV.parent.mkdir(parents=True, exist_ok=True)

    # Estatísticas
    stats: dict[str, dict[str, int]] = {}
    unmapped_log: list[dict] = []
    apoios_concat = 0  # quantos sufixos migrados

    # Para cada campo definido no vocabulário
    for campo, defn in campos.items():
        if campo not in df.columns:
            print(f"  [skip] campo '{campo}' não está no CSV — pulando")
            continue

        canonical_set = set(defn["canonical_values"])
        variants_map = defn.get("variants", {})

        col_stats = {"canonical": 0, "mapped": 0, "unmapped": 0, "empty": 0}
        new_values: list[str | None] = []

        # Caso especial: esfera_execucao migra sufixo
        is_exec = (campo == "esfera_execucao")

        for idx, raw in df[campo].items():
            if is_exec and isinstance(raw, str) and raw.strip():
                tronco, sufixos = split_esfera_execucao(raw)
                if sufixos:
                    # Adicionar todos os sufixos ao campo apoios_parcerias
                    cur = df.at[idx, "esfera_execucao_apoios_parcerias"] if "esfera_execucao_apoios_parcerias" in df.columns else None
                    cur_str = str(cur).strip() if cur and not pd.isna(cur) and str(cur).lower() != "nan" else ""
                    sufixos_concat = "; ".join(sufixos)
                    new_apoios = (cur_str + "; " + sufixos_concat).strip("; ") if cur_str else sufixos_concat
                    df.at[idx, "esfera_execucao_apoios_parcerias"] = new_apoios
                    apoios_concat += len(sufixos)
                    raw = tronco  # normaliza só o tronco

            new_val, status = normalize_value(raw, variants_map, canonical_set)
            new_values.append(new_val)
            col_stats[status] += 1
            if status == "unmapped" and new_val:
                unmapped_log.append({
                    "campo": campo,
                    "valor_original": str(raw)[:200],
                    "valor_normalizado_cosmetico": new_val[:200],
                    "uf": df.at[idx, "uf"] if "uf" in df.columns else "",
                    "nome": df.at[idx, "nome"] if "nome" in df.columns else "",
                    "linha": idx,
                })

        df[campo] = new_values
        stats[campo] = col_stats

    # Imprimir estatísticas
    print("\n=== Normalização por campo ===")
    print(f"  {'campo':<32s}  canon  mapped  unmap  empty  total  %válido")
    for campo, s in stats.items():
        total = sum(s.values())
        ok = s["canonical"] + s["mapped"]
        pct = 100 * ok / max(total - s["empty"], 1)
        print(f"  {campo:<32s}  {s['canonical']:5d}  {s['mapped']:6d}  {s['unmapped']:5d}  {s['empty']:5d}  {total:5d}  {pct:5.1f}%")

    print(f"\nSufixos descritivos migrados para esfera_execucao_apoios_parcerias: {apoios_concat}")

    # Salvar log de não-mapeados
    if unmapped_log:
        log_df = pd.DataFrame(unmapped_log)
        log_df.to_csv(LOG_CSV, index=False, encoding="utf-8")
        print(f"\nLog de {len(unmapped_log)} valores não-mapeados: {LOG_CSV}")
    else:
        print("\nNenhum valor não-mapeado.")

    # Salvar CSV normalizado
    OUT_CSV.parent.mkdir(parents=True, exist_ok=True)
    df.to_csv(OUT_CSV, index=False, encoding="utf-8")
    print(f"\nSalvo: {OUT_CSV}  ({OUT_CSV.stat().st_size:,} bytes)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
