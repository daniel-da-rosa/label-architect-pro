import bwipjs from 'bwip-js';

/**
 * Gera uma imagem de código de barras
 * @param {string} data - Dados do código de barras
 * @param {string} type - Tipo do código (code128, qrcode, etc)
 * @param {boolean} showText - Mostrar texto abaixo do código
 * @returns {string|null} - Data URL da imagem ou null em caso de erro
 */
export const generateBarcode = (data, type = 'code128', showText = true) => {
  try {
    const canvas = document.createElement('canvas');
    
    const options = {
      bcid: type,
      text: data,
      scale: 3,
      height: 10,
      includetext: showText,
      textxalign: 'center'
    };

    // Configurações específicas para QR Code
    if (type === 'qrcode') {
      options.height = 10;
      options.width = 10;
    }

    bwipjs.toCanvas(canvas, options);
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Erro ao gerar código de barras:', error);
    return null;
  }
};

/**
 * Atualiza a imagem de um código de barras no canvas
 * @param {fabric.Image} barcodeObject - Objeto do código de barras no canvas
 * @param {fabric.Canvas} canvas - Canvas do Fabric.js
 */
export const refreshBarcodeImage = (barcodeObject, canvas) => {
  const newImageData = generateBarcode(
    barcodeObject.barcodeData,
    barcodeObject.barcodeType,
    barcodeObject.showText !== false
  );

  if (newImageData) {
    barcodeObject.setSrc(newImageData, () => {
      canvas.renderAll();
    });
  }
};
