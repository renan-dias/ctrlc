'use client';
import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as fabric from 'fabric';
import { 
  MousePointer2, 
  Square, 
  Circle, 
  Triangle, 
  Type, 
  Pencil, 
  Eraser,
  Move,
  Hand,
  ZoomIn,
  ZoomOut,
  Undo,
  Redo,
  Trash2,
  Copy,
  Download,
  Settings,
  Layers,
  Palette,
  ArrowRight,
  Minus,
  RotateCw,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Database,
  Server,
  Smartphone,
  Globe,
  Component,
  Box
} from 'lucide-react';

export type Tool = 
  | 'select' 
  | 'hand'
  | 'pen' 
  | 'eraser' 
  | 'rectangle' 
  | 'circle' 
  | 'triangle' 
  | 'line' 
  | 'text'
  | 'arrow'
  | 'uml-class'
  | 'uml-interface'
  | 'uml-abstract'
  | 'uml-enum'
  | 'component'
  | 'service-api'
  | 'service-db'
  | 'service-microservice'
  | 'service-frontend';

interface FigmaCanvasProps {
  projectCode: string;
}

const FigmaCanvas: React.FC<FigmaCanvasProps> = ({ projectCode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  
  // Estados principais
  const [currentTool, setCurrentTool] = useState<Tool>('select');
  const [canvasHistory, setCanvasHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [zoom, setZoom] = useState(100);
  
  // Estados de configuração
  const [selectedColor, setSelectedColor] = useState('#3B82F6');
  const [brushSize, setBrushSize] = useState(2);
  const [fontSize, setFontSize] = useState(16);
  const [selectedObjects, setSelectedObjects] = useState<fabric.Object[]>([]);
  
  // Estados da interface
  const [showLayers, setShowLayers] = useState(false);
  const [showProperties, setShowProperties] = useState(true);

  // Inicializar Fabric.js
  useEffect(() => {
    if (canvasRef.current && !fabricCanvasRef.current) {
      const canvas = new fabric.Canvas(canvasRef.current, {
        width: window.innerWidth - 80,
        height: window.innerHeight - 60,
        backgroundColor: '#ffffff',
        selection: true,
        preserveObjectStacking: true,
      });

      fabricCanvasRef.current = canvas;

      // Configurar eventos
      canvas.on('mouse:down', handleMouseDown);
      canvas.on('mouse:move', handleMouseMove);
      canvas.on('mouse:up', handleMouseUp);
      canvas.on('object:added', saveCanvasState);
      canvas.on('object:removed', saveCanvasState);
      canvas.on('object:modified', saveCanvasState);
      canvas.on('selection:created', handleSelection);
      canvas.on('selection:updated', handleSelection);
      canvas.on('selection:cleared', handleSelectionCleared);

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
    }
  }, [canvasHistory, historyIndex]);

  // Handlers de eventos
  const handleMouseDown = (e: fabric.TEvent) => {
    if (!fabricCanvasRef.current) return;
    
    const pointer = fabricCanvasRef.current.getPointer(e.e);

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
      case 'component':
        createComponent(pointer.x, pointer.y);
        break;
      case 'service-api':
        createServiceIcon(pointer.x, pointer.y, 'API', '#3B82F6');
        break;
      case 'service-db':
        createServiceIcon(pointer.x, pointer.y, 'DB', '#10B981');
        break;
      case 'pen':
        fabricCanvasRef.current.isDrawingMode = true;
        if (fabricCanvasRef.current.freeDrawingBrush) {
          fabricCanvasRef.current.freeDrawingBrush.width = brushSize;
          fabricCanvasRef.current.freeDrawingBrush.color = selectedColor;
        }
        break;
      case 'eraser':
        fabricCanvasRef.current.isDrawingMode = true;
        if (fabricCanvasRef.current.freeDrawingBrush) {
          fabricCanvasRef.current.freeDrawingBrush.width = brushSize * 2;
          fabricCanvasRef.current.freeDrawingBrush.color = '#ffffff';
        }
        break;
      default:
        fabricCanvasRef.current.isDrawingMode = false;
        break;
    }
  };

  const handleMouseMove = () => {
    // Implementar lógica de movimento se necessário
  };

  const handleMouseUp = () => {
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.isDrawingMode = currentTool === 'pen' || currentTool === 'eraser';
    }
  };

  const handleSelection = (e: any) => {
    if (e.selected) {
      setSelectedObjects(e.selected);
    }
  };

  const handleSelectionCleared = () => {
    setSelectedObjects([]);
  };

  // Funções de criação de elementos
  const createRectangle = (x: number, y: number) => {
    if (!fabricCanvasRef.current) return;
    
    const rect = new fabric.Rect({
      left: x,
      top: y,
      width: 120,
      height: 80,
      fill: selectedColor + '20',
      stroke: selectedColor,
      strokeWidth: 2,
      rx: 8,
      ry: 8,
    });
    
    fabricCanvasRef.current.add(rect);
    fabricCanvasRef.current.setActiveObject(rect);
  };

  const createCircle = (x: number, y: number) => {
    if (!fabricCanvasRef.current) return;
    
    const circle = new fabric.Circle({
      left: x,
      top: y,
      radius: 50,
      fill: selectedColor + '20',
      stroke: selectedColor,
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
      width: 100,
      height: 100,
      fill: selectedColor + '20',
      stroke: selectedColor,
      strokeWidth: 2,
    });
    
    fabricCanvasRef.current.add(triangle);
    fabricCanvasRef.current.setActiveObject(triangle);
  };

  const createLine = (x: number, y: number) => {
    if (!fabricCanvasRef.current) return;
    
    const line = new fabric.Line([x, y, x + 150, y], {
      stroke: selectedColor,
      strokeWidth: brushSize,
    });
    
    fabricCanvasRef.current.add(line);
    fabricCanvasRef.current.setActiveObject(line);
  };

  const createArrow = (x: number, y: number) => {
    if (!fabricCanvasRef.current) return;
    
    const arrowLine = new fabric.Line([x, y, x + 100, y], {
      stroke: selectedColor,
      strokeWidth: brushSize,
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

    const group = new fabric.Group([arrowLine, arrowHead], {
      left: x,
      top: y,
    });
    
    fabricCanvasRef.current.add(group);
    fabricCanvasRef.current.setActiveObject(group);
  };

  const createText = (x: number, y: number) => {
    if (!fabricCanvasRef.current) return;
    
    const text = new fabric.IText('Clique para editar', {
      left: x,
      top: y,
      fontSize,
      fill: selectedColor,
      fontFamily: 'Inter, sans-serif',
    });
    
    fabricCanvasRef.current.add(text);
    fabricCanvasRef.current.setActiveObject(text);
  };

  const createUMLClass = (x: number, y: number) => {
    if (!fabricCanvasRef.current) return;
    
    const container = new fabric.Rect({
      left: x,
      top: y,
      width: 200,
      height: 120,
      fill: '#ffffff',
      stroke: selectedColor,
      strokeWidth: 2,
      rx: 4,
      ry: 4,
    });

    const className = new fabric.IText('ClassName', {
      left: x + 10,
      top: y + 8,
      fontSize: 14,
      fontWeight: 'bold',
      fill: '#000000',
    });

    const separator1 = new fabric.Line([x, y + 30, x + 200, y + 30], {
      stroke: selectedColor,
      strokeWidth: 1,
    });

    const attributes = new fabric.IText('- attribute1: String\n- attribute2: Number', {
      left: x + 10,
      top: y + 35,
      fontSize: 12,
      fill: '#000000',
    });

    const separator2 = new fabric.Line([x, y + 65, x + 200, y + 65], {
      stroke: selectedColor,
      strokeWidth: 1,
    });

    const methods = new fabric.IText('+ method1(): void\n+ method2(): String', {
      left: x + 10,
      top: y + 70,
      fontSize: 12,
      fill: '#000000',
    });

    const group = new fabric.Group([container, separator1, separator2, className, attributes, methods], {
      left: x,
      top: y,
    });
    
    fabricCanvasRef.current.add(group);
    fabricCanvasRef.current.setActiveObject(group);
  };

  const createUMLInterface = (x: number, y: number) => {
    if (!fabricCanvasRef.current) return;
    
    const container = new fabric.Rect({
      left: x,
      top: y,
      width: 200,
      height: 90,
      fill: '#ffffff',
      stroke: selectedColor,
      strokeWidth: 2,
      strokeDashArray: [5, 5],
      rx: 4,
      ry: 4,
    });

    const stereotype = new fabric.IText('<<interface>>', {
      left: x + 75,
      top: y + 5,
      fontSize: 10,
      fontStyle: 'italic',
      fill: '#000000',
    });

    const interfaceName = new fabric.IText('InterfaceName', {
      left: x + 10,
      top: y + 20,
      fontSize: 14,
      fontWeight: 'bold',
      fill: '#000000',
    });

    const separator = new fabric.Line([x, y + 40, x + 200, y + 40], {
      stroke: selectedColor,
      strokeWidth: 1,
      strokeDashArray: [5, 5],
    });

    const methods = new fabric.IText('+ method1(): void\n+ method2(): String', {
      left: x + 10,
      top: y + 45,
      fontSize: 12,
      fill: '#000000',
    });

    const group = new fabric.Group([container, separator, stereotype, interfaceName, methods], {
      left: x,
      top: y,
    });
    
    fabricCanvasRef.current.add(group);
    fabricCanvasRef.current.setActiveObject(group);
  };

  const createComponent = (x: number, y: number) => {
    if (!fabricCanvasRef.current) return;
    
    const container = new fabric.Rect({
      left: x,
      top: y,
      width: 150,
      height: 80,
      fill: '#F3F4F6',
      stroke: selectedColor,
      strokeWidth: 2,
      rx: 8,
      ry: 8,
    });

    const componentText = new fabric.IText('Component', {
      left: x + 75,
      top: y + 30,
      fontSize: 14,
      fontWeight: '500',
      fill: '#000000',
      textAlign: 'center',
      originX: 'center',
      originY: 'center',
    });

    const group = new fabric.Group([container, componentText], {
      left: x,
      top: y,
    });
    
    fabricCanvasRef.current.add(group);
    fabricCanvasRef.current.setActiveObject(group);
  };

  const createServiceIcon = (x: number, y: number, label: string, color: string) => {
    if (!fabricCanvasRef.current) return;
    
    const container = new fabric.Circle({
      left: x,
      top: y,
      radius: 40,
      fill: color,
      stroke: color,
      strokeWidth: 2,
    });

    const serviceText = new fabric.IText(label, {
      left: x,
      top: y,
      fontSize: 16,
      fontWeight: 'bold',
      fill: '#ffffff',
      textAlign: 'center',
      originX: 'center',
      originY: 'center',
    });

    const group = new fabric.Group([container, serviceText], {
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

  // Ferramentas organizadas por categoria
  const basicTools = [
    { id: 'select', icon: MousePointer2, label: 'Selecionar' },
    { id: 'hand', icon: Hand, label: 'Mover Tela' },
    { id: 'pen', icon: Pencil, label: 'Desenhar' },
    { id: 'eraser', icon: Eraser, label: 'Borracha' },
    { id: 'text', icon: Type, label: 'Texto' },
  ];

  const shapeTools = [
    { id: 'rectangle', icon: Square, label: 'Retângulo' },
    { id: 'circle', icon: Circle, label: 'Círculo' },
    { id: 'triangle', icon: Triangle, label: 'Triângulo' },
    { id: 'line', icon: Minus, label: 'Linha' },
    { id: 'arrow', icon: ArrowRight, label: 'Seta' },
  ];

  const umlTools = [
    { id: 'uml-class', icon: Box, label: 'Classe UML' },
    { id: 'uml-interface', icon: Component, label: 'Interface UML' },
  ];

  const serviceTools = [
    { id: 'service-api', icon: Globe, label: 'API' },
    { id: 'service-db', icon: Database, label: 'Database' },
    { id: 'service-microservice', icon: Server, label: 'Microserviço' },
    { id: 'service-frontend', icon: Smartphone, label: 'Frontend' },
  ];

  const colors = [
    '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899',
    '#06B6D4', '#84CC16', '#F97316', '#6B7280', '#000000', '#FFFFFF'
  ];

  return (
    <div className="h-full bg-slate-100 flex">
      {/* Toolbar Esquerda */}
      <div className="w-20 bg-slate-800 flex flex-col items-center py-4 gap-2">
        {/* Ferramentas Básicas */}
        {basicTools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setCurrentTool(tool.id as Tool)}
            className={`p-3 rounded-lg transition-colors ${
              currentTool === tool.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-slate-700'
            }`}
            title={tool.label}
          >
            <tool.icon className="w-5 h-5" />
          </button>
        ))}

        <div className="w-8 h-px bg-slate-600 my-2" />

        {/* Formas */}
        {shapeTools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setCurrentTool(tool.id as Tool)}
            className={`p-3 rounded-lg transition-colors ${
              currentTool === tool.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-slate-700'
            }`}
            title={tool.label}
          >
            <tool.icon className="w-5 h-5" />
          </button>
        ))}

        <div className="w-8 h-px bg-slate-600 my-2" />

        {/* UML */}
        {umlTools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setCurrentTool(tool.id as Tool)}
            className={`p-3 rounded-lg transition-colors ${
              currentTool === tool.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-slate-700'
            }`}
            title={tool.label}
          >
            <tool.icon className="w-5 h-5" />
          </button>
        ))}

        <div className="w-8 h-px bg-slate-600 my-2" />

        {/* Serviços */}
        {serviceTools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setCurrentTool(tool.id as Tool)}
            className={`p-3 rounded-lg transition-colors ${
              currentTool === tool.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-slate-700'
            }`}
            title={tool.label}
          >
            <tool.icon className="w-5 h-5" />
          </button>
        ))}

        <div className="flex-1" />

        {/* Controles */}
        <button
          onClick={() => setShowLayers(!showLayers)}
          className="p-3 rounded-lg text-gray-400 hover:text-white hover:bg-slate-700 transition-colors"
          title="Camadas"
        >
          <Layers className="w-5 h-5" />
        </button>

        <button
          onClick={() => setShowProperties(!showProperties)}
          className="p-3 rounded-lg text-gray-400 hover:text-white hover:bg-slate-700 transition-colors"
          title="Propriedades"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Área Principal */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar Superior */}
        <div className="h-12 bg-white border-b border-slate-200 flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={undo}
                disabled={historyIndex <= 0}
                className="p-2 rounded-lg text-gray-600 hover:bg-slate-100 disabled:opacity-30 transition-colors"
              >
                <Undo className="w-4 h-4" />
              </button>
              <button
                onClick={redo}
                disabled={historyIndex >= canvasHistory.length - 1}
                className="p-2 rounded-lg text-gray-600 hover:bg-slate-100 disabled:opacity-30 transition-colors"
              >
                <Redo className="w-4 h-4" />
              </button>
            </div>

            <div className="w-px h-6 bg-slate-300" />

            <div className="flex items-center gap-2">
              <button
                onClick={duplicateSelected}
                className="p-2 rounded-lg text-gray-600 hover:bg-slate-100 transition-colors"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={deleteSelected}
                className="p-2 rounded-lg text-gray-600 hover:bg-slate-100 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="w-px h-6 bg-slate-300" />

            <div className="flex items-center gap-2">
              <button
                onClick={zoomOut}
                className="p-2 rounded-lg text-gray-600 hover:bg-slate-100 transition-colors"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-600 min-w-[60px] text-center">
                {zoom}%
              </span>
              <button
                onClick={zoomIn}
                className="p-2 rounded-lg text-gray-600 hover:bg-slate-100 transition-colors"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportCanvas}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              Exportar
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 relative overflow-hidden">
          <canvas
            ref={canvasRef}
            className="absolute inset-0"
          />
        </div>
      </div>

      {/* Painel de Propriedades */}
      {showProperties && (
        <div className="w-80 bg-white border-l border-slate-200 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Propriedades</h3>
            
            {/* Cor */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cor
              </label>
              <div className="grid grid-cols-6 gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded border-2 transition-all ${
                      selectedColor === color ? 'border-gray-900 scale-110' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Tamanho do Pincel */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tamanho do Pincel: {brushSize}px
              </label>
              <input
                type="range"
                min="1"
                max="20"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Tamanho da Fonte */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tamanho da Fonte: {fontSize}px
              </label>
              <input
                type="range"
                min="10"
                max="72"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Informações da Seleção */}
            {selectedObjects.length > 0 && (
              <div className="mb-6 p-3 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-2">
                  Selecionado
                </h4>
                <p className="text-sm text-blue-700">
                  {selectedObjects.length} objeto(s) selecionado(s)
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FigmaCanvas;
