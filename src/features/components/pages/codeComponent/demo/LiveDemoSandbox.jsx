import React, { useState, useEffect, useRef, useCallback } from 'react';
import * as Babel from '@babel/standalone';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Play,
    RefreshCw,
    AlertTriangle,
    CheckCircle2,
    Terminal,
    Maximize2,
    Minimize2,
    Code2,
    Eye
} from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

// ─── 注入项目自定义组件 ──────────────────────────────────────────
import CustomSelect from '../CustomSelect'; // 假设路径在此


// ─── 默认的示例代码 ───────────────────────────────────────────────
const DEFAULT_CODE = `// 在这里写你的 React 组件，最后 export default 或使用 render()
function Demo() {
  const [count, setCount] = React.useState(0);

  return (
    <div style={{ textAlign: 'center', padding: '2rem', fontFamily: 'sans-serif' }}>
      <h2 style={{ color: '#6366f1', marginBottom: '1rem', fontSize: '1.5rem' }}>
        🎮 自定义 Demo 沙箱
      </h2>
      <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
        当前计数：<strong style={{ color: '#0f172a', fontSize: '2rem' }}>{count}</strong>
      </p>
      <button
        onClick={() => setCount(c => c + 1)}
        style={{
          padding: '0.6rem 2rem',
          background: '#6366f1',
          color: 'white',
          border: 'none',
          borderRadius: '1rem',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '1rem'
        }}
      >
        点击 +1
      </button>
    </div>
  );
}
`;

// ─── 执行用户代码并提取组件 ───────────────────────────────────────
const createFunction = (code, scope, exportsObj) => {
    const keys = Object.keys(scope).filter(k => k !== 'React' && k !== 'exports');
    const values = keys.map(k => scope[k]);
    try {
        const fn = new Function('React', 'exports', ...keys, code);
        fn(React, exportsObj, ...values);
    } catch (e) {
        throw e;
    }
};

function compileAndRun(code, libraryCode = '', wrapperCode = '') {
    const baseScope = {
        React, ...React,
        CustomSelect, motion, AnimatePresence
    };

    // 1. 编译 Library
    let libExports = {};
    if (libraryCode.trim()) {
        try {
            const processedLib = libraryCode
                .replace(/export\s+const\s+([a-zA-Z0-9_$]+)/g, 'const $1 = exports.$1')
                .replace(/export\s+function\s+([a-zA-Z0-9_$]+)/g, 'exports.$1 = function $1')
                .replace(/export\s+class\s+([a-zA-Z0-9_$]+)/g, 'exports.$1 = class $1')
                .replace(/export\s+default\s+/g, 'exports.default = ');

            const transformedLib = Babel.transform(processedLib, {
                presets: ['react', 'env']
            }).code;
            createFunction(transformedLib, baseScope, libExports);
        } catch (e) {
            console.error('Library Compile Error:', e);
            throw new Error(`底层库编译错误: ${e.message}`);
        }
    }

    // 2. 编译 Scenario
    const fullScope = { ...baseScope, ...libExports };
    let processedScenario = code.replace(/export\s+default\s+/, 'exports.default = ');
    if (!processedScenario.includes('exports.default')) {
        const match = processedScenario.match(/(?:const|function|class)\s+([A-Z][a-zA-Z0-9_]*)/g);
        if (match) {
            const componentName = match[match.length - 1].split(/\s+/)[1];
            processedScenario += `\n\nexports.default = ${componentName};`;
        }
    }

    const scenarioExports = {};
    try {
        const transformedScenario = Babel.transform(processedScenario, {
            presets: ['react', 'env'],
        }).code;
        createFunction(transformedScenario, fullScope, scenarioExports);
    } catch (e) {
        throw new Error(`演示代码运行错误: ${e.message}`);
    }

    const MainComponent = scenarioExports.default || scenarioExports[Object.keys(scenarioExports)[0]];

    if (!MainComponent) return null;

    // 3. 编译 Wrapper
    if (wrapperCode.trim() && wrapperCode.includes('{children}')) {
        try {
            const wrappedCode = `exports.DefaultWrapper = ({ children }) => { return (${wrapperCode}); };`;
            const transformedWrapper = Babel.transform(wrappedCode, { presets: ['react', 'env'] }).code;
            const wrapperExports = {};
            createFunction(transformedWrapper, fullScope, wrapperExports);

            const Wrapper = wrapperExports.DefaultWrapper;
            if (Wrapper) {
                return () => (
                    <Wrapper>
                        <MainComponent />
                    </Wrapper>
                );
            }
        } catch (e) {
            console.error('Wrapper Error:', e);
            // 包裹器失败时回退到原始组件
            return MainComponent;
        }
    }

    return MainComponent;
}

// ─── 错误边界组件 ────────────────────────────────────────────────
class SandboxErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error('Sandbox Runtime Error:', error, errorInfo);
    }
    componentDidUpdate(prevProps) {
        if (prevProps.code !== this.props.code || prevProps.libCode !== this.props.libCode) {
            if (this.state.hasError) this.setState({ hasError: false, error: null });
        }
    }
    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center p-6 text-center">
                    <div className="p-3 bg-red-500/10 rounded-2xl mb-4">
                        <AlertTriangle className="w-6 h-6 text-red-500" />
                    </div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white mb-2">运行时异常</h3>
                    <pre className="text-[10px] text-red-400 font-mono bg-red-500/5 p-4 rounded-xl border border-red-500/10 max-w-full overflow-auto">
                        {this.state.error?.message}
                    </pre>
                    <p className="mt-4 text-[10px] text-slate-400 tracking-tight">提示：请检查 Demo 代码是否调用了未定义的变量或 Hook</p>
                </div>
            );
        }
        return this.props.children;
    }
}

// ─── 沙箱预览面板 ────────────────────────────────────────────────
function SandboxPreview({ code, libraryCode, wrapperCode }) {
    const [Component, setComponent] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        try {
            setError(null);
            const comp = compileAndRun(code, libraryCode, wrapperCode);
            setComponent(() => comp);
        } catch (e) {
            setError(e.message || String(e));
            setComponent(null);
        }
    }, [code, libraryCode, wrapperCode]);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[200px] p-6">
                <div className="flex items-center gap-2 text-red-500 mb-3">
                    <AlertTriangle className="w-5 h-5" />
                    <span className="font-bold text-sm">环境配置错误</span>
                </div>
                <pre className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-4 max-w-full overflow-auto whitespace-pre-wrap font-mono">
                    {error}
                </pre>
            </div>
        );
    }

    if (!Component) {
        return (
            <div className="flex items-center justify-center h-full min-h-[200px] text-slate-400 text-sm italic">
                <Terminal className="w-4 h-4 mr-2 opacity-50" />
                等待组件挂载...
            </div>
        );
    }

    return (
        <div className="w-full h-full min-h-[200px] flex items-center justify-center">
            <SandboxErrorBoundary code={code} libCode={libraryCode}>
                <Component />
            </SandboxErrorBoundary>
        </div>
    );
}

// ─── 主组件：LiveDemoSandbox ─────────────────────────────────────
const LiveDemoSandbox = ({
    initialCode = DEFAULT_CODE,
    libraryCode = '',
    wrapperCode = '',
    readOnly = false,
    onChange,
    previewOnly = false
}) => {
    const [code, setCode] = useState(initialCode);
    const [runningCode, setRunningCode] = useState(initialCode);
    const [isRunning, setIsRunning] = useState(false);
    const [lastRunSuccess, setLastRunSuccess] = useState(null);
    const [expandEditor, setExpandEditor] = useState(false);
    const textareaRef = useRef(null);

    // 内部同步代码并触发外部回调
    const updateCode = (newCode) => {
        setCode(newCode);
        if (onChange) onChange(newCode);
    };

    // 自动检测运行时错误
    const checkRunResult = useCallback((codeToRun) => {
        try {
            compileAndRun(codeToRun, libraryCode, wrapperCode);
            setLastRunSuccess(true);
        } catch {
            setLastRunSuccess(false);
        }
    }, [libraryCode, wrapperCode]);

    const handleRun = useCallback(() => {
        setIsRunning(true);
        setTimeout(() => {
            setRunningCode(code);
            checkRunResult(code);
            setIsRunning(false);
        }, 300);
    }, [code, checkRunResult]);

    const handleReset = useCallback(() => {
        updateCode(initialCode);
        setRunningCode(initialCode);
        setLastRunSuccess(null);
        checkRunResult(initialCode);
    }, [initialCode, checkRunResult]);

    // Tab 键支持
    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            const start = e.target.selectionStart;
            const end = e.target.selectionEnd;
            const newCode = code.substring(0, start) + '  ' + code.substring(end);
            updateCode(newCode);
            setTimeout(() => {
                if (textareaRef.current) {
                    textareaRef.current.selectionStart = start + 2;
                    textareaRef.current.selectionEnd = start + 2;
                }
            }, 0);
        }
        // Ctrl+Enter / Cmd+Enter 运行
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            handleRun();
        }
    }, [code, handleRun]);

    if (previewOnly) {
        return (
            <div className="w-full">
                <SandboxPreview code={code} libraryCode={libraryCode} wrapperCode={wrapperCode} />
            </div>
        );
    }

    return (
        <div className="w-full rounded-[2.5rem] border border-slate-200 dark:border-white/5 overflow-hidden shadow-2xl bg-white dark:bg-slate-900">
            {/* 工具栏 */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-white/5">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/10 rounded-xl">
                        <Code2 className="w-4 h-4 text-indigo-500" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-black text-slate-900 dark:text-white tracking-wide">
                            实时实验室
                        </span>
                        {lastRunSuccess === true && (
                            <span className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold uppercase tracking-tighter">
                                <CheckCircle2 className="w-3 h-3" /> 编译通过
                            </span>
                        )}
                        {lastRunSuccess === false && (
                            <span className="flex items-center gap-1 text-[10px] text-red-400 font-bold uppercase tracking-tighter">
                                <AlertTriangle className="w-3 h-3" /> 语法错误
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setExpandEditor(v => !v)}
                        className="p-2.5 rounded-xl text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-white dark:hover:bg-slate-800 transition-all shadow-sm border border-transparent hover:border-indigo-500/20"
                        title={expandEditor ? '收起编辑器' : '展开编辑器'}
                    >
                        {expandEditor ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={handleReset}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-all"
                        title="重置代码"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        重置
                    </button>
                    <button
                        onClick={handleRun}
                        disabled={isRunning}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-60"
                        title="运行并查看预览 (Ctrl+Enter)"
                    >
                        <Play className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
                        {isRunning ? '部署中...' : '立即运行'}
                    </button>
                </div>
            </div>

            {/* 主体：编辑器 + 预览 */}
            <div className={`flex flex-col md:flex-row ${expandEditor ? 'h-[80vh]' : 'h-[600px]'} transition-all duration-500`}>
                {/* 左侧编辑器 */}
                {!readOnly && (
                    <div className="flex-1 relative border-b md:border-b-0 md:border-r border-slate-200 dark:border-white/5 min-h-[300px] bg-slate-50 dark:bg-slate-900">
                        <div className="absolute top-4 right-6 text-[10px] font-black text-slate-300 dark:text-slate-700 z-10 select-none uppercase tracking-widest">
                            JSX Editor
                        </div>
                        {/* 行号层 */}
                        <div className="absolute left-0 top-0 bottom-0 w-12 bg-slate-100/50 dark:bg-slate-800/30 border-r border-slate-200/50 dark:border-white/5 pointer-events-none z-10 overflow-hidden pt-4">
                            {code.split('\n').map((_, i) => (
                                <div key={i} className="text-[10px] font-mono text-slate-300 dark:text-slate-600 text-center leading-6" style={{ height: '24px' }}>
                                    {String(i + 1).padStart(2, '0')}
                                </div>
                            ))}
                        </div>
                        <textarea
                            ref={textareaRef}
                            value={code}
                            onChange={e => updateCode(e.target.value)}
                            onKeyDown={handleKeyDown}
                            spellCheck={false}
                            className="absolute inset-0 w-full h-full bg-transparent text-slate-700 dark:text-slate-300 font-mono text-[14px] leading-6 resize-none outline-none border-none pl-16 pr-8 pt-4 pb-8"
                            placeholder="在这里编写 React 代码..."
                        />
                    </div>
                )}

                {/* 右侧预览区 */}
                <div className="flex-1 bg-white dark:bg-slate-950 overflow-auto min-h-[260px] relative">
                    {/*<div className="flex items-center justify-between px-6 py-3 border-b border-slate-50 dark:border-white/5 sticky top-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md z-20">*/}
                    {/*    <div className="flex items-center gap-2">*/}
                    {/*        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />*/}
                    {/*        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Live Preview</span>*/}
                    {/*    </div>*/}
                    {/*    <Eye className="w-3.5 h-3.5 text-slate-300" />*/}
                    {/*</div>*/}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={runningCode}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.02 }}
                            transition={{ duration: 0.4, ease: "circOut" }}
                            className="h-full flex items-center justify-center p-8 lg:p-12"
                        >
                            <SandboxPreview code={runningCode} libraryCode={libraryCode} wrapperCode={wrapperCode} />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* 底部提示 */}
            <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-white/5 text-[10px] font-bold text-slate-400 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5 text-indigo-500">
                        <Terminal className="w-3 h-3" />
                        RUNTIME: BABEL-JS
                    </span>
                    <span>HINT: USE CTRL+ENTER TO RUN</span>
                </div>
                <div>AUTOSAVE: LOCAL_BUFFER</div>
            </div>
        </div>
    );
};


export default LiveDemoSandbox;
