// Sistema de Compiladores Modular
// Cada linguagem é um plugin independente

export const compilers = {
  ZPL: {
    name: 'Zebra ZPL',
    description: 'Zebra Programming Language',
    manufacturer: 'Zebra Technologies',
    fileExtension: 'zpl',
    
    compile: (objects) => {
      let code = '^XA\n^MNY\n';
      
      objects.forEach(obj => {
        const x = Math.round(obj.left);
        const y = Math.round(obj.top);
        
        // Calcular orientação
        const angle = obj.angle || 0;
        let orientation = 'N';
        if (angle >= 45 && angle < 135) orientation = 'R';
        else if (angle >= 135 && angle < 225) orientation = 'I';
        else if (angle >= 225 && angle < 315) orientation = 'B';
        
        if (obj.appType === 'text') {
          const h = Math.round(obj.fontSize * (obj.scaleY || 1));
          code += `^FO${x},${y}^A0${orientation},${h},${h}^FD${obj.text}^FS\n`;
        } 
        else if (obj.appType === 'barcode') {
          const h = Math.round(obj.height * (obj.scaleY || 1));
          const data = obj.barcodeData;
          const type = obj.barcodeType;
          
          if (type === 'qrcode') {
            const scale = Math.max(2, Math.round((obj.scaleX || 1) * 3));
            code += `^FO${x},${y}^BQ${orientation},2,${scale}^FDQA,${data}^FS\n`;
          } else if (type === 'code128') {
            code += `^FO${x},${y}^BY2^BC${orientation},${h},Y,N,N^FD${data}^FS\n`;
          } else if (type === 'ean13') {
            code += `^FO${x},${y}^BY2^BE${orientation},${h},Y,N^FD${data}^FS\n`;
          } else if (type === 'code39') {
            code += `^FO${x},${y}^BY2^B3${orientation},N,${h},Y,N^FD${data}^FS\n`;
          }
        }
        else if (obj.appType === 'box') {
          const w = Math.round(obj.width * (obj.scaleX || 1));
          const h = Math.round(obj.height * (obj.scaleY || 1));
          const b = Math.round(obj.strokeWidth);
          
          if (angle >= 45 && angle < 135 || angle >= 225 && angle < 315) {
            code += `^FO${x},${y}^GB${h},${w},${b}^FS\n`;
          } else {
            code += `^FO${x},${y}^GB${w},${h},${b}^FS\n`;
          }
        }
      });
      
      code += '^XZ';
      return code;
    },
    
    preview: (code) => {
      const url = `http://api.labelary.com/v1/printers/8dpmm/labels/4x6/0/${encodeURIComponent(code)}`;
      window.open(url, '_blank');
    }
  },

  PPLA: {
    name: 'Argox PPLA',
    description: 'Printer Programming Language A',
    manufacturer: 'Argox',
    fileExtension: 'ppla',
    
    compile: (objects) => {
      let code = '';
      
      // Header PPLA
      code += 'n\n'; // Limpar buffer
      code += 'q800\n'; // Largura label
      code += 'Q400,24\n'; // Altura label e gap
      code += 'S4\n'; // Velocidade
      code += 'D8\n'; // Densidade
      
      objects.forEach(obj => {
        const x = Math.round(obj.left);
        const y = Math.round(obj.top);
        
        // Calcular rotação (0-3 no PPLA)
        const angle = obj.angle || 0;
        let rotation = 0;
        if (angle >= 45 && angle < 135) rotation = 1;
        else if (angle >= 135 && angle < 225) rotation = 2;
        else if (angle >= 225 && angle < 315) rotation = 3;
        
        if (obj.appType === 'text') {
          const h = Math.round(obj.fontSize * (obj.scaleY || 1) / 10); // PPLA usa escala diferente
          const w = h;
          code += `A${rotation},${x},${y},1,1,${h},${w},N,"${obj.text}"\n`;
        }
        else if (obj.appType === 'barcode') {
          const h = Math.round(obj.height * (obj.scaleY || 1));
          const data = obj.barcodeData;
          const type = obj.barcodeType;
          
          if (type === 'qrcode') {
            const scale = Math.max(1, Math.round((obj.scaleX || 1) * 2));
            code += `b${x},${y},Q,s${scale},m2,e2,"${data}"\n`;
          } else if (type === 'code128') {
            code += `1E${rotation}${x},${y},0,3,2,0,${h},B,"${data}"\n`;
          } else if (type === 'code39') {
            code += `1${rotation}${x},${y},0,3,2,0,${h},B,"${data}"\n`;
          } else if (type === 'ean13') {
            code += `1E${rotation}${x},${y},0,3,2,0,${h},B,"${data}"\n`;
          }
        }
        else if (obj.appType === 'box') {
          const w = Math.round(obj.width * (obj.scaleX || 1));
          const h = Math.round(obj.height * (obj.scaleY || 1));
          const b = Math.round(obj.strokeWidth);
          
          // PPLA usa linhas para fazer caixas
          code += `X${x},${y},${b},${w}\n`; // Linha horizontal topo
          code += `X${x},${y + h},${b},${w}\n`; // Linha horizontal baixo
          code += `Y${x},${y},${b},${h}\n`; // Linha vertical esquerda
          code += `Y${x + w},${y},${b},${h}\n`; // Linha vertical direita
        }
      });
      
      code += 'P1\n'; // Imprimir 1 label
      return code;
    },
    
    preview: null // PPLA não tem preview online
  },

  PPLB: {
    name: 'Argox PPLB',
    description: 'Printer Programming Language B (Advanced)',
    manufacturer: 'Argox',
    fileExtension: 'pplb',
    
    compile: (objects) => {
      let code = '';
      
      // Header PPLB (mais moderno que PPLA)
      code += '<STX>n\n';
      code += '<STX>m\n'; // Modo métrico
      code += '<STX>M0800\n'; // Largura
      code += '<STX>L0400\n'; // Altura
      code += '<STX>D0\n'; // Densidade normal
      
      objects.forEach(obj => {
        const x = Math.round(obj.left);
        const y = Math.round(obj.top);
        
        const angle = obj.angle || 0;
        let rotation = 0;
        if (angle >= 45 && angle < 135) rotation = 1;
        else if (angle >= 135 && angle < 225) rotation = 2;
        else if (angle >= 225 && angle < 315) rotation = 3;
        
        if (obj.appType === 'text') {
          const h = Math.round(obj.fontSize * (obj.scaleY || 1) / 10);
          code += `<STX>1911A${rotation}V${y}H${x}M${h}L${h}S${obj.text}\n`;
        }
        else if (obj.appType === 'barcode') {
          const h = Math.round(obj.height * (obj.scaleY || 1));
          const data = obj.barcodeData;
          const type = obj.barcodeType;
          
          if (type === 'qrcode') {
            code += `<STX>1bV${y}H${x}o0M2,${data}\n`;
          } else if (type === 'code128') {
            code += `<STX>1E${rotation}V${y}H${x}P3W2Bf${h}d2,${data}\n`;
          } else if (type === 'code39') {
            code += `<STX>1${rotation}V${y}H${x}P3W2B0${h}d2,${data}\n`;
          } else if (type === 'ean13') {
            code += `<STX>1E${rotation}V${y}H${x}P3W2Be${h}d2,${data}\n`;
          }
        }
        else if (obj.appType === 'box') {
          const w = Math.round(obj.width * (obj.scaleX || 1));
          const h = Math.round(obj.height * (obj.scaleY || 1));
          const b = Math.round(obj.strokeWidth);
          
          code += `<STX>1XH${x}V${y}T${b}L${w}\n`; // Topo
          code += `<STX>1XH${x}V${y + h}T${b}L${w}\n`; // Baixo
          code += `<STX>1YH${x}V${y}T${b}L${h}\n`; // Esquerda
          code += `<STX>1YH${x + w}V${y}T${b}L${h}\n`; // Direita
        }
      });
      
      code += '<STX>E\n'; // Executar
      return code;
    },
    
    preview: null
  },

  EPL: {
    name: 'Eltron EPL',
    description: 'Eltron Programming Language',
    manufacturer: 'Eltron/Zebra',
    fileExtension: 'epl',
    
    compile: (objects) => {
      let code = '';
      
      // Header EPL
      code += 'N\n'; // Limpar buffer
      code += 'q800\n'; // Largura
      code += 'Q400,24\n'; // Altura e gap
      
      objects.forEach(obj => {
        const x = Math.round(obj.left);
        const y = Math.round(obj.top);
        
        const angle = obj.angle || 0;
        let rotation = 0;
        if (angle >= 45 && angle < 135) rotation = 1;
        else if (angle >= 135 && angle < 225) rotation = 2;
        else if (angle >= 225 && angle < 315) rotation = 3;
        
        if (obj.appType === 'text') {
          const h = Math.round(obj.fontSize * (obj.scaleY || 1) / 10);
          code += `A${x},${y},${rotation},3,1,1,N,"${obj.text}"\n`;
        }
        else if (obj.appType === 'barcode') {
          const h = Math.round(obj.height * (obj.scaleY || 1));
          const data = obj.barcodeData;
          const type = obj.barcodeType;
          
          if (type === 'code128') {
            code += `B${x},${y},${rotation},1,2,2,${h},B,"${data}"\n`;
          } else if (type === 'code39') {
            code += `B${x},${y},${rotation},3,2,2,${h},B,"${data}"\n`;
          }
        }
        else if (obj.appType === 'box') {
          const w = Math.round(obj.width * (obj.scaleX || 1));
          const h = Math.round(obj.height * (obj.scaleY || 1));
          const b = Math.round(obj.strokeWidth);
          
          code += `LO${x},${y},${w},${b}\n`; // Linha horizontal
          code += `LO${x},${y + h},${w},${b}\n`;
          code += `LO${x},${y},${b},${h}\n`; // Linha vertical
          code += `LO${x + w},${y},${b},${h}\n`;
        }
      });
      
      code += 'P1\n'; // Imprimir
      return code;
    },
    
    preview: null
  }
};

// Função auxiliar para listar compiladores disponíveis
export const getAvailableCompilers = () => {
  return Object.keys(compilers).map(key => ({
    id: key,
    ...compilers[key]
  }));
};

// Função para compilar usando qualquer linguagem
export const compile = (language, objects) => {
  const compiler = compilers[language];
  if (!compiler) {
    throw new Error(`Compilador '${language}' não encontrado`);
  }
  return compiler.compile(objects);
};

// Função para fazer preview (se disponível)
export const preview = (language, code) => {
  const compiler = compilers[language];
  if (!compiler) {
    throw new Error(`Compilador '${language}' não encontrado`);
  }
  if (!compiler.preview) {
    alert(`Preview não disponível para ${compiler.name}`);
    return;
  }
  compiler.preview(code);
};
