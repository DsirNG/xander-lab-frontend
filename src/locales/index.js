/**
 * 国际化配置
 * 统一管理多语言资源
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 导入语言资源
import en from './en';
import zh from './zh';
import fr from './fr';
import ja from './ja';
import ru from './ru';
import vi from './vi';

const resources = {
  en: { translation: en },
  zh: { translation: zh },
  fr: { translation: fr },
  ja: { translation: ja },
  ru: { translation: ru },
  vi: { translation: vi },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    // 只使用纯语言代码，避免 zh-CN/en-US 这类带国家后缀的值污染 i18n.language
    load: 'languageOnly',
    // 显式声明受支持的语言，检测到的 zh-CN 会规范化为 zh，en-US 规范化为 en
    supportedLngs: ['en', 'zh', 'fr', 'ja', 'ru', 'vi'],
    nonExplicitSupportedLngs: false,
    fallbackLng: 'zh',
    detection: {
      order: ['localStorage', 'navigator'],
      // 与 languageService 共用同一 localStorage key，避免两套状态脱节
      lookupLocalStorage: 'language',
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;



