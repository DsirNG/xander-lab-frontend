const axios = require('axios');
const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

// 配置常量
const API_KEY = '7a05bd37ef5d47a3b0a1157e8421a998';
const HOST = 'xander-lab.dsircity.top';
const SITEMAP_PATH = path.join(__dirname, 'public', 'sitemap.xml');
const API_KEY_FILE_PATH = path.join(__dirname, 'public', `${API_KEY}.txt`);

/**
 * 从sitemap.xml文件中提取所有URL
 * @returns {Promise<Array>} URL数组
 */
async function extractUrlsFromSitemap() {
  try {
    // 检查sitemap文件是否存在
    if (!fs.existsSync(SITEMAP_PATH)) {
      console.warn(`⚠️  sitemap.xml 文件不存在: ${SITEMAP_PATH}`);
      console.log('🔄 使用默认URL列表...');
      return getDefaultUrls();
    }
    
    // 读取sitemap文件
    const sitemapXml = fs.readFileSync(SITEMAP_PATH, 'utf8');
    
    // 解析XML
    const parser = new xml2js.Parser({ explicitArray: false });
    const result = await parser.parseStringPromise(sitemapXml);
    
    // 提取URL
    const urls = [];
    if (result.urlset && result.urlset.url) {
      const urlEntries = Array.isArray(result.urlset.url) 
        ? result.urlset.url 
        : [result.urlset.url];
      
      urlEntries.forEach(entry => {
        if (entry.loc) {
          urls.push(entry.loc);
        }
      });
    }
    
    console.log(`📋 从 sitemap.xml 成功提取 ${urls.length} 个URL`);
    return urls;
    
  } catch (error) {
    console.error('❌ 解析 sitemap.xml 失败:', error.message);
    console.log('🔄 使用默认URL列表...');
    return getDefaultUrls();
  }
}

/**
 * 获取默认URL列表
 * @returns {Array} 默认URL数组
 */
function getDefaultUrls() {
  return [
    // 核心页面
    `https://${HOST}/`,
    `https://${HOST}/infra`,
    `https://${HOST}/modules`,
    `https://${HOST}/components`,
    `https://${HOST}/blog`,
    
    // 基础设施页面
    `https://${HOST}/infra/positioning-system`,
    `https://${HOST}/infra/drag-drop-system`,
    
    // 功能模块页面
    `https://${HOST}/modules/drag-drop`,
    `https://${HOST}/modules/anchored-overlay`,
    
    // 博客相关页面
    `https://${HOST}/blog/tags`,
    `https://${HOST}/blog/publish`,
    
    // 特殊功能页面
    `https://${HOST}/components/share`,
    `https://${HOST}/login`
  ];
}

/**
 * 验证必要的文件是否存在
 */
function validateEnvironment() {
  console.log('🔍 验证运行环境...');
  
  // 检查API密钥文件
  if (!fs.existsSync(API_KEY_FILE_PATH)) {
    console.error(`❌ API密钥文件不存在: ${API_KEY_FILE_PATH}`);
    console.log('💡 请确保在 public/ 目录下创建API密钥文件');
    return false;
  }
  
  // 检查axios是否可用
  try {
    require.resolve('axios');
  } catch (error) {
    console.error('❌ axios 未安装，请运行: npm install axios');
    return false;
  }
  
  // 检查xml2js是否可用
  try {
    require.resolve('xml2js');
  } catch (error) {
    console.error('❌ xml2js 未安装，请运行: npm install xml2js');
    return false;
  }
  
  console.log('✅ 环境验证通过');
  return true;
}

/**
 * 向Bing IndexNow提交URL
 * @param {Array} urlList - 要提交的URL数组
 */
async function submitToBing(urlList) {
  console.log('\n🚀 正在启动 IndexNow 主动推送...');
  console.log(`📡 目标搜索引擎: Bing`);
  console.log(`📋 提交URL数量: ${urlList.length}`);
  console.log(`🏠 主机域名: ${HOST}`);
  
  try {
    const startTime = Date.now();
    
    const response = await axios.post('https://www.bing.com/indexnow', {
      host: HOST,
      key: API_KEY,
      keyLocation: `https://${HOST}/${API_KEY}.txt`,
      urlList: urlList
    }, {
      headers: { 
        'Content-Type': 'application/json; charset=utf-8',
        'User-Agent': 'XanderLab-SEO-Bot/2.0'
      },
      timeout: 15000 // 15秒超时
    });
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    if (response.status === 200) {
      console.log('\n✅ 推送成功！');
      console.log(`📊 状态码: ${response.status}`);
      console.log(`⏱️  耗时: ${duration}秒`);
      console.log('🔍 Bing已将这些URL加入抓取队列，将在近期进行索引更新。');
      
      // 显示提交的URL摘要
      console.log('\n📋 提交的URL列表:');
      urlList.forEach((url, index) => {
        console.log(`   ${index + 1}. ${url}`);
      });
    } else {
      console.warn(`⚠️  推送完成但状态码异常: ${response.status}`);
      console.log('📄 响应内容:', response.data);
    }
    
  } catch (error) {
    console.error('\n❌ 推送失败！');
    
    if (error.response) {
      // 服务器响应错误
      console.error(`📡 服务器响应: ${error.response.status} - ${error.response.statusText}`);
      if (error.response.data) {
        console.error('📄 错误详情:', JSON.stringify(error.response.data, null, 2));
      }
    } else if (error.request) {
      // 请求发送但无响应
      console.error('🔌 网络连接问题，请检查网络连接和防火墙设置');
    } else {
      // 其他错误
      console.error(`💥 错误信息: ${error.message}`);
    }
    
    console.log('\n💡 故障排除建议:');
    console.log('   • 检查网络连接是否正常');
    console.log('   • 确认域名所有权验证已完成');
    console.log('   • 验证API密钥文件内容正确');
    console.log('   • 检查Bing IndexNow服务状态');
    console.log('   • 确保URL格式正确且可访问');
    
    process.exit(1);
  }
}

/**
 * 主函数
 */
async function main() {
  console.log('🤖 Xander Lab - Bing IndexNow 提交工具');
  console.log('========================================');
  
  // 验证环境
  if (!validateEnvironment()) {
    process.exit(1);
  }
  
  // 获取URL列表
  const urls = await extractUrlsFromSitemap();
  
  // 显示统计信息
  console.log(`\n📈 URL统计:`);
  console.log(`   总数: ${urls.length} 个URL`);
  console.log(`   来源: ${fs.existsSync(SITEMAP_PATH) ? 'sitemap.xml' : '默认列表'}`);
  
  // 确认操作
  console.log('\n❓ 是否确认提交以上URL到Bing搜索引擎？');
  console.log('   输入 y/Y 确认，其他任意键取消');
  
  // 等待用户输入
  process.stdin.setEncoding('utf8');
  process.stdin.on('readable', async () => {
    const chunk = process.stdin.read();
    if (chunk !== null) {
      const input = chunk.trim().toLowerCase();
      if (input === 'y') {
        await submitToBing(urls);
        console.log('\n🎉 提交任务完成！');
      } else {
        console.log('\n↩️  操作已取消');
      }
      process.stdin.destroy();
    }
  });
  
  // 设置超时自动取消
  setTimeout(() => {
    console.log('\n⏰ 等待超时，自动取消操作');
    process.stdin.destroy();
    process.exit(0);
  }, 30000); // 30秒超时
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(error => {
    console.error('\n💥 程序执行出错:', error);
    process.exit(1);
  });
}

// 导出函数供其他模块使用
module.exports = {
  extractUrlsFromSitemap,
  submitToBing,
  getDefaultUrls,
  validateEnvironment
};
