/**
 * Application routes
 */

import React from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

import RouteSEOLayout from "@app/seo/RouteSEOLayout";
import { RouteErrorPage } from "@app/update";
import LegacyContentRedirect from "./LegacyContentRedirect";
import { LazyPage } from "./RouteElements";

const LoginPage = React.lazy(() => import("@features/auth/pages/LoginPage"));
const WorkspaceLayout = React.lazy(
    () => import("@features/workspace/WorkspaceLayout"),
);
const WorkspaceAgentChat = React.lazy(
    () => import("@features/agent/pages/WorkspaceAgentChat"),
);
const AdminLayout = React.lazy(() => import("@features/admin/layout/AdminLayout"));
const RequireAdmin = React.lazy(() =>
    import("@features/admin").then(({ RequireAdmin: Component }) => ({
        default: Component,
    })),
);

const AdminUsersPage = React.lazy(
    () => import("@features/admin/pages/AdminUsersPage"),
);
const AdminModelProvidersPage = React.lazy(
    () => import("@features/admin/pages/AdminModelProvidersPage"),
);
const AdminModelPricingPage = React.lazy(
    () => import("@features/admin/pages/AdminModelPricingPage"),
);
const AdminFeatureModelConfigsPage = React.lazy(
    () => import("@features/admin/pages/AdminFeatureModelConfigsPage"),
);
const AdminWechatCredentialPage = React.lazy(
    () => import("@features/admin/pages/AdminWechatCredentialPage"),
);
const AdminMcpServersPage = React.lazy(
    () => import("@features/admin/pages/AdminMcpServersPage"),
);

export const createRouter = () =>
    createBrowserRouter([
        {
            element: <RouteSEOLayout />,
            errorElement: <RouteErrorPage />,
            children: [
                { path: "/", element: <Navigate to="/app" replace /> },
                {
                    path: "/login",
                    element: (
                        <LazyPage>
                            <LoginPage />
                        </LazyPage>
                    ),
                },
                {
                    path: "/app/:conversationId?",
                    element: (
                        <LazyPage>
                            <WorkspaceLayout />
                        </LazyPage>
                    ),
                    children: [
                        {
                            index: true,
                            element: <WorkspaceAgentChat />,
                        },
                    ],
                },
                {
                    path: "/admin",
                    element: (
                        <LazyPage>
                            <RequireAdmin>
                                <AdminLayout />
                            </RequireAdmin>
                        </LazyPage>
                    ),
                    children: [
                        { index: true, element: <Navigate to="users" replace /> },
                        {
                            path: "users",
                            element: <AdminUsersPage />,
                        },
                        {
                            path: "model-providers",
                            element: <AdminModelProvidersPage />,
                        },
                        {
                            path: "model-pricing",
                            element: <AdminModelPricingPage />,
                        },
                        {
                            path: "feature-model-configs",
                            element: <AdminFeatureModelConfigsPage />,
                        },
                        {
                            path: "wechat-credential",
                            element: <AdminWechatCredentialPage />,
                        },
                        {
                            path: "mcp-servers",
                            element: <AdminMcpServersPage />,
                        },
                    ],
                },
                { path: "/workspace/blog-manage", element: <LegacyContentRedirect view="articles" /> },
                { path: "/workspace/plans", element: <LegacyContentRedirect view="plans" /> },
                { path: "/workspace/plans/:id", element: <LegacyContentRedirect view="plans" /> },
                { path: "/workspace/publish", element: <LegacyContentRedirect view="publish" /> },
                { path: "*", element: <Navigate to="/app" replace /> },
            ],
        },
    ]);

export default createRouter;
