# Equilibrium Project

This project implements the core metabolic calculations and diet-engine logic for the Equilibrium platform.

## Structure

- **`src/services/metabolic.ts`** – Pure functions for calculating basal metabolic rate (BMR) using the Mifflin‐St Jeor, revised Harris–Benedict and Cunningham formulas, as well as helpers for calculating total daily energy expenditure (TDEE), macronutrient allocations and applying dietary strategies.  These formulas are based on published nutritional guidance and peer‑reviewed sources【6071260600918†L139-L156】【144321122992794†L74-L96】.
- **`src/services/types.ts`** – Type definitions and enums used throughout the service layer.
- **`test/metabolic.test.ts`** – A simple test suite built with Node’s `assert` module that verifies the correctness of the metabolic calculations.

To run the tests:

```sh
npx ts-node test/metabolic.test.ts
```

## References

The equations implemented here are grounded in nutrition science:

- **Harris–Benedict (revised)** – The revised Harris–Benedict equation estimates BMR based on weight, height, age and sex.  The men’s and women’s formulas are 88.362 + 13.397 × weight (kg) + 4.799 × height (cm) – 5.677 × age (years) and 447.593 + 9.247 × weight + 3.098 × height – 4.330 × age respectively【6071260600918†L139-L156】.
- **Mifflin–St Jeor** – Introduced in 1990, this equation is considered more accurate for modern lifestyles.  It uses the same coefficients for both sexes except for a constant term: BMR = (9.99 × weight + 6.25 × height – 4.92 × age) + 5 for men and −161 for women【144321122992794†L89-L96】.
- **Cunningham/Katch–McArdle** – For individuals with body composition data, the resting energy expenditure is calculated from lean body mass (LBM).  The Katch–McArdle version computes RMR = 370 + 21.6 × LBM【475935534575796†L432-L448】 while the Cunningham equation is 500 + 22 × LBM【144321122992794†L150-L165】.
- **Activity multipliers** – TDEE is obtained by multiplying BMR by an activity factor: sedentary (1.2), lightly active (1.375), moderately active (1.55), very active (1.725) or super active (1.9)【6071260600918†L139-L156】.
- **Protein and fat recommendations** – General guidance suggests 0.8 g of protein per kg for adults, increasing to 1–1.5 g/kg for muscle gain and around 1–1.2 g/kg for weight loss【467877799346439†L126-L139】.  A minimum fat intake of about 0.25 g per pound (~0.55 g/kg) ensures adequate essential fatty acids【380003717717322†L120-L124】.

These citations are embedded in the source files to assist with future maintenance and to demonstrate alignment with reputable nutritional sources.