"use strict";
/*
 * Geração de PDF profissional para o plano alimentar.  Esta implementação
 * escreve manualmente um PDF com quatro páginas usando instruções básicas
 * do formato PDF.  Não depende de bibliotecas externas e serve como
 * prova de conceito para a Sprint 02.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportDietPdf = exportDietPdf;
const substitutions_1 = require("./substitutions");
/**
 * Constrói um PDF simples a partir de um array de páginas, onde cada página
 * é um array de strings.  Cada string será impressa em uma nova linha.
 *
 * @param pages Lista de páginas, cada uma contendo um array de linhas de texto.
 * @returns Buffer com os bytes do PDF.
 */
function createSimplePdf(pages) {
    let objects = [];
    const offsets = [];
    // Font object (Helvetica)
    const fontObjIndex = 1;
    const fontObj = `${fontObjIndex} 0 obj\n<< /Type /Font /Subtype /Type1 /Name /F1 /BaseFont /Helvetica >>\nendobj\n`;
    objects.push(fontObj);
    // Page contents and page objects will be added next
    const pageObjects = [];
    const contentObjects = [];
    for (let i = 0; i < pages.length; i++) {
        const lines = pages[i];
        // Build content stream: set font and write lines
        let content = 'BT\n/F1 12 Tf\n';
        // Starting position (x=50, y=760)
        let y = 760;
        for (const line of lines) {
            content += `50 ${y.toFixed(1)} Td (${line.replace(/\(/g, '\\(').replace(/\)/g, '\\)')}) Tj\n`;
            y -= 20;
        }
        content += 'ET';
        const contentLength = content.length;
        const contentObjIndex = objects.length + 2; // +2 because page and content objects will be appended sequentially
        const contentObj = `${contentObjIndex} 0 obj\n<< /Length ${contentLength} >>\nstream\n${content}\nendstream\nendobj\n`;
        contentObjects.push(contentObj);
        // Page object
        const pageObjIndex = contentObjIndex + 1;
        const pageObj = `${pageObjIndex} 0 obj\n<< /Type /Page /Parent 0 0 R /MediaBox [0 0 612 792] /Contents ${contentObjIndex} 0 R /Resources << /Font << /F1 ${fontObjIndex} 0 R >> >> >>\nendobj\n`;
        pageObjects.push(pageObj);
    }
    // Pages parent object
    const pagesObjIndex = objects.length + contentObjects.length + pageObjects.length + 2; // after font + content + page
    const kids = pageObjects.map((_, idx) => `${objects.length + contentObjects.length + idx + 3} 0 R`).join(' ');
    const pagesObj = `${pagesObjIndex} 0 obj\n<< /Type /Pages /Kids [ ${kids} ] /Count ${pages.length} >>\nendobj\n`;
    // Catalog
    const catalogIndex = pagesObjIndex + 1;
    const catalogObj = `${catalogIndex} 0 obj\n<< /Type /Catalog /Pages ${pagesObjIndex} 0 R >>\nendobj\n`;
    // Assemble final list of objects: font, content objects, page objects, pages, catalog
    const allObjects = [fontObj, ...contentObjects, ...pageObjects, pagesObj, catalogObj];
    // Compute offsets for xref
    let offset = 0;
    const pdfParts = [];
    pdfParts.push('%PDF-1.4\n');
    for (let i = 0; i < allObjects.length; i++) {
        offsets.push(offset);
        pdfParts.push(allObjects[i]);
        offset += Buffer.byteLength(allObjects[i], 'utf8');
    }
    // XRef table
    const xrefOffset = offset;
    let xref = 'xref\n0 ' + (allObjects.length + 1) + '\n';
    // entry 0
    xref += '0000000000 65535 f \n';
    for (let i = 0; i < offsets.length; i++) {
        const pos = offsets[i] + pdfParts.slice(0, i + 1).join('').length - Buffer.byteLength(allObjects[i], 'utf8');
        const posStr = pos.toString().padStart(10, '0');
        xref += `${posStr} 00000 n \n`;
    }
    // Trailer
    const trailer = `trailer\n<< /Size ${allObjects.length + 1} /Root ${catalogIndex} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
    const pdfString = pdfParts.join('') + xref + trailer;
    return Buffer.from(pdfString, 'utf8');
}
/**
 * Gera um arquivo PDF com o plano alimentar.  As páginas são:
 * 1. Capa com nome do paciente e data
 * 2. Avaliação com métricas antropométricas e macros
 * 3. Plano alimentar com lista de refeições e itens
 * 4. Substituições equivalentes por grupo
 *
 * @param patient Informações do paciente (nome, data, peso, altura, etc.)
 * @param metabolic Saída do núcleo metabólico
 * @param dietPlan Plano de dieta gerado
 * @returns Promise<Buffer> contendo o PDF
 */
async function exportDietPdf(patient, metabolic, dietPlan) {
    var _a, _b;
    const pages = [];
    // Página 1: capa
    pages.push([
        `Plano Alimentar Equilibrium`,
        '',
        `Nome: ${patient.name}`,
        `Data: ${patient.date}`,
        '',
        'Plano personalizado gerado pelo sistema Equilibrium.',
    ]);
    // Página 2: avaliação
    const imc = patient.pesoKg && patient.alturaM && patient.alturaM > 0 ? patient.pesoKg / (patient.alturaM ** 2) : undefined;
    pages.push([
        'Avaliação',
        '',
        `Peso: ${(_a = patient.pesoKg) !== null && _a !== void 0 ? _a : 'N/A'} kg`,
        `Altura: ${(_b = patient.alturaM) !== null && _b !== void 0 ? _b : 'N/A'} m`,
        imc ? `IMC: ${imc.toFixed(1)}` : 'IMC: N/A',
        patient.bfPercent ? `Percentual de gordura: ${patient.bfPercent}%` : 'Percentual de gordura: N/A',
        `Objetivo: ${metabolic.strategy}`,
        `Kcal alvo: ${metabolic.kcalTarget} kcal`,
        `Macros (g): Proteína ${metabolic.proteinG}, Gordura ${metabolic.fatG}, Carb ${metabolic.carbG}`,
    ]);
    // Página 3: plano alimentar
    const mealLines = ['Plano Alimentar', ''];
    dietPlan.meals.forEach((meal, idx) => {
        mealLines.push(`${idx + 1}. ${meal.name} (kcal ${meal.kcal.toFixed(0)}):`);
        meal.items.forEach(item => {
            mealLines.push(`  - ${item.nome} ${item.quantity}${item.unit}`);
        });
        mealLines.push('');
    });
    pages.push(mealLines);
    // Página 4: substituições equivalentes
    const subsLines = ['Substituições Equivalentes', ''];
    // Agrupar por grupo: para cada alimento base, listar equivalentes
    const handled = new Set();
    dietPlan.meals.forEach(meal => {
        meal.items.forEach(item => {
            if (!handled.has(item.foodId)) {
                handled.add(item.foodId);
                const eqFoods = (0, substitutions_1.getEquivalentFoods)(item.foodId);
                if (eqFoods.length > 0) {
                    subsLines.push(`${item.nome}:`);
                    eqFoods.forEach((eqFood) => subsLines.push(`  • ${eqFood.nome}`));
                    subsLines.push('');
                }
            }
        });
    });
    if (subsLines.length === 2) {
        subsLines.push('Não há substituições sugeridas para esta dieta.');
    }
    pages.push(subsLines);
    // Criar PDF
    const buffer = createSimplePdf(pages);
    return buffer;
}
