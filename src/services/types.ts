/**
 * Enumerations and interfaces used across the Equilibrium metabolic and diet services.
 */

/**
 * Sex of the individual.  Biological sex influences the constant term in the
 * Harris–Benedict and Mifflin–St Jeor equations【6071260600918†L139-L156】【144321122992794†L89-L96】.
 */
export type Sex = 'male' | 'female';

/**
 * Activity levels used to scale BMR into total daily energy expenditure (TDEE).
 * The multipliers are taken from ISSA/NASM personal‑training guidance【6071260600918†L139-L156】.
 */
export enum ActivityLevel {
  Sedentary = 'sedentary',
  Light = 'light',
  Moderate = 'moderate',
  High = 'high',
  VeryHigh = 'veryHigh',
}

/**
 * Dietary goal/strategy chosen by the practitioner.  Each strategy modifies
 * caloric targets and macronutrient distributions.
 */
export enum DietStrategy {
  /**
   * Moderate energy deficit to promote fat loss while preserving muscle mass.
   */
  Deficit = 'deficit',
  /**
   * Aim to recomp by preserving muscle and gradually reducing fat.  Slight deficit.
   */
  Recomposition = 'recomposition',
  /**
   * Clean caloric surplus to support lean muscle gains without excessive fat.
   */
  Surplus = 'surplus',
  /**
   * Performance‑oriented; emphasizes high energy availability for athletic output.
   */
  Performance = 'performance',
}

/**
 * Macronutrient breakdown (grams and calories).
 */
export interface MacronutrientBreakdown {
  calories: number;
  proteinGrams: number;
  fatGrams: number;
  carbGrams: number;
}

/**
 * Options passed to the macro calculation function.
 */
export interface MacroOptions {
  weightKg: number;
  /**
   * Total caloric target for the day.
   */
  targetCalories: number;
  /**
   * Selected dietary strategy.
   */
  strategy: DietStrategy;
}

/**
 * Novo conjunto de tipos para a entrada de dados do núcleo metabólico V1.
 * Estes tipos seguem a especificação em português fornecida no briefing da Sprint 01.
 */

/**
 * Sexo biológico utilizado para as equações de TMB.  No briefing, é
 * representado por "M" (masculino) ou "F" (feminino).
 */
export type Sexo = 'M' | 'F';

/**
 * Nível de atividade física do indivíduo, correspondendo aos fatores de
 * atividade utilizados no cálculo do GET (TDEE).
 */
export type NivelAtividade = 'Sedentario' | 'Leve' | 'Moderado' | 'Alto' | 'MuitoAlto';

/**
 * Tipo de esporte/treinamento praticado.  Diferentes esportes aplicam
 * pequenos ajustes sobre o GET para considerar o custo energético
 * adicional【6071260600918†L139-L156】.
 */
export type Sport = 'Fitness' | 'Endurance' | 'Intermitente' | 'ForcaHipertrofia' | 'Clinico';

/**
 * Objetivo nutricional do cliente.  Cada objetivo define uma estratégia
 * calórica e distribuições específicas de macros.
 */
export type Objetivo = 'Emagrecimento' | 'Recomposicao' | 'Hipertrofia' | 'Performance';

/**
 * Preferência de dieta.  Este campo é opcional no V1 e preparado para
 * versões futuras.
 */
export type PreferenciaDieta = 'Padrao' | 'LowCarb' | 'Keto' | 'Jejum';

/**
 * Estrutura de entrada principal para o cálculo metabólico.  Esta interface
 * engloba todas as informações necessárias para determinar TMB, GET,
 * estratégia calórica e macronutrientes.
 */
export interface MetabolicInput {
  sexo: Sexo;
  idade: number;
  pesoKg: number;
  /**
   * Altura em metros.  Será convertida internamente para centímetros
   * quando necessário.
   */
  alturaM: number;
  /**
   * Percentual de gordura corporal (%).  Opcional; usado para derivar
   * massa magra caso massaMagraKg não seja fornecida.
   */
  bfPercent?: number;
  /**
   * Massa magra em quilogramas.  Quando fornecida, tem precedência
   * sobre o cálculo com percentuais para a equação de Cunningham.
   */
  massaMagraKg?: number;
  sport: Sport;
  nivelAtividade: NivelAtividade;
  objetivo: Objetivo;
  preferenciaDieta?: PreferenciaDieta;
}