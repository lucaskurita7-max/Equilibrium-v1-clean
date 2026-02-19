/*
 * Implementa lógica de substituições equivalentes para alimentos.
 * Alimentos são considerados equivalentes quando pertencem ao mesmo grupo
 * alimentar e possuem calorias dentro de ±10% do alimento de referência.
 */

import { foods, Food } from './foods';

/**
 * Retorna uma lista de alimentos equivalentes ao alimento de referência.
 * A equivalência considera o mesmo grupo e calorias aproximadas.
 *
 * @param foodId Identificador do alimento de referência
 */
export function getEquivalentFoods(foodId: string): Food[] {
  const base = foods.find(f => f.id === foodId);
  if (!base) return [];
  const minKcal = base.kcal * 0.9;
  const maxKcal = base.kcal * 1.1;
  return foods.filter(f => f.id !== base.id && f.grupo === base.grupo && f.kcal >= minKcal && f.kcal <= maxKcal);
}