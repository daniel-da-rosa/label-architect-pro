// Adapter para compatibilizar o sistema de compiladores com o App refatorado
import { compile as compileOriginal, preview as previewOriginal, getAvailableCompilers } from './index.js';

/**
 * Compile adapter - converte a assinatura do App refatorado para o sistema original
 * @param {fabric.Canvas} canvas - Canvas do Fabric.js
 * @param {Object} labelConfig - Configuração do label (não usado no sistema atual)
 * @param {string} language - Linguagem (ZPL, PPLA, etc)
 * @returns {string} - Código compilado
 */
export const compile = (canvas, labelConfig, language) => {
  if (!canvas) return '';
  
  // Pegar todos os objetos do canvas
  const objects = canvas.getObjects();
  
  // Chamar o compilador original com a assinatura correta
  return compileOriginal(language, objects);
};

/**
 * Preview adapter
 * @param {string} code - Código gerado
 * @param {string} language - Linguagem
 */
export const preview = (code, language) => {
  previewOriginal(language, code);
};

// Re-exportar getAvailableCompilers
export { getAvailableCompilers };
