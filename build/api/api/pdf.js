"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePdf = generatePdf;
const pdf_1 = require("../core/diet/pdf");
/**
 * Função que emula o endpoint /api/pdf.  Recebe objetos do paciente,
 * resultado metabólico e plano de dieta, gera o PDF usando o
 * mecanismo interno e retorna um Buffer.  Ao contrário de uma rota
 * Next.js, esta função pode ser chamada diretamente em testes ou
 * componentes para obter o binário do PDF.
 *
 * @param patient Informações do paciente (nome, data, peso, altura, %BF)
 * @param metabolic Saída do núcleo metabólico
 * @param dietPlan Plano de dieta gerado
 * @returns Buffer contendo o PDF
 */
async function generatePdf({ patient, metabolic, dietPlan }) {
    return (0, pdf_1.exportDietPdf)(patient, metabolic, dietPlan);
}
