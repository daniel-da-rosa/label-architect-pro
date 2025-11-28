import React from 'react';
import { Box as BoxIcon, Trash2 } from 'lucide-react';
import { TextProperties } from '../Properties/TextProperties';
import { BarcodeProperties } from '../Properties/BarcodeProperties';
import { BoxProperties } from '../Properties/BoxProperties';

export const PropertiesPanel = ({ selectedObject, canvas, onDelete, onCompile }) => {
  return (
    <aside className="w-96 bg-white border-l border-gray-200 flex flex-col overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-700">Propriedades</h3>
      </div>

      {selectedObject ? (
        <div className="p-4 space-y-4">
          {/* Tipo do Objeto */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm font-medium text-blue-900">
              Tipo: {
                selectedObject.appType === 'text' ? 'Texto' :
                selectedObject.appType === 'barcode' ? 'Código de Barras' :
                selectedObject.appType === 'box' ? 'Caixa' : 'Desconhecido'
              }
            </p>
          </div>

          {/* Propriedades Específicas */}
          {selectedObject.appType === 'text' && (
            <TextProperties 
              selectedObject={selectedObject} 
              canvas={canvas}
              onCompile={onCompile}
            />
          )}

          {selectedObject.appType === 'barcode' && (
            <BarcodeProperties 
              selectedObject={selectedObject} 
              canvas={canvas}
              onCompile={onCompile}
            />
          )}

          {selectedObject.appType === 'box' && (
            <BoxProperties 
              selectedObject={selectedObject} 
              canvas={canvas}
              onCompile={onCompile}
            />
          )}

          {/* Posição e Dimensões */}
          <div className="pt-4 border-t border-gray-200 space-y-3">
            <h4 className="text-sm font-semibold text-gray-700">Posição e Tamanho</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">X (mm)</label>
                <input
                  type="number"
                  value={Math.round(selectedObject.left || 0)}
                  onChange={(e) => {
                    selectedObject.set('left', parseInt(e.target.value));
                    canvas.renderAll();
                  }}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Y (mm)</label>
                <input
                  type="number"
                  value={Math.round(selectedObject.top || 0)}
                  onChange={(e) => {
                    selectedObject.set('top', parseInt(e.target.value));
                    canvas.renderAll();
                  }}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Largura</label>
                <input
                  type="number"
                  value={Math.round(selectedObject.width * (selectedObject.scaleX || 1))}
                  onChange={(e) => {
                    const newWidth = parseInt(e.target.value);
                    selectedObject.set('scaleX', newWidth / selectedObject.width);
                    canvas.renderAll();
                  }}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Altura</label>
                <input
                  type="number"
                  value={Math.round(selectedObject.height * (selectedObject.scaleY || 1))}
                  onChange={(e) => {
                    const newHeight = parseInt(e.target.value);
                    selectedObject.set('scaleY', newHeight / selectedObject.height);
                    canvas.renderAll();
                  }}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Rotação (°)</label>
              <input
                type="range"
                min="0"
                max="360"
                value={selectedObject.angle || 0}
                onChange={(e) => {
                  selectedObject.set('angle', parseInt(e.target.value));
                  canvas.renderAll();
                }}
                className="w-full"
              />
              <div className="text-center text-sm text-gray-600 mt-1">
                {selectedObject.angle || 0}°
              </div>
            </div>
          </div>

          {/* Botão Excluir */}
          <button
            onClick={onDelete}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition font-medium"
          >
            <Trash2 size={18} />
            Excluir Item
          </button>
        </div>
      ) : (
        <div className="p-8 text-center text-gray-400 flex-1 flex flex-col items-center justify-center">
          <BoxIcon size={48} className="mx-auto mb-3 opacity-50" />
          <p>Selecione um item para editar</p>
        </div>
      )}
    </aside>
  );
};
