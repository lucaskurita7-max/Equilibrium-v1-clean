import assert from 'assert';
import { generateDietPlan } from './dietEngine';
import { getEquivalentFoods } from './substitutions';
import { exportDietPdf } from './pdf';
import { computeMetabolicPlan } from '../metabolic/metabolic';
import { MetabolicInput } from '../metabolic/types';

/*
  Testes unitários para o motor de dieta V1.  Verifica se o plano é
  gerado corretamente, se as calorias e macros fecham, se o número de
  refeições varia com objetivo e preferências, se as substituições
  retornam alimentos equivalentes e se o PDF é gerado sem erros.
*/

// Criar um input metabólico de exemplo para gerar um MetabolicOutput
const metabolicInput: MetabolicInput = {
  sexo: 'F',
  idade: 30,
  pesoKg: 60,
  alturaM: 1.65,
  sport: 'Fitness',
  nivelAtividade: 'Moderado',
  objetivo: 'Emagrecimento',
};
const metabolic = computeMetabolicPlan(metabolicInput);

// 1. Geração de dieta não deve lançar erro
(() => {
  const plan = generateDietPlan(metabolic);
  assert(plan.meals.length > 0, 'Deve gerar ao menos uma refeição');
  assert(!Number.isNaN(plan.totalKcal), 'Calorias totais não devem ser NaN');
})();

// 2. Calorias totais devem se aproximar da meta (±5%)
(() => {
  const plan = generateDietPlan(metabolic);
  const diff = Math.abs(plan.totalKcal - metabolic.kcalTarget);
  assert(diff / metabolic.kcalTarget <= 0.05, `Desvio calórico ${diff} maior que 5%`);
})();

// 3. Macros fecham calorias (dentro de tolerância)
(() => {
  const plan = generateDietPlan(metabolic);
  const calcCalories = plan.totalProtein * 4 + plan.totalCarbs * 4 + plan.totalFat * 9;
  assert(Math.abs(calcCalories - plan.totalKcal) <= plan.totalKcal * 0.1, 'Macros não fecham calorias dentro de 10%');
})();

// 4. Número de refeições varia com objetivo/jejum
(() => {
  // Hipertrofia deve gerar 5 refeições
  const inputBulk: MetabolicInput = { ...metabolicInput, objetivo: 'Hipertrofia' };
  const metabolicBulk = computeMetabolicPlan(inputBulk);
  const planBulk = generateDietPlan(metabolicBulk);
  assert.strictEqual(planBulk.meals.length, 5);
  // Jejum deve gerar 3 refeições
  const planFasting = generateDietPlan(metabolic, { preferenciaDieta: 'Jejum' });
  assert.strictEqual(planFasting.meals.length, 3);
})();

// 5. Substituições retornam equivalentes para arroz
(() => {
  const eq = getEquivalentFoods('arroz_branco');
  assert(eq.length > 0, 'Arroz deve ter substitutos');
  assert(eq.every(f => f.grupo === 'carbo'), 'Substitutos devem ser do mesmo grupo');
})();

// 6. PDF é gerado sem crash
(() => {
  const plan = generateDietPlan(metabolic);
  const pdfBufferPromise = exportDietPdf({ name: 'Teste', date: new Date().toISOString().split('T')[0] }, metabolic, plan);
  return pdfBufferPromise.then(buffer => {
    assert(buffer instanceof Buffer, 'PDF deve retornar Buffer');
    assert(buffer.length > 0, 'PDF não deve estar vazio');
  });
})();

console.log('All diet engine tests passed');