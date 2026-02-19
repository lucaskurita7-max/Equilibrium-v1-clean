import { exportDietPdf } from '../core/diet/pdf';
import { MetabolicOutput } from '../core/metabolic/types';
import { DietPlan } from '../core/diet/dietEngine';

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
export async function generatePdf({ patient, metabolic, dietPlan }: { patient: any; metabolic: MetabolicOutput; dietPlan: DietPlan }): Promise<Buffer> {
  return exportDietPdf(patient, metabolic, dietPlan);
}