'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Sun, Moon } from 'lucide-react';
import Logo from '@/components/Logo';
import DrawingCanvas from '@/components/DrawingCanvas';

export default function DrawPage() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-black via-purple-900/20 to-black' 
        : 'bg-gradient-to-br from-white via-purple-100/30 to-white'
    }`}>
      {/* Header */}
      <header className="bg-white/10 dark:bg-black/20 backdrop-blur-md shadow-xl border-b border-white/20 z-10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link 
                href="/" 
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition-all"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
              </Link>
              <Logo />
              <span className="text-lg font-semibold text-gray-800 dark:text-white">
                Área de Desenho
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 transition-all"
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-700" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Drawing Canvas */}
      <div className="h-[calc(100vh-8rem)]">
        <DrawingCanvas isDarkMode={isDarkMode} />
      </div>

      {/* Footer */}
      <footer className="bg-white/5 dark:bg-black/20 backdrop-blur-md border-t border-white/10 py-4 z-10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Desenvolvido por <span className="font-semibold">Renan Dias</span> - 
              Material didático Técnico em Desenvolvimento de Sistemas
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
