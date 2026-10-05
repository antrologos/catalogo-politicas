import { test } from 'node:test';
import assert from 'node:assert/strict';
import { obterRetornoBusca } from '../src/assets/js/ficha.js';

const agora = 1791144000000;
const ficha = 'https://catalogo.example/catalogo-politicas/politica/exemplo-df/';
const busca = 'https://catalogo.example/catalogo-politicas/buscar/';
const estado = (extra = {}) => JSON.stringify({
  version: 1,
  url: '/catalogo-politicas/buscar/?q=EJA&uf=DF&uf=SP&tipo=Educacional',
  resultPath: '/catalogo-politicas/politica/exemplo-df/',
  visibleResults: 20,
  scrollY: 900,
  updatedAt: agora,
  ...extra,
});

test('retorno preserva a consulta e todas as seleções da busca de origem', () => {
  assert.equal(obterRetornoBusca(estado(), ficha, busca, agora),
    '/catalogo-politicas/buscar/?q=EJA&uf=DF&uf=SP&tipo=Educacional');
});

test('ficha diferente não apresenta retorno de um resultado anterior', () => {
  assert.equal(obterRetornoBusca(estado({ resultPath: '/catalogo-politicas/politica/outra/' }), ficha, busca, agora), null);
});

test('retorno rejeita origem externa ou caminho que não seja a busca do catálogo', () => {
  for (const url of ['https://externo.example/buscar/', '//externo.example/catalogo-politicas/buscar/', '/catalogo-politicas/sobre/', 'javascript:alert(1)']) {
    assert.equal(obterRetornoBusca(estado({ url }), ficha, busca, agora), null);
  }
});

test('retorno exige estado recente, válido e da versão conhecida', () => {
  for (const extra of [{ version: 2 }, { updatedAt: agora - 86400001 }, { updatedAt: agora + 60001 }, { updatedAt: 'ontem' }, { url: null }]) {
    assert.equal(obterRetornoBusca(estado(extra), ficha, busca, agora), null);
  }
});

test('estado ausente ou corrompido não impede a leitura da ficha', () => {
  for (const raw of [null, '', '{incompleto', 'null', '[]', 'true']) {
    assert.equal(obterRetornoBusca(raw, ficha, busca, agora), null);
  }
});
