"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const metabolic_1 = require("./metabolic");
/*
  Testes unitários para a implementação do núcleo metabólico V1.
  Estes testes verificam as equações de TMB, o cálculo de TDEE,
  a aplicação da estratégia calórica, os guardrails e o cálculo de
  macronutrientes.
*/
// Helper para construir um input com valores padrão
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
// 1. Mifflin mulher 31a 59kg 1.60m
(() => {
    const input = makeInput({ sexo: 'F', idade: 31, pesoKg: 59, alturaM: 1.6 });
    const result = (0, metabolic_1.pickBmrMethod)(input);
    assert_1.default.strictEqual(result.method, 'Mifflin');
    (0, assert_1.default)(Math.abs(result.value - 1274) < 1, `TMB esperado ~1274, obtido ${result.value}`);
})();
// 2. Mifflin homem 30a 80kg 1.80m
(() => {
    const input = makeInput({ sexo: 'M', idade: 30, pesoKg: 80, alturaM: 1.8 });
    const result = (0, metabolic_1.pickBmrMethod)(input);
    assert_1.default.strictEqual(result.method, 'Mifflin');
    const expected = 10 * 80 + 6.25 * 180 - 5 * 30 + 5;
    (0, assert_1.default)(Math.abs(result.value - expected) < 1);
})();
// 3. Cunningham com massa magra conhecida
(() => {
    const input = makeInput({ sexo: 'M', massaMagraKg: 60 });
    const result = (0, metabolic_1.pickBmrMethod)(input);
    assert_1.default.strictEqual(result.method, 'Cunningham');
    assert_1.default.strictEqual(result.ffm, 60);
    const expected = (0, metabolic_1.bmrCunningham)(60);
    (0, assert_1.default)(Math.abs(result.value - expected) < 1);
})();
// 4. GET com Moderado + Endurance (aplica ajuste)
(() => {
    const input = makeInput({ idade: 31, pesoKg: 59, alturaM: 1.6, nivelAtividade: 'Moderado', sport: 'Endurance' });
    const bmr = (0, metabolic_1.bmrMifflin)(input);
    const tdeeNoAdj = bmr * (0, metabolic_1.activityFactor)('Moderado');
    const tdeeAdj = (0, metabolic_1.applySportAdj)(tdeeNoAdj, 'Endurance');
    // Valor do GET via compute
    const plan = (0, metabolic_1.computeMetabolicPlan)(input);
    (0, assert_1.default)(Math.abs(plan.tdee - Math.round(tdeeAdj)) <= 1);
})();
// 5. Estratégia emagrecimento respeita déficit máximo
(() => {
    const tdee = 2000;
    const goal = 'Emagrecimento';
    const level = 'Moderado';
    const target = (0, metabolic_1.calcKcalTarget)(tdee, goal, level);
    // aplicar guardrails manualmente
    const deficit = tdee - target;
    (0, assert_1.default)(deficit / tdee <= 0.25 + 1e-6, `Déficit ${deficit} excede 25%`);
})();
// 6. Guardrail kcal mínima funcionando (mulher)
(() => {
    const input = makeInput({ sexo: 'F', objetivo: 'Emagrecimento' });
    // tdee muito baixo
    const plan = (0, metabolic_1.computeMetabolicPlan)({ ...input, pesoKg: 40, alturaM: 1.5 });
    (0, assert_1.default)(plan.kcalTarget >= 1200);
    (0, assert_1.default)(plan.warnings.some(w => w.includes('mínimo')));
})();
// 7. Macro fecha kcal (erro <= 50)
(() => {
    const input = makeInput({ sexo: 'F', idade: 31, pesoKg: 59, alturaM: 1.6, objetivo: 'Emagrecimento', nivelAtividade: 'Moderado', sport: 'Fitness' });
    const plan = (0, metabolic_1.computeMetabolicPlan)(input);
    const totalCal = plan.proteinG * 4 + plan.fatG * 9 + plan.carbG * 4;
    (0, assert_1.default)(Math.abs(totalCal - plan.kcalTarget) <= 50);
})();
// 8. Carbo não fica negativo
(() => {
    const input = makeInput({ sexo: 'F', pesoKg: 100, objetivo: 'Emagrecimento' });
    // força um alvo calórico baixo
    const plan = (0, metabolic_1.computeMetabolicPlan)({ ...input, alturaM: 1.4 });
    (0, assert_1.default)(plan.carbG >= 0);
    if (plan.carbG === 0) {
        (0, assert_1.default)(plan.warnings.length > 0);
    }
})();
// 9. Altura faltando força fallback Harris
(() => {
    const input = makeInput({ alturaM: 0 });
    const result = (0, metabolic_1.pickBmrMethod)(input);
    assert_1.default.strictEqual(result.method, 'HarrisBenedict');
})();
// 10. MassaMagra presente escolhe Cunningham
(() => {
    const input = makeInput({ massaMagraKg: 50 });
    const result = (0, metabolic_1.pickBmrMethod)(input);
    assert_1.default.strictEqual(result.method, 'Cunningham');
})();
console.log('All metabolic tests passed');
