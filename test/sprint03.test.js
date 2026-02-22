const assert = require('assert');

// Importar as versões compiladas dos módulos para testes em Node.
const { computeMetabolicPlan } = require('../build/core/metabolic/metabolic');
const { generateDietPlan } = require('../build/core/diet/dietEngine');
const { generatePdf } = require('../build/api/pdf');

/*
  Testes da Sprint 03 – Integração completa da plataforma profissional.

  Estes testes simulam o fluxo completo da aplicação sem a camada
  visual.  É criada uma entrada metabólica, o paciente é gravado em
  uma memória simulada (sessionStorage), o cálculo metabólico é
  executado, o plano de dieta é gerado, o PDF é exportado e todas
  as partes são validadas.  Além disso, verifica‑se que a gravação
  e recuperação de pacientes via sessionStorage funciona conforme o
  esperado.
*/

// Simula a API de sessionStorage em ambiente Node.  Cada chamada de
// teste criará um novo objeto de armazenamento para garantir
// isolamento entre os testes.
function setupSessionStorage() {
  const store = {};
  global.sessionStorage = {
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null;
    },
    setItem(key, value) {
      store[key] = value;
    },
    removeItem(key) {
      delete store[key];
    },
    clear() {
      Object.keys(store).forEach(k => delete store[k]);
    },
  };
  return store;
}

// 1. Fluxo completo cria paciente sem erro
(() => {
  setupSessionStorage();
  const input = {
    sexo: 'F',
    idade: 28,
    pesoKg: 65,
    alturaM: 1.70,
    sport: 'Fitness',
    nivelAtividade: 'Moderado',
    objetivo: 'Recomposicao',
  };
  const metabolic = computeMetabolicPlan(input);
  // Persistir paciente em sessionStorage
  const patients = [{ id: 1, name: 'Paciente A', input, metabolic }];
  sessionStorage.setItem('patients', JSON.stringify(patients));
  // Recuperar
  const stored = JSON.parse(sessionStorage.getItem('patients') || '[]');
  assert.strictEqual(stored.length, 1, 'Deveria haver 1 paciente armazenado');
  assert.strictEqual(stored[0].name, 'Paciente A');
  // Verificar que o cálculo metabólico resultou em campos esperados
  assert(typeof stored[0].metabolic.bmr === 'number' && stored[0].metabolic.bmr > 0, 'TMB deve ser número > 0');
  assert(typeof stored[0].metabolic.kcalTarget === 'number' && stored[0].metabolic.kcalTarget > 0, 'kcal alvo deve ser número > 0');
})();

// 2. Cálculo metabólico aparece coerente (macro não negativo)
(() => {
  const input = {
    sexo: 'M',
    idade: 35,
    pesoKg: 80,
    alturaM: 1.80,
    sport: 'ForcaHipertrofia',
    nivelAtividade: 'Alto',
    objetivo: 'Hipertrofia',
  };
  const metabolic = computeMetabolicPlan(input);
  // Assegurar que macros não ficam negativos
  assert(metabolic.proteinG >= 0);
  assert(metabolic.fatG >= 0);
  assert(metabolic.carbG >= 0);
})();

// 3. Dieta é gerada corretamente (calorias e macros)
(() => {
  const input = {
    sexo: 'F',
    idade: 30,
    pesoKg: 60,
    alturaM: 1.65,
    sport: 'Fitness',
    nivelAtividade: 'Moderado',
    objetivo: 'Emagrecimento',
  };
  const metabolic = computeMetabolicPlan(input);
  const plan = generateDietPlan(metabolic);
  // Deve gerar refeições
  assert(plan.meals.length > 0, 'Plano deve ter pelo menos uma refeição');
  // Calorias totais ≈ meta (±5%)
  const diff = Math.abs(plan.totalKcal - metabolic.kcalTarget);
  assert(diff / metabolic.kcalTarget <= 0.05, `Desvio calórico ${diff} maior que 5%`);
  // Macros fecham calorias (dentro de 10%)
  const calcCalories = plan.totalProtein * 4 + plan.totalCarbs * 4 + plan.totalFat * 9;
  assert(Math.abs(calcCalories - plan.totalKcal) <= plan.totalKcal * 0.1, 'Macros não fecham calorias dentro de 10%');
})();

// 4. Endpoint (generatePdf) retorna arquivo válido
(() => {
  const input = {
    sexo: 'F',
    idade: 30,
    pesoKg: 60,
    alturaM: 1.65,
    sport: 'Fitness',
    nivelAtividade: 'Moderado',
    objetivo: 'Emagrecimento',
  };
  const metabolic = computeMetabolicPlan(input);
  const plan = generateDietPlan(metabolic);
  const patient = {
    name: 'Teste Sprint03',
    date: new Date().toISOString().split('T')[0],
    pesoKg: input.pesoKg,
    alturaM: input.alturaM,
    bfPercent: input.bfPercent,
  };
  return generatePdf({ patient, metabolic, dietPlan: plan }).then(buffer => {
    assert(buffer instanceof Buffer, 'PDF deve retornar Buffer');
    assert(buffer.length > 0, 'PDF não pode ser vazio');
  });
})();

console.log('All Sprint03 tests passed');