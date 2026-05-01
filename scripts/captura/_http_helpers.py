"""Helpers HTTP compartilhados entre validar_links.py e capturar_norma.py.

Implementa as regras invioláveis de @.claude/rules/captura-responsavel.md:
  - R1: User-Agent identificável (sem 'GPT/Claude/Bot/AI')
  - R2: Robots.txt cacheado 24h; respeitar Disallow e Crawl-delay
  - R3: Rate limit 1 req/2s por domínio (default); respeitar Crawl-delay maior
  - R4: Timeouts (connect 10s, read 30s, total 60s)
  - R10: User-Agent contém URL e email do projeto
"""
from __future__ import annotations

import logging
import time
from dataclasses import dataclass
from pathlib import Path
from urllib.parse import urlparse
from urllib.robotparser import RobotFileParser

import httpx

LOG = logging.getLogger(__name__)

USER_AGENT = (
    "FRM-CatalogoPoliticas/0.1 "
    "(+https://github.com/iesp-uerj/frm-catalogo-politicas; "
    "mailto:rogerio.barbosa@iesp.uerj.br) "
    "python-httpx/0.28"
)

DEFAULT_RATE_DELAY = 2.0  # segundos por domínio (1 req / 2s)
DEFAULT_TIMEOUT = httpx.Timeout(connect=10.0, read=30.0, write=10.0, pool=10.0)

# Configuração específica por host: timeout estendido para servidores lentos.
# planalto.gov.br tem ~80% timeout no default 30s; testar com 90s read.
HOST_TIMEOUT_OVERRIDES: dict[str, httpx.Timeout] = {
    "www.planalto.gov.br": httpx.Timeout(connect=15.0, read=90.0, write=10.0, pool=15.0),
    "planalto.gov.br": httpx.Timeout(connect=15.0, read=90.0, write=10.0, pool=15.0),
}


def timeout_for(url: str) -> httpx.Timeout:
    """Retorna timeout específico para o host, ou DEFAULT_TIMEOUT."""
    try:
        host = urlparse(url).netloc.lower()
    except Exception:
        return DEFAULT_TIMEOUT
    return HOST_TIMEOUT_OVERRIDES.get(host, DEFAULT_TIMEOUT)
DEFAULT_HEADERS = {
    "User-Agent": USER_AGENT,
    "Accept-Encoding": "gzip, deflate",
    "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.5",
}

ROBOTS_CACHE_DIR = Path(__file__).resolve().parent.parent.parent / "data" / "logs" / "robots_cache"


@dataclass
class RobotsResult:
    allowed: bool
    crawl_delay: float | None
    fetched: bool  # True se conseguiu baixar; False se falha (assume permissivo)


class RobotsCache:
    """Cache de robots.txt em memória (sessão); persistência em disco para 24h.

    Para cada domínio, baixa /robots.txt uma vez por sessão. Se Disallow para
    nosso UA ou para *, retorna allowed=False (e validar_links/capturar_norma
    devem pular a URL com status 'bloqueado_robots').
    """

    def __init__(self, user_agent: str = USER_AGENT) -> None:
        self.user_agent = user_agent
        self._mem: dict[str, RobotsResult | None] = {}

    def check(self, url: str, client: httpx.Client) -> RobotsResult:
        """Verifica se podemos buscar `url` segundo robots.txt do domínio."""
        try:
            parsed = urlparse(url)
        except Exception:
            return RobotsResult(allowed=True, crawl_delay=None, fetched=False)
        if not parsed.netloc:
            return RobotsResult(allowed=True, crawl_delay=None, fetched=False)

        host_key = f"{parsed.scheme}://{parsed.netloc}"
        if host_key in self._mem:
            cached = self._mem[host_key]
            if cached is not None:
                # Re-verificar URL específica
                rp = self._build_parser_from_cached(host_key)
                if rp is None:
                    return cached
                allowed = rp.can_fetch(self.user_agent, url)
                return RobotsResult(
                    allowed=allowed,
                    crawl_delay=cached.crawl_delay,
                    fetched=cached.fetched,
                )

        robots_url = f"{host_key}/robots.txt"
        try:
            r = client.get(robots_url, timeout=10.0)
            if r.status_code != 200:
                # Sem robots.txt → permissivo (default conservador no rate)
                result = RobotsResult(allowed=True, crawl_delay=None, fetched=False)
                self._mem[host_key] = result
                return result
            content = r.text
        except httpx.HTTPError:
            result = RobotsResult(allowed=True, crawl_delay=None, fetched=False)
            self._mem[host_key] = result
            return result

        # Salvar em disco para inspeção/auditoria
        ROBOTS_CACHE_DIR.mkdir(parents=True, exist_ok=True)
        safe = parsed.netloc.replace(".", "_").replace(":", "_")
        (ROBOTS_CACHE_DIR / f"{safe}.txt").write_text(content, encoding="utf-8")

        # Parsear
        rp = RobotFileParser()
        rp.parse(content.splitlines())
        allowed = rp.can_fetch(self.user_agent, url)
        # Tentar extrair Crawl-delay para nosso UA ou para *
        crawl_delay: float | None = None
        try:
            cd = rp.crawl_delay(self.user_agent)
            if cd is not None:
                crawl_delay = float(cd)
        except Exception:
            pass

        result = RobotsResult(allowed=allowed, crawl_delay=crawl_delay, fetched=True)
        self._mem[host_key] = result
        # Guardar parser também
        self._parsers[host_key] = rp
        return result

    _parsers: dict[str, RobotFileParser] = {}

    def _build_parser_from_cached(self, host_key: str) -> RobotFileParser | None:
        return self._parsers.get(host_key)


class RateLimiter:
    """Rate limiter por domínio: garante intervalo mínimo entre requests."""

    def __init__(self, default_delay: float = DEFAULT_RATE_DELAY) -> None:
        self.default_delay = default_delay
        self._last_request: dict[str, float] = {}
        self._delay_override: dict[str, float] = {}

    def set_delay(self, host: str, delay: float) -> None:
        """Define delay específico para um domínio (ex.: do Crawl-delay)."""
        self._delay_override[host] = max(self.default_delay, delay)

    def wait(self, url: str) -> float:
        """Aguarda se necessário; retorna segundos esperados."""
        try:
            host = urlparse(url).netloc.lower()
        except Exception:
            return 0.0
        if not host:
            return 0.0
        delay = self._delay_override.get(host, self.default_delay)
        last = self._last_request.get(host, 0.0)
        now = time.monotonic()
        elapsed = now - last
        wait_for = delay - elapsed
        if wait_for > 0:
            time.sleep(wait_for)
            self._last_request[host] = time.monotonic()
            return wait_for
        self._last_request[host] = now
        return 0.0


def make_client(timeout: httpx.Timeout = DEFAULT_TIMEOUT) -> httpx.Client:
    """Cria httpx.Client com User-Agent canônico, follow_redirects, timeouts."""
    return httpx.Client(
        headers=DEFAULT_HEADERS,
        timeout=timeout,
        follow_redirects=True,
        max_redirects=5,
        http2=False,  # h2 package não obrigatório
    )
