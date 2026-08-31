/**
 * 后台管理路由守卫：仅登录且 role=ADMIN 的用户可进入。
 * 非管理员一律重定向回工作台首页，避免暴露管理入口。
 */
import { Navigate, useLocation } from "react-router-dom";
import LoadingSpinner from "@components/common/LoadingSpinner";
import { useAuthSession } from "@features/auth/context/authSessionContextValue";

const RequireAdmin = ({ children }) => {
    const location = useLocation();
    const { sessionStatus, userInfo } = useAuthSession();

    if (sessionStatus === "checking") return <LoadingSpinner fullScreen />;
    if (sessionStatus === "anonymous") {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }
    if (userInfo?.role !== "ADMIN") {
        return <Navigate to="/workspace" replace />;
    }

    return children;
};

export default RequireAdmin;
