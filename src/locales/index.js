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
    // load: 'languageOnly' 只影响资源加载层级，并不会把 i18n.language 归一为纯语言代码
    load: 'languageOnly',
    // 显式声明受支持的语言
    supportedLngs: ['en', 'zh', 'fr', 'ja', 'ru', 'vi'],
    nonExplicitSupportedLngs: false,
    fallbackLng: 'zh',
    detection: {
      order: ['localStorage', 'navigator'],
      // 与 languageService 共用同一 localStorage key，避免两套状态脱节
      lookupLocalStorage: 'language',
      caches: ['localStorage'],
      // 关键：把检测到的 zh-CN/en-US 归一为 zh/en。
      // 否则 i18n.language 仍是 'zh-CN'，LANG_LABELS['zh-CN'] 取不到值，
      // MainLayout 的语言标签会回落成 'EN'。
      convertDetectedLanguage: (lng) => lng.split('-')[0].toLowerCase(),
    },
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
  });

export default i18n;



