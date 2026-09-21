import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Menu } from "lucide-react";
import LiveDemoSandbox from "../components/demo/LiveDemoSandbox";
import ComponentService from "../services/componentService";
import { useToast } from "@shared/hooks/useToast";
import useIsMobile from "@shared/hooks/useIsMobile";
import ShareHeader from "../components/share/ShareHeader";
import ShareSidebar from "../components/share/ShareSidebar";
import ShareDrawer from "../components/share/ShareDrawer";
import ShareModals from "../components/share/ShareModals";
import useComponentShareTour from "../hooks/useComponentShareTour";
import {
    INIT_FILES,
    INIT_CSS,
    INIT_WRAPPER,
    INIT_SCENARIOS,
    INIT_META,
} from "../components/share/sharePresets";

const ComponentShare = () => {
    const navigate = useNavigate();
    const toast = useToast();
    const { t } = useTranslation();

    // --- 基础信息状态 ---
    const [meta, setMeta] = useState({
        titleZh: "",
        titleEn: "",
        version: "1.0.0",
        descriptionZh: "",
        descriptionEn: "",
    });

    // --- 核心资产状态 ---
    const [libFiles, setLibFiles] = useState([
        { name: "Index.jsx", content: "" },
    ]);
    const [activeLibIdx, setActiveLibIdx] = useState(0);
    const [wrapperCode, setWrapperCode] = useState("");
    const [cssCode, setCssCode] = useState("");

    // --- 场景状态 ---
    const [scenarios, setScenarios] = useState([
        { id: "1", titleZh: "演示", titleEn: "Demo", code: "" },
    ]);
    const [activeSIdx, setActiveSIdx] = useState(0);

    // --- 界面控制状态 ---
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [infTab, setInfTab] = useState("logic");

    // --- 移动端侧边栏控制 ---
    const isMobile = useIsMobile();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

    useEffect(() => {
        if (!isMobile) setIsSidebarOpen(false);
    }, [isMobile]);

    // --- 使用样例说明层 ---
    const [helpModalOpen, setHelpModalOpen] = useState(false);
    const [helpType, setHelpType] = useState("meta");

    const {
        currentTourTarget,
        tourStep,
        setTourStep,
        skipTour: handleTourSpotlightSkip,
    } = useComponentShareTour({
        helpModalOpen,
        setDrawerOpen,
        setInfTab,
        toast,
    });

    // --- 场景编辑状态 ---
    const [editScenarioModalOpen, setEditScenarioModalOpen] = useState(false);
    const [editingScenarioIndex, setEditingScenarioIndex] = useState(null);
    const [editScenTitleZh, setEditScenTitleZh] = useState("");
    const [editScenTitleEn, setEditScenTitleEn] = useState("");

    // --- 文件操作 ---
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [newFileName, setNewFileName] = useState("NewComponent.jsx");
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [fileToDeleteIdx, setFileToDeleteIdx] = useState(null);
    const [deleteScenarioModalOpen, setDeleteScenarioModalOpen] =
        useState(false);
    const [scenarioToDeleteIdx, setScenarioToDeleteIdx] = useState(null);

    const combinedLibCode = useMemo(
        () =>
            libFiles
                .map((f) => `/* === FILE: ${f.name} === */\n${f.content}`)
                .join("\n\n"),
        [libFiles],
    );

    // ─── Handlers ────────────────────────────────────────────────────────
    const handleHelpClick = (type) => {
        setHelpType(type);
        setHelpModalOpen(true);
    };

    const handleApplySample = () => {
        if (helpType === "meta") setMeta(INIT_META);
        else if (helpType === "logic") {
            setLibFiles(INIT_FILES);
            setActiveLibIdx(0);
        } else if (helpType === "scenario") {
            setScenarios(INIT_SCENARIOS);
            setActiveSIdx(0);
        } else if (helpType === "env") setWrapperCode(INIT_WRAPPER);
        else if (helpType === "css") setCssCode(INIT_CSS);
        setHelpModalOpen(false);
        toast.success("样例代码已填充至面板！");
        if (tourStep !== -1) setTourStep((s) => s + 1);
    };

    const handleEditScenarioSubmit = () => {
        if (editingScenarioIndex === null) return;
        const next = [...scenarios];
        next[editingScenarioIndex].titleZh = editScenTitleZh;
        next[editingScenarioIndex].titleEn = editScenTitleEn;
        setScenarios(next);
        setEditScenarioModalOpen(false);
    };

    const handleAddFileSubmit = () => {
        const fileName = newFileName.trim();
        if (!fileName) {
            toast.warning("文件名不能为空");
            return;
        }
        if (
            !fileName.endsWith(".jsx") &&
            !fileName.endsWith(".tsx") &&
            !fileName.endsWith(".js") &&
            !fileName.endsWith(".ts")
        )
            toast.warning("推荐使用 .jsx或.tsx 后缀");
        if (libFiles.some((f) => f.name === fileName)) {
            toast.warning("文件名不能重复");
            return;
        }
        setLibFiles([
            ...libFiles,
            {
                name: fileName,
                content:
                    "// " +
                    fileName +
                    "\nexport const Component = () => {\n  return <div>New Component</div>;\n};\n",
            },
        ]);
        setActiveLibIdx(libFiles.length);
        setAddModalOpen(false);
    };

    const handleDeleteFile = (e, index) => {
        e.stopPropagation();
        if (libFiles.length <= 1) {
            toast.warning("至少需要保留一个文件");
            return;
        }
        setFileToDeleteIdx(index);
        setDeleteModalOpen(true);
    };

    const confirmDeleteFile = () => {
        if (fileToDeleteIdx === null) return;
        const idx = fileToDeleteIdx;
        const next = libFiles.filter((_, i) => i !== idx);
        setLibFiles(next);
        if (activeLibIdx === idx) setActiveLibIdx(Math.max(0, idx - 1));
        else if (activeLibIdx > idx) setActiveLibIdx(activeLibIdx - 1);
        setDeleteModalOpen(false);
        setFileToDeleteIdx(null);
    };

    const handlePublish = async () => {
        try {
            await ComponentService.shareComponent({
                ...meta,
                libraryCode: combinedLibCode,
                sourceCode: combinedLibCode,
                wrapperCode,
                cssCode,
                scenarios: scenarios.map((s) => ({
                    titleZh: s.titleZh,
                    titleEn: s.titleEn,
                    descriptionZh: s.titleZh,
                    demoCode: s.code,
                    codeSnippet: s.code,
                })),
            });
            toast.success("组件架构已成功同步至 DinQorAI 全局资产库");
            navigate("/components");
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleAddScenario = () => {
        const id = Date.now().toString();
        setScenarios([
            ...scenarios,
            {
                id,
                titleZh: "新测试",
                titleEn: "New Study",
                code: "function Demo() {\n  return <div>New</div>;\n}",
            },
        ]);
        setActiveSIdx(scenarios.length);
    };

    const handleEditScenario = (i) => {
        setEditingScenarioIndex(i);
        setEditScenTitleZh(scenarios[i].titleZh);
        setEditScenTitleEn(scenarios[i].titleEn);
        setEditScenarioModalOpen(true);
    };

    const handleDeleteScenario = (i) => {
        if (scenarios.length <= 1) {
            toast.warning(
                t(
                    "components.share.modals.keepOneScenario",
                    "至少保留一个场景",
                ),
            );
            return;
        }
        setScenarioToDeleteIdx(i);
        setDeleteScenarioModalOpen(true);
    };

    const confirmDeleteScenario = () => {
        if (scenarioToDeleteIdx === null) return;
        const idx = scenarioToDeleteIdx;
        const next = scenarios.filter((_, i) => i !== idx);
        setScenarios(next);
        if (activeSIdx === idx) setActiveSIdx(Math.max(0, idx - 1));
        else if (activeSIdx > idx) setActiveSIdx(activeSIdx - 1);
        setDeleteScenarioModalOpen(false);
        setScenarioToDeleteIdx(null);
    };

    const handleOpenAddFile = () => {
        setNewFileName("NewComponent.jsx");
        setAddModalOpen(true);
    };

    const handleLibFileContentChange = (value) => {
        const nf = [...libFiles];
        nf[activeLibIdx].content = value;
        setLibFiles(nf);
    };

    // ─── Tour IDs ────────────────────────────────────────────────────────
    const sidebarTourIds = {
        metaHelp: "tour-meta-help",
        scenarioHelp: "tour-scenario-help",
    };
    const drawerTourIds = {
        logicHelp: "tour-logic-help",
        envHelp: "tour-env-help",
        cssHelp: "tour-css-help",
    };

    return (
        <div className="h-dvh flex flex-col bg-slate-50 text-slate-900 font-sans overflow-hidden">
            <ShareHeader
                onPublish={handlePublish}
                onTourStart={() => setTourStep(0)}
                onNavigateBack={() => navigate("/components")}
            />

            {/* 移动端侧边栏切换按钮 */}
            <button
                onClick={toggleSidebar}
                className={`lg:hidden fixed top-20 left-0 z-50 p-2 bg-white/80 backdrop-blur-sm rounded-r-lg shadow-md border border-l-0 border-slate-200 transition-all duration-300 ease-in-out ${
                    isSidebarOpen
                        ? "-translate-x-full opacity-0 pointer-events-none"
                        : "translate-x-0 opacity-100"
                }`}
                aria-label="打开侧边栏"
            >
                <Menu className="w-5 h-5 text-slate-600" />
            </button>

            <div className="flex-1 flex overflow-hidden">
                <ShareSidebar
                    meta={meta}
                    setMeta={setMeta}
                    scenarios={scenarios}
                    activeSIdx={activeSIdx}
                    setActiveSIdx={setActiveSIdx}
                    onAddScenario={handleAddScenario}
                    onEditScenario={handleEditScenario}
                    onDeleteScenario={handleDeleteScenario}
                    onHelpClick={handleHelpClick}
                    tourIds={sidebarTourIds}
                    isSidebarOpen={isSidebarOpen}
                    onToggleSidebar={toggleSidebar}
                />

                <main className="flex-1 flex flex-col bg-slate-50 relative">
                    <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
                        <LiveDemoSandbox
                            key={activeSIdx}
                            initialCode={scenarios[activeSIdx].code}
                            libraryCode={combinedLibCode}
                            wrapperCode={wrapperCode}
                            cssCode={cssCode}
                            onChange={(newCode) => {
                                const ns = [...scenarios];
                                ns[activeSIdx].code = newCode;
                                setScenarios(ns);
                            }}
                        />
                    </div>
                    <ShareDrawer
                        drawerOpen={drawerOpen}
                        setDrawerOpen={setDrawerOpen}
                        infTab={infTab}
                        setInfTab={setInfTab}
                        libFiles={libFiles}
                        activeLibIdx={activeLibIdx}
                        setActiveLibIdx={setActiveLibIdx}
                        wrapperCode={wrapperCode}
                        setWrapperCode={setWrapperCode}
                        cssCode={cssCode}
                        setCssCode={setCssCode}
                        onAddFile={handleOpenAddFile}
                        onDeleteFile={handleDeleteFile}
                        onLibFileContentChange={handleLibFileContentChange}
                        onHelpClick={handleHelpClick}
                        tourIds={drawerTourIds}
                    />
                </main>
            </div>

            <ShareModals
                addModalOpen={addModalOpen}
                deleteModalOpen={deleteModalOpen}
                deleteScenarioModalOpen={deleteScenarioModalOpen}
                helpModalOpen={helpModalOpen}
                editScenarioModalOpen={editScenarioModalOpen}
                tourWelcomeOpen={tourStep === -2}
                onCloseAddModal={() => setAddModalOpen(false)}
                onAddFileSubmit={handleAddFileSubmit}
                onCloseDeleteModal={() => setDeleteModalOpen(false)}
                onConfirmDeleteFile={confirmDeleteFile}
                onCloseDeleteScenarioModal={() =>
                    setDeleteScenarioModalOpen(false)
                }
                onConfirmDeleteScenario={confirmDeleteScenario}
                onCloseHelpModal={() => setHelpModalOpen(false)}
                onApplySample={handleApplySample}
                onCloseEditScenarioModal={() => setEditScenarioModalOpen(false)}
                onEditScenarioSubmit={handleEditScenarioSubmit}
                onTourWelcomeSkip={() => {
                    setTourStep(-1);
                    localStorage.setItem("hasSeenTourDinQorAI", "true");
                    toast.info(
                        "已跳过向导。如果后续需要，您随时可以点击页面右上角的「新手向导」按钮重新进入。",
                    );
                }}
                onTourWelcomeStart={() => setTourStep(0)}
                onTourSpotlightSkip={handleTourSpotlightSkip}
                newFileName={newFileName}
                setNewFileName={setNewFileName}
                fileToDeleteIdx={fileToDeleteIdx}
                scenarioToDeleteIdx={scenarioToDeleteIdx}
                helpType={helpType}
                editScenTitleZh={editScenTitleZh}
                setEditScenTitleZh={setEditScenTitleZh}
                editScenTitleEn={editScenTitleEn}
                setEditScenTitleEn={setEditScenTitleEn}
                libFiles={libFiles}
                scenarios={scenarios}
                currentTourTarget={currentTourTarget}
            />
        </div>
    );
};

export default ComponentShare;
