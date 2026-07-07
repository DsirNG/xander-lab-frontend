import React from 'react';

/**
 * 品牌化加载组件
 * 用于路由级 Suspense fallback 和页面加载状态
 */
const LoadingSpinner = ({ 
  fullScreen = true, 
  text = '', 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div className={`${sizeClasses[size]} border-2 border-slate-200 border-t-primary rounded-full animate-spin`} />
      {text && <span className="text-sm text-slate-400 font-medium">{text}</span>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
