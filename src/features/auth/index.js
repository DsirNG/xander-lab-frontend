/**
 * Public capabilities exposed by the auth feature.
 *
 * App-level composition may depend on these exports, but should not reach
 * into the feature's context or component directories directly.
 */
export { default as AuthSessionProvider } from "./context/AuthSessionProvider";
export { default as ProtectedRoute } from "./components/ProtectedRoute";
export { useAuthSession } from "./context/authSessionContextValue";
export {
    getLocalUserInfo,
    isLoggedIn,
    logout,
    updateProfile,
} from "./capabilities";
