import React from "react";
import { Navigate, useLocation, useSearchParams } from "react-router-dom";
import { useUser } from "../hooks/useUser";
import { useUserAuthState } from "../hooks/useUserAuthState";
import { useUserStore } from "../hooks/useUserStore";
import { useOnceValidate } from "../hooks/useOnceValidate";

const LoadingScreen = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      <div className="text-lg font-medium text-gray-600">
        3RD Login 驗證中...
      </div>
    </div>
  </div>
);

interface RedirectToDashboardOrLoginProps {
  children: React.ReactNode;
}

const RedirectToDashboardOrLogin: React.FC<RedirectToDashboardOrLoginProps> = ({
  children,
}) => {
  const user = useUserStore((state) => state.user);
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const sessionKey = searchParams.get("sessionKey");

  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  useUserAuthState();

  // 如果有 sessionKey，使用 useOnceValidate 進行驗證
  const { isValid, isLoading, error } = useOnceValidate(sessionKey || "");

  // 如果正在驗證 sessionKey，顯示載入畫面
  if (sessionKey && isLoading) {
    return <LoadingScreen />;
  }

  // 如果驗證失敗，重定向到登入頁面
  if (sessionKey && (error || !isValid)) {
    return <Navigate to="/login" replace />;
  }

  // 已登入用戶訪問登入或註冊頁面時重定向到儀表板
  if (user?.token && isAuthPage) {
    return <Navigate to="/app/dashboard" replace />;
  }

  // 未登入用戶訪問非登入/註冊頁面時重定向到登入頁面
  if (!user?.token && !isAuthPage) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export default RedirectToDashboardOrLogin;
