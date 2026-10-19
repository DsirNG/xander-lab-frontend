---
name: dinqor-api-design
description: 修改当前前端 API、鉴权、上传和响应归一化时使用现有传输与业务服务。
---

# dinqor-api-design

使用 src/api/http.js 的 axios 封装和 @api 公开能力，不使用原生 fetch 或另建 axios 实例。业务接口与字段转换留在所属 features 的 services，先确认拦截器已经解包的层级。

本项目错误契约为 {code,message,data}，真实 HTTP 状态与 code 对齐；401 交给公共客户端的刷新、失败登出与全局 Toast。不要照搬参考项目仅成功码 0 的假设。工作室请求复用客户端并用 baseURL 为空覆盖，平台使用 /api。

不硬编码生产主机，不记录 token、Cookie 或凭据。取消和幂等按已有 dedupe、signal、_silent 等契约传递；上传、下载、SSE 保持其独立生命周期。上传复用现有限制、进度与文件引用，不把显示 URL 当作永久身份。

验证请求参数、响应归一化、错误和取消路径，测试 mock 网络，禁止测试发布真实文章、发送真实邮件或上传生产文件。
