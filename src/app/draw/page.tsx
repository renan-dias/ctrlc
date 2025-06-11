'use client';
import { useEffect, useRef, useState, useCallback } from 'react';

// Tipos para elementos de diagrama
interface BaseElement {
  id: string;
  x: number;
  y: number;
  selected?: boolean;
}

interface RectElement extends BaseElement {
  type: 'rect';
  width: number;
  height: number;
  text?: string;
}

interface CircleElement extends BaseElement {
  type: 'circle';
  radius: number;
  text?: string;
}

interface DiamondElement extends BaseElement {
  type: 'diamond';
  width: number;
  height: number;
  text?: string;
}

interface LineElement extends BaseElement {
  type: 'line';
  x2: number;
  y2: number;
}

interface TextElement extends BaseElement {
  type: 'text';
  text: string;
  fontSize: number;
}

type DiagramElement = RectElement | CircleElement | DiamondElement | LineElement | TextElement;

type Tool = 'select' | 'rect' | 'circle' | 'diamond' | 'line' | 'text' | 'pan';

export default function DrawPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [elements, setElements] = useState<DiagramElement[]>([]);
  const [selectedTool, setSelectedTool] = useState<Tool>('select');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [dragStart, setDragStart] = useState<{x: number, y: number} | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({x: 0, y: 0});

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.setAttribute('data-theme', !isDarkMode ? 'dark' : 'light');
  };

  // Converter coordenadas do mouse para coordenadas do canvas
  const getCanvasCoords = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return {x: 0, y: 0};
    const rect = canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left - pan.x) / zoom,
      y: (clientY - rect.top - pan.y) / zoom
    };
  }, [zoom, pan]);

  // Event handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoords(e.clientX, e.clientY);
    setDragStart(coords);
    setIsDrawing(true);

    if (selectedTool === 'text') {
      const text = prompt('Digite o texto:');
      if (text) {
        const newElement: TextElement = {
          id: Date.now().toString(),
          type: 'text',
          x: coords.x,
          y: coords.y,
          text,
          fontSize: 16
        };
        setElements(prev => [...prev, newElement]);
      }
      return;
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !dragStart) return;
    
    const coords = getCanvasCoords(e.clientX, e.clientY);
    // Aqui você pode adicionar preview do elemento sendo desenhado
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !dragStart) return;
    
    const coords = getCanvasCoords(e.clientX, e.clientY);
    const width = Math.abs(coords.x - dragStart.x);
    const height = Math.abs(coords.y - dragStart.y);
    
    if (width < 10 && height < 10) {
      setIsDrawing(false);
      setDragStart(null);
      return;
    }

    let newElement: DiagramElement | null = null;

    switch (selectedTool) {
      case 'rect':
        newElement = {
          id: Date.now().toString(),
          type: 'rect',
          x: Math.min(dragStart.x, coords.x),
          y: Math.min(dragStart.y, coords.y),
          width,
          height,
          text: 'Retângulo'
        };
        break;
      case 'circle':
        const radius = Math.max(width, height) / 2;
        newElement = {
          id: Date.now().toString(),
          type: 'circle',
          x: dragStart.x,
          y: dragStart.y,
          radius,
          text: 'Círculo'
        };
        break;
      case 'diamond':
        newElement = {
          id: Date.now().toString(),
          type: 'diamond',
          x: Math.min(dragStart.x, coords.x),
          y: Math.min(dragStart.y, coords.y),
          width,
          height,
          text: 'Losango'
        };
        break;
      case 'line':
        newElement = {
          id: Date.now().toString(),
          type: 'line',
          x: dragStart.x,
          y: dragStart.y,
          x2: coords.x,
          y2: coords.y
        };
        break;
    }

    if (newElement) {
      setElements(prev => [...prev, newElement!]);
    }

    setIsDrawing(false);
    setDragStart(null);
  };

  // Renderização no canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Limpar canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Aplicar transformações
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Renderizar elementos
    elements.forEach(element => {
      ctx.save();
      
      switch (element.type) {
        case 'rect':
          ctx.fillStyle = isDarkMode ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.2)';
          ctx.strokeStyle = '#6366f1';
          ctx.lineWidth = 2;
          ctx.fillRect(element.x, element.y, element.width, element.height);
          ctx.strokeRect(element.x, element.y, element.width, element.height);
          
          if (element.text) {
            ctx.fillStyle = isDarkMode ? '#ffffff' : '#1e293b';
            ctx.font = '14px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(element.text, element.x + element.width/2, element.y + element.height/2 + 5);
          }
          break;
          
        case 'circle':
          ctx.fillStyle = isDarkMode ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.2)';
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(element.x, element.y, element.radius, 0, 2 * Math.PI);
          ctx.fill();
          ctx.stroke();
          
          if (element.text) {
            ctx.fillStyle = isDarkMode ? '#ffffff' : '#1e293b';
            ctx.font = '14px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(element.text, element.x, element.y + 5);
          }
          break;
          
        case 'diamond':
          ctx.fillStyle = isDarkMode ? 'rgba(245, 158, 11, 0.3)' : 'rgba(245, 158, 11, 0.2)';
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(element.x + element.width/2, element.y);
          ctx.lineTo(element.x + element.width, element.y + element.height/2);
          ctx.lineTo(element.x + element.width/2, element.y + element.height);
          ctx.lineTo(element.x, element.y + element.height/2);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          
          if (element.text) {
            ctx.fillStyle = isDarkMode ? '#ffffff' : '#1e293b';
            ctx.font = '14px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(element.text, element.x + element.width/2, element.y + element.height/2 + 5);
          }
          break;
          
        case 'line':
          ctx.strokeStyle = isDarkMode ? '#a1a5b8' : '#64748b';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(element.x, element.y);
          ctx.lineTo(element.x2, element.y2);
          ctx.stroke();
          
          // Desenhar seta
          const angle = Math.atan2(element.y2 - element.y, element.x2 - element.x);
          const arrowLength = 15;
          ctx.beginPath();
          ctx.moveTo(element.x2, element.y2);
          ctx.lineTo(
            element.x2 - arrowLength * Math.cos(angle - Math.PI/6),
            element.y2 - arrowLength * Math.sin(angle - Math.PI/6)
          );
          ctx.moveTo(element.x2, element.y2);
          ctx.lineTo(
            element.x2 - arrowLength * Math.cos(angle + Math.PI/6),
            element.y2 - arrowLength * Math.sin(angle + Math.PI/6)
          );
          ctx.stroke();
          break;
          
        case 'text':
          ctx.fillStyle = isDarkMode ? '#ffffff' : '#1e293b';
          ctx.font = `${element.fontSize}px Inter, sans-serif`;
          ctx.fillText(element.text, element.x, element.y);
          break;
      }
      
      ctx.restore();
    });
    
    ctx.restore();
  }, [elements, isDarkMode, zoom, pan]);

  return (
    <div className="fixed inset-0 flex" style={{background: 'var(--bg-primary)'}}>
      {/* Toolbar lateral */}
      <div className="toolbar-glass w-16 flex flex-col items-center py-4 m-4 gap-2">
        <button 
          className={`tool-btn ${selectedTool === 'select' ? 'active' : ''}`}
          onClick={() => setSelectedTool('select')}
          title="Selecionar"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2 2L8 8L2 14L2 2Z"/>
          </svg>
        </button>
        
        <button 
          className={`tool-btn ${selectedTool === 'rect' ? 'active' : ''}`}
          onClick={() => setSelectedTool('rect')}
          title="Retângulo"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
          </svg>
        </button>
        
        <button 
          className={`tool-btn ${selectedTool === 'circle' ? 'active' : ''}`}
          onClick={() => setSelectedTool('circle')}
          title="Círculo"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
          </svg>
        </button>
        
        <button 
          className={`tool-btn ${selectedTool === 'diamond' ? 'active' : ''}`}
          onClick={() => setSelectedTool('diamond')}
          title="Losango"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L22 12L12 22L2 12Z"/>
          </svg>
        </button>
        
        <button 
          className={`tool-btn ${selectedTool === 'line' ? 'active' : ''}`}
          onClick={() => setSelectedTool('line')}
          title="Linha"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12H19M19 12L12 5M19 12L12 19"/>
          </svg>
        </button>
        
        <button 
          className={`tool-btn ${selectedTool === 'text' ? 'active' : ''}`}
          onClick={() => setSelectedTool('text')}
          title="Texto"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="4,7 4,4 20,4 20,7"/>
            <line x1="9" y1="20" x2="15" y2="20"/>
            <line x1="12" y1="4" x2="12" y2="20"/>
          </svg>
        </button>
        
        <div className="h-px bg-gray-600 w-8 my-2"></div>
        
        <button 
          className="tool-btn"
          onClick={toggleDarkMode}
          title={isDarkMode ? 'Modo Claro' : 'Modo Escuro'}
        >
          {isDarkMode ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="5"/>
              <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
            </svg>
          )}
        </button>
      </div>

      {/* Canvas principal */}
      <div className="flex-1 relative">
        <canvas
          ref={canvasRef}
          width={window.innerWidth - 100}
          height={window.innerHeight}
          className="canvas-grid cursor-crosshair"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        />
        
        {/* Header */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
          <h1 className="gradient-text text-2xl font-bold">Área de Desenho</h1>
          <div className="floating-panel px-4 py-2 flex items-center gap-4">
            <span className="text-sm text-gray-500">
              Zoom: {Math.round(zoom * 100)}%
            </span>
            <span className="text-sm text-gray-500">
              Elementos: {elements.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
