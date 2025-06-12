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
  LogOut,
  Settings
} from 'lucide-react';
import Image from 'next/image';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';

interface Project {
  id: string;
  name: string;
  code: string;
  owner: string;
  type: 'figma' | 'canvas';
  lastModified?: Date;
  createdAt?: Date;
  thumbnail?: string;
  isStarred?: boolean;
  collaborators?: number;
}

export default function DashboardPage() {
  const [user, loading] = useAuthState(auth);
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [creating, setCreating] = useState(false);
  const [newProjectType, setNewProjectType] = useState<'figma' | 'canvas'>('figma');
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const router = useRouter();

  // Buscar projetos do usuário logado
  useEffect(() => {
    if (!loading && user) {
      const fetchProjects = async () => {
        const q = query(collection(db, 'projects'), where('owner', '==', user.uid));
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Project[];
        setProjects(data);
      };
      fetchProjects();
    }
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Criar novo projeto
  const createNewProject = async () => {
    if (!user) return;
    setCreating(true);
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    await addDoc(collection(db, 'projects'), {
      name: 'Projeto Sem Nome',
      code,
      owner: user.uid,
      type: newProjectType,
      createdAt: serverTimestamp(),
      lastModified: serverTimestamp(),
    });
    setCreating(false);
    router.push(`/project/${code}?new=true`);
  };

  // Apagar projeto
  const deleteProject = async (id: string) => {
    await deleteDoc(doc(db, 'projects', id));
    setProjects(projects.filter(p => p.id !== id));
  };

  // Duplicar projeto
  const duplicateProject = async (project: Project) => {
    if (!user) return;
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    await addDoc(collection(db, 'projects'), {
      ...project,
      id: undefined,
      code,
      name: `${project.name} (Cópia)`,
      createdAt: serverTimestamp(),
      lastModified: serverTimestamp(),
    });
  };

  // Renomear projeto
  const renameProject = async (id: string, name: string) => {
    await updateDoc(doc(db, 'projects', id), { name, lastModified: serverTimestamp() });
    setProjects(projects.map(p => p.id === id ? { ...p, name } : p));
    setRenamingId(null);
    setRenameValue('');
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

        {/* Modal de novo projeto */}
        {creating && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 w-full max-w-xs flex flex-col gap-4">
              <h2 className="text-lg font-bold mb-2">Novo Projeto</h2>
              <label className="flex items-center gap-2">
                <input type="radio" checked={newProjectType === 'figma'} onChange={() => setNewProjectType('figma')} />
                Figma (vetorial)
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" checked={newProjectType === 'canvas'} onChange={() => setNewProjectType('canvas')} />
                Canvas (livre)
              </label>
              <button onClick={createNewProject} className="bg-blue-600 text-white rounded-lg py-2 font-medium mt-4">Criar</button>
              <button onClick={() => setCreating(false)} className="text-gray-500 mt-2">Cancelar</button>
            </div>
          </div>
        )}

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
                className="group bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 overflow-hidden hover:bg-white/15 transition-all cursor-pointer relative"
              >
                <div className="p-4" onClick={() => router.push(`/project/${project.code}`)}>
                  <div className="flex items-center gap-2 mb-2">
                    <Image src="/logo.png" alt="thumb" width={32} height={32} className="rounded" />
                    {renamingId === project.id ? (
                      <input
                        value={renameValue}
                        onChange={e => setRenameValue(e.target.value)}
                        onBlur={() => renameProject(project.id, renameValue)}
                        onKeyDown={e => e.key === 'Enter' && renameProject(project.id, renameValue)}
                        className="bg-white/20 border border-white/30 rounded px-2 py-1 text-white"
                        autoFocus
                      />
                    ) : (
                      <span className="font-bold text-white group-hover:text-blue-300 transition-colors truncate">
                        {project.name}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-300 mb-1">Código: <span className="font-mono">{project.code}</span></div>
                  <div className="text-xs text-gray-400">Tipo: {project.type === 'figma' ? 'Figma' : 'Canvas'}</div>
                </div>
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={e => { e.stopPropagation(); setRenamingId(project.id); setRenameValue(project.name); }} title="Renomear" className="p-1 bg-white/20 rounded hover:bg-blue-500 text-white text-xs">✏️</button>
                  <button onClick={e => { e.stopPropagation(); duplicateProject(project); }} title="Duplicar" className="p-1 bg-white/20 rounded hover:bg-green-500 text-white text-xs">⧉</button>
                  <button onClick={e => { e.stopPropagation(); deleteProject(project.id); }} title="Apagar" className="p-1 bg-white/20 rounded hover:bg-red-500 text-white text-xs">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
