import React from 'react';
import { X, FileUp } from 'lucide-react';

export const ImportPPLAModal = ({ isOpen, onClose, pplaCode, setPplaCode, onImport }) => {
  if (!isOpen) return null;

  const handleImport = () => {
    onImport();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <FileUp className="text-blue-500" size={24} />
            <h2 className="text-xl font-bold text-gray-800">Importar Código PPLA</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-gray-600 mb-4">
            Cole o código PPLA completo abaixo. O sistema irá interpretar automaticamente
            os comandos e criar os elementos no canvas.
          </p>

          <textarea
            value={pplaCode}
            onChange={(e) => setPplaCode(e.target.value)}
            placeholder="Cole o código PPLA aqui..."
            className="w-full h-96 px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <div className="mt-4 text-xs text-gray-500">
            <p className="font-medium mb-1">Exemplo de código PPLA:</p>
            <pre className="bg-gray-50 p-2 rounded border border-gray-200 overflow-x-auto">
{`m
K1504
121100004100075101Texto exemplo
1E2212500450075700001257541
Q`}
            </pre>
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleImport}
            className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium"
          >
            Importar
          </button>
        </div>
      </div>
    </div>
  );
};
