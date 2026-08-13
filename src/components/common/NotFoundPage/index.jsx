import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

/**
 * 404 页面
 * 当用户访问不存在的路由时展示
 */
const NotFoundPage = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="text-8xl font-black text-accent/10 mb-4 select-none">404</div>
        <div className="text-2xl font-bold text-ink mb-3">
          {t('common.pageNotFound', '页面未找到')}
        </div>
        <div className="text-body text-ink-muted mb-8">
          {t('common.pageNotFoundDesc', '你访问的页面不存在或已被移动。')}
        </div>
        <div className="flex gap-3 justify-center">
          <Link
            to="/"
            className="px-6 py-2.5 bg-accent text-white rounded-xl text-body font-bold hover:opacity-90 transition-all"
          >
            {t('common.backHome', '返回首页')}
          </Link>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2.5 bg-surface-muted text-ink-secondary rounded-xl text-body font-bold hover:bg-border-strong transition-all"
          >
            {t('common.goBack', '返回上页')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
