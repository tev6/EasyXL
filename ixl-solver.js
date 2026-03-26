// ==UserScript==
// @name         🤖 IXL AI Solver
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  IXL Math Solver powered by Kouri AI (Bypasses CSP)
// @author       You
// @match        *://*.ixl.com/*
// @grant        GM_xmlhttpRequest
// @connect      api.kourichat.com
// ==/UserScript==

(function() {
    'use strict';

    // 检查页面是否已注入该 UI，防止重复添加
    if (document.getElementById('ixl-ai-solver-ui')) {
        console.log('AI Solver UI is already open.');
        return;
    }

    // 创建悬浮窗的主体容器
    const ui = document.createElement('div');
    ui.id = 'ixl-ai-solver-ui';
    ui.style.position = 'fixed';
    ui.style.bottom = '20px';
    ui.style.right = '20px';
    ui.style.width = '350px';
    ui.style.backgroundColor = '#ffffff';
    ui.style.border = '1px solid #ccc';
    ui.style.borderRadius = '8px';
    ui.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    ui.style.zIndex = '999999';
    ui.style.fontFamily = 'Arial, sans-serif';
    ui.style.padding = '15px';
    ui.style.display = 'flex';
    ui.style.flexDirection = 'column';
    ui.style.gap = '10px';
    ui.style.color = '#333';

    // Title and Close button
    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.paddingBottom = '5px';
    header.style.borderBottom = '1px solid #eee';

    const title = document.createElement('h3');
    title.innerText = '🤖 IXL AI Solver';
    title.style.margin = '0';
    title.style.fontSize = '16px';

    const closeBtn = document.createElement('button');
    closeBtn.innerText = '✕';
    closeBtn.style.cursor = 'pointer';
    closeBtn.style.background = 'none';
    closeBtn.style.border = 'none';
    closeBtn.style.fontSize = '16px';
    closeBtn.style.color = '#999';
    closeBtn.onclick = () => document.body.removeChild(ui);
    closeBtn.onmouseover = () => closeBtn.style.color = '#333';
    closeBtn.onmouseout = () => closeBtn.style.color = '#999';

    header.appendChild(title);
    header.appendChild(closeBtn);
    ui.appendChild(header);

    // API Key Input
    const apiKeyInput = document.createElement('input');
    apiKeyInput.type = 'password';
    apiKeyInput.placeholder = 'Enter Kouri API Key (sk-...)';
    apiKeyInput.style.padding = '8px';
    apiKeyInput.style.border = '1px solid #ccc';
    apiKeyInput.style.borderRadius = '4px';
    apiKeyInput.value = localStorage.getItem('kouri_api_key') || '';
    apiKeyInput.onchange = (e) => localStorage.setItem('kouri_api_key', e.target.value);
    ui.appendChild(apiKeyInput);

    // Model Input
    const modelInput = document.createElement('input');
    modelInput.type = 'text';
    modelInput.placeholder = 'Model (e.g., gpt-4o)';
    modelInput.value = localStorage.getItem('kouri_model') || 'gpt-4o';
    modelInput.style.padding = '8px';
    modelInput.style.border = '1px solid #ccc';
    modelInput.style.borderRadius = '4px';
    modelInput.onchange = (e) => localStorage.setItem('kouri_model', e.target.value);
    ui.appendChild(modelInput);

    // 添加解析并求解的按钮
    const parseBtn = document.createElement('button');
    parseBtn.innerText = 'Parse & Solve';
    parseBtn.style.padding = '10px';
    parseBtn.style.backgroundColor = '#007bff';
    parseBtn.style.color = 'white';
    parseBtn.style.border = 'none';
    parseBtn.style.borderRadius = '4px';
    parseBtn.style.cursor = 'pointer';
    parseBtn.style.fontWeight = 'bold';
    parseBtn.style.transition = 'background-color 0.2s';
    parseBtn.onmouseover = () => parseBtn.style.backgroundColor = '#0056b3';
    parseBtn.onmouseout = () => parseBtn.style.backgroundColor = '#007bff';
    ui.appendChild(parseBtn);

    // Result Area
    const resultArea = document.createElement('textarea');
    resultArea.style.width = '100%';
    resultArea.style.height = '120px';
    resultArea.style.marginTop = '5px';
    resultArea.style.padding = '8px';
    resultArea.style.border = '1px solid #ccc';
    resultArea.style.borderRadius = '4px';
    resultArea.style.resize = 'vertical';
    resultArea.style.boxSizing = 'border-box';
    resultArea.readOnly = true;
    resultArea.placeholder = 'Extracted question and answer will appear here...';
    resultArea.style.fontSize = '14px';
    ui.appendChild(resultArea);

    document.body.appendChild(ui);

    // Parse Logic
    parseBtn.onclick = () => {
        const apiKey = apiKeyInput.value.trim();
        const model = modelInput.value.trim() || 'gpt-4o';

        if (!apiKey) {
            alert('Please enter your Kouri API Key.');
            return;
        }

    // 1. 提取页面上的题目 HTML
    // 通过特定的 CSS 类名来寻找 IXL 页面中的题目容器
    let section = document.querySelector('section.ixl-practice-crate') ||
                  document.querySelector('section.question-and-submission-view') ||
                  document.querySelector('section.question-view');

        if (!section) {
            resultArea.value = 'Error: Could not find question HTML on this page.';
            return;
        }

        const rawHtml = section.outerHTML;

        // 2. Prepare API Request
        const systemPrompt = "You are an expert math solver specializing in parsing complex web code. Your task is to: 1. **Analyze the provided HTML code block** to accurately determine the exact math problem (function evaluation, equation, etc.). Convert all ambiguous notation (like nested divs for fractions, or implicit multiplication) into a clear mathematical text string. 2. **Solve the math problem.** Always follow standard order of operations (PEMDAS/BODMAS): Parentheses/Brackets, Exponents/Orders, Multiplication-Division (left to right), Addition-Subtraction (left to right). 3. **Return ONLY in this exact plain text format, nothing else:** Question: [clear text of the math problem you interpreted] Answer: [final calculated numerical answer or expression]";

        const userPrompt = `--- START QUESTION HTML ---\n${rawHtml}\n--- END QUESTION HTML ---`;

        parseBtn.innerText = 'Solving...';
        parseBtn.disabled = true;
        parseBtn.style.backgroundColor = '#6c757d';
        resultArea.value = 'Sending request to AI...';

        // 3. 绕过 CSP 限制发送请求
        // 浏览器扩展中的 GM_xmlhttpRequest 允许发起跨域请求，从而绕过 Content Security Policy
        if (typeof GM_xmlhttpRequest !== "undefined") {
            GM_xmlhttpRequest({
                method: "POST",
                url: "https://api.kourichat.com/v1/chat/completions",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                data: JSON.stringify({
                    model: model,
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userPrompt }
                    ],
                    temperature: 0.0
                }),
                onload: function(response) {
                    if (response.status >= 200 && response.status < 300) {
                        try {
                            const data = JSON.parse(response.responseText);
                            resultArea.value = data.choices[0].message.content.trim();
                        } catch(e) {
                            resultArea.value = `Parse Error: ${e.message}\nRaw: ${response.responseText}`;
                        }
                    } else {
                        resultArea.value = `API Error ${response.status}: ${response.responseText}`;
                    }
                    parseBtn.innerText = 'Parse & Solve';
                    parseBtn.disabled = false;
                    parseBtn.style.backgroundColor = '#007bff';
                },
                onerror: function(error) {
                    resultArea.value = `Request failed (Network Error). Check your API Key or connection.`;
                    parseBtn.innerText = 'Parse & Solve';
                    parseBtn.disabled = false;
                    parseBtn.style.backgroundColor = '#007bff';
                }
            });
        } else {
            resultArea.value = "Error: GM_xmlhttpRequest is not defined. Please run this script via Tampermonkey extension to bypass CSP.";
            parseBtn.innerText = 'Parse & Solve';
            parseBtn.disabled = false;
            parseBtn.style.backgroundColor = '#007bff';
        }
    };

    // Make UI draggable
    let isDragging = false, currentX, currentY, initialX, initialY, xOffset = 0, yOffset = 0;
    header.style.cursor = 'grab';

    header.addEventListener('mousedown', dragStart);
    document.addEventListener('mouseup', dragEnd);
    document.addEventListener('mousemove', drag);

    function dragStart(e) {
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;
        if (e.target === header || e.target === title) {
            isDragging = true;
            header.style.cursor = 'grabbing';
        }
    }

    function dragEnd(e) {
        initialX = currentX;
        initialY = currentY;
        isDragging = false;
        header.style.cursor = 'grab';
    }

    function drag(e) {
        if (isDragging) {
            e.preventDefault();
            currentX = e.clientX - initialX;
            currentY = e.clientY - initialY;
            xOffset = currentX;
            yOffset = currentY;
            ui.style.transform = `translate(${currentX}px, ${currentY}px)`;
        }
    }

    console.log("IXL AI Solver UserScript loaded successfully.");
})();