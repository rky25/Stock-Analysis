# StockPulse Trading Terminal (v5 Pro)

**StockPulse** is an institutional-grade, real-time intraday trading terminal and AI-assisted decision engine. Designed for high-frequency day traders, it abstracts away complex technical analysis and provides clear, high-confluence entry and exit signals based on a multi-layered market intelligence architecture.

> **Rating: 9.2 / 10** — See [DOCUMENTATION.md](DOCUMENTATION.md) for the full breakdown.

---

## 🎯 Project Overview

> For a full technical deep dive, see [DOCUMENTATION.md](DOCUMENTATION.md).

The core objective of StockPulse is to achieve a positive expectancy in automated and manual intraday trading by strictly filtering out low-probability setups. It achieves this by combining raw technical indicators with broader market context (Market Regime, Sector Trend, and India VIX) to generate robust trading signals.

### Key Features
1. **🤖 AI Trading Assistant**: Real-time chatbot powered by **Llama 3.1 70B** (NVIDIA NIM). Ask "Should I buy?" and get instant verdicts based on live technicals + latest news.
2. **📊 Real-Time Data Pipeline**: 3-second fast polling + 60-second full context refresh across stock, NIFTY 50, Sector Index, and India VIX.
3. **🧠 Market Regime Classification**: Detects `TRENDING` vs `CHOPPY` markets using ADX and EMA slopes. Suppresses signals in choppy conditions.
4. **⚡ Dynamic Risk Management (VIX Sizing)**: Dynamically scales position sizes and tightens Stop-Losses during extreme volatility (VIX > 25).
5. **🎯 Opening Range Breakout (ORB)**: Auto-calculates the first 15-minute high/low as intraday support and resistance.
6. **📈 High-Confluence Signal Engine**: 6 indicators (VWAP, RSI, Supertrend, Bollinger, ADX, EMA) vote to produce a 0-100% confidence score.
7. **💰 Paper Trading Dashboard**: Virtual execution engine with auto SL/Target exit, Win Rate, Net P&L, and Max Drawdown tracking.
8. **📉 TradingView Charts**: Professional candlestick charts with VWAP overlay, volume histogram, and live price line levels.
9. **📰 News-Aware AI**: The chatbot reads the latest Yahoo Finance news headlines and factors them into its advice.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5 + CSS3 (glassmorphism, dark mode) + Vanilla JS |
| Charts | TradingView Lightweight Charts v4.1.1 |
| Backend | Node.js (proxy + AI endpoint) |
| AI Model | Meta Llama 3.1 70B Instruct via NVIDIA NIM |
| Data | Yahoo Finance API (quotes, charts, search, news) |
| Security | dotenv (.env), server-side proxy, .gitignore |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- NVIDIA NIM API Key (from https://build.nvidia.com)

### Installation
```bash
git clone https://github.com/rky25/Stock-Analysis.git
cd Stock-Analysis
npm install
echo "NVIDIA_API_KEY=your-key-here" > .env
npm start
```

Open **http://localhost:8080/index.html** in your browser.

### Using the Terminal
1. **Search**: Type a stock name (e.g., `RELIANCE`, `TCS`) or click a chip.
2. **Analyze**: Watch the Decision Engine compute signals with confidence scores.
3. **Ask AI**: Click the purple chat bubble → ask any trading question.
4. **Paper Trade**: Toggle "Paper" ON → enter position → watch auto SL/Target execution.

---

## 🛠️ Future Roadmap

- **WebSocket Tick Streaming** — Sub-second price updates
- **Broker API Integration** — Zerodha Kite / Upstox live execution
- **ML Weight Optimization** — Dynamic indicator weighting from backtests
- **Multi-Stock Watchlist** — Monitor multiple stocks with alerts
