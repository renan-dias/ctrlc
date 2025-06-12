'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '@/lib/firebase';
import FigmaCanvas from '@/components/FigmaCanvas';
import DrawingCanvasNew from '@/components/DrawingCanvasNew';
import { 
  Share2, 
  Users, 
  Settings, 
  Save,
  ArrowLeft,
  Copy,
  Check
} from 'lucide-react';
import Image from 'next/image';
import { doc, getDoc } from 'firebase/firestore';

interface ProjectData {
  id: string;
  name: string;
  code: string;
  owner: string;
  type: 'figma' | 'canvas';
  collaborators: string[];
  lastModified: Date;
}

export default function ProjectPage() {
  const [user, loading] = useAuthState(auth);
  const [project, setProject] = useState<ProjectData | null>(null);
  const [projectName, setProjectName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const projectCode = params.code as string;
  const isNewProject = searchParams.get('new') === 'true';

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (projectCode) {
      const fetchProject = async () => {
        const ref = doc(db, 'projects', projectCode);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data() as ProjectData;
          setProject(data);
          setProjectName(data.name);
        } else if (isNewProject) {
          // Projeto novo (criado agora)
          const newProject: ProjectData = {
            id: projectCode,
            name: 'Projeto Sem Nome',
            code: projectCode,
            owner: user?.uid || '',
            type: 'figma',
            collaborators: [],
            lastModified: new Date()
          };
          setProject(newProject);
          setProjectName(newProject.name);
          setIsEditingName(true);
        } else {
          setProject(null);
        }
      };
      fetchProject();
    }
  }, [projectCode, isNewProject, user, loading, router]);

  const handleSave = async () => {
    setIsSaving(true);
    // Implementar salvamento no Firebase
    setTimeout(() => {
      setIsSaving(false);
    }, 1000);
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/public/${projectCode}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNameChange = () => {
    if (project) {
      setProject({ ...project, name: projectName });
    }
    setIsEditingName(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white">Projeto não encontrado</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="ctrlC"
                width={24}
                height={24}
              />
              
              {isEditingName ? (
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  onBlur={handleNameChange}
                  onKeyPress={(e) => e.key === 'Enter' && handleNameChange()}
                  className="bg-slate-700 text-white px-2 py-1 rounded text-lg font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              ) : (
                <h1
                  className="text-lg font-medium text-white cursor-pointer hover:text-blue-300"
                  onClick={() => setIsEditingName(true)}
                >
                  {project.name}
                </h1>
              )}
              
              <div className="flex items-center gap-2 px-3 py-1 bg-slate-700 rounded-lg">
                <span className="text-sm font-mono text-gray-300">{projectCode}</span>
                <button
                  onClick={handleShare}
                  className="p-1 text-gray-400 hover:text-white transition-colors"
                  title="Copiar link"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Salvando...' : 'Salvar'}
            </button>
            
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <Users className="w-5 h-5" />
            </button>
            
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Compartilhar
            </button>
            
            <button className="p-2 text-gray-400 hover:text-white transition-colors">
              <Settings className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 ml-4">
              <Image
                src={user?.photoURL || '/logo.png'}
                alt="Avatar"
                width={32}
                height={32}
                className="rounded-full"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Canvas Area */}
      <div className="flex-1">
        {project?.type === 'canvas' ? (
          <DrawingCanvasNew isDarkMode={false} />
        ) : (
          <FigmaCanvas projectCode={projectCode} />
        )}
      </div>
    </div>
  );
}
