/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as fabric from 'fabric';
import { 
  MousePointer,
  Square,
  Circle,
  Type,
  Pencil,
  ZoomIn,
  ZoomOut,
  Undo,
  Redo,
  Trash2,
  Copy,
  Download,
  Share2,
  Hand,
  Triangle,
  Minus,
  Grid3X3,
  ArrowRight
} from 'lucide-react';

export type FigmaTool = 
  | 'select' 
  | 'hand'
  | 'rectangle' 
  | 'ellipse'
  | 'triangle'
  | 'line'
  | 'arrow'
  | 'text'
  | 'pen'
  | 'uml-class'
  | 'uml-interface'
  | 'uml-abstract';

interface FigmaCanvasProps {
  projectCode: string;
  onSave?: (data: any) => void;
}

const FigmaCanvas: React.FC<FigmaCanvasProps> = ({ projectCode, onSave }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  
  // Estados principais
  const [currentTool, setCurrentTool] = useState<FigmaTool>('select');
  const [isDrawing, setIsDrawing] = useState(false);
  const [canvasHistory, setCanvasHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Estados de UI
  const [selectedColor, setSelectedColor] = useState('#0066ff');
  const [fillColor, setFillColor] = useState('#ffffff');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [fontSize, setFontSize] = useState(16);
  const [zoom, setZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(false);
  
  // Estados de seleção
  const [selectedObjects, setSelectedObjects] = useState<fabric.Object[]>([]);
  const [showProperties, setShowProperties] = useState(false);

  // Inicializar Fabric.js
  useEffect(() => {
    if (canvasRef.current && !fabricCanvasRef.current) {
      const canvas = new fabric.Canvas(canvasRef.current, {
        width: window.innerWidth - 120,
        height: window.innerHeight - 80,
        backgroundColor: '#ffffff',
        selection: true,
        preserveObjectStacking: true,
      });

      fabricCanvasRef.current = canvas;

      // Configurar eventos
      canvas.on('mouse:down', handleMouseDown);
      canvas.on('mouse:move', handleMouseMove);
      canvas.on('mouse:up', handleMouseUp);
      canvas.on('path:created', saveCanvasState);
      canvas.on('object:added', saveCanvasState);
      canvas.on('object:removed', saveCanvasState);
      canvas.on('object:modified', saveCanvasState);
      canvas.on('selection:created', handleSelection);
      canvas.on('selection:updated', handleSelection);
      canvas.on('selection:cleared', () => setSelectedObjects([]));

      // Estado inicial
      saveCanvasState();

      return () => {
        canvas.dispose();
      };
    }
  }, []);

  // Salvar estado do canvas
  const saveCanvasState = useCallback(() => {
    if (fabricCanvasRef.current) {
      const state = JSON.stringify(fabricCanvasRef.current.toJSON());
      const newHistory = canvasHistory.slice(0, historyIndex + 1);
      newHistory.push(state);
      setCanvasHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
      
      // Callback para salvar no Firebase
      if (onSave) {
        onSave({ canvasData: state, lastModified: new Date().toISOString() });
      }
    }
  }, [canvasHistory, historyIndex, onSave]);

  // Handlers de eventos
  const handleMouseDown = (e: fabric.TEvent) => {
    if (!fabricCanvasRef.current) return;
    
    const pointer = fabricCanvasRef.current.getPointer(e.e);
    setIsDrawing(true);

    switch (currentTool) {
      case 'rectangle':
        createRectangle(pointer.x, pointer.y);
        break;
      case 'ellipse':
        createEllipse(pointer.x, pointer.y);
        break;
      case 'triangle':
        createTriangle(pointer.x, pointer.y);
        break;
      case 'line':
        createLine(pointer.x, pointer.y);
        break;
      case 'arrow':
        createArrow(pointer.x, pointer.y);
        break;
      case 'text':
        createText(pointer.x, pointer.y);
        break;
      case 'uml-class':
        createUMLClass(pointer.x, pointer.y);
        break;
      case 'uml-interface':
        createUMLInterface(pointer.x, pointer.y);
        break;
      case 'uml-abstract':
        createUMLAbstract(pointer.x, pointer.y);
        break;
      case 'pen':
        enableFreeDrawing();
        break;
      case 'hand':
        fabricCanvasRef.current.isDragging = true;
        fabricCanvasRef.current.selection = false;
        break;
      default:
        fabricCanvasRef.current.isDrawingMode = false;
        fabricCanvasRef.current.selection = true;
        break;
    }
  };

  const handleMouseMove = (e: fabric.TEvent) => {
    if (!isDrawing || !fabricCanvasRef.current) return;
    
    if (currentTool === 'hand' && fabricCanvasRef.current.isDragging) {
      const pointer = fabricCanvasRef.current.getPointer(e.e);
      const delta = {
        x: pointer.x - (fabricCanvasRef.current.lastPosX || 0),
        y: pointer.y - (fabricCanvasRef.current.lastPosY || 0)
      };
      
      const vpt = fabricCanvasRef.current.viewportTransform!;
      vpt[4] += delta.x;
      vpt[5] += delta.y;
      fabricCanvasRef.current.requestRenderAll();
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.isDragging = false;
      fabricCanvasRef.current.selection = currentTool === 'select';
      fabricCanvasRef.current.isDrawingMode = currentTool === 'pen';
    }
  };

  const handleSelection = (e: any) => {
    const objects = e.selected || [];
    setSelectedObjects(objects);
    setShowProperties(objects.length > 0);
  };

  // Funções de criação de elementos
  const createRectangle = (x: number, y: number) => {
    if (!fabricCanvasRef.current) return;
    
    const rect = new fabric.Rect({
      left: x,
      top: y,
      width: 100,
      height: 100,
      fill: fillColor,
      stroke: selectedColor,
      strokeWidth: strokeWidth,
      rx: 8,
      ry: 8,
    });
    
    fabricCanvasRef.current.add(rect);
    fabricCanvasRef.current.setActiveObject(rect);
  };

  const createEllipse = (x: number, y: number) => {
    if (!fabricCanvasRef.current) return;
    
    const ellipse = new fabric.Ellipse({
      left: x,
      top: y,
      rx: 50,
      ry: 30,
      fill: fillColor,
      stroke: selectedColor,
      strokeWidth: strokeWidth,
    });
    
    fabricCanvasRef.current.add(ellipse);
    fabricCanvasRef.current.setActiveObject(ellipse);
  };

  const createTriangle = (x: number, y: number) => {
    if (!fabricCanvasRef.current) return;
    
    const triangle = new fabric.Triangle({
      left: x,
      top: y,
      width: 80,
      height: 80,
      fill: fillColor,
      stroke: selectedColor,
      strokeWidth: strokeWidth,
    });
    
    fabricCanvasRef.current.add(triangle);
    fabricCanvasRef.current.setActiveObject(triangle);
  };

  const createLine = (x: number, y: number) => {
    if (!fabricCanvasRef.current) return;
    
    const line = new fabric.Line([x, y, x + 100, y], {
      stroke: selectedColor,
      strokeWidth: strokeWidth,
    });
    
    fabricCanvasRef.current.add(line);
    fabricCanvasRef.current.setActiveObject(line);
  };

  const createArrow = (x: number, y: number) => {
    if (!fabricCanvasRef.current) return;
    
    const line = new fabric.Line([x, y, x + 100, y], {
      stroke: selectedColor,
      strokeWidth: strokeWidth,
    });

    const arrowHead = new fabric.Triangle({
      left: x + 100,
      top: y - 5,
      width: 10,
      height: 10,
      fill: selectedColor,
      angle: 90,
      originX: 'center',
      originY: 'center',
    });

    const group = new fabric.Group([line, arrowHead]);
    fabricCanvasRef.current.add(group);
    fabricCanvasRef.current.setActiveObject(group);
  };

  const createText = (x: number, y: number) => {
    if (!fabricCanvasRef.current) return;
    
    const text = new fabric.IText('Texto', {
      left: x,
      top: y,
      fontSize: fontSize,
      fill: selectedColor,
      fontFamily: 'Inter, sans-serif',
    });
    
    fabricCanvasRef.current.add(text);
    fabricCanvasRef.current.setActiveObject(text);
  };

  // UML Components
  const createUMLClass = (x: number, y: number) => {
    if (!fabricCanvasRef.current) return;
    
    const container = new fabric.Rect({
      left: x,
      top: y,
      width: 200,
      height: 150,
      fill: '#ffffff',
      stroke: selectedColor,
      strokeWidth: 2,
      rx: 4,
      ry: 4,
    });

    const title = new fabric.IText('ClassName', {
      left: x + 10,
      top: y + 10,
      fontSize: 14,
      fontWeight: 'bold',
      fill: '#000000',
    });

    const separator1 = new fabric.Line([x, y + 35, x + 200, y + 35], {
      stroke: selectedColor,
      strokeWidth: 1,
    });

    const attributes = new fabric.IText('- attribute1: String\n- attribute2: Number', {
      left: x + 10,
      top: y + 45,
      fontSize: 12,
      fill: '#000000',
    });

    const separator2 = new fabric.Line([x, y + 90, x + 200, y + 90], {
      stroke: selectedColor,
      strokeWidth: 1,
    });

    const methods = new fabric.IText('+ method1(): void\n+ method2(): String', {
      left: x + 10,
      top: y + 100,
      fontSize: 12,
      fill: '#000000',
    });

    const group = new fabric.Group([container, title, separator1, attributes, separator2, methods]);
    fabricCanvasRef.current.add(group);
    fabricCanvasRef.current.setActiveObject(group);
  };

  const createUMLInterface = (x: number, y: number) => {
    if (!fabricCanvasRef.current) return;
    
    const container = new fabric.Rect({
      left: x,
      top: y,
      width: 200,
      height: 120,
      fill: '#ffffff',
      stroke: selectedColor,
      strokeWidth: 2,
      strokeDashArray: [5, 5],
      rx: 4,
      ry: 4,
    });

    const stereotype = new fabric.IText('<<interface>>', {
      left: x + 70,
      top: y + 5,
      fontSize: 10,
      fontStyle: 'italic',
      fill: '#666666',
      textAlign: 'center',
    });

    const title = new fabric.IText('InterfaceName', {
      left: x + 10,
      top: y + 25,
      fontSize: 14,
      fontWeight: 'bold',
      fill: '#000000',
    });

    const separator = new fabric.Line([x, y + 50, x + 200, y + 50], {
      stroke: selectedColor,
      strokeWidth: 1,
      strokeDashArray: [5, 5],
    });

    const methods = new fabric.IText('+ method1(): void\n+ method2(): String', {
      left: x + 10,
      top: y + 60,
      fontSize: 12,
      fill: '#000000',
    });

    const group = new fabric.Group([container, stereotype, title, separator, methods]);
    fabricCanvasRef.current.add(group);
    fabricCanvasRef.current.setActiveObject(group);
  };

  const createUMLAbstract = (x: number, y: number) => {
    if (!fabricCanvasRef.current) return;
    
    const container = new fabric.Rect({
      left: x,
      top: y,
      width: 220,
      height: 140,
      fill: '#ffffff',
      stroke: selectedColor,
      strokeWidth: 2,
      rx: 4,
      ry: 4,
    });

    const stereotype = new fabric.IText('<<abstract>>', {
      left: x + 80,
      top: y + 5,
      fontSize: 10,
      fontStyle: 'italic',
      fill: '#666666',
      textAlign: 'center',
    });

    const title = new fabric.IText('AbstractClass', {
      left: x + 10,
      top: y + 25,
      fontSize: 14,
      fontWeight: 'bold',
      fontStyle: 'italic',
      fill: '#000000',
    });

    const separator1 = new fabric.Line([x, y + 50, x + 220, y + 50], {
      stroke: selectedColor,
      strokeWidth: 1,
    });

    const attributes = new fabric.IText('# protectedAttr: String', {
      left: x + 10,
      top: y + 60,
      fontSize: 12,
      fill: '#000000',
    });

    const separator2 = new fabric.Line([x, y + 85, x + 220, y + 85], {
      stroke: selectedColor,
      strokeWidth: 1,
    });

    const methods = new fabric.IText('+ concreteMethod(): void\n+ abstractMethod(): void', {
      left: x + 10,
      top: y + 95,
      fontSize: 12,
      fill: '#000000',
    });

    const group = new fabric.Group([container, stereotype, title, separator1, attributes, separator2, methods]);
    fabricCanvasRef.current.add(group);
    fabricCanvasRef.current.setActiveObject(group);
  };

  const enableFreeDrawing = () => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.isDrawingMode = true;
      if (fabricCanvasRef.current.freeDrawingBrush) {
        fabricCanvasRef.current.freeDrawingBrush.width = strokeWidth;
        fabricCanvasRef.current.freeDrawingBrush.color = selectedColor;
      }
    }
  };

  // Funções de controle
  const undo = () => {
    if (historyIndex > 0 && fabricCanvasRef.current) {
      const newIndex = historyIndex - 1;
      const state = canvasHistory[newIndex];
      fabricCanvasRef.current.loadFromJSON(state, () => {
        fabricCanvasRef.current?.renderAll();
      });
      setHistoryIndex(newIndex);
    }
  };

  const redo = () => {
    if (historyIndex < canvasHistory.length - 1 && fabricCanvasRef.current) {
      const newIndex = historyIndex + 1;
      const state = canvasHistory[newIndex];
      fabricCanvasRef.current.loadFromJSON(state, () => {
        fabricCanvasRef.current?.renderAll();
      });
      setHistoryIndex(newIndex);
    }
  };

  const deleteSelected = () => {
    if (fabricCanvasRef.current) {
      const activeObjects = fabricCanvasRef.current.getActiveObjects();
      activeObjects.forEach((obj: fabric.Object) => {
        fabricCanvasRef.current?.remove(obj);
      });
      fabricCanvasRef.current.discardActiveObject();
      fabricCanvasRef.current.renderAll();
    }
  };

  const duplicateSelected = () => {
    if (fabricCanvasRef.current) {
      const activeObjects = fabricCanvasRef.current.getActiveObjects();
      activeObjects.forEach(async (obj: fabric.Object) => {
        try {
          const cloned = await obj.clone();
          cloned.set({
            left: (cloned.left || 0) + 20,
            top: (cloned.top || 0) + 20,
          });
          fabricCanvasRef.current?.add(cloned);
        } catch (error) {
          console.error('Erro ao duplicar objeto:', error);
        }
      });
    }
  };

  const zoomIn = () => {
    if (fabricCanvasRef.current && zoom < 300) {
      const newZoom = Math.min(zoom + 25, 300);
      setZoom(newZoom);
      fabricCanvasRef.current.setZoom(newZoom / 100);
      fabricCanvasRef.current.renderAll();
    }
  };

  const zoomOut = () => {
    if (fabricCanvasRef.current && zoom > 25) {
      const newZoom = Math.max(zoom - 25, 25);
      setZoom(newZoom);
      fabricCanvasRef.current.setZoom(newZoom / 100);
      fabricCanvasRef.current.renderAll();
    }
  };

  const exportCanvas = () => {
    if (fabricCanvasRef.current) {
      const dataURL = fabricCanvasRef.current.toDataURL({
        format: 'png',
        quality: 1,
        multiplier: 2,
      });
      
      const link = document.createElement('a');
      link.download = `ctrlc-${projectCode}.png`;
      link.href = dataURL;
      link.click();
    }
  };

  // Tools definition
  const tools = [
    { id: 'select', icon: MousePointer, label: 'Selecionar' },
    { id: 'hand', icon: Hand, label: 'Mover tela' },
    { id: 'rectangle', icon: Square, label: 'Retângulo' },
    { id: 'ellipse', icon: Circle, label: 'Elipse' },
    { id: 'triangle', icon: Triangle, label: 'Triângulo' },
    { id: 'line', icon: Minus, label: 'Linha' },
    { id: 'arrow', icon: ArrowRight, label: 'Seta' },
    { id: 'text', icon: Type, label: 'Texto' },
    { id: 'pen', icon: Pencil, label: 'Desenho livre' },
  ];

  const umlTools = [
    { id: 'uml-class', icon: Square, label: 'Classe UML' },
    { id: 'uml-interface', icon: Square, label: 'Interface UML' },
    { id: 'uml-abstract', icon: Square, label: 'Classe Abstrata' },
  ];

  const colors = [
    '#0066ff', '#ff0066', '#00ff66', '#ffcc00', '#ff6600', '#6600ff',
    '#00ffff', '#ff00ff', '#66ff00', '#ff0000', '#000000', '#ffffff'
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Toolbar esquerda */}
      <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-4 space-y-2">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setCurrentTool(tool.id as FigmaTool)}
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
              currentTool === tool.id
                ? 'bg-blue-500 text-white'
                : 'hover:bg-gray-100 text-gray-600'
            }`}
            title={tool.label}
          >
            <tool.icon size={20} />
          </button>
        ))}
        
        <div className="w-8 h-px bg-gray-200 my-2" />
        
        {umlTools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setCurrentTool(tool.id as FigmaTool)}
            className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
              currentTool === tool.id
                ? 'bg-blue-500 text-white'
                : 'hover:bg-gray-100 text-gray-600'
            }`}
            title={tool.label}
          >
            <tool.icon size={16} />
          </button>
        ))}
      </div>

      {/* Área principal */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar superior */}
        <div className="h-12 bg-white border-b border-gray-200 flex items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={undo}
                disabled={historyIndex <= 0}
                className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
                title="Desfazer"
              >
                <Undo size={16} />
              </button>
              <button
                onClick={redo}
                disabled={historyIndex >= canvasHistory.length - 1}
                className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
                title="Refazer"
              >
                <Redo size={16} />
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={zoomOut}
                className="p-1 rounded hover:bg-gray-100"
                title="Zoom Out"
              >
                <ZoomOut size={16} />
              </button>
              <span className="text-sm text-gray-600 min-w-[60px] text-center">
                {zoom}%
              </span>
              <button
                onClick={zoomIn}
                className="p-1 rounded hover:bg-gray-100"
                title="Zoom In"
              >
                <ZoomIn size={16} />
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowGrid(!showGrid)}
                className={`p-1 rounded ${showGrid ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
                title="Grid"
              >
                <Grid3X3 size={16} />
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={duplicateSelected}
              disabled={selectedObjects.length === 0}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-50"
              title="Duplicar"
            >
              <Copy size={16} />
            </button>
            <button
              onClick={deleteSelected}
              disabled={selectedObjects.length === 0}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-50 text-red-600"
              title="Deletar"
            >
              <Trash2 size={16} />
            </button>
            <button
              onClick={exportCanvas}
              className="p-1 rounded hover:bg-gray-100"
              title="Exportar"
            >
              <Download size={16} />
            </button>
            <button
              className="p-1 rounded hover:bg-gray-100"
              title="Compartilhar"
            >
              <Share2 size={16} />
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative overflow-hidden">
          <canvas
            ref={canvasRef}
            className="border-none outline-none"
            style={{ cursor: currentTool === 'hand' ? 'grab' : 'default' }}
          />
        </div>
      </div>

      {/* Properties panel direita */}
      {showProperties && selectedObjects.length > 0 && (
        <div className="w-64 bg-white border-l border-gray-200 p-4">
          <h3 className="font-semibold mb-4">Propriedades</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Cor da borda</label>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-6 h-6 rounded border-2 ${
                      selectedColor === color ? 'border-gray-800' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Cor de preenchimento</label>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setFillColor(color)}
                    className={`w-6 h-6 rounded border-2 ${
                      fillColor === color ? 'border-gray-800' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Espessura da borda: {strokeWidth}px
              </label>
              <input
                type="range"
                min="0"
                max="10"
                value={strokeWidth}
                onChange={(e) => setStrokeWidth(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Tamanho da fonte: {fontSize}px
              </label>
              <input
                type="range"
                min="8"
                max="72"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FigmaCanvas;
