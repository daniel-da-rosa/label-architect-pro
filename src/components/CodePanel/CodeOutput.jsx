import React from 'react';
import { FileCode, Eye, Copy, Check } from 'lucide-react';
import { getAvailableCompilers } from '../../compilers/adapter';

export const CodeOutput = ({ 
  compiledCode, 
  selectedLanguage, 
  onLanguageChange, 
  onPreview 
}) => {
  const [copied, setCopied] = React.useState(false);
  const availableCompilers = getAvailableCompilers();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(compiledCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Erro ao copiar:', error);
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileCode size={18} className="text-gray-500" />
            <h3 className="font-semibold text-gray-700">Código Gerado</h3>
          </div>
          <button
            onClick={handleCopy}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
            title="Copiar código"
          >
            {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
          </button>
        </div>

        <div className="mb-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">Linguagem</label>
          <select
            value={selectedLanguage}
            onChange={(e) => onLanguageChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {availableCompilers.map(compiler => (
              <option key={compiler.id} value={compiler.id}>
                {compiler.name} - {compiler.manufacturer}
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
          <textarea
            value={compiledCode}
            readOnly
            className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg font-mono text-xs bg-gray-50 resize-none"
            placeholder="O código será gerado aqui..."
          />
          {!compiledCode && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm pointer-events-none">
              Adicione elementos ao canvas
            </div>
          )}
        </div>

        <button
          onClick={onPreview}
          disabled={!compiledCode}
          className={`mt-3 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition font-medium ${
            compiledCode
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <Eye size={18} />
          Visualizar Preview
        </button>

        {compiledCode && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-xs text-blue-900">
              <strong>Linhas:</strong> {compiledCode.split('\n').length} | 
              <strong> Caracteres:</strong> {compiledCode.length}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
