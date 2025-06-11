'use client';
import { useState, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { markdown } from '@codemirror/lang-markdown';

interface Block {
  id: number;
  type: 'text' | 'code';
  content: string;
  filename: string;
}

const initialBlocks: Block[] = [
  { id: 1, type: 'text', content: '', filename: '' },
];

function getLanguage(filename: string) {
  if (filename.endsWith('.js') || filename.endsWith('.jsx')) return javascript();
  if (filename.endsWith('.ts') || filename.endsWith('.tsx')) return javascript();
  if (filename.endsWith('.py')) return python();
  if (filename.endsWith('.md')) return markdown();
  return javascript();
}

export default function Home() {
  const [blocks, setBlocks] = useState<Block[]>(initialBlocks);

  // Limpeza diária automática às 00h
  useEffect(() => {
    const now = new Date();
    const last = localStorage.getItem('lastClean');
    if (!last || new Date(last).getDate() !== now.getDate()) {
      setBlocks(initialBlocks);
      localStorage.setItem('lastClean', now.toISOString());
    }
    const msToMidnight =
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).getTime() - now.getTime();
    const timer = setTimeout(() => {
      setBlocks(initialBlocks);
      localStorage.setItem('lastClean', new Date().toISOString());
    }, msToMidnight);
    return () => clearTimeout(timer);
  }, []);

  // Limpar manualmente
  const handleClear = () => {
    setBlocks(initialBlocks);
    localStorage.setItem('lastClean', new Date().toISOString());
  };

  // Adicionar bloco
  const addBlock = (type: 'text' | 'code') => {
    setBlocks([
      ...blocks,
      { id: Date.now(), type, content: '', filename: '' },
    ]);
  };

  // Atualizar bloco
  const updateBlock = (id: number, content: string, filename?: string) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, content, filename: filename ?? b.filename } : b));
  };

  return (
    <section>
      <div className="flex justify-between items-center mb-6">
        <h1 className="gradient-text text-3xl font-bold">Editor ctrlC</h1>
        <button className="glass px-4 py-2 rounded-lg hover:opacity-80 transition" onClick={handleClear}>
          Limpar Tudo
        </button>
      </div>
      <div className="space-y-6">
        {blocks.map((block) => (
          <div key={block.id} className="glass p-4">
            {block.type === 'text' ? (
              <textarea
                className="w-full bg-transparent outline-none resize-none text-lg"
                placeholder="Digite aqui..."
                value={block.content}
                onChange={e => updateBlock(block.id, e.target.value)}
              />
            ) : (
              <div>
                <input
                  className="w-full bg-transparent outline-none text-sm mb-2 font-mono"
                  placeholder="Nome do arquivo (ex: index.tsx)"
                  value={block.filename}
                  onChange={e => updateBlock(block.id, block.content, e.target.value)}
                />
                <CodeMirror
                  value={block.content}
                  height="200px"
                  extensions={[getLanguage(block.filename)]}
                  onChange={(value) => updateBlock(block.id, value)}
                  theme="dark"
                />
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex gap-4 mt-8">
        <button className="glass px-4 py-2 rounded-lg" onClick={() => addBlock('text')}>Adicionar Texto</button>
        <button className="glass px-4 py-2 rounded-lg" onClick={() => addBlock('code')}>Adicionar Código</button>
      </div>
    </section>
  );
}
