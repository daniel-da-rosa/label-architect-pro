import React, { useState, useRef } from 'react';
import { fabric } from 'fabric';
import { compile, preview } from './compilers/adapter';

// Components
import { Sidebar } from './components/Layout/Sidebar';
import { PropertiesPanel } from './components/Layout/PropertiesPanel';
import { SettingsBar } from './components/Canvas/SettingsBar';
import { LabelCanvas } from './components/Canvas/LabelCanvas';
import { ImportPPLAModal } from './components/Modals/ImportPPLAModal';
import { CodeOutput } from './components/CodePanel/CodeOutput';

// Hooks
import { useCanvas } from './hooks/useCanvas';

// Utils
import { generateBarcode } from './utils/barcodeGenerator';
import { 
  parsePPLACode, 
  calculateCanvasDimensions, 
  mapPPLABarcodeType 
} from './utils/pplaParser';

function App() {
  const barcodeBufferRef = useRef(null);
  
  // Estados
  const [selectedObject, setSelectedObject] = useState(null);
  const [labelConfig, setLabelConfig] = useState({
    width: 100,
    height: 50,
    dpi: 8
  });
  const [compiledCode, setCompiledCode] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('ZPL');
  const [showImportModal, setShowImportModal] = useState(false);
  const [pplaCode, setPplaCode] = useState('');

  // Canvas hook
  const { canvasRef, canvas } = useCanvas(labelConfig, setSelectedObject);

  // ============ FUNÇÕES DE ADIÇÃO DE ELEMENTOS ============
  
  const addText = () => {
    if (!canvas) return;
    
    const text = new fabric.IText('Novo Texto', {
      left: 50,
      top: 50,
      fontSize: 20,
      fontFamily: 'Arial'
    });
    text.appType = 'text';
    canvas.add(text);
    canvas.setActiveObject(text);
    compileCode();
  };

  const addBarcode = () => {
    if (!canvas) return;

    const barcodeData = '123456789';
    const imgData = generateBarcode(barcodeData, 'code128', true);

    if (imgData) {
      fabric.Image.fromURL(imgData, (img) => {
        img.set({
          left: 50,
          top: 50
        });
        img.appType = 'barcode';
        img.barcodeData = barcodeData;
        img.barcodeType = 'code128';
        img.showText = true;
        canvas.add(img);
        canvas.setActiveObject(img);
        compileCode();
      });
    }
  };

  const addBox = () => {
    if (!canvas) return;

    const box = new fabric.Rect({
      left: 50,
      top: 50,
      width: 100,
      height: 50,
      fill: 'transparent',
      stroke: 'black',
      strokeWidth: 2
    });
    box.appType = 'box';
    canvas.add(box);
    canvas.setActiveObject(box);
    compileCode();
  };

  // ============ GERENCIAMENTO DE CANVAS ============

  const clearCanvas = () => {
    if (!canvas) return;
    if (confirm('Deseja realmente limpar todo o canvas?')) {
      canvas.clear();
      canvas.backgroundColor = 'white';
      canvas.renderAll();
      setCompiledCode('');
      setSelectedObject(null);
    }
  };

  const deleteSelected = () => {
    if (!canvas || !selectedObject) return;
    canvas.remove(selectedObject);
    setSelectedObject(null);
    compileCode();
  };

  // ============ IMPORTAÇÃO/EXPORTAÇÃO ============

  const saveProject = () => {
    if (!canvas) return;

    const projectData = {
      version: '1.0',
      labelConfig,
      canvas: canvas.toJSON(['appType', 'barcodeData', 'barcodeType', 'showText'])
    };

    const blob = new Blob([JSON.stringify(projectData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'label-project.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadProject = () => {
    if (!canvas) return;

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const projectData = JSON.parse(event.target.result);
          
          if (projectData.labelConfig) {
            setLabelConfig(projectData.labelConfig);
          }

          setTimeout(() => {
            canvas.loadFromJSON(projectData.canvas, () => {
              canvas.renderAll();
              compileCode();
            });
          }, 100);
        } catch (error) {
          alert('Erro ao carregar o projeto: ' + error.message);
        }
      };
      reader.readAsText(file);
    };
    
    input.click();
  };

  // ============ IMPORTAÇÃO PPLA ============

  const importPPLA = () => {
    if (!canvas || !pplaCode.trim()) {
      alert('Cole o código PPLA antes de importar');
      return;
    }

    try {
      const elements = parsePPLACode(pplaCode);

      if (elements.length === 0) {
        alert('Nenhum comando PPLA válido encontrado');
        return;
      }

      // Calcular dimensões e atualizar config
      const dimensions = calculateCanvasDimensions(elements);
      setLabelConfig({
        ...labelConfig,
        ...dimensions
      });

      // Aguardar o canvas redimensionar
      setTimeout(() => {
        // Limpar canvas antes de importar
        canvas.clear();
        canvas.backgroundColor = 'white';

        // Converter cada elemento para Fabric.js
        elements.forEach(element => {
          switch (element.type) {
            case 'text':
              const text = new fabric.IText(element.text, {
                left: element.x / 10,
                top: element.y / 10,
                fontSize: parseInt(element.hMultiplier) * 12,
                fontFamily: 'Arial',
                angle: element.orientation * 90
              });
              text.appType = 'text';
              canvas.add(text);
              break;

            case 'barcode':
              const barcodeType = mapPPLABarcodeType(element.barcodeType);
              const imgData = generateBarcode(element.data, barcodeType, true);

              if (imgData) {
                fabric.Image.fromURL(imgData, (img) => {
                  img.set({
                    left: element.x / 10,
                    top: element.y / 10,
                    angle: element.orientation * 90
                  });
                  img.appType = 'barcode';
                  img.barcodeData = element.data;
                  img.barcodeType = barcodeType;
                  img.showText = true;
                  canvas.add(img);
                  canvas.renderAll();
                });
              }
              break;

            case 'box':
              const box = new fabric.Rect({
                left: element.x / 10,
                top: element.y / 10,
                width: element.width / 10,
                height: element.height / 10,
                fill: 'transparent',
                stroke: 'black',
                strokeWidth: Math.max(element.hThickness, element.vThickness) / 10
              });
              box.appType = 'box';
              canvas.add(box);
              break;

            case 'line':
              const line = new fabric.Line(
                [
                  element.x / 10,
                  element.y / 10,
                  (element.x + element.width) / 10,
                  (element.y + element.height) / 10
                ],
                {
                  stroke: 'black',
                  strokeWidth: 2
                }
              );
              line.appType = 'line';
              canvas.add(line);
              break;
          }
        });

        canvas.renderAll();
        compileCode();
        alert(`✓ ${elements.length} elementos importados com sucesso!`);
      }, 200);
    } catch (error) {
      alert('Erro ao importar PPLA: ' + error.message);
      console.error(error);
    }
  };

  // ============ COMPILAÇÃO DE CÓDIGO ============

  const compileCode = (language = selectedLanguage) => {
    if (!canvas) return;
    
    try {
      const code = compile(canvas, labelConfig, language);
      setCompiledCode(code);
    } catch (error) {
      console.error('Erro ao compilar:', error);
    }
  };

  const previewZPL = () => {
    if (!compiledCode) {
      alert('Nenhum código para visualizar');
      return;
    }
    preview(compiledCode, selectedLanguage);
  };

  // ============ RENDER ============

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Modal de Importação PPLA */}
      <ImportPPLAModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        pplaCode={pplaCode}
        setPplaCode={setPplaCode}
        onImport={importPPLA}
      />

      {/* Layout Principal */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar Esquerda */}
        <Sidebar
          onAddText={addText}
          onAddBarcode={addBarcode}
          onAddBox={addBox}
          onSaveProject={saveProject}
          onLoadProject={loadProject}
          onShowImport={() => setShowImportModal(true)}
          onClearCanvas={clearCanvas}
          onToggleSettings={() => setShowSettings(!showSettings)}
        />

        {/* Área Central */}
        <main className="flex-1 flex flex-col">
          {/* Barra de Configurações */}
          <SettingsBar
            labelConfig={labelConfig}
            onConfigChange={setLabelConfig}
            isVisible={showSettings}
          />

          {/* Canvas */}
          <LabelCanvas canvasRef={canvasRef} />
        </main>

        {/* Painel Direito */}
        <div className="w-96 flex flex-col">
          {/* Propriedades */}
          <div className="flex-1 overflow-y-auto">
            <PropertiesPanel
              selectedObject={selectedObject}
              canvas={canvas}
              onDelete={deleteSelected}
              onCompile={compileCode}
            />
          </div>

          {/* Código Gerado */}
          <CodeOutput
            compiledCode={compiledCode}
            selectedLanguage={selectedLanguage}
            onLanguageChange={(lang) => {
              setSelectedLanguage(lang);
              setTimeout(() => compileCode(lang), 0);
            }}
            onPreview={previewZPL}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
