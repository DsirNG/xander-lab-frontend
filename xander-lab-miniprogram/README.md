# Xander Lab 小程序

基于 Taro 4、React 18 和 TypeScript 的微信小程序版本，按照提供的 8 张 UI 设计图实现。

## 开发

```bash
pnpm install
pnpm dev:weapp
```

H5 开发预览：

```bash
pnpm dev:h5
```

浏览器访问 `http://127.0.0.1:10086`。生产构建使用 `pnpm build:h5`。

使用微信开发者工具打开本目录，或直接导入 `dist` 目录。正式联调前请将 `project.config.json` 中的 `appid` 替换为真实小程序 AppID。

## 页面

- 发现首页
- 全部文章
- 搜索及结果
- 文章详情
- 全部评论
- 前端专题
- 我的收藏
- 个人中心
