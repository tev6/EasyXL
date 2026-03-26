# EasyXL

一个用于 IXL 练习页面的 Tampermonkey 用户脚本：在页面右下角注入一个悬浮 UI，提取题目区域的 HTML，并通过 Kouri API 调用模型解析题目并给出答案。

## 功能

- 在 IXL 页面显示悬浮窗（可拖拽、可关闭）
- 从页面中提取题目区域的 HTML（`section.ixl-practice-crate` / `section.question-and-submission-view` / `section.question-view`）
- 使用 `GM_xmlhttpRequest` 发送跨域请求以绕过页面 CSP 限制
- 将模型返回的结果展示在文本框中（格式：`Question: ...` + `Answer: ...`）

## 使用前提

- 浏览器已安装 Tampermonkey（或兼容的用户脚本管理器）
- 一个可用的 Kouri API Key（形如 `sk-...`）

## 安装与使用

1. 打开 Tampermonkey，创建一个新脚本。
2. 将 [ixl-solver.js](file:///z:/ixl-ai-solver/ixl-solver.js) 的内容完整粘贴进去并保存。
3. 打开任意 IXL 练习页面（`https://*.ixl.com/*`）。
4. 右下角会出现 “EasyXL” 悬浮窗：
   - 输入 Kouri API Key（会保存到浏览器 `localStorage`）
   - 可选：修改模型名（默认 `gpt-4o`，同样保存到 `localStorage`）
   - 点击 `Parse & Solve` 开始解析并求解

## 配置项（本地存储）

- `kouri_api_key`：你的 API Key
- `kouri_model`：模型名称（默认 `gpt-4o`）

## 注意事项

- 该脚本会把题目区域的 HTML 发送到 API 用于解析，请确保你了解并接受数据传输行为。
- 该脚本把 API Key 存在 `localStorage`，请勿在不受信任的环境中使用。

