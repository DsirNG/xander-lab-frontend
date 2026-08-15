import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Download, File, Loader2 } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { FileTreeNodes } from './CompilerPage';
import Button from '@components/common/Button';
import StudioTopBar from '../components/StudioTopBar';
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
  if (loading) return <div className="flex h-dvh items-center justify-center"><Loader2 className="h-7 w-7 animate-spin text-accent" /></div>;
  if (!project) return <div className="flex h-dvh items-center justify-center text-body font-bold text-ink-muted">该项目不存在或未公开源码。</div>;

  return (
    <div className="flex h-dvh flex-col bg-surface">
      <StudioTopBar
        showBack={false}
        fallbackTo="/"
        title={
          <div className="min-w-0">
            <div className="text-micro font-bold uppercase tracking-widest text-ink-faint">Open source project</div>
            <div className="truncate text-base font-black text-ink">{project.name}</div>
          </div>
        }
      >
          <Button type="button" onClick={() => downloadPublicProjectSource(project.id, project.name)} variant="outline" size="sm" icon={Download} className="shrink-0 font-bold">下载源码</Button>
      </StudioTopBar>
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <aside className="flex max-h-[40vh] w-full shrink-0 flex-col border-b border-border bg-canvas lg:max-h-none lg:w-64 lg:border-b-0 lg:border-r"><div className="border-b border-border px-4 py-3 text-caption font-bold uppercase tracking-widest text-ink-faint">Source files</div><div className="min-h-0 flex-1 overflow-auto p-2"><FileTreeNodes nodes={nodes} depth={0} activePath={activeFilePath} onOpenFile={openFile} /></div></aside>
        <main className="flex min-w-0 flex-1 flex-col bg-canvas"><div className="flex items-center gap-2 border-b border-border px-4 py-3 text-body font-bold text-ink-secondary"><File className="h-4 w-4 text-ink-faint" />{activeFilePath || '选择一个文件查看源码'}</div><pre className="min-h-0 flex-1 overflow-auto bg-ink p-5 text-body leading-6 text-surface"><code>{content || '从左侧文件树选择一个文本文件。'}</code></pre></main>
      </div>
    </div>
  );
}
