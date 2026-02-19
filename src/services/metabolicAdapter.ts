/*
 * Adaptador simples para consumir o núcleo metabólico V1 na camada de UI.
 *
 * Este módulo demonstra como usar as funções puras definidas em `metabolic.ts`
 * para gerar um plano metabólico completo a partir de dados de entrada de um
 * formulário ou componente React.  A função `gerarPlanoParaUI` recebe um
 * objeto `MetabolicInput` e retorna o resultado de `gerarPlanoMetabolico`
 * juntamente com uma estrutura de apresentação pronta para exibição.
 */

import { MetabolicInput } from './types';
import { gerarPlanoMetabolico } from './metabolic';

/**
 * Gera um plano metabólico e o adapta para consumo na UI.  Além dos
 * cálculos, este adaptador formata as propriedades em português e adiciona
 * legendas amigáveis que podem ser diretamente exibidas na interface.
 *
 * @param input Os dados do cliente conforme o tipo `MetabolicInput`.
 * @returns Um objeto contendo o plano e uma representação amigável para UI.
 */
export function gerarPlanoParaUI(input: MetabolicInput) {
  const plano = gerarPlanoMetabolico(input);
  // Formatar campos em português para apresentação
  const resumo = {
    tmb: Math.round(plano.tmb.valor),
    metodoTMB: plano.tmb.metodo,
    get: Math.round(plano.get),
    kcalAlvo: plano.kcalAlvo,
    macros: {
      proteina: plano.macros.proteinGrams,
      gordura: plano.macros.fatGrams,
      carbo: plano.macros.carbGrams,
    },
    avisos: plano.warnings,
  };
  return { plano, resumo };
}

/*
 * Exemplo de uso:
 *
 * import { gerarPlanoParaUI } from './services/metabolicAdapter';
 *
 * const input: MetabolicInput = {
 *   sexo: 'F',
 *   idade: 31,
 *   pesoKg: 59,
 *   alturaM: 1.60,
 *   bfPercent: 25,
 *   sport: 'Fitness',
 *   nivelAtividade: 'Moderado',
 *   objetivo: 'Emagrecimento',
 * };
 *
 * const { plano, resumo } = gerarPlanoParaUI(input);
 * console.log(resumo);
 */