"""Configuração de ferramentas externas (Tesseract OCR, LibreOffice).

Paths default Windows:
  - Tesseract: C:\\Program Files\\Tesseract-OCR\\tesseract.exe
  - LibreOffice: C:\\Program Files\\LibreOffice\\program\\soffice.exe
  - tessdata pt: data/external_tools/tessdata/por.traineddata (local ao projeto)

Override via env vars:
  - TESSERACT_BIN
  - SOFFICE_BIN
  - TESSDATA_PREFIX (caminho da pasta tessdata)

Funções de health-check usadas em testes e na inicialização da skill capturar-norma v2.0.
"""
from __future__ import annotations

import os
import shutil
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent

# Defaults Windows
DEFAULT_TESSERACT = Path(r"C:\Program Files\Tesseract-OCR\tesseract.exe")
DEFAULT_SOFFICE = Path(r"C:\Program Files\LibreOffice\program\soffice.exe")
DEFAULT_TESSDATA = ROOT / "data" / "external_tools" / "tessdata"


def tesseract_bin() -> Path | None:
    """Retorna caminho do binário tesseract; None se não encontrado."""
    env = os.environ.get("TESSERACT_BIN")
    if env:
        p = Path(env)
        return p if p.is_file() else None
    if DEFAULT_TESSERACT.is_file():
        return DEFAULT_TESSERACT
    found = shutil.which("tesseract")
    return Path(found) if found else None


def soffice_bin() -> Path | None:
    """Retorna caminho do binário LibreOffice (soffice); None se não encontrado."""
    env = os.environ.get("SOFFICE_BIN")
    if env:
        p = Path(env)
        return p if p.is_file() else None
    if DEFAULT_SOFFICE.is_file():
        return DEFAULT_SOFFICE
    found = shutil.which("soffice") or shutil.which("libreoffice")
    return Path(found) if found else None


def tessdata_prefix() -> Path | None:
    """Retorna caminho da pasta tessdata (idiomas OCR); None se ausente."""
    env = os.environ.get("TESSDATA_PREFIX")
    if env:
        p = Path(env)
        return p if p.is_dir() else None
    if DEFAULT_TESSDATA.is_dir() and any(DEFAULT_TESSDATA.glob("*.traineddata")):
        return DEFAULT_TESSDATA
    return None


def has_tesseract_pt() -> bool:
    """True se tesseract está disponível e idioma 'por' instalado."""
    bin_ = tesseract_bin()
    if not bin_:
        return False
    prefix = tessdata_prefix()
    env = {**os.environ}
    if prefix:
        env["TESSDATA_PREFIX"] = str(prefix)
    try:
        r = subprocess.run(
            [str(bin_), "--list-langs"],
            capture_output=True, text=True, encoding="utf-8",
            timeout=10, env=env,
        )
        return "por" in r.stdout
    except Exception:
        return False


def has_soffice() -> bool:
    """True se LibreOffice headless responde."""
    bin_ = soffice_bin()
    if not bin_:
        return False
    # `soffice --version` abre janela; apenas verificar arquivo é suficiente
    return bin_.is_file()


def health_check() -> dict[str, object]:
    """Retorna dict de health: {tesseract, tesseract_pt, soffice}."""
    return {
        "tesseract_bin": str(tesseract_bin()) if tesseract_bin() else None,
        "tesseract_pt": has_tesseract_pt(),
        "tessdata_prefix": str(tessdata_prefix()) if tessdata_prefix() else None,
        "soffice_bin": str(soffice_bin()) if soffice_bin() else None,
    }


if __name__ == "__main__":
    import json
    print(json.dumps(health_check(), indent=2, ensure_ascii=False))
