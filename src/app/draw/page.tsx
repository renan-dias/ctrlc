'use client';
import { useEffect, useRef, useState } from 'react';

// Tipos explícitos para elementos de desenho
interface DrawElement {
  type: 'draw';
  points: [number, number][];
}
interface TextElement {
  type: 'text';
  x: number;
  y: number;
  text: string;
}
type ElementType = DrawElement | TextElement;

export default function DrawPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [mode, setMode] = useState<'dark' | 'light'>('dark');
  const [elements, setElements] = useState<ElementType[]>([]);
  const [current, setCurrent] = useState<DrawElement | null>(null);

  // Alternar modo claro/escuro
  const toggleMode = () => setMode(m => (m === 'dark' ? 'light' : 'dark'));

  // Desenho livre simples
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setDrawing(true);
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    setCurrent({ points: [[e.clientX - rect.left, e.clientY - rect.top]], type: 'draw' });
  };
  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing || !current) return;
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    setCurrent({ ...current, points: [...current.points, [e.clientX - rect.left, e.clientY - rect.top]] });
  };
  const handlePointerUp = () => {
    if (drawing && current) {
      setElements([...elements, current]);
      setCurrent(null);
      setDrawing(false);
    }
  };

  // Duplo clique para texto
  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const text = prompt('Digite o texto:');
    if (text) setElements([...elements, { type: 'text', x, y, text }]);
  };

  // Renderização
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = mode === 'dark' ? '#fff' : '#222';
    ctx.lineWidth = 3;
    elements.forEach(el => {
      if (el.type === 'draw') {
        ctx.beginPath();
        el.points.forEach(([x, y], i) => {
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();
      } else if (el.type === 'text') {
        ctx.font = '20px sans-serif';
        ctx.fillStyle = mode === 'dark' ? '#fff' : '#222';
        ctx.fillText(el.text, el.x, el.y);
      }
    });
    if (current && current.type === 'draw') {
      ctx.beginPath();
      current.points.forEach(([x, y], i) => {
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }
  }, [elements, current, mode]);

  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <h1 className="gradient-text text-3xl font-bold">Área de Desenho</h1>
        <button className="glass px-4 py-2 rounded-lg" onClick={toggleMode}>
          {mode === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
        </button>
      </div>
      <div className="glass p-2">
        <canvas
          ref={canvasRef}
          width={900}
          height={500}
          className="w-full h-[500px] bg-black rounded-lg cursor-crosshair"
          style={{ background: mode === 'dark' ? '#181028' : '#fff' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onDoubleClick={handleDoubleClick}
        />
      </div>
      <div className="flex gap-4 mt-8">
        {/* Atalhos para componentes (exemplo) */}
        <button className="glass px-4 py-2 rounded-lg" onClick={() => setElements([...elements, { type: 'text', x: 100, y: 100, text: 'BD' }])}>BD</button>
        <button className="glass px-4 py-2 rounded-lg" onClick={() => setElements([...elements, { type: 'text', x: 200, y: 100, text: 'Mobile' }])}>Mobile</button>
        <button className="glass px-4 py-2 rounded-lg" onClick={() => setElements([...elements, { type: 'text', x: 300, y: 100, text: 'UI Block' }])}>UI Block</button>
      </div>
    </section>
  );
}
