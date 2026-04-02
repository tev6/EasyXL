# EasyXL

English | [简体中文](README-cn.md)

Tampermonkey userscript for AI-assisted solving on IXL pages. It adds a unified floating panel, extracts the question-area HTML, and sends it to a configurable model provider to produce an answer.

<img width="2832" height="1478" alt="image" src="https://github.com/user-attachments/assets/9f75b78f-19a4-410a-91a8-a8834edb207a" />

## Features

- Floating UI on IXL pages (draggable)
- Press Ctrl (tap-and-release, not Ctrl+something) to toggle show/hide
- One main script with built-in provider switching for OpenAI, Anthropic, Google, DeepSeek, and Kouri
- Extracts the question area HTML (`section.ixl-practice-crate` / `section.question-and-submission-view` / `section.question-view`)
- **User Notes**: Allows you to add custom instructions or context before parsing, which will be sent to the AI.
- Uses `GM_xmlhttpRequest` to bypass the page CSP for cross-origin requests
- **Smart Answer Extraction**: Instructs AI to perform step-by-step reasoning but only extracts and displays the final concise answer.
- **Supports rich Markdown rendering and Math equations (using KaTeX)** in the result box
- Gear button opens an in-window settings panel with close via X, ESC, or overlay click
- Stores API key, model, base URL, and user notes separately for each provider
- Shows clear configuration guidance inside settings when a request fails or config is invalid

## Prerequisites

- Tampermonkey (or a compatible userscript manager) installed in your browser
- A valid API key for the provider you want to use

## Script

- Main script: [easyxl.js](easyxl.js)

## Install & Use

1. Open Tampermonkey and create a new script.
2. Copy the full contents of [easyxl.js](easyxl.js) into the editor, then save.
3. Open any IXL practice page (e.g. https://www.ixl.com/math/algebra-1/graph-solutions-to-absolute-value-inequalities).
4. The “EasyXL” floating panel appears in the bottom-right:
   - Click the gear button and choose an AI provider
   - Configure the API key, model, and base URL for that provider
   - Optionally add provider-specific user notes
   - Click `Parse & Solve` to start and the extracted final answer appears in the result box

## Local Storage Keys

- Unified config: `easyxl_unified_settings`
- Legacy standalone-script settings are migrated into the unified config on first run

## Notes

- The script sends the question-area HTML to the API for parsing. Make sure you understand and accept this behavior.
- The API key is stored in `localStorage`. Do not use it on untrusted machines or profiles.

## Contributing

Issues and Pull Requests are welcome.
