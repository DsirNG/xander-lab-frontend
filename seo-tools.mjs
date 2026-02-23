#!/usr/bin/env node

/**
 * Xander Lab SEO 工具集 (ES Module版本)
 * 集成sitemap生成、搜索引擎提交等功能
 * 
 * @author Xander Lab Team
 * @version 1.0.0
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件路径（ES模块兼容）
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 动态导入依赖
let axios, xml2js;

try {
  axios = await import('axios');
  xml2js = await import('xml2js');
} catch (error) {
  console.error('❌ 缺少必要依赖，请运行: npm install axios xml2js');
  process.exit(1);
}

// 配置常量
const CONFIG = {
  HOST: 'xander-lab.dsircity.top',
  API_KEY: '7a05bd37ef5d47a3b0a1157e8421a998',
  PUBLIC_DIR: path.join(__dirname, 'public'),
  SITEMAP_FILE: 'sitemap.xml',
  API_KEY_FILE: '7a05bd37ef5d47a3b0a1157e8421a998.txt'
};

/**
 * 日志工具类
 */
class Logger {
  static info(message) {
    console.log(`\x1b[36mℹ\x1b[0m ${message}`);
  }
  
  static success(message) {
    console.log(`\x1b[32m✓\x1b[0m ${message}`);
  }
  
  static warning(message) {
    console.log(`\x1b[33m⚠\x1b[0m ${message}`);
  }
  
  static error(message) {
    console.log(`\x1b[31m✗\x1b[0m ${message}`);
  }
  
  static header(title) {
    console.log(`\n\x1b[1m${title}\x1b[0m`);
    console.log('─'.repeat(title.length));
  }
}

/**
 * Sitemap生成器
 */
class SitemapGenerator {
  constructor() {
    this.urls = [];
    this.baseUrl = `https://${CONFIG.HOST}`;
  }

  /**
   * 添加URL到sitemap
   * @param {string} path - 路径
   * @param {Object} options - 配置选项
   */
  addUrl(path, options = {}) {
    const urlObj = {
      loc: `${this.baseUrl}${path}`,
      lastmod: options.lastmod || new Date().toISOString().split('T')[0],
      changefreq: options.changefreq || 'weekly',
      priority: options.priority || 0.5
    };

    // 添加图片信息（如果提供）
    if (options.image) {
      urlObj['image:image'] = {
        'image:loc': options.image.url,
        'image:title': options.image.title,
        'image:caption': options.image.caption
      };
    }

    this.urls.push(urlObj);
  }

  /**
   * 生成完整的sitemap结构
   */
  generateStructure() {
    // 核心页面
    this.addUrl('/', { 
      changefreq: 'weekly', 
      priority: 1.0,
      image: {
        url: `${this.baseUrl}/og-image.png`,
        title: 'Xander Lab UI Infrastructure Showcase',
        caption: 'Cutting-edge UI infrastructure systems and interactive components platform'
      }
    });

    this.addUrl('/infra', { changefreq: 'weekly', priority: 0.9 });
    this.addUrl('/modules', { changefreq: 'weekly', priority: 0.9 });
    this.addUrl('/components', { changefreq: 'weekly', priority: 0.8 });
    this.addUrl('/blog', { changefreq: 'daily', priority: 0.8 });

    // 基础设施详情页
    this.addUrl('/infra/positioning-system', { changefreq: 'monthly', priority: 0.8 });
    this.addUrl('/infra/drag-drop-system', { changefreq: 'monthly', priority: 0.8 });

    // 功能模块详情页
    this.addUrl('/modules/drag-drop', { changefreq: 'monthly', priority: 0.8 });
    this.addUrl('/modules/anchored-overlay', { changefreq: 'monthly', priority: 0.8 });

    // 博客相关页面
    this.addUrl('/blog/tags', { changefreq: 'weekly', priority: 0.6 });
    this.addUrl('/blog/publish', { changefreq: 'yearly', priority: 0.3 });

    // 特殊功能页面
    this.addUrl('/login', { changefreq: 'yearly', priority: 0.1 });
    this.addUrl('/components/share', { changefreq: 'monthly', priority: 0.4 });

    return {
      urlset: {
        $: {
          xmlns: 'http://www.sitemaps.org/schemas/sitemap/0.9',
          'xmlns:image': 'http://www.google.com/schemas/sitemap-image/1.1',
          'xmlns:xhtml': 'http://www.w3.org/1999/xhtml'
        },
        url: this.urls
      }
    };
  }

  /**
   * 保存sitemap到文件
   */
  async saveToFile(filename = CONFIG.SITEMAP_FILE) {
    const filePath = path.join(CONFIG.PUBLIC_DIR, filename);
    
    try {
      const builder = new xml2js.default.Builder({
        xmldec: { version: '1.0', encoding: 'UTF-8' },
        renderOpts: { pretty: true, indent: '  ' }
      });
      
      const xml = builder.buildObject(this.generateStructure());
      
      // 确保public目录存在
      if (!fs.existsSync(CONFIG.PUBLIC_DIR)) {
        fs.mkdirSync(CONFIG.PUBLIC_DIR, { recursive: true });
      }
      
      fs.writeFileSync(filePath, xml, 'utf8');
      Logger.success(`Sitemap 已生成: ${filePath}`);
      Logger.info(`包含 ${this.urls.length} 个URL`);
      
      return filePath;
    } catch (error) {
      Logger.error(`生成 sitemap 失败: ${error.message}`);
      throw error;
    }
  }
}

/**
 * 搜索引擎提交器
 */
class SearchEngineSubmitter {
  /**
   * 向Bing提交URL
   * @param {Array} urls - URL数组
   */
  static async submitToBing(urls) {
    Logger.header('Bing IndexNow 提交');
    
    try {
      const response = await axios.default.post('https://www.bing.com/indexnow', {
        host: CONFIG.HOST,
        key: CONFIG.API_KEY,
        keyLocation: `https://${CONFIG.HOST}/${CONFIG.API_KEY_FILE}`,
        urlList: urls
      }, {
        headers: { 
          'Content-Type': 'application/json; charset=utf-8',
          'User-Agent': 'XanderLab-SEO-Tools/1.0'
        },
        timeout: 15000
      });

      if (response.status === 200) {
        Logger.success(`Bing 提交成功 (${response.status})`);
        return true;
      } else {
        Logger.warning(`Bing 提交完成但状态码异常: ${response.status}`);
        return false;
      }
    } catch (error) {
      Logger.error(`Bing 提交失败: ${error.message}`);
      if (error.response) {
        Logger.error(`服务器响应: ${error.response.status} - ${error.response.statusText}`);
      }
      return false;
    }
  }

  /**
   * 向Google Search Console提交（需要手动操作）
   */
  static async submitToGoogle(urls) {
    Logger.header('Google Search Console 提交');
    Logger.info('Google不支持IndexNow协议，请通过以下方式提交:');
    Logger.info('1. 登录 Google Search Console');
    Logger.info('2. 选择您的网站属性');
    Logger.info('3. 进入 "索引" -> "站点地图"');
    Logger.info(`4. 提交: https://${CONFIG.HOST}/${CONFIG.SITEMAP_FILE}`);
    Logger.info('\n或者使用Google Search Console API进行自动化提交');
    return false;
  }
}

/**
 * 主要工具类
 */
class SEOTools {
  /**
   * 生成sitemap
   */
  static async generateSitemap() {
    Logger.header('Sitemap 生成工具');
    
    const generator = new SitemapGenerator();
    const filePath = await generator.saveToFile();
    
    return {
      success: true,
      filePath: filePath,
      urlCount: generator.urls.length
    };
  }

  /**
   * 提交到搜索引擎
   */
  static async submitToSearchEngines() {
    Logger.header('搜索引擎提交工具');
    
    // 读取sitemap中的URL
    const sitemapPath = path.join(CONFIG.PUBLIC_DIR, CONFIG.SITEMAP_FILE);
    
    if (!fs.existsSync(sitemapPath)) {
      Logger.error('sitemap.xml 文件不存在，请先生成sitemap');
      return { success: false };
    }

    try {
      const sitemapXml = fs.readFileSync(sitemapPath, 'utf8');
      const parser = new xml2js.default.Parser({ explicitArray: false });
      const result = await parser.parseStringPromise(sitemapXml);
      
      let urls = [];
      if (result.urlset && result.urlset.url) {
        const urlEntries = Array.isArray(result.urlset.url) 
          ? result.urlset.url 
          : [result.urlset.url];
        urls = urlEntries.map(entry => entry.loc);
      }

      Logger.info(`准备提交 ${urls.length} 个URL`);

      // 提交到各个搜索引擎
      const results = {
        bing: await SearchEngineSubmitter.submitToBing(urls),
        google: await SearchEngineSubmitter.submitToGoogle(urls)
      };

      return {
        success: true,
        results: results,
        urlCount: urls.length
      };

    } catch (error) {
      Logger.error(`读取sitemap失败: ${error.message}`);
      return { success: false };
    }
  }

  /**
   * 完整的SEO流程
   */
  static async runFullProcess() {
    Logger.header('Xander Lab SEO 自动化流程');
    
    try {
      // 1. 生成sitemap
      Logger.info('步骤 1/2: 生成 sitemap.xml');
      const sitemapResult = await this.generateSitemap();
      
      if (!sitemapResult.success) {
        throw new Error('Sitemap 生成失败');
      }

      // 2. 提交到搜索引擎
      Logger.info('步骤 2/2: 提交到搜索引擎');
      const submitResult = await this.submitToSearchEngines();
      
      if (!submitResult.success) {
        throw new Error('搜索引擎提交失败');
      }

      // 3. 显示结果
      Logger.header('流程完成');
      Logger.success('✅ Sitemap 生成成功');
      Logger.success(`📁 文件位置: ${sitemapResult.filePath}`);
      Logger.success(`📊 包含URL: ${sitemapResult.urlCount} 个`);
      
      if (submitResult.results.bing) {
        Logger.success('✅ Bing 提交成功');
      }
      
      Logger.info('💡 建议:');
      Logger.info('• 定期更新sitemap内容');
      Logger.info('• 监控搜索引擎索引状态');
      Logger.info('• 保持网站内容新鲜度');

    } catch (error) {
      Logger.error(`SEO 流程执行失败: ${error.message}`);
      process.exit(1);
    }
  }
}

/**
 * 命令行接口
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
Xander Lab SEO 工具集
=====================

用法:
  node seo-tools.mjs [命令]

命令:
  generate    仅生成 sitemap.xml
  submit      仅提交到搜索引擎
  full        完整流程（生成 + 提交）
  --help, -h  显示此帮助信息

示例:
  node seo-tools.mjs generate
  node seo-tools.mjs submit
  node seo-tools.mjs full

注意:
  • 确保在项目根目录运行此工具
  • 需要安装 axios 和 xml2js 依赖包
  • 确保 public 目录下的API密钥文件存在
    `);
    return;
  }

  const command = args[0];

  try {
    switch (command) {
      case 'generate':
        await SEOTools.generateSitemap();
        break;
        
      case 'submit':
        await SEOTools.submitToSearchEngines();
        break;
        
      case 'full':
        await SEOTools.runFullProcess();
        break;
        
      default:
        Logger.error(`未知命令: ${command}`);
        Logger.info('使用 --help 查看可用命令');
        process.exit(1);
    }
  } catch (error) {
    Logger.error(`执行失败: ${error.message}`);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (process.argv[1] === __filename) {
  main();
}

// 导出供其他模块使用
export {
  SEOTools,
  SitemapGenerator,
  SearchEngineSubmitter,
  Logger
};