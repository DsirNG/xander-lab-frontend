/**
 * Studio landing page.
 *
 * @module features/studio/pages/StudioPage
 */

import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    ArrowRight,
    Boxes,
    ChevronRight,
    Code2,
    FileArchive,
    FolderKanban,
    Sparkles,
} from "lucide-react";
import useBack from "@/hooks/useBack";
import {
    fetchProjects,
    getStatusColor,
    getStatusLabel,
} from "../services/studioService";

const entryCards = [
    {
        to: "/workspace/studio/project",
        title: "项目 zip 上传",
        eyebrow: "Project Package",
        description:
            "上传完整前端项目包，适合已有工程、模板项目和需要保留目录结构的代码。",
        icon: FileArchive,
        accent: "bg-accent text-white shadow-accent/20",
        meta: ["zip", "package.json", "自动构建"],
    },
    {
        to: "/workspace/studio/component",
        title: "组件上传 / 新建",
        eyebrow: "Component Sandbox",
        description:
            "上传或新建组件文件，支持 tsx、jsx、js、vue 等格式，适合快速验证片段。",
        icon: Code2,
        accent: "bg-ink text-white shadow-ink/15",
        meta: ["tsx", "jsx", "vue", "在线粘贴"],
    },
];

export default function StudioPage() {
    const navigate = useNavigate();
    const backToWorkspace = useBack("/workspace");
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
        <div className="mx-auto flex h-full min-h-0 w-full min-w-0 max-w-5xl flex-col overflow-y-auto overscroll-contain px-4 py-6 px-ultra-tight sm:px-6 lg:px-8">
            <header className="mb-6">
                <button
                    type="button"
                    onClick={backToWorkspace}
                    title="返回上一页"
                    aria-label="返回上一页"
                    className="mb-3 inline-flex items-center gap-2 rounded-full bg-accent/5 px-3 py-1 text-micro font-bold uppercase tracking-widest text-accent transition-colors hover:bg-accent/10"
                >
                    <img
                        src="/logo-512.png"
                        alt="DinQorAI"
                        className="h-5 w-5 rounded object-cover"
                    />
                    <FolderKanban className="h-3.5 w-3.5" />
                    DinQorAI Studio
                </button>
                <div className="text-xl font-black text-ink sm:text-2xl">
                    选择入口，进入构建工作流
                </div>
                <div className="mt-2 max-w-2xl text-body leading-6 text-ink-muted">
                    Studio 主页面只负责分流：完整项目走 zip
                    上传，独立组件走组件上传或在线新建。构建后统一进入编译器查看文件、运行预览。
                </div>
            </header>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {entryCards.map((entry) => {
                    const Icon = entry.icon;

                    return (
                        <Link
                            key={entry.to}
                            to={entry.to}
                            className="group flex min-h-[240px] flex-col justify-between rounded-2xl border border-border bg-surface p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-xl hover:shadow-border/70"
                        >
                            <div>
                                <div className="mb-5 flex items-start justify-between gap-4">
                                    <div
                                        className={`flex h-11 w-11 items-center justify-center rounded-xl shadow-lg ${entry.accent}`}
                                    >
                                        <Icon className="h-5 w-5" />
                                    </div>
                                    <ArrowRight className="h-5 w-5 text-ink-faint transition-transform group-hover:translate-x-1 group-hover:text-accent" />
                                </div>
                                <div className="text-micro font-bold uppercase tracking-widest text-accent">
                                    {entry.eyebrow}
                                </div>
                                <div className="mt-2 text-xl font-black text-ink">
                                    {entry.title}
                                </div>
                                <div className="mt-3 text-body leading-6 text-ink-muted">
                                    {entry.description}
                                </div>
                            </div>

                            <div className="mt-6 flex flex-wrap gap-2">
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
            </div>

            <section className="mt-6 rounded-2xl border border-border bg-surface p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <div className="text-micro font-bold uppercase tracking-widest text-ink-faint">
                            Recent Projects
                        </div>
                        <div className="mt-1 text-lg font-bold text-ink">
                            最近项目
                        </div>
                    </div>
                    <Boxes className="h-5 w-5 text-ink-faint" />
                </div>

                {projects.length > 0 ? (
                    <div className="grid gap-2">
                        {projects.slice(0, 6).map((project) => (
                            <button
                                key={project.id}
                                type="button"
                                onClick={() =>
                                    navigate(
                                        `/workspace/studio/compiler/${project.id}`,
                                    )
                                }
                                className="group flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-canvas px-3 py-3 text-left transition-colors hover:border-accent/30 hover:bg-accent/5"
                            >
                                <div className="min-w-0">
                                    <div className="truncate text-body font-bold text-ink-secondary">
                                        {project.name}
                                    </div>
                                    <div className="mt-1 flex items-center gap-2">
                                        <span
                                            className={`rounded-full border px-2 py-0.5 text-micro font-bold ${getStatusColor(project.status)}`}
                                        >
                                            {getStatusLabel(project.status)}
                                        </span>
                                        <span className="truncate text-micro text-ink-faint">
                                            {project.framework || "未知框架"}
                                        </span>
                                    </div>
                                </div>
                                <ChevronRight className="h-4 w-4 shrink-0 text-ink-faint group-hover:text-accent" />
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-xl border border-dashed border-border bg-canvas px-4 py-8 text-center">
                        <Sparkles className="mx-auto mb-3 h-6 w-6 text-ink-faint" />
                        <div className="text-body font-semibold text-ink-muted">
                            暂无项目
                        </div>
                        <div className="mt-1 text-caption text-ink-faint">
                            从左侧任一入口开始创建
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}
