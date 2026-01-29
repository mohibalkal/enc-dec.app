import CryptoJS from 'crypto-js';
import { decryptVideasy } from './videasy-decrypt';
import { decryptHahoy } from './hahoy-decrypt';

// Static HTML content
const INDEX_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>KalStream Decryption API</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            background: white;
            border-radius: 20px;
            padding: 40px;
            max-width: 900px;
            width: 100%;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        h1 { color: #667eea; margin-bottom: 30px; }
        .endpoint {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
        }
        code {
            background: #2d3748;
            color: #68d391;
            padding: 2px 8px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
        }
        pre {
            background: #2d3748;
            color: #68d391;
            padding: 15px;
            border-radius: 8px;
            overflow-x: auto;
            margin-top: 10px;
        }
        a {
            display: inline-block;
            margin-top: 20px;
            padding: 15px 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 10px;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔓 KalStream Decryption API</h1>
        <p>Decryption service for Videasy and Hahoy providers</p>
        
        <div class="endpoint">
            <h2>Videasy Decryption</h2>
            <p><strong>Endpoint:</strong> <code>POST /api/dec-videasy</code></p>
            <pre>{ "text": "encrypted_string", "id": "tmdb_id" }</pre>
        </div>

        <div class="endpoint">
            <h2>Hahoy Decryption</h2>
            <p><strong>Endpoint:</strong> <code>POST /api/dec-hahoy</code></p>
            <pre>{ "text": "encrypted_string" }</pre>
        </div>

        <div class="endpoint">
            <h2>Response Format</h2>
            <pre>{ "status": 200, "result": { "sources": [...], "subtitles": [...] } }</pre>
        </div>

        <a href="/test.html">🧪 Test API</a>
    </div>
</body>
</html>`;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // API Routes
    if (url.pathname === '/api/dec-videasy' && request.method === 'POST') {
      try {
        const body = await request.json();
        const result = await decryptVideasy(body.text, body.id);
        return new Response(JSON.stringify({ status: 200, result }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (error) {
        return new Response(JSON.stringify({ status: 500, error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    if (url.pathname === '/api/dec-hahoy' && request.method === 'POST') {
      try {
        const body = await request.json();
        const result = await decryptHahoy(body.text);
        return new Response(JSON.stringify({ status: 200, result }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (error) {
        return new Response(JSON.stringify({ status: 500, error: error.message }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Serve test page (embedded)
    if (url.pathname === '/test.html' || url.pathname === '/test') {
      // For now, redirect to a simple test interface or embed the full HTML
      // Since embedding 400+ lines is too large, we'll create a minimal test page
      const testHtml = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>اختبار API</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        h1 { color: #667eea; text-align: center; margin-bottom: 30px; }
        .tabs { display: flex; gap: 10px; margin-bottom: 20px; border-bottom: 2px solid #e0e0e0; }
        .tab { padding: 15px 30px; background: transparent; border: none; color: #666; font-size: 1.1em; font-weight: bold; cursor: pointer; border-bottom: 3px solid transparent; }
        .tab.active { color: #667eea; border-bottom-color: #667eea; }
        .section { display: none; }
        .section.active { display: block; }
        label { display: block; margin: 15px 0 8px; color: #333; font-weight: 600; }
        input, textarea { width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 8px; font-family: 'Courier New', monospace; }
        textarea { min-height: 120px; }
        button { width: 100%; padding: 15px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 10px; font-size: 1.2em; font-weight: bold; cursor: pointer; margin-top: 15px; }
        button:disabled { opacity: 0.6; }
        .result { background: #f8f9fa; padding: 20px; border-radius: 10px; margin-top: 20px; display: none; }
        .result.show { display: block; }
        .result pre { background: #2d3748; color: #68d391; padding: 15px; border-radius: 8px; overflow-x: auto; max-height: 300px; overflow-y: auto; }
        .error { background: #fed7d7; color: #c53030; padding: 15px; border-radius: 8px; margin-top: 20px; display: none; }
        .error.show { display: block; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔓 اختبار API فك التشفير</h1>
        <div class="tabs">
            <button class="tab active" onclick="switchTab('videasy')">Videasy</button>
            <button class="tab" onclick="switchTab('hahoy')">Hahoy</button>
        </div>
        <div id="videasy" class="section active">
            <label>TMDB ID:</label>
            <input type="text" id="vid-id" placeholder="105248" value="105248">
            <label>النص المشفر:</label>
            <textarea id="vid-text" placeholder="الصق النص المشفر هنا..."></textarea>
            <button onclick="testVideasy()">فك التشفير 🚀</button>
        </div>
        <div id="hahoy" class="section">
            <label>النص المشفر:</label>
            <textarea id="hah-text" placeholder="الصق النص المشفر هنا..."></textarea>
            <button onclick="testHahoy()">فك التشفير 🚀</button>
        </div>
        <div class="error" id="error"></div>
        <div class="result" id="result">
            <h3>النتيجة:</h3>
            <pre id="output"></pre>
        </div>
    </div>
    <script>
        function switchTab(tab) {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
            event.target.classList.add('active');
            document.getElementById(tab).classList.add('active');
            hideResults();
        }
        function hideResults() {
            document.getElementById('error').classList.remove('show');
            document.getElementById('result').classList.remove('show');
        }
        async function testVideasy() {
            hideResults();
            const text = document.getElementById('vid-text').value.trim();
            const id = document.getElementById('vid-id').value.trim();
            if (!text || !id) { showError('الرجاء إدخال النص المشفر و TMDB ID'); return; }
            try {
                const res = await fetch('/api/dec-videasy', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text, id })
                });
                const data = await res.json();
                if (!res.ok || data.status !== 200) throw new Error(data.error || 'فشل فك التشفير');
                showResult(data.result);
            } catch (e) { showError(e.message); }
        }
        async function testHahoy() {
            hideResults();
            const text = document.getElementById('hah-text').value.trim();
            if (!text) { showError('الرجاء إدخال النص المشفر'); return; }
            try {
                const res = await fetch('/api/dec-hahoy', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text })
                });
                const data = await res.json();
                if (!res.ok || data.status !== 200) throw new Error(data.error || 'فشل فك التشفير');
                showResult(data.result);
            } catch (e) { showError(e.message); }
        }
        function showError(msg) {
            document.getElementById('error').textContent = '❌ ' + msg;
            document.getElementById('error').classList.add('show');
        }
        function showResult(result) {
            document.getElementById('output').textContent = JSON.stringify(result, null, 2);
            document.getElementById('result').classList.add('show');
        }
    </script>
</body>
</html>`;
      return new Response(testHtml, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    // Serve index page
    if (url.pathname === '/' || url.pathname === '/index.html') {
      return new Response(INDEX_HTML, {
        headers: { 'Content-Type': 'text/html' }
      });
    }

    // 404
    return new Response('Not Found', { status: 404 });
  },
};
