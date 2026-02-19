/*
 * Motor de montagem de dieta V1.  Utiliza a saída do núcleo
 * metabólico para distribuir calorias e macronutrientes em refeições ao longo do dia.
 * Cada refeição inclui um alimento de carboidrato, um de proteína, uma gordura
 * opcional e uma fruta opcional.  Quantidades são ajustadas com base na
 * distribuição calórica definida.
 */

import { foods, Food } from './foods';
import { getEquivalentFoods } from './substitutions';
import { MetabolicOutput } from '../metabolic/types';

// Interfaces para representar itens e refeições no plano alimentar
export interface MealItem {
  foodId: string;
  nome: string;
  quantity: number; // quantidade em gramas ou ml
  unit: 'g' | 'ml';
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Meal {
  name: string;
  items: MealItem[];
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface DietPlan {
  meals: Meal[];
  totalKcal: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

// Distribuições calóricas por número de refeições
const DISTRIBUTIONS: { [count: number]: number[] } = {
  2: [0.45, 0.55],
  3: [0.30, 0.40, 0.30],
  4: [0.25, 0.35, 0.15, 0.25],
  5: [0.20, 0.30, 0.15, 0.20, 0.15],
  6: [0.15, 0.25, 0.15, 0.15, 0.15, 0.15],
};

/**
 * Determina o número de refeições com base no objetivo e nas preferências.
 */
function decideMealCount(metabolic: MetabolicOutput, preferencia?: string): number {
  // Se a preferência for jejum (Jejum), reduzir refeições
  if (preferencia === 'Jejum') return 3;
  // Hipertrofia → mais refeições
  if (metabolic.strategy === 'Bulk') return 5;
  // Padrão
  return 4;
}

/**
 * Filtra alimentos por grupo.
 */
function foodsByGroup(group: string): Food[] {
  return foods.filter(f => f.grupo === group);
}

/**
 * Seleciona um alimento da lista com índice cíclico.
 */
function pickFood(list: Food[], index: number): Food {
  return list[index % list.length];
}

/**
 * Calcula a quantidade em gramas (ou ml) para atender à necessidade de macro.
 * Retorna 0 se o alimento não contém o macro (evitando divisão por zero).
 */
function quantityForMacro(targetGrams: number, foodMacroPer100g: number): number {
  if (foodMacroPer100g <= 0) return 0;
  return (targetGrams / foodMacroPer100g) * 100;
}

/**
 * Gera um plano alimentar baseado na saída metabólica.  A função distribui
 * calorias e macros proporcionalmente ao longo das refeições e calcula
 * quantidades para cada alimento.  Preferências opcionais podem modificar
 * o número de refeições.
 */
export function generateDietPlan(metabolic: MetabolicOutput, preferencias?: { preferenciaDieta?: string }): DietPlan {
  const mealCount = decideMealCount(metabolic, preferencias?.preferenciaDieta);
  const distribution = DISTRIBUTIONS[mealCount] || DISTRIBUTIONS[4];
  const meals: Meal[] = [];
  // Listas de alimentos por grupo
  const carbsList = foodsByGroup('carbo');
  const proteinsList = foodsByGroup('proteina');
  const fatsList = foodsByGroup('gordura');
  const fruitsList = foodsByGroup('fruta');
  for (let i = 0; i < mealCount; i++) {
    const share = distribution[i];
    // Calcular metas da refeição
    const mealKcalTarget = metabolic.kcalTarget * share;
    const mealProteinTarget = metabolic.proteinG * share;
    const mealFatTarget = metabolic.fatG * share;
    const mealCarbTarget = metabolic.carbG * share;
    // Selecionar alimentos
    const carbFood = pickFood(carbsList, i);
    const proteinFood = pickFood(proteinsList, i);
    const fatFood = pickFood(fatsList, i);
    const fruitFood = pickFood(fruitsList, i);
    // Reservar 100g de fruta e calcular macros
    const fruitQty = 100;
    const fruitProtein = (fruitFood.protein * fruitQty) / 100;
    const fruitCarb = (fruitFood.carbs * fruitQty) / 100;
    const fruitFat = (fruitFood.fat * fruitQty) / 100;
    // Montar sistema linear para quantidades de carbo, proteína e gordura
    // Matriz A com coeficientes de macros por 1g (por 1g = per 100g / 100)
    const a11 = carbFood.carbs / 100;
    const a12 = proteinFood.carbs / 100;
    const a13 = fatFood.carbs / 100;
    const a21 = carbFood.protein / 100;
    const a22 = proteinFood.protein / 100;
    const a23 = fatFood.protein / 100;
    const a31 = carbFood.fat / 100;
    const a32 = proteinFood.fat / 100;
    const a33 = fatFood.fat / 100;
    // Vetor de termos independentes (alvo de macros após fruta)
    const b1 = Math.max(0, mealCarbTarget - fruitCarb);
    const b2 = Math.max(0, mealProteinTarget - fruitProtein);
    const b3 = Math.max(0, mealFatTarget - fruitFat);
    // Determinante
    const det = a11 * (a22 * a33 - a23 * a32) - a12 * (a21 * a33 - a23 * a31) + a13 * (a21 * a32 - a22 * a31);
    let carbQty = 0;
    let proteinQty = 0;
    let fatQty = 0;
    if (Math.abs(det) > 1e-6) {
      // Cramer
      const det1 = b1 * (a22 * a33 - a23 * a32) - a12 * (b2 * a33 - a23 * b3) + a13 * (b2 * a32 - a22 * b3);
      const det2 = a11 * (b2 * a33 - a23 * b3) - b1 * (a21 * a33 - a23 * a31) + a13 * (a21 * b3 - b2 * a31);
      const det3 = a11 * (a22 * b3 - b2 * a32) - a12 * (a21 * b3 - b2 * a31) + b1 * (a21 * a32 - a22 * a31);
      carbQty = det1 / det;
      proteinQty = det2 / det;
      fatQty = det3 / det;
    } else {
      // fallback simples (evitar divisão por zero)
      carbQty = quantityForMacro(b1, carbFood.carbs);
      proteinQty = quantityForMacro(b2, proteinFood.protein);
      fatQty = quantityForMacro(b3, fatFood.fat);
    }
    // Corrigir valores negativos (caso equação gere negativos)
    if (carbQty < 0 || !isFinite(carbQty)) carbQty = 0;
    if (proteinQty < 0 || !isFinite(proteinQty)) proteinQty = 0;
    if (fatQty < 0 || !isFinite(fatQty)) fatQty = 0;
    // Construir itens
    const items: MealItem[] = [];
    function addItem(food: Food, qty: number) {
      if (qty <= 0) return;
      const kcal = (food.kcal * qty) / 100;
      const prot = (food.protein * qty) / 100;
      const carb = (food.carbs * qty) / 100;
      const fat = (food.fat * qty) / 100;
      items.push({
        foodId: food.id,
        nome: food.nome,
        quantity: Math.round(qty),
        unit: food.unidadePadrao,
        kcal,
        protein: prot,
        carbs: carb,
        fat,
      });
    }
    // Adicionar cada alimento
    addItem(carbFood, carbQty);
    addItem(proteinFood, proteinQty);
    addItem(fatFood, fatQty);
    addItem(fruitFood, fruitQty);
    // Calcular totais da refeição
    const calcTotals = (itms: MealItem[]) => itms.reduce(
      (acc, item) => {
        acc.kcal += item.kcal;
        acc.protein += item.protein;
        acc.carbs += item.carbs;
        acc.fat += item.fat;
        return acc;
      },
      { kcal: 0, protein: 0, carbs: 0, fat: 0 },
    );
    let mealTotals = calcTotals(items);
    // Ajustar escala para aproximar meta calórica (evita desvio > 5%)
    const desiredKcal = mealKcalTarget;
    if (mealTotals.kcal > 0) {
      const scale = desiredKcal / mealTotals.kcal;
      // Se escala razoável (não explosiva) e finita, ajustar
      if (scale > 0 && isFinite(scale)) {
        items.forEach(item => {
          item.quantity *= scale;
          item.kcal *= scale;
          item.protein *= scale;
          item.carbs *= scale;
          item.fat *= scale;
        });
        mealTotals = calcTotals(items);
      }
    }
    // Nome da refeição
    const names = ['Café da manhã', 'Almoço', 'Lanche', 'Jantar', 'Ceia', 'Lanche extra'];
    const name = names[i] || `Refeição ${i + 1}`;
    meals.push({
      name,
      items,
      kcal: mealTotals.kcal,
      protein: mealTotals.protein,
      carbs: mealTotals.carbs,
      fat: mealTotals.fat,
    });
  }
  // Somar totais do dia
  const total = meals.reduce(
    (acc, meal) => {
      acc.totalKcal += meal.kcal;
      acc.totalProtein += meal.protein;
      acc.totalCarbs += meal.carbs;
      acc.totalFat += meal.fat;
      return acc;
    },
    { totalKcal: 0, totalProtein: 0, totalCarbs: 0, totalFat: 0 },
  );
  return {
    meals,
    totalKcal: total.totalKcal,
    totalProtein: total.totalProtein,
    totalCarbs: total.totalCarbs,
    totalFat: total.totalFat,
  };
}