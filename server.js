// ====================================================================
// StockPulse v5 Pro — Production Server
// Handles: Static files, Yahoo Finance proxy, News feed, AI Chat
// ====================================================================
require('dotenv').config();

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = process.env.PORT || 8080;
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY || '';
const NVIDIA_MODEL = process.env.NVIDIA_MODEL || 'meta/llama-3.1-70b-instruct';
const NVIDIA_BASE_URL = process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1/chat/completions';

// ===== MIME TYPES =====
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff'
};

// ===== YAHOO FINANCE PROXY (GET) =====
function fetchYahoo(targetUrl, res) {
  const options = {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    },
    timeout: 10000
  };
  const req = https.get(targetUrl, options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache'
    });
    proxyRes.pipe(res);
  });
  req.on('error', (e) => {
    console.error('[Yahoo Proxy Error]', e.message);
    if (!res.headersSent) {
      res.writeHead(502, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(JSON.stringify({ error: 'Yahoo Finance unavailable', details: e.message }));
    }
  });
  req.on('timeout', () => {
    req.destroy();
    if (!res.headersSent) {
      res.writeHead(504, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(JSON.stringify({ error: 'Yahoo Finance timeout' }));
    }
  });
}

// ===== NEWS FEED PROXY (GET) =====
function fetchNews(symbol, res) {
  // Strip exchange suffix for search (RELIANCE.NS -> RELIANCE)
  const cleanSymbol = symbol.replace('.NS', '').replace('.BO', '');
  const targetUrl = `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(cleanSymbol)}&quotesCount=0&newsCount=8&region=IN&lang=en-IN`;

  const options = {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    },
    timeout: 8000
  };

  const req = https.get(targetUrl, options, (proxyRes) => {
    let body = '';
    proxyRes.on('data', chunk => body += chunk);
    proxyRes.on('end', () => {
      try {
        const data = JSON.parse(body);
        const articles = (data.news || []).map(n => ({
          title: n.title || '',
          publisher: n.publisher || '',
          link: n.link || '',
          publishedAt: n.providerPublishTime ? new Date(n.providerPublishTime * 1000).toISOString() : '',
          summary: n.title || ''  // Yahoo search news only has titles
        }));
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ symbol, articles }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ error: 'Failed to parse news', details: e.message }));
      }
    });
  });

  req.on('error', (e) => {
    console.error('[News Fetch Error]', e.message);
    if (!res.headersSent) {
      res.writeHead(502, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(JSON.stringify({ error: 'News feed unavailable', details: e.message }));
    }
  });
  req.on('timeout', () => {
    req.destroy();
    if (!res.headersSent) {
      res.writeHead(504, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(JSON.stringify({ error: 'News feed timeout' }));
    }
  });
}

// ===== AI CHAT ENDPOINT (POST) =====
function handleChat(req, res) {
  if (!NVIDIA_API_KEY) {
    res.writeHead(503, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify({ error: 'AI service not configured. Set NVIDIA_API_KEY in .env' }));
    return;
  }

  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    try {
      const { question, context } = JSON.parse(body);

      if (!question || !context) {
        res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        res.end(JSON.stringify({ error: 'Missing question or context' }));
        return;
      }

      // Build the system prompt with all live trading context
      const systemPrompt = buildSystemPrompt(context);

      const payload = JSON.stringify({
        model: NVIDIA_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question }
        ],
        temperature: 0.3,
        top_p: 0.8,
        max_tokens: 800,
        stream: false
      });

      const urlObj = new URL(NVIDIA_BASE_URL);
      const options = {
        hostname: urlObj.hostname,
        port: 443,
        path: urlObj.pathname,
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${NVIDIA_API_KEY}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        },
        timeout: 60000 // Increased to 60s to allow Llama 3.1 70B more processing time
      };

      const apiReq = https.request(options, (apiRes) => {
        let apiBody = '';
        apiRes.on('data', chunk => apiBody += chunk);
        apiRes.on('end', () => {
          try {
            const apiData = JSON.parse(apiBody);
            if (apiData.choices && apiData.choices[0]) {
              const reply = apiData.choices[0].message.content;
              res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
              res.end(JSON.stringify({ reply, model: NVIDIA_MODEL, tokens: apiData.usage }));
            } else {
              console.error('[AI API Error]', apiBody);
              res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
              res.end(JSON.stringify({ error: 'AI returned no response', raw: apiBody }));
            }
          } catch (e) {
            console.error('[AI Parse Error]', e.message);
            res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
            res.end(JSON.stringify({ error: 'Failed to parse AI response' }));
          }
        });
      });

      apiReq.on('error', (e) => {
        console.error('[AI Request Error]', e.message);
        if (!res.headersSent) {
          res.writeHead(502, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          res.end(JSON.stringify({ error: 'AI service unavailable', details: e.message }));
        }
      });

      apiReq.on('timeout', () => {
        apiReq.destroy();
        if (!res.headersSent) {
          res.writeHead(504, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
          res.end(JSON.stringify({ error: 'AI service timeout' }));
        }
      });

      apiReq.write(payload);
      apiReq.end();

    } catch (e) {
      console.error('[Chat Handler Error]', e.message);
      res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(JSON.stringify({ error: 'Invalid request body' }));
    }
  });
}

// ===== SYSTEM PROMPT BUILDER =====
function buildSystemPrompt(ctx) {
  return `You are StockPulse AI — a professional, concise intraday trading advisor for Indian NSE stocks.

CRITICAL RULES — READ CAREFULLY:
1. The "Signal Engine Verdict" below is the PRIMARY source of truth. It is computed by a strict, multi-indicator confluence system that requires VWAP, RSI, Supertrend, ADX, Bollinger Bands, and market regime to all agree before issuing a BUY or SELL.
2. If the Signal Engine Verdict says "WAIT" or "NOT CONFIDENT", you MUST also recommend HOLD/WAIT. Do NOT override it with your own BUY or SELL. Instead, explain WHY the engine is cautious (e.g., "The engine sees conflicting signals — RSI is overbought while VWAP is bullish, so confluence is low.").
3. If the Signal Engine Verdict says "STRONG BUY", "BUY", "SELL", or "STRONG SELL", you may agree and elaborate on the reasoning using the data below.
4. Always format your verdict like: **[BUY/SELL/HOLD]** — reason here.
5. Always mention the key risk (stop loss level, or the main danger).
6. Keep responses to 2-4 sentences. Traders need speed, not essays.
7. Use the live data provided below. Never guess prices or make up data.
8. If the market is closed or data is stale, say so.
9. When the engine says WAIT, you can suggest what conditions would need to change for a valid entry (e.g., "Wait for RSI to drop below 60 and price to retest VWAP for a safer entry.").
10. Add value by mentioning news impact if relevant, but never let news alone override the quantitative signal.

═══ LIVE MARKET CONTEXT ═══
Stock: ${ctx.symbol || 'Unknown'}
Current Price: ₹${ctx.price || '--'}
Day Change: ${ctx.change || '--'}
Day High: ₹${ctx.dayHigh || '--'}
Day Low: ₹${ctx.dayLow || '--'}
Previous Close: ₹${ctx.prevClose || '--'}
Volume: ${ctx.volume || '--'}

═══ TECHNICAL ANALYSIS ═══
Signal Engine Verdict: ${ctx.signal || 'No signal'}
Confidence: ${ctx.confidence || '--'}%
VWAP: ₹${ctx.vwap || '--'}
RSI (14): ${ctx.rsi || '--'}
Supertrend: ${ctx.supertrend || '--'}
ADX: ${ctx.adx || '--'}
ATR: ${ctx.atr || '--'}
Setup: ${ctx.setup || 'None detected'}

═══ MARKET REGIME ═══
NIFTY 50 Regime: ${ctx.regime || 'Unknown'}
India VIX: ${ctx.vix || '--'}
Sector Trend: ${ctx.sectorTrend || 'Unknown'}

═══ ENTRY/EXIT LEVELS ═══
Suggested Entry: ₹${ctx.entry || '--'}
Stop Loss: ₹${ctx.sl || '--'}
Target 1: ₹${ctx.t1 || '--'}
Target 2: ₹${ctx.t2 || '--'}
Risk:Reward: ${ctx.rr || '--'}

═══ OPENING RANGE BREAKOUT ═══
ORB High: ₹${ctx.orbHigh || '--'}
ORB Low: ₹${ctx.orbLow || '--'}

═══ RECENT NEWS ═══
${ctx.news || 'No recent news available.'}

═══ CURRENT TIME ═══
${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
Market Hours: 9:15 AM – 3:30 PM IST (Mon-Fri)`;
}


// ===== CORS PREFLIGHT HANDLER =====
function handleCors(req, res) {
  res.writeHead(204, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400'
  });
  res.end();
}

// ===== MAIN HTTP SERVER =====
const server = http.createServer((req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return handleCors(req, res);
  }

  const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = parsedUrl.pathname;

  // ---- API Routes ----
  if (pathname.startsWith('/api/chart/')) {
    const symbol = pathname.substring('/api/chart/'.length);
    const search = parsedUrl.search || '?interval=1m&range=1d';
    const targetUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}${search}`;
    fetchYahoo(targetUrl, res);

  } else if (pathname.startsWith('/api/search/')) {
    const query = pathname.substring('/api/search/'.length);
    const targetUrl = `https://query2.finance.yahoo.com/v1/finance/search?q=${query}&quotesCount=8&newsCount=0&region=IN&lang=en-IN`;
    fetchYahoo(targetUrl, res);

  } else if (pathname.startsWith('/api/quote/')) {
    const symbol = pathname.substring('/api/quote/'.length);
    const targetUrl = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbol}`;
    fetchYahoo(targetUrl, res);

  } else if (pathname.startsWith('/api/news/')) {
    const symbol = decodeURIComponent(pathname.substring('/api/news/'.length));
    fetchNews(symbol, res);

  } else if (pathname === '/api/chat') {
    if (req.method === 'POST') {
      handleChat(req, res);
    } else {
      res.writeHead(405, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Method Not Allowed' }));
    }

  } else {
    // ---- Static File Server ----
    let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);
    
    // Security: prevent directory traversal
    if (!filePath.startsWith(__dirname)) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('Forbidden');
      return;
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
      if (error) {
        if (error.code === 'ENOENT') {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end('404 Not Found');
        } else {
          res.writeHead(500);
          res.end('Server Error: ' + error.code);
        }
      } else {
        res.writeHead(200, {
          'Content-Type': contentType,
          'Cache-Control': extname === '.html' ? 'no-cache' : 'public, max-age=3600'
        });
        res.end(content);
      }
    });
  }
});

server.listen(PORT, () => {
  console.log(`\n  ╔══════════════════════════════════════════╗`);
  console.log(`  ║  StockPulse v5 Pro — Server Running      ║`);
  console.log(`  ║  http://localhost:${PORT}/index.html          ║`);

  console.log(`  ╚══════════════════════════════════════════╝\n`);
});
