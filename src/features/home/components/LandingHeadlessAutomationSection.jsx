import React, { useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import {
    Activity,
    ArrowRight,
    Bot,
    Check,
    CheckCircle2,
    Clock,
    FileCheck,
    Globe,
    Layers,
    Mail,
    Plus,
    Radio,
    RefreshCw,
    Search,
    Send,
    Shield,
    Sparkles,
    Terminal,
    Workflow,
    Zap,
} from "lucide-react";

const PLANS = [
    {
        id: "daily_ai",
        title: "AI 每日技术前沿速递",
        cron: "每天 08:00 (Cron)",
        status: "ACTIVE",
        platforms: "CSDN · 掘金 · 社区",
        lastRun: "今天 08:00:12",
    },
    {
        id: "threejs_weekly",
        title: "Three.js 3D 渲染实战周刊",
        cron: "每周一 09:00",
        status: "ACTIVE",
        platforms: "掘金 · 社区 · 邮件",
        lastRun: "08-25 09:00:04",
    },
    {
        id: "deep_learning",
        title: "大模型架构与论文深度解析",
        cron: "Webhook 实时触发",
        status: "IDLE",
        platforms: "CSDN · 社区",
        lastRun: "08-28 14:22:18",
    },
];

const PIPELINE_STEPS = [
    {
        id: "trigger",
        name: "01. 定时触发",
        tag: "Cron 08:00",
        desc: "全网热点监听与多源论文抓取",
        done: true,
    },
    {
        id: "draft",
        name: "02. 智能体调研成文",
        tag: "gpt-5.6-terra",
        desc: "深度结构化推演、代码排版与多模态图文编排",
        done: true,
    },
    {
        id: "gate",
        name: "03. 质控门禁",
        tag: "Fail-Closed",
        desc: "静态合规审查、代码测试与敏感词核验",
        done: true,
    },
    {
        id: "dispatch",
        name: "04. MCP 多端分发",
        tag: "Multi-Channel",
        desc: "CSDN / 掘金 / 社区 / 邮件 并发广播",
        done: true,
    },
];

const LandingHeadlessAutomationSection = ({ t }) => {
    const [selectedPlanId, setSelectedPlanId] = useState("daily_ai");
    const [runningTrigger, setRunningTrigger] = useState(false);

    const currentPlan = PLANS.find((p) => p.id === selectedPlanId) || PLANS[0];

    const handleManualTrigger = () => {
        setRunningTrigger(true);
        setTimeout(() => setRunningTrigger(false), 2000);
    };

    return (
        <section className="relative mx-auto mt-28 w-full max-w-7xl px-3 sm:px-6 lg:px-8">
            {/* Ambient Lighting */}
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -left-20 top-1/4 h-96 w-96 rounded-full bg-orange-400/15 blur-3xl"
            />
            <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-20 top-1/2 h-96 w-96 rounded-full bg-amber-400/15 blur-3xl"
            />

            {/* Section Header */}
            <div className="text-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-orange-200/80 bg-orange-50/80 px-4 py-1.5 text-xs font-semibold text-orange-700 shadow-xs backdrop-blur-md">
                    <Radio className="h-3.5 w-3.5 text-orange-600" />
                    <span>{t("landing.headlessAutomation.badge", "无人值守 · 工业级内容自动化生产流水线")}</span>
                </div>
                <h2 className="mt-4 text-2xl font-black tracking-tight text-[#111426] sm:text-4xl">
                    {t("landing.headlessAutomation.title", "Headless Automation —— 无人值守内容流水线")}
                </h2>
                <p className="mx-auto mt-3 max-w-3xl text-xs sm:text-sm leading-relaxed text-[#606782]">
                    {t(
                        "landing.headlessAutomation.subtitle",
                        "从全网自主选题、深度撰写，到 Fail-Closed 质检门禁与多平台 MCP 协议分发，实现 7x24 小时真正的无人值守自动化内容生产与发布。",
                    )}
                </p>
            </div>

            {/* Realistic Headless Automation Workbench Frame */}
            <div className="relative mx-auto mt-10 w-full max-w-5xl">
                {/* Outer Frame */}
                <div className="overflow-hidden rounded-3xl border border-[#e2e8f0] bg-white shadow-[0_24px_70px_-15px_rgba(249,115,22,0.14)]">
                    {/* Top Window Bar */}
                    <div className="flex h-11 items-center justify-between border-b border-[#f0f2f8] bg-[#fafbfe] px-4">
                        <div className="flex items-center gap-2">
                            <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
                            <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
                            <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
                            <div className="ml-3 flex items-center gap-2 border-l border-[#e2e8f0] pl-3">
                                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-xs font-bold text-[#111426]">
                                    Headless 内容流水线引擎
                                </span>
                                <span className="hidden sm:inline-block rounded-full bg-orange-50 px-2 py-0.5 text-[10px] font-semibold text-orange-700">
                                    gpt-5.6-terra · Fail-Closed 质检门禁
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Link
                                to="/workspace/plans"
                                className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-orange-600 hover:bg-orange-50 transition-colors"
                            >
                                <span>管理全部发文计划</span>
                                <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                        </div>
                    </div>

                    {/* Window Layout: Left Plans Sidebar Slice + Right Execution Pipeline View */}
                    <div className="flex min-h-[520px] flex-col md:flex-row">
                        {/* Left Plans Sidebar Slice */}
                        <div className="flex w-full md:w-64 shrink-0 flex-col justify-between border-r border-[#f0f2f8] bg-[#fafafc] p-3">
                            <div>
                                {/* New Plan Button */}
                                <button
                                    type="button"
                                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-orange-600 py-2.5 text-xs font-semibold text-white shadow-xs transition-transform active:scale-95 hover:bg-orange-700"
                                >
                                    <Plus className="h-4 w-4" />
                                    <span>新建自动化流水线</span>
                                </button>

                                {/* Search Input Mock */}
                                <div className="mt-3 flex items-center gap-2 rounded-xl border border-[#e2e8f0] bg-white px-2.5 py-1.5 text-xs text-[#8e94aa]">
                                    <Search className="h-3.5 w-3.5" />
                                    <span className="text-[11px]">搜索计划与任务...</span>
                                </div>

                                {/* Plans List */}
                                <div className="mt-3 space-y-1">
                                    <div className="px-1 text-[10px] font-bold text-[#9ea3b9] uppercase tracking-wider">
                                        自动化定时计划
                                    </div>
                                    {PLANS.map((plan) => {
                                        const isSelected = selectedPlanId === plan.id;
                                        return (
                                            <button
                                                key={plan.id}
                                                type="button"
                                                onClick={() => setSelectedPlanId(plan.id)}
                                                className={`group flex w-full cursor-pointer items-center justify-between rounded-xl px-2.5 py-2 text-left transition-colors ${
                                                    isSelected
                                                        ? "bg-orange-50 text-orange-950 font-semibold"
                                                        : "text-[#242741] hover:bg-[#f7f6fc]"
                                                }`}
                                            >
                                                <div className="flex min-w-0 items-center gap-2">
                                                    <Workflow
                                                        className={`h-3.5 w-3.5 shrink-0 ${
                                                            isSelected ? "text-orange-600" : "text-[#9ea3b9]"
                                                        }`}
                                                    />
                                                    <div className="min-w-0">
                                                        <div className="truncate text-xs">{plan.title}</div>
                                                        <div className="text-[10px] text-[#9ea3b9]">{plan.cron}</div>
                                                    </div>
                                                </div>
                                                <span className="shrink-0 rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold text-emerald-600">
                                                    {plan.status}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Sidebar Footer Stats */}
                            <div className="rounded-xl border border-[#edf0f8] bg-white p-2.5 text-center">
                                <div className="text-[10px] text-[#8e94aa]">Cron 守护进程</div>
                                <div className="mt-0.5 text-xs font-bold text-emerald-600">● 7x24h 自动轮询就绪</div>
                            </div>
                        </div>

                        {/* Right Main Pipeline Viewport Slice */}
                        <div className="flex min-w-0 flex-1 flex-col justify-between bg-white">
                            {/* Pipeline Header */}
                            <div className="flex items-center justify-between border-b border-[#f0f2f8] px-4 py-2.5">
                                <div className="min-w-0">
                                    <h3 className="truncate text-xs sm:text-sm font-bold text-[#111426]">
                                        {currentPlan.title}
                                    </h3>
                                    <div className="text-[10px] text-[#8e94aa]">
                                        调度周期：{currentPlan.cron} · 分发目标：{currentPlan.platforms}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={handleManualTrigger}
                                        disabled={runningTrigger}
                                        className="flex items-center gap-1.5 rounded-lg border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700 transition-colors hover:bg-orange-100 disabled:opacity-50"
                                    >
                                        <Zap className="h-3.5 w-3.5" />
                                        <span>{runningTrigger ? "流水线执行中..." : "立即单次触发"}</span>
                                    </button>
                                </div>
                            </div>

                            {/* Main Body: DAG Flow + MCP Matrix + Log Stream */}
                            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
                                {/* 1. DAG 拓扑流水线视窗 */}
                                <div className="rounded-2xl border border-border bg-[#fcfdff] p-4 shadow-xs">
                                    <div className="flex items-center justify-between border-b border-border pb-2.5">
                                        <div className="flex items-center gap-2 text-xs font-bold text-ink">
                                            <Workflow className="h-4 w-4 text-orange-600" />
                                            <span>DAG 流水线阶段状态</span>
                                        </div>
                                        <span className="rounded bg-emerald-50 px-2 py-0.5 text-micro font-bold text-emerald-700">
                                            PASS (100% 通过)
                                        </span>
                                    </div>

                                    <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-4 gap-2">
                                        {PIPELINE_STEPS.map((step, idx) => (
                                            <div
                                                key={step.id}
                                                className="relative flex flex-col justify-between rounded-xl border border-border bg-surface p-3 text-left shadow-2xs"
                                            >
                                                <div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-mono text-micro font-bold text-orange-600">
                                                            {step.tag}
                                                        </span>
                                                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                                    </div>
                                                    <div className="mt-1 text-xs font-bold text-ink">
                                                        {step.name}
                                                    </div>
                                                    <p className="mt-1 text-[10px] leading-relaxed text-ink-muted">
                                                        {step.desc}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* 2. MCP 多平台并行同步矩阵 */}
                                <div className="rounded-2xl border border-border bg-surface p-4 shadow-xs">
                                    <div className="flex items-center justify-between border-b border-border pb-2">
                                        <div className="flex items-center gap-2 text-xs font-bold text-ink">
                                            <Globe className="h-4 w-4 text-blue-600" />
                                            <span>MCP 多端并发分发成功回执</span>
                                        </div>
                                        <span className="text-micro font-mono font-bold text-emerald-600">
                                            ALL_CHANNELS_SYNCED
                                        </span>
                                    </div>
                                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                                        <div className="rounded-xl border border-border bg-canvas p-2.5 text-center">
                                            <div className="text-micro text-ink-muted">本站官方社区</div>
                                            <div className="mt-0.5 font-bold text-emerald-600">✓ 已发布上线</div>
                                        </div>
                                        <div className="rounded-xl border border-border bg-canvas p-2.5 text-center">
                                            <div className="text-micro text-ink-muted">CSDN (MCP)</div>
                                            <div className="mt-0.5 font-bold text-emerald-600">✓ 同步 (ID: 139281)</div>
                                        </div>
                                        <div className="rounded-xl border border-border bg-canvas p-2.5 text-center">
                                            <div className="text-micro text-ink-muted">掘金社区 (MCP)</div>
                                            <div className="mt-0.5 font-bold text-emerald-600">✓ 同步 (ID: 742189)</div>
                                        </div>
                                        <div className="rounded-xl border border-border bg-canvas p-2.5 text-center">
                                            <div className="text-micro text-ink-muted">VIP 邮件订阅</div>
                                            <div className="mt-0.5 font-bold text-emerald-600">✓ 发送 (1,280封)</div>
                                        </div>
                                    </div>
                                </div>

                                {/* 3. 实时终端日志流 (Dark Terminal) */}
                                <div className="overflow-hidden rounded-2xl border border-[#1e293b] bg-[#0d111d] p-3 text-white shadow-xs font-mono text-[11px]">
                                    <div className="flex items-center justify-between border-b border-white/10 pb-2 text-micro text-slate-400">
                                        <span className="flex items-center gap-1.5 text-orange-400">
                                            <Terminal className="h-3.5 w-3.5" />
                                            <span>headless_worker.log</span>
                                        </span>
                                        <span className="text-emerald-400">STREAMING ACTIVE</span>
                                    </div>
                                    <div className="mt-2 space-y-1 text-slate-300">
                                        <div><span className="text-slate-500">[08:00:01]</span> <span className="text-amber-400">CRON:</span> Trigger fired for planId=daily_ai</div>
                                        <div><span className="text-slate-500">[08:00:04]</span> <span className="text-blue-400">AGENT:</span> gpt-5.6-terra generated article draft (3,240 words)</div>
                                        <div><span className="text-slate-500">[08:00:08]</span> <span className="text-emerald-400">GATE:</span> Fail-Closed lint passed (0 syntax/sensitive issues)</div>
                                        <div><span className="text-slate-500">[08:00:12]</span> <span className="text-purple-400">MCP:</span> Broadcasted to 4 channels simultaneously in 380ms</div>
                                    </div>
                                </div>
                            </div>

                            {/* Bottom Composer Bar */}
                            <div className="border-t border-[#f0f2f8] bg-white p-3 sm:p-4">
                                <div className="relative rounded-[1.75rem] border border-[#e5e7f2] bg-white p-1.5 shadow-[0_4px_20px_rgba(249,115,22,0.04)]">
                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            className="grid h-8 w-8 place-items-center rounded-full text-[#8e94aa] hover:bg-orange-50 hover:text-orange-700 transition-colors"
                                            title="流水线配置"
                                        >
                                            <Layers className="h-4 w-4" />
                                        </button>
                                        <input
                                            type="text"
                                            readOnly
                                            value="设置文章主题、Cron 表达式或 MCP 目标端点，智能体将自动接管全部生成流水线..."
                                            className="flex-1 bg-transparent px-1 text-xs sm:text-sm text-[#8e94aa] outline-none cursor-default"
                                        />
                                        <Link
                                            to="/workspace/plans"
                                            className="grid h-8 w-8 place-items-center rounded-full bg-orange-600 text-white shadow-xs transition-transform hover:scale-105"
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
                        <Clock className="h-4 w-4 text-orange-600" />
                        <span>Cron 7x24h 自动化调度</span>
                    </div>
                    <p className="mt-1.5 text-[11px] leading-relaxed text-[#64748b]">
                        按分钟/按天/按周自由配置调度排程，支持 Webhook 事件驱动与即时热点唤醒。
                    </p>
                </div>
                <div className="rounded-2xl border border-[#ebeef7] bg-white p-4 shadow-2xs">
                    <div className="flex items-center gap-2 font-bold text-xs text-[#111426]">
                        <Shield className="h-4 w-4 text-emerald-600" />
                        <span>Fail-Closed 严格质控门禁</span>
                    </div>
                    <p className="mt-1.5 text-[11px] leading-relaxed text-[#64748b]">
                        成文自动进入语法排版纠错、代码沙箱测试与敏感词核验，任何异常立即熔断闭合。
                    </p>
                </div>
                <div className="rounded-2xl border border-[#ebeef7] bg-white p-4 shadow-2xs">
                    <div className="flex items-center gap-2 font-bold text-xs text-[#111426]">
                        <Globe className="h-4 w-4 text-blue-600" />
                        <span>MCP 协议多端并发分发</span>
                    </div>
                    <p className="mt-1.5 text-[11px] leading-relaxed text-[#64748b]">
                        一键直连 CSDN、掘金、微信公众平台与邮件系统，毫秒级完成全渠道同步广播。
                    </p>
                </div>
            </div>
        </section>
    );
};

LandingHeadlessAutomationSection.propTypes = {
    t: PropTypes.func.isRequired,
};

export default LandingHeadlessAutomationSection;
