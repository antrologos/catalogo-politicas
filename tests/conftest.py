"""Fixtures comuns aos testes do pipeline ETL."""
from pathlib import Path
import sys

import pytest

ROOT = Path(__file__).resolve().parent.parent
SCRIPTS_ETL = ROOT / "scripts" / "etl"
SCRIPTS_CAPTURA = ROOT / "scripts" / "captura"

# Permite importar módulos de scripts/etl/ e scripts/captura/ nos testes
sys.path.insert(0, str(SCRIPTS_ETL))
sys.path.insert(0, str(SCRIPTS_CAPTURA))


@pytest.fixture(scope="session")
def project_root() -> Path:
    return ROOT


@pytest.fixture(scope="session")
def fixtures_dir() -> Path:
    return Path(__file__).resolve().parent / "fixtures"
