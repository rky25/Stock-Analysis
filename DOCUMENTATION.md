# StockPulse Trading Terminal — Complete System Documentation

> **Version:** v5 Pro | **Last Updated:** April 30, 2026  
> **Author:** Rajesh | **Rating:** 9.2 / 10

---

## Table of Contents

1. [What is StockPulse?](#1-what-is-stockpulse)
2. [How to Start the Application](#2-how-to-start-the-application)
3. [Architecture Overview](#3-architecture-overview)
4. [The Three Views](#4-the-three-views)
5. [Data Pipeline — How Prices Flow](#5-data-pipeline--how-prices-flow)
6. [The Trading Engine — How Signals are Generated](#6-the-trading-engine--how-signals-are-generated)
7. [The Auto-Scanner — How Top Opportunities are Found](#7-the-auto-scanner--how-top-opportunities-are-found)
8. [The AI Chatbot — How It Works](#8-the-ai-chatbot--how-it-works)
9. [Risk Management System](#9-risk-management-system)
10. [Paper Trading Dashboard](#10-paper-trading-dashboard)
11. [File-by-File Breakdown](#11-file-by-file-breakdown)
12. [Configuration & Tuning](#12-configuration--tuning)
13. [Limitations & Disclaimers](#13-limitations--disclaimers)

---

## 1. What is StockPulse?

StockPulse is an **institutional-grade, real-time intraday trading terminal** built for the Indian NSE market. It is a complete decision-support system that:

- **Monitors 134+ stocks** across 16 sectors in real-time
- **Generates BUY/SELL signals** using a 6-indicator mathematical confluence engine
- **Automatically scans the entire market** and tells you which stocks to trade right now
- **Shows live prices** with sub-3-second refresh rates and visual price flashing
- **Manages risk** using VIX-based dynamic position sizing and ADX-based regime filtering
- **Provides AI-powered advice** via a Llama 3.1 70B chatbot that reads live data + news

It is **NOT** a trading bot. It does not execute trades. It is a decision engine that tells you **what to trade, when to trade, and exactly where to enter, exit, and place your stop loss**.

---

## 2. How to Start the Application

### Prerequisites
- **Node.js** v14 or higher
- **NVIDIA NIM API Key** (optional, for the AI chatbot)

### Step-by-Step

```bash
# 1. Clone the repository
git clone https://github.com/rky25/Stock-Analysis.git
cd Stock-Analysis

# 2. Install dependencies
npm install

# 3. (Optional) Set up AI chatbot
echo "NVIDIA_API_KEY=your-key-here" > .env

# 4. Start the server
npm start

# 5. Open in browser
# Navigate to: http://localhost:8080
```

When the server starts, you will see:
```
╔══════════════════════════════════════════╗
║  StockPulse v5 Pro — Server Running      ║
║  http://localhost:8080/index.html         ║
╚══════════════════════════════════════════╝
```

---

## 3. Architecture Overview

```
┌──────────────────────────────────────────────────────────┐
│                    YOUR BROWSER (Frontend)                │
│                                                          │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────┐  │
│  │ Chart View  │  │ Sector       │  │ Top            │  │
│  │ (app.js)    │  │ Watchlist    │  │ Opportunities  │  │
│  │             │  │ (app.js)     │  │ (app.js)       │  │
│  └──────┬──────┘  └──────┬───────┘  └───────┬────────┘  │
│         │                │                   │           │
│         └────────────────┼───────────────────┘           │
│                          │                               │
│                  ┌───────▼────────┐                      │
│                  │  trading.js    │                      │
│                  │  (Math Engine) │                      │
│                  └───────┬────────┘                      │
│                          │ HTTP Requests                 │
└──────────────────────────┼───────────────────────────────┘
                           │
                  ┌────────▼─────────┐
                  │   server.js      │
                  │   (Node.js)      │
                  │   Port 8080      │
                  └────────┬─────────┘
                           │ HTTPS Proxy
              ┌────────────┼────────────┐
              ▼            ▼            ▼
        ┌──────────┐ ┌──────────┐ ┌──────────┐
        │ Yahoo    │ │ Yahoo    │ │ NVIDIA   │
        │ Finance  │ │ Finance  │ │ NIM API  │
        │ Charts   │ │ Quotes   │ │ (Llama)  │
        └──────────┘ └──────────┘ └──────────┘
```

### Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | HTML5, CSS3 (glassmorphism, dark mode), Vanilla JavaScript |
| **Charts** | TradingView Lightweight Charts v4.1.1 |
| **Backend** | Node.js HTTP Server (proxy + AI + static files) |
| **AI Model** | Meta Llama 3.1 70B Instruct via NVIDIA NIM |
| **Data Source** | Yahoo Finance API (charts, quotes, search, news) |
| **Math Engine** | Custom `trading.js` (VWAP, RSI, Supertrend, ADX, Bollinger, EMA) |

---

## 4. The Three Views

When you open StockPulse, you see three navigation tabs at the top:

### View 1: Chart Analysis
This is the original single-stock deep analysis view. You search for a stock (e.g., "RELIANCE") and StockPulse:
1. Downloads 1-minute, 5-minute, and 15-minute candlestick data
2. Downloads NIFTY 50 and India VIX data
3. Downloads the stock's sector index data
4. Runs the full 6-indicator analysis
5. Displays: TradingView chart, Signal Engine verdict, Entry/Exit calculator, Market Depth, and Key Statistics

**Use this when:** You have a specific stock in mind and want the full deep-dive analysis with entry/exit levels.

### View 2: Sector Watchlist
This is a live stock screener organized by sector. You choose a sector tab (e.g., "Banking", "IT", "Pharma") and see a real-time table of all stocks in that sector.

**What updates live every 4 seconds:**
- Current price (with green/red flash animation on every tick)
- Percentage change badge (+2.50% in green, -1.30% in red)
- Day High / Day Low range bar
- Heatmap background color (deep green for +3%, deep red for -3%)
- AI Verdict pill (from the background scanner)

**Use this when:** You want to monitor an entire sector and visually spot which stocks are moving the most.

### View 3: Top Opportunities
This is the crown jewel — the automated scanner that tells you exactly which stocks to buy or sell right now.

**What it shows:**
- **Top Buys** (left column) — Stocks where the math engine has confirmed a BUY or STRONG BUY
- **Top Sells** (right column) — Stocks where the math engine has confirmed a SELL or STRONG SELL
- Each card shows: Stock name, current price, confidence score (0-100%), and the setup type

**Use this when:** You don't know what to trade and want the system to tell you.

---

## 5. Data Pipeline — How Prices Flow

### The Server (`server.js`)

Your browser cannot directly call Yahoo Finance because of browser security rules (CORS). So the Node.js server acts as a **proxy**:

```
Browser → http://localhost:8080/api/quote/RELIANCE.NS → server.js → https://query1.finance.yahoo.com/v7/finance/quote?symbols=RELIANCE.NS → Response back to browser
```

The server handles 5 types of API routes:

| Route | Purpose | Yahoo Finance Endpoint |
|-------|---------|----------------------|
| `/api/chart/{symbol}` | Historical candlestick data (1m, 5m, 15m) | `/v8/finance/chart/` |
| `/api/quote/{symbols}` | Live price snapshot (supports comma-separated) | `/v7/finance/quote` |
| `/api/search/{query}` | Stock name search autocomplete | `/v1/finance/search` |
| `/api/news/{symbol}` | Latest news headlines | `/v1/finance/search` (news section) |
| `/api/chat` (POST) | AI chatbot (forwards to NVIDIA NIM) | NVIDIA API |

### The Two Data Loops (Frontend)

**When you load a single stock (Chart View):**
1. **Full Context Fetch** (every 60 seconds) — Downloads: 1-min chart, 5-min chart, 15-min chart, NIFTY 50 data, India VIX, Sector Index. This is the heavy payload that feeds the math engine.
2. **Fast Quote Refresh** (every 3 seconds) — Downloads only the 1-min chart to update the live price, change percentage, and the Immediate Action banner. This is lightweight.

**When the Sector Watchlist or Top Opportunities is open:**
3. **Master Quote Poller** (every 4 seconds) — This is the high-frequency pre-screener. It fetches live prices for ALL 134+ stocks in 4 batches of 40. It simultaneously:
   - Updates the Screener table (if visible)
   - Runs the Breakout Proximity Filter (explained in Section 7)
   - Pushes flagged stocks into the Sniper Engine queue

---

## 6. The Trading Engine — How Signals are Generated

The math engine lives in `trading.js`. It is a pure mathematical function that takes raw candle data and produces a verdict. There is zero AI or guesswork — every signal is deterministic.

### Step 1: Calculate 6 Technical Indicators

For a given stock, the engine computes:

| # | Indicator | What it Measures | Library |
|---|-----------|-----------------|---------|
| 1 | **VWAP** (Volume-Weighted Average Price) | Fair value for the day. If price > VWAP, buyers are in control. | Custom (per-day reset) |
| 2 | **RSI** (Relative Strength Index, 14-period) | Momentum. RSI > 55 = bullish momentum, RSI < 45 = bearish. | Custom Wilder's method |
| 3 | **Supertrend** (10, 3) | Trend direction. Green = uptrend, Red = downtrend. | Custom ATR-based |
| 4 | **15-Minute Trend** | Higher timeframe confirmation. Is the 15m SMA(20) rising or falling? | SMA crossover |
| 5 | **NIFTY 50 Alignment** | Is the broad market supporting or opposing this trade? | EMA 9/21 crossover |
| 6 | **Sector Index** | Is the stock's sector (e.g., Bank Nifty) trending in the same direction? | EMA crossover |

### Step 2: The Voting System (0 to 5)

Each indicator casts a **vote**: BUY (+1) or SELL (+1). Neutral indicators don't vote.

Example:
```
VWAP:      BUY  → buyVotes = 1
RSI:       BUY  → buyVotes = 2
Supertrend: BUY  → buyVotes = 3
15m Trend:  SELL → sellVotes = 1
NIFTY 50:   BUY  → buyVotes = 4
```
Result: **4 BUY votes vs 1 SELL vote → Dominant side = BUY**

### Step 3: Confidence Score (0-100%)

The confidence score is computed from 6 factors:

| Factor | Max Points | How it Works |
|--------|-----------|-------------|
| Agreement Ratio | 35 pts | (dominant votes / total votes) × 35 |
| ADX Clarity | 15 pts | ADX > 30 = 15pts, ADX > 25 = 12pts, ADX < 15 = 8pts |
| Volume Confirmation | 15 pts | Volume ratio ≥ 2x = 15pts, ≥ 1.2x = 12pts |
| Nifty/15m Alignment | 20 pts | 10pts each if aligned with the dominant direction |
| Supertrend Alignment | 5 pts | Bonus if Supertrend agrees with the dominant side |
| Time Safety | 10 pts | Full points if within 9:30 AM – 2:30 PM |

**Penalties:** VIX > 25 = −25pts, VIX > 20 = −15pts, VIX > 17 = −5pts

### Step 4: Final Verdict

| Verdict | Rule |
|---------|------|
| **STRONG BUY / STRONG SELL** | Confidence ≥ 75% AND ≥ 4/5 indicators agree |
| **BUY / SELL** | Confidence ≥ 60% AND ≥ 3/5 indicators agree |
| **NEUTRAL (WAIT)** | Everything else |

### Step 5: Hard Filters (Safety Blocks)

Even if the votes and confidence are high, the engine **blocks** the signal if:

| Condition | Block Reason |
|-----------|-------------|
| ADX < 20 | No clear trend detected. Random price movement. |
| RSI > 72 (for BUY) | Stock is overbought. Buying here is chasing. |
| RSI < 28 (for SELL) | Stock is oversold. Selling here is panic. |
| Volume < 0.8x average | Not enough market participation to trust the move. |
| VIX > 25 | Extreme market fear. No trades allowed. |

### Step 6: Entry/Exit Calculator

If a valid BUY or SELL is confirmed, the engine calculates:

| Level | Formula |
|-------|---------|
| **Entry** | Current market price |
| **Stop Loss** | Entry ± (ATR × VIX multiplier). Adjusted to pivot levels if nearby. |
| **Target 1** | Entry ± 1.5 × risk (1.5:1 R:R) |
| **Target 2** | Entry ± 2.5 × risk (2.5:1 R:R) |
| **Target 3** | Entry ± 4.0 × risk (4:1 R:R) |
| **Quantity** | (Capital × Risk%) / Risk per share, adjusted by VIX size multiplier |

---

## 7. The Auto-Scanner — How Top Opportunities are Found

This is the most important feature. It runs in the background and tells you what to trade.

### The Problem
You have 134 stocks. Downloading the full 1-minute chart for each one takes ~2 seconds. So a complete scan takes 134 × 2 = **268 seconds (4.5 minutes)**. By the time you find a breakout, it's already over.

### The Solution: Two-Phase Hybrid Architecture

```
Phase 1: LIGHTNING PRE-SCREENER (every 4 seconds)
├── Fetch live prices for ALL 134 stocks (3 API calls of 40 each)
├── For each stock, calculate:
│   ├── Distance from Day High: (high - price) / price
│   └── Distance from Day Low:  (price - low) / price
├── IF distance ≤ 0.3% → Push to Analysis Queue
└── ELSE → Ignore (stock is just chopping around)

Phase 2: SNIPER ENGINE (every 1.5 seconds)
├── Pop one stock from the Analysis Queue
├── Download its full 1-minute chart (heavy data)
├── Run Trading.analyzeLive() → VWAP, RSI, Supertrend, ADX
├── IF verdict = BUY/SELL → Add to Top Opportunities board
└── ELSE → Discard (false breakout)
```

### Why 0.3% Proximity?
If RELIANCE has a Day High of ₹2,950 and the current price is ₹2,945, the distance is:
```
(2950 - 2945) / 2945 = 0.17% → WITHIN 0.3% → FLAGGED ✅
```
This means RELIANCE is about to break its Day High. The Sniper Engine immediately downloads the chart and checks if VWAP, RSI, and Supertrend confirm the breakout.

If RELIANCE is at ₹2,900 (1.7% away from the high), it is ignored. No API call wasted.

### Result
- **Speed:** Entire market scanned every **4 seconds** instead of 4 minutes
- **Accuracy:** Heavy math engine still confirms every signal
- **Safety:** Only 2-5 chart downloads per cycle instead of 134, so Yahoo never rate-limits you

---

## 8. The AI Chatbot — How It Works

The AI chatbot is powered by **Meta Llama 3.1 70B Instruct** running on NVIDIA's NIM cloud.

### Flow
1. You type a question (e.g., "Should I buy RELIANCE?")
2. The frontend collects ALL live data: price, VWAP, RSI, ADX, signal verdict, confidence, setup name, VIX, sector trend, ORB levels, and latest news headlines
3. This is packaged into a **system prompt** and sent to the NVIDIA API via `server.js`
4. Llama 3.1 70B reads the live data and generates a 2-4 sentence response

### Critical Rule
The AI is **strictly instructed** to follow the Signal Engine's verdict. If the math engine says WAIT, the AI must also say WAIT. The AI cannot override the quantitative system with its own opinion. This prevents hallucinations and over-optimistic advice.

### System Prompt Structure
```
You are StockPulse AI — a professional intraday trading advisor.

CRITICAL: The Signal Engine Verdict is the PRIMARY source of truth.
If it says WAIT, you MUST also say WAIT.

═══ LIVE DATA ═══
Stock: RELIANCE.NS
Price: ₹2,945.50
Signal: STRONG BUY (78% confidence)
VWAP: ₹2,930.00
RSI: 62.3
...
```

---

## 9. Risk Management System

### ADX Regime Gate
The engine uses the **Average Directional Index (ADX)** to classify the market:

| ADX Value | Regime | What Happens |
|-----------|--------|-------------|
| > 25 | **TRENDING** | Full signals allowed |
| 15-25 | **WEAK** | Signals allowed with reduced confidence |
| < 15 | **RANGING** | RSI mean-reversion only, trend signals blocked |
| < 20 | **GATE** | ALL signals blocked (ADX Trade Gate) |

### VIX Dynamic Position Sizing

| VIX Level | Position Size | Stop Loss | Action |
|-----------|--------------|-----------|--------|
| < 13 | 100% | 1.0x ATR | Normal trading |
| 13-17 | 100% | 1.2x ATR | Normal with wider stops |
| 17-20 | 70% | 1.5x ATR | Reduced exposure |
| 20-25 | 50% | 2.0x ATR | Half position only |
| > 25 | **0%** | — | **NO TRADING ALLOWED** |

### Time-of-Day Zones

| Time (IST) | Zone | Rule |
|------------|------|------|
| Before 9:15 | PRE | Market not open |
| 9:15-9:30 | TRAP | Danger zone — avoid new trades |
| 9:30-2:30 | SAFE | Full trading allowed |
| 2:30-3:00 | LATE | Close positions, avoid new trades |
| 3:00-3:30 | CLOSE | Exit all intraday positions |

### Opening Range Breakout (ORB)
The engine automatically calculates the high and low of the first 15 minutes (9:15-9:30). These levels act as intraday support and resistance.

---

## 10. Paper Trading Dashboard

StockPulse includes a virtual trading system stored in your browser's `localStorage`:

- **Add Position:** Enter stock, price, quantity, stop loss, target
- **Auto Monitoring:** Every 3 seconds, the system checks if the price has hit your SL or Target
- **Auto Close:** If SL is breached → position closed with LOSS. If Target is hit → closed with WIN.
- **Statistics:** Win Rate, Net P&L, Average Win, Average Loss, Max Drawdown
- **Trade Journal:** Complete log of all signals generated by the engine

---

## 11. File-by-File Breakdown

### `server.js` — The Backend (365 lines)
| Section | Lines | Purpose |
|---------|-------|---------|
| Yahoo Finance Proxy | 32-62 | Forwards requests to Yahoo with browser User-Agent |
| News Feed Proxy | 64-113 | Fetches and parses Yahoo news articles |
| AI Chat Endpoint | 115-212 | Receives questions, builds system prompt, calls NVIDIA |
| System Prompt Builder | 214-271 | Injects live trading data into the AI's context |
| HTTP Router | 285-356 | Routes `/api/*` to handlers, everything else to static files |

### `trading.js` — The Math Engine (993 lines)
| Section | Lines | Purpose |
|---------|-------|---------|
| CONFIG Constants | 6-62 | All tunable thresholds (ADX, RSI, VIX, targets) |
| Core Calculations | 98-212 | ATR, SMA, EMA, RSI, VWAP, Bollinger, Supertrend, ADX |
| Setup Classifier | 224-272 | Names the trade setup (e.g., "Trend Pullback Long") |
| Main Analysis | 346-565 | The 6-indicator voting system + confidence + verdict |
| Entry/Exit Calculator | 567-605 | SL, T1, T2, T3, Quantity, VIX-adjusted |
| Immediate Action Engine | 627-714 | 1-minute level proximity + volume spike detection |
| Backtest Engine | 790-958 | Historical simulation with real NSE cost model |
| Position Manager | 961-971 | localStorage CRUD for paper trades |
| Trade Log | 973-988 | Signal history tracker |

### `app.js` — The Frontend Brain (1732 lines)
| Section | Lines | Purpose |
|---------|-------|---------|
| State Variables | 1-34 | All global state (current stock, timers, results) |
| Paper Trading Manager | 52-112 | Virtual trade tracking with auto SL/Target |
| Signal History Manager | 113-143 | Win/loss tracking for generated signals |
| Theme & Market Status | 150-186 | Dark/light mode, IST market hours indicator |
| Search & Load Stock | 190-270 | Autocomplete search, Yahoo proxy routing, retries |
| Data Fetching | 273-390 | Full context fetch (6 parallel API calls), fast quote refresh |
| Chart Rendering | ~400-900 | TradingView chart, OHLC bar, signal panel, calculator |
| Navigation | 1203-1237 | switchAppView() — toggles between 3 views |
| Screener Module | 1239-1370 | Sector tabs, table rendering, row update with heatmap |
| Master Quote Poller | 1372-1420 | High-frequency 134-stock pre-screener |
| Scanner Module | 1422-1460 | Sniper Engine (chart download + analysis for flagged stocks) |
| Scanner Results Renderer | 1462-1480 | Top Buys / Top Sells card layout |
| AI Chatbot | 1490-1650 | Chat panel, message rendering, context packaging |

### `index.html` — The Layout (179 lines)
| Section | Lines | Purpose |
|---------|-------|---------|
| Top Bar | 11-23 | Logo, search box, market status, theme toggle |
| Navigation | 25-30 | Chart / Sector Watchlist / Top Opportunities tabs |
| Welcome View | 32-43 | Landing page with quick stock chips |
| Screener View | 48-68 | Sector tabs + data table |
| Scanner View | 70-89 | Top Buys / Top Sells dual columns |
| Stock View | 91-171 | Chart, signals, calculator, depth, stats |

### `styles.css` — The Design System (672 lines)
Premium dark-mode glassmorphism design with CSS custom properties, heatmap color classes, price flash animations, and responsive grid layouts.

---

## 12. Configuration & Tuning

All tunable parameters are in the `CONFIG` object at the top of `trading.js`:

### Signal Sensitivity
```javascript
ADX_TRADE_GATE: 20     // Lower = more signals, Higher = stricter
CONF_STRONG: 75        // Confidence needed for STRONG BUY/SELL
CONF_NORMAL: 60        // Confidence needed for BUY/SELL
VOTES_STRONG: 4        // Votes needed for STRONG (out of 5)
VOTES_NORMAL: 3        // Votes needed for normal (out of 5)
```

### Scanner Sensitivity
In `app.js`, the Breakout Proximity threshold:
```javascript
// In startMasterQuotePoller():
if (pctToHigh <= 0.3 || pctToLow <= 0.3) {
    // Stock is within 0.3% of its day extreme
    // Change to 0.5 or 0.75 for more signals
}
```

### Risk Parameters
```javascript
TARGET_1_MULT: 1.5     // Risk:Reward for Target 1
TARGET_2_MULT: 2.5     // Risk:Reward for Target 2
TARGET_3_MULT: 4.0     // Risk:Reward for Target 3
SL_ATR_MULT: 1.0       // Stop Loss = 1.0 × ATR from entry
VIX_EXTREME: 25        // VIX above this = NO TRADING
```

---

## 13. Limitations & Disclaimers

### Technical Limitations
1. **Data Delay:** Yahoo Finance has a 1-3 minute delay on NSE data. This is NOT real-time tick data.
2. **Rate Limiting:** Yahoo may temporarily block requests if you refresh too aggressively. The server handles retries.
3. **No Order Execution:** StockPulse does not connect to any broker. It is a decision tool only.
4. **Browser Storage:** Paper trades and signal history are stored in `localStorage`. Clearing browser data will erase them.

### Trading Disclaimer
> ⚠️ **IMPORTANT:** This software is for educational and informational purposes only. It does not constitute financial advice. Past performance of signals does not guarantee future results. Always consult a qualified financial advisor before making trading decisions. Trading in the stock market involves risk of loss. The developers are not responsible for any financial losses incurred from using this software.

---

*Built with ❤️ for the Indian trading community.*
