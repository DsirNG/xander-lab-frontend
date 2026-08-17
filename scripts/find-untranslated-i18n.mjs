/**
 * 查找各语言文件中与 en.js 值相同的未翻译条目
 * 用法: node scripts/find-untranslated-i18n.mjs
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const LOCALES_DIR = path.resolve('src/locales')

// 解析 ES module locale 文件为扁平 key-value
function flatten(obj, prefix = '') {
  const result = {}
  for (const [k, v] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${k}` : k
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      Object.assign(result, flatten(v, fullKey))
    } else {
      result[fullKey] = v
    }
  }
  return result
}

// 品牌名、URL、技术术语 — 跳过这些
const skipPatterns = [
  /^https?:\/\//, /^smtp\./, /^socks5:/, /^name@/, /^noreply@/,
  /^org-/, /^price_/, /^whsec_/, /^edit_this$/, /^my-status$/,
  /^_copy$/, /^gpt-/, /^checkout\./, /^footer\./, /^\[?\{/,
  /^"default/, /^\/status\//, /^\/your\//, /^example\.com/,
  /^AZURE_/, /^AccessKey/, /^OAuth/, /^Client /, /^Webhook URL/,
  /^API URL$/, /^Well-Known/, /^Worker URL$/, /^Uptime Kuma/,
  /^New API$/, /^Baidu V2$/, /^Zhipu V4$/, /^Quota:/,
  // 值本身即为技术术语或占位符，无需本地化
  /^name@/, /^HTML$/, /^CSDN /, /^Info \(/,
]

const brandNames = new Set([
  'DinQorAI', 'DinQorAI', 'React', 'Vue', 'Angular',
  'TailwindCSS', 'Tailwind', 'Vite', 'Framer Motion',
  'Markdown', 'CSS', 'HTML', 'JSX', 'TSX', 'API', 'DOM',
  'RAF', 'ARIA', 'Context API', 'Hooks', 'Toast', 'Popover',
  'Tooltip', 'Dropdown', 'Kanban', 'Flowchart',
  'Img2Three', 'Img2Three.js', 'CSDN MCP',
])

// 值保持与 en.js 相同是刻意为之的键（语言本身同形的词、技术占位符）
const identicalAllowedKeys = new Set([
  'nav.infra',
  'nav.modules',
  'nav.blog',
  'nav.studio',
  'blog.editor.code',
  'blog.editor.imageGif',
  'blog.agent.conversations',
  'profile.nav.notifications',
  'profile.emailReminders.actions',
  'profile.emailReminders.pageSizeOption',
  'hero.performance',
  'infra.title',
  'components.toast.tag',
])

const locales = ['zh', 'fr', 'ja', 'ru', 'vi']

async function main() {
  const enModule = await import(pathToFileURL(path.join(LOCALES_DIR, 'en.js')).href)
  const enFlat = flatten(enModule.default)

  for (const locale of locales) {
    const locModule = await import(pathToFileURL(path.join(LOCALES_DIR, `${locale}.js`)).href)
    const locFlat = flatten(locModule.default)
    const untranslated = {}

    for (const [key, enVal] of Object.entries(enFlat)) {
      const locVal = locFlat[key]
      if (locVal === undefined) continue
      if (locVal !== enVal) continue
      if (brandNames.has(key) || brandNames.has(String(enVal))) continue
      if (skipPatterns.some(p => p.test(key) || p.test(String(enVal)))) continue
      if (identicalAllowedKeys.has(key)) continue
      if (typeof enVal === 'string' && enVal.length < 4) continue
      if (/[a-zA-Z]{3,}/.test(String(enVal))) {
        untranslated[key] = enVal
      }
    }

    const count = Object.keys(untranslated).length
    if (count > 0) {
      console.log(`\n=== ${locale} (${count} untranslated) ===`)
      for (const [k, v] of Object.entries(untranslated))
        console.log(`  "${k}": "${v}"`)
    } else {
      console.log(`\n=== ${locale}: all translated ✅ ===`)
    }
  }
}

main().catch((err) => { console.error(err); process.exitCode = 1 })
