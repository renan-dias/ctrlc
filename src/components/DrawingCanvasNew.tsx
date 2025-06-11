/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as fabric from 'fabric';
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
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ArrowRight,
  Database,
  Server,
  Smartphone,
  Globe,
  Layers
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
  | 'uml-abstract'
  | 'uml-enum'
  | 'ui-button'
  | 'ui-input'
  | 'ui-card'
  | 'ui-modal'
  | 'service-api'
  | 'service-db'
  | 'service-microservice'
  | 'service-frontend'
  | 'arrow'
  | 'connection';

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
  const [selectedColor, setSelectedColor] = useState('#3b82f6');
  const [brushSize, setBrushSize] = useState(2);
  const [fontSize, setFontSize] = useState(16);

  // Inicializar Fabric.js
  useEffect(() => {
    if (canvasRef.current && !fabricCanvasRef.current) {
      const canvas = new fabric.Canvas(canvasRef.current, {
        width: window.innerWidth - 400,
        height: window.innerHeight - 200,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleMouseDown = (e: fabric.TEvent) => {
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
      case 'uml-abstract':
        createUMLAbstract(pointer.x, pointer.y);
        break;
      case 'uml-enum':
        createUMLEnum(pointer.x, pointer.y);
        break;
      case 'ui-button':
        createUIButton(pointer.x, pointer.y);
        break;
      case 'ui-input':
        createUIInput(pointer.x, pointer.y);
        break;
      case 'ui-card':
        createUICard(pointer.x, pointer.y);
        break;
      case 'ui-modal':
        createUIModal(pointer.x, pointer.y);
        break;
      case 'service-api':
        createServiceAPI(pointer.x, pointer.y);
        break;
      case 'service-db':
        createServiceDB(pointer.x, pointer.y);
        break;
      case 'service-microservice':
        createServiceMicroservice(pointer.x, pointer.y);
        break;
      case 'service-frontend':
        createServiceFrontend(pointer.x, pointer.y);
        break;
      case 'arrow':
        createArrow(pointer.x, pointer.y);
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
          fabricCanvasRef.current.freeDrawingBrush.color = isDarkMode ? '#0a0a0a' : '#ffffff';
        }
        break;
      default:
        fabricCanvasRef.current.isDrawingMode = false;
        fabricCanvasRef.current.selection = true;
        break;
    }
  };

  const handleMouseMove = () => {
    if (!isDrawing || !fabricCanvasRef.current) return;
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.isDrawingMode = currentTool === 'pen' || currentTool === 'eraser';
    }
  };
  // Funções auxiliares para criar elementos editáveis
  const createEditableText = (
    text: string,
    x: number,
    y: number,
    fontSize: number = 14,
    options: any = {}
  ) => {
    return new fabric.IText(text, {
      left: x,
      top: y,
      fontSize,
      ...options,
    });
  };

  // Funções de criação de elementos básicos
  const createRectangle = (x: number, y: number) => {
    if (!fabricCanvasRef.current) return;
    
    const rect = new fabric.Rect({
      left: x,
      top: y,
      width: 120,
      height: 80,
      fill: 'transparent',
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
      fill: 'transparent',
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
      fill: 'transparent',
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
      strokeWidth: 2,
    });
    
    fabricCanvasRef.current.add(line);
    fabricCanvasRef.current.setActiveObject(line);
  };

  const createText = (x: number, y: number) => {
    if (!fabricCanvasRef.current) return;
    
    const text = createEditableText('Clique para editar', x, y, fontSize);
    
    fabricCanvasRef.current.add(text);
    fabricCanvasRef.current.setActiveObject(text);
  };

  const createArrow = (x: number, y: number) => {
    if (!fabricCanvasRef.current) return;
    
    const arrowLine = new fabric.Line([x, y, x + 100, y], {
      stroke: selectedColor,
      strokeWidth: 2,
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

  // Diagramas UML complexos e editáveis
  const createUMLClass = (x: number, y: number) => {
    if (!fabricCanvasRef.current) return;
    
    const className = createEditableText('ClassName', x + 10, y + 8, 14, { fontWeight: 'bold' });
    const attribute1 = createEditableText('- attribute1: String', x + 10, y + 35, 12);
    const attribute2 = createEditableText('- attribute2: Number', x + 10, y + 50, 12);
    const method1 = createEditableText('+ method1(): void', x + 10, y + 75, 12);
    const method2 = createEditableText('+ method2(): String', x + 10, y + 90, 12);

    const container = new fabric.Rect({
      left: x,
      top: y,
      width: 200,
      height: 120,
      fill: isDarkMode ? '#1f2937' : '#f9fafb',
      stroke: selectedColor,
      strokeWidth: 2,
      rx: 4,
      ry: 4,
    });

    const separatorLine1 = new fabric.Line([x, y + 30, x + 200, y + 30], {
      stroke: selectedColor,
      strokeWidth: 1,
    });

    const separatorLine2 = new fabric.Line([x, y + 65, x + 200, y + 65], {
      stroke: selectedColor,
      strokeWidth: 1,
    });

    const group = new fabric.Group([container, separatorLine1, separatorLine2, className, attribute1, attribute2, method1, method2], {
      left: x,
      top: y,
    });
    
    fabricCanvasRef.current.add(group);
    fabricCanvasRef.current.setActiveObject(group);
  };

  const createUMLInterface = (x: number, y: number) => {
    if (!fabricCanvasRef.current) return;
    
    const stereotype = createEditableText('<<interface>>', x + 75, y + 5, 10, { textAlign: 'center', fontStyle: 'italic' });
    const interfaceName = createEditableText('InterfaceName', x + 10, y + 20, 14, { fontWeight: 'bold' });
    const method1 = createEditableText('+ method1(): void', x + 10, y + 50, 12);
    const method2 = createEditableText('+ method2(): String', x + 10, y + 65, 12);

    const container = new fabric.Rect({
      left: x,
      top: y,
      width: 200,
      height: 90,
      fill: isDarkMode ? '#1f2937' : '#f9fafb',
      stroke: selectedColor,
      strokeWidth: 2,
      strokeDashArray: [5, 5],
      rx: 4,
      ry: 4,
    });

    const separatorLine = new fabric.Line([x, y + 40, x + 200, y + 40], {
      stroke: selectedColor,
      strokeWidth: 1,
      strokeDashArray: [5, 5],
    });

    const group = new fabric.Group([container, separatorLine, stereotype, interfaceName, method1, method2], {
      left: x,
      top: y,
    });
    
    fabricCanvasRef.current.add(group);
    fabricCanvasRef.current.setActiveObject(group);
  };

  const createUMLAbstract = (x: number, y: number) => {
    if (!fabricCanvasRef.current) return;
    
    const stereotype = createEditableText('<<abstract>>', x + 75, y + 5, 10, { textAlign: 'center', fontStyle: 'italic' });
    const className = createEditableText('AbstractClass', x + 10, y + 20, 14, { fontWeight: 'bold', fontStyle: 'italic' });
    const attribute1 = createEditableText('# protectedAttr: String', x + 10, y + 45, 12);
    const method1 = createEditableText('+ concreteMethod(): void', x + 10, y + 70, 12);
    const method2 = createEditableText('+ {abstract} abstractMethod()', x + 10, y + 85, 12, { fontStyle: 'italic' });

    const container = new fabric.Rect({
      left: x,
      top: y,
      width: 220,
      height: 110,
      fill: isDarkMode ? '#1f2937' : '#f9fafb',
      stroke: selectedColor,
      strokeWidth: 2,
      rx: 4,
      ry: 4,
    });

    const separatorLine1 = new fabric.Line([x, y + 35, x + 220, y + 35], {
      stroke: selectedColor,
      strokeWidth: 1,
    });

    const separatorLine2 = new fabric.Line([x, y + 60, x + 220, y + 60], {
      stroke: selectedColor,
      strokeWidth: 1,
    });

    const group = new fabric.Group([container, separatorLine1, separatorLine2, stereotype, className, attribute1, method1, method2], {
      left: x,
      top: y,
    });
    
    fabricCanvasRef.current.add(group);
    fabricCanvasRef.current.setActiveObject(group);
  };

  const createUMLEnum = (x: number, y: number) => {
    if (!fabricCanvasRef.current) return;
    
    const stereotype = createEditableText('<<enumeration>>', x + 60, y + 5, 10, { textAlign: 'center', fontStyle: 'italic' });
    const enumName = createEditableText('EnumName', x + 10, y + 20, 14, { fontWeight: 'bold' });
    const value1 = createEditableText('VALUE_ONE', x + 10, y + 45, 12);
    const value2 = createEditableText('VALUE_TWO', x + 10, y + 60, 12);
    const value3 = createEditableText('VALUE_THREE', x + 10, y + 75, 12);

    const container = new fabric.Rect({
      left: x,
      top: y,
      width: 180,
      height: 95,
      fill: isDarkMode ? '#1f2937' : '#f9fafb',
      stroke: selectedColor,
      strokeWidth: 2,
      rx: 4,
      ry: 4,
    });

    const separatorLine = new fabric.Line([x, y + 35, x + 180, y + 35], {
      stroke: selectedColor,
      strokeWidth: 1,
    });

    const group = new fabric.Group([container, separatorLine, stereotype, enumName, value1, value2, value3], {
      left: x,
      top: y,
    });
    
    fabricCanvasRef.current.add(group);
    fabricCanvasRef.current.setActiveObject(group);
  };

  // Componentes UI modernos
  const createUIButton = (x: number, y: number) => {
    if (!fabricCanvasRef.current) return;
    
    const buttonText = createEditableText('Button', x + 50, y + 15, 14, { 
      textAlign: 'center',
      fontWeight: '500'
    });

    const container = new fabric.Rect({
      left: x,
      top: y,
      width: 120,
      height: 45,
      fill: selectedColor,
      stroke: selectedColor,
      strokeWidth: 1,
      rx: 8,
      ry: 8,
      shadow: new fabric.Shadow({
        color: selectedColor + '40',
        blur: 8,
        offsetX: 0,
        offsetY: 4,
      }),
    });

    const group = new fabric.Group([container, buttonText], {
      left: x,
      top: y,
    });
    
    fabricCanvasRef.current.add(group);
    fabricCanvasRef.current.setActiveObject(group);
  };

  const createUIInput = (x: number, y: number) => {
    if (!fabricCanvasRef.current) return;
    
    const placeholder = createEditableText('Placeholder text', x + 12, y + 13, 14, { 
      fill: isDarkMode ? '#9ca3af' : '#6b7280'
    });

    const container = new fabric.Rect({
      left: x,
      top: y,
      width: 200,
      height: 40,
      fill: isDarkMode ? '#374151' : '#ffffff',
      stroke: isDarkMode ? '#6b7280' : '#d1d5db',
      strokeWidth: 1,
      rx: 6,
      ry: 6,
    });

    const group = new fabric.Group([container, placeholder], {
      left: x,
      top: y,
    });
    
    fabricCanvasRef.current.add(group);
    fabricCanvasRef.current.setActiveObject(group);
  };

  const createUICard = (x: number, y: number) => {
    if (!fabricCanvasRef.current) return;
    
    const title = createEditableText('Card Title', x + 20, y + 20, 16, { fontWeight: 'bold' });
    const subtitle = createEditableText('Card subtitle or description', x + 20, y + 40, 14, { 
      fill: isDarkMode ? '#9ca3af' : '#6b7280'
    });
    const content = createEditableText('Card content goes here...', x + 20, y + 65, 14);

    const container = new fabric.Rect({
      left: x,
      top: y,
      width: 280,
      height: 160,
      fill: isDarkMode ? '#1f2937' : '#ffffff',
      stroke: isDarkMode ? '#374151' : '#e5e7eb',
      strokeWidth: 1,
      rx: 12,
      ry: 12,
      shadow: new fabric.Shadow({
        color: isDarkMode ? '#00000040' : '#00000020',
        blur: 12,
        offsetX: 0,
        offsetY: 4,
      }),
    });

    const group = new fabric.Group([container, title, subtitle, content], {
      left: x,
      top: y,
    });
    
    fabricCanvasRef.current.add(group);
    fabricCanvasRef.current.setActiveObject(group);
  };

  const createUIModal = (x: number, y: number) => {
    if (!fabricCanvasRef.current) return;
    
    const title = createEditableText('Modal Title', x + 20, y + 20, 18, { fontWeight: 'bold' });
    const content = createEditableText('Modal content and description...', x + 20, y + 50, 14);
    const button1 = createEditableText('Cancel', x + 160, y + 140, 14, { textAlign: 'center' });
    const button2 = createEditableText('Confirm', x + 230, y + 140, 14, { textAlign: 'center' });

    const overlay = new fabric.Rect({
      left: x - 50,
      top: y - 50,
      width: 400,
      height: 300,
      fill: isDarkMode ? '#00000060' : '#00000020',
      rx: 0,
      ry: 0,
    });

    const container = new fabric.Rect({
      left: x,
      top: y,
      width: 300,
      height: 180,
      fill: isDarkMode ? '#1f2937' : '#ffffff',
      stroke: isDarkMode ? '#374151' : '#e5e7eb',
      strokeWidth: 1,
      rx: 12,
      ry: 12,
      shadow: new fabric.Shadow({
        color: isDarkMode ? '#00000060' : '#00000040',
        blur: 24,
        offsetX: 0,
        offsetY: 8,
      }),
    });

    const cancelBtn = new fabric.Rect({
      left: x + 140,
      top: y + 130,
      width: 60,
      height: 30,
      fill: 'transparent',
      stroke: isDarkMode ? '#6b7280' : '#d1d5db',
      strokeWidth: 1,
      rx: 6,
      ry: 6,
    });

    const confirmBtn = new fabric.Rect({
      left: x + 210,
      top: y + 130,
      width: 60,
      height: 30,
      fill: selectedColor,
      stroke: selectedColor,
      strokeWidth: 1,
      rx: 6,
      ry: 6,
    });

    const group = new fabric.Group([overlay, container, cancelBtn, confirmBtn, title, content, button1, button2], {
      left: x,
      top: y,
    });
    
    fabricCanvasRef.current.add(group);
    fabricCanvasRef.current.setActiveObject(group);
  };

  // Ícones de serviços modernos
  const createServiceAPI = (x: number, y: number) => {
    if (!fabricCanvasRef.current) return;
    
    const apiText = createEditableText('API', x, y, 16, { 
      textAlign: 'center',
      fontWeight: 'bold',
      fill: '#ffffff'
    });

    const container = new fabric.Circle({
      left: x,
      top: y,
      radius: 40,
      fill: '#3b82f6',
      stroke: '#1d4ed8',
      strokeWidth: 2,
      shadow: new fabric.Shadow({
        color: '#3b82f640',
        blur: 12,
        offsetX: 0,
        offsetY: 4,
      }),
    });

    const group = new fabric.Group([container, apiText], {
      left: x,
      top: y,
    });
    
    fabricCanvasRef.current.add(group);
    fabricCanvasRef.current.setActiveObject(group);
  };

  const createServiceDB = (x: number, y: number) => {
    if (!fabricCanvasRef.current) return;
    
    const dbText = createEditableText('DB', x, y + 20, 16, { 
      textAlign: 'center',
      fontWeight: 'bold',
      fill: '#ffffff'
    });

    const topEllipse = new fabric.Ellipse({
      left: x,
      top: y,
      rx: 50,
      ry: 15,
      fill: '#10b981',
      stroke: '#059669',
      strokeWidth: 2,
    });

    const cylinder = new fabric.Rect({
      left: x - 50,
      top: y,
      width: 100,
      height: 40,
      fill: '#10b981',
      stroke: '#059669',
      strokeWidth: 2,
      strokeDashArray: [0],
    });

    const bottomEllipse = new fabric.Ellipse({
      left: x,
      top: y + 40,
      rx: 50,
      ry: 15,
      fill: '#10b981',
      stroke: '#059669',
      strokeWidth: 2,
    });

    const group = new fabric.Group([cylinder, topEllipse, bottomEllipse, dbText], {
      left: x,
      top: y,
      shadow: new fabric.Shadow({
        color: '#10b98140',
        blur: 12,
        offsetX: 0,
        offsetY: 4,
      }),
    });
    
    fabricCanvasRef.current.add(group);
    fabricCanvasRef.current.setActiveObject(group);
  };

  const createServiceMicroservice = (x: number, y: number) => {
    if (!fabricCanvasRef.current) return;
    
    const serviceText = createEditableText('Service', x + 25, y + 25, 14, { 
      textAlign: 'center',
      fontWeight: 'bold',
      fill: '#ffffff'
    });

    const container = new fabric.Rect({
      left: x,
      top: y,
      width: 100,
      height: 60,
      fill: '#8b5cf6',
      stroke: '#7c3aed',
      strokeWidth: 2,
      rx: 8,
      ry: 8,
      shadow: new fabric.Shadow({
        color: '#8b5cf640',
        blur: 12,
        offsetX: 0,
        offsetY: 4,
      }),
    });

    const group = new fabric.Group([container, serviceText], {
      left: x,
      top: y,
    });
    
    fabricCanvasRef.current.add(group);
    fabricCanvasRef.current.setActiveObject(group);
  };

  const createServiceFrontend = (x: number, y: number) => {
    if (!fabricCanvasRef.current) return;
    
    const frontendText = createEditableText('Frontend', x + 35, y + 35, 14, { 
      textAlign: 'center',
      fontWeight: 'bold',
      fill: '#ffffff'
    });

    const container = new fabric.Rect({
      left: x,
      top: y,
      width: 120,
      height: 80,
      fill: '#f59e0b',
      stroke: '#d97706',
      strokeWidth: 2,
      rx: 12,
      ry: 12,
      shadow: new fabric.Shadow({
        color: '#f59e0b40',
        blur: 12,
        offsetX: 0,
        offsetY: 4,
      }),
    });

    const group = new fabric.Group([container, frontendText], {
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
      activeObjects.forEach((obj: fabric.Object) => {
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
      fabricCanvasRef.current.setViewportTransform([1, 0, 0, 1, 0, 0]);
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
      link.download = 'ctrlc-drawing.png';
      link.href = dataURL;
      link.click();
    }
  };

  const shareCanvas = async () => {
    if (fabricCanvasRef.current && navigator.share) {
      const canvas = fabricCanvasRef.current.getElement();
      canvas.toBlob(async (blob: Blob | null) => {
        if (blob) {
          const file = new File([blob], 'ctrlc-drawing.png', { type: 'image/png' });
          try {
            await navigator.share({
              files: [file],
              title: 'Meu diagrama ctrlC',
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

  // Definir ferramentas organizadas
  const basicTools = [
    { id: 'select', icon: Mouse, label: 'Selecionar' },
    { id: 'pen', icon: Pencil, label: 'Desenho Livre' },
    { id: 'eraser', icon: Eraser, label: 'Borracha' },
    { id: 'text', icon: Type, label: 'Texto' },
    { id: 'arrow', icon: ArrowRight, label: 'Seta' },
  ];

  const shapeTools = [
    { id: 'rectangle', icon: Square, label: 'Retângulo' },
    { id: 'circle', icon: Circle, label: 'Círculo' },
    { id: 'triangle', icon: Triangle, label: 'Triângulo' },
    { id: 'line', icon: Pencil, label: 'Linha' },
  ];

  const umlTools = [
    { id: 'uml-class', icon: Square, label: 'Classe' },
    { id: 'uml-interface', icon: Square, label: 'Interface' },
    { id: 'uml-abstract', icon: Square, label: 'Abstrata' },
    { id: 'uml-enum', icon: Square, label: 'Enum' },
  ];

  const uiTools = [
    { id: 'ui-button', icon: Square, label: 'Botão' },
    { id: 'ui-input', icon: Square, label: 'Input' },
    { id: 'ui-card', icon: Layers, label: 'Card' },
    { id: 'ui-modal', icon: Square, label: 'Modal' },
  ];

  const serviceTools = [
    { id: 'service-api', icon: Server, label: 'API' },
    { id: 'service-db', icon: Database, label: 'Database' },
    { id: 'service-microservice', icon: Globe, label: 'Microservice' },
    { id: 'service-frontend', icon: Smartphone, label: 'Frontend' },
  ];

  const colors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
    '#8b5cf6', '#f97316', '#06b6d4', '#84cc16',
    '#ec4899', '#6b7280', '#000000', '#ffffff'
  ];

  return (
    <div className="fixed inset-0 flex" style={{background: 'var(--bg-primary)'}}>
      {/* Sidebar com ferramentas */}
      <div className="modern-glass w-80 border-r" style={{borderColor: 'var(--border)'}} >
        <div className="p-6 h-full overflow-y-auto">
          <div className="space-y-6">
            {/* Ferramentas Básicas */}
            <div>
              <h3 className="text-sm font-semibold mb-3" style={{color: 'var(--text-primary)'}}>
                Ferramentas Básicas
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {basicTools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => setCurrentTool(tool.id as Tool)}
                    className={`p-3 rounded-lg border transition-all ${
                      currentTool === tool.id
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white/5 hover:bg-white/10 border-white/10'
                    }`}
                    title={tool.label}
                    style={{color: currentTool === tool.id ? '#ffffff' : 'var(--text-primary)'}}
                  >
                    <tool.icon className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-xs block">{tool.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Formas */}
            <div>
              <h3 className="text-sm font-semibold mb-3" style={{color: 'var(--text-primary)'}}>
                Formas
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {shapeTools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => setCurrentTool(tool.id as Tool)}
                    className={`p-3 rounded-lg border transition-all ${
                      currentTool === tool.id
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white/5 hover:bg-white/10 border-white/10'
                    }`}
                    title={tool.label}
                    style={{color: currentTool === tool.id ? '#ffffff' : 'var(--text-primary)'}}
                  >
                    <tool.icon className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-xs block">{tool.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* UML */}
            <div>
              <h3 className="text-sm font-semibold mb-3" style={{color: 'var(--text-primary)'}}>
                Diagramas UML
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {umlTools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => setCurrentTool(tool.id as Tool)}
                    className={`p-3 rounded-lg border transition-all ${
                      currentTool === tool.id
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white/5 hover:bg-white/10 border-white/10'
                    }`}
                    title={tool.label}
                    style={{color: currentTool === tool.id ? '#ffffff' : 'var(--text-primary)'}}
                  >
                    <tool.icon className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-xs block">{tool.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* UI Components */}
            <div>
              <h3 className="text-sm font-semibold mb-3" style={{color: 'var(--text-primary)'}}>
                Componentes UI
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {uiTools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => setCurrentTool(tool.id as Tool)}
                    className={`p-3 rounded-lg border transition-all ${
                      currentTool === tool.id
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white/5 hover:bg-white/10 border-white/10'
                    }`}
                    title={tool.label}
                    style={{color: currentTool === tool.id ? '#ffffff' : 'var(--text-primary)'}}
                  >
                    <tool.icon className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-xs block">{tool.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-sm font-semibold mb-3" style={{color: 'var(--text-primary)'}}>
                Serviços & Arquitetura
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {serviceTools.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => setCurrentTool(tool.id as Tool)}
                    className={`p-3 rounded-lg border transition-all ${
                      currentTool === tool.id
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white/5 hover:bg-white/10 border-white/10'
                    }`}
                    title={tool.label}
                    style={{color: currentTool === tool.id ? '#ffffff' : 'var(--text-primary)'}}
                  >
                    <tool.icon className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-xs block">{tool.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Paleta de Cores */}
            <div>
              <h3 className="text-sm font-semibold mb-3" style={{color: 'var(--text-primary)'}}>
                Cores
              </h3>
              <div className="grid grid-cols-6 gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-lg border-2 transition-all ${
                      selectedColor === color ? 'border-white scale-110' : 'border-gray-400'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {/* Configurações */}
            <div>
              <h3 className="text-sm font-semibold mb-3" style={{color: 'var(--text-primary)'}}>
                Configurações
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs" style={{color: 'var(--text-secondary)'}}>
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
                <div>
                  <label className="text-xs" style={{color: 'var(--text-secondary)'}}>
                    Tamanho da Fonte: {fontSize}px
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="32"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Controles */}
            <div>
              <h3 className="text-sm font-semibold mb-3" style={{color: 'var(--text-primary)'}}>
                Controles
              </h3>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <button
                    onClick={undo}
                    disabled={historyIndex <= 0}
                    className="flex-1 p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-50"
                    title="Desfazer"
                    style={{color: 'var(--text-primary)'}}
                  >
                    <Undo className="w-4 h-4 mx-auto" />
                  </button>
                  <button
                    onClick={redo}
                    disabled={historyIndex >= canvasHistory.length - 1}
                    className="flex-1 p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-50"
                    title="Refazer"
                    style={{color: 'var(--text-primary)'}}
                  >
                    <Redo className="w-4 h-4 mx-auto" />
                  </button>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={zoomIn}
                    className="flex-1 p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10"
                    title="Zoom In"
                    style={{color: 'var(--text-primary)'}}
                  >
                    <ZoomIn className="w-4 h-4 mx-auto" />
                  </button>
                  <button
                    onClick={zoomOut}
                    className="flex-1 p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10"
                    title="Zoom Out"
                    style={{color: 'var(--text-primary)'}}
                  >
                    <ZoomOut className="w-4 h-4 mx-auto" />
                  </button>
                  <button
                    onClick={resetZoom}
                    className="flex-1 p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10"
                    title="Reset Zoom"
                    style={{color: 'var(--text-primary)'}}
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
      </div>

      {/* Canvas Area */}
      <div className="flex-1 relative overflow-hidden">
        <canvas
          ref={canvasRef}
          className="border-none outline-none cursor-crosshair"
        />
        
        {/* Status bar */}
        <div className="absolute bottom-4 left-4 floating-panel px-3 py-2">
          <span className="text-xs" style={{color: 'var(--text-secondary)'}}>
            Ferramenta: {basicTools.concat(shapeTools, umlTools, uiTools, serviceTools).find(t => t.id === currentTool)?.label}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DrawingCanvas;
