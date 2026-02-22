"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const dietEngine_1 = require("./dietEngine");
const substitutions_1 = require("./substitutions");
const pdf_1 = require("./pdf");
const metabolic_1 = require("../metabolic/metabolic");
/*
  Testes unitários para o motor de dieta V1.  Verifica se o plano é
  gerado corretamente, se as calorias e macros fecham, se o número de
  refeições varia com objetivo e preferências, se as substituições
  retornam alimentos equivalentes e se o PDF é gerado sem erros.
*/
// Criar um input metabólico de exemplo para gerar um MetabolicOutput
const metabolicInput = {
    sexo: 'F',
    idade: 30,
    pesoKg: 60,
    alturaM: 1.65,
    sport: 'Fitness',
    nivelAtividade: 'Moderado',
    objetivo: 'Emagrecimento',
};
const metabolic = (0, metabolic_1.computeMetabolicPlan)(metabolicInput);
// 1. Geração de dieta não deve lançar erro
(() => {
    const plan = (0, dietEngine_1.generateDietPlan)(metabolic);
    (0, assert_1.default)(plan.meals.length > 0, 'Deve gerar ao menos uma refeição');
    (0, assert_1.default)(!Number.isNaN(plan.totalKcal), 'Calorias totais não devem ser NaN');
})();
// 2. Calorias totais devem se aproximar da meta (±5%)
(() => {
    const plan = (0, dietEngine_1.generateDietPlan)(metabolic);
    const diff = Math.abs(plan.totalKcal - metabolic.kcalTarget);
    (0, assert_1.default)(diff / metabolic.kcalTarget <= 0.05, `Desvio calórico ${diff} maior que 5%`);
})();
// 3. Macros fecham calorias (dentro de tolerância)
(() => {
    const plan = (0, dietEngine_1.generateDietPlan)(metabolic);
    const calcCalories = plan.totalProtein * 4 + plan.totalCarbs * 4 + plan.totalFat * 9;
    (0, assert_1.default)(Math.abs(calcCalories - plan.totalKcal) <= plan.totalKcal * 0.1, 'Macros não fecham calorias dentro de 10%');
})();
// 4. Número de refeições varia com objetivo/jejum
(() => {
    // Hipertrofia deve gerar 5 refeições
    const inputBulk = { ...metabolicInput, objetivo: 'Hipertrofia' };
    const metabolicBulk = (0, metabolic_1.computeMetabolicPlan)(inputBulk);
    const planBulk = (0, dietEngine_1.generateDietPlan)(metabolicBulk);
    assert_1.default.strictEqual(planBulk.meals.length, 5);
    // Jejum deve gerar 3 refeições
    const planFasting = (0, dietEngine_1.generateDietPlan)(metabolic, { preferenciaDieta: 'Jejum' });
    assert_1.default.strictEqual(planFasting.meals.length, 3);
})();
// 5. Substituições retornam equivalentes para arroz
(() => {
    const eq = (0, substitutions_1.getEquivalentFoods)('arroz_branco');
    (0, assert_1.default)(eq.length > 0, 'Arroz deve ter substitutos');
    (0, assert_1.default)(eq.every(f => f.grupo === 'carbo'), 'Substitutos devem ser do mesmo grupo');
})();
// 6. PDF é gerado sem crash
(() => {
    const plan = (0, dietEngine_1.generateDietPlan)(metabolic);
    const pdfBufferPromise = (0, pdf_1.exportDietPdf)({ name: 'Teste', date: new Date().toISOString().split('T')[0] }, metabolic, plan);
    return pdfBufferPromise.then(buffer => {
        (0, assert_1.default)(buffer instanceof Buffer, 'PDF deve retornar Buffer');
        (0, assert_1.default)(buffer.length > 0, 'PDF não deve estar vazio');
    });
})();
console.log('All diet engine tests passed');
