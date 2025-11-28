import { useState, useEffect, useRef } from 'react';
import { fabric } from 'fabric';

/**
 * Hook customizado para gerenciar o canvas Fabric.js
 */
export const useCanvas = (labelConfig, onObjectSelected) => {
  const canvasRef = useRef(null);
  const [canvas, setCanvas] = useState(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const widthPx = labelConfig.width * labelConfig.dpi;
    const heightPx = labelConfig.height * labelConfig.dpi;

    const fabricCanvas = new fabric.Canvas(canvasRef.current, {
      width: widthPx,
      height: heightPx,
      backgroundColor: 'white'
    });

    fabricCanvas.on('selection:created', (e) => {
      onObjectSelected?.(e.selected[0]);
    });

    fabricCanvas.on('selection:updated', (e) => {
      onObjectSelected?.(e.selected[0]);
    });

    fabricCanvas.on('selection:cleared', () => {
      onObjectSelected?.(null);
    });

    fabricCanvas.on('object:modified', () => {
      onObjectSelected?.(fabricCanvas.getActiveObject());
    });

    setCanvas(fabricCanvas);

    return () => {
      fabricCanvas.dispose();
    };
  }, [labelConfig.width, labelConfig.height, labelConfig.dpi]);

  return { canvasRef, canvas };
};
