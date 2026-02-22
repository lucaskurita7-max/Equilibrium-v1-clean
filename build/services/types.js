"use strict";
/**
 * Enumerations and interfaces used across the Equilibrium metabolic and diet services.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DietStrategy = exports.ActivityLevel = void 0;
/**
 * Activity levels used to scale BMR into total daily energy expenditure (TDEE).
 * The multipliers are taken from ISSA/NASM personal‑training guidance【6071260600918†L139-L156】.
 */
var ActivityLevel;
(function (ActivityLevel) {
    ActivityLevel["Sedentary"] = "sedentary";
    ActivityLevel["Light"] = "light";
    ActivityLevel["Moderate"] = "moderate";
    ActivityLevel["High"] = "high";
    ActivityLevel["VeryHigh"] = "veryHigh";
})(ActivityLevel || (exports.ActivityLevel = ActivityLevel = {}));
/**
 * Dietary goal/strategy chosen by the practitioner.  Each strategy modifies
 * caloric targets and macronutrient distributions.
 */
var DietStrategy;
(function (DietStrategy) {
    /**
     * Moderate energy deficit to promote fat loss while preserving muscle mass.
     */
    DietStrategy["Deficit"] = "deficit";
    /**
     * Aim to recomp by preserving muscle and gradually reducing fat.  Slight deficit.
     */
    DietStrategy["Recomposition"] = "recomposition";
    /**
     * Clean caloric surplus to support lean muscle gains without excessive fat.
     */
    DietStrategy["Surplus"] = "surplus";
    /**
     * Performance‑oriented; emphasizes high energy availability for athletic output.
     */
    DietStrategy["Performance"] = "performance";
})(DietStrategy || (exports.DietStrategy = DietStrategy = {}));
