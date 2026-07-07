/**
 * 查找代码中使用但 en.js 中缺失的 t() key
 * 用法: node scripts/find-missing-i18n-keys.mjs
 */

import fs from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const LOCALES_DIR = path.resolve('src/locales')
const SRC_DIR = path.resolve('src')

// 解析 ES module locale 文件，提取所有 key（支持嵌套点号路径）
// 同时收集中间对象 key（用于 returnObjects: true 的场景）
function extractKeys(obj, prefix = '') {
  const keys = []
  for (const [k, v] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${k}` : k
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      keys.push(fullKey) // 中间对象 key（returnObjects 场景）
      keys.push(...extractKeys(v, fullKey))
    } else {
      keys.push(fullKey)
    }
  }
  return keys
}

// 从源码中提取所有 t('...') 调用
function extractTCalls(content) {
  const keys = new Set()
  const regex = /\bt\(\s*['"`]([^'"`\n]+?)['"`]\s*[),]/g
  let match
  while ((match = regex.exec(content)) !== null) {
    const key = match[1]
    // 跳过模板字符串变量
    if (key.startsWith('{{') || key.includes('${')) continue
    keys.add(key)
  }
  return keys
}

async function walkDir(dir) {
  const files = []
  const entries = await fs.readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (['node_modules', '.git', 'locales', 'dist'].includes(entry.name)) continue
      files.push(...(await walkDir(fullPath)))
    } else if (/\.(tsx?|jsx?)$/.test(entry.name)) {
      files.push(fullPath)
    }
  }
  return files
}

async function main() {
  // 加载 en.js
  const enModule = await import(pathToFileURL(path.join(LOCALES_DIR, 'en.js')).href)
  const enKeys = new Set(extractKeys(enModule.default))

  const files = await walkDir(SRC_DIR)
  const missingKeys = new Map()

  for (const file of files) {
    const content = await fs.readFile(file, 'utf8')
    const relPath = path.relative(SRC_DIR, file)
    const tCalls = extractTCalls(content)

    for (const key of tCalls) {
      if (!enKeys.has(key)) {
        if (!missingKeys.has(key)) missingKeys.set(key, [])
        missingKeys.get(key).push(relPath)
      }
    }
  }

  if (missingKeys.size === 0) {
    console.log('✅ All t() keys found in en.js!')
  } else {
    console.log(`❌ Found ${missingKeys.size} missing keys:\n`)
    for (const [key, files] of [...missingKeys.entries()].sort(([a], [b]) => a.localeCompare(b))) {
      console.log(`  "${key}"`)
      for (const f of [...new Set(files)]) console.log(`    -> ${f}`)
    }
    process.exitCode = 1
  }
}

main().catch((err) => { console.error(err); process.exitCode = 1 })
