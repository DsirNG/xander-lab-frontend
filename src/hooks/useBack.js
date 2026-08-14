import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * 页面级"返回上一页"统一逻辑：有历史记录时回退上一页，否则跳转到兜底路由。
 * 与浏览器直接输入网址/外部链接进入的深链接场景兼容。
 *
 * @param {string} fallbackTo 无历史记录时的兜底路由（默认首页）
 * @returns {() => void} 返回回调
 */
const useBack = (fallbackTo = '/') => {
  const navigate = useNavigate();

  return useCallback(() => {
    if (window.history.state?.idx > 0) {
      navigate(-1);
    } else {
      navigate(fallbackTo);
    }
  }, [navigate, fallbackTo]);
};

export default useBack;
