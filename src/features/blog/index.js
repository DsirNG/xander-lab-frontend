/**
 * Public capabilities exposed by the blog feature.
 */
export { default as NotificationBell } from "./components/NotificationBell";
export { default as AgentPreviewPanel } from "./components/agent/AgentPreviewPanel";
export { NotificationProvider } from "./context/NotificationContext";
export { PureReadingProvider } from "./context/PureReadingContext";
export { default as usePureReading } from "./hooks/usePureReading";
import { lazy } from "react";
export const BlogManagePage = lazy(() => import("./pages/BlogManagePage"));
export {
    getBlogAgentTask,
    getArticleDraft,
    listArticleCategories,
    saveArticleDraft,
    listBlogPlans,
    listMyBlogs,
    publishBlogAgentTask,
} from "./capabilities";

export const BlogPlansPage = lazy(() => import("./pages/BlogPlans"));
export const BlogPlanDetailPage = lazy(() => import("./pages/BlogPlanDetail"));
export const BlogPublishPage = lazy(() => import("./pages/BlogPublish"));
