import { createContext, useContext } from 'react';

const AuthSessionContext = createContext(null);

/** 读取全局登录会话状态；必须在 AuthSessionProvider 内使用 */
export const useAuthSession = () => {
  const context = useContext(AuthSessionContext);
  if (!context) {
    throw new Error('useAuthSession 必须在 AuthSessionProvider 内使用');
  }
  return context;
};

export default AuthSessionContext;
