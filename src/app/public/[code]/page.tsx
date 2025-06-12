// Página pública de visualização/edição de projeto
'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import FigmaCanvas from '@/components/FigmaCanvas';
import DrawingCanvasNew from '@/components/DrawingCanvasNew';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Image from 'next/image';

interface ProjectData {
  id: string;
  name: string;
  code: string;
  owner: string;
  type: 'figma' | 'canvas';
  lastModified: any;
}

export default function PublicProjectPage() {
  const params = useParams();
  const projectCode = params.code as string;
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      const q = query(collection(db, 'projects'), where('code', '==', projectCode));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const doc = snap.docs[0];
        setProject({ id: doc.id, ...doc.data() } as ProjectData);
      } else {
        setProject(null);
      }
      setLoading(false);
    };
    if (projectCode) fetchProject();
  }, [projectCode]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">Carregando...</div>;
  }
  if (!project) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">Projeto não encontrado</div>;
  }

  return (
    <div className="h-screen bg-slate-900 flex flex-col">
      <header className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center gap-4">
        <Image src="/logo.png" alt="ctrlC" width={24} height={24} />
        <span className="text-lg font-medium text-white">{project.name}</span>
        <span className="text-xs font-mono bg-slate-700 text-gray-300 px-2 py-1 rounded">{project.code}</span>
        <span className="ml-auto text-xs text-gray-400">Público</span>
      </header>
      <div className="flex-1">
        {project.type === 'canvas' ? (
          <DrawingCanvasNew isDarkMode={false} />
        ) : (
          <FigmaCanvas projectCode={project.code} />
        )}
      </div>
    </div>
  );
}
