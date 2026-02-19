"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const metabolic_1 = require("../src/services/metabolic");
const types_1 = require("../src/services/types");
/*
  Simple unit tests to ensure the metabolic functions behave as expected.
  These tests are not exhaustive but cover typical scenarios.
*/
// Test BMR calculations for a 70 kg, 175 cm, 25 y male
const weightKg = 70;
const heightCm = 175;
const ageYears = 25;
// Mifflin–St Jeor
const bmrMifflinMale = (0, metabolic_1.bmrMifflinStJeor)(weightKg, heightCm, ageYears, 'male');
(0, assert_1.default)(Math.abs(bmrMifflinMale - 1675.05) < 0.01, `Mifflin male BMR unexpected: ${bmrMifflinMale}`);
const bmrMifflinFemale = (0, metabolic_1.bmrMifflinStJeor)(weightKg, heightCm, ageYears, 'female');
(0, assert_1.default)(Math.abs(bmrMifflinFemale - 1509.05) < 0.01, `Mifflin female BMR unexpected: ${bmrMifflinFemale}`);
// Harris–Benedict revised
const bmrHarrisMale = (0, metabolic_1.bmrHarrisBenedict)(weightKg, heightCm, ageYears, 'male');
(0, assert_1.default)(Math.abs(bmrHarrisMale - 1724.052) < 0.01, `Harris male BMR unexpected: ${bmrHarrisMale}`);
const bmrHarrisFemale = (0, metabolic_1.bmrHarrisBenedict)(weightKg, heightCm, ageYears, 'female');
(0, assert_1.default)(Math.abs(bmrHarrisFemale - 1506.083) < 0.01, `Harris female BMR unexpected: ${bmrHarrisFemale}`);
// Lean body mass and Cunningham
const bodyFatPercent = 20;
const lbm = (0, metabolic_1.calculateLeanBodyMass)(weightKg, bodyFatPercent);
(0, assert_1.default)(Math.abs(lbm - 56) < 0.001, `Lean body mass incorrect: ${lbm}`);
const rmrKatch = (0, metabolic_1.bmrFromLeanBodyMass)(lbm, false);
(0, assert_1.default)(Math.abs(rmrKatch - (370 + 21.6 * 56)) < 0.01, `Katch RMR unexpected: ${rmrKatch}`);
const rmrCunningham = (0, metabolic_1.bmrFromLeanBodyMass)(lbm, true);
(0, assert_1.default)(Math.abs(rmrCunningham - (500 + 22 * 56)) < 0.01, `Cunningham RMR unexpected: ${rmrCunningham}`);
// Activity multipliers
assert_1.default.strictEqual((0, metabolic_1.activityMultiplier)(types_1.ActivityLevel.Sedentary), 1.2);
assert_1.default.strictEqual((0, metabolic_1.activityMultiplier)(types_1.ActivityLevel.Light), 1.375);
assert_1.default.strictEqual((0, metabolic_1.activityMultiplier)(types_1.ActivityLevel.Moderate), 1.55);
assert_1.default.strictEqual((0, metabolic_1.activityMultiplier)(types_1.ActivityLevel.High), 1.725);
assert_1.default.strictEqual((0, metabolic_1.activityMultiplier)(types_1.ActivityLevel.VeryHigh), 1.9);
// TDEE and strategy application
const tdeeModerate = (0, metabolic_1.calculateTDEE)(bmrMifflinMale, types_1.ActivityLevel.Moderate);
(0, assert_1.default)(Math.abs(tdeeModerate - (bmrMifflinMale * 1.55)) < 0.01);
const targetDeficit = (0, metabolic_1.applyDietStrategy)(tdeeModerate, types_1.DietStrategy.Deficit);
(0, assert_1.default)(Math.abs(targetDeficit - (tdeeModerate - 500)) < 0.01);
const targetSurplus = (0, metabolic_1.applyDietStrategy)(tdeeModerate, types_1.DietStrategy.Surplus);
(0, assert_1.default)(Math.abs(targetSurplus - (tdeeModerate + 200)) < 0.01);
const targetPerformance = (0, metabolic_1.applyDietStrategy)(tdeeModerate, types_1.DietStrategy.Performance);
(0, assert_1.default)(Math.abs(targetPerformance - (tdeeModerate * 1.1)) < 0.01);
// Macro calculation test for deficit strategy
const macros = (0, metabolic_1.calculateMacros)({ weightKg, targetCalories: targetDeficit, strategy: types_1.DietStrategy.Deficit });
// protein per kg 1.2, so 84 g; fat min 0.55 g/kg = 38.5 g; remainder for carbs
assert_1.default.strictEqual(macros.proteinGrams, Math.round(70 * 1.2));
assert_1.default.strictEqual(macros.fatGrams, Math.round(70 * 0.55));
// calories should match target (rounded)
(0, assert_1.default)(Math.abs(macros.calories - Math.round(targetDeficit)) <= 1);
console.log('All tests passed');
