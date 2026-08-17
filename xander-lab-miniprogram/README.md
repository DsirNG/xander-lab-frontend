# DinQorAI 小程序

基于 Taro 4、React 18 和 TypeScript 的微信/支付宝小程序版本，按照提供的 8 张 UI 设计图实现。同一套代码构建双端：`@tarojs/plugin-platform-weapp` + `@tarojs/plugin-platform-alipay`。

## 开发

```bash
pnpm install
pnpm dev:weapp     # 微信小程序（微信开发者工具导入本目录或 dist）
```

支付宝小程序：

```bash
pnpm dev:alipay    # 支付宝开发者工具导入 dist（构建输出 mini.project.json）
```

H5 开发预览：

```bash
pnpm dev:h5
```

浏览器访问 `http://127.0.0.1:10086`。生产构建使用 `pnpm build:h5`。

注意：weapp 与 alipay 的构建输出共用 `dist/` 目录，两端互覆盖；同一时间只保持一个端的产物，发布前用对应命令重新构建。

## 后端接口

文章数据与 PC 端共用 `/api/blog` 接口。H5 开发环境通过本地代理访问后端，微信/支付宝小程序直接请求 `https://api.dinqor.cn`。发布前需要在微信公众平台 / 支付宝开放平台把该域名加入 request 合法域名（经 web-view 嵌入 PC 页面的功能还需配 web-view 业务域名）。

## 登录（微信一键登录）

- 小程序端：个人中心页点击「微信一键登录」，`Taro.login()` 拿 code 调 `POST /api/auth/wechat-login`，后端 `jscode2session` 换 openid 并自动注册/绑定账号（`sys_user.openid` 唯一索引）。
- 后端配置：环境变量 `WECHAT_MINI_APP_ID` / `WECHAT_MINI_APP_SECRET`（本地放 `application-local.yml`，不提交 git）；首次部署需手工执行 `sys_user_wechat_openid_migration.sql`。
- `src/api/http.ts` 统一处理 token 存取、Authorization 头与 401 无感刷新，与 PC 端 `http.js` 语义一致。

## 页面

- 发现首页
- 全部文章
- 搜索及结果
- 文章详情
- 全部评论
- 前端专题
- 我的收藏
- 个人中心（微信一键登录）

## 平台差异说明

- 登录渠道：微信用 `Taro.login`（后端换取 openid）；支付宝渠道后端尚未接入，支付宝端登录入口待支付宝 AppID 配置后实现。
- 流式 AI 对话（博客智能体）等重交互页面：采用 web-view 嵌入 PC 端 H5 实现，不原生复刻。