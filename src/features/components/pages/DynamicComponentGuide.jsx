import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    FileCode,
    ArrowLeft, Boxes, Layout
} from 'lucide-react';
import { Link } from 'react-router-dom';
import ComponentService from '../services/componentService';
import CodeBlock from '@/components/common/CodeBlock';

const FeatureCard = ({ title, desc, icon: Icon, color }) => (
    <div className="p-8 rounded-[2.5rem] bg-canvas  border border-border  shadow-sm hover:shadow-xl transition-all group hover:-translate-y-1">
        <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
            <Icon className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-lg font-black text-ink  mb-2">{title}</h3>
        <p className="text-body text-ink-muted  leading-relaxed">{desc}</p>
    </div>
);

const DynamicComponentGuide = ({ componentId, initialData }) => {
    const { t, i18n } = useTranslation();
    const [data, setData] = useState(initialData || null);
    const [loading, setLoading] = useState(!initialData);

    // 解析多文件逻辑
    const parseLibraryFiles = (rawCode) => {
        if (!rawCode) return [];
        const fileMarkerRegex = /\/\* === FILE: (.*?) === \*\//g;
        const files = [];
        let lastMatch;
        let lastIndex = 0;

        while ((lastMatch = fileMarkerRegex.exec(rawCode)) !== null) {
            if (files.length > 0) {
                files[files.length - 1].content = rawCode.slice(lastIndex, lastMatch.index).trim();
            }
            files.push({ name: lastMatch[1], content: '' });
            lastIndex = fileMarkerRegex.lastIndex;
        }

        if (files.length > 0) {
            files[files.length - 1].content = rawCode.slice(lastIndex).trim();
            return files;
        }

        // 如果没有标记，返回单一文件
        return [{ name: 'Implementation.jsx', content: rawCode }];
    };

    useEffect(() => {
        if (initialData && String(initialData.id) === String(componentId)) {
            return;
        }

        const controller = new AbortController();

        const fetchDetail = async () => {
            try {
                const res = await ComponentService.getComponentDetail(
                    componentId,
                    i18n.language,
                    { signal: controller.signal }
                );
                setData(res);
            } catch (err) {
                if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') return;
                console.error("加载组件详情失败", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();

        return () => controller.abort();
    }, [componentId, i18n.language, initialData]);

    if (loading) return <div className="p-20 text-center text-ink-faint animate-pulse">{t('components.guide.parsingArchitecture')}</div>;
    if (!data) return <div className="p-20 text-center text-danger">{t('components.guide.loadFailed')}</div>;

    const libraryFiles = parseLibraryFiles(data.libraryCode);

    return (
        <div className="min-h-screen bg-surface/50  pb-32">
            {/* 渐变装饰背景 */}
            <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-accent/5 to-transparent pointer-events-none" />

            <div className="max-w-6xl mx-auto pt-12 px-6 relative z-10">
                {/* Navigation */}
                <Link to={`/components/${componentId}`} className="inline-flex items-center text-micro font-black uppercase tracking-widest text-ink-faint hover:text-accent mb-12 transition-all group">
                    <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center mr-3 group-hover:border-accent/30 group-hover:bg-accent/5">
                        <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                    </div>
                    {t('common.backToComponents', 'Back to Showcase')}
                </Link>

                {/* Header Section */}
                <div className="mb-20">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="px-3 py-1 bg-accent text-white text-micro font-black rounded-lg uppercase tracking-wider">
                            Source Analysis
                        </div>
                        <div className="h-px flex-1 bg-border " />
                        <div className="text-micro font-black text-ink-faint uppercase tracking-widest">
                            v{data.version || '1.0.0'}
                        </div>
                    </div>

                    <h1 className="text-5xl md:text-6xl font-black text-ink  mb-8 tracking-tighter italic uppercase">
                        {data.title} <span className="text-accent">Structure</span>
                    </h1>

                    <p className="text-xl text-ink-muted  max-w-3xl leading-relaxed font-medium">
                        {data.desc || t('components.guide.defaultDesc')}
                    </p>
                </div>

                {/* Implementation Layers */}
                <div className="space-y-24">
                    {/* Layer 1: Implementation */}
                    <section>
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent shadow-inner">
                                <Boxes className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-ink  uppercase italic tracking-tighter">Implementation Layers</h2>
                                <p className="text-body text-ink-muted font-bold uppercase tracking-widest">Modular Logic Files</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-8">
                            {libraryFiles.map((file, idx) => (
                                <CodeBlock
                                    key={idx}
                                    code={file.content}
                                    language="jsx"
                                />
                            ))}
                        </div>
                    </section>

                    {/* Layer 2: Wrapper — leave violet as layer accent */}
                    {data.wrapperCode && (
                        <section>
                            <div className="flex items-center gap-4 mb-10">
                                <div className="w-12 h-12 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-500 shadow-inner">
                                    <Layout className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-ink  uppercase italic tracking-tighter">Environment Wrapper</h2>
                                    <p className="text-body text-ink-muted font-bold uppercase tracking-widest">wrapper_code.jsx</p>
                                </div>
                            </div>

                            <CodeBlock
                                code={data.wrapperCode}
                                language="jsx"
                            />
                        </section>
                    )}

                    {/* Layer 3: Styles — leave emerald as layer accent */}
                    {data.cssCode && (
                        <section>
                            <div className="flex items-center gap-4 mb-10">
                                <div className="w-12 h-12 rounded-2xl bg-success/10 flex items-center justify-center text-success shadow-inner">
                                    <FileCode className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-ink  uppercase italic tracking-tighter">Styling Specification</h2>
                                    <p className="text-body text-ink-muted font-bold uppercase tracking-widest">custom_styles.css</p>
                                </div>
                            </div>

                            <CodeBlock
                                code={data.cssCode}
                                language="css"
                            />
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DynamicComponentGuide;
