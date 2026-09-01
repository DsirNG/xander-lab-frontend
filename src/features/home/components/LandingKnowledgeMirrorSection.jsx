import React, { useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import {
    ArrowRight,
    Award,
    BookOpen,
    Brain,
    Check,
    CheckCircle2,
    Clock,
    Database,
    ExternalLink,
    FileText,
    Flame,
    GraduationCap,
    HelpCircle,
    Layers,
    Mic,
    Plus,
    RefreshCw,
    RotateCcw,
    Search,
    Send,
    Sparkles,
    Target,
    Volume2,
    X,
    Zap,
} from "lucide-react";
import { KnowledgeFolders3D } from "./LandingIllustrations";

const KNOWLEDGE_BASES = [
    {
        id: "transformer",
        title: "Transformer 架构与注意力机制",
        unitCount: "128 核心考点",
        mastery: 94.8,
        active: true,
        category: "Deep Learning",
    },
    {
        id: "classic_chinese",
        title: "诸葛亮《出师表》精准背诵",
        unitCount: "24 篇章句读",
        mastery: 96.0,
        active: false,
        category: "Voice Recitation",
    },
    {
        id: "distributed",
        title: "分布式系统与 Paxos / Raft 协议",
        unitCount: "86 拓扑考点",
        mastery: 88.5,
        active: false,
        category: "System Architecture",
    },
];

const MOCK_QUESTIONS = {
    transformer: {
        category: "Transformer 架构",
        question: "在 Transformer 架构中，为什么自注意力矩阵计算要除以 √d_k 缩放因子？",
        options: [
            { key: "A", text: "为了将矩阵乘法的时间复杂度降至 O(1)" },
            { key: "B", text: "防止点积结果过大导致 Softmax 梯度进入极小饱和区" },
            { key: "C", text: "消除残差连接中的梯度爆炸隐患" },
        ],
        correct: "B",
        analysis: "当 d_k 维度很大时，点积幅值增长导致 Softmax 梯度极度微弱。除以 √d_k 能够使点积保持均值为 0、方差为 1 的平稳分布。",
        evidence: "论文《Attention Is All You Need》Section 3.2.1",
        weakPoint: "Scaled Dot-Product Attention 缩放数学推导",
    },
    classic_chinese: {
        category: "文言文实词与文意",
        question: "“先帝不以臣卑鄙”中的“卑鄙”在文中的真实古义是什么？",
        options: [
            { key: "A", text: "道德品质恶劣低下" },
            { key: "B", text: "地位低微、见识浅陋（身份卑下，见识鄙俗）" },
            { key: "C", text: "言语粗鲁、行为放荡" },
        ],
        correct: "B",
        analysis: "古今异义词。“卑”指地位卑微，“鄙”指见识浅陋。诸葛亮以此自谦出身平民，感激刘备三顾茅庐之恩。",
        evidence: "《出师表》前段：“臣本布衣，躬耕于南阳...先帝不以臣卑鄙”",
        weakPoint: "古汉语通假与古今异义词频表",
    },
    distributed: {
        category: "Raft 选举机制",
        question: "在 Raft 协议中，Candidate 节点在什么条件下会赢得 Leader 选举？",
        options: [
            { key: "A", text: "获得集群中绝对多数（Quorum）节点的投票支持" },
            { key: "B", text: "拥有全局最新物理时间戳 (NTP)" },
            { key: "C", text: "优先向全部 Follower 发送 Heartbeat 广播" },
        ],
        correct: "A",
        analysis: "Raft 保证安全性核心：Candidate 在同一任期 (Term) 内必须获得超过半数 (n/2 + 1) 节点的赞成票才能晋升为 Leader。",
        evidence: "Raft 论文 Section 5.2: Leader Election",
        weakPoint: "Quorum 多数派与脑裂防御机制",
    },
};

const WAVE_BARS = [12, 28, 45, 18, 36, 52, 22, 40, 60, 32, 18, 48, 56, 26, 38, 20, 44, 50, 16, 30];

const LandingKnowledgeMirrorSection = ({ t }) => {
    const [selectedKbId, setSelectedKbId] = useState("transformer");
    const [mode, setMode] = useState("quiz"); // "quiz" or "voice"
    const [userSelected, setUserSelected] = useState("B");
    const [submitted, setSubmitted] = useState(true);
    const [drillDownSuccess, setDrillDownSuccess] = useState(false);

    const currentKb = KNOWLEDGE_BASES.find((kb) => kb.id === selectedKbId) || KNOWLEDGE_BASES[0];
    const currentQ = MOCK_QUESTIONS[selectedKbId] || MOCK_QUESTIONS.transformer;
    const isCorrect = userSelected === currentQ.correct;

    const handleSelectOption = (key) => {
        setUserSelected(key);
        setSubmitted(true);
    };

    const handleTriggerDrillDown = () => {
        setDrillDownSuccess(true);
        setTimeout(() => setDrillDownSuccess(false), 3000);
    };

    return (
        <section className="relative mx-auto mt-28 w-full max-w-7xl px-3 sm:px-6 lg:px-8">
            {/* Ambient Lighting */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -left-20 top-1/4 h-96 w-96 rounded-full bg-emerald-400/15 blur-3xl"
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-20 top-1/2 h-96 w-96 rounded-full bg-teal-400/15 blur-3xl"
            />

            {/* Section Header */}
            <div className="text-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-50/80 px-4 py-1.5 text-xs font-semibold text-emerald-700 shadow-xs backdrop-blur-md">
                    <Brain className="h-3.5 w-3.5 text-emerald-600" />
                    <span>{t("landing.knowledgeMirror.badge", "核心引擎 · 个人知识库智能体与 AI 私教")}</span>
                </div>
                <h2 className="mt-4 text-2xl font-black tracking-tight text-[#111426] sm:text-4xl">
                    {t("landing.knowledgeMirror.title", "Knowledge Mirror —— 个人知识镜像与 AI 私教")}
                </h2>
                <p className="mx-auto mt-3 max-w-3xl text-xs sm:text-sm leading-relaxed text-[#606782]">
                    {t(
                        "landing.knowledgeMirror.subtitle",
                        "告别死记硬背。将文档与笔记转化为互动式智能私教：对话中自适应出题、毫秒级判分、错点溯源与艾宾浩斯复习流，构建全流程闭环学习体验。",
                    )}
                </p>
            </div>

            {/* Realistic Knowledge Mirror Workbench Frame (高保真知识库私教实景视窗) */}
            <div className="relative mx-auto mt-10 w-full max-w-5xl">
                {/* Outer Glass Frame */}
                <div className="overflow-hidden rounded-3xl border border-[#e2e8f0] bg-white shadow-[0_24px_70px_-15px_rgba(16,185,129,0.14)]">
                    {/* Top Window Bar */}
                    <div className="flex h-11 items-center justify-between border-b border-[#f0f2f8] bg-[#fafbfe] px-4">
                        <div className="flex items-center gap-2">
                            <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
                            <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
                            <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
                            <div className="ml-3 flex items-center gap-2 border-l border-[#e2e8f0] pl-3">
                                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-xs font-bold text-[#111426]">
                                    Knowledge Mirror 私教工作台
                                </span>
                                <span className="hidden sm:inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                                    gpt-5.6-terra · 知识向量对齐 & 自适应出题
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Link
                                to="/workspace/knowledge"
                                className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 transition-colors"
                            >
                                <span>进入知识库私教</span>
                                <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>
                    </div>

                    {/* Window Layout: Left Knowledge Base Sidebar Slice + Right Interactive Quiz Area */}
                    <div className="flex min-h-[520px] flex-col md:flex-row">
                        {/* Left Knowledge Base Sidebar Slice */}
                        <div className="flex w-full md:w-64 shrink-0 flex-col justify-between border-r border-[#f0f2f8] bg-[#fafafc] p-3">
                            <div>
                                {/* Import Knowledge Button */}
                                <button
                                    type="button"
                                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-2.5 text-xs font-semibold text-white shadow-xs transition-transform active:scale-95 hover:bg-emerald-700"
                                >
                                    <Plus className="h-4 w-4" />
                                    <span>导入知识库 / 笔记</span>
                                </button>

                                {/* Search Input Mock */}
                                <div className="mt-3 flex items-center gap-2 rounded-xl border border-[#e2e8f0] bg-white px-2.5 py-1.5 text-xs text-[#8e94aa]">
                                    <Search className="h-3.5 w-3.5" />
                                    <span className="text-[11px]">检索知识点与考题...</span>
                                </div>

                                {/* Knowledge Bases List */}
                                <div className="mt-3 space-y-1">
                                    <div className="px-1 text-[10px] font-bold text-[#9ea3b9] uppercase tracking-wider">
                                        挂载中的个人知识镜像
                                    </div>
                                    {KNOWLEDGE_BASES.map((kb) => {
                                        const isSelected = selectedKbId === kb.id;
                                        return (
                                            <button
                                                key={kb.id}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedKbId(kb.id);
                                                    setUserSelected("B");
                                                    setSubmitted(true);
                                                }}
                                                className={`group flex w-full cursor-pointer items-center justify-between rounded-xl px-2.5 py-2 text-left transition-colors ${
                                                    isSelected
                                                        ? "bg-emerald-50 text-emerald-900 font-semibold"
                                                        : "text-[#242741] hover:bg-[#f7f6fc]"
                                                }`}
                                            >
                                                <div className="flex min-w-0 items-center gap-2">
                                                    <BookOpen
                                                        className={`h-3.5 w-3.5 shrink-0 ${
                                                            isSelected ? "text-emerald-600" : "text-[#9ea3b9]"
                                                        }`}
                                                    />
                                                    <div className="min-w-0">
                                                        <div className="truncate text-xs">{kb.title}</div>
                                                        <div className="text-[10px] text-[#9ea3b9]">{kb.unitCount}</div>
                                                    </div>
                                                </div>
                                                <span className="shrink-0 font-mono text-[10px] font-bold text-emerald-600">
                                                    {kb.mastery}%
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Sidebar Footer Stats */}
                            <div className="rounded-xl border border-[#edf0f8] bg-white p-2.5 text-center">
                                <div className="text-[10px] text-[#8e94aa]">艾宾浩斯复习排程</div>
                                <div className="mt-0.5 text-xs font-bold text-emerald-600">✓ 今日待巩固 3 个核心考点</div>
                            </div>
                        </div>

                        {/* Right Main Tutor Viewport Slice */}
                        <div className="flex min-w-0 flex-1 flex-col justify-between bg-white">
                            {/* Tutor Header with Mode Toggle */}
                            <div className="flex items-center justify-between border-b border-[#f0f2f8] px-4 py-2.5">
                                <div className="min-w-0">
                                    <h3 className="truncate text-xs sm:text-sm font-bold text-[#111426]">
                                        {currentKb.title}
                                    </h3>
                                    <div className="text-[10px] text-[#8e94aa]">
                                        模块标签：{currentKb.category} · 智能体自适应考点抽取中
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setMode(mode === "quiz" ? "voice" : "quiz")}
                                        className="flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
                                    >
                                        {mode === "quiz" ? (
                                            <>
                                                <Mic className="h-3.5 w-3.5" />
                                                <span>切至语音背诵对齐</span>
                                            </>
                                        ) : (
                                            <>
                                                <HelpCircle className="h-3.5 w-3.5" />
                                                <span>切至互动题卡测验</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* Main Body: Mode Dependent */}
                            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                                {mode === "voice" ? (
                                    /* Voice Recitation Acoustic Scoring Panel */
                                    <div className="rounded-2xl border border-emerald-200 bg-[#f9fdfa] p-5 shadow-xs">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-2xs">
                                                    <Mic className="h-4 w-4 animate-pulse" />
                                                </span>
                                                <div>
                                                    <span className="text-xs font-bold text-emerald-950">
                                                        语音声学特征与音素精准对齐
                                                    </span>
                                                    <span className="block text-[10px] text-[#808b9f]">
                                                        当前评测：{currentKb.title} · 实时音频流捕获
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-3xl font-black text-emerald-600">96</span>
                                                <span className="text-xs font-bold text-emerald-600">分 · 熟练掌握</span>
                                            </div>
                                        </div>

                                        <div className="mt-4 rounded-xl border border-emerald-100 bg-white p-3.5">
                                            <div className="text-micro font-semibold text-[#8a92aa]">原文智能标记比对：</div>
                                            <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-[#242741]">
                                                “臣本布衣，躬耕于南阳，苟全性命于乱世，不求闻达于诸侯。
                                                <span className="rounded bg-emerald-100 px-1 font-semibold text-emerald-800">
                                                    先帝不以臣卑鄙
                                                </span>
                                                ，猥自枉屈，三顾臣于草庐之中...”
                                            </p>
                                        </div>

                                        {/* Dynamic Audio Waveform */}
                                        <div className="mt-4 flex items-center gap-1.5 rounded-xl bg-emerald-900/5 px-4 py-2.5">
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
                                            <span className="text-[11px] font-mono text-emerald-700">00:28 / 00:45</span>
                                        </div>
                                    </div>
                                ) : (
                                    /* Interactive Quiz Card Stack (与真实 QuizCardStack 100% 统一) */
                                    <div className="relative min-h-[20rem] overflow-hidden rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6">
                                        <div className="pointer-events-none absolute inset-x-5 top-0 h-1 rounded-b-full bg-emerald-500/70" />

                                        {/* Question Header */}
                                        <div className="flex items-center justify-between border-b border-border pb-3">
                                            <div className="flex items-center gap-2">
                                                <span className="rounded-lg bg-emerald-50 px-2.5 py-0.5 text-micro font-bold text-emerald-700">
                                                    {currentQ.category}
                                                </span>
                                                <span className="text-caption font-semibold text-ink-muted">
                                                    第 1 题 / 共 1 题 · 自适应出题
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1 text-micro text-ink-muted">
                                                <Clock className="h-3.5 w-3.5 text-amber-500" />
                                                <span>自动计时 00:14</span>
                                            </div>
                                        </div>

                                        {/* Question Title with Number Badge */}
                                        <div className="mt-4 flex items-start gap-3">
                                            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-emerald-100 text-caption font-semibold text-emerald-800">
                                                01
                                            </span>
                                            <h4 className="min-w-0 flex-1 text-body font-semibold leading-6 text-ink">
                                                {currentQ.question}
                                            </h4>
                                        </div>

                                        {/* Options List */}
                                        <div className="mt-5 grid gap-2.5">
                                            {currentQ.options.map((opt) => {
                                                const isSelected = userSelected === opt.key;
                                                let btnCls = "border-border bg-canvas text-ink-secondary hover:border-border-strong hover:bg-surface-muted";
                                                let badgeCls = "border-border-strong bg-surface text-ink-muted";
                                                if (isSelected) {
                                                    if (submitted) {
                                                        if (isCorrect) {
                                                            btnCls = "border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold";
                                                            badgeCls = "border-emerald-600 bg-emerald-600 text-white";
                                                        } else {
                                                            btnCls = "border-rose-500 bg-rose-50 text-rose-950 font-semibold";
                                                            badgeCls = "border-rose-600 bg-rose-600 text-white";
                                                        }
                                                    } else {
                                                        btnCls = "border-emerald-500 bg-emerald-50 text-emerald-950 font-semibold";
                                                        badgeCls = "border-emerald-600 bg-emerald-600 text-white";
                                                    }
                                                }

                                                return (
                                                    <button
                                                        key={opt.key}
                                                        type="button"
                                                        onClick={() => handleSelectOption(opt.key)}
                                                        className={`flex min-h-12 items-center gap-3 rounded-xl border px-3 text-left text-body transition ${btnCls}`}
                                                    >
                                                        <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg border text-caption font-semibold ${badgeCls}`}>
                                                            {isSelected && submitted ? (
                                                                isCorrect ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />
                                                            ) : (
                                                                opt.key
                                                            )}
                                                        </span>
                                                        <span className="min-w-0 flex-1 text-xs sm:text-sm">{opt.text}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>

                                        {/* Instant Grading & Analysis Card */}
                                        {submitted && (
                                            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 transition-all text-xs">
                                                <div className="flex items-center justify-between font-bold text-emerald-900">
                                                    <div className="flex items-center gap-1.5">
                                                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                                        <span>智能判分：回答正确 (+100分)</span>
                                                    </div>
                                                    <span className="text-micro font-medium text-emerald-700">秒级证据链溯源</span>
                                                </div>
                                                <p className="mt-1.5 text-[11px] leading-relaxed text-[#2d3748]">
                                                    <span className="font-semibold text-emerald-950">💡 深度解析：</span>
                                                    {currentQ.analysis}
                                                </p>
                                                <div className="mt-1 text-micro text-[#64748b]">
                                                    <span className="font-semibold text-[#475569]">📖 原文证据链：</span>
                                                    {currentQ.evidence}
                                                </div>

                                                {/* Drill-down consolidation action button */}
                                                <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 border-t border-emerald-200/60 pt-2.5">
                                                    <span className="text-micro text-emerald-800">
                                                        薄弱关联考点：{currentQ.weakPoint}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={handleTriggerDrillDown}
                                                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-emerald-700"
                                                    >
                                                        <Sparkles className="h-3 w-3" />
                                                        <span>
                                                            {drillDownSuccess ? "✓ 已加入强化计划" : "针对该点生成强化练习"}
                                                        </span>
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Realistic AgentComposer Bottom Bar */}
                            <div className="border-t border-[#f0f2f8] bg-white p-3 sm:p-4">
                                <div className="relative rounded-[1.75rem] border border-[#e5e7f2] bg-white p-1.5 shadow-[0_4px_20px_rgba(16,185,129,0.04)]">
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            className="grid h-8 w-8 place-items-center rounded-full text-[#8e94aa] hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                                            title="上传复习资料"
                                        >
                                            <FileText className="h-4 w-4" />
                                        </button>
                                        <input
                                            type="text"
                                            readOnly
                                            value="输入任何知识点或问答，私教将根据你的艾宾浩斯记忆模型即刻生成靶向考题..."
                                            className="flex-1 bg-transparent px-1 text-xs sm:text-sm text-[#8e94aa] outline-none cursor-default"
                                        />
                                        <Link
                                            to="/workspace/knowledge"
                                            className="grid h-8 w-8 place-items-center rounded-full bg-emerald-600 text-white shadow-xs transition-transform hover:scale-105"
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

            {/* Bottom 3 Capability Pillars */}
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-2xl border border-[#ebeef7] bg-white p-4 shadow-2xs">
                    <div className="flex items-center gap-2 font-bold text-xs text-[#111426]">
                        <Target className="h-4 w-4 text-emerald-600" />
                        <span>多模态知识图谱结构化</span>
                    </div>
                    <p className="mt-1.5 text-[11px] leading-relaxed text-[#64748b]">
                        散落的文档、论文与代码一键抽取为记忆卡、概念卡与推演卡，自适应构建知识图谱。
                    </p>
                </div>
                <div className="rounded-2xl border border-[#ebeef7] bg-white p-4 shadow-2xs">
                    <div className="flex items-center gap-2 font-bold text-xs text-[#111426]">
                        <Volume2 className="h-4 w-4 text-teal-600" />
                        <span>毫秒级语音背诵声学对齐</span>
                    </div>
                    <p className="mt-1.5 text-[11px] leading-relaxed text-[#64748b]">
                        上传录音或实时对麦克风背诵，智能体音素级实时比对纠错并生成精准熟练度评测。
                    </p>
                </div>
                <div className="rounded-2xl border border-[#ebeef7] bg-white p-4 shadow-2xs">
                    <div className="flex items-center gap-2 font-bold text-xs text-[#111426]">
                        <RotateCcw className="h-4 w-4 text-emerald-600" />
                        <span>错题溯源与艾宾浩斯排程</span>
                    </div>
                    <p className="mt-1.5 text-[11px] leading-relaxed text-[#64748b]">
                        精准捕捉认知盲区，针对薄弱点自动下钻生成巩固题集并科学计算最佳复习节点。
                    </p>
                </div>
            </div>
        </section>
    );
};

LandingKnowledgeMirrorSection.propTypes = {
    t: PropTypes.func.isRequired,
};

export default LandingKnowledgeMirrorSection;
