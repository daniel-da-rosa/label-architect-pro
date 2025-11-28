import React from 'react';

export const LabelCanvas = ({ canvasRef }) => {
  return (
    <div className="flex-1 flex items-center justify-center bg-gray-100 p-8 overflow-auto">
      <div className="shadow-2xl rounded-lg overflow-hidden bg-white">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
};
