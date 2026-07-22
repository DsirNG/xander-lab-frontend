import { defineConfig } from '@tarojs/cli'
import path from 'node:path'

export default defineConfig({
  projectName: 'xander-lab-miniprogram',
  date: '2026-07-22',
  designWidth: 390,
  deviceRatio: { 390: 2 },
  sourceRoot: 'src',
  outputRoot: 'dist',
  framework: 'react',
  compiler: 'webpack5',
  alias: { '@': path.resolve(__dirname, '..', 'src') },
  mini: { postcss: { pxtransform: { enable: true }, cssModules: { enable: false } } },
})
