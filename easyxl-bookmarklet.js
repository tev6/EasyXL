(function() {
    if (document.getElementById('easyxl-ui')) return;

    // 动态注入 marked 和 katex 依赖
    const head = document.head || document.getElementsByTagName('head')[0];
    const addScript = (src) => { const s = document.createElement('script'); s.src = src; head.appendChild(s); };
    const addStyle = (href) => { const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = href; head.appendChild(l); };
    
    addScript('https://cdn.jsdelivr.net/npm/marked/marked.min.js');
    addStyle('https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css');
    addScript('https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.js');

    // 创建 UI
    const ui = document.createElement('div');
    ui.id = 'easyxl-ui';
    ui.style.cssText = 'position:fixed;top:20px;right:20px;width:320px;background:rgba(255,255,255,0.25);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,0.3);box-shadow:0 8px 32px rgba(0,0,0,0.1);padding:15px;z-index:999999;border-radius:16px;font-family:system-ui,-apple-system,sans-serif;color:#1e293b;transition:opacity 0.3s ease;';

    const header = document.createElement('div');
    header.style.cssText = 'cursor:grab;font-weight:600;font-size:16px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;color:#0f172a;';
    header.innerHTML = '<span>✨ EasyXL Bookmarklet</span><span style="font-size:12px;font-weight:normal;color:#64748b;">Ctrl to toggle</span>';
    ui.appendChild(header);

    const applyStyle = (el) => {
        el.style.cssText += 'width:100%;box-sizing:border-box;margin-bottom:10px;padding:8px 12px;border:1px solid rgba(255,255,255,0.5);border-radius:8px;font-size:13px;background:rgba(255,255,255,0.5);color:#1e293b;outline:none;transition:all 0.2s;';
        el.onfocus = () => el.style.border = '1px solid #3b82f6';
        el.onblur = () => el.style.border = '1px solid rgba(255,255,255,0.5)';
    };

    const endpointInput = document.createElement('input');
    endpointInput.placeholder = 'API Endpoint';
    endpointInput.value = localStorage.getItem('easyxl_bm_endpoint') || 'https://api.openai.com/v1/chat/completions';
    endpointInput.oninput = (e) => localStorage.setItem('easyxl_bm_endpoint', e.target.value);
    applyStyle(endpointInput);
    ui.appendChild(endpointInput);

    const apiKeyInput = document.createElement('input');
    apiKeyInput.type = 'text';
    apiKeyInput.placeholder = 'API Key';
    apiKeyInput.value = localStorage.getItem('easyxl_bm_apikey') || '';
    apiKeyInput.oninput = (e) => localStorage.setItem('easyxl_bm_apikey', e.target.value);
    applyStyle(apiKeyInput);
    ui.appendChild(apiKeyInput);

    const modelInput = document.createElement('input');
    modelInput.placeholder = 'Model (e.g. gpt-4o or deepseek-chat)';
    modelInput.value = localStorage.getItem('easyxl_bm_model') || 'gpt-4o';
    modelInput.oninput = (e) => localStorage.setItem('easyxl_bm_model', e.target.value);
    applyStyle(modelInput);
    ui.appendChild(modelInput);

    const notesInput = document.createElement('textarea');
    notesInput.placeholder = 'User Notes (Optional)';
    notesInput.style.height = '40px';
    notesInput.style.resize = 'vertical';
    notesInput.value = localStorage.getItem('easyxl_bm_notes') || '';
    notesInput.oninput = (e) => localStorage.setItem('easyxl_bm_notes', e.target.value);
    applyStyle(notesInput);
    ui.appendChild(notesInput);

    const btn = document.createElement('button');
    btn.innerText = 'Parse & Solve';
    btn.style.cssText = 'width:100%;padding:10px;background:#3b82f6;color:white;border:none;border-radius:8px;font-weight:600;cursor:pointer;margin-bottom:10px;transition:background 0.2s;';
    btn.onmouseover = () => btn.style.background = '#2563eb';
    btn.onmouseout = () => btn.style.background = '#3b82f6';
    ui.appendChild(btn);

    const resultArea = document.createElement('div');
    resultArea.style.cssText = 'height:160px;overflow-y:auto;word-wrap:break-word;font-size:14px;line-height:1.5;user-select:text;background:rgba(255,255,255,0.5);border-radius:8px;padding:8px;border:1px solid rgba(255,255,255,0.5);';
    resultArea.innerHTML = '<span style="color:#64748b;">Result will appear here...</span>';
    ui.appendChild(resultArea);

    document.body.appendChild(ui);

    // 拖拽逻辑
    let isDragging = false, initialX, initialY, xOffset = 0, yOffset = 0;
    header.onmousedown = (e) => { initialX = e.clientX - xOffset; initialY = e.clientY - yOffset; isDragging = true; };
    document.onmouseup = () => isDragging = false;
    document.onmousemove = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        xOffset = e.clientX - initialX; yOffset = e.clientY - initialY;
        ui.style.transform = `translate3d(${xOffset}px, ${yOffset}px, 0)`;
    };

    // Ctrl 切换显示/隐藏
    let ctrlPressed = false;
    document.addEventListener('keydown', e => { if (e.key === 'Control') ctrlPressed = true; });
    document.addEventListener('keyup', e => {
        if (e.key === 'Control') {
            if (ctrlPressed) ui.style.display = ui.style.display === 'none' ? 'block' : 'none';
            ctrlPressed = false;
        }
    });

    // Markdown 和 Math 渲染
    const render = (text) => {
        if (!text) return '';
        const blocks = [];
        let p = text.replace(/\\\[([\s\S]*?)\\\]|\$\$([\s\S]*?)\$\$/g, (m, p1, p2) => {
            blocks.push({ type: 'block', text: p1 || p2 }); return `%%%M${blocks.length - 1}%%%`;
        }).replace(/\\\(([\s\S]*?)\\\)|(^|[^\\])\$([^\$]+?)\$/g, (m, p1, p2, p3) => {
            blocks.push({ type: 'inline', text: p1 || p3 });
            return p2 !== undefined ? p2 + `%%%M${blocks.length - 1}%%%` : `%%%M${blocks.length - 1}%%%`;
        });
        
        let html = typeof marked !== 'undefined' ? marked.parse(p) : p.replace(/\n/g, '<br>');
        if (typeof katex !== 'undefined') {
            html = html.replace(/%%%M(\d+)%%%/g, (m, i) => {
                try { return katex.renderToString(blocks[i].text, { displayMode: blocks[i].type === 'block', throwOnError: false }); }
                catch (e) { return blocks[i].text; }
            });
        }
        return html;
    };

    const setResult = (content, err = false) => {
        resultArea.innerHTML = err ? `<span style="color:#ef4444;font-weight:500;">${content.replace(/\n/g, '<br>')}</span>` : render(content);
    };

    // 解析与 API 请求
    btn.onclick = async () => {
        const ep = endpointInput.value.trim();
        const key = apiKeyInput.value.trim();
        const mod = modelInput.value.trim();
        if (!ep || !key || !mod) { setResult('Please fill in Endpoint, API Key and Model.', true); return; }

        const section = document.querySelector('section.ixl-practice-crate, section.question-and-submission-view, section.question-view');
        if (!section) { setResult('Error: Could not find question HTML.', true); return; }

        let prompt = `--- START QUESTION HTML ---\n${section.outerHTML}\n--- END QUESTION HTML ---`;
        const notes = notesInput.value.trim();
        if (notes) prompt += `\n\n--- USER NOTES ---\n${notes}\n--- END USER NOTES ---`;

        btn.innerText = 'Solving...'; btn.disabled = true; setResult('Sending request...');

        try {
            const res = await fetch(ep, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
                body: JSON.stringify({
                    model: mod,
                    messages: [
                        { role: 'system', content: "You are an expert math solver. 1. Analyze the provided HTML code block. 2. Solve the problem step-by-step. 3. You MUST enclose your final, concise answer within <answer>...</answer> tags." },
                        { role: 'user', content: prompt }
                    ],
                    temperature: 0.0
                })
            });
            const txt = await res.text();
            if (!res.ok) throw new Error(`API Error ${res.status}: ${txt}`);
            
            const data = JSON.parse(txt);
            const out = data.choices?.[0]?.message?.content?.trim() || txt;
            const match = out.match(/<answer>([\s\S]*?)<\/answer>/i);
            setResult(match ? match[1].trim() : out);
        } catch (e) {
            setResult(e.message, true);
        } finally {
            btn.innerText = 'Parse & Solve'; btn.disabled = false;
        }
    };
})();