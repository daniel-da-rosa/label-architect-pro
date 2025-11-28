import React from 'react';

export const BoxProperties = ({ selectedObject, canvas, onCompile }) => {
  const handleStrokeWidthChange = (value) => {
    selectedObject.set('strokeWidth', parseInt(value));
    canvas.renderAll();
    onCompile?.();
  };

  const handleStrokeColorChange = (value) => {
    selectedObject.set('stroke', value);
    canvas.renderAll();
    onCompile?.();
  };

  const handleFillChange = (value) => {
    selectedObject.set('fill', value === 'transparent' ? 'transparent' : value);
    canvas.renderAll();
    onCompile?.();
  };

  const toggleFill = () => {
    const currentFill = selectedObject.fill;
    selectedObject.set('fill', currentFill === 'transparent' ? 'black' : 'transparent');
    canvas.renderAll();
    onCompile?.();
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Espessura da Borda</label>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="1"
            max="20"
            value={selectedObject.strokeWidth || 1}
            onChange={(e) => handleStrokeWidthChange(e.target.value)}
            className="flex-1"
          />
          <input
            type="number"
            value={selectedObject.strokeWidth || 1}
            onChange={(e) => handleStrokeWidthChange(e.target.value)}
            className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
            min="1"
            max="20"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Cor da Borda</label>
        <div className="flex gap-2">
          <input
            type="color"
            value={selectedObject.stroke || '#000000'}
            onChange={(e) => handleStrokeColorChange(e.target.value)}
            className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
          />
          <input
            type="text"
            value={selectedObject.stroke || '#000000'}
            onChange={(e) => handleStrokeColorChange(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Preenchimento</label>
        <div className="flex items-center gap-2 mb-2">
          <input
            type="checkbox"
            checked={selectedObject.fill !== 'transparent'}
            onChange={toggleFill}
            className="w-4 h-4 text-blue-500 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">Preencher caixa</span>
        </div>
        
        {selectedObject.fill !== 'transparent' && (
          <div className="flex gap-2">
            <input
              type="color"
              value={selectedObject.fill || '#000000'}
              onChange={(e) => handleFillChange(e.target.value)}
              className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
            />
            <input
              type="text"
              value={selectedObject.fill || '#000000'}
              onChange={(e) => handleFillChange(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}
      </div>
    </div>
  );
};
