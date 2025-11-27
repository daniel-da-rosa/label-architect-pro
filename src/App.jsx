import React, { useState, useEffect, useRef } from 'react';
import { fabric } from 'fabric';
import bwipjs from 'bwip-js';
import { Save, Upload, Trash2, Type, QrCode, Box, Eye, Settings, FileCode } from 'lucide-react';
import { compile, preview, getAvailableCompilers } from './compilers';

function App() {
  const canvasRef = useRef(null);
  const barcodeBufferRef = useRef(null);
  const [canvas, setCanvas] = useState(null);
  const [selectedObject, setSelectedObject] = useState(null);
  const [labelConfig, setLabelConfig] = useState({
    width: 100,
    height: 50,
    dpi: 8
  });
  const [compiledCode, setCompiledCode] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('ZPL');
  const availableCompilers = getAvailableCompilers();

  // Inicializar Fabric.js
  useEffect(() => {
    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      backgroundColor: 'white'
    });

    fabricCanvas.on('selection:created', (e) => setSelectedObject(e.selected[0]));
    fabricCanvas.on('selection:updated', (e) => setSelectedObject(e.selected[0]));
    fabricCanvas.on('selection:cleared', () => setSelectedObject(null));
    fabricCanvas.on('object:modified', () => compileCode(fabricCanvas));
    fabricCanvas.on('object:added', () => compileCode(fabricCanvas));

    setCanvas(fabricCanvas);
    resizeCanvas(fabricCanvas, labelConfig);

    return () => fabricCanvas.dispose();
  }, []);

  // Redimensionar canvas
  const resizeCanvas = (fabricCanvas, config) => {
    if (!fabricCanvas) return;
    const w = config.width * config.dpi;
    const h = config.height * config.dpi;
    fabricCanvas.setDimensions({ width: w, height: h });
    compileCode(fabricCanvas);
  };

  useEffect(() => {
    if (canvas) resizeCanvas(canvas, labelConfig);
  }, [labelConfig, canvas]);

  // Recompilar quando trocar de linguagem
  useEffect(() => {
    if (canvas) compileCode(canvas);
  }, [selectedLanguage, canvas]);

  // Gerar código de barras
  const generateBarcode = (text, type, showText) => {
    try {
      if (!barcodeBufferRef.current) {
        const bufferCanvas = document.createElement('canvas');
        barcodeBufferRef.current = bufferCanvas;
      }

      const opts = {
        bcid: type,
        text: text,
        scale: 2,
        height: 10,
        includetext: showText,
        textxalign: 'center'
      };

      bwipjs.toCanvas(barcodeBufferRef.current, opts);
      return barcodeBufferRef.current.toDataURL('image/png');
    } catch (e) {
      console.error('Erro ao gerar barcode:', e);
      return null;
    }
  };

  // Adicionar texto
  const addText = () => {
    if (!canvas) return;
    const text = new fabric.IText('TEXTO', {
      left: 50,
      top: 50,
      fontSize: 25,
      fontFamily: 'Arial'
    });
    text.appType = 'text';
    canvas.add(text);
    canvas.setActiveObject(text);
  };

  // Adicionar código de barras
  const addBarcode = () => {
    if (!canvas) return;
    const defaultData = '12345678';
    const defaultType = 'code128';
    const imgData = generateBarcode(defaultData, defaultType, true);

    if (imgData) {
      fabric.Image.fromURL(imgData, (img) => {
        img.set({ left: 50, top: 50 });
        img.appType = 'barcode';
        img.barcodeData = defaultData;
        img.barcodeType = defaultType;
        img.showText = true;
        canvas.add(img);
        canvas.setActiveObject(img);
      });
    }
  };

  // Adicionar caixa
  const addBox = () => {
    if (!canvas) return;
    const box = new fabric.Rect({
      left: 50,
      top: 50,
      width: 100,
      height: 50,
      fill: 'transparent',
      stroke: 'black',
      strokeWidth: 2,
      strokeUniform: true
    });
    box.appType = 'box';
    canvas.add(box);
    canvas.setActiveObject(box);
  };

  // Limpar canvas
  const clearCanvas = () => {
    if (!canvas) return;
    canvas.clear();
    canvas.backgroundColor = 'white';
    canvas.renderAll();
    setSelectedObject(null);
  };

  // Deletar objeto selecionado
  const deleteSelected = () => {
    if (!canvas || !selectedObject) return;
    canvas.remove(selectedObject);
    canvas.renderAll();
    setSelectedObject(null);
  };

  // Atualizar barcode
  const refreshBarcodeImage = (obj) => {
    const newData = generateBarcode(obj.barcodeData, obj.barcodeType, obj.showText);
    if (newData) {
      const imgElement = new Image();
      imgElement.src = newData;
      imgElement.onload = () => {
        obj.setElement(imgElement);
        obj.setCoords();
        canvas.renderAll();
      };
    }
  };

  // Compilar ZPL
  const compileCode = (fabricCanvas) => {
    if (!fabricCanvas) return;
    try {
      const objects = fabricCanvas.getObjects();
      const code = compile(selectedLanguage, objects);
      setCompiledCode(code);
    } catch (error) {
      console.error('Erro ao compilar:', error);
      setCompiledCode(`// Erro: ${error.message}`);
    }
  };

  // Visualizar no Labelary
  const previewZPL = () => {
    try {
      preview(selectedLanguage, compiledCode);
    } catch (error) {
      alert(error.message);
    }
  };

  // Salvar projeto
  const saveProject = () => {
    if (!canvas) return;
    const json = JSON.stringify(canvas.toJSON(['appType', 'barcodeData', 'barcodeType', 'showText']));
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'label-project.json';
    a.click();
  };

  // Carregar projeto
  const loadProject = (e) => {
    const file = e.target.files[0];
    if (!file || !canvas) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      canvas.loadFromJSON(event.target.result, () => {
        canvas.renderAll();
        compileCode(canvas);
      });
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <QrCode size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Label Architect Pro</h1>
                <p className="text-blue-100 text-sm">Editor Profissional de Etiquetas Zebra</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={saveProject}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition"
              >
                <Save size={18} />
                Salvar
              </button>

              <label className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition cursor-pointer">
                <Upload size={18} />
                Abrir
                <input type="file" accept=".json" onChange={loadProject} className="hidden" />
              </label>

              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition"
              >
                <Settings size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-700">Ferramentas</h3>
          </div>

          <div className="flex-1 overflow-y-auto">
            <button
              onClick={addText}
              className="w-full flex items-center gap-3 px-6 py-4 hover:bg-blue-50 transition border-b border-gray-100"
            >
              <Type className="text-blue-600" size={20} />
              <span className="font-medium text-gray-700">Adicionar Texto</span>
            </button>

            <button
              onClick={addBarcode}
              className="w-full flex items-center gap-3 px-6 py-4 hover:bg-blue-50 transition border-b border-gray-100"
            >
              <QrCode className="text-blue-600" size={20} />
              <span className="font-medium text-gray-700">Código de Barras</span>
            </button>

            <button
              onClick={addBox}
              className="w-full flex items-center gap-3 px-6 py-4 hover:bg-blue-50 transition border-b border-gray-100"
            >
              <Box className="text-blue-600" size={20} />
              <span className="font-medium text-gray-700">Caixa / Linha</span>
            </button>
          </div>

          <div className="p-4 border-t border-gray-200">
            <button
              onClick={clearCanvas}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition font-medium"
            >
              <Trash2 size={18} />
              Limpar Tudo
            </button>
          </div>
        </aside>

        {/* Área Principal */}
        <main className="flex-1 flex flex-col">
          {/* Configurações */}
          {showSettings && (
            <div className="bg-white border-b border-gray-200 p-4">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Largura (mm):</label>
                  <input
                    type="number"
                    value={labelConfig.width}
                    onChange={(e) => setLabelConfig({ ...labelConfig, width: parseInt(e.target.value) })}
                    className="w-20 px-3 py-1 border border-gray-300 rounded-lg"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Altura (mm):</label>
                  <input
                    type="number"
                    value={labelConfig.height}
                    onChange={(e) => setLabelConfig({ ...labelConfig, height: parseInt(e.target.value) })}
                    className="w-20 px-3 py-1 border border-gray-300 rounded-lg"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">DPI:</label>
                  <select
                    value={labelConfig.dpi}
                    onChange={(e) => setLabelConfig({ ...labelConfig, dpi: parseInt(e.target.value) })}
                    className="px-3 py-1 border border-gray-300 rounded-lg"
                  >
                    <option value={8}>203</option>
                    <option value={12}>300</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Canvas */}
          <div className="flex-1 flex items-center justify-center bg-gray-100 p-8 overflow-auto">
            <div className="shadow-2xl">
              <canvas ref={canvasRef} />
            </div>
          </div>
        </main>

        {/* Painel de Propriedades */}
        <aside className="w-96 bg-white border-l border-gray-200 flex flex-col overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-700">Propriedades</h3>
          </div>

          {selectedObject ? (
            <div className="p-4 space-y-4">
              {selectedObject.appType === 'text' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Conteúdo</label>
                    <input
                      type="text"
                      value={selectedObject.text}
                      onChange={(e) => {
                        selectedObject.set('text', e.target.value);
                        canvas.renderAll();
                        compileCode(canvas);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tamanho</label>
                    <input
                      type="number"
                      value={selectedObject.fontSize}
                      onChange={(e) => {
                        selectedObject.set('fontSize', parseInt(e.target.value));
                        canvas.renderAll();
                        compileCode(canvas);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </>
              )}

              {selectedObject.appType === 'barcode' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dados</label>
                    <input
                      type="text"
                      value={selectedObject.barcodeData}
                      onChange={(e) => {
                        selectedObject.barcodeData = e.target.value;
                        refreshBarcodeImage(selectedObject);
                        compileCode(canvas);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                    <select
                      value={selectedObject.barcodeType}
                      onChange={(e) => {
                        selectedObject.barcodeType = e.target.value;
                        refreshBarcodeImage(selectedObject);
                        compileCode(canvas);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="code128">Code 128</option>
                      <option value="code39">Code 39</option>
                      <option value="ean13">EAN-13</option>
                      <option value="qrcode">QR Code</option>
                    </select>
                  </div>
                </>
              )}

              {selectedObject.appType === 'box' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Espessura</label>
                  <input
                    type="number"
                    value={selectedObject.strokeWidth}
                    onChange={(e) => {
                      selectedObject.set('strokeWidth', parseInt(e.target.value));
                      canvas.renderAll();
                      compileCode(canvas);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              )}

              <button
                onClick={deleteSelected}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition font-medium"
              >
                <Trash2 size={18} />
                Excluir Item
              </button>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-400">
              <Box size={48} className="mx-auto mb-3 opacity-50" />
              <p>Selecione um item para editar</p>
            </div>
          )}

          <div className="mt-auto border-t border-gray-200">
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-700">Código</h3>
                <FileCode size={18} className="text-gray-500" />
              </div>

              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">Linguagem</label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  {availableCompilers.map(compiler => (
                    <option key={compiler.id} value={compiler.id}>
                      {compiler.name} - {compiler.manufacturer}
                    </option>
                  ))}
                </select>
              </div>

              <textarea
                value={compiledCode}
                readOnly
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg font-mono text-xs bg-gray-50"
              />

              <button
                onClick={previewZPL}
                className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition font-medium"
              >
                <Eye size={18} />
                Visualizar
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default App;