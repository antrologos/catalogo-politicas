const CHAVE_RETORNO = 'catalogo:busca:retorno:v1';

// Só oferece retorno à consulta que efetivamente originou esta ficha.
export function obterRetornoBusca(raw, fichaHref, buscaHref, agora = Date.now()) {
  try {
    const estado = JSON.parse(raw);
    if (!estado || estado.version !== 1 || typeof estado.url !== 'string' ||
        !Number.isFinite(estado.updatedAt) || agora - estado.updatedAt > 86400000 ||
        estado.updatedAt - agora > 60000) return null;
    const ficha = new URL(fichaHref);
    const busca = new URL(buscaHref, ficha);
    const retorno = new URL(estado.url, ficha);
    if (estado.resultPath !== ficha.pathname || retorno.origin !== ficha.origin ||
        busca.origin !== ficha.origin || retorno.pathname !== busca.pathname) return null;
    return retorno.pathname + retorno.search;
  } catch {
    return null;
  }
}

function iniciarFicha() {
  const ficha = document.querySelector('[data-ficha]');
  if (!ficha) return;
  const retorno = ficha.querySelector('[data-ficha-retorno]');
  if (retorno) {
    try {
      const href = obterRetornoBusca(sessionStorage.getItem(CHAVE_RETORNO), location.href, retorno.href);
      if (href) {
        retorno.href = href;
        retorno.hidden = false;
      }
    } catch { /* A ficha continua utilizável se o armazenamento estiver indisponível. */ }
  }

  ficha.querySelectorAll('[data-ficha-action]').forEach((botao) => { botao.hidden = false; });
  ficha.querySelector('[data-ficha-citar]')?.addEventListener('click', () => {
    const citacao = document.getElementById('citacao');
    if (citacao) citacao.open = true;
  });
  ficha.querySelector('[data-ficha-imprimir]')?.addEventListener('click', () => window.print());

  // Mantém observações e conteúdo complementar na cópia impressa, restaurando
  // depois exatamente os detalhes que o leitor havia deixado fechados.
  let detalhesFechados = null;
  window.addEventListener('beforeprint', () => {
    if (detalhesFechados) return;
    detalhesFechados = [];
    ficha.querySelectorAll('details.print-expand, details.print-citation, details.citation-primary').forEach((detalhe) => {
      if (!detalhe.open) {
        detalhesFechados.push(detalhe);
        detalhe.open = true;
      }
    });
  });
  window.addEventListener('afterprint', () => {
    detalhesFechados?.forEach((detalhe) => { detalhe.open = false; });
    detalhesFechados = null;
  });
}

if (typeof document !== 'undefined') iniciarFicha();
