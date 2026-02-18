/**
 * 环境变量配置
 * 统一管理 Vite 环境变量，提供类型提示和默认值
 */

const env = import.meta.env;

export const ENV_CONFIG = {
    /** 是否为开发环境 */
    IS_DEV: env.DEV,

    /** 是否为生产环境 */
    IS_PROD: env.PROD,

    /** 当前运行模式 (development/production) */
    MODE: env.MODE,

    /** API 基础路径 */
    BASE_URL: env.VITE_API_BASE_URL || '',

    /** 请求超时时间 */
    TIMEOUT: Number(env.VITE_REQUEST_TIMEOUT) || 15000,

    /** OSS 访问路径 */
    OSS_DOMAIN: env.VITE_OSS_DOMAIN || 'https://food-cinder.oss-cn-beijing.aliyuncs.com',
};

export default ENV_CONFIG;
