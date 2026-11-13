import { test } from 'node:test';
import assert from 'node:assert/strict';
import { localTime, makeTranslator, spread } from './translate.ts';

const es = makeTranslator('es', {
  strings: { 'Bundle offers': 'Ofertas en combo', 'Justin Q.': 'Justin Q.', 'Buy together,': 'Compra junto,', Visit: 'Visita la tienda', 'site|Visit': 'Visita' },
  patterns: {
    'Open now, until {0}': 'Abierto ahora, hasta las {0}',
    'Review by {0}': 'Reseña de {0}',
    'At {0}, everything is {1}% off': 'Con {0}, todo tiene {1}% de descuento',
    '{0} points': '{0} puntos',
  },
});
const zh = makeTranslator('zh', {
  strings: { 'Bundle offers': '组合优惠' },
  patterns: { '{0} in Oranjestad': '奥拉涅斯塔德 {0}', 'At {0}, everything is {1}% off': '全部 {1}% 折扣，满 {0}' },
});

test('a known string is translated, keeping the spaces round it', () => {
  assert.equal(es.text('Bundle offers'), 'Ofertas en combo');
  assert.equal(es.text('  Bundle offers '), '  Ofertas en combo ');
  assert.equal(es.text('Bundle\n   offers'), 'Ofertas en combo');
});

test('Chinese drops an English space beside its own characters, and keeps it beside Latin', () => {
  assert.equal(zh.text('Bundle offers '), '组合优惠');
  assert.equal(zh.text(' 2:28 PM in Oranjestad '), '奥拉涅斯塔德 下午 2:28 ');
});

test('an unknown string is left alone', () => {
  assert.equal(es.text('Namkoo SPI-8K-UP'), null);
  assert.equal(es.text('   '), null);
});

test('patterns fill their holes, translating times and known strings', () => {
  assert.equal(es.text('Open now, until 7:00 PM'), 'Abierto ahora, hasta las 7:00 p. m.');
  assert.equal(es.text('Review by Justin Q.'), 'Reseña de Justin Q.');
  assert.equal(zh.text('2:28 PM in Oranjestad'), '奥拉涅斯塔德 下午 2:28');
});

test('holes can move where the language needs them', () => {
  assert.equal(es.text('At 5,000 points, everything is 10% off'), 'Con 5,000 puntos, todo tiene 10% de descuento');
  assert.equal(zh.text('At 5,000 points, everything is 10% off'), '全部 10% 折扣，满 5,000 points');
});

test('a place can ask for its own words for the same English', () => {
  assert.equal(es.text('Visit'), 'Visita la tienda');
  assert.equal(es.text('Visit ', 'site'), 'Visita ');
  assert.equal(es.text('Bundle offers', 'site'), 'Ofertas en combo');
});

test('times read the way each language says them', () => {
  assert.equal(localTime('es', '9:00 AM'), '9:00 a. m.');
  assert.equal(localTime('zh', '9:00 AM'), '上午 9:00');
  assert.equal(localTime('zh', '12:30 PM'), '中午 12:30');
  assert.equal(localTime('zh', '2:00 PM'), '下午 2:00');
  assert.equal(localTime('zh', '7:00 PM'), '晚上 7:00');
  assert.equal(localTime('en', '7:00 PM'), null);
  assert.equal(localTime('es', 'Sunday'), null);
});

test('a translated heading shares out over the English word slots', () => {
  assert.deepEqual(spread('es', 'Compra junto,', 2), ['Compra', 'junto,']);
  assert.deepEqual(spread('es', 'Compra todo junto,', 2), ['Compra', 'todo junto,']);
  assert.deepEqual(spread('es', 'Compra', 3), ['Compra', '', '']);
  assert.deepEqual(spread('zh', '一起购买，', 2), ['一起', '购买，']);
  assert.deepEqual(spread('zh', '少付。', 4), ['少', '付。', '', '']);
});
