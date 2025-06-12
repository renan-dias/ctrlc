'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  Mouse, 
  Square, 
  Circle, 
  Type, 
  Pencil, 
  ArrowUpRight,
  Download,
  Share2,
  Undo,
  Redo,
  Trash2,
  ZoomIn,
  ZoomOut,
  Move,
  Copy,
  RotateCcw
} from 'lucide-react';

export type Tool = 
  | 'select' 
  | 'pen' 
  | 'rectangle' 
  | 'circle' 
  | 'text'
  | 'arrow'
  | 'uml-class'
  | 'uml-interface';

interface FigmaCanvasProps {
  projectCode: string;
}

interface DrawingElement {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  data: any;
}

const FigmaCanvas: React.FC<FigmaCanvasProps> = ({ projectCode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Estados principais
  const [currentTool, setCurrentTool] = useState<Tool>('select');
  const [isDrawing, setIsDrawing] = useState(false);
  const [elements, setElements] = useState<DrawingElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  
  // Estados de configuração
  const [selectedColor, setSelectedColor] = useState('#6366f1');
  const [zoom, setZoom] = useState(100);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Inicializar canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configurar tamanho do canvas
    const resizeCanvas = () => {
      const container = containerRef.current;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        drawCanvas();
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  // Função para desenhar no canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Limpar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Aplicar zoom e pan
    ctx.save();
    ctx.scale(zoom / 100, zoom / 100);
    ctx.translate(panOffset.x, panOffset.y);

    // Desenhar grid
    drawGrid(ctx, canvas.width, canvas.height);

    // Desenhar elementos
    elements.forEach(element => {
      drawElement(ctx, element);
    });

    ctx.restore();
  }, [elements, zoom, panOffset]);

  // Desenhar grid
  const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const gridSize = 20;
    ctx.strokeStyle = '#1f2937';
    ctx.lineWidth = 0.5;

    // Linhas verticais
    for (let x = 0; x < width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Linhas horizontais
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  };

  // Desenhar elemento individual
  const drawElement = (ctx: CanvasRenderingContext2D, element: DrawingElement) => {
    ctx.strokeStyle = selectedElement === element.id ? '#3b82f6' : selectedColor;
    ctx.lineWidth = 2;
    ctx.fillStyle = element.data?.fill || 'transparent';

    switch (element.type) {
      case 'rectangle':
        ctx.strokeRect(element.x, element.y, element.width, element.height);
        if (element.data?.fill) {
          ctx.fillRect(element.x, element.y, element.width, element.height);
        }
        break;

      case 'circle':
        ctx.beginPath();
        ctx.arc(
          element.x + element.width / 2,
          element.y + element.height / 2,
          Math.min(element.width, element.height) / 2,
          0,
          2 * Math.PI
        );
        ctx.stroke();
        if (element.data?.fill) {
          ctx.fill();
        }
        break;

      case 'text':
        ctx.font = '16px Inter, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(element.data?.text || 'Texto', element.x, element.y);
        break;

      case 'uml-class':
        drawUMLClass(ctx, element);
        break;
    }
  };

  // Desenhar classe UML
  const drawUMLClass = (ctx: CanvasRenderingContext2D, element: DrawingElement) => {
    const { x, y, width, height } = element;
    
    // Container principal
    ctx.strokeRect(x, y, width, height);
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(x, y, width, height);

    // Linhas separadoras
    ctx.beginPath();
    ctx.moveTo(x, y + 30);
    ctx.lineTo(x + width, y + 30);
    ctx.moveTo(x, y + height - 40);
    ctx.lineTo(x + width, y + height - 40);
    ctx.stroke();

    // Texto
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px Inter, sans-serif';
    ctx.fillText('ClassName', x + 10, y + 20);
    
    ctx.font = '12px Inter, sans-serif';
    ctx.fillText('- attribute: String', x + 10, y + 45);
    ctx.fillText('+ method(): void', x + 10, y + height - 20);
  };

  // Handlers de eventos do mouse
  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (e.clientX - rect.left - panOffset.x) / (zoom / 100);
    const y = (e.clientY - rect.top - panOffset.y) / (zoom / 100);

    if (currentTool === 'select') {
      // Verificar se clicou em algum elemento
      const clickedElement = elements.find(el => 
        x >= el.x && x <= el.x + el.width &&
        y >= el.y && y <= el.y + el.height
      );
      
      setSelectedElement(clickedElement?.id || null);
      
      if (!clickedElement) {
        // Iniciar pan
        setIsDragging(true);
        setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
      }
    } else {
      // Criar novo elemento
      createNewElement(x, y);
    }

    setIsDrawing(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing) return;

    if (isDragging && currentTool === 'select') {
      // Pan do canvas
      const newPanOffset = {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      };
      setPanOffset(newPanOffset);
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    setIsDragging(false);
  };

  // Criar novo elemento
  const createNewElement = (x: number, y: number) => {
    const newElement: DrawingElement = {
      id: Date.now().toString(),
      type: currentTool,
      x,
      y,
      width: currentTool === 'text' ? 100 : 120,
      height: currentTool === 'text' ? 20 : currentTool === 'uml-class' ? 120 : 80,
      data: {
        fill: currentTool === 'text' ? undefined : 'transparent',
        text: currentTool === 'text' ? 'Clique para editar' : undefined
      }
    };

    setElements(prev => [...prev, newElement]);
    setSelectedElement(newElement.id);
  };

  // Funções de controle
  const zoomIn = () => setZoom(prev => Math.min(prev + 25, 300));
  const zoomOut = () => setZoom(prev => Math.max(prev - 25, 25));
  const resetZoom = () => {
    setZoom(100);
    setPanOffset({ x: 0, y: 0 });
  };

  const deleteSelected = () => {
    if (selectedElement) {
      setElements(prev => prev.filter(el => el.id !== selectedElement));
      setSelectedElement(null);
    }
  };

  const clearCanvas = () => {
    setElements([]);
    setSelectedElement(null);
  };

  // Renderizar a interface
  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Definição das ferramentas
  const tools = [
    { id: 'select', icon: Mouse, label: 'Selecionar' },
    { id: 'pen', icon: Pencil, label: 'Desenho' },
    { id: 'rectangle', icon: Square, label: 'Retângulo' },
    { id: 'circle', icon: Circle, label: 'Círculo' },
    { id: 'text', icon: Type, label: 'Texto' },
    { id: 'arrow', icon: ArrowUpRight, label: 'Seta' },
    { id: 'uml-class', icon: Square, label: 'Classe UML' },
  ];

  const colors = [
    '#6366f1', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
    '#06b6d4', '#84cc16', '#f97316', '#ec4899', '#6b7280', '#000000'
  ];

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Toolbar lateral */}
      <div className="w-16 bg-gray-800 border-r border-gray-700 flex flex-col items-center py-4 gap-2">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setCurrentTool(tool.id as Tool)}
            className={`p-3 rounded-lg transition-colors ${
              currentTool === tool.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
            title={tool.label}
          >
            <tool.icon className="w-5 h-5" />
          </button>
        ))}
        
        <div className="h-px bg-gray-700 w-8 my-2" />
        
        {/* Cores */}
        <div className="grid grid-cols-2 gap-1 px-1">
          {colors.slice(0, 8).map((color) => (
            <button
              key={color}
              onClick={() => setSelectedColor(color)}
              className={`w-4 h-4 rounded border ${
                selectedColor === color ? 'border-white' : 'border-gray-600'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      {/* Área principal do canvas */}
      <div className="flex-1 flex flex-col">
        {/* Header com informações do projeto */}
        <div className="h-12 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <span className="text-white font-medium">Projeto: {projectCode}</span>
            <button
              onClick={() => navigator.clipboard.writeText(window.location.href)}
              className="text-sm text-gray-400 hover:text-white flex items-center gap-1"
            >
              <Share2 className="w-4 h-4" />
              Compartilhar
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Zoom: {zoom}%</span>
            <button
              onClick={zoomOut}
              className="p-1 text-gray-400 hover:text-white"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={resetZoom}
              className="p-1 text-gray-400 hover:text-white"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={zoomIn}
              className="p-1 text-gray-400 hover:text-white"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Canvas container */}
        <div 
          ref={containerRef}
          className="flex-1 relative overflow-hidden bg-gray-900"
        >
          <canvas
            ref={canvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            className="absolute inset-0 cursor-crosshair"
          />
        </div>

        {/* Controls bar */}
        <div className="h-12 bg-gray-800 border-t border-gray-700 flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <button
              onClick={deleteSelected}
              disabled={!selectedElement}
              className="p-2 text-gray-400 hover:text-white disabled:opacity-50"
              title="Deletar selecionado"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={clearCanvas}
              className="p-2 text-gray-400 hover:text-white"
              title="Limpar tudo"
            >
              <Move className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-400 hover:text-white" title="Exportar">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FigmaCanvas;
