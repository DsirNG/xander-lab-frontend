import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { createInstance } from "i18next";
import { I18nextProvider, useTranslation } from "react-i18next";
import "../src/styles/index.css";
import zh from "../src/locales/zh";
import en from "../src/locales/en";
import Button from "@shared/ui/primitives/Button";
import CustomSelect from "@shared/ui/forms/CustomSelect";
import FormField from "@shared/ui/forms/FormField";
import TimeInput from "@shared/ui/forms/TimeInput";
import TimezoneSelect from "@shared/ui/forms/TimezoneSelect";
import CreatableMultiSelect from "@shared/ui/forms/CreatableMultiSelect";
import { formInputCls } from "@shared/ui/forms/formStyles";
import Modal from "@shared/ui/overlays/Modal";
import ConfirmModal from "@shared/ui/overlays/ConfirmModal";
import RowActionsMenu from "@shared/ui/overlays/RowActionsMenu";
import TourSpotlight from "@shared/ui/overlays/TourSpotlight";
import DataTable from "@shared/ui/data-display/DataTable";
import Pagination from "@shared/ui/navigation/Pagination";
import SidebarLayout from "@shared/ui/navigation/SidebarLayout";
import CodeBlock from "@shared/ui/data-display/CodeBlock";
import SyntaxHighlighter from "@shared/ui/data-display/SyntaxHighlighter";
import PhaseCard from "@shared/ui/data-display/PhaseCard";
import {
    ContentLayout,
    EnhancedDemoSection,
} from "@shared/ui/data-display/ContentLayout";
import BrowserWindow from "@shared/ui/preview/BrowserWindow";
import LoadingSpinner from "@shared/ui/feedback/LoadingSpinner";
import { Skeleton, TableSkeleton } from "@shared/ui/feedback/Skeleton";
import { ToastContainer } from "@shared/ui/feedback/Toast";
import ToastProvider from "@app/providers/ToastProvider";
import { useToast } from "@shared/hooks/useToast";
import { Check, Pencil, Trash2 } from "lucide-react";
import { review } from "./locales";

const groups = {
    controls: [
        "Button",
        "FormField",
        "CustomSelect",
        "TimeInput",
        "TimezoneSelect",
        "CreatableMultiSelect",
    ],
    overlays: ["Modal", "ConfirmModal", "RowActionsMenu", "TourSpotlight"],
    data: [
        "DataTable",
        "Pagination",
        "PhaseCard",
        "CodeBlock",
        "SyntaxHighlighter",
    ],
    feedback: ["Toast", "LoadingSpinner", "Skeleton", "TableSkeleton"],
    layout: [
        "ContentLayout",
        "EnhancedDemoSection",
        "BrowserWindow",
        "SidebarLayout",
    ],
};
const code = "const spacing = [4, 8, 12, 16, 24, 32];";
const instance = createInstance();

function Preview() {
    const { t } = useTranslation("review");
    const toast = useToast();
    const [group, setGroup] = useState("controls");
    const [query, setQuery] = useState("");
    const [theme, setTheme] = useState("light");
    const [modal, setModal] = useState(null);
    const [status, setStatus] = useState("ready");
    const [value, setValue] = useState("ready");
    const [zone, setZone] = useState("Asia/Singapore");
    const [tags, setTags] = useState([]);
    const [page, setPage] = useState(1);
    const [size, setSize] = useState(5);
    const [time, setTime] = useState("09:00");
    const [busy, setBusy] = useState(false);
    const notify = () => toast.success(t("done"));
    const options = ["ready", "empty", "loading", "error"].map((value) => ({
        value,
        label: t(value),
    }));
    const examples = {
        Button: (
            <div className="flex flex-wrap items-center gap-3">
                {[
                    "primary",
                    "ink",
                    "outline",
                    "ghost",
                    "danger",
                    "dangerOutline",
                    "link",
                ].map((variant) => (
                    <Button key={variant} variant={variant} onClick={notify}>
                        {variant}
                    </Button>
                ))}
                <div className="flex w-full flex-wrap items-center gap-3">
                    {["xs", "sm", "md", "lg"].map((size) => (
                        <Button
                            key={size}
                            size={size}
                            variant="outline"
                            onClick={notify}
                        >
                            {size}
                        </Button>
                    ))}
                    <Button
                        variant="ghost"
                        icon={Check}
                        aria-label={t("done")}
                        onClick={notify}
                    />
                    <Button disabled>{t("disabled")}</Button>
                    <Button
                        loading={busy}
                        onClick={() => {
                            setBusy(true);
                            setTimeout(() => setBusy(false), 900);
                        }}
                    >
                        {t("tryLoading")}
                    </Button>
                </div>
            </div>
        ),
        FormField: (
            <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                    label={t("name")}
                    htmlFor="sample-name"
                    hint={t("hint")}
                >
                    <input
                        id="sample-name"
                        className={formInputCls}
                        placeholder={t("name")}
                    />
                </FormField>
                <FormField label={t("notes")} htmlFor="sample-notes">
                    <textarea
                        id="sample-notes"
                        className={formInputCls}
                        placeholder={t("notes")}
                    />
                </FormField>
            </div>
        ),
        CustomSelect: (
            <div className="grid gap-3 sm:grid-cols-3">
                {["md", "sm", "xs"].map((size) => (
                    <CustomSelect
                        key={size}
                        size={size}
                        value={value}
                        options={options}
                        onChange={setValue}
                        placeholder={t("select")}
                        error={size === "xs"}
                    />
                ))}
            </div>
        ),
        TimeInput: (
            <TimeInput
                aria-label={t("time")}
                value={time}
                onChange={(e) => setTime(e.target.value)}
                openOnClick
            />
        ),
        TimezoneSelect: <TimezoneSelect value={zone} onChange={setZone} />,
        CreatableMultiSelect: (
            <CreatableMultiSelect
                value={tags}
                onChange={setTags}
                options={[t("name"), t("notes"), t("ready")]}
                placeholder={t("tags")}
            />
        ),
        Modal: (
            <Button variant="outline" onClick={() => setModal("modal")}>
                {t("open")}
            </Button>
        ),
        ConfirmModal: (
            <Button variant="dangerOutline" onClick={() => setModal("confirm")}>
                {t("confirm")}
            </Button>
        ),
        RowActionsMenu: (
            <RowActionsMenu
                align="left"
                ariaLabel={t("actions")}
                actions={[
                    {
                        key: "edit",
                        label: t("edit"),
                        icon: Pencil,
                        onClick: notify,
                    },
                    {
                        key: "delete",
                        label: t("confirm"),
                        icon: Trash2,
                        danger: true,
                        onClick: () => setModal("confirm"),
                    },
                ]}
            />
        ),
        TourSpotlight: (
            <Button
                id="review-tour"
                variant="outline"
                onClick={() => setModal("tour")}
            >
                {t("tour")}
            </Button>
        ),
        DataTable: (
            <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                    {options.map(({ value, label }) => (
                        <Button
                            key={value}
                            size="sm"
                            variant={status === value ? "ink" : "ghost"}
                            onClick={() => setStatus(value)}
                        >
                            {label}
                        </Button>
                    ))}
                </div>
                <div className="h-72">
                    <DataTable
                        minWidth="280px"
                        columns={[
                            { key: "name", title: t("name") },
                            { key: "status", title: t("status") },
                        ]}
                        rows={
                            status === "ready"
                                ? [
                                      {
                                          id: 1,
                                          name: t("example"),
                                          status: t("ready"),
                                      },
                                  ]
                                : []
                        }
                        error={status === "error" ? t("error") : null}
                        onRetry={() => setStatus("ready")}
                        onRetryLabel={t("retry")}
                        loading={status === "loading"}
                        loadingText={t("loading")}
                        emptyTitle={t("empty")}
                        page={1}
                        pageSize={5}
                        total={status === "ready" ? 1 : 0}
                    />
                </div>
            </div>
        ),
        Pagination: (
            <Pagination
                page={page}
                pageSize={size}
                total={80}
                onPageChange={setPage}
                onPageSizeChange={(next) => {
                    setSize(next);
                    setPage(1);
                }}
            />
        ),
        PhaseCard: (
            <div className="pl-4">
                <PhaseCard
                    index={0}
                    phase={{
                        title: t("example"),
                        desc: t("hint"),
                        points: [t("ready"), t("done")],
                    }}
                />
            </div>
        ),
        CodeBlock: <CodeBlock language="js" code={code} />,
        SyntaxHighlighter: (
            <SyntaxHighlighter
                language="js"
                customStyle={{
                    background: "var(--color-surface)",
                    color: "var(--color-ink)",
                    padding: "1rem",
                }}
            >
                {code}
            </SyntaxHighlighter>
        ),
        Toast: (
            <div className="flex flex-wrap gap-2">
                {["success", "info", "warning", "error"].map((type) => (
                    <Button
                        key={type}
                        variant="outline"
                        onClick={() => toast[type](t(type))}
                    >
                        {t(type)}
                    </Button>
                ))}
            </div>
        ),
        LoadingSpinner: (
            <div className="flex flex-wrap items-center gap-6">
                {["sm", "md", "lg"].map((size) => (
                    <LoadingSpinner
                        key={size}
                        fullScreen={false}
                        size={size}
                        text={t("loading")}
                    />
                ))}
            </div>
        ),
        Skeleton: (
            <div className="space-y-3">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-3 w-2/3" />
            </div>
        ),
        TableSkeleton: <TableSkeleton rows={3} />,
        ContentLayout: (
            <ContentLayout
                item={{ id: "example", title: t("example"), desc: t("hint") }}
            >
                <div className="text-body">{t("notes")}</div>
            </ContentLayout>
        ),
        EnhancedDemoSection: (
            <EnhancedDemoSection
                title={t("example")}
                desc={t("hint")}
                code={code}
            >
                <Button variant="outline" onClick={notify}>
                    {t("try")}
                </Button>
            </EnhancedDemoSection>
        ),
        BrowserWindow: (
            <BrowserWindow>
                <div className="p-4 text-ink">{t("example")}</div>
            </BrowserWindow>
        ),
        SidebarLayout: (
            <div className="relative overflow-hidden rounded-card border border-border">
                <SidebarLayout
                    title={t("title")}
                    description={t("hint")}
                    activeId="example"
                    items={[
                        {
                            id: "example",
                            path: "/",
                            title: t("example"),
                            tag: t("layout"),
                        },
                    ]}
                />
            </div>
        ),
    };
    const items = query.trim()
        ? Object.values(groups)
              .flat()
              .filter((name) =>
                  name.toLowerCase().includes(query.trim().toLowerCase()),
              )
        : groups[group];
    return (
        <div className="min-h-dvh bg-surface text-ink">
            <header className="sticky top-0 z-20 border-b border-border bg-canvas">
                <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-8">
                    <div className="text-title">
                        DinQorAI{" "}
                        <span className="ml-2 text-caption text-ink-muted">
                            {t("title")}
                        </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                                const next =
                                    theme === "dark" ? "light" : "dark";
                                setTheme(next);
                                document.documentElement.dataset.theme = next;
                            }}
                        >
                            {t(theme === "dark" ? "light" : "dark")}
                        </Button>
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                                const next =
                                    instance.language === "zh" ? "en" : "zh";
                                instance.changeLanguage(next);
                                document.documentElement.lang = next;
                            }}
                        >
                            {instance.language === "zh" ? "English" : "中文"}
                        </Button>
                    </div>
                </div>
            </header>
            <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-8 lg:grid-cols-[12rem_minmax(0,1fr)]">
                <aside className="self-start lg:sticky lg:top-20">
                    <input
                        aria-label={t("search")}
                        placeholder={t("search")}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className={formInputCls}
                    />
                    <nav
                        aria-label={t("title")}
                        className="mt-3 flex flex-wrap gap-1 lg:flex-col"
                    >
                        {Object.keys(groups).map((id) => (
                            <button
                                key={id}
                                type="button"
                                aria-current={
                                    group === id && !query ? "page" : undefined
                                }
                                onClick={() => {
                                    setGroup(id);
                                    setQuery("");
                                    window.scrollTo(0, 0);
                                }}
                                className={`rounded-menu-item px-3 py-2 text-left text-body hover:bg-surface-muted ${group === id && !query ? "bg-surface-muted font-semibold" : "text-ink-muted"}`}
                            >
                                {t(id)}{" "}
                                <span className="ml-1 text-caption text-ink-faint">
                                    {groups[id].length}
                                </span>
                            </button>
                        ))}
                    </nav>
                </aside>
                <main className="min-w-0 space-y-4">
                    <div className="pb-2">
                        <h1 className="text-display">
                            {t(query.trim() ? "results" : group)}
                        </h1>
                        <p className="mt-2 text-body text-ink-muted">
                            {t("description")}
                        </p>
                    </div>
                    {items.map((name) => (
                        <section
                            key={name}
                            className="min-w-0 rounded-card border border-border bg-canvas p-4 sm:p-6"
                        >
                            <h2 className="mb-4 text-title">{name}</h2>
                            {examples[name]}
                        </section>
                    ))}
                    {!items.length && (
                        <p className="text-body text-ink-muted">{t("empty")}</p>
                    )}
                </main>
            </div>
            <Modal
                isOpen={modal === "modal"}
                onClose={() => setModal(null)}
                title={t("example")}
                height={300}
                footer={
                    <Button onClick={() => setModal(null)}>{t("close")}</Button>
                }
            >
                <FormField label={t("name")} htmlFor="modal-name">
                    <input id="modal-name" className={formInputCls} />
                </FormField>
            </Modal>
            <ConfirmModal
                isOpen={modal === "confirm"}
                title={t("confirm")}
                message={t("hint")}
                onClose={() => setModal(null)}
                onConfirm={() => {
                    setModal(null);
                    notify();
                }}
            />
            {modal === "tour" && (
                <TourSpotlight
                    targetConfig={{
                        id: "review-tour",
                        text: t("tour"),
                        desc: t("hint"),
                    }}
                    onSkip={() => setModal(null)}
                />
            )}
            <ToastContainer />
        </div>
    );
}
instance
    .init({
        lng: "zh",
        fallbackLng: "en",
        interpolation: { escapeValue: false },
        resources: {
            zh: { translation: zh, review: review.zh },
            en: { translation: en, review: review.en },
        },
    })
    .then(() => {
        createRoot(document.getElementById("root")).render(
            <I18nextProvider i18n={instance}>
                <MemoryRouter>
                    <ToastProvider>
                        <Preview />
                    </ToastProvider>
                </MemoryRouter>
            </I18nextProvider>,
        );
    });
