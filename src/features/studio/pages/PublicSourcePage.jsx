import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Code2, Download, File, Loader2 } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { FileTreeNodes } from './CompilerPage';
import {
  downloadPublicProjectSource,
  fetchPublicFileContent,
  fetchPublicFileTree,
  fetchPublicProject,
} from '../services/studioService';

export default function PublicSourcePage() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [tree, setTree] = useState(null);
  const [activeFilePath, setActiveFilePath] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([fetchPublicProject(projectId), fetchPublicFileTree(projectId)])
      .then(([projectData, treeData]) => {
        if (!active) return;
        setProject(projectData.project);
        setTree(treeData.tree);
      })
      .catch(() => active && setProject(false))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [projectId]);

  const openFile = useCallback(async (filePath) => {
    setActiveFilePath(filePath);
    setContent('加载中…');
    try {
      const data = await fetchPublicFileContent(projectId, filePath);
      setContent(data.content);
    } catch {
      setContent('文件加载失败或已不再公开。');
    }
  }, [projectId]);

  const nodes = useMemo(() => tree?.children || [], [tree]);
  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-primary" /></div>;
  if (!project) return <div className="flex h-screen items-center justify-center text-sm font-bold text-slate-500">该项目不存在或未公开源码。</div>;

  return (
    <div className="flex h-screen flex-col bg-slate-50">
      <header className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white"><Code2 className="h-5 w-5" /></div>
          <div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Open source project</p><h1 className="truncate text-base font-black text-slate-950">{project.name}</h1></div>
        </div>
        <button type="button" onClick={() => downloadPublicProjectSource(project.id, project.name)} className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:text-primary"><Download className="h-4 w-4" /> 下载源码</button>
      </header>
      <div className="flex min-h-0 flex-1">
        <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white"><div className="border-b border-slate-100 px-4 py-3 text-xs font-bold uppercase tracking-widest text-slate-400">Source files</div><div className="min-h-0 flex-1 overflow-auto p-2"><FileTreeNodes nodes={nodes} depth={0} activePath={activeFilePath} onOpenFile={openFile} /></div></aside>
        <main className="flex min-w-0 flex-1 flex-col bg-white"><div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3 text-sm font-bold text-slate-700"><File className="h-4 w-4 text-slate-400" />{activeFilePath || '选择一个文件查看源码'}</div><pre className="min-h-0 flex-1 overflow-auto bg-slate-950 p-5 text-[13px] leading-6 text-slate-100"><code>{content || '从左侧文件树选择一个文本文件。'}</code></pre></main>
      </div>
    </div>
  );
}
