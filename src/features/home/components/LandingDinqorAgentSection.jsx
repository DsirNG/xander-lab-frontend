import React, { useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import {
    Activity,
    ArrowRight,
    Award,
    BookOpen,
    Bot,
    Box,
    Check,
    CheckCircle2,
    Circle,
    Clock,
    Code2,
    Cpu,
    Database,
    ExternalLink,
    Eye,
    FileCheck,
    FileText,
    Flame,
    Globe,
    GraduationCap,
    HelpCircle,
    Image as ImageIcon,
    Layers,
    ListChecks,
    Loader2,
    Mail,
    Maximize2,
    MessageSquare,
    Mic,
    MoreHorizontal,
    PanelLeft,
    Paperclip,
    PenLine,
    Pin,
    Plus,
    Radio,
    RefreshCw,
    RotateCcw,
    RotateCw,
    Search,
    Send,
    Shield,
    ShieldAlert,
    Sliders,
    SlidersHorizontal,
    Sparkles,
    Sun,
    Target,
    Terminal,
    Volume2,
    Workflow,
    X,
    Zap,
} from "lucide-react";
import { Dagger3DShowcase, HolographicBrain3D } from "./LandingExtendedIllustrations";

// 真实左侧主菜单项 (与 /workspace/ai 侧边栏一级导航完全一致)
const PRIMARY_NAV = [
    { id: "ai", label: "DinQor AI", icon: Bot, active: true, to: "/workspace/ai" },
    { id: "knowledge", label: "个人知识库", icon: BookOpen, active: false, to: "/workspace/knowledge" },
    { id: "plans", label: "发文流水线", icon: Workflow, active: false, to: "/workspace/plans" },
    { id: "3d", label: "3D 资产工坊", icon: Box, active: false, to: "/workspace/img2three" },
];

// 统一超级智能体的多模态会话/技能任务
const SESSIONS = [
    {
        id: "knowledge_quiz",
        title: "《Transformer 深度解析》自适应出题与私教",
        time: "15:30",
        tag: "知识库私教",
        icon: GraduationCap,
        userPrompt: "请从我的个人知识库《深度学习与 Transformer》中抽取核心考点，生成一套互动答题卡，并在我作答后即时给出判分、解析和考点溯源。",
        thought: "已命中私有知识库 (materialId=102)... 识别到 Multi-Head Attention、Softmax 缩放机制 √d_k。正在调用 emit_quiz 生成自适应互动答题卡...",
        plan: [
            "1. 知识库向量检索与证据链对齐 (Top-K=3)",
            "2. 构建自适应单选/多选互动答题卡",
            "3. 准备原文考点溯源与艾宾浩斯复习排程",
        ],
        reflection: "质控反思：考点命中率 100%，解析包含论文《Attention Is All You Need》Section 3.2.1 原文对照证据。",
    },
    {
        id: "img2three_3d",
        title: "纯代码生成赛博光刃 3D WebGL 模型",
        time: "14:15",
        tag: "3D 资产工坊",
        icon: Code2,
        userPrompt: "调用 img2threejs 引擎，为我生成一个纯代码构建的赛博光刃 (Cyber Dagger) 3D 模型源码，并在沙箱中实时渲染与调参。",
        thought: "正在执行 3D 程序化几何建模... 计算刀刃 ExtrudeGeometry 挤压拓扑，配置 MeshStandardMaterial 物理材质，自动挂载骨骼插槽...",
        plan: [
            "1. 纯数学几何拓扑计算 (0 二进制模型依赖)",
            "2. PBR 金属度/粗糙度物理材质编译",
            "3. WebGL 3D 视口沙箱热重载与骨骼装配",
        ],
        reflection: "质控反思：着色器法线向量归一化校验通过，代码体积 4.2 KB，WebGL 60 FPS 流畅渲染。",
    },
    {
        id: "headless_auto",
        title: "今日科技前沿热点无人值守发文流水线",
        time: "08:00",
        tag: "无人值守流水线",
        icon: Workflow,
        userPrompt: "触发今日的内容流水线计划，全网调研前沿科技热点并撰写长文，执行 Fail-Closed 质检门禁并同步至 CSDN 与掘金。",
        thought: "Cron 流水线已启动。自动检索 arXiv 前沿论文 4 篇，撰写结构化 Markdown 长文 (3,240字)，进入 Fail-Closed 静态门禁质检...",
        plan: [
            "1. 全网热点调研与多模态图文编排 (3,240字)",
            "2. Fail-Closed 门禁质检 (语法/代码/排版 100% 通过)",
            "3. MCP 协议多端并发同步广播 (CSDN / 掘金 / 社区)",
        ],
        reflection: "质控反思：语法合规、代码测试与敏感词核验全绿，MCP 多渠道广播在 380ms 内全部同步成功。",
    },
];

const WAVE_BARS = [12, 28, 45, 18, 36, 52, 22, 40, 60, 32, 18, 48, 56, 26, 38, 20, 44, 50, 16, 30];

const LandingDinqorAgentSection = ({ t }) => {
    const [activeSessionId, setActiveSessionId] = useState("knowledge_quiz");
    const [quizSelected, setQuizSelected] = useState("B");
    const [quizSubmitted, setQuizSubmitted] = useState(true);
    const [drillDownActive, setDrillDownActive] = useState(false);
    const [voiceActive, setVoiceActive] = useState(false);

    // 3D Studio tab & params
    const [active3dTab, setActive3dTab] = useState("preview"); // "preview" | "code" | "params"
    const [wireframe, setWireframe] = useState(false);
    const [metalness, setMetalness] = useState(95);
    const [roughness, setRoughness] = useState(12);

    const activeSession = SESSIONS.find((s) => s.id === activeSessionId) || SESSIONS[0];

    const handleDrillDown = () => {
        setDrillDownActive(true);
        setTimeout(() => setDrillDownActive(false), 3000);
    };

    return (
        <section className="relative mx-auto mt-24 w-full max-w-7xl px-3 sm:px-6 lg:px-8">
            {/* Ambient Backlight */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -left-20 top-1/4 h-[500px] w-[500px] rounded-full bg-indigo-400/15 blur-3xl"
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-20 top-1/2 h-[500px] w-[500px] rounded-full bg-purple-400/15 blur-3xl"
            />

            {/* Section Header */}
            <div className="text-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200/80 bg-indigo-50/80 px-4 py-1.5 text-xs font-semibold text-indigo-700 shadow-xs backdrop-blur-md">
                    <Bot className="h-3.5 w-3.5 text-indigo-600" />
                    <span>统一超级智能体 · 一个对话框调度全部生产力</span>
                </div>
                <h2 className="mt-4 text-2xl font-black tracking-tight text-[#111426] sm:text-4xl">
                    DinQor AI —— 全能个人知识库智能体工作台
                </h2>
                <p className="mx-auto mt-3 max-w-3xl text-xs sm:text-sm leading-relaxed text-[#606782]">
                    一个超级大脑，全能交互。无需切换不同系统，在同一个会话中无缝调用知识镜像私教、3D 程序化资产生成、无人值守流水线与深度推理沙箱。
                </p>
            </div>

            {/* 100% 真实还原 /workspace/ai 的全功能超级工作台视窗 */}
            <div className="relative mx-auto mt-10 w-full max-w-6xl">
                {/* macOS Outer Window */}
                <div className="overflow-hidden rounded-3xl border border-[#e5e8f3] bg-white shadow-[0_24px_80px_-15px_rgba(99,102,241,0.18)]">
                    {/* Top Window Bar */}
                    <div className="flex h-11 items-center justify-between border-b border-[#f0f2f8] bg-[#fafbfe] px-4">
                        <div className="flex items-center gap-2">
                            <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
                            <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
                            <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
                            <div className="ml-3 flex items-center gap-2 border-l border-[#e5e8f3] pl-3">
                                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-xs font-bold text-[#111426]">
                                    DinQor AI 工作台
                                </span>
                                <span className="rounded-full bg-[#edeefb] px-2 py-0.5 text-[10px] font-semibold text-[#6366f1]">
                                    gpt-5.6-terra · 多模态大模型
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="hidden sm:inline-block text-micro text-[#8e94aa]">
                                挂载 1,280 知识单元 · 7x24h 守护就绪
                            </span>
                            <Link
                                to="/workspace/ai"
                                className="flex items-center gap-1 rounded-lg bg-[#6366f1] px-3 py-1 text-xs font-semibold text-white shadow-xs hover:bg-[#5355e0] transition-colors"
                            >
                                <span>进入 /workspace/ai 体验完整交互</span>
                                <ExternalLink className="h-3 w-3" />
                            </Link>
                        </div>
                    </div>

                    {/* Window Inner Layout: Left Level-1 Nav + Level-2 Session Sidebar + Right Chat Main */}
                    <div className="flex min-h-[580px] flex-col lg:flex-row">
                        {/* 1. Level-1 Mini Sidebar (像 /workspace/ai 一样) */}
                        <div className="hidden lg:flex w-14 shrink-0 flex-col items-center justify-between border-r border-[#f0f2f8] bg-[#fbfbfe] py-4">
                            <div className="flex flex-col items-center gap-4">
                                <div className="grid h-8 w-8 place-items-center rounded-xl bg-[#6366f1] text-white shadow-xs">
                                    <Bot className="h-4 w-4" />
                                </div>
                                <div className="h-[1px] w-6 bg-[#e5e8f3]" />
                                {PRIMARY_NAV.map((nav) => {
                                    const NavIcon = nav.icon;
                                    return (
                                        <button
                                            key={nav.id}
                                            type="button"
                                            title={nav.label}
                                            className={`grid h-9 w-9 place-items-center rounded-xl transition-colors ${
                                                nav.active
                                                    ? "bg-[#f2f1fd] text-[#6366f1]"
                                                    : "text-[#8e94aa] hover:bg-[#f2f1fd] hover:text-[#242741]"
                                            }`}
                                        >
                                            <NavIcon className="h-4 w-4" />
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="text-[10px] font-bold text-[#8e94aa]">PRO</div>
                        </div>

                        {/* 2. Level-2 Session/Skill Sidebar Slice */}
                        <div className="flex w-full lg:w-64 shrink-0 flex-col justify-between border-r border-[#f0f2f8] bg-[#fafafc] p-3">
                            <div>
                                {/* New Chat Button */}
                                <button
                                    type="button"
                                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#6366f1] py-2.5 text-xs font-semibold text-white shadow-xs transition-transform active:scale-95 hover:bg-[#5355e0]"
                                >
                                    <Plus className="h-4 w-4" />
                                    <span>新建任务对话</span>
                                </button>

                                {/* Search Bar */}
                                <div className="mt-3 flex items-center gap-2 rounded-xl border border-[#e5e8f3] bg-white px-2.5 py-1.5 text-xs text-[#8e94aa]">
                                    <Search className="h-3.5 w-3.5" />
                                    <span className="text-[11px]">搜索历史与技能...</span>
                                </div>

                                {/* Sessions / Skills List */}
                                <div className="mt-3 space-y-1">
                                    <div className="px-1 text-[10px] font-bold text-[#9ea3b9] uppercase tracking-wider">
                                        智能体技能与会话流
                                    </div>
                                    {SESSIONS.map((session) => {
                                        const isSelected = activeSessionId === session.id;
                                        const SessionIcon = session.icon;
                                        return (
                                            <button
                                                key={session.id}
                                                type="button"
                                                onClick={() => {
                                                    setActiveSessionId(session.id);
                                                    setVoiceActive(false);
                                                }}
                                                className={`group flex w-full cursor-pointer items-center justify-between rounded-xl px-2.5 py-2 text-left transition-colors ${
                                                    isSelected
                                                        ? "bg-[#f2f1fd] text-[#6055f6] font-semibold"
                                                        : "text-[#242741] hover:bg-[#f7f6fc]"
                                                }`}
                                            >
                                                <div className="flex min-w-0 items-center gap-2">
                                                    <SessionIcon
                                                        className={`h-3.5 w-3.5 shrink-0 ${
                                                            isSelected ? "text-[#6055f6]" : "text-[#9ea3b9]"
                                                        }`}
                                                    />
                                                    <div className="min-w-0">
                                                        <div className="truncate text-xs">{session.title}</div>
                                                        <div className="text-[10px] text-[#9ea3b9]">{session.tag}</div>
                                                    </div>
                                                </div>
                                                <span className="shrink-0 text-[10px] text-[#9ea3b9]">
                                                    {session.time}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Sidebar Footer Indicator */}
                            <div className="rounded-xl border border-[#edf0f8] bg-white p-2.5 text-center">
                                <div className="text-[10px] text-[#8e94aa]">智能体状态</div>
                                <div className="mt-0.5 text-xs font-bold text-emerald-600">● 4 大核心工具链就绪</div>
                            </div>
                        </div>

                        {/* 3. Right Main Conversational Viewport Slice */}
                        <div className="flex min-w-0 flex-1 flex-col justify-between bg-white">
                            {/* Chat Header */}
                            <div className="flex items-center justify-between border-b border-[#f0f2f8] px-4 py-2.5">
                                <div className="min-w-0">
                                    <h3 className="truncate text-xs sm:text-sm font-bold text-[#111426]">
                                        {activeSession.title}
                                    </h3>
                                    <div className="text-[10px] text-[#8e94aa]">
                                        调度能力：{activeSession.tag} · 模型版本：gpt-5.6-terra · 毫秒级流式响应
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    {activeSessionId === "knowledge_quiz" && (
                                        <button
                                            type="button"
                                            onClick={() => setVoiceActive(!voiceActive)}
                                            className="flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1 text-micro font-semibold text-emerald-700 hover:bg-emerald-100"
                                        >
                                            <Mic className="h-3 w-3" />
                                            <span>{voiceActive ? "切回互动题卡" : "切至语音背诵对齐"}</span>
                                        </button>
                                    )}

                                    {activeSessionId === "img2three_3d" && (
                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => setActive3dTab("preview")}
                                                className={`rounded-md px-2 py-0.5 text-micro font-semibold transition ${
                                                    active3dTab === "preview"
                                                        ? "bg-purple-600 text-white"
                                                        : "bg-[#f1f5f9] text-[#64748b]"
                                                }`}
                                            >
                                                3D 视口
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setActive3dTab("code")}
                                                className={`rounded-md px-2 py-0.5 text-micro font-semibold transition ${
                                                    active3dTab === "code"
                                                        ? "bg-purple-600 text-white"
                                                        : "bg-[#f1f5f9] text-[#64748b]"
                                                }`}
                                            >
                                                源码
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setActive3dTab("params")}
                                                className={`rounded-md px-2 py-0.5 text-micro font-semibold transition ${
                                                    active3dTab === "params"
                                                        ? "bg-purple-600 text-white"
                                                        : "bg-[#f1f5f9] text-[#64748b]"
                                                }`}
                                            >
                                                调参
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Chat Messages Stream (真实对话流与工具卡片) */}
                            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                                {/* 1. User Message (真实样式) */}
                                <div className="flex w-full justify-end">
                                    <div className="max-w-[85%] rounded-3xl bg-[#f2f1fd] px-4 py-2.5 text-xs sm:text-sm leading-6 text-black sm:max-w-[75%]">
                                        {activeSession.userPrompt}
                                    </div>
                                </div>

                                {/* 2. Assistant Message with Full Reasoning & Tool Execution */}
                                <div className="flex w-full justify-start">
                                    <div className="w-full min-w-0 space-y-3 py-1 text-xs sm:text-sm leading-6 text-[#242741]">
                                        {/* ThoughtCard 思考过程卡 */}
                                        <div className="flex items-start gap-2 rounded-xl border border-border bg-canvas px-3 py-2 text-xs leading-5 text-ink-muted">
                                            <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-500" />
                                            <span className="whitespace-pre-wrap">{activeSession.thought}</span>
                                        </div>

                                        {/* PlanCard 规划清单 */}
                                        <div className="rounded-xl border border-border bg-canvas px-3 py-2.5 text-xs leading-5">
                                            <div className="flex items-center gap-2 font-semibold text-ink-secondary">
                                                <ListChecks className="h-3.5 w-3.5 shrink-0 text-indigo-600" />
                                                <span>任务执行规划清单</span>
                                            </div>
                                            <ol className="mt-1.5 flex flex-col gap-1 text-ink-muted">
                                                {activeSession.plan.map((item, idx) => (
                                                    <li key={idx} className="flex items-start gap-2">
                                                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                                                        <span>{item}</span>
                                                    </li>
                                                ))}
                                            </ol>
                                        </div>

                                        {/* ─── 统一智能体在流中渲染的专属工具结果 ─── */}
                                        {/* 场景 1：知识库私教题卡 / 语音背诵 */}
                                        {activeSessionId === "knowledge_quiz" && (
                                            voiceActive ? (
                                                /* Voice Recitation Acoustic Scoring */
                                                <div className="rounded-2xl border border-emerald-200 bg-[#f9fdfa] p-4 shadow-xs">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white">
                                                                <Mic className="h-4 w-4 animate-pulse" />
                                                            </span>
                                                            <div>
                                                                <span className="text-xs font-bold text-emerald-950">《诸葛亮 · 出师表》精准背诵检测</span>
                                                                <span className="block text-[10px] text-[#808b9f]">音素对齐评分中</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-baseline gap-1">
                                                            <span className="text-2xl font-black text-emerald-600">96</span>
                                                            <span className="text-xs font-bold text-emerald-600">分 · 熟练掌握</span>
                                                        </div>
                                                    </div>
                                                    <div className="mt-3 rounded-xl border border-emerald-100 bg-white p-3">
                                                        <p className="text-xs leading-relaxed text-[#242741]">
                                                            “臣本布衣，躬耕于南阳...
                                                            <span className="rounded bg-emerald-100 px-1 font-semibold text-emerald-800">
                                                                先帝不以臣卑鄙
                                                            </span>
                                                            ，猥自枉屈，三顾臣于草庐之中...”
                                                        </p>
                                                    </div>
                                                    <div className="mt-3 flex items-center gap-1.5 rounded-xl bg-emerald-900/5 px-3 py-2">
                                                        <Volume2 className="h-4 w-4 text-emerald-600" />
                                                        <div className="flex flex-1 items-center justify-center gap-1">
                                                            {WAVE_BARS.map((h, idx) => (
                                                                <span
                                                                    key={idx}
                                                                    className="w-1 rounded-full bg-emerald-500 transition-all duration-300"
                                                                    style={{ height: `${h}px` }}
                                                                />
                                                            ))}
                                                        </div>
                                                        <span className="text-[10px] font-mono text-emerald-700">00:28 / 00:45</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                /* QuizCardStack 互动题卡 */
                                                <div className="relative overflow-hidden rounded-2xl border border-border bg-surface p-4 sm:p-5 shadow-xs">
                                                    <div className="pointer-events-none absolute inset-x-5 top-0 h-1 rounded-b-full bg-accent/70" />
                                                    <div className="flex items-center justify-between border-b border-border pb-2.5">
                                                        <span className="rounded-md bg-accent-soft px-2 py-0.5 text-micro font-bold text-accent-fg">
                                                            Transformer 架构
                                                        </span>
                                                        <span className="text-caption text-ink-muted">
                                                            第 1 题 / 共 1 题 · 自适应出题
                                                        </span>
                                                    </div>

                                                    <div className="mt-3 flex items-start gap-2.5">
                                                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-xl bg-accent-soft text-caption font-semibold text-accent-fg">
                                                            01
                                                        </span>
                                                        <h4 className="min-w-0 flex-1 text-xs sm:text-sm font-semibold leading-6 text-ink">
                                                            在 Transformer 架构中，为什么自注意力矩阵计算要除以 √d_k 缩放因子？
                                                        </h4>
                                                    </div>

                                                    <div className="mt-3.5 grid gap-2">
                                                        {[
                                                            { key: "A", text: "为了将矩阵乘法的时间复杂度降至 O(1)" },
                                                            { key: "B", text: "防止点积结果过大导致 Softmax 梯度进入极小饱和区" },
                                                            { key: "C", text: "消除残差连接中的梯度爆炸隐患" },
                                                        ].map((opt) => {
                                                            const isSelected = quizSelected === opt.key;
                                                            return (
                                                                <button
                                                                    key={opt.key}
                                                                    type="button"
                                                                    onClick={() => setQuizSelected(opt.key)}
                                                                    className={`flex min-h-10 items-center gap-3 rounded-xl border px-3 text-left text-xs transition ${
                                                                        isSelected
                                                                            ? "border-accent bg-accent-soft text-accent-fg font-semibold"
                                                                            : "border-border bg-canvas text-ink-secondary hover:border-border-strong hover:bg-surface-muted"
                                                                    }`}
                                                                >
                                                                    <span
                                                                        className={`grid h-6 w-6 shrink-0 place-items-center rounded-lg border text-xs font-semibold ${
                                                                            isSelected
                                                                                ? "border-accent bg-accent text-white"
                                                                                : "border-border-strong bg-surface text-ink-muted"
                                                                        }`}
                                                                    >
                                                                        {isSelected ? <Check className="h-3.5 w-3.5" /> : opt.key}
                                                                    </span>
                                                                    <span className="min-w-0 flex-1">{opt.text}</span>
                                                                </button>
                                                            );
                                                        })}
                                                    </div>

                                                    {quizSubmitted && (
                                                        <div className="mt-3.5 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-xs">
                                                            <div className="flex items-center justify-between font-bold text-emerald-800">
                                                                <span>✓ 智能判分：回答正确 (+100分)</span>
                                                                <span className="text-micro font-medium text-emerald-700">秒级证据链溯源</span>
                                                            </div>
                                                            <p className="mt-1 text-[11px] leading-relaxed text-[#2d3748]">
                                                                <span className="font-semibold text-emerald-950">💡 深度解析：</span>
                                                                当 d_k 维度很大时，点积幅值增长导致 Softmax 梯度极度微弱。除以 √d_k 能够使点积保持均值为 0、方差为 1 的平稳分布。
                                                            </p>
                                                            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-emerald-200/60 pt-2">
                                                                <span className="text-micro text-emerald-800">
                                                                    薄弱点：Scaled Dot-Product Attention 缩放数学推导
                                                                </span>
                                                                <button
                                                                    type="button"
                                                                    onClick={handleDrillDown}
                                                                    className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-micro font-semibold text-white hover:bg-emerald-700"
                                                                >
                                                                    <Sparkles className="h-3 w-3" />
                                                                    <span>{drillDownActive ? "✓ 已加入强化" : "针对该点生成强化练习"}</span>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        )}

                                        {/* 场景 2：3D 资产工坊视窗 */}
                                        {activeSessionId === "img2three_3d" && (
                                            <div className="rounded-2xl border border-border bg-surface p-4 shadow-xs">
                                                {active3dTab === "preview" && (
                                                    <div className="relative flex flex-col items-center justify-center rounded-xl bg-[#0d111d] p-4 text-white">
                                                        <div className="absolute left-3 top-3 flex items-center gap-2 text-micro font-mono text-purple-300">
                                                            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                                                            <span>WebGL 60 FPS · 360° 交互式转盘</span>
                                                        </div>
                                                        <div className="absolute right-3 top-3 flex items-center gap-2">
                                                            <button
                                                                type="button"
                                                                onClick={() => setWireframe(!wireframe)}
                                                                className={`rounded-md border px-2 py-0.5 text-micro font-bold transition ${
                                                                    wireframe
                                                                        ? "border-purple-400 bg-purple-600 text-white"
                                                                        : "border-white/20 bg-white/10 text-slate-300 hover:bg-white/20"
                                                                }`}
                                                            >
                                                                {wireframe ? "Wireframe 开" : "Wireframe 关"}
                                                            </button>
                                                        </div>
                                                        <div className="my-4 w-full flex justify-center">
                                                            <Dagger3DShowcase className="h-40 w-full" />
                                                        </div>
                                                        <div className="w-full flex items-center justify-between border-t border-white/10 pt-2 text-micro text-slate-400">
                                                            <span>纯 JavaScript Three.js 源码 · 0 二进制资产</span>
                                                            <span className="font-mono text-purple-300">体积: 4.2 KB</span>
                                                        </div>
                                                    </div>
                                                )}

                                                {active3dTab === "code" && (
                                                    <div className="overflow-hidden rounded-xl border border-[#1e293b] bg-[#0d111d] p-3 text-white font-mono text-[11px]">
                                                        <div className="text-micro text-purple-300 border-b border-white/10 pb-1.5">
                                                            three_generated_asset.js (Pure Code)
                                                        </div>
                                                        <pre className="mt-2 text-purple-200 leading-relaxed overflow-x-auto">
{`const bladeGeo = new THREE.ExtrudeGeometry(bladeShape, { depth: 0.1 });
const bladeMat = new THREE.MeshStandardMaterial({
  metalness: ${(metalness / 100).toFixed(2)},
  roughness: ${(roughness / 100).toFixed(2)},
  emissive: 0x4338ca
});
root.add(new THREE.Mesh(bladeGeo, bladeMat));`}
                                                        </pre>
                                                    </div>
                                                )}

                                                {active3dTab === "params" && (
                                                    <div className="rounded-xl border border-border bg-[#fafbfe] p-3.5 space-y-3">
                                                        <div className="flex justify-between text-xs font-semibold text-ink-secondary">
                                                            <span>金属度 (Metalness)</span>
                                                            <span className="font-mono text-purple-600">{(metalness / 100).toFixed(2)}</span>
                                                        </div>
                                                        <input
                                                            type="range"
                                                            min="0"
                                                            max="100"
                                                            value={metalness}
                                                            onChange={(e) => setMetalness(Number(e.target.value))}
                                                            className="w-full accent-purple-600"
                                                        />
                                                        <div className="flex justify-between text-xs font-semibold text-ink-secondary">
                                                            <span>粗糙度 (Roughness)</span>
                                                            <span className="font-mono text-purple-600">{(roughness / 100).toFixed(2)}</span>
                                                        </div>
                                                        <input
                                                            type="range"
                                                            min="0"
                                                            max="100"
                                                            value={roughness}
                                                            onChange={(e) => setRoughness(Number(e.target.value))}
                                                            className="w-full accent-purple-600"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* 场景 3：无人值守流水线视窗 */}
                                        {activeSessionId === "headless_auto" && (
                                            <div className="space-y-3">
                                                {/* MCP Matrix */}
                                                <div className="rounded-2xl border border-border bg-surface p-3.5 shadow-xs">
                                                    <div className="flex items-center justify-between border-b border-border pb-2">
                                                        <span className="text-xs font-bold text-ink">
                                                            MCP 协议多端并发同步结果
                                                        </span>
                                                        <span className="text-micro font-mono text-emerald-600 font-bold">
                                                            200 OK ALL_SYNCED
                                                        </span>
                                                    </div>
                                                    <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                                                        <div className="rounded-xl border border-border bg-canvas p-2 text-center">
                                                            <div className="text-micro text-ink-muted">CSDN 社区 (MCP)</div>
                                                            <div className="mt-0.5 font-bold text-emerald-600">✓ 同步 (ID: 139281)</div>
                                                        </div>
                                                        <div className="rounded-xl border border-border bg-canvas p-2 text-center">
                                                            <div className="text-micro text-ink-muted">掘金社区 (MCP)</div>
                                                            <div className="mt-0.5 font-bold text-emerald-600">✓ 同步 (ID: 742189)</div>
                                                        </div>
                                                        <div className="rounded-xl border border-border bg-canvas p-2 text-center">
                                                            <div className="text-micro text-ink-muted">VIP 邮件订阅</div>
                                                            <div className="mt-0.5 font-bold text-emerald-600">✓ 发送 (1,280封)</div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Terminal Logs */}
                                                <div className="rounded-2xl border border-[#1e293b] bg-[#0d111d] p-3 text-white font-mono text-[11px]">
                                                    <div className="flex items-center justify-between border-b border-white/10 pb-1.5 text-micro text-slate-400">
                                                        <span className="text-orange-400">headless_worker.log</span>
                                                        <span className="text-emerald-400">STREAMING ACTIVE</span>
                                                    </div>
                                                    <div className="mt-2 space-y-1 text-slate-300">
                                                        <div><span className="text-slate-500">[08:00:01]</span> <span className="text-amber-400">CRON:</span> Trigger fired for planId=daily_ai</div>
                                                        <div><span className="text-slate-500">[08:00:04]</span> <span className="text-blue-400">AGENT:</span> gpt-5.6-terra generated article draft (3,240 words)</div>
                                                        <div><span className="text-slate-500">[08:00:08]</span> <span className="text-emerald-400">GATE:</span> Fail-Closed lint passed</div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* ReflectionCard 质控反思卡 */}
                                        <div className="rounded-xl border border-orange-500/25 bg-orange-500/5 px-3 py-2 text-xs leading-5 text-ink-muted">
                                            <div className="flex items-center gap-2 font-semibold text-orange-600">
                                                <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
                                                <span>质控反思与自检 (Reflection)</span>
                                            </div>
                                            <p className="mt-1 text-[11px]">{activeSession.reflection}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Realistic AgentComposer Bottom Bar */}
                            <div className="border-t border-[#f0f2f8] bg-white p-3 sm:p-4">
                                <div className="relative rounded-[1.75rem] border border-[#e5e7f2] bg-white p-1.5 shadow-[0_4px_20px_rgba(103,101,246,0.04)] focus-within:border-[#817bf2] focus-within:ring-2 focus-within:ring-[#817bf2]/20">
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            className="grid h-8 w-8 place-items-center rounded-full text-[#8e94aa] hover:bg-[#f2f1fd] hover:text-[#5f6286] transition-colors"
                                            title="上传附件"
                                        >
                                            <Paperclip className="h-4 w-4" />
                                        </button>
                                        <input
                                            type="text"
                                            readOnly
                                            value="告诉 DinQor AI 你想做什么，例如出题测验、3D生成、联网搜索或发文流水线..."
                                            className="flex-1 bg-transparent px-1 text-xs sm:text-sm text-[#8e94aa] outline-none cursor-default"
                                        />
                                        <Link
                                            to="/workspace/ai"
                                            className="grid h-8 w-8 place-items-center rounded-full bg-[#6366f1] text-white shadow-xs transition-transform hover:scale-105"
                                        >
                                            <Send className="h-3.5 w-3.5" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 承接下方：统一超级智能体的四大核心能力底座矩阵 (4 Core Superpower Engines) */}
            <div className="mt-14">
                <div className="text-center">
                    <div className="text-xs font-bold uppercase tracking-widest text-[#6366f1]">
                        Architectural Engines
                    </div>
                    <h3 className="mt-2 text-xl sm:text-2xl font-black text-[#111426]">
                        一个智能体，背后连接 4 大工业级底层引擎
                    </h3>
                </div>

                <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Engine 1: Knowledge Mirror */}
                    <div className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-xs transition-all hover:shadow-md">
                        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
                            <GraduationCap className="h-5 w-5" />
                        </div>
                        <h4 className="mt-3 text-sm font-bold text-[#111426]">Knowledge Mirror 私教引擎</h4>
                        <p className="mt-1.5 text-xs text-[#64748b] leading-relaxed">
                            多模态知识向量索引、自适应考题生成、毫秒级判分与艾宾浩斯复习排程。
                        </p>
                        <div className="mt-3 text-micro font-semibold text-emerald-600">
                            ● 错点一键下钻强化
                        </div>
                    </div>

                    {/* Engine 2: img2threejs */}
                    <div className="rounded-3xl border border-purple-100 bg-white p-5 shadow-xs transition-all hover:shadow-md">
                        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-purple-50 text-purple-600">
                            <Box className="h-5 w-5" />
                        </div>
                        <h4 className="mt-3 text-sm font-bold text-[#111426]">img2threejs 3D 资产编译器</h4>
                        <p className="mt-1.5 text-xs text-[#64748b] leading-relaxed">
                            0 二进制文件，单图/提示词直出纯 Three.js 源码、PBR 材质与骨骼插槽。
                        </p>
                        <div className="mt-3 text-micro font-semibold text-purple-600">
                            ● WebGL 60FPS 实时渲染
                        </div>
                    </div>

                    {/* Engine 3: Headless Automation */}
                    <div className="rounded-3xl border border-orange-100 bg-white p-5 shadow-xs transition-all hover:shadow-md">
                        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-orange-50 text-orange-600">
                            <Workflow className="h-5 w-5" />
                        </div>
                        <h4 className="mt-3 text-sm font-bold text-[#111426]">Headless 内容流水线</h4>
                        <p className="mt-1.5 text-xs text-[#64748b] leading-relaxed">
                            Cron 7x24h 定时调研撰写、Fail-Closed 严格门禁与 MCP 协议多端分发。
                        </p>
                        <div className="mt-3 text-micro font-semibold text-orange-600">
                            ● CSDN / 掘金 / 社区同步
                        </div>
                    </div>

                    {/* Engine 4: Deep Reasoning & Sandbox */}
                    <div className="rounded-3xl border border-blue-100 bg-white p-5 shadow-xs transition-all hover:shadow-md">
                        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-50 text-blue-600">
                            <Terminal className="h-5 w-5" />
                        </div>
                        <h4 className="mt-3 text-sm font-bold text-[#111426]">安全沙箱与多智能体网关</h4>
                        <p className="mt-1.5 text-xs text-[#64748b] leading-relaxed">
                            工业级进程隔离沙箱，SubAgent 蜂群协同与确定性计费核销审计。
                        </p>
                        <div className="mt-3 text-micro font-semibold text-blue-600">
                            ● 零网络风险 / 零文件污染
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

LandingDinqorAgentSection.propTypes = {
    t: PropTypes.func.isRequired,
};

export default LandingDinqorAgentSection;
