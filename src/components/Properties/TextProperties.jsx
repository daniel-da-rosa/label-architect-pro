import React from 'react';

export const TextProperties = ({ selectedObject, canvas, onCompile }) => {
  const handleTextChange = (value) => {
    selectedObject.set('text', value);
    canvas.renderAll();
    onCompile?.();
  };

  const handleFontSizeChange = (value) => {
    selectedObject.set('fontSize', parseInt(value));
    canvas.renderAll();
    onCompile?.();
  };

  const handleFontFamilyChange = (value) => {
    selectedObject.set('fontFamily', value);
    canvas.renderAll();
    onCompile?.();
  };

  const handleStyleChange = (style) => {
    const currentValue = selectedObject.get(style);
    selectedObject.set(style, currentValue === 'normal' ? 'bold' : 'normal');
    canvas.renderAll();
    onCompile?.();
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Conteúdo</label>
        <textarea
          value={selectedObject.text}
          onChange={(e) => handleTextChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Tamanho</label>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="8"
            max="72"
            value={selectedObject.fontSize}
            onChange={(e) => handleFontSizeChange(e.target.value)}
            className="flex-1"
          />
          <input
            type="number"
            value={selectedObject.fontSize}
            onChange={(e) => handleFontSizeChange(e.target.value)}
            className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Fonte</label>
        <select
          value={selectedObject.fontFamily}
          onChange={(e) => handleFontFamilyChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="Arial">Arial</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Courier New">Courier New</option>
          <option value="Verdana">Verdana</option>
          <option value="Georgia">Georgia</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Estilo</label>
        <div className="flex gap-2">
          <button
            onClick={() => handleStyleChange('fontWeight')}
            className={`flex-1 px-3 py-2 border rounded-lg transition ${
              selectedObject.fontWeight === 'bold'
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <strong>Negrito</strong>
          </button>
          <button
            onClick={() => handleStyleChange('fontStyle')}
            className={`flex-1 px-3 py-2 border rounded-lg transition ${
              selectedObject.fontStyle === 'italic'
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <em>Itálico</em>
          </button>
        </div>
      </div>
    </div>
  );
};
