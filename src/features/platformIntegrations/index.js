import { lazy } from "react";
/** Public capabilities exposed by external publishing integrations. */
export const CsdnAuthorizationPanel = lazy(() => import("./components/CsdnAuthorizationPanel"));
export const CsdnSyncDialog = lazy(() => import("./components/CsdnSyncDialog"));
export const JuejinAuthorizationPanel = lazy(() => import("./components/JuejinAuthorizationPanel"));
export const PlatformConnectionsPanel = lazy(() => import("./components/PlatformConnectionsPanel"));
export const JuejinSyncDialog = lazy(() => import("./components/JuejinSyncDialog"));

export { getPlatformLogoSrc } from "./platformLogos";
