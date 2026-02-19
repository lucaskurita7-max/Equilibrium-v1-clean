"use strict";
/*
 * Implementa lógica de substituições equivalentes para alimentos.
 * Alimentos são considerados equivalentes quando pertencem ao mesmo grupo
 * alimentar e possuem calorias dentro de ±10% do alimento de referência.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEquivalentFoods = getEquivalentFoods;
const foods_1 = require("./foods");
/**
 * Retorna uma lista de alimentos equivalentes ao alimento de referência.
 * A equivalência considera o mesmo grupo e calorias aproximadas.
 *
 * @param foodId Identificador do alimento de referência
 */
function getEquivalentFoods(foodId) {
    const base = foods_1.foods.find(f => f.id === foodId);
    if (!base)
        return [];
    const minKcal = base.kcal * 0.9;
    const maxKcal = base.kcal * 1.1;
    return foods_1.foods.filter(f => f.id !== base.id && f.grupo === base.grupo && f.kcal >= minKcal && f.kcal <= maxKcal);
}
