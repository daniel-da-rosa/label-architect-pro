/**
 * Parser PPLA Universal
 * Extrai e interpreta comandos PPLA de etiquetas
 */

export const parsePPLACommand = (line) => {
  line = line.trim();
  if (!line || line.length < 2) return null;

  // Ignorar cabeçalhos e comandos de controle
  const firstChar = line[0].toUpperCase();
  if (['M', 'E', 'K', 'L', 'C', 'H', 'Q', 'N', 'S', 'D', 'P'].includes(firstChar) && line.length < 5) {
    return null;
  }

  const linguagem = parseInt(line[0], 10);
  if (isNaN(linguagem) || linguagem !== 1) return null;

  const comando = parseInt(line[1], 10);

  // Detectar se é comando especial (1E = barcode)
  if (line[1].toUpperCase() === 'E') {
    // Código de Barras formato: 1E2212500450075700001257541
    if (line.length < 17) return null;

    return {
      type: 'barcode',
      orientation: parseInt(line[2], 10),
      barcodeType: line[3], // 2 = Code128, etc
      wideBar: parseInt(line[4], 10),
      narrowBar: parseInt(line[5], 10),
      height: parseInt(line.substring(6, 9), 10),
      y: parseInt(line.substring(9, 13), 10),
      x: parseInt(line.substring(13, 17), 10),
      data: line.substring(17)
    };
  }

  const subComando = parseInt(line[2], 10);

  switch (comando) {
    case 2: // Texto (comandos 121, 131, 141, 161)
      if (line.length < 16) return null;

      // Formato: 121100004100075101texto
      //          │││││││││││││││└─ texto
      //          ││││││││││└┴┴┴─── X (4 dígitos)
      //          │││││└┴┴┴┴──────── Y (4 dígitos)  
      //          │││└┴────────────── subtipo fonte (3 dígitos)
      //          ││└──────────────── multiplicador V
      //          │└───────────────── multiplicador H
      //          └────────────────── subtipo texto (1,3,4,6)

      const textData = line.substring(3);
      return {
        type: 'text',
        subType: `1${comando}${subComando}`, // 121, 131, 141, 161
        orientation: parseInt(textData[0], 10),
        font: textData[1],
        hMultiplier: parseInt(textData[2], 10),
        vMultiplier: parseInt(textData[3], 10),
        fontSubtype: parseInt(textData.substring(4, 7), 10),
        y: parseInt(textData.substring(7, 11), 10),
        x: parseInt(textData.substring(11, 15), 10),
        text: textData.substring(15)
      };

    case 3: // Linha (comando 13 com 7 caracteres constantes)
      if (line.length < 20) return null;
      const lineData = line.substring(3);
      if (!lineData.startsWith('1100') && !lineData.startsWith('X11000')) return null;

      return {
        type: 'line',
        y: parseInt(lineData.substring(7, 11), 10),
        x: parseInt(lineData.substring(11, 15), 10),
        width: parseInt(lineData.substring(16, 19), 10),
        height: parseInt(lineData.substring(19, 22), 10)
      };

    case 4: // Caixa (comando 14)
      if (line.length < 20) return null;
      const boxData = line.substring(3);

      return {
        type: 'box',
        y: parseInt(boxData.substring(0, 4), 10),
        x: parseInt(boxData.substring(4, 8), 10),
        width: parseInt(boxData.substring(9, 12), 10),
        height: parseInt(boxData.substring(12, 15), 10),
        hThickness: parseInt(boxData.substring(15, 18), 10),
        vThickness: parseInt(boxData.substring(18, 21), 10)
      };

    default:
      return null;
  }
};

export const mapPPLABarcodeType = (pplaType) => {
  // Mapeia tipos de código PPLA para bwip-js
  // Baseado no Comando 2, campo "Tipo de código de barras"
  const typeMap = {
    '0': 'code39',     // Code 39
    '1': 'code128',    // Code 128 (mais comum)
    '2': 'code128',    // Code 128 variante
    '3': 'ean13',      // EAN-13
    '4': 'ean8',       // EAN-8
    'E': 'code128',    // Code 128 Extended
    'Q': 'qrcode',     // QR Code
    'A': 'code128',    // Com texto
    'a': 'code128'     // Sem texto
  };
  return typeMap[pplaType] || 'code128';
};

export const calculateCanvasDimensions = (elements) => {
  let maxX = 0, maxY = 0;
  
  elements.forEach(el => {
    if (el.x) maxX = Math.max(maxX, el.x);
    if (el.y) maxY = Math.max(maxY, el.y);
  });

  // Converter décimos de mm para mm e adicionar margem
  const canvasWidthMM = Math.ceil((maxX / 10) + 20);
  const canvasHeightMM = Math.ceil((maxY / 10) + 30);

  return {
    width: Math.max(canvasWidthMM, 100),
    height: Math.max(canvasHeightMM, 50)
  };
};

export const parsePPLACode = (pplaCode) => {
  const lines = pplaCode.split('\n');
  const elements = [];

  lines.forEach(line => {
    const parsed = parsePPLACommand(line);
    if (parsed) elements.push(parsed);
  });

  return elements;
};
