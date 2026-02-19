"use strict";
/*
 * Banco de alimentos brasileiro para o motor de dieta V1.
 * Cada alimento possui valores aproximados de calorias e macronutrientes por
 * 100 g (ou ml para líquidos).  Os grupos alimentares facilitam a
 * escolha de substituições equivalentes e a montagem das refeições.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.foods = void 0;
/**
 * Lista de alimentos reais do padrão brasileiro.  Cada valor refere‑se a
 * 100 g ou 100 ml de porção, conforme a unidade.  A lista deve conter
 * pelo menos 40 alimentos divididos entre carboidratos, proteínas,
 * gorduras, laticínios, frutas e lanches rápidos.
 */
exports.foods = [
    // Carboidratos base
    { id: 'arroz_branco', nome: 'Arroz branco cozido', grupo: 'carbo', kcal: 130, protein: 2.5, carbs: 28, fat: 0.3, unidadePadrao: 'g' },
    { id: 'feijao_carioca', nome: 'Feijão carioca cozido', grupo: 'carbo', kcal: 76, protein: 4.6, carbs: 13.6, fat: 0.5, unidadePadrao: 'g' },
    { id: 'macarrao', nome: 'Macarrão cozido', grupo: 'carbo', kcal: 158, protein: 5.8, carbs: 30.5, fat: 0.9, unidadePadrao: 'g' },
    { id: 'batata', nome: 'Batata inglesa cozida', grupo: 'carbo', kcal: 87, protein: 2.0, carbs: 20.0, fat: 0.1, unidadePadrao: 'g' },
    { id: 'mandioca', nome: 'Mandioca cozida', grupo: 'carbo', kcal: 125, protein: 1.5, carbs: 30.0, fat: 0.3, unidadePadrao: 'g' },
    { id: 'quinoa', nome: 'Quinoa cozida', grupo: 'carbo', kcal: 120, protein: 4.4, carbs: 21.3, fat: 1.9, unidadePadrao: 'g' },
    { id: 'aveia', nome: 'Aveia em flocos', grupo: 'carbo', kcal: 389, protein: 16.9, carbs: 66.3, fat: 6.9, unidadePadrao: 'g' },
    { id: 'pao_integral', nome: 'Pão integral', grupo: 'carbo', kcal: 247, protein: 13.0, carbs: 41.0, fat: 4.2, unidadePadrao: 'g' },
    { id: 'arroz_integral', nome: 'Arroz integral cozido', grupo: 'carbo', kcal: 111, protein: 2.6, carbs: 22.9, fat: 0.9, unidadePadrao: 'g' },
    // Proteínas
    { id: 'frango', nome: 'Peito de frango cozido', grupo: 'proteina', kcal: 165, protein: 31.0, carbs: 0.0, fat: 3.6, unidadePadrao: 'g' },
    { id: 'carne_bovina', nome: 'Carne bovina magra cozida', grupo: 'proteina', kcal: 250, protein: 26.0, carbs: 0.0, fat: 15.0, unidadePadrao: 'g' },
    { id: 'ovo', nome: 'Ovos cozidos', grupo: 'proteina', kcal: 155, protein: 13.0, carbs: 1.1, fat: 11.0, unidadePadrao: 'g' },
    { id: 'salmao', nome: 'Salmão grelhado', grupo: 'proteina', kcal: 206, protein: 22.0, carbs: 0.0, fat: 12.0, unidadePadrao: 'g' },
    { id: 'atum', nome: 'Atum em lata (natural)', grupo: 'proteina', kcal: 132, protein: 28.0, carbs: 0.0, fat: 1.0, unidadePadrao: 'g' },
    { id: 'whey', nome: 'Whey protein', grupo: 'proteina', kcal: 120, protein: 24.0, carbs: 3.0, fat: 1.5, unidadePadrao: 'g' },
    { id: 'peru', nome: 'Peito de peru', grupo: 'proteina', kcal: 135, protein: 29.0, carbs: 0.0, fat: 1.5, unidadePadrao: 'g' },
    { id: 'tofu', nome: 'Tofu firme', grupo: 'proteina', kcal: 76, protein: 8.0, carbs: 1.9, fat: 4.8, unidadePadrao: 'g' },
    { id: 'lentilha', nome: 'Lentilha cozida', grupo: 'proteina', kcal: 116, protein: 9.0, carbs: 20.0, fat: 0.4, unidadePadrao: 'g' },
    // Gorduras
    { id: 'azeite', nome: 'Azeite de oliva', grupo: 'gordura', kcal: 884, protein: 0.0, carbs: 0.0, fat: 100.0, unidadePadrao: 'g' },
    { id: 'castanha', nome: 'Castanha do Brasil', grupo: 'gordura', kcal: 656, protein: 14.0, carbs: 12.0, fat: 66.0, unidadePadrao: 'g' },
    { id: 'amendoa', nome: 'Amêndoas', grupo: 'gordura', kcal: 579, protein: 21.0, carbs: 22.0, fat: 50.0, unidadePadrao: 'g' },
    { id: 'pasta_amendoim', nome: 'Pasta de amendoim', grupo: 'gordura', kcal: 588, protein: 25.0, carbs: 20.0, fat: 50.0, unidadePadrao: 'g' },
    { id: 'abacate', nome: 'Abacate', grupo: 'gordura', kcal: 160, protein: 2.0, carbs: 9.0, fat: 15.0, unidadePadrao: 'g' },
    { id: 'linhaca', nome: 'Semente de linhaça', grupo: 'gordura', kcal: 534, protein: 18.3, carbs: 28.9, fat: 42.2, unidadePadrao: 'g' },
    // Laticínios
    { id: 'leite', nome: 'Leite integral', grupo: 'lacticinio', kcal: 42, protein: 3.4, carbs: 5.0, fat: 1.0, unidadePadrao: 'ml' },
    { id: 'iogurte', nome: 'Iogurte natural', grupo: 'lacticinio', kcal: 60, protein: 3.5, carbs: 5.0, fat: 3.3, unidadePadrao: 'ml' },
    { id: 'cottage', nome: 'Queijo cottage', grupo: 'lacticinio', kcal: 98, protein: 11.1, carbs: 3.4, fat: 4.3, unidadePadrao: 'g' },
    { id: 'requeijao', nome: 'Requeijão light', grupo: 'lacticinio', kcal: 190, protein: 6.0, carbs: 2.0, fat: 15.0, unidadePadrao: 'g' },
    { id: 'queijo_minas', nome: 'Queijo Minas Frescal', grupo: 'lacticinio', kcal: 264, protein: 17.0, carbs: 2.0, fat: 21.0, unidadePadrao: 'g' },
    // Frutas
    { id: 'banana', nome: 'Banana prata', grupo: 'fruta', kcal: 89, protein: 1.1, carbs: 23.0, fat: 0.3, unidadePadrao: 'g' },
    { id: 'maca', nome: 'Maçã', grupo: 'fruta', kcal: 52, protein: 0.3, carbs: 14.0, fat: 0.2, unidadePadrao: 'g' },
    { id: 'laranja', nome: 'Laranja', grupo: 'fruta', kcal: 47, protein: 0.9, carbs: 12.0, fat: 0.1, unidadePadrao: 'g' },
    { id: 'mamao', nome: 'Mamão', grupo: 'fruta', kcal: 43, protein: 0.5, carbs: 11.0, fat: 0.3, unidadePadrao: 'g' },
    { id: 'manga', nome: 'Manga', grupo: 'fruta', kcal: 60, protein: 0.8, carbs: 15.0, fat: 0.4, unidadePadrao: 'g' },
    { id: 'morango', nome: 'Morango', grupo: 'fruta', kcal: 32, protein: 0.7, carbs: 7.7, fat: 0.3, unidadePadrao: 'g' },
    { id: 'uva', nome: 'Uva', grupo: 'fruta', kcal: 69, protein: 0.6, carbs: 18.0, fat: 0.2, unidadePadrao: 'g' },
    // Lanches rápidos
    { id: 'barra_cereal', nome: 'Barra de cereal', grupo: 'lanche', kcal: 400, protein: 6.0, carbs: 70.0, fat: 11.0, unidadePadrao: 'g' },
    { id: 'pao_queijo', nome: 'Pão de queijo', grupo: 'lanche', kcal: 330, protein: 6.0, carbs: 42.0, fat: 15.0, unidadePadrao: 'g' },
    { id: 'biscoito_arroz', nome: 'Biscoito de arroz', grupo: 'lanche', kcal: 381, protein: 8.5, carbs: 78.0, fat: 3.0, unidadePadrao: 'g' },
    { id: 'iogurte_grego', nome: 'Iogurte grego', grupo: 'lanche', kcal: 59, protein: 10.0, carbs: 3.6, fat: 0.4, unidadePadrao: 'ml' },
    { id: 'tapioca', nome: 'Tapioca', grupo: 'lanche', kcal: 361, protein: 1.6, carbs: 87.0, fat: 0.2, unidadePadrao: 'g' },
    { id: 'suco_laranja', nome: 'Suco de laranja (natural)', grupo: 'lanche', kcal: 45, protein: 0.7, carbs: 10.0, fat: 0.1, unidadePadrao: 'ml' },
    { id: 'shake_whey', nome: 'Shake de whey com banana', grupo: 'lanche', kcal: 220, protein: 25.0, carbs: 28.0, fat: 2.0, unidadePadrao: 'ml' },
];
