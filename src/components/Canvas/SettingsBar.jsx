import React from 'react';

export const SettingsBar = ({ labelConfig, onConfigChange, isVisible }) => {
  if (!isVisible) return null;

  const handleChange = (field, value) => {
    onConfigChange({
      ...labelConfig,
      [field]: parseInt(value)
    });
  };

  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Largura (mm):</label>
          <input
            type="number"
            value={labelConfig.width}
            onChange={(e) => handleChange('width', e.target.value)}
            className="w-20 px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Altura (mm):</label>
          <input
            type="number"
            value={labelConfig.height}
            onChange={(e) => handleChange('height', e.target.value)}
            className="w-20 px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">DPI:</label>
          <select
            value={labelConfig.dpi}
            onChange={(e) => handleChange('dpi', e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={8}>203</option>
            <option value={12}>300</option>
          </select>
        </div>

        <div className="ml-auto text-sm text-gray-600">
          Canvas: {labelConfig.width * labelConfig.dpi} x {labelConfig.height * labelConfig.dpi} px
        </div>
      </div>
    </div>
  );
};
