import { useEffect, useMemo, useState } from "react";

const TOUR_STORAGE_KEY = "hasSeenTourDinQorAI";

const useComponentShareTour = ({
    helpModalOpen,
    setDrawerOpen,
    setInfTab,
    toast,
}) => {
    const [tourStep, setTourStep] = useState(-1);

    useEffect(() => {
        const isFirstTime = !localStorage.getItem(TOUR_STORAGE_KEY);
        if (isFirstTime) setTimeout(() => setTourStep(-2), 600);
    }, []);

    const currentTourTarget = useMemo(() => {
        if (tourStep === -1 || tourStep === -2) return null;
        if (helpModalOpen)
            return {
                id: "tour-apply-btn",
                text: "点击一键装载",
                desc: "该操作将为您自动注入企业级通知系统 (Toast) 的基底代码，省去搬运烦恼。",
                isModalLevel: true,
            };
        switch (tourStep) {
            case 0:
                return {
                    id: "tour-meta-help",
                    text: "Step 1: 填充元数据",
                    desc: '由于当前数据是空的，请您先点击此处的"❓"按钮，一键调取 Toast 的项目描述与命名。',
                    autoTab: "logic",
                };
            case 1:
                return {
                    id: "tour-logic-help",
                    text: "Step 2: 注入底层基建",
                    desc: "接着为该组件导入 3 份核心的 Context 以及 UI Item 面板逻辑区块。",
                    autoTab: "logic",
                };
            case 2:
                return {
                    id: "tour-env-help",
                    text: "Step 3: 提供运行环境",
                    desc: "为了让 Toast 在整个 App 层飘浮，这里需要补充 Provider 的环境包裹。",
                    autoTab: "env",
                };
            case 3:
                return {
                    id: "tour-css-help",
                    text: "Step 4: 挂载动效底座",
                    desc: "没有好看的动效算什么企业级？这里为您准备了柔滑的进退场 Keyframe。",
                    autoTab: "css",
                };
            case 4:
                return {
                    id: "tour-scenario-help",
                    text: "Step 5: 部署沙盘验证场景",
                    desc: "底层基建全部就绪！点击录入一段预先准备好的 React 演示代码来验证一切。",
                    autoTab: "logic",
                };
            case 5:
                return {
                    id: "tour-run-btn",
                    text: "Final: 点燃引擎！",
                    desc: "一切装载完毕。现在，猛击这个 RUN ANALYTICS 按钮，感受实时渲染引擎的澎湃力量吧！",
                    autoTab: "logic",
                };
            default:
                return null;
        }
    }, [helpModalOpen, tourStep]);

    useEffect(() => {
        if (currentTourTarget?.autoTab) {
            setInfTab(currentTourTarget.autoTab);
            setDrawerOpen(true);
        }
    }, [currentTourTarget?.autoTab, setDrawerOpen, setInfTab]);

    useEffect(() => {
        if (tourStep !== 5) return undefined;
        const handleFinish = (event) => {
            if (!event.target.closest("#tour-run-btn")) return;
            setTourStep(-1);
            localStorage.setItem(TOUR_STORAGE_KEY, "true");
            setTimeout(
                () =>
                    toast.success(
                        "太棒了！您已精通组件漫游沙盒，享受丝滑的编码之旅吧！",
                    ),
                1000,
            );
        };
        window.addEventListener("click", handleFinish, true);
        return () => window.removeEventListener("click", handleFinish, true);
    }, [toast, tourStep]);

    const skipTour = () => {
        setTourStep(-1);
        localStorage.setItem(TOUR_STORAGE_KEY, "true");
        toast.info("已中止向导。您可以随时点击右上角「新手向导」重新开始。");
    };

    return {
        currentTourTarget,
        tourStep,
        setTourStep,
        skipTour,
    };
};

export default useComponentShareTour;
