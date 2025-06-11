'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
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
  const [isDarkMode, setIsDarkMode] = useState(false);

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

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.setAttribute('data-theme', !isDarkMode ? 'dark' : 'light');
  };

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

  // Deletar bloco
  const deleteBlock = (id: number) => {
    if (blocks.length > 1) {
      setBlocks(blocks.filter(b => b.id !== id));
    }
  };

  return (
    <div className="fixed inset-0 flex" style={{background: 'var(--bg-primary)'}}>
      {/* Sidebar */}
      <div className="toolbar-glass w-16 flex flex-col items-center py-4 m-4 gap-2">
        <Link 
          href="/"
          className="tool-btn active"
          title="Editor de Código"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="16,18 22,12 16,6"/>
            <polyline points="8,6 2,12 8,18"/>
          </svg>
        </Link>
        
        <Link 
          href="/draw"
          className="tool-btn"
          title="Área de Desenho"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 19L7 14L18 3L21 6L10 17L12 19Z"/>
            <path d="M18 13V19C18 20.1 17.1 21 16 21H5C3.9 21 3 20.1 3 19V8C3 6.9 3.9 6 5 6H11"/>
          </svg>
        </Link>

        <div className="h-px bg-gray-600 w-8 my-2"></div>

        <button 
          className="tool-btn"
          onClick={() => addBlock('text')}
          title="Adicionar Texto"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="4,7 4,4 20,4 20,7"/>
            <line x1="9" y1="20" x2="15" y2="20"/>
            <line x1="12" y1="4" x2="12" y2="20"/>
          </svg>
        </button>

        <button 
          className="tool-btn"
          onClick={() => addBlock('code')}
          title="Adicionar Código"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="16,18 22,12 16,6"/>
            <polyline points="8,6 2,12 8,18"/>
          </svg>
        </button>

        <button 
          className="tool-btn"
          onClick={handleClear}
          title="Limpar Tudo"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3,6 5,6 21,6"/>
            <path d="M19,6V20C19,21 18,22 17,22H7C6,22 5,21 5,20V6M8,6V4C8,3 9,2 10,2H14C15,2 16,3 16,4V6"/>
            <line x1="10" y1="11" x2="10" y2="17"/>
            <line x1="14" y1="11" x2="14" y2="17"/>
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b" style={{borderColor: 'var(--border)'}}>
          <h1 className="gradient-text text-3xl font-bold">ctrlC Editor</h1>
          <div className="floating-panel px-4 py-2 flex items-center gap-4">
            <span className="text-sm" style={{color: 'var(--text-secondary)'}}>
              Blocos: {blocks.length}
            </span>
            <span className="text-sm" style={{color: 'var(--text-secondary)'}}>
              Auto-limpeza: 00:00h
            </span>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {blocks.map((block) => (
              <div key={block.id} className="modern-glass p-6 group relative">
                {/* Delete Button */}
                {blocks.length > 1 && (
                  <button 
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity tool-btn w-8 h-8"
                    onClick={() => deleteBlock(block.id)}
                    title="Deletar bloco"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                )}

                {block.type === 'text' ? (
                  <textarea
                    className="w-full bg-transparent outline-none resize-none text-lg border-none"
                    style={{color: 'var(--text-primary)', minHeight: '120px'}}
                    placeholder="Digite seu texto aqui..."
                    value={block.content}
                    onChange={e => updateBlock(block.id, e.target.value)}
                  />
                ) : (
                  <div>
                    <input
                      className="w-full bg-transparent outline-none text-sm mb-4 font-mono px-3 py-2 rounded border"
                      style={{borderColor: 'var(--border)', color: 'var(--text-secondary)'}}
                      placeholder="Nome do arquivo (ex: index.tsx, main.py, README.md)"
                      value={block.filename}
                      onChange={e => updateBlock(block.id, block.content, e.target.value)}
                    />
                    <div className="rounded-lg overflow-hidden border" style={{borderColor: 'var(--border)'}}>
                      <CodeMirror
                        value={block.content}
                        height="200px"
                        extensions={[getLanguage(block.filename)]}
                        onChange={(value) => updateBlock(block.id, value)}
                        theme={isDarkMode ? 'dark' : 'light'}
                        placeholder="// Digite seu código aqui..."
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Add Block Buttons */}
            <div className="flex gap-4 justify-center pt-8">
              <button 
                className="floating-panel px-6 py-3 flex items-center gap-2 hover:scale-105 transition-transform"
                onClick={() => addBlock('text')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="4,7 4,4 20,4 20,7"/>
                  <line x1="9" y1="20" x2="15" y2="20"/>
                  <line x1="12" y1="4" x2="12" y2="20"/>
                </svg>
                Adicionar Texto
              </button>
              <button 
                className="floating-panel px-6 py-3 flex items-center gap-2 hover:scale-105 transition-transform"
                onClick={() => addBlock('code')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="16,18 22,12 16,6"/>
                  <polyline points="8,6 2,12 8,18"/>
                </svg>
                Adicionar Código
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
