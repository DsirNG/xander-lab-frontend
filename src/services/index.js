/**
 * 业务服务层
 * 封装业务逻辑，提供给组件使用
 */

// 主题服务
export const themeService = {
  getTheme: () => {
    return localStorage.getItem('theme') || 'light';
  },
  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  },
  toggleTheme: () => {
    const currentTheme = themeService.getTheme();
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    themeService.setTheme(newTheme);
    return newTheme;
  },
};

// 语言服务
export const languageService = {
  getLanguage: () => {
    return localStorage.getItem('language') || 'en';
  },
  setLanguage: (language) => {
    localStorage.setItem('language', language);
  },
};

export default {
  themeService,
  languageService,
};

