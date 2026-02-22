import assert from 'assert';
import {
  bmrMifflinStJeor,
  bmrHarrisBenedict,
  bmrFromLeanBodyMass,
  calculateLeanBodyMass,
  activityMultiplier,
  calculateTDEE,
  applyDietStrategy,
  calculateMacros,
} from '../src/services/metabolic';
import { ActivityLevel, DietStrategy } from '../src/services/types';

/*
  Simple unit tests to ensure the metabolic functions behave as expected.
  These tests are not exhaustive but cover typical scenarios.
*/

// Test BMR calculations for a 70 kg, 175 cm, 25 y male
const weightKg = 70;
const heightCm = 175;
const ageYears = 25;

// Mifflin–St Jeor
const bmrMifflinMale = bmrMifflinStJeor(weightKg, heightCm, ageYears, 'male');
assert(Math.abs(bmrMifflinMale - 1675.05) < 0.01, `Mifflin male BMR unexpected: ${bmrMifflinMale}`);

const bmrMifflinFemale = bmrMifflinStJeor(weightKg, heightCm, ageYears, 'female');
assert(Math.abs(bmrMifflinFemale - 1509.05) < 0.01, `Mifflin female BMR unexpected: ${bmrMifflinFemale}`);

// Harris–Benedict revised
const bmrHarrisMale = bmrHarrisBenedict(weightKg, heightCm, ageYears, 'male');
assert(Math.abs(bmrHarrisMale - 1724.052) < 0.01, `Harris male BMR unexpected: ${bmrHarrisMale}`);

const bmrHarrisFemale = bmrHarrisBenedict(weightKg, heightCm, ageYears, 'female');
assert(Math.abs(bmrHarrisFemale - 1506.083) < 0.01, `Harris female BMR unexpected: ${bmrHarrisFemale}`);

// Lean body mass and Cunningham
const bodyFatPercent = 20;
const lbm = calculateLeanBodyMass(weightKg, bodyFatPercent);
assert(Math.abs(lbm - 56) < 0.001, `Lean body mass incorrect: ${lbm}`);

const rmrKatch = bmrFromLeanBodyMass(lbm, false);
assert(Math.abs(rmrKatch - (370 + 21.6 * 56)) < 0.01, `Katch RMR unexpected: ${rmrKatch}`);

const rmrCunningham = bmrFromLeanBodyMass(lbm, true);
assert(Math.abs(rmrCunningham - (500 + 22 * 56)) < 0.01, `Cunningham RMR unexpected: ${rmrCunningham}`);

// Activity multipliers
assert.strictEqual(activityMultiplier(ActivityLevel.Sedentary), 1.2);
assert.strictEqual(activityMultiplier(ActivityLevel.Light), 1.375);
assert.strictEqual(activityMultiplier(ActivityLevel.Moderate), 1.55);
assert.strictEqual(activityMultiplier(ActivityLevel.High), 1.725);
assert.strictEqual(activityMultiplier(ActivityLevel.VeryHigh), 1.9);

// TDEE and strategy application
const tdeeModerate = calculateTDEE(bmrMifflinMale, ActivityLevel.Moderate);
assert(Math.abs(tdeeModerate - (bmrMifflinMale * 1.55)) < 0.01);

const targetDeficit = applyDietStrategy(tdeeModerate, DietStrategy.Deficit);
assert(Math.abs(targetDeficit - (tdeeModerate - 500)) < 0.01);

const targetSurplus = applyDietStrategy(tdeeModerate, DietStrategy.Surplus);
assert(Math.abs(targetSurplus - (tdeeModerate + 200)) < 0.01);

const targetPerformance = applyDietStrategy(tdeeModerate, DietStrategy.Performance);
assert(Math.abs(targetPerformance - (tdeeModerate * 1.1)) < 0.01);

// Macro calculation test for deficit strategy
const macros = calculateMacros({ weightKg, targetCalories: targetDeficit, strategy: DietStrategy.Deficit });
// protein per kg 1.2, so 84 g; fat min 0.55 g/kg = 38.5 g; remainder for carbs
assert.strictEqual(macros.proteinGrams, Math.round(70 * 1.2));
assert.strictEqual(macros.fatGrams, Math.round(70 * 0.55));
// calories should match target (rounded)
assert(Math.abs(macros.calories - Math.round(targetDeficit)) <= 1);

console.log('All tests passed');