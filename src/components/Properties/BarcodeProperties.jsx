import React from 'react';
import { refreshBarcodeImage } from '../../utils/barcodeGenerator';

export const BarcodeProperties = ({ selectedObject, canvas, onCompile }) => {
  const handleDataChange = (value) => {
    selectedObject.barcodeData = value;
    refreshBarcodeImage(selectedObject, canvas);
    onCompile?.();
  };

  const handleTypeChange = (value) => {
    selectedObject.barcodeType = value;
    refreshBarcodeImage(selectedObject, canvas);
    onCompile?.();
  };

  const toggleShowText = () => {
    selectedObject.showText = !selectedObject.showText;
    refreshBarcodeImage(selectedObject, canvas);
    onCompile?.();
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Dados</label>
        <input
          type="text"
          value={selectedObject.barcodeData || ''}
          onChange={(e) => handleDataChange(e.target.value)}
          placeholder="Digite os dados do código"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Código</label>
        <select
          value={selectedObject.barcodeType || 'code128'}
          onChange={(e) => handleTypeChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="code128">Code 128</option>
          <option value="code39">Code 39</option>
          <option value="ean13">EAN-13</option>
          <option value="ean8">EAN-8</option>
          <option value="qrcode">QR Code</option>
          <option value="datamatrix">Data Matrix</option>
        </select>
      </div>

      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={selectedObject.showText !== false}
            onChange={toggleShowText}
            className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-sm font-medium text-gray-700">Mostrar texto</span>
        </label>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          <strong>Dica:</strong> QR Codes podem armazenar URLs, textos longos e dados complexos.
        </p>
      </div>
    </div>
  );
};
