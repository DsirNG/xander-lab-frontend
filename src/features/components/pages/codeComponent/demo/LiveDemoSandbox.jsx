import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import * as Babel from '@babel/standalone';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Play, RefreshCw, AlertTriangle, CheckCircle2,
    Terminal, Maximize2, Minimize2, Code2, Eye, X
} from 'lucide-react';

// ─── 注入项目内部组件 ──────────────────────────────────────────────
import CustomSelect from '../CustomSelect';
import * as LucideIcons from 'lucide-react';

// ─── 执行代码并提取组件 ───────────────────────────────────────────
const createFunction = (code, scope, exportsObj, sandboxRequire) => {
    // 过滤掉 'default' 等保留字，防止作为变量名注入时报错
    const reserved = ['default', 'import', 'export', 'const', 'let', 'var', 'function', 'class'];
    const keys = Object.keys(scope).filter(k =>
        k !== 'React' && k !== 'exports' && k !== 'require' && !reserved.includes(k)
    );
    const values = keys.map(k => scope[k]);
    try {
        const fn = new Function('React', 'exports', 'require', ...keys, code);
        return fn(React, exportsObj, sandboxRequire, ...values);
    } catch (e) {
        console.error('Function Creation Error:', e);
        throw e;
    }
};

function compileAndRun(code, libraryCode = '', wrapperCode = '', cssCode = '') {
    const stylesProxy = new Proxy({}, { get: (t, p) => typeof p === 'string' ? p : p });

    const baseScope = {
        React, ...React,
        CustomSelect, motion, AnimatePresence,
        ...LucideIcons,
        styles: stylesProxy
    };

    let libExports = {};
    const moduleRegistry = {};

    // ─── 1. 编译并执行底层库 ──────────────────────────────────────────
    if (libraryCode.trim()) {
        const parts = libraryCode.split(/\/\* === FILE: (.*?) === \*\//);

        for (let i = 1; i < parts.length; i += 2) {
            const fileName = parts[i];
            const content = parts[i + 1];
            if (!content || !content.trim()) continue;

            try {
                const transformed = Babel.transform(content, {
                    presets: ['react', ['env', { modules: 'commonjs' }]]
                }).code;

                const currentFileExports = {};
                const sandboxRequire = (name) => {
                    const registry = {
                        'react': React,
                        'react-dom': ReactDOM,
                        'lucide-react': LucideIcons,
                        'framer-motion': { motion, AnimatePresence },
                        '@/components/CustomSelect': CustomSelect,
                    };
                    const cleanName = name.replace(/^\.\//, '').replace(/\.jsx?$/, '');
                    if (registry[name]) return registry[name];
                    if (moduleRegistry[cleanName]) return moduleRegistry[cleanName];
                    return LucideIcons[name] || React[name] || libExports[name];
                };

                createFunction(transformed, baseScope, currentFileExports, sandboxRequire);

                const moduleName = fileName.replace(/\.jsx?$/, '');
                moduleRegistry[moduleName] = currentFileExports;

                if (currentFileExports.default) {
                    libExports[moduleName] = currentFileExports.default;
                }
                Object.keys(currentFileExports).forEach(key => {
                    if (key !== 'default' && key !== '__esModule') {
                        libExports[key] = currentFileExports[key];
                    }
                });
            } catch (e) {
                throw new Error(`底层库模块 ${fileName} 编译错误: ${e.message}`);
            }
        }
    }

    // ─── 2. 编译演示场景 (Scenario) ──────────────────────────────────
    const fullScope = { ...baseScope, ...libExports };
    const scenarioExports = {};

    const scenarioRequire = (name) => {
        const registry = {
            'react': React,
            'react-dom': ReactDOM,
            'lucide-react': LucideIcons,
            'framer-motion': { motion, AnimatePresence },
        };
        if (registry[name]) return registry[name];
        if (name.startsWith('.') || libExports[name]) return libExports;
        return LucideIcons[name] || baseScope[name];
    };

    let processedScenario = code;
    const hasRender = code.includes('render(') || code.includes('export default');
    const hasDemoComponent = code.includes('function Demo') || code.includes('const Demo =');

    if (!hasRender && hasDemoComponent) {
        processedScenario = `${code}\n\nrender(<Demo />);`;
    } else if (!hasRender && (code.trim().startsWith('<') || code.trim().startsWith('React.createElement'))) {
        processedScenario = `render(${code});`;
    }

    try {
        const transformedScenario = Babel.transform(processedScenario, {
            presets: ['react', ['env', { modules: 'commonjs' }]]
        }).code;

        const demoScope = {
            ...fullScope,
            render: (comp) => { scenarioExports.default = comp; }
        };
        createFunction(transformedScenario, demoScope, scenarioExports, scenarioRequire);
    } catch (e) {
        throw new Error(`演示代码编译错误: ${e.message}`);
    }

    const MainComponent = scenarioExports.default || scenarioExports[Object.keys(scenarioExports)[0]];
    if (!MainComponent) return null;

    // ─── 3. 编译 Wrapper ───────────────────────────────────────────
    if (wrapperCode.trim() && wrapperCode.includes('{children}')) {
        try {
            const wrappedCode = `exports.DefaultWrapper = ({ children }) => { return (${wrapperCode}); };`;
            const transformedWrapper = Babel.transform(wrappedCode, { presets: ['react', 'env'] }).code;
            const wrapperExports = {};
            createFunction(transformedWrapper, fullScope, wrapperExports, scenarioRequire);
            const Wrapper = wrapperExports.DefaultWrapper;
            if (Wrapper) {
                const Final = () => (
                    <Wrapper>
                        {React.isValidElement(MainComponent) ? MainComponent : <MainComponent />}
                    </Wrapper>
                );
                return Final;
            }
        } catch (e) {
            console.error('Wrapper Execution Error:', e);
        }
    }

    return React.isValidElement(MainComponent) ? () => MainComponent : MainComponent;
}

class SandboxErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) { return { hasError: true, error }; }
    componentDidUpdate(prevProps) {
        if (prevProps.code !== this.props.code) {
            if (this.state.hasError) this.setState({ hasError: false, error: null });
        }
    }
    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center p-6 text-center">
                    <AlertTriangle className="w-6 h-6 text-red-500 mb-4" />
                    <h3 className="text-sm font-black text-slate-900 mb-2">运行时异常</h3>
                    <pre className="text-[10px] text-red-400 font-mono bg-red-50 p-4 rounded-xl border border-red-100 max-w-full overflow-auto text-left">
                        {this.state.error?.message}
                    </pre>
                </div>
            );
        }
        return this.props.children;
    }
}

function SandboxPreview({ code, libraryCode, wrapperCode, cssCode }) {
    const [Component, setComponent] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!cssCode) return;
        const styleId = `sandbox-styles-global`;
        let styleElement = document.getElementById(styleId);
        if (!styleElement) {
            styleElement = document.createElement('style');
            styleElement.id = styleId;
            document.head.appendChild(styleElement);
        }
        styleElement.innerHTML = cssCode;
    }, [cssCode]);

    useEffect(() => {
        let isMounted = true;
        try {
            setError(null);
            const comp = compileAndRun(code, libraryCode, wrapperCode, cssCode);
            if (isMounted) setComponent(() => comp);
        } catch (e) {
            if (isMounted) {
                setError(e.message || String(e));
                setComponent(null);
            }
        }
        return () => { isMounted = false; };
    }, [code, libraryCode, wrapperCode, cssCode]);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                <AlertTriangle className="w-8 h-8 text-red-500 mb-4" />
                <h3 className="text-sm font-black text-slate-900 mb-2 uppercase tracking-widest">编译阶段错误</h3>
                <pre className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-2xl p-6 max-w-full overflow-auto whitespace-pre-wrap font-mono text-left shadow-inner">
                    {error}
                </pre>
            </div>
        );
    }

    if (!Component) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-slate-300 animate-pulse">
                <RefreshCw className="w-8 h-8 animate-spin mb-4 opacity-20" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] italic">Initializing Nano-Engine</span>
            </div>
        );
    }

    return (
        <div className="w-full h-full flex items-center justify-center overflow-auto p-4">
            <SandboxErrorBoundary code={code}>
                <Component />
            </SandboxErrorBoundary>
        </div>
    );
}

const LiveDemoSandbox = ({
    initialCode = '',
    libraryCode = '',
    wrapperCode = '',
    cssCode = '',
    readOnly = false,
    onChange,
    previewOnly = false
}) => {
    const [code, setCode] = useState(initialCode);
    const [runningCode, setRunningCode] = useState(initialCode);
    const [isRunning, setIsRunning] = useState(false);
    const [lastRunSuccess, setLastRunSuccess] = useState(null);
    const textareaRef = useRef(null);

    useEffect(() => {
        setCode(initialCode);
        setRunningCode(initialCode);
    }, [initialCode]);

    const updateCode = (newCode) => {
        setCode(newCode);
        if (onChange) onChange(newCode);
    };

    const handleRun = useCallback(() => {
        setIsRunning(true);
        setTimeout(() => {
            try {
                compileAndRun(code, libraryCode, wrapperCode, cssCode);
                setLastRunSuccess(true);
                setRunningCode(code);
            } catch (e) {
                console.error(e);
                setLastRunSuccess(false);
            }
            setIsRunning(false);
        }, 300);
    }, [code, libraryCode, wrapperCode, cssCode]);

    const handleKeyDown = (e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = e.target.selectionStart;
            const end = e.target.selectionEnd;
            const newCode = code.substring(0, start) + '  ' + code.substring(end);
            updateCode(newCode);
            setTimeout(() => {
                if (textareaRef.current) {
                    textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
                }
            }, 0);
        }
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleRun();
    };

    if (previewOnly) return <SandboxPreview code={code} libraryCode={libraryCode} wrapperCode={wrapperCode} cssCode={cssCode} />;

    return (
        <div className="w-full h-full flex flex-col bg-white">
            <div className="flex-shrink-0 flex items-center justify-between px-8 py-4 border-b border-slate-100">
                <div className="flex items-center gap-4">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic">Live Lab Preview</span>
                    {lastRunSuccess === false && <span className="px-3 py-1 bg-red-50 text-red-500 text-[9px] font-black rounded-full uppercase tracking-tighter">Compile Failed</span>}
                    {lastRunSuccess === true && <span className="px-3 py-1 bg-emerald-50 text-emerald-500 text-[9px] font-black rounded-full uppercase tracking-tighter">Ready</span>}
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={() => setRunningCode(code)} className="px-5 py-2 hover:bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all">
                        Sync Changes
                    </button>
                    <button onClick={handleRun} disabled={isRunning} className="flex items-center gap-2.5 px-8 py-2.5 bg-slate-900 text-white rounded-2xl text-[10px] font-black hover:bg-indigo-600 transition-all shadow-xl active:scale-95 disabled:opacity-50">
                        <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} /> {isRunning ? 'EXECUTING...' : 'RUN ANALYTICS'}
                    </button>
                </div>
            </div>
            <div className="flex-1 flex overflow-hidden">
                {!readOnly && (
                    <div className="flex-1 relative border-r border-slate-100 bg-slate-50/20">
                        <div className="absolute top-4 right-6 text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] select-none">Scenario Logic</div>
                        <textarea
                            ref={textareaRef}
                            value={code}
                            onChange={e => updateCode(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="absolute inset-0 w-full h-full p-10 font-mono text-[13px] outline-none resize-none bg-transparent leading-relaxed text-slate-700"
                            spellCheck={false}
                            placeholder="// 编写你的演示脚本..."
                        />
                    </div>
                )}
                <div className="flex-1 bg-white overflow-hidden relative">
                    <SandboxPreview code={runningCode} libraryCode={libraryCode} wrapperCode={wrapperCode} cssCode={cssCode} />
                </div>
            </div>
        </div>
    );
};

export default LiveDemoSandbox;
