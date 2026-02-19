"use strict";
/*
 * Implementação do núcleo metabólico V1 seguindo as especificações da Sprint 01.1.
 * Este módulo expõe funções puras para calcular TMB (BMR), GET (TDEE),
 * calorias alvo e distribuição de macronutrientes, incluindo guardrails
 * de segurança.  Também fornece uma função de alto nível
 * `computeMetabolicPlan` que retorna uma estrutura de saída padronizada.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.round = round;
exports.clamp = clamp;
exports.isValid = isValid;
exports.safeInput = safeInput;
exports.bmrMifflin = bmrMifflin;
exports.bmrHarrisBenedict = bmrHarrisBenedict;
exports.bmrCunningham = bmrCunningham;
exports.pickBmrMethod = pickBmrMethod;
exports.activityFactor = activityFactor;
exports.applySportAdj = applySportAdj;
exports.calcKcalTarget = calcKcalTarget;
exports.computeMetabolicPlan = computeMetabolicPlan;
/* --------------------------------------------------------------------------
 * Helpers
 *
 * Funções auxiliares genéricas utilizadas ao longo do cálculo.
 */
/**
 * Arredonda um número para o inteiro mais próximo.  Utiliza `Math.round` por
 * ser o comportamento desejado na contagem de calorias e macronutrientes.
 */
function round(n) {
    return Math.round(n);
}
/**
 * Restringe um valor a um intervalo [min, max].  Se o valor for menor que
 * `min`, retorna `min`; se maior que `max`, retorna `max`; caso contrário,
 * retorna o valor original.
 */
function clamp(n, min, max) {
    return Math.min(Math.max(n, min), max);
}
/**
 * Verifica se um número é finito e não NaN.  Retorna `false` para
 * valores `undefined`, `null`, `NaN` ou infinitos.
 */
function isValid(n) {
    return typeof n === 'number' && isFinite(n);
}
/**
 * Normaliza a entrada eliminando valores absurdos ou negativos.  Idade
 * negativa, alturas menores ou iguais a zero e pesos negativos serão
 * ajustados para limites mínimos razoáveis.
 */
function safeInput(input) {
    const idade = isValid(input.idade) && input.idade > 0 ? input.idade : 0;
    const pesoKg = isValid(input.pesoKg) && input.pesoKg > 0 ? input.pesoKg : 0;
    const alturaM = isValid(input.alturaM) && input.alturaM > 0 ? input.alturaM : 0;
    const bfPercent = isValid(input.bfPercent) && input.bfPercent > 0 && input.bfPercent < 100 ? input.bfPercent : undefined;
    const massaMagraKg = isValid(input.massaMagraKg) && input.massaMagraKg > 0 ? input.massaMagraKg : undefined;
    return {
        ...input,
        idade,
        pesoKg,
        alturaM,
        bfPercent,
        massaMagraKg,
    };
}
/* --------------------------------------------------------------------------
 * BMR formulas
 *
 * Implementações das equações de Mifflin–St Jeor, Harris–Benedict revisada e
 * Cunningham para estimar a taxa metabólica basal.
 */
/**
 * Calcula a TMB usando a equação de Mifflin‑St Jeor.  A fórmula utiliza
 * peso (kg), altura (cm) e idade (anos).  Para homens soma‑se 5 e
 * para mulheres subtrai‑se 161.
 */
function bmrMifflin(input) {
    const { pesoKg, alturaM, idade, sexo } = input;
    const hCm = alturaM * 100;
    const s = sexo === 'M' ? 5 : -161;
    return 10 * pesoKg + 6.25 * hCm - 5 * idade + s;
}
/**
 * Calcula a TMB usando a equação de Harris–Benedict revisada (Roza & Shizgal, 1984).
 * Os coeficientes diferem para homens e mulheres.
 */
function bmrHarrisBenedict(input) {
    const { pesoKg, alturaM, idade, sexo } = input;
    const hCm = alturaM * 100;
    if (sexo === 'M') {
        return 88.362 + 13.397 * pesoKg + 4.799 * hCm - 5.677 * idade;
    }
    return 447.593 + 9.247 * pesoKg + 3.098 * hCm - 4.330 * idade;
}
/**
 * Calcula a TMB utilizando a massa magra (FFM) com a equação de Cunningham.
 * Fórmula: 500 + 22 × FFM (kg).  Esta equação é preferível quando a massa
 * magra é conhecida, pois considera a composição corporal.
 */
function bmrCunningham(ffmKg) {
    return 500 + 22 * ffmKg;
}
/* --------------------------------------------------------------------------
 * Métodos para escolher o melhor BMR
 */
/**
 * Determina o valor de FFM derivado do peso e percentual de gordura, se
 * possível.  Retorna `undefined` se o percentual for inválido.
 */
function deriveFFM(pesoKg, bfPercent) {
    if (isValid(bfPercent) && bfPercent > 0 && bfPercent < 100) {
        return pesoKg * (1 - bfPercent / 100);
    }
    return undefined;
}
/**
 * Seleciona automaticamente a equação de TMB.  Se massa magra > 0, usa
 * Cunningham; caso contrário, se todos os campos básicos (peso, altura,
 * idade) estão presentes, usa Mifflin; senão recorre a Harris–Benedict.
 */
function pickBmrMethod(input) {
    // Se massa magra fornecida
    if (isValid(input.massaMagraKg) && input.massaMagraKg > 0) {
        return { value: bmrCunningham(input.massaMagraKg), method: 'Cunningham', ffm: input.massaMagraKg };
    }
    // Tentar derivar massa magra via percentual de gordura
    const ffm = deriveFFM(input.pesoKg, input.bfPercent);
    if (isValid(ffm)) {
        return { value: bmrCunningham(ffm), method: 'Cunningham', ffm: ffm };
    }
    // Se altura e peso e idade são válidos, use Mifflin
    if (input.pesoKg > 0 && input.alturaM > 0 && input.idade > 0) {
        return { value: bmrMifflin(input), method: 'Mifflin' };
    }
    // Fallback
    return { value: bmrHarrisBenedict(input), method: 'HarrisBenedict' };
}
/* --------------------------------------------------------------------------
 * Fatores de atividade e ajustes por esporte
 */
/**
 * Retorna o multiplicador de atividade baseado no nível fornecido.
 */
function activityFactor(level) {
    switch (level) {
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
 * Aplica um ajuste percentual sobre o TDEE de acordo com o tipo de esporte.
 * Retorna o valor ajustado.  Por exemplo, Endurance adiciona 3%.
 */
function applySportAdj(tdee, sport) {
    let adj = 0;
    switch (sport) {
        case 'Endurance':
            adj = 0.03;
            break;
        case 'Intermitente':
            adj = 0.02;
            break;
        case 'ForcaHipertrofia':
            adj = 0.01;
            break;
        default:
            adj = 0;
    }
    return tdee * (1 + adj);
}
/* --------------------------------------------------------------------------
 * Estratégias calóricas
 */
/**
 * Calcula a meta calórica (kcalTarget) antes de aplicar guardrails.  Para
 * Performance, aplica 0% ou +5% se o nível de atividade for MuitoAlto.
 */
function calcKcalTarget(tdee, goal, level) {
    let target;
    switch (goal) {
        case 'Emagrecimento':
            target = tdee * 0.85; // -15%
            break;
        case 'Recomposicao':
            target = tdee * 0.95; // -5%
            break;
        case 'Hipertrofia':
            target = tdee * 1.10; // +10%
            break;
        case 'Performance':
            if (level === 'MuitoAlto') {
                target = tdee * 1.05; // +5%
            }
            else {
                target = tdee; // manutenção
            }
            break;
        default:
            target = tdee;
    }
    return target;
}
/* --------------------------------------------------------------------------
 * Guardrails
 */
/**
 * Aplica guardrails de calorias mínimas e déficit máximo.  Modifica a meta
 * calórica conforme necessário e adiciona avisos à lista fornecida.
 */
function enforceCalorieGuardrails(target, tdee, sexo, warnings) {
    // kcal mínima
    const minKcal = sexo === 'M' ? 1500 : 1200;
    if (target < minKcal) {
        warnings.push(`Calorias ajustadas para mínimo de ${minKcal} kcal/dia`);
        target = minKcal;
    }
    // déficit máximo 25%
    const deficit = tdee - target;
    const maxDeficit = tdee * 0.25;
    if (deficit > maxDeficit) {
        warnings.push('Déficit limitado a 25% do TDEE');
        target = tdee - maxDeficit;
    }
    return target;
}
/* --------------------------------------------------------------------------
 * Cálculo de macronutrientes
 */
/**
 * Determina o fator de proteína por kg com base no objetivo.
 */
function proteinFactor(goal) {
    switch (goal) {
        case 'Emagrecimento':
        case 'Recomposicao':
            return 2.0;
        case 'Hipertrofia':
            return 1.8;
        case 'Performance':
            return 1.7;
        default:
            return 2.0;
    }
}
/**
 * Determina a gordura mínima por kg com base no sexo.
 */
function fatMinimumPerKg(sexo) {
    return sexo === 'F' ? 0.8 : 0.7;
}
/**
 * Calcula os macronutrientes (gramas de proteína, gordura e carboidrato) com
 * base no peso, objetivo, sexo e meta calórica.  Retorna um objeto com
 * valores arredondados e possivelmente adiciona avisos caso ajustes sejam
 * necessários (por exemplo, carboidrato negativo).
 */
function computeMacros(input, kcalTarget, warnings) {
    const { pesoKg, sexo, objetivo } = input;
    // Proteína
    const protG = pesoKg * proteinFactor(objetivo);
    const protCal = protG * 4;
    // Gordura mínima
    const fatPerKg = fatMinimumPerKg(sexo);
    let fatG = pesoKg * fatPerKg;
    let fatCal = fatG * 9;
    // Calorias restantes para carboidrato
    let remainingCal = kcalTarget - (protCal + fatCal);
    let carbG;
    if (remainingCal < 0) {
        // Não é possível reduzir abaixo do mínimo de gordura; definir carbo para zero
        carbG = 0;
        remainingCal = 0;
        warnings.push('Carboidratos ajustados para zero devido a energia insuficiente');
    }
    else {
        carbG = remainingCal / 4;
    }
    // Arredondar
    const proteinG = round(protG);
    const fatGrams = round(fatG);
    const carbGrams = round(carbG);
    return { proteinG, fatG: fatGrams, carbG: carbGrams };
}
/* --------------------------------------------------------------------------
 * Função final
 */
/**
 * Mapeia Goal para a sigla de estratégia.  Emagrecimento → Cut, Recomposição → Recomp, Hipertrofia → Bulk, Performance → Maintain.
 */
function goalToStrategy(goal) {
    switch (goal) {
        case 'Emagrecimento':
            return 'Cut';
        case 'Recomposicao':
            return 'Recomp';
        case 'Hipertrofia':
            return 'Bulk';
        case 'Performance':
            return 'Maintain';
        default:
            return 'Maintain';
    }
}
/**
 * Função de alto nível que gera o plano metabólico completo e retorna
 * um `MetabolicOutput` contendo BMR, TDEE, calorias alvo, estratégia e
 * macronutrientes.  Aplica todos os guardrails e acumula avisos.
 */
function computeMetabolicPlan(inputRaw) {
    // Normalizar entrada
    const input = safeInput(inputRaw);
    const warnings = [];
    // Calcular TMB e método utilizado
    const bmrResult = pickBmrMethod(input);
    const bmr = bmrResult.value;
    // Calcular TDEE (atividade)
    const tdeeNoAdj = bmr * activityFactor(input.nivelAtividade);
    const tdee = applySportAdj(tdeeNoAdj, input.sport);
    // Meta calórica antes de guardrails
    let kcalTarget = calcKcalTarget(tdee, input.objetivo, input.nivelAtividade);
    // Aplicar guardrails
    kcalTarget = enforceCalorieGuardrails(kcalTarget, tdee, input.sexo, warnings);
    // Calcular macros
    const macros = computeMacros(input, kcalTarget, warnings);
    return {
        bmr: round(bmr),
        bmrMethod: bmrResult.method,
        tdee: round(tdee),
        kcalTarget: round(kcalTarget),
        strategy: goalToStrategy(input.objetivo),
        proteinG: macros.proteinG,
        fatG: macros.fatG,
        carbG: macros.carbG,
        warnings,
    };
}
