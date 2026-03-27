# EasyXL

English | [简体中文](README.md)

A Tampermonkey userscript for IXL practice pages. It injects a floating UI in the bottom-right corner, extracts the question area HTML, and sends it to the Kouri API so a model can parse and solve the problem.

## Features

- Floating UI on IXL pages (draggable, closable)
- Extracts the question area HTML (`section.ixl-practice-crate` / `section.question-and-submission-view` / `section.question-view`)
- Uses `GM_xmlhttpRequest` to bypass the page CSP for cross-origin requests
- Displays the model output in the result box (format: `Question: ...` + `Answer: ...`)

## Prerequisites

- Tampermonkey (or a compatible userscript manager) installed in your browser
- A valid Kouri API Key (looks like `sk-...`)

## Install & Use

1. Open Tampermonkey and create a new script.
2. Copy the full content of [easyxl.js](file:///z:/ixl-ai-solver/easyxl.js) into the editor and save.
3. Open any IXL practice page (`https://*.ixl.com/*`).
4. The “EasyXL” floating panel appears in the bottom-right:
   - Enter your Kouri API Key (saved to `localStorage`)
   - Optional: change the model name (default: `gpt-4o`, also saved to `localStorage`)
   - Click `Parse & Solve` to start

## Local Storage Keys

- `kouri_api_key`: your API key
- `kouri_model`: model name (default: `gpt-4o`)

## Notes

- The script sends the question-area HTML to the API for parsing. Make sure you understand and accept this behavior.
- The API key is stored in `localStorage`. Do not use it on untrusted machines or profiles.
