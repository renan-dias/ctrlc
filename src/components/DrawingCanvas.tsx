'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { fabric } from 'fabric';
import { 
  Mouse, 
  Square, 
  Circle, 
  Triangle, 
  Type, 
  Pencil, 
  Eraser,
  Download,
  Share2,
  Undo,
  Redo,
  Trash2,
  Move,
  ZoomIn,
  ZoomOut,
  RotateCcw
} from 'lucide-react';

export type Tool = 
  | 'select' 
  | 'pen' 
  | 'eraser' 
  | 'rectangle' 
  | 'circle' 
  | 'triangle' 
  | 'line' 
  | 'text'
  | 'uml-class'
  | 'uml-interface'
  | 'ui-button'
  | 'ui-input'
  | 'service-api'
  | 'service-db';

interface DrawingCanvasProps {
  isDarkMode: boolean;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ isDarkMode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const [currentTool, setCurrentTool] = useState<Tool>('select');
  const [isDrawing, setIsDrawing] = useState(false);
  const [canvasHistory, setCanvasHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Inicializar Fabric.js
  useEffect(() => {
    if (canvasRef.current && !fabricCanvasRef.current) {
      const canvas = new fabric.Canvas(canvasRef.current, {
        width: window.innerWidth - 320,
        height: window.innerHeight - 160,
        backgroundColor: isDarkMode ? '#0a0a0a' : '#ffffff',
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

      // Estado inicial
      saveCanvasState();

      return () => {
        canvas.dispose();
      };
    }
  }, [isDarkMode]);

  // Atualizar cor de fundo quando mudar tema
  useEffect(() => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.backgroundColor = isDarkMode ? '#0a0a0a' : '#ffffff';
      fabricCanvasRef.current.renderAll();
    }
  }, [isDarkMode]);

  const saveCanvasState = useCallback(() => {
    if (fabricCanvasRef.current) {
      const state = JSON.stringify(fabricCanvasRef.current.toJSON());
      const newHistory = canvasHistory.slice(0, historyIndex + 1);
      newHistory.push(state);
      setCanvasHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  }, [canvasHistory, historyIndex]);

  const handleMouseDown = (e: fabric.IEvent) => {
    if (!fabricCanvasRef.current) return;
    
    const pointer = fabricCanvasRef.current.getPointer(e.e);
    setIsDrawing(true);

    switch (currentTool) {
      case 'rectangle':
        createRectangle(pointer.x, pointer.y);
        break;
      case 'circle':
        createCircle(pointer.x, pointer.y);
        break;
      case 'triangle':
        createTriangle(pointer.x, pointer.y);
        break;
      case 'line':
        createLine(pointer.x, pointer.y);
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
      case 'ui-button':
        createUIButton(pointer.x, pointer.y);
        break;
      case 'ui-input':
        createUIInput(pointer.x, pointer.y);
        break;
      case 'service-api':
        createServiceAPI(pointer.x, pointer.y);
        break;
      case 'service-db':
        createServiceDB(pointer.x, pointer.y);
        break;
      case 'pen':
        fabricCanvasRef.current.isDrawingMode = true;
        fabricCanvasRef.current.freeDrawingBrush.width = 2;
        fabricCanvasRef.current.freeDrawingBrush.color = isDarkMode ? '#ffffff' : '#000000';
        break;
      case 'eraser':
        fabricCanvasRef.current.isDrawingMode = true;
        fabricCanvasRef.current.freeDrawingBrush = new fabric.EraserBrush(fabricCanvasRef.current);
        fabricCanvasRef.current.freeDrawingBrush.width = 10;
        break;
      default:
        fabricCanvasRef.current.isDrawingMode = false;
        fabricCanvasRef.current.selection = true;
        break;
    }
  };

  const handleMouseMove = (e: fabric.IEvent) => {
    if (!isDrawing || !fabricCanvasRef.current) return;
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.isDrawingMode = currentTool === 'pen' || currentTool === 'eraser';
    }
  };

  // Funções de criação de elementos
  const createRectangle = (x: number, y: number) => {
    if (!fabricCanvasRef.current) return;
    
    const rect = new fabric.Rect({
      left: x,
      top: y,
      width: 100,
      height: 60,
      fill: 'transparent',
      stroke: isDarkMode ? '#ffffff' : '#000000',
      strokeWidth: 2,
    });
    
    fabricCanvasRef.current.add(rect);
    fabricCanvasRef.current.setActiveObject(rect);
  };

  const createCircle = (x: number, y: number) => {
    if (!fabricCanvasRef.current) return;
    
    const circle = new fabric.Circle({
      left: x,
      top: y,
      radius: 40,
      fill: 'transparent',
      stroke: isDarkMode ? '#ffffff' : '#000000',
      strokeWidth: 2,
    });
    
    fabricCanvasRef.current.add(circle);
    fabricCanvasRef.current.setActiveObject(circle);
  };

  const createTriangle = (x: number, y: number) => {
    if (!fabricCanvasRef.current) return;
    
    const triangle = new fabric.Triangle({
      left: x,
      top: y,
      width: 80,
      height: 80,
      fill: 'transparent',
      stroke: isDarkMode ? '#ffffff' : '#000000',
      strokeWidth: 2,
    });
    
    fabricCanvasRef.current.add(triangle);
    fabricCanvasRef.current.setActiveObject(triangle);
  };

  const createLine = (x: number, y: number) => {
    if (!fabricCanvasRef.current) return;
    
    const line = new fabric.Line([x, y, x + 100, y], {
      stroke: isDarkMode ? '#ffffff' : '#000000',
      strokeWidth: 2,
    });
    
    fabricCanvasRef.current.add(line);
    fabricCanvasRef.current.setActiveObject(line);
  };

  const createText = (x: number, y: number) => {
    if (!fabricCanvasRef.current) return;
    
    const text = new fabric.IText('Clique para editar', {
      left: x,
      top: y,
      fontFamily: 'Arial',
      fontSize: 16,
      fill: isDarkMode ? '#ffffff' : '#000000',
    });
    
    fabricCanvasRef.current.add(text);
    fabricCanvasRef.current.setActiveObject(text);
  };

  const createUMLClass = (x: number, y: number) => {
    if (!fabricCanvasRef.current) return;
    
    const group = new fabric.Group([
      new fabric.Rect({
        width: 150,
        height: 120,
        fill: 'transparent',
        stroke: isDarkMode ? '#ffffff' : '#000000',
        strokeWidth: 2,
      }),
      new fabric.Line([0, 30, 150, 30], {
        stroke: isDarkMode ? '#ffffff' : '#000000',
        strokeWidth: 1,
      }),
      new fabric.Line([0, 80, 150, 80], {
        stroke: isDarkMode ? '#ffffff' : '#000000',
        strokeWidth: 1,
      }),
      new fabric.IText('ClassName', {
        left: 75,
        top: 10,
        originX: 'center',
        fontSize: 14,
        fontWeight: 'bold',
        fill: isDarkMode ? '#ffffff' : '#000000',
      }),
      new fabric.IText('- attribute: type', {
        left: 10,
        top: 40,
        fontSize: 12,
        fill: isDarkMode ? '#ffffff' : '#000000',
      }),
      new fabric.IText('+ method(): type', {
        left: 10,
        top: 90,
        fontSize: 12,
        fill: isDarkMode ? '#ffffff' : '#000000',
      }),
    ], {
      left: x,
      top: y,
    });
    
    fabricCanvasRef.current.add(group);
    fabricCanvasRef.current.setActiveObject(group);
  };

  const createUMLInterface = (x: number, y: number) => {
    if (!fabricCanvasRef.current) return;
    
    const group = new fabric.Group([
      new fabric.Rect({
        width: 150,
        height: 80,
        fill: 'transparent',
        stroke: isDarkMode ? '#ffffff' : '#000000',
        strokeWidth: 2,
        strokeDashArray: [5, 5],
      }),
      new fabric.Line([0, 40, 150, 40], {
        stroke: isDarkMode ? '#ffffff' : '#000000',
        strokeWidth: 1,
        strokeDashArray: [5, 5],
      }),
      new fabric.IText('<<interface>>', {
        left: 75,
        top: 5,
        originX: 'center',
        fontSize: 10,
        fill: isDarkMode ? '#ffffff' : '#000000',
      }),
      new fabric.IText('InterfaceName', {
        left: 75,
        top: 20,
        originX: 'center',
        fontSize: 14,
        fontWeight: 'bold',
        fill: isDarkMode ? '#ffffff' : '#000000',
      }),
      new fabric.IText('+ method(): type', {
        left: 10,
        top: 50,
        fontSize: 12,
        fill: isDarkMode ? '#ffffff' : '#000000',
      }),
    ], {
      left: x,
      top: y,
    });
    
    fabricCanvasRef.current.add(group);
    fabricCanvasRef.current.setActiveObject(group);
  };

  const createUIButton = (x: number, y: number) => {
    if (!fabricCanvasRef.current) return;
    
    const group = new fabric.Group([
      new fabric.Rect({
        width: 100,
        height: 40,
        fill: isDarkMode ? '#374151' : '#e5e7eb',
        stroke: isDarkMode ? '#6b7280' : '#d1d5db',
        strokeWidth: 1,
        rx: 6,
        ry: 6,
      }),
      new fabric.IText('Button', {
        left: 50,
        top: 20,
        originX: 'center',
        originY: 'center',
        fontSize: 14,
        fill: isDarkMode ? '#ffffff' : '#000000',
      }),
    ], {
      left: x,
      top: y,
    });
    
    fabricCanvasRef.current.add(group);
    fabricCanvasRef.current.setActiveObject(group);
  };

  const createUIInput = (x: number, y: number) => {
    if (!fabricCanvasRef.current) return;
    
    const group = new fabric.Group([
      new fabric.Rect({
        width: 150,
        height: 35,
        fill: isDarkMode ? '#1f2937' : '#ffffff',
        stroke: isDarkMode ? '#6b7280' : '#d1d5db',
        strokeWidth: 1,
        rx: 4,
        ry: 4,
      }),
      new fabric.IText('Input field', {
        left: 10,
        top: 18,
        originY: 'center',
        fontSize: 14,
        fill: isDarkMode ? '#9ca3af' : '#6b7280',
      }),
    ], {
      left: x,
      top: y,
    });
    
    fabricCanvasRef.current.add(group);
    fabricCanvasRef.current.setActiveObject(group);
  };

  const createServiceAPI = (x: number, y: number) => {
    if (!fabricCanvasRef.current) return;
    
    const group = new fabric.Group([
      new fabric.Circle({
        radius: 30,
        fill: isDarkMode ? '#1e40af' : '#3b82f6',
        stroke: isDarkMode ? '#60a5fa' : '#1e40af',
        strokeWidth: 2,
      }),
      new fabric.IText('API', {
        left: 0,
        top: 0,
        originX: 'center',
        originY: 'center',
        fontSize: 14,
        fontWeight: 'bold',
        fill: '#ffffff',
      }),
    ], {
      left: x,
      top: y,
    });
    
    fabricCanvasRef.current.add(group);
    fabricCanvasRef.current.setActiveObject(group);
  };

  const createServiceDB = (x: number, y: number) => {
    if (!fabricCanvasRef.current) return;
    
    const group = new fabric.Group([
      new fabric.Ellipse({
        rx: 40,
        ry: 15,
        fill: isDarkMode ? '#059669' : '#10b981',
        stroke: isDarkMode ? '#34d399' : '#059669',
        strokeWidth: 2,
        left: 0,
        top: 0,
      }),
      new fabric.Rect({
        width: 80,
        height: 30,
        fill: isDarkMode ? '#059669' : '#10b981',
        stroke: isDarkMode ? '#34d399' : '#059669',
        strokeWidth: 2,
        left: -40,
        top: 0,
      }),
      new fabric.Ellipse({
        rx: 40,
        ry: 15,
        fill: isDarkMode ? '#059669' : '#10b981',
        stroke: isDarkMode ? '#34d399' : '#059669',
        strokeWidth: 2,
        left: 0,
        top: 30,
      }),
      new fabric.IText('DB', {
        left: 0,
        top: 15,
        originX: 'center',
        originY: 'center',
        fontSize: 14,
        fontWeight: 'bold',
        fill: '#ffffff',
      }),
    ], {
      left: x,
      top: y,
    });
    
    fabricCanvasRef.current.add(group);
    fabricCanvasRef.current.setActiveObject(group);
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

  const clearCanvas = () => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.clear();
      fabricCanvasRef.current.backgroundColor = isDarkMode ? '#0a0a0a' : '#ffffff';
      fabricCanvasRef.current.renderAll();
      saveCanvasState();
    }
  };

  const deleteSelected = () => {
    if (fabricCanvasRef.current) {
      const activeObjects = fabricCanvasRef.current.getActiveObjects();
      activeObjects.forEach(obj => {
        fabricCanvasRef.current?.remove(obj);
      });
      fabricCanvasRef.current.discardActiveObject();
      fabricCanvasRef.current.renderAll();
    }
  };

  const zoomIn = () => {
    if (fabricCanvasRef.current) {
      const zoom = fabricCanvasRef.current.getZoom();
      fabricCanvasRef.current.setZoom(Math.min(zoom * 1.2, 3));
    }
  };

  const zoomOut = () => {
    if (fabricCanvasRef.current) {
      const zoom = fabricCanvasRef.current.getZoom();
      fabricCanvasRef.current.setZoom(Math.max(zoom / 1.2, 0.1));
    }
  };

  const resetZoom = () => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.setZoom(1);
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
      link.download = 'drawing.png';
      link.href = dataURL;
      link.click();
    }
  };

  const shareCanvas = async () => {
    if (fabricCanvasRef.current && navigator.share) {
      const canvas = fabricCanvasRef.current.getElement();
      canvas.toBlob(async (blob) => {
        if (blob) {
          const file = new File([blob], 'drawing.png', { type: 'image/png' });
          try {
            await navigator.share({
              files: [file],
              title: 'Meu desenho ctrlC',
            });
          } catch (error) {
            console.error('Erro ao compartilhar:', error);
          }
        }
      });
    } else {
      exportCanvas();
    }
  };

  const tools = [
    { id: 'select', icon: Mouse, label: 'Selecionar' },
    { id: 'pen', icon: Pencil, label: 'Desenho livre' },
    { id: 'eraser', icon: Eraser, label: 'Borracha' },
    { id: 'rectangle', icon: Square, label: 'Retângulo' },
    { id: 'circle', icon: Circle, label: 'Círculo' },
    { id: 'triangle', icon: Triangle, label: 'Triângulo' },
    { id: 'text', icon: Type, label: 'Texto' },
  ];

  const umlTools = [
    { id: 'uml-class', icon: Square, label: 'Classe UML' },
    { id: 'uml-interface', icon: Square, label: 'Interface UML' },
  ];

  const uiTools = [
    { id: 'ui-button', icon: Square, label: 'Botão UI' },
    { id: 'ui-input', icon: Square, label: 'Input UI' },
  ];

  const serviceTools = [
    { id: 'service-api', icon: Circle, label: 'Serviço API' },
    { id: 'service-db', icon: Circle, label: 'Banco de Dados' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Toolbar */}
      <div className="w-80 bg-white/10 dark:bg-black/20 backdrop-blur-md shadow-xl border-r border-white/20 dark:border-white/10 p-4 overflow-y-auto">
        <div className="space-y-6">
          {/* Ferramentas básicas */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Ferramentas</h3>
            <div className="grid grid-cols-2 gap-2">
              {tools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setCurrentTool(tool.id as Tool)}
                  className={`p-3 rounded-lg border transition-all ${
                    currentTool === tool.id
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white/10 hover:bg-white/20 border-white/20 text-gray-700 dark:text-gray-300'
                  }`}
                  title={tool.label}
                >
                  <tool.icon className="w-5 h-5 mx-auto" />
                  <span className="text-xs mt-1 block">{tool.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Componentes UML */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">UML</h3>
            <div className="grid grid-cols-2 gap-2">
              {umlTools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setCurrentTool(tool.id as Tool)}
                  className={`p-3 rounded-lg border transition-all ${
                    currentTool === tool.id
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white/10 hover:bg-white/20 border-white/20 text-gray-700 dark:text-gray-300'
                  }`}
                  title={tool.label}
                >
                  <tool.icon className="w-5 h-5 mx-auto" />
                  <span className="text-xs mt-1 block">{tool.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Componentes UI */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">UI Components</h3>
            <div className="grid grid-cols-2 gap-2">
              {uiTools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setCurrentTool(tool.id as Tool)}
                  className={`p-3 rounded-lg border transition-all ${
                    currentTool === tool.id
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white/10 hover:bg-white/20 border-white/20 text-gray-700 dark:text-gray-300'
                  }`}
                  title={tool.label}
                >
                  <tool.icon className="w-5 h-5 mx-auto" />
                  <span className="text-xs mt-1 block">{tool.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Ícones de Serviços */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Serviços</h3>
            <div className="grid grid-cols-2 gap-2">
              {serviceTools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setCurrentTool(tool.id as Tool)}
                  className={`p-3 rounded-lg border transition-all ${
                    currentTool === tool.id
                      ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-white/10 hover:bg-white/20 border-white/20 text-gray-700 dark:text-gray-300'
                  }`}
                  title={tool.label}
                >
                  <tool.icon className="w-5 h-5 mx-auto" />
                  <span className="text-xs mt-1 block">{tool.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Controles */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Controles</h3>
            <div className="space-y-2">
              <div className="flex gap-2">
                <button
                  onClick={undo}
                  disabled={historyIndex <= 0}
                  className="flex-1 p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Desfazer"
                >
                  <Undo className="w-4 h-4 mx-auto" />
                </button>
                <button
                  onClick={redo}
                  disabled={historyIndex >= canvasHistory.length - 1}
                  className="flex-1 p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-gray-700 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Refazer"
                >
                  <Redo className="w-4 h-4 mx-auto" />
                </button>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={zoomIn}
                  className="flex-1 p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-gray-700 dark:text-gray-300"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4 mx-auto" />
                </button>
                <button
                  onClick={zoomOut}
                  className="flex-1 p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-gray-700 dark:text-gray-300"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4 mx-auto" />
                </button>
                <button
                  onClick={resetZoom}
                  className="flex-1 p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-gray-700 dark:text-gray-300"
                  title="Reset Zoom"
                >
                  <RotateCcw className="w-4 h-4 mx-auto" />
                </button>
              </div>

              <button
                onClick={deleteSelected}
                className="w-full p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-400"
                title="Deletar selecionado"
              >
                <Trash2 className="w-4 h-4 mx-auto" />
              </button>

              <button
                onClick={clearCanvas}
                className="w-full p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white"
                title="Limpar tudo"
              >
                Limpar Tudo
              </button>

              <div className="flex gap-2">
                <button
                  onClick={exportCanvas}
                  className="flex-1 p-2 rounded-lg bg-green-500 hover:bg-green-600 text-white"
                  title="Exportar"
                >
                  <Download className="w-4 h-4 mx-auto" />
                </button>
                <button
                  onClick={shareCanvas}
                  className="flex-1 p-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white"
                  title="Compartilhar"
                >
                  <Share2 className="w-4 h-4 mx-auto" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-hidden">
        <canvas
          ref={canvasRef}
          className="border-none outline-none"
        />
      </div>
    </div>
  );
};

export default DrawingCanvas;
