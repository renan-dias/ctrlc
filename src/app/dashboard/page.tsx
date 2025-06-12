'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { 
  Plus, 
  Search, 
  FolderOpen, 
  Clock, 
  Users, 
  MoreVertical, 
  LogOut,
  Settings,
  Star,
} from 'lucide-react';
import Image from 'next/image';

interface Project {
  id: string;
  name: string;
  code: string;
  lastModified: Date;
  thumbnail?: string;
  isStarred?: boolean;
  collaborators?: number;
}

export default function DashboardPage() {
  const [user, loading] = useAuthState(auth);
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    // Mock projects - substituir por dados do Firebase
    setProjects([
      {
        id: '1',
        name: 'Sistema de E-commerce',
        code: 'EC2024',
        lastModified: new Date(Date.now() - 86400000),
        isStarred: true,
        collaborators: 3
      },
      {
        id: '2',
        name: 'App Mobile - UML',
        code: 'MOB001',
        lastModified: new Date(Date.now() - 172800000),
        collaborators: 1
      },
      {
        id: '3',
        name: 'Dashboard Analytics',
        code: 'DASH01',
        lastModified: new Date(Date.now() - 259200000),
        isStarred: false,
        collaborators: 5
      }
    ]);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const createNewProject = () => {
    const code = generateProjectCode();
    router.push(`/project/${code}?new=true`);
  };

  const generateProjectCode = () => {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `${diffDays} dias atrás`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Image
                  src="/logo.png"
                  alt="ctrlC"
                  width={32}
                  height={32}
                />
                <h1 className="text-xl font-bold text-white">ctrlC</h1>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-300 hover:text-white transition-colors">
                <Settings className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-medium text-white">
                    {user?.displayName}
                  </div>
                  <div className="text-xs text-gray-400">
                    {user?.email}
                  </div>
                </div>
                <Image
                  src={user?.photoURL || '/logo.png'}
                  alt="Avatar"
                  width={32}
                  height={32}
                  className="rounded-full"
                />
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-300 hover:text-white transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Top Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Bem-vindo de volta, {user?.displayName?.split(' ')[0]}!
            </h2>
            <p className="text-gray-300">
              Gerencie seus projetos de design e diagramação
            </p>
          </div>
          <button
            onClick={createNewProject}
            className="flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            Novo Projeto
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar projetos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg transition-colors">
              Recentes
            </button>
            <button className="px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-lg transition-colors">
              Favoritos
            </button>
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">
              {searchTerm ? 'Nenhum projeto encontrado' : 'Nenhum projeto ainda'}
            </h3>
            <p className="text-gray-400 mb-6">
              {searchTerm 
                ? 'Tente buscar com outros termos'
                : 'Crie seu primeiro projeto para começar'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={createNewProject}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                <Plus className="w-5 h-5" />
                Criar Primeiro Projeto
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="group bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 overflow-hidden hover:bg-white/15 transition-all cursor-pointer"
                onClick={() => router.push(`/project/${project.code}`)}
              >
                {/* Thumbnail */}
                <div className="aspect-video bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                  {project.thumbnail ? (
                    <Image
                      src={project.thumbnail}
                      alt={project.name}
                      width={300}
                      height={200}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FolderOpen className="w-12 h-12 text-white/50" />
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-white group-hover:text-blue-300 transition-colors truncate">
                      {project.name}
                    </h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Toggle star
                      }}
                      className="p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Star 
                        className={`w-4 h-4 ${
                          project.isStarred 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-gray-400 hover:text-yellow-400'
                        }`} 
                      />
                    </button>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                    <span className="font-mono bg-white/10 px-2 py-1 rounded text-xs">
                      {project.code}
                    </span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(project.lastModified)}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1 text-sm text-gray-400">
                      <Users className="w-4 h-4" />
                      {project.collaborators || 1}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Show menu
                      }}
                      className="p-1 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-white"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
