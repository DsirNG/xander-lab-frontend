/**
 * 应用配置文件
 * 统一管理应用的配置项
 */

export const APP_CONFIG = {
  // 应用名称
  name: 'Xander Lab',
  
  // 应用版本
  version: '1.0.0',
  
  // 默认语言
  defaultLanguage: 'en',
  
  // 支持的语言列表
  supportedLanguages: ['en', 'zh'],
  
  // 主题配置
  theme: {
    defaultMode: 'light', // light | dark | system
  },
  
  // 路由配置
  router: {
    basename: '/',
  },
};

export default APP_CONFIG;



