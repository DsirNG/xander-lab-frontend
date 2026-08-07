import React from 'react';
import { withTranslation } from 'react-i18next';

/**
 * 全局错误边界组件
 * 捕获子组件树中的运行时错误，展示友好的回退 UI
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // 可以在这里上报错误到监控服务
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    const { t } = this.props;
    if (this.state.hasError) {
      // 自定义回退 UI
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.handleReset);
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-surface p-6">
          <div className="max-w-md w-full bg-canvas rounded-2xl shadow-xl border border-border p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-danger-soft flex items-center justify-center">
              <svg className="w-8 h-8 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-title font-bold text-ink mb-2">{t('common.errorBoundary.title')}</h2>
            <p className="text-body text-ink-muted mb-6">
              {t('common.errorBoundary.description')}
            </p>
            {this.state.error && (
              <details className="text-left mb-6 bg-surface rounded-lg p-4 border border-border">
                <summary className="text-caption font-medium text-ink-secondary cursor-pointer mb-2">
                  {t('common.errorBoundary.errorDetails')}
                </summary>
                <pre className="text-caption text-danger font-mono whitespace-pre-wrap overflow-auto max-h-32">
                  {this.state.error.message}
                </pre>
              </details>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReload}
                className="px-6 py-2.5 bg-accent text-white rounded-xl text-body font-bold hover:opacity-90 transition-all"
              >
                {t('common.errorBoundary.reload')}
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="px-6 py-2.5 bg-surface-muted text-ink-secondary rounded-xl text-body font-bold hover:bg-border transition-all"
              >
                {t('common.errorBoundary.backToHome')}
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const TranslatedErrorBoundary = withTranslation()(ErrorBoundary);
TranslatedErrorBoundary.displayName = 'TranslatedErrorBoundary';

export default TranslatedErrorBoundary;
