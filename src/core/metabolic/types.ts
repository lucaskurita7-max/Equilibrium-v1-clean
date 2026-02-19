/**
 * Tipos de dados utilizados no núcleo metabólico V1.
 * Estes tipos são independentes de qualquer framework e podem ser
 * importados tanto na camada de serviços quanto na UI.
 */

/**
 * Sexo biológico.  No contexto do cálculo de TMB, o valor influencia o
 * componente constante nas equações de Mifflin e Harris–Benedict.
 */
export type Sex = 'M' | 'F';

/**
 * Modalidade de esporte ou treinamento praticado.  Esta escolha aplica
 * ajustes leves sobre o GET (TDEE) para diferenciar perfis de gasto
 * energético.  Para o V1, apenas valores percentuais fixos são usados.
 */
export type SportType =
  | 'Fitness'
  | 'Endurance'
  | 'Intermitente'
  | 'ForcaHipertrofia'
  | 'Clinico';

/**
 * Níveis de atividade física.  Cada nível corresponde a um multiplicador
 * aplicado sobre o TMB para calcular o TDEE.
 */
export type ActivityLevel =
  | 'Sedentario'
  | 'Leve'
  | 'Moderado'
  | 'Alto'
  | 'MuitoAlto';

/**
 * Objetivo nutricional do cliente.  O objetivo direciona a estratégia
 * calórica (déficit, recomp, superávit ou manutenção) e as faixas de
 * macronutrientes.
 */
export type Goal =
  | 'Emagrecimento'
  | 'Recomposicao'
  | 'Hipertrofia'
  | 'Performance';

/**
 * Preferência de dieta.  Este campo é opcional no V1, mas foi
 * incluído para futuras expansões (low‑carb, cetogênica, jejum intermitente).
 */
export type DietPref = 'Padrao' | 'LowCarb' | 'Keto' | 'Jejum';

/**
 * Estrutura de entrada principal para o cálculo.  Contém todas as
 * informações necessárias para determinar BMR, TDEE, calorias alvo e macros.
 */
export interface MetabolicInput {
  sexo: Sex;
  idade: number;
  pesoKg: number;
  alturaM: number;
  bfPercent?: number;
  massaMagraKg?: number;
  sport: SportType;
  nivelAtividade: ActivityLevel;
  objetivo: Goal;
  preferenciaDieta?: DietPref;
}

/**
 * Estrutura de saída do cálculo metabólico.  Contém os valores principais
 * computados, a estratégia textual e uma lista de advertências.
 */
export interface MetabolicOutput {
  bmr: number;
  bmrMethod: 'Cunningham' | 'Mifflin' | 'HarrisBenedict';
  tdee: number;
  kcalTarget: number;
  strategy: 'Cut' | 'Recomp' | 'Bulk' | 'Maintain';
  proteinG: number;
  fatG: number;
  carbG: number;
  warnings: string[];
}