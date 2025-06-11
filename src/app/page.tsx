'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import Logo from '@/components/Logo';
import AuthButton from '@/components/AuthButton';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { markdown } from '@codemirror/lang-markdown';
import { Code, Type, Trash2, Sun, Moon, Palette } from 'lucide-react';

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
  const [user] = useAuthState(auth);
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
      <div className="toolbar-glass w-20 flex flex-col items-center py-4 m-4 gap-3">
        <Logo size="sm" />
        
        <div className="h-px bg-gray-600 w-12 my-1"></div>
        
        <AuthButton />
        
        <div className="h-px bg-gray-600 w-12 my-1"></div>
        
        <Link 
          href="/"
          className="tool-btn active"
          title="Editor de Código"
        >
          <Code size={20} />
        </Link>
        
        <Link 
          href="/draw"
          className="tool-btn"
          title="Área de Desenho"
        >
          <Palette size={20} />
        </Link>

        <div className="h-px bg-gray-600 w-12 my-1"></div>

        <button 
          className="tool-btn"
          onClick={() => addBlock('text')}
          title="Adicionar Texto"
        >
          <Type size={20} />
        </button>

        <button 
          className="tool-btn"
          onClick={() => addBlock('code')}
          title="Adicionar Código"
        >
          <Code size={20} />
        </button>

        <button 
          className="tool-btn"
          onClick={handleClear}
          title="Limpar Tudo"
        >
          <Trash2 size={20} />
        </button>

        <div className="h-px bg-gray-600 w-12 my-1"></div>

        <button 
          className="tool-btn"
          onClick={toggleDarkMode}
          title={isDarkMode ? 'Modo Claro' : 'Modo Escuro'}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b" style={{borderColor: 'var(--border)'}}>
          <div className="flex items-center gap-4">
            <Logo size="md" />
            <div>
              <h1 className="gradient-text text-2xl font-bold">Editor</h1>
              {user && (
                <p className="text-sm" style={{color: 'var(--text-secondary)'}}>
                  Bem-vindo, {user.displayName}
                </p>
              )}
            </div>
          </div>
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
                    <Trash2 size={16} />
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
                <Type size={16} />
                Adicionar Texto
              </button>
              <button 
                className="floating-panel px-6 py-3 flex items-center gap-2 hover:scale-105 transition-transform"
                onClick={() => addBlock('code')}
              >
                <Code size={16} />
                Adicionar Código
              </button>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <footer className="p-4 border-t text-center text-sm" style={{borderColor: 'var(--border)', color: 'var(--text-secondary)'}}>
          Desenvolvido por <span className="gradient-text font-semibold">Renan Dias</span> - Material didático Téc. Desenvolvimento de Sistemas
        </footer>
      </div>
    </div>
  );
}
