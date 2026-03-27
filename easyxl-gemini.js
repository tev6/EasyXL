// ==UserScript==
// @name         EasyXL (Gemini)
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  EasyXL - IXL Solver powered by Gemini API (Bypasses CSP)
// @author       You
// @match        *://*.ixl.com/*
// @grant        GM_xmlhttpRequest
// @connect      generativelanguage.googleapis.com
// ==/UserScript==

(function() {
    'use strict';

    const UI_ID = 'easyxl-gemini-ui';
    const STORAGE_KEY_API = 'easyxl_gemini_api_key';
    const STORAGE_KEY_MODEL = 'easyxl_gemini_model';

    if (document.getElementById(UI_ID)) {
        console.log('EasyXL UI is already open.');
        return;
    }

    const ui = document.createElement('div');
    ui.id = UI_ID;
    ui.style.position = 'fixed';
    ui.style.bottom = '20px';
    ui.style.right = '20px';
    ui.style.width = '360px';
    ui.style.background = 'rgba(255, 255, 255, 0.92)';
    ui.style.border = '1px solid rgba(148, 163, 184, 0.35)';
    ui.style.borderRadius = '14px';
    ui.style.boxShadow = '0 18px 60px rgba(2, 6, 23, 0.25)';
    ui.style.backdropFilter = 'blur(14px)';
    ui.style.webkitBackdropFilter = 'blur(14px)';
    ui.style.zIndex = '999999';
    ui.style.fontFamily = "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Arial, 'Noto Sans', 'Helvetica Neue', sans-serif";
    ui.style.padding = '14px';
    ui.style.display = 'flex';
    ui.style.flexDirection = 'column';
    ui.style.gap = '10px';
    ui.style.color = '#0f172a';

    const header = document.createElement('div');
    header.style.display = 'flex';
    header.style.justifyContent = 'flex-start';
    header.style.alignItems = 'center';
    header.style.paddingBottom = '10px';
    header.style.borderBottom = '1px solid rgba(148, 163, 184, 0.25)';

    const titleWrap = document.createElement('div');
    titleWrap.style.display = 'flex';
    titleWrap.style.alignItems = 'center';
    titleWrap.style.gap = '10px';

    const title = document.createElement('div');
    title.innerText = 'EasyXL';
    title.style.margin = '0';
    title.style.fontSize = '14px';
    title.style.fontWeight = '700';
    title.style.letterSpacing = '0.2px';

    const badge = document.createElement('span');
    badge.innerText = 'Gemini';
    badge.style.fontSize = '11px';
    badge.style.fontWeight = '700';
    badge.style.padding = '3px 8px';
    badge.style.borderRadius = '999px';
    badge.style.background = 'rgba(37, 99, 235, 0.10)';
    badge.style.color = '#1d4ed8';
    badge.style.border = '1px solid rgba(37, 99, 235, 0.18)';

    titleWrap.appendChild(title);
    titleWrap.appendChild(badge);
    header.appendChild(titleWrap);
    ui.appendChild(header);

    function applyFieldStyle(el) {
        el.style.width = '100%';
        el.style.padding = '10px 10px';
        el.style.border = '1px solid rgba(148, 163, 184, 0.45)';
        el.style.borderRadius = '12px';
        el.style.background = 'rgba(248, 250, 252, 0.85)';
        el.style.color = '#0f172a';
        el.style.outline = 'none';
        el.style.boxSizing = 'border-box';
        el.style.fontSize = '13px';
    }

    function addFocusRing(el) {
        el.addEventListener('focus', () => {
            el.style.borderColor = 'rgba(37, 99, 235, 0.65)';
            el.style.boxShadow = '0 0 0 4px rgba(37, 99, 235, 0.16)';
        });
        el.addEventListener('blur', () => {
            el.style.borderColor = 'rgba(148, 163, 184, 0.45)';
            el.style.boxShadow = 'none';
        });
    }

    const apiKeyInput = document.createElement('input');
    apiKeyInput.type = 'text';
    apiKeyInput.placeholder = 'Gemini API Key';
    apiKeyInput.value = localStorage.getItem(STORAGE_KEY_API) || '';
    applyFieldStyle(apiKeyInput);
    addFocusRing(apiKeyInput);
    apiKeyInput.onchange = (e) => localStorage.setItem(STORAGE_KEY_API, e.target.value);
    ui.appendChild(apiKeyInput);

    const modelInput = document.createElement('input');
    modelInput.type = 'text';
    modelInput.placeholder = 'Model (e.g., gemini-1.5-flash)';
    modelInput.value = localStorage.getItem(STORAGE_KEY_MODEL) || 'gemini-1.5-flash';
    applyFieldStyle(modelInput);
    addFocusRing(modelInput);
    modelInput.onchange = (e) => localStorage.setItem(STORAGE_KEY_MODEL, e.target.value);
    ui.appendChild(modelInput);

    const parseBtn = document.createElement('button');
    parseBtn.innerText = 'Parse & Solve';
    parseBtn.style.padding = '10px 12px';
    parseBtn.style.border = '1px solid rgba(30, 64, 175, 0.20)';
    parseBtn.style.borderRadius = '12px';
    parseBtn.style.cursor = 'pointer';
    parseBtn.style.fontWeight = '700';
    parseBtn.style.letterSpacing = '0.2px';
    parseBtn.style.color = '#ffffff';
    parseBtn.style.background = 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)';
    parseBtn.style.boxShadow = '0 10px 24px rgba(37, 99, 235, 0.22)';
    parseBtn.style.transition = 'transform 0.12s ease, box-shadow 0.12s ease, filter 0.12s ease';
    parseBtn.onmouseover = () => {
        if (parseBtn.disabled) return;
        parseBtn.style.filter = 'brightness(1.03)';
        parseBtn.style.transform = 'translateY(-1px)';
        parseBtn.style.boxShadow = '0 14px 30px rgba(37, 99, 235, 0.24)';
    };
    parseBtn.onmouseout = () => {
        parseBtn.style.filter = 'none';
        parseBtn.style.transform = 'none';
        parseBtn.style.boxShadow = '0 10px 24px rgba(37, 99, 235, 0.22)';
    };
    ui.appendChild(parseBtn);

    const resultArea = document.createElement('textarea');
    resultArea.style.height = '140px';
    resultArea.style.resize = 'vertical';
    resultArea.readOnly = true;
    resultArea.placeholder = 'Result will appear here...';
    applyFieldStyle(resultArea);
    addFocusRing(resultArea);
    ui.appendChild(resultArea);

    document.body.appendChild(ui);

    function setButtonIdle() {
        parseBtn.innerText = 'Parse & Solve';
        parseBtn.disabled = false;
        parseBtn.style.background = 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)';
        parseBtn.style.boxShadow = '0 10px 24px rgba(37, 99, 235, 0.22)';
    }

    function setButtonBusy() {
        parseBtn.innerText = 'Solving...';
        parseBtn.disabled = true;
        parseBtn.style.background = 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)';
        parseBtn.style.boxShadow = 'none';
        parseBtn.style.transform = 'none';
        parseBtn.style.filter = 'none';
    }

    parseBtn.onclick = () => {
        const apiKey = apiKeyInput.value.trim();
        const model = modelInput.value.trim() || 'gemini-1.5-flash';

        if (!apiKey) {
            alert('Please enter your Gemini API Key.');
            return;
        }

        const section = document.querySelector('section.ixl-practice-crate') ||
                        document.querySelector('section.question-and-submission-view') ||
                        document.querySelector('section.question-view');

        if (!section) {
            resultArea.value = 'Error: Could not find question HTML on this page.';
            return;
        }

        const rawHtml = section.outerHTML;

        const systemPrompt = "You are an expert math solver specializing in parsing complex web code. Your task is to: 1. **Analyze the provided HTML code block** to accurately determine the exact math problem (function evaluation, equation, etc.). Convert all ambiguous notation (like nested divs for fractions, or implicit multiplication) into a clear mathematical text string. 2. **Solve the math problem.** Always follow standard order of operations (PEMDAS/BODMAS): Parentheses/Brackets, Exponents/Orders, Multiplication-Division (left to right), Addition-Subtraction (left to right). 3. **Return ONLY in this exact plain text format, nothing else:** Question: [clear text of the math problem you interpreted] Answer: [final calculated numerical answer or expression]";
        const userPrompt = `--- START QUESTION HTML ---\n${rawHtml}\n--- END QUESTION HTML ---`;
        const mergedPrompt = `${systemPrompt}\n\n${userPrompt}`;

        setButtonBusy();
        resultArea.value = 'Sending request to AI...';

        if (typeof GM_xmlhttpRequest !== "undefined") {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
            const payload = {
                contents: [
                    {
                        role: "user",
                        parts: [{ text: mergedPrompt }]
                    }
                ],
                generationConfig: {
                    temperature: 0.0
                }
            };

            GM_xmlhttpRequest({
                method: "POST",
                url,
                headers: {
                    "Content-Type": "application/json"
                },
                data: JSON.stringify(payload),
                onload: function(response) {
                    if (response.status >= 200 && response.status < 300) {
                        try {
                            const data = JSON.parse(response.responseText);
                            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                            resultArea.value = (typeof text === 'string' && text.trim()) ? text.trim() : response.responseText;
                        } catch (e) {
                            resultArea.value = `Parse Error: ${e.message}\nRaw: ${response.responseText}`;
                        }
                    } else {
                        resultArea.value = `API Error ${response.status}: ${response.responseText}`;
                    }
                    setButtonIdle();
                },
                onerror: function() {
                    resultArea.value = 'Request failed (Network Error). Check your API Key or connection.';
                    setButtonIdle();
                }
            });
        } else {
            resultArea.value = 'Error: GM_xmlhttpRequest is not defined. Please run this script via Tampermonkey extension to bypass CSP.';
            setButtonIdle();
        }
    };

    let isDragging = false;
    let currentX;
    let currentY;
    let initialX;
    let initialY;
    let xOffset = 0;
    let yOffset = 0;

    header.style.cursor = 'grab';
    header.addEventListener('mousedown', dragStart);
    document.addEventListener('mouseup', dragEnd);
    document.addEventListener('mousemove', drag);

    function dragStart(e) {
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;
        if (e.target === header || e.target === title || e.target === badge || e.target === titleWrap) {
            isDragging = true;
            header.style.cursor = 'grabbing';
        }
    }

    function dragEnd() {
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

    let ctrlDown = false;
    let ctrlUsedAsModifier = false;

    document.addEventListener('keydown', (e) => {
        if (e.code === 'ControlLeft' || e.code === 'ControlRight') {
            if (!e.repeat) {
                ctrlDown = true;
                ctrlUsedAsModifier = false;
            }
            return;
        }
        if (ctrlDown) {
            ctrlUsedAsModifier = true;
        }
    });

    document.addEventListener('keyup', (e) => {
        if (e.code !== 'ControlLeft' && e.code !== 'ControlRight') return;
        if (ctrlDown && !ctrlUsedAsModifier) {
            ui.style.display = ui.style.display === 'none' ? 'flex' : 'none';
        }
        ctrlDown = false;
        ctrlUsedAsModifier = false;
    });

    console.log('EasyXL (Gemini) userscript loaded successfully.');
})();

