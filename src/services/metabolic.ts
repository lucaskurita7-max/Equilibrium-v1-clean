import { Sex, ActivityLevel, DietStrategy, MacroOptions, MacronutrientBreakdown } from './types';

/**
 * Calculates BMR using the Mifflin–St Jeor equation.  This formula was
 * published in 1990 and is considered more accurate for contemporary
 * populations than the original Harris–Benedict equation【144321122992794†L89-L96】.
 *
 *  BMR = (9.99 × weight [kg]) + (6.25 × height [cm]) − (4.92 × age [y]) + s
 *
 * Where s is +5 for males and −161 for females【144321122992794†L89-L96】.
 */
export function bmrMifflinStJeor(weightKg: number, heightCm: number, ageYears: number, sex: Sex): number {
  const base = (9.99 * weightKg) + (6.25 * heightCm) - (4.92 * ageYears);
  const s = sex === 'male' ? 5 : -161;
  return base + s;
}

/**
 * Calculates BMR using the revised Harris–Benedict equation (Roza & Shizgal, 1984).
 * The equation uses separate coefficients for men and women【6071260600918†L139-L156】.
 *
 *  Men:    BMR = 88.362 + 13.397 × weight [kg] + 4.799 × height [cm] − 5.677 × age [y]
 *  Women:  BMR = 447.593 + 9.247 × weight [kg] + 3.098 × height [cm] − 4.330 × age [y]
 */
export function bmrHarrisBenedict(weightKg: number, heightCm: number, ageYears: number, sex: Sex): number {
  if (sex === 'male') {
    return 88.362 + 13.397 * weightKg + 4.799 * heightCm - 5.677 * ageYears;
  }
  return 447.593 + 9.247 * weightKg + 3.098 * heightCm - 4.330 * ageYears;
}

/**
 * Calculates resting metabolic rate (RMR) using the Katch–McArdle / Cunningham formula
 * based on lean body mass (LBM).  When body composition data is available,
 * this method is preferable because it accounts for differences in muscle mass【475935534575796†L432-L448】.
 *
 * Katch–McArdle: RMR = 370 + 21.6 × LBM
 * Cunningham:    RMR = 500 + 22 × LBM【144321122992794†L150-L165】
 *
 * The caller can select which variant to use via the `useCunningham` flag.
 */
export function bmrFromLeanBodyMass(lbmKg: number, useCunningham = false): number {
  if (useCunningham) {
    return 500 + 22 * lbmKg;
  }
  return 370 + 21.6 * lbmKg;
}

/**
 * Derives lean body mass (LBM) from total weight and body fat percentage.
 * LBM = weight × (1 - bodyFatPercent/100)【475935534575796†L432-L448】.
 */
export function calculateLeanBodyMass(weightKg: number, bodyFatPercent: number): number {
  return weightKg * (1 - bodyFatPercent / 100);
}

/**
 * Returns the activity multiplier for a given activity level.  These multipliers
 * follow the ISSA/NASM recommendations for scaling BMR into TDEE【6071260600918†L139-L156】.
 */
export function activityMultiplier(level: ActivityLevel): number {
  switch (level) {
    case ActivityLevel.Sedentary:
      return 1.2;
    case ActivityLevel.Light:
      return 1.375;
    case ActivityLevel.Moderate:
      return 1.55;
    case ActivityLevel.High:
      return 1.725;
    case ActivityLevel.VeryHigh:
      return 1.9;
    default:
      return 1.0;
  }
}

/**
 * Computes total daily energy expenditure (TDEE) by multiplying BMR by the
 * activity factor and then applying an optional sport adjustment (extra
 * calories for a specific sport or training volume).  The activity factor
 * comes from established guidelines【6071260600918†L139-L156】.
 */
export function calculateTDEE(bmr: number, level: ActivityLevel, sportAdjustment = 0): number {
  return bmr * activityMultiplier(level) + sportAdjustment;
}

/**
 * Computes a target caloric intake by applying a strategy‑dependent adjustment to
 * TDEE.  A moderate deficit (~500 kcal) is applied for fat‑loss, a small
 * deficit (~200 kcal) for recomposition, a small surplus (~200 kcal) for lean
 * gains, and a larger surplus (~10% of TDEE) for performance.  These
 * adjustments draw on common coaching practice and general recommendations
 * found in sports nutrition literature【6071260600918†L239-L248】.
 */
export function applyDietStrategy(tdee: number, strategy: DietStrategy): number {
  switch (strategy) {
    case DietStrategy.Deficit:
      return tdee - 500; // moderate deficit for fat loss【6071260600918†L239-L241】
    case DietStrategy.Recomposition:
      return tdee - 200; // slight deficit for body recomposition
    case DietStrategy.Surplus:
      return tdee + 200; // small surplus for lean gains
    case DietStrategy.Performance:
      return tdee * 1.1; // 10% surplus for high‑performance training【6071260600918†L239-L248】
    default:
      return tdee;
  }
}

/**
 * Calculates a macronutrient breakdown based on weight, total calories and
 * dietary strategy.  Protein and fat targets are set using ranges from
 * clinical nutrition guidance: 0.8 g/kg for maintenance, 1–1.2 g/kg for
 * recomposition/weight loss, 1–1.5 g/kg for muscle gain and performance【467877799346439†L126-L139】.
 * Minimum fat intake is derived from 0.25 g per pound (~0.55 g/kg) of body
 * weight【380003717717322†L120-L124】.  Carbohydrates fill the remaining
 * calories after protein and fat are allocated.
 *
 * The function returns grams of protein, fat and carbohydrates along with the
 * total calories (rounded to the nearest whole number).
 */
export function calculateMacros(options: MacroOptions): MacronutrientBreakdown {
  const { weightKg, targetCalories, strategy } = options;

  // Determine protein grams per kilogram based on strategy
  let proteinPerKg: number;
  switch (strategy) {
    case DietStrategy.Deficit:
      proteinPerKg = 1.2; // higher protein to preserve muscle during deficit【467877799346439†L126-L139】
      break;
    case DietStrategy.Recomposition:
      proteinPerKg = 1.0;
      break;
    case DietStrategy.Surplus:
      proteinPerKg = 1.4; // support muscle growth
      break;
    case DietStrategy.Performance:
      proteinPerKg = 1.5; // high protein for athletes
      break;
    default:
      proteinPerKg = 0.8;
      break;
  }
  const proteinGrams = weightKg * proteinPerKg;

  // Minimum fat: 0.55 g per kg (0.25 g/lb)【380003717717322†L120-L124】
  // Increase slightly for surplus/performance
  let fatPerKg = 0.55;
  if (strategy === DietStrategy.Surplus || strategy === DietStrategy.Performance) {
    fatPerKg = 0.8;
  }
  const fatGrams = weightKg * fatPerKg;

  // Calculate calories contributed by protein and fat
  const proteinCalories = proteinGrams * 4;
  const fatCalories = fatGrams * 9;

  // Carbohydrates get the remaining calories (4 kcal/g)
  const remainingCalories = targetCalories - (proteinCalories + fatCalories);
  const carbGrams = remainingCalories > 0 ? remainingCalories / 4 : 0;

  return {
    calories: Math.round(targetCalories),
    proteinGrams: Math.round(proteinGrams),
    fatGrams: Math.round(fatGrams),
    carbGrams: Math.round(carbGrams),
  };
}

// -----------------------------------------------------------------------------
//  Novo núcleo metabólico V1 (Português)
//
//  As funções abaixo implementam as regras descritas na Sprint 01 para o núcleo
//  metabólico V1: definição de TMB (Mifflin/Harris/Cunningham), GET com
//  ajustes por nível de atividade e esporte, estratégia calórica por objetivo
//  (com guardrails) e cálculo de macronutrientes.  Todas as funções são
//  puras e operam apenas sobre os valores de entrada fornecidos.

import {
  Sexo,
  MetabolicInput,
  NivelAtividade,
  Sport,
  Objetivo,
  PreferenciaDieta,
} from './types';

/**
 * Converte metros para centímetros.  Aceita números negativos para fins de
 * compatibilidade, embora alturas deva ser positivas.
 */
function metrosParaCentimetros(metros: number): number {
  return metros * 100;
}

/**
 * Calcula o TMB pelo método de Mifflin‑St Jeor conforme o briefing da Sprint 01.
 * homem: 10w + 6.25h - 5a + 5
 * mulher: 10w + 6.25h - 5a - 161
 */
function tmbMifflin(input: MetabolicInput): number {
  const weight = input.pesoKg;
  const heightCm = metrosParaCentimetros(input.alturaM);
  const age = input.idade;
  const s = input.sexo === 'M' ? 5 : -161;
  return 10 * weight + 6.25 * heightCm - 5 * age + s;
}

/**
 * Calcula o TMB usando a equação de Harris–Benedict revisada.  Esta função
 * serve como fallback caso faltem dados para o método principal.  Os
 * coeficientes seguem Roza & Shizgal【6071260600918†L139-L156】.
 */
function tmbHarrisRevisada(input: MetabolicInput): number {
  const weight = input.pesoKg;
  const heightCm = metrosParaCentimetros(input.alturaM);
  const age = input.idade;
  if (input.sexo === 'M') {
    return 88.362 + 13.397 * weight + 4.799 * heightCm - 5.677 * age;
  }
  return 447.593 + 9.247 * weight + 3.098 * heightCm - 4.330 * age;
}

/**
 * Calcula o TMB pelo método de Cunningham quando há massa magra conhecida.
 * Formula: 500 + 22 * FFM (kg).
 */
function tmbCunningham(ffmKg: number): number {
  return 500 + 22 * ffmKg;
}

/**
 * Deriva a massa magra (FFM) usando peso e percentual de gordura.  Retorna
 * undefined se o percentual for inválido.
 */
function derivarMassaMagra(pesoKg: number, bfPercent?: number): number | undefined {
  if (typeof bfPercent === 'number' && bfPercent > 0 && bfPercent < 100) {
    return pesoKg * (1 - bfPercent / 100);
  }
  return undefined;
}

/**
 * Seleciona a equação de TMB a partir dos dados disponíveis.  Prioriza
 * Cunningham quando a massa magra (fornecida ou derivada) está disponível;
 * usa Mifflin como padrão; recorre a Harris revisada se altura ou peso
 * estiverem ausentes.
 */
export function calcularTMB(input: MetabolicInput): { valor: number; metodo: 'Cunningham' | 'Mifflin' | 'Harris'; ffm?: number } {
  // se massaMagraKg for fornecida e válida
  if (typeof input.massaMagraKg === 'number' && input.massaMagraKg > 0) {
    return { valor: tmbCunningham(input.massaMagraKg), metodo: 'Cunningham', ffm: input.massaMagraKg };
  }
  // derivar a partir do percentual de gordura
  const ffm = derivarMassaMagra(input.pesoKg, input.bfPercent);
  if (typeof ffm === 'number') {
    return { valor: tmbCunningham(ffm), metodo: 'Cunningham', ffm };
  }
  // se alturaM ou pesoKg não forem válidos, usar Harris
  if (!(input.alturaM > 0 && input.pesoKg > 0)) {
    return { valor: tmbHarrisRevisada(input), metodo: 'Harris' };
  }
  // caso padrão: Mifflin
  return { valor: tmbMifflin(input), metodo: 'Mifflin' };
}

/**
 * Mapeia o nível de atividade para o multiplicador do GET (TDEE).
 * Valores baseados em recomendações de personal trainers【6071260600918†L139-L156】.
 */
export function fatorAtividade(nivel: NivelAtividade): number {
  switch (nivel) {
    case 'Sedentario':
      return 1.2;
    case 'Leve':
      return 1.375;
    case 'Moderado':
      return 1.55;
    case 'Alto':
      return 1.725;
    case 'MuitoAlto':
      return 1.9;
    default:
      return 1.2;
  }
}

/**
 * Retorna o ajuste percentual adicional sobre o GET devido ao tipo de esporte.
 * Valores simples V1: Endurance (+3%), Intermitente (+2%), Força/Hipertrofia (+1%),
 * outros (Fitness, Clinico) = 0.
 */
export function ajusteEsporte(sport: Sport): number {
  switch (sport) {
    case 'Endurance':
      return 0.03;
    case 'Intermitente':
      return 0.02;
    case 'ForcaHipertrofia':
      return 0.01;
    default:
      return 0;
  }
}

/**
 * Calcula o GET (TDEE) a partir do TMB, do nível de atividade e do esporte.
 */
export function calcularGET(bmr: number, nivel: NivelAtividade, sport: Sport): number {
  const base = bmr * fatorAtividade(nivel);
  const ajuste = ajusteEsporte(sport);
  return base * (1 + ajuste);
}

/**
 * Aplica a estratégia calórica em função do objetivo, incluindo guardrails para
 * déficits excessivos e calorias mínimas.  Retorna o alvo de calorias e
 * eventual lista de advertências.
 */
export function calcularKcalAlvo(get: number, input: MetabolicInput): { kcalAlvo: number; warnings: string[] } {
  let target = get;
  const warnings: string[] = [];
  switch (input.objetivo) {
    case 'Emagrecimento':
      target = get * 0.85; // -15%
      break;
    case 'Recomposicao':
      target = get * 0.95; // -5%
      break;
    case 'Hipertrofia':
      target = get * 1.10; // +10%
      break;
    case 'Performance':
      // 0% ou +5% dependendo do nível de atividade
      if (input.nivelAtividade === 'Alto' || input.nivelAtividade === 'MuitoAlto') {
        target = get * 1.05;
      } else {
        target = get;
      }
      break;
    default:
      target = get;
      break;
  }
  // Guardrail: kcal mínima por sexo
  const minKcal = input.sexo === 'M' ? 1500 : 1200;
  if (target < minKcal) {
    warnings.push(`Calorias ajustadas para mínimo de ${minKcal} kcal/dia`);
    target = minKcal;
  }
  // Guardrail: déficit máximo de 25% do GET
  const deficit = get - target;
  const maxDeficit = get * 0.25;
  if (deficit > maxDeficit) {
    const adjusted = get - maxDeficit;
    warnings.push('Déficit limitado a 25% do GET');
    target = adjusted;
  }
  return { kcalAlvo: target, warnings };
}

/**
 * Calcula os macronutrientes (gramas) de acordo com o objetivo.  Também
 * aplica guardrails para gorduras mínimas e evita carboidrato negativo.
 */
export function calcularMacros(input: MetabolicInput, kcalAlvo: number): { macros: MacronutrientBreakdown; warnings: string[] } {
  const warnings: string[] = [];
  const weight = input.pesoKg;
  // Proteína por kg conforme objetivo
  let protPerKg: number;
  switch (input.objetivo) {
    case 'Emagrecimento':
    case 'Recomposicao':
      protPerKg = 2.0;
      break;
    case 'Hipertrofia':
      protPerKg = 1.8;
      break;
    case 'Performance':
      protPerKg = 1.7;
      break;
    default:
      protPerKg = 2.0;
      break;
  }
  const proteinGrams = weight * protPerKg;
  const proteinCalories = proteinGrams * 4;
  // Gordura mínima por kg: mulheres >= 0.8, homens >= 0.7; teto opcional de 1.2
  const minFatPerKg = input.sexo === 'F' ? 0.8 : 0.7;
  const fatPerKg = minFatPerKg;
  let fatGrams = weight * fatPerKg;
  let fatCalories = fatGrams * 9;
  // Calorias restantes para carboidrato
  let remainingCalories = kcalAlvo - (proteinCalories + fatCalories);
  // Se negativo, tentar reduzir gordura até o mínimo (já estamos no mínimo);
  // Neste caso, setar carboidrato a zero e avisar.
  let carbGrams: number;
  if (remainingCalories < 0) {
    carbGrams = 0;
    remainingCalories = 0;
    warnings.push('Carboidratos ajustados para zero devido a energia insuficiente (verifique calorias e macros)');
  } else {
    carbGrams = remainingCalories / 4;
  }
  const result: MacronutrientBreakdown = {
    calories: Math.round(kcalAlvo),
    proteinGrams: Math.round(proteinGrams),
    fatGrams: Math.round(fatGrams),
    carbGrams: Math.round(carbGrams),
  };
  // Verificar erro calórico após arredondamento
  const recalculatedCalories = result.proteinGrams * 4 + result.fatGrams * 9 + result.carbGrams * 4;
  if (Math.abs(recalculatedCalories - result.calories) > 50) {
    warnings.push('Calorias e macros apresentam erro superior a 50 kcal após arredondamento');
  }
  return { macros: result, warnings };
}

/**
 * Função de alto nível que gera o plano metabólico completo para o V1.
 * Retorna TMB, método utilizado, GET, alvo calórico e macros com avisos.
 */
export function gerarPlanoMetabolico(input: MetabolicInput) {
  const tmb = calcularTMB(input);
  const get = calcularGET(tmb.valor, input.nivelAtividade, input.sport);
  const { kcalAlvo, warnings: warningsKcal } = calcularKcalAlvo(get, input);
  const { macros, warnings: warningsMacros } = calcularMacros(input, kcalAlvo);
  return {
    tmb,
    get,
    kcalAlvo: macros.calories,
    macros,
    warnings: [...warningsKcal, ...warningsMacros],
  };
}