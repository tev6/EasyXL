# EasyXL

[English](README.md) | 简体中文

用于 IXL 页面的AI自动答题的 Tampermonkey 用户脚本：在IXL页面上添加悬浮面板，通过提取题目区域的 HTML，调用不同的模型接口解析题目后给出答案。

![1774577431317](image/README/1774577431317.png)

## 功能

- 可拖拽的 IXL 页面悬浮窗
- 单独按下并松开 Ctrl 可隐藏/显示窗口（不会影响 Ctrl+C 等组合键）
- 从页面中提取题目区域的 HTML（`section.ixl-practice-crate` / `section.question-and-submission-view` / `section.question-view`）
- **用户注释功能**：允许在解析前添加自定义提示或解题要求，这些备注会直接发送给 AI。
- 使用 `GM_xmlhttpRequest` 发送跨域请求以绕过页面 CSP 限制
- **智能答案提取**：指示 AI 进行逐步推理（Chain of Thought），但程序会自动提取并仅展示最终的精简答案。
- **支持在结果框中渲染富文本 Markdown 和数学公式（基于 KaTeX）**

## 使用前提

- 浏览器已安装 Tampermonkey（或兼容的用户脚本管理器）
- 准备好你要使用的脚本对应的 API Key

## 书签版本 Bookmarklet（无需安装插件）

如果你不想安装 Tampermonkey，或者在无法安装插件的设备上，可以使用**书签版本（Bookmarklet）**（属于实验性功能，可能会受限于页面的 CSP 跨域策略）。

1. 在浏览器的书签栏中创建一个新书签（网页收藏）。
2. 将名称设为“EasyXL Solver”。
3. 复制 `bookmarklet.txt` 文件中的**所有单行内容**，粘贴到书签的“网址（URL）”输入框中并保存。
4. 当你在 IXL 题目页面时，点击这个书签即可直接在页面中注入并唤起 EasyXL 界面！

## 脚本列表

- Kouri： [easyxl-kouriapi.js](easyxl-kouriapi.js)
- DeepSeek： [easyxl-deepseek.js](easyxl-deepseek.js)
- OpenAI： [easyxl-openai.js](easyxl-openai.js)
- Gemini： [easyxl-gemini.js](easyxl-gemini.js)

## 安装与使用

1. 打开 Tampermonkey，创建一个新脚本。
2. 从上面的脚本列表中选择一个，把对应文件的内容完整粘贴进去并保存。
3. 打开任意 IXL 练习页面（比如: https://www.ixl.com/math/algebra-1/graph-solutions-to-absolute-value-inequalities）。
4. 网页右下角会出现 “EasyXL” 悬浮窗：
   - 输入该脚本对应的 API Key（会保存到浏览器 `localStorage`）
   - 可选：修改模型名
   - 点击 `Parse & Solve` 开始解析并求解

## 配置项（本地存储）

- Kouri：`easyxl_kouri_api_key`、`easyxl_kouri_model`
- DeepSeek：`easyxl_deepseek_api_key`、`easyxl_deepseek_model`
- OpenAI：`easyxl_openai_api_key`、`easyxl_openai_model`
- Gemini：`easyxl_gemini_api_key`、`easyxl_gemini_model`

## 注意事项

- 脚本会把题目区域的 HTML 发送到对应 API 用于解析，请确保你了解并接受该数据传输行为。
- 脚本会把 API Key 存在 `localStorage`，请勿在不受信任的环境中使用。

## 贡献

欢迎 Issues 和 Pull Request。
