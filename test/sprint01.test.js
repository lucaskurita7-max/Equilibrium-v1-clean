const assert = require('assert');
const {
  calcularTMB,
  calcularGET,
  calcularKcalAlvo,
  calcularMacros,
  gerarPlanoMetabolico,
} = require('../build/services/metabolic');
const { }
  = require('../build/services/types');

/*
  Testes unitários para a Sprint 01 – Núcleo Metabólico V1.
  Cada teste verifica uma parte crítica da especificação.
*/

// Helper to build input objects
function makeInput(overrides = {}) {
  return Object.assign({
    sexo: 'F',
    idade: 30,
    pesoKg: 60,
    alturaM: 1.65,
    sport: 'Fitness',
    nivelAtividade: 'Sedentario',
    objetivo: 'Emagrecimento',
  }, overrides);
}

// 1. Mifflin mulher 31a 59kg 1.60m (faixa plausível)
(() => {
  const input = makeInput({ sexo: 'F', idade: 31, pesoKg: 59, alturaM: 1.60 });
  const { valor, metodo } = calcularTMB(input);
  // Mifflin should be selected
  assert.strictEqual(metodo, 'Mifflin');
  // expected TMB ~1274 kcal/dia
  assert(Math.abs(valor - 1274) < 1, `TMB esperado ~1274, obtido ${valor}`);
})();

// 2. Mifflin homem 30a 80kg 1.80m
(() => {
  const input = makeInput({ sexo: 'M', idade: 30, pesoKg: 80, alturaM: 1.80 });
  const { valor, metodo } = calcularTMB(input);
  assert.strictEqual(metodo, 'Mifflin');
  const expected = 10 * 80 + 6.25 * 180 - 5 * 30 + 5;
  assert(Math.abs(valor - expected) < 1, `TMB masculino esperado ${expected}, obtido ${valor}`);
})();

// 3. Cunningham com FFM conhecida
(() => {
  const input = makeInput({ sexo: 'M', massaMagraKg: 60 });
  const { valor, metodo, ffm } = calcularTMB(input);
  assert.strictEqual(metodo, 'Cunningham');
  assert.strictEqual(ffm, 60);
  const expected = 500 + 22 * 60;
  assert(Math.abs(valor - expected) < 1);
})();

// 4. GET com Moderado + Endurance (aplica ajuste)
(() => {
  const input = makeInput({ pesoKg: 59, alturaM: 1.60, idade: 31, nivelAtividade: 'Moderado', sport: 'Endurance' });
  const { valor } = calcularTMB(input);
  const get = calcularGET(valor, input.nivelAtividade, input.sport);
  const expected = valor * 1.55 * 1.03;
  assert(Math.abs(get - expected) < 0.1, `GET esperado ${expected}, obtido ${get}`);
})();

// 5. Estratégia emagrecimento respeita déficit máximo (<=25%)
(() => {
  const input = makeInput({ sexo: 'M', objetivo: 'Emagrecimento' });
  // assumir GET de 2000 kcal
  const get = 2000;
  const { kcalAlvo } = calcularKcalAlvo(get, input);
  const deficit = get - kcalAlvo;
  assert(deficit / get <= 0.25 + 1e-6, `Déficit ${deficit} excede 25% de ${get}`);
})();

// 6. Guardrail kcal mínima funcionando
(() => {
  // mulher com GET muito baixo
  const input = makeInput({ sexo: 'F', objetivo: 'Emagrecimento' });
  const get = 800;
  const { kcalAlvo, warnings } = calcularKcalAlvo(get, input);
  assert.strictEqual(kcalAlvo, 1200);
  assert(warnings.some(w => w.includes('mínimo')), 'Esperava aviso de calorias mínimas');
})();

// 7. Macro fecha kcal (erro <= 50)
(() => {
  const input = makeInput({ sexo: 'F', idade: 31, pesoKg: 59, alturaM: 1.60, objetivo: 'Emagrecimento', nivelAtividade: 'Moderado', sport: 'Fitness' });
  const plano = gerarPlanoMetabolico(input);
  // Recalcular calorias a partir dos macros
  const recalculated = plano.macros.proteinGrams * 4 + plano.macros.fatGrams * 9 + plano.macros.carbGrams * 4;
  assert(Math.abs(recalculated - plano.kcalAlvo) <= 50, `Macro erro ${Math.abs(recalculated - plano.kcalAlvo)} > 50 kcal`);
})();

// 8. Carbo não fica negativo (ou gera warning e corrige)
(() => {
  const input = makeInput({ sexo: 'F', pesoKg: 100, objetivo: 'Emagrecimento' });
  // alvo calórico muito baixo para gerar carbo negativo
  const kcalAlvo = 1000;
  const { macros, warnings } = calcularMacros(input, kcalAlvo);
  assert(macros.carbGrams >= 0);
  // Se carb zerou, deve ter warning
  if (macros.carbGrams === 0) {
    assert(warnings.length > 0);
  }
})();

console.log('All Sprint01 tests passed');