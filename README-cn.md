# EasyXL

[English](README.md) | 简体中文

用于 IXL 页面的 AI 自动答题 Tampermonkey 用户脚本：在页面上添加统一悬浮面板，通过提取题目区域的 HTML，调用可配置的模型供应商解析题目并返回答案。

<img width="2832" height="1478" alt="image" src="https://github.com/user-attachments/assets/a6b5f889-1c44-45f6-a6ea-6b036a206ac5" />

## 功能

- 可拖拽的 IXL 页面悬浮窗
- 单独按下并松开 Ctrl 可隐藏/显示窗口（不会影响 Ctrl+C 等组合键）
- 单一主脚本内集成 OpenAI、Anthropic、Google、DeepSeek、Kouri 多供应商切换
- 从页面中提取题目区域的 HTML（`section.ixl-practice-crate` / `section.question-and-submission-view` / `section.question-view`）
- **用户注释功能**：允许在解析前添加自定义提示或解题要求，这些备注会直接发送给 AI。
- 使用 `GM_xmlhttpRequest` 发送跨域请求以绕过页面 CSP 限制
- **智能答案提取**：指示 AI 进行逐步推理（Chain of Thought），但程序会自动提取并仅展示最终的精简答案。
- **支持在结果框中渲染富文本 Markdown 和数学公式（基于 KaTeX）**
- 右上角齿轮按钮可打开设置面板，支持 X 按钮、ESC、点击遮罩关闭
- 为每个供应商分别保存 API Key、模型、基础 URL 和用户注释
- 请求失败或配置无效时，会在设置面板中给出明确提示并引导重新配置

## 使用前提

- 浏览器已安装 Tampermonkey（或兼容的用户脚本管理器）
- 准备好你要使用的供应商 API Key

## 脚本

- 主脚本： [easyxl.js](easyxl.js)

## 安装与使用

1. 打开 Tampermonkey，创建一个新脚本。
2. 将 [easyxl.js](easyxl.js) 的完整内容粘贴进去并保存。
3. 打开任意 IXL 练习页面（比如: https://www.ixl.com/math/algebra-1/graph-solutions-to-absolute-value-inequalities）。
4. 网页右下角会出现 “EasyXL” 悬浮窗：
   - 点击右上角齿轮，选择 AI 供应商
   - 为当前供应商配置 API Key、模型和基础 URL
   - 可选：填写该供应商专属的用户注释
   - 点击“解析并求解”开始解析并求解

## 配置项（本地存储）

- 统一配置：`easyxl_unified_settings`
- 旧版的独立脚本配置会在首次运行时自动迁移到统一配置中

## 注意事项

- 脚本会把题目区域的 HTML 发送到对应 API 用于解析，请确保你了解并接受该数据传输行为。
- 脚本会把 API Key 存在 `localStorage`，请勿在不受信任的环境中使用。

## 贡献

欢迎 Issues 和 Pull Request。
