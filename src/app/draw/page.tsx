'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import Logo from '@/components/Logo';
import AuthButton from '@/components/AuthButton';
import DrawingCanvas from '@/components/AdvancedDrawingCanvas';
import { Code, Palette, Sun, Moon } from 'lucide-react';

export default function DrawPage() {
  const [user] = useAuthState(auth);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.setAttribute('data-theme', !isDarkMode ? 'dark' : 'light');
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
          className="tool-btn"
          title="Editor de Código"
        >
          <Code size={20} />
        </Link>
        
        <Link 
          href="/draw"
          className="tool-btn active"
          title="Área de Desenho"
        >
          <Palette size={20} />
        </Link>

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
              <h1 className="gradient-text text-2xl font-bold">Área de Desenho</h1>
              {user && (
                <p className="text-sm" style={{color: 'var(--text-secondary)'}}>
                  Bem-vindo, {user.displayName}
                </p>
              )}
            </div>
          </div>
          <div className="floating-panel px-4 py-2 flex items-center gap-4">
            <span className="text-sm" style={{color: 'var(--text-secondary)'}}>
              Modo: {isDarkMode ? 'Escuro' : 'Claro'}
            </span>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 relative">
          <DrawingCanvas isDarkMode={isDarkMode} />
        </div>
        
        {/* Footer */}
        <footer className="p-4 border-t text-center text-sm" style={{borderColor: 'var(--border)', color: 'var(--text-secondary)'}}>
          Desenvolvido por <span className="gradient-text font-semibold">Renan Dias</span> - Material didático Téc. Desenvolvimento de Sistemas
        </footer>
      </div>
    </div>
  );
}
