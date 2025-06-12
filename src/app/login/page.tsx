'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState, useSignInWithGoogle } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import Image from 'next/image';
import { Search } from 'lucide-react';

export default function LoginPage() {
  const [signInWithGoogle, , loading] = useSignInWithGoogle(auth);
  const [user, authLoading] = useAuthState(auth);
  const [projectCode, setProjectCode] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (user && !authLoading) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const handleGoogleLogin = async () => {
    await signInWithGoogle();
  };

  const handleProjectAccess = () => {
    if (projectCode.trim()) {
      router.push(`/project/${projectCode.trim()}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 mb-4">
            <Image
              src="/logo.png"
              alt="ctrlC"
              width={64}
              height={64}
              className="mx-auto"
            />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">ctrlC</h1>
          <p className="text-gray-300">Collaborative Design & Diagramming</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-8 shadow-2xl">
          {/* Quick Access */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Acessar projeto existente
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Digite o código do projeto"
                  value={projectCode}
                  onChange={(e) => setProjectCode(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleProjectAccess()}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleProjectAccess}
                disabled={!projectCode.trim()}
                className="px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
              >
                Acessar
              </button>
            </div>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-transparent text-gray-400">ou</span>
            </div>
          </div>

          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-gray-50 text-gray-900 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {loading ? 'Entrando...' : 'Entrar com Google'}
          </button>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Ao continuar, você concorda com nossos{' '}
              <a href="#" className="text-blue-400 hover:text-blue-300">
                Termos de Uso
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-400">
          <p>Desenvolvido por <span className="text-white font-medium">Renan Dias</span></p>
          <p>Material didático - Téc. Desenvolvimento de Sistemas</p>
        </div>
      </div>
    </div>
  );
}
