/**
 * Studio landing page.
 *
 * @module features/studio/pages/StudioPage
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Boxes,
  ChevronRight,
  Code2,
  FileArchive,
  FolderKanban,
  Sparkles,
  TerminalSquare,
} from 'lucide-react';
import {
  fetchProjects,
  getStatusColor,
  getStatusLabel,
} from '../services/studioService';

const entryCards = [
  {
    to: '/workspace/studio/project',
    title: '项目 zip 上传',
    eyebrow: 'Project Package',
    description: '上传完整前端项目包，适合已有工程、模板项目和需要保留目录结构的代码。',
    icon: FileArchive,
    accent: 'bg-accent text-white shadow-accent/20',
    meta: ['zip', 'package.json', '自动构建'],
  },
  {
    to: '/workspace/studio/component',
    title: '组件上传 / 新建',
    eyebrow: 'Component Sandbox',
    description: '上传或新建组件文件，支持 tsx、jsx、js、vue 等格式，适合快速验证片段。',
    icon: Code2,
    accent: 'bg-ink text-white shadow-ink/15',
    meta: ['tsx', 'jsx', 'vue', '在线粘贴'],
  },
];

export default function StudioPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);

  const loadProjects = useCallback(async () => {
    try {
      const data = await fetchProjects();
      setProjects(data.projects || []);
    } catch {
      setProjects([]);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  return (
    <div className="min-h-full bg-surface">
      <section className="border-b border-border bg-canvas">
        <div className="mx-auto grid max-w-[1600px] gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
          <div className="flex min-w-0 flex-col justify-center">
            <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-accent/5 px-3 py-1 text-micro font-bold uppercase tracking-widest text-accent">
              <FolderKanban className="h-3.5 w-3.5" />
              Xander Lab Studio
            </div>
            <h1 className="max-w-3xl text-3xl font-black text-ink sm:text-4xl">
              选择入口，进入构建工作流
            </h1>
            <p className="mt-3 max-w-2xl text-body leading-6 text-ink-muted">
              Studio 主页面只负责分流：完整项目走 zip 上传，独立组件走组件上传或在线新建。构建后统一进入编译器查看文件、运行预览。
            </p>
          </div>

          <div className="grid gap-3 rounded-lg border border-border bg-surface p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-canvas text-accent shadow-sm">
                <TerminalSquare className="h-5 w-5" />
              </div>
              <div>
                <p className="text-body font-bold text-ink">统一输出到编译器</p>
                <p className="text-caption text-ink-muted">文件树、源码查看、构建运行、弹窗预览</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-caption font-semibold text-ink-muted">
              <span className="rounded-lg bg-canvas px-2 py-2">上传</span>
              <span className="rounded-lg bg-canvas px-2 py-2">构建</span>
              <span className="rounded-lg bg-canvas px-2 py-2">预览</span>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto grid max-w-[1600px] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
        <section className="grid gap-4 md:grid-cols-2">
          {entryCards.map((entry) => {
            const Icon = entry.icon;

            return (
              <Link
                key={entry.to}
                to={entry.to}
                className="group flex min-h-[300px] flex-col justify-between rounded-lg border border-border bg-canvas p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-xl hover:shadow-border/70"
              >
                <div>
                  <div className="mb-6 flex items-start justify-between gap-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-lg shadow-lg ${entry.accent}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <ArrowRight className="h-5 w-5 text-ink-faint transition-transform group-hover:translate-x-1 group-hover:text-accent" />
                  </div>
                  <p className="text-micro font-bold uppercase tracking-widest text-accent">
                    {entry.eyebrow}
                  </p>
                  <h2 className="mt-2 text-2xl font-black text-ink">
                    {entry.title}
                  </h2>
                  <p className="mt-3 text-body leading-6 text-ink-muted">
                    {entry.description}
                  </p>
                </div>

                <div className="mt-8 flex flex-wrap gap-2">
                  {entry.meta.map((item) => (
                    <span
                      key={item}
                      className="rounded-full border border-border bg-surface px-3 py-1 text-caption font-bold text-ink-muted"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </Link>
            );
          })}
        </section>

        <aside className="rounded-lg border border-border bg-canvas p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-micro font-bold uppercase tracking-widest text-ink-faint">
                Recent Projects
              </p>
              <h2 className="mt-1 text-lg font-bold text-ink">最近项目</h2>
            </div>
            <Boxes className="h-5 w-5 text-ink-faint" />
          </div>

          {projects.length > 0 ? (
            <div className="grid gap-2">
              {projects.slice(0, 6).map((project) => (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => navigate(`/workspace/studio/compiler/${project.id}`)}
                  className="group flex w-full items-center justify-between gap-3 rounded-lg border border-border bg-canvas px-3 py-3 text-left transition-colors hover:border-accent/30 hover:bg-accent/5"
                >
                  <div className="min-w-0">
                    <p className="truncate text-body font-bold text-ink-secondary">
                      {project.name}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className={`rounded-full border px-2 py-0.5 text-micro font-bold ${getStatusColor(project.status)}`}>
                        {getStatusLabel(project.status)}
                      </span>
                      <span className="truncate text-micro text-ink-faint">
                        {project.framework || '未知框架'}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-ink-faint group-hover:text-accent" />
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border bg-surface px-4 py-8 text-center">
              <Sparkles className="mx-auto mb-3 h-6 w-6 text-ink-faint" />
              <p className="text-body font-semibold text-ink-muted">暂无项目</p>
              <p className="mt-1 text-caption text-ink-faint">从左侧任一入口开始创建</p>
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}
