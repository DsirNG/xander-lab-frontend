import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Archive, GitBranch, Plus, Sparkles } from "lucide-react";
import DataTable from "@components/common/DataTable";
import RowActionsMenu from "@components/common/RowActionsMenu";
import ConfirmModal from "@components/common/ConfirmModal";
import Button from "@components/common/Button";
import { useToast } from "@/hooks/useToast";
import { agentSkillService, parseSkillToolNames } from "../services/agentSkillService";
import SkillFormModal from "../components/SkillFormModal";

const PAGE_SIZE = 10;

/**
 * 用户技能库：管理自己写给智能体的「做法说明」。
 *
 * <p>技能不是可执行能力：它只改变模型这类活怎么做，不会新增工具，
 * 也不会绕过服务端的工具表与审批策略。所以这里的编辑语义是「出新版本」——
 * 后端按 (skillKey, version) 存不可变版本，模型只读每个 key 最新的那条 ACTIVE。</p>
 */
const AgentSkillsPage = () => {
    const { t } = useTranslation();
    const toast = useToast();
    const [skills, setSkills] = useState([]);
    const [tools, setTools] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(PAGE_SIZE);
    const [formOpen, setFormOpen] = useState(false);
    const [prefill, setPrefill] = useState(null);
    const [archiving, setArchiving] = useState(null);
    const [archiveBusy, setArchiveBusy] = useState(false);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            setLoadError("");
            const [skillData, toolData] = await Promise.all([
                agentSkillService.list(),
                agentSkillService.listTools({ _silent: true }),
            ]);
            setSkills(skillData || []);
            setTools(toolData || []);
        } catch (err) {
            setLoadError(
                err?.response?.data?.message ||
                    err.message ||
                    t("blog.agentSkills.loadFailed"),
            );
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // 客户端分页：技能总量是「一个人写给自己」的量级，不值得为它加一个分页接口。
    const total = skills.length;
    const pageRows = useMemo(
        () => skills.slice((page - 1) * pageSize, page * pageSize),
        [skills, page, pageSize],
    );

    const openCreate = () => {
        setPrefill(null);
        setFormOpen(true);
    };

    const openNewVersion = (skill) => {
        setPrefill(skill);
        setFormOpen(true);
    };

    const handleArchive = async () => {
        if (!archiving) return;
        try {
            setArchiveBusy(true);
            await agentSkillService.archive(archiving.id);
            toast.success(t("blog.agentSkills.archived"));
            setArchiving(null);
            // 归档掉当前页最后一条时回退一页，避免停在空页上。
            const remaining = total - 1;
            const lastPage = Math.max(1, Math.ceil(remaining / pageSize));
            if (page > lastPage) setPage(lastPage);
            await loadData();
        } catch (err) {
            toast.error(
                err?.response?.data?.message ||
                    err.message ||
                    t("blog.agentSkills.archiveFailed"),
            );
        } finally {
            setArchiveBusy(false);
        }
    };

    const columns = [
        {
            key: "skill",
            title: t("blog.agentSkills.columnSkill"),
            width: "30%",
            render: (skill) => (
                <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                        <span className="truncate text-caption font-semibold text-ink">
                            {skill.name}
                        </span>
                        <span className="shrink-0 rounded-md bg-surface-muted px-1.5 py-0.5 text-micro font-semibold text-ink-muted">
                            v{skill.version}
                        </span>
                    </div>
                    <div className="mt-0.5 truncate font-mono text-micro text-ink-faint">
                        {skill.skillKey}
                    </div>
                </div>
            ),
        },
        {
            key: "description",
            title: t("blog.agentSkills.columnDescription"),
            width: "34%",
            render: (skill) => (
                <span className="line-clamp-2 text-micro leading-relaxed text-ink-secondary">
                    {skill.description}
                </span>
            ),
        },
        {
            key: "tools",
            title: t("blog.agentSkills.columnTools"),
            width: "12%",
            render: (skill) => {
                const names = parseSkillToolNames(skill.toolNamesJson);
                if (names.length === 0) {
                    return (
                        <span className="text-micro text-ink-faint">
                            {t("blog.agentSkills.noTools")}
                        </span>
                    );
                }
                return (
                    <span className="text-micro font-semibold text-ink-secondary">
                        {t("blog.agentSkills.toolCount", {
                            count: names.length,
                        })}
                    </span>
                );
            },
        },
        {
            key: "updatedAt",
            title: t("blog.agentSkills.columnUpdatedAt"),
            width: "14%",
            render: (skill) => (
                <span className="text-micro text-ink-muted">
                    {skill.updatedAt
                        ? new Date(skill.updatedAt).toLocaleString()
                        : "—"}
                </span>
            ),
        },
        {
            key: "actions",
            title: t("blog.agentSkills.columnActions"),
            width: "10%",
            render: (skill) => (
                <RowActionsMenu
                    align="right"
                    ariaLabel={t("blog.agentSkills.actionsFor", {
                        name: skill.name,
                    })}
                    actions={[
                        {
                            key: "version",
                            label: t("blog.agentSkills.newVersion"),
                            icon: GitBranch,
                            onClick: () => openNewVersion(skill),
                        },
                        {
                            key: "archive",
                            label: t("blog.agentSkills.archive"),
                            icon: Archive,
                            danger: true,
                            onClick: () => setArchiving(skill),
                        },
                    ]}
                />
            ),
        },
    ];

    return (
        <div className="mx-auto flex h-full min-h-0 w-full max-w-5xl flex-col overflow-hidden p-4 py-short-tight sm:p-6">
            <div className="mb-4 flex shrink-0 items-start justify-between gap-4">
                <div className="min-w-0">
                    <div className="flex items-center gap-2 text-title text-ink">
                        <Sparkles
                            className="h-4 w-4 shrink-0 text-accent"
                            aria-hidden="true"
                        />
                        <span className="truncate">
                            {t("blog.agentSkills.title")}
                        </span>
                    </div>
                    <div className="mt-1 text-caption text-ink-muted">
                        {t("blog.agentSkills.subtitle")}
                    </div>
                </div>
                <Button
                    onClick={openCreate}
                    size="sm"
                    icon={Plus}
                    className="shrink-0"
                >
                    {t("blog.agentSkills.create")}
                </Button>
            </div>

            <div className="flex min-h-0 flex-1 flex-col">
                <DataTable
                    columns={columns}
                    rows={pageRows}
                    loading={loading}
                    error={loadError}
                    errorTitle={t("blog.agentSkills.loadFailed")}
                    onRetry={loadData}
                    onRetryLabel={t("blog.agentImages.retry")}
                    emptyTitle={t("blog.agentSkills.emptyTitle")}
                    emptyHint={t("blog.agentSkills.emptyHint")}
                    emptyIcon={Sparkles}
                    minWidth="860px"
                    page={page}
                    pageSize={pageSize}
                    total={total}
                    onPageChange={setPage}
                    onPageSizeChange={(size) => {
                        setPageSize(size);
                        setPage(1);
                    }}
                    paginationDisabled={total === 0}
                />
            </div>

            <SkillFormModal
                isOpen={formOpen}
                tools={tools}
                prefill={prefill}
                onClose={() => setFormOpen(false)}
                onSaved={loadData}
            />

            <ConfirmModal
                isOpen={Boolean(archiving)}
                onClose={() => setArchiving(null)}
                onConfirm={handleArchive}
                confirming={archiveBusy}
                title={t("blog.agentSkills.archiveTitle")}
                message={t("blog.agentSkills.archiveConfirm", {
                    name: archiving?.name || "",
                })}
                confirmText={t("blog.agentSkills.archive")}
                cancelText={t("common.cancel")}
            />
        </div>
    );
};

export default AgentSkillsPage;
