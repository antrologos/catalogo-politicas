import { copyFile, lstat, mkdir, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const raizPadrao = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const permitidos = new Set(['index.html', '404.html', 'assets', 'assets/rede-eja-logo.svg']);

export function validarHtml(html) {
  if (!/<html\b[^>]*\blang=["']pt-BR["']/i.test(html) || !/<title>[^<]+<\/title>/i.test(html)) {
    throw new Error('A página de atualização precisa de idioma pt-BR e título.');
  }
  if (/<\s*(script|iframe|object|embed|base|form)\b|\bon\w+\s*=|http-equiv\s*=\s*["']?refresh/i.test(html)) {
    throw new Error('A página de atualização não pode carregar scripts, formulários ou redirecionamentos.');
  }
  for (const [, atributo, endereco] of html.matchAll(/\b(src|href)\s*=\s*["']([^"']*)["']/gi)) {
    const logo = endereco === '/catalogo-politicas/assets/rede-eja-logo.svg';
    const linkExterno = atributo.toLowerCase() === 'href' && /^https:\/\//i.test(endereco)
      && !/antrologos\.github\.io\/catalogo-politicas(?:\/|$)/i.test(endereco);
    if (!logo && !linkExterno && !endereco.startsWith('#')) {
      throw new Error('Recurso ou rota não permitido na atualização: ' + endereco);
    }
  }
  if (/\b(?:srcset|data-pagefind)\s*=|@import\b|\burl\s*\(/i.test(html)) {
    throw new Error('A página de atualização deve usar CSS local embutido e apenas o logo autorizado.');
  }
}

async function conferirSaida(diretorio, prefixo = '') {
  let itens;
  try {
    const estado = await lstat(diretorio);
    if (!estado.isDirectory() || estado.isSymbolicLink()) throw new Error('Diretório de saída inválido: ' + diretorio);
    itens = await readdir(diretorio, { withFileTypes: true });
  } catch (erro) {
    if (erro.code === 'ENOENT' && prefixo === '') return [];
    throw erro;
  }
  const arquivos = [];
  for (const item of itens) {
    const relativo = prefixo + item.name;
    if (!permitidos.has(relativo) || item.isSymbolicLink()
      || (item.isDirectory() !== (relativo === 'assets'))
      || (!item.isDirectory() && !item.isFile())) {
      throw new Error('A saída contém item não permitido; nenhum arquivo foi removido: ' + relativo);
    }
    if (item.isDirectory()) arquivos.push(...await conferirSaida(path.join(diretorio, item.name), relativo + '/'));
    else arquivos.push(relativo);
  }
  return arquivos.sort();
}

export async function gerarAtualizacao(raizSite = raizPadrao) {
  const saida = path.join(raizSite, '_atualizacao');
  const origem = path.join(raizSite, 'atualizacao', 'index.html');
  const logo = path.join(raizSite, 'src', 'assets', 'img', 'rede', 'rede-eja-logo.svg');
  const modo = JSON.parse(await readFile(path.join(raizSite, 'publicacao.json'), 'utf8')).modo;
  if (modo !== 'atualizacao') throw new Error('O modo de publicação precisa ser atualizacao.');
  validarHtml(await readFile(origem, 'utf8'));
  if (!(await lstat(logo)).isFile()) throw new Error('Logo institucional ausente ou inválido.');
  await conferirSaida(saida);
  await mkdir(path.join(saida, 'assets'), { recursive: true });
  await copyFile(origem, path.join(saida, 'index.html'));
  await copyFile(origem, path.join(saida, '404.html'));
  await copyFile(logo, path.join(saida, 'assets', 'rede-eja-logo.svg'));
  const arquivos = await conferirSaida(saida);
  if (arquivos.join('|') !== '404.html|assets/rede-eja-logo.svg|index.html') {
    throw new Error('O artefato de atualização não corresponde à lista autorizada.');
  }
  return { saida, arquivos };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const resultado = await gerarAtualizacao();
    console.log('Artefato de atualização validado: ' + resultado.arquivos.join(', '));
  } catch (erro) {
    console.error(erro.message);
    process.exitCode = 1;
  }
}
