"""Auditoria GET limitada de referências; não captura documentos nem comprova vigência.

Exemplo:
 python -B scripts/captura/auditar_referencias.py --input data/derived/latest.json \
   --propostas data/curadoria --anterior data/derived/links-validados-onda-1-2026-10-04-final.csv \
   --output data/auditoria/referencias-http-2026-10-05.json
Reexecutar reaproveita verificações feitas na mesma data (use --refresh para refazer).
"""
from __future__ import annotations

import argparse
import csv
import ipaddress
import json
import re
import sys
import threading
import time
from collections import Counter, defaultdict, deque
from concurrent.futures import FIRST_COMPLETED, ThreadPoolExecutor, wait
from datetime import datetime, timezone
from html import unescape
from pathlib import Path
from urllib.parse import urljoin, urlsplit, urlunsplit

import httpx

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from _http_helpers import DEFAULT_HEADERS, RateLimiter, RobotsCache, USER_AGENT

ROOT = HERE.parent.parent
HTML_LIMIT = 32768
ROBOTS_LIMIT = 262144
REDIRECT_LIMIT = 5
LIMITES = [
    "GET com identidade do projeto; sem navegador ou tentativa de contornar bloqueios.",
    "Até 5 workers; uma requisição por host de cada vez, intervalo mínimo de 2 s ou Crawl-delay maior.",
    "Timeout HTTP de 30 s (conexão 10 s); sem novas tentativas automáticas após erro.",
    "Corpo HTML limitado a 32768 bytes descomprimidos; outros documentos não são lidos.",
    "Robots limitado a 262144 bytes, com até 5 redirecionamentos e o mesmo limite de frequência.",
    "Robots indisponível segue política permissiva do helper existente e fica explicitamente sinalizado.",
    "HTTP, título e destino não comprovam correspondência documental, vigência ou execução atual.",
    "Título ausente no prefixo não significa ausência no documento; erros podem ser transitórios.",
]


def now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def public_url(value: object) -> str | None:
    if not isinstance(value, str):
        return None
    try:
        p = urlsplit(value.strip())
        host = (p.hostname or "").lower()
        if p.scheme not in {"http", "https"} or not host or p.username or p.password:
            return None
        if host == "localhost" or host.endswith((".local", ".localhost")):
            return None
        try:
            if not ipaddress.ip_address(host).is_global:
                return None
        except ValueError:
            pass
        return urlunsplit((p.scheme.lower(), p.netloc.lower(), p.path, p.query, ""))
    except ValueError:
        return None


def title_from_html(content: bytes, encoding: str = "utf-8") -> str | None:
    try:
        text = content.decode(encoding, errors="replace")
    except LookupError:
        text = content.decode("utf-8", errors="replace")
    match = re.search(r"<title\b[^>]*>(.*?)</title\s*>", text, re.I | re.S)
    if not match:
        return None
    return re.sub(r"\s+", " ", unescape(re.sub(r"<[^>]+>", " ", match.group(1)))).strip() or None


def destination_flags(original: str, final: str, title: str | None = None) -> list[str]:
    a, b = urlsplit(original), urlsplit(final)
    flags = []
    final_path = b.path.rstrip("/").lower()
    if original != final and a.path.rstrip("/") and final_path in {
        "", "/home", "/index", "/index.html", "/index.php", "/educacao"
    }:
        flags.append("redirecionamento_para_pagina_generica")
    if re.search(r"(^|/)(login|signin|sign-in|require_login|autenticacao|acesso)(/|$)", final_path):
        flags.append("destino_de_autenticacao")
    if title and re.search(
        r"p[aá]gina n[aã]o encontrada|page not found|not found|access denied|acesso negado|"
        r"just a moment|verifying your browser|service unavailable|erro 404|error 404|^login\b",
        title, re.I,
    ):
        flags.append("titulo_indica_erro_ou_bloqueio")
    return flags


def collect_inputs(input_path: Path, proposals: Path, previous: Path | None):
    historical = {}
    if previous and previous.exists():
        with previous.open(encoding="utf-8-sig", newline="") as stream:
            for row in csv.DictReader(stream):
                url = public_url(row.get("url"))
                if url:
                    historical[url] = row
    records = json.loads(input_path.read_text(encoding="utf-8-sig"))
    if not isinstance(records, list):
        raise ValueError("--input deve conter uma lista de fichas")
    entries: dict[str, dict] = {}
    omitted = Counter()
    omitted_origins = []
    unique_count = 0

    def add(value, origin):
        url = public_url(value)
        if url is None:
            omitted["url_ausente_local_ou_invalida"] += 1
            omitted_origins.append({"url": value, "origem": origin,
                                    "motivo": "URL ausente, local ou inválida; não consultada"})
            return
        entry = entries.setdefault(url, {"url": url, "origens": [], "prioridade": 2})
        if origin not in entry["origens"]:
            entry["origens"].append(origin)
        old = historical.get(url)
        if old is None:
            priority = 0
        elif old.get("status_class") != "ok_200" or destination_flags(url, old.get("url_final") or url):
            priority = 1
        else:
            priority = 2
        if origin["tipo"].startswith("proposta"):
            priority = 0
        entry["prioridade"] = min(priority, entry["prioridade"])
        if old:
            entry["auditoria_anterior"] = {
                key: old.get(key) for key in ("status_code", "status_class", "url_final")
            }

    for record in records:
        if record.get("is_federal_replica"):
            continue
        unique_count += 1
        add(record.get("fonte_url"), {"tipo": "fonte_catalogo", "id_interno": record["id_interno"]})
    proposal_paths = sorted(proposals.glob("propostas-*.json")) if proposals.is_dir() else [proposals]
    correction_count = 0
    for path in proposal_paths:
        document = json.loads(path.read_text(encoding="utf-8-sig"))
        for correction in document["correcoes"]:
            correction_count += 1
            origin = {"arquivo": path.name, "id_interno": correction["id_interno"]}
            source = correction.get("campos", {}).get("fonte_url", {})
            if "novo" in source:
                add(source["novo"], {"tipo": "proposta_fonte", **origin})
            for reference in correction.get("referencias", []):
                add(reference.get("url"), {"tipo": "proposta_referencia", **origin})
    # Round-robin por host dentro de cada prioridade: não ocupa todos os workers no mesmo host.
    ordered = []
    for priority in range(3):
        hosts = defaultdict(deque)
        for entry in entries.values():
            if entry["prioridade"] == priority:
                hosts[urlsplit(entry["url"]).netloc].append(entry)
        while hosts:
            for host in list(hosts):
                ordered.append(hosts[host].popleft())
                if not hosts[host]:
                    del hosts[host]
    return ordered, {
        "fichas_unicas_lidas": unique_count,
        "entradas_propostas_lidas": correction_count,
        "arquivos_propostas": [str(p) for p in proposal_paths],
        "urls_elegiveis": len(entries),
        "omitidos": dict(omitted),
        "origens_omitidas": omitted_origins,
    }


class LimitedHTTP:
    """Limites compartilhados para conteúdo, robots e todos os seus redirects."""

    def __init__(self, client=None, delay: float = 2.0):
        self.client = client or httpx.Client(
            headers=DEFAULT_HEADERS, follow_redirects=False,
            timeout=httpx.Timeout(30.0, connect=10.0), http2=False,
        )
        self.rate = RateLimiter(default_delay=max(2.0, delay))
        self._locks = defaultdict(threading.Lock)
        self._locks_guard = threading.Lock()
        self._robots_guard = threading.Lock()
        self.robots = RobotsCache()
        self.robots._parsers = {}  # isolamento por execução, sem compartilhar parsers de outra instância
        self.robots_trace = {}

    def fetch(self, url: str, *, robots=False, timeout=30.0) -> dict:
        host = urlsplit(url).netloc.lower()
        with self._locks_guard:
            host_lock = self._locks[host]
        with host_lock:
            self.rate.wait(url)
            start = time.monotonic()
            with self.client.stream(
                "GET", url, follow_redirects=False,
                timeout=httpx.Timeout(min(30.0, float(timeout)), connect=min(10.0, float(timeout))),
            ) as response:
                mime = response.headers.get("content-type", "").split(";")[0].strip().lower()
                content = bytearray()
                limit = ROBOTS_LIMIT if robots else HTML_LIMIT
                html = mime in {"text/html", "application/xhtml+xml"}
                # Só corpos de robots e prefixos HTML. PDFs e binários terminam nos headers.
                if (robots and response.status_code == 200) or (not robots and html):
                    for chunk in response.iter_bytes(chunk_size=2048):
                        if time.monotonic() - start > timeout:
                            raise httpx.ReadTimeout("Limite de tempo do prefixo excedido", request=response.request)
                        content.extend(chunk[:max(0, limit - len(content))])
                        if not robots and b"</title" in content.lower():
                            break
                        if len(content) >= limit:
                            break
                encoding = response.encoding or "utf-8"
                result = {
                    "status": response.status_code, "url": str(response.url),
                    "location": response.headers.get("location"), "mime": mime,
                    "content": bytes(content), "encoding": encoding,
                    "prefixo_limitado": len(content) >= limit,
                }
                if robots and result["prefixo_limitado"]:
                    raise httpx.ReadError("Robots excede limite; não interpretar prefixo incompleto",
                                          request=response.request)
                return result

    def get(self, url, timeout=10.0):
        """Adapter público consumido por RobotsCache.check; nunca segue redirects automaticamente."""
        current = url
        trace = []
        for index in range(REDIRECT_LIMIT + 1):
            result = self.fetch(current, robots=True, timeout=timeout)
            trace.append({"url": current, "status_http": result["status"]})
            if result["status"] in {301, 302, 303, 307, 308} and result["location"]:
                target = public_url(urljoin(current, result["location"]))
                if not target or index == REDIRECT_LIMIT:
                    raise httpx.TooManyRedirects("Redirect de robots inválido ou excessivo",
                                                request=httpx.Request("GET", current))
                current = target
                continue
            self.robots_trace[url] = trace
            return httpx.Response(result["status"], content=result["content"],
                                  headers={"content-type": "text/plain; charset=" + result["encoding"]},
                                  request=httpx.Request("GET", current))
        raise AssertionError("redirect loop")

    def check_robots(self, url):
        with self._robots_guard:
            rule = self.robots.check(url, self)
        if rule.crawl_delay:
            self.rate.set_delay(urlsplit(url).netloc.lower(), rule.crawl_delay)
        return rule

    def audit(self, entry: dict) -> dict:
        original = entry["url"]
        result = {
            **entry, "status_http": None, "url_final": original, "titulo": None,
            "status_class": "erro_interno", "checado_em": now(),
            "redirecionamentos": [], "robots": [], "bytes_lidos": 0,
            "alertas": [], "erros": [], "limites": [
                "Sem avaliação de vigência ou correspondência do conteúdo.",
                "Somente prefixo HTML para título; nenhum arquivo integral armazenado.",
            ],
        }
        current = original
        visited = set()
        try:
            for index in range(REDIRECT_LIMIT + 1):
                if current in visited:
                    result["status_class"] = "ciclo_redirecionamento"
                    break
                visited.add(current)
                result["url_final"] = current
                rule = self.check_robots(current)
                result["robots"].append({
                    "url": current, "permitido": rule.allowed,
                    "obtido": rule.fetched, "crawl_delay": rule.crawl_delay,
                })
                if not rule.fetched:
                    result["alertas"].append("robots_indisponivel_politica_permissiva")
                if not rule.allowed:
                    result["status_class"] = "bloqueado_robots"
                    break
                response = self.fetch(current)
                status = response["status"]
                result.update(status_http=status, url_final=response["url"], content_type=response["mime"])
                result["bytes_lidos"] += len(response["content"])
                if status in {301, 302, 303, 307, 308} and response["location"]:
                    target = public_url(urljoin(current, response["location"]))
                    result["redirecionamentos"].append({
                        "url": current, "status_http": status, "destino": target or response["location"],
                    })
                    if not target:
                        result["status_class"] = "destino_redirecionamento_nao_publico"
                        break
                    if index == REDIRECT_LIMIT:
                        result["status_class"] = "limite_redirecionamentos"
                        break
                    current = target
                    continue
                title = title_from_html(response["content"], response["encoding"])
                result["titulo"] = title
                result["prefixo_limitado"] = response["prefixo_limitado"]
                flags = destination_flags(original, result["url_final"], title)
                result["alertas"].extend(flags)
                if 200 <= status < 300:
                    result["status_class"] = (
                        "ok_com_alerta" if flags else "redirect_200" if result["redirecionamentos"] else "ok_200"
                    )
                elif status == 403:
                    result["status_class"] = "forbidden_403"
                elif status == 404:
                    result["status_class"] = "not_found_404"
                elif 500 <= status < 600:
                    result["status_class"] = "server_err_5xx"
                else:
                    result["status_class"] = f"http_{status}"
                break
        except httpx.TimeoutException as exc:
            result["status_class"] = "timeout"
            result["erros"].append(f"{type(exc).__name__}: {exc}")
        except (httpx.HTTPError, OSError, ValueError) as exc:
            result["status_class"] = "erro_rede"
            result["erros"].append(f"{type(exc).__name__}: {exc}")
        result["alertas"] = sorted(set(result["alertas"]))
        result["concluido_em"] = now()
        return result


def save_report(path, results, metadata, *, complete=False):
    ordered = sorted(results.values(), key=lambda r: (r["prioridade"], r["url"]))
    payload = {
        "versao": 1, "gerado_em": now(), "concluido": complete,
        "metodo": "GET em streaming; sem captura", "user_agent": USER_AGENT,
        "limites": LIMITES, **metadata,
        "contagens": dict(Counter(r["status_class"] for r in ordered)),
        "contagens_no_escopo": dict(Counter(
            r["status_class"] for r in ordered if not r.get("fora_escopo_atual", False)
        )),
        "contagens_fora_escopo": dict(Counter(
            r["status_class"] for r in ordered if r.get("fora_escopo_atual", False)
        )),
        "urls_verificadas": len(ordered),
        "urls_verificadas_no_escopo": sum(not r.get("fora_escopo_atual", False) for r in ordered),
        "resultados": ordered,
    }
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_suffix(path.suffix + ".tmp")
    temporary.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    temporary.replace(path)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input", type=Path, default=ROOT / "data/derived/latest.json")
    parser.add_argument("--propostas", type=Path, default=ROOT / "data/curadoria")
    parser.add_argument("--anterior", type=Path)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--workers", type=int, choices=range(1, 6), default=5)
    parser.add_argument("--prioridades", action="store_true", help="Apenas novas/propostas/falhas e redirects suspeitos")
    parser.add_argument("--refresh", action="store_true", help="Ignorar cache de resultados do dia")
    parser.add_argument("--max-urls", type=int)
    args = parser.parse_args()
    entries, info = collect_inputs(args.input, args.propostas, args.anterior)
    if args.prioridades:
        entries = [entry for entry in entries if entry["prioridade"] < 2]
    metadata = {
        "input": str(args.input), "anterior": str(args.anterior) if args.anterior else None,
        "entradas": info, "workers": args.workers, "somente_prioridades": args.prioridades,
        "urls_selecionadas": len(entries),
    }
    results = {}
    today = now()[:10]
    if not args.refresh and args.output.exists():
        old = json.loads(args.output.read_text(encoding="utf-8"))
        results = {r["url"]: r for r in old.get("resultados", []) if r.get("checado_em", "")[:10] == today}
    selected_urls = {entry["url"] for entry in entries}
    for cached in results.values():
        cached["fora_escopo_atual"] = cached["url"] not in selected_urls
        flags = destination_flags(cached["url"], cached["url_final"], cached.get("titulo"))
        cached["alertas"] = sorted(set(cached.get("alertas", []) + flags))
        if flags and 200 <= (cached.get("status_http") or 0) < 300:
            cached["status_class"] = "ok_com_alerta"
    pending = []
    for entry in entries:
        if entry["url"] in results:
            cached = results[entry["url"]]
            cached.update(entry)

        else:
            pending.append(entry)
    if args.max_urls is not None:
        pending = pending[:max(0, args.max_urls)]
    print(json.dumps({"entradas": info, "cache": len(results), "pendentes": len(pending)}, ensure_ascii=False), flush=True)
    save_report(args.output, results, metadata)
    auditor = LimitedHTTP()
    try:
        with ThreadPoolExecutor(max_workers=args.workers) as pool:
            queue = list(pending)
            jobs = {}
            active_hosts = set()
            while queue or jobs:
                for entry in list(queue):
                    if len(jobs) >= args.workers:
                        break
                    host = urlsplit(entry["url"]).netloc
                    if host in active_hosts:
                        continue
                    queue.remove(entry)
                    active_hosts.add(host)
                    jobs[pool.submit(auditor.audit, entry)] = host
                finished, _ = wait(jobs, return_when=FIRST_COMPLETED)
                for future in finished:
                    active_hosts.remove(jobs.pop(future))
                    result = future.result()
                    results[result["url"]] = result
                    save_report(args.output, results, metadata)
                    print(f"[{len(results)}] {result['status_class']} {result['url']}", flush=True)
    finally:
        auditor.client.close()
        save_report(args.output, results, metadata,
                    complete=all(entry["url"] in results for entry in entries))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
