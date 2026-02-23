const axios = require('axios');
const fs = require('fs');
const path = require('path');

// 配置常量
const HOST = 'xander-lab.dsircity.top';
const API_KEY_FILE = '7a05bd37ef5d47a3b0a1157e8421a998.txt';

// 从文件读取API密钥
function getApiKey() {
  try {
    const keyPath = path.join(__dirname, 'public', API_KEY_FILE);
    if (fs.existsSync(keyPath)) {
      return fs.readFileSync(keyPath, 'utf8').trim();
    }
    throw new Error(`API密钥文件不存在: ${keyPath}`);
  } catch (error) {
    console.error('❌ 无法读取API密钥:', error.message);
    process.exit(1);
  }
}

// 定义要推送的URL列表
const URL_LIST = [
  // 主页和核心页面
  `https://${HOST}/`,
  `https://${HOST}/infra`,
  `https://${HOST}/modules`,
  `https://${HOST}/components`,
  `https://${HOST}/blog`,
  
  // 基础设施详细页面
  `https://${HOST}/infra/positioning-system`,
  `https://${HOST}/infra/drag-drop-system`,
  
  // 功能模块详细页面
  `https://${HOST}/modules/drag-drop`,
  `https://${HOST}/modules/anchored-overlay`,
  
  // 博客相关页面
  `https://${HOST}/blog/tags`,
  `https://${HOST}/blog/publish`,
  
  // 特殊功能页面
  `https://${HOST}/components/share`,
  `https://${HOST}/login`
];

/**
 * 向Bing搜索引擎推送URL更新
 * @param {Array} urls - 要推送的URL数组
 * @param {string} apiKey - API密钥
 */
async function notifyBing(urls = URL_LIST, apiKey = getApiKey()) {
  console.log('🚀 开始向Bing搜索引擎推送URL更新...');
  console.log(`📡 目标主机: ${HOST}`);
  console.log(`📋 推送URL数量: ${urls.length}`);
  
  try {
    const startTime = Date.now();
    
    const response = await axios.post('https://www.bing.com/indexnow', {
      host: HOST,
      key: apiKey,
      keyLocation: `https://${HOST}/${API_KEY_FILE}`,
      urlList: urls
    }, {
      headers: { 
        'Content-Type': 'application/json; charset=utf-8',
        'User-Agent': 'XanderLab-Bot/1.0'
      },
      timeout: 10000 // 10秒超时
    });
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    if (response.status === 200) {
      console.log('✅ 推送成功！');
      console.log(`📊 状态码: ${response.status}`);
      console.log(`⏱️  耗时: ${duration}秒`);
      console.log('🔍 Bing已接收URL更新通知，将尽快抓取这些页面。');
    } else {
      console.warn(`⚠️  推送完成但状态码异常: ${response.status}`);
    }
    
  } catch (error) {
    console.error('❌ 推送失败！');
    
    if (error.response) {
      // 服务器响应错误
      console.error(`📡 服务器响应: ${error.response.status} - ${error.response.statusText}`);
      if (error.response.data) {
        console.error(`📄 错误详情:`, error.response.data);
      }
    } else if (error.request) {
      // 请求发送但无响应
      console.error('🔌 网络连接问题，请检查网络连接');
    } else {
      // 其他错误
      console.error(`💥 错误信息: ${error.message}`);
    }
    
    console.log('\n💡 故障排除建议:');
    console.log('   • 检查网络连接是否正常');
    console.log('   • 确认API密钥文件存在且格式正确');
    console.log('   • 验证域名所有权设置');
    console.log('   • 检查Bing IndexNow服务状态');
    
    process.exit(1);
  }
}

/**
 * 批量推送URL（支持分批处理大量URL）
 * @param {Array} urls - 所有URL
 * @param {number} batchSize - 每批处理的URL数量
 */
async function batchNotifyBing(urls = URL_LIST, batchSize = 10) {
  console.log(`🔄 启用批量推送模式，每批处理 ${batchSize} 个URL`);
  
  const apiKey = getApiKey();
  const batches = [];
  
  // 分批处理
  for (let i = 0; i < urls.length; i += batchSize) {
    batches.push(urls.slice(i, i + batchSize));
  }
  
  console.log(`📦 总共 ${batches.length} 批次，开始逐批推送...\n`);
  
  for (let i = 0; i < batches.length; i++) {
    console.log(`📤 正在推送第 ${i + 1}/${batches.length} 批...`);
    await notifyBing(batches[i], apiKey);
    
    // 批次间延迟，避免请求过于频繁
    if (i < batches.length - 1) {
      console.log('⏳ 等待2秒后继续下一批...\n');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  console.log('\n🎉 所有批次推送完成！');
}

// 主程序入口
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--batch')) {
    // 批量模式
    const batchSize = parseInt(args[args.indexOf('--batch') + 1]) || 10;
    await batchNotifyBing(URL_LIST, batchSize);
  } else if (args.includes('--help') || args.includes('-h')) {
    // 帮助信息
    console.log('\n📖 Bing IndexNow 推送工具使用说明:\n');
    console.log('基本用法:');
    console.log('  node bing-push.js                    # 推送默认URL列表');
    console.log('  node bing-push.js --batch 5          # 批量推送，每批5个URL');
    console.log('  node bing-push.js --help             # 显示帮助信息\n');
    console.log('注意事项:');
    console.log('  • 确保 public/7a05bd37ef5d47a3b0a1157e8421a998.txt 文件存在');
    console.log('  • 同一URL 24小时内只能推送一次');
    console.log('  • 建议在网站内容更新后及时推送\n');
  } else {
    // 默认模式
    await notifyBing();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main().catch(error => {
    console.error('💥 程序执行出错:', error);
    process.exit(1);
  });
}

// 导出函数供其他模块使用
module.exports = {
  notifyBing,
  batchNotifyBing,
  URL_LIST
};
