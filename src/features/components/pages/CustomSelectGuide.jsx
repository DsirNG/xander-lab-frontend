import React from 'react';
import { useTranslation } from 'react-i18next';
import { FileCode, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import CodeBlock from '@/components/common/CodeBlock';

// Import raw code
import ComponentCode from '@/components/common/CustomSelect/index.jsx?raw';
import StyleCode from '@/components/common/CustomSelect/index.module.css?raw';

const DependencyCard = ({ title, items }) => (
    <div className="p-6 rounded-2xl bg-white  border border-slate-200 ">
        <div className="text-sm uppercase tracking-wider text-slate-500 font-bold mb-4">{title}</div>
        <div className="flex flex-wrap gap-2">
            {items.map((item, i) => (
                <span key={i} className="px-3 py-1 rounded-full bg-slate-100  text-slate-700  text-xs font-mono border border-slate-200">
                    {item}
                </span>
            ))}
        </div>
    </div>
);

const CustomSelectGuide = ({ componentId }) => {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-slate-50  pb-20">
            <div className="max-w-6xl mx-auto pt-10 px-6">
                {/* Navigation */}
                <Link to={`/components/${componentId}`} className="inline-flex items-center text-micro font-black uppercase tracking-widest text-ink-faint hover:text-accent mb-8 transition-all group">
                    <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center mr-3 group-hover:border-accent/30 group-hover:bg-accent/5">
                        <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
                    </div>
                    {t('common.backToComponents')}
                </Link>

                {/* Header */}
                <div className="mb-12">
                    <div className="text-4xl font-black text-slate-900  mb-4">
                        CustomSelect
                        <span className="ml-4 text-lg font-normal text-slate-500 ">{t('common.componentSource')}</span>
                    </div>
                    <div className="text-lg text-slate-600  max-w-3xl leading-relaxed">
                        {t('components.customSelect.desc')}
                    </div>
                </div>

                {/* Dependencies & Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <DependencyCard
                        title="React Hooks"
                        items={['useState', 'useEffect', 'useRef', 'useCallback']}
                    />
                    <DependencyCard
                        title="External Libs"
                        items={['lucide-react', 'prop-types']}
                    />
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20">
                        <div className="text-sm uppercase tracking-wider text-emerald-600 font-bold mb-4 flex items-center">
                            <Layers className="w-4 h-4 mr-2" />
                            {t('common.coreFeatures')}
                        </div>
                        <ul className="space-y-2">
                            {t('components.customSelect.featureList', { returnObjects: true })?.map((feat, i) => (
                                <li key={i} className="flex items-center text-xs font-bold text-slate-700 ">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2" />
                                    {feat}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Source Code Section */}
                <div className="space-y-12">
                    <div>
                        <div className="flex items-end justify-between mb-4 px-2">
                            <div>
                                <div className="text-2xl font-bold text-slate-900  mb-2">{t('common.logicLayer')}</div>
                                <div className="text-slate-500  text-sm">{t('common.logicLayerDesc')}</div>
                            </div>
                            <span className="text-xs font-mono text-slate-400">src/.../CustomSelect/index.jsx</span>
                        </div>
                        <CodeBlock
                            code={ComponentCode}
                            language="javascript"
                        />
                    </div>

                    <div>
                        <div className="flex items-end justify-between mb-4 px-2">
                            <div>
                                <div className="text-2xl font-bold text-slate-900  mb-2">{t('common.styleLayer')}</div>
                                <div className="text-slate-500  text-sm">{t('common.styleLayerDesc')}</div>
                            </div>
                            <span className="text-xs font-mono text-slate-400">src/.../CustomSelect/index.module.css</span>
                        </div>
                        <CodeBlock
                            code={StyleCode}
                            language="css"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CustomSelectGuide;
