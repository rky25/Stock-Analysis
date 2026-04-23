/* =============================================
   TRADING ENGINE v2 — Fixed & Improved
   ============================================= */

const Trading = {

  // ===== CORE CALCULATIONS =====
  calcATR(highs, lows, closes, period=14) {
    const tr = [];
    for (let i = 0; i < closes.length; i++) {
      if (i === 0) { tr.push(highs[i] - lows[i]); continue; }
      tr.push(Math.max(highs[i] - lows[i], Math.abs(highs[i] - closes[i-1]), Math.abs(lows[i] - closes[i-1])));
    }
    const atr = [];
    for (let i = 0; i < tr.length; i++) {
      if (i < period - 1) { atr.push(null); continue; }
      if (i === period - 1) { let s = 0; for (let j = 0; j < period; j++) s += tr[j]; atr.push(s / period); continue; }
      atr.push((atr[i-1] * (period - 1) + tr[i]) / period);
    }
    return atr;
  },

  calcSMA(data, period) {
    const r = [];
    for (let i = 0; i < data.length; i++) {
      if (i < period - 1) { r.push(null); continue; }
      let s = 0; for (let j = i - period + 1; j <= i; j++) s += data[j]; r.push(s / period);
    }
    return r;
  },

  calcEMA(data, period) {
    const r = [], k = 2 / (period + 1); let prev = null;
    for (let i = 0; i < data.length; i++) {
      if (data[i] == null) { r.push(null); continue; }
      if (prev === null) { prev = data[i]; r.push(prev); }
      else { prev = data[i] * k + prev * (1 - k); r.push(prev); }
    }
    return r;
  },

  calcRSI(data, period=9) { // Changed to RSI(9) for faster intraday signals
    const r = []; let gains = 0, losses = 0;
    for (let i = 0; i < data.length; i++) {
      if (i === 0) { r.push(null); continue; }
      const diff = data[i] - data[i-1];
      if (i <= period) {
        if (diff > 0) gains += diff; else losses -= diff;
        if (i === period) { gains /= period; losses /= period; r.push(losses === 0 ? 100 : 100 - 100 / (1 + gains / losses)); }
        else r.push(null);
      } else {
        const g = diff > 0 ? diff : 0, l = diff < 0 ? -diff : 0;
        gains = (gains * (period - 1) + g) / period; losses = (losses * (period - 1) + l) / period;
        r.push(losses === 0 ? 100 : 100 - 100 / (1 + gains / losses));
      }
    }
    return r;
  },

  calcVWAP(closes, volumes, highs, lows) {
    let cumVol = 0, cumTP = 0; const r = [];
    for (let i = 0; i < closes.length; i++) {
      if (closes[i] == null || volumes[i] == null) { r.push(null); continue; }
      const tp = ((highs[i] || closes[i]) + (lows[i] || closes[i]) + closes[i]) / 3;
      cumTP += tp * volumes[i]; cumVol += volumes[i]; r.push(cumVol ? cumTP / cumVol : null);
    }
    return r;
  },

  calcBollinger(data, period=20) {
    const sma = this.calcSMA(data, period), upper = [], lower = [];
    for (let i = 0; i < data.length; i++) {
      if (sma[i] === null) { upper.push(null); lower.push(null); continue; }
      let sum = 0; for (let j = i - period + 1; j <= i; j++) sum += Math.pow(data[j] - sma[i], 2);
      const std = Math.sqrt(sum / period); upper.push(sma[i] + 2 * std); lower.push(sma[i] - 2 * std);
    }
    return { middle: sma, upper, lower };
  },

  calcSupertrend(highs, lows, closes, period=10, multiplier=3) {
    const atr = this.calcATR(highs, lows, closes, period);
    const st = [], dir = [];
    for (let i = 0; i < closes.length; i++) {
      if (atr[i] === null) { st.push(null); dir.push(0); continue; }
      const hl2 = (highs[i] + lows[i]) / 2, up = hl2 - multiplier * atr[i], dn = hl2 + multiplier * atr[i];
      if (i === 0 || st[i-1] === null) { st.push(closes[i] > dn ? up : dn); dir.push(closes[i] > dn ? 1 : -1); continue; }
      if (dir[i-1] === 1) { const n = Math.max(up, st[i-1]); if (closes[i] < n) { st.push(dn); dir.push(-1); } else { st.push(n); dir.push(1); } }
      else { const n = Math.min(dn, st[i-1]); if (closes[i] > n) { st.push(up); dir.push(1); } else { st.push(n); dir.push(-1); } }
    }
    return { values: st, direction: dir };
  },

  // NEW: ADX (replaces redundant EMA crossover)
  calcADX(highs, lows, closes, period=14) {
    if (closes.length < period * 2) return { adx: 20, pdi: 0, mdi: 0 };
    const pdm = [], mdm = [], tr = [];
    for (let i = 1; i < closes.length; i++) {
      const upMove = highs[i] - highs[i-1], downMove = lows[i-1] - lows[i];
      pdm.push(upMove > downMove && upMove > 0 ? upMove : 0);
      mdm.push(downMove > upMove && downMove > 0 ? downMove : 0);
      tr.push(Math.max(highs[i] - lows[i], Math.abs(highs[i] - closes[i-1]), Math.abs(lows[i] - closes[i-1])));
    }
    // Smooth
    const smooth = (arr, p) => { let s = arr.slice(0, p).reduce((a, b) => a + b, 0); const r = [s]; for (let i = p; i < arr.length; i++) { s = s - s / p + arr[i]; r.push(s); } return r; };
    const strP = smooth(pdm, period), strM = smooth(mdm, period), strT = smooth(tr, period);
    const dx = [];
    for (let i = 0; i < strT.length; i++) {
      const pdi = strT[i] ? (strP[i] / strT[i]) * 100 : 0;
      const mdi = strT[i] ? (strM[i] / strT[i]) * 100 : 0;
      dx.push(pdi + mdi ? Math.abs(pdi - mdi) / (pdi + mdi) * 100 : 0);
    }
    const adx = dx.length >= period ? dx.slice(-period).reduce((a, b) => a + b, 0) / period : 20;
    const lastPDI = strT.length ? (strP[strP.length-1] / strT[strT.length-1]) * 100 : 0;
    const lastMDI = strT.length ? (strM[strM.length-1] / strT[strT.length-1]) * 100 : 0;
    return { adx, pdi: lastPDI, mdi: lastMDI };
  },

  // NEW: Pivot Points (S/R levels)
  calcPivotPoints(prevHigh, prevLow, prevClose) {
    const pivot = (prevHigh + prevLow + prevClose) / 3;
    return {
      r2: pivot + (prevHigh - prevLow), r1: 2 * pivot - prevLow,
      pivot,
      s1: 2 * pivot - prevHigh, s2: pivot - (prevHigh - prevLow)
    };
  },

  // NEW: Volume gate check
  checkVolume(volumes) {
    const valid = volumes.filter(v => v != null && v > 0);
    if (valid.length < 10) return { ok: false, ratio: 0, avg: 0, current: 0 };
    const avg = valid.slice(0, -3).reduce((a, b) => a + b, 0) / (valid.length - 3);
    const recent = valid.slice(-3).reduce((a, b) => a + b, 0) / 3;
    return { ok: recent > avg * 1.2, ratio: avg > 0 ? recent / avg : 0, avg, current: recent };
  },

  // NEW: Time of day check
  checkTime() {
    const now = new Date(), ist = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    const h = ist.getHours(), m = ist.getMinutes(), mins = h * 60 + m;
    if (mins < 555) return { zone: 'PRE', warn: 'Market not open yet', safe: false };         // Before 9:15
    if (mins < 570) return { zone: 'TRAP', warn: '9:15-9:30 danger zone — avoid new trades', safe: false }; // 9:15-9:30
    if (mins < 870) return { zone: 'SAFE', warn: '', safe: true };                              // 9:30-2:30
    if (mins < 900) return { zone: 'LATE', warn: 'Avoid new trades — close positions before 3:00', safe: false }; // 2:30-3:00
    if (mins <= 930) return { zone: 'CLOSE', warn: 'Market closing — exit all intraday positions', safe: false }; // 3:00-3:30
    return { zone: 'CLOSED', warn: 'Market is closed', safe: false };
  },

  // ===== MAIN ANALYSIS — v2 with all fixes =====
  analyze(closes5m, highs5m, lows5m, vols5m, price, trend15m, niftyTrend) {
    const n = closes5m.length;
    if (n < 30) return null;

    const warnings = [];
    const timeCheck = this.checkTime();
    if (!timeCheck.safe) warnings.push(timeCheck.warn);

    // Volume gate
    const volCheck = this.checkVolume(vols5m);
    if (!volCheck.ok) warnings.push('Low volume (' + volCheck.ratio.toFixed(1) + 'x avg) — signals may be unreliable');

    // 15-min trend filter
    let trendBlock = false;
    if (trend15m) {
      if (trend15m === 'DOWN') warnings.push('15-min trend is BEARISH — BUY signals blocked');
      if (trend15m === 'UP') warnings.push('15-min trend is BULLISH — SELL signals blocked');
    }

    // NIFTY filter
    if (niftyTrend === 'DOWN') warnings.push('NIFTY 50 is falling — market is bearish');
    if (niftyTrend === 'UP') warnings.push('NIFTY 50 is rising — market support for buys');

    // Strategy 1: VWAP (weight: 2)
    const vwap = this.calcVWAP(closes5m, vols5m, highs5m, lows5m);
    const vwapVal = vwap.filter(v => v != null).pop() || price;
    const vwapSignal = price > vwapVal ? 'BUY' : 'SELL';
    const vwapDesc = price > vwapVal ? 'Price above VWAP — buyers in control' : 'Price below VWAP — sellers in control';

    // Strategy 2: RSI(9) — faster for intraday (weight: 1)
    const rsiArr = this.calcRSI(closes5m, 9);
    const rsi = rsiArr.filter(v => v != null).pop() || 50;
    let rsiSignal = 'NEUTRAL', rsiDesc = 'RSI in neutral zone';
    if (rsi < 25) { rsiSignal = 'BUY'; rsiDesc = 'Deeply oversold — strong bounce expected'; }
    else if (rsi < 35) { rsiSignal = 'BUY'; rsiDesc = 'Oversold zone — bounce likely'; }
    else if (rsi > 75) { rsiSignal = 'SELL'; rsiDesc = 'Deeply overbought — drop expected'; }
    else if (rsi > 65) { rsiSignal = 'SELL'; rsiDesc = 'Overbought zone — caution'; }

    // Strategy 3: Supertrend (weight: 2)
    const st = this.calcSupertrend(highs5m, lows5m, closes5m);
    const stDir = st.direction.filter(v => v !== 0).pop() || 0;
    const stVal = st.values.filter(v => v != null).pop() || 0;
    const stSignal = stDir === 1 ? 'BUY' : 'SELL';
    const stDesc = stDir === 1 ? 'Supertrend bullish — uptrend active' : 'Supertrend bearish — downtrend active';

    // Strategy 4: Bollinger Bands (weight: 1)
    const boll = this.calcBollinger(closes5m);
    const bU = boll.upper.filter(v => v != null).pop() || 0;
    const bL = boll.lower.filter(v => v != null).pop() || 0;
    let bollSignal = 'NEUTRAL', bollDesc = 'Price within bands';
    if (price <= bL * 1.005) { bollSignal = 'BUY'; bollDesc = 'Near lower band — possible bounce'; }
    else if (price >= bU * 0.995) { bollSignal = 'SELL'; bollDesc = 'Near upper band — possible reversal'; }

    // Strategy 5: ADX — trend strength (weight: 1)
    const adx = this.calcADX(highs5m, lows5m, closes5m);
    let adxSignal = 'NEUTRAL', adxDesc = 'No clear trend (ADX < 20)';
    if (adx.adx > 25 && adx.pdi > adx.mdi) { adxSignal = 'BUY'; adxDesc = 'Strong uptrend (ADX ' + adx.adx.toFixed(0) + ')'; }
    else if (adx.adx > 25 && adx.mdi > adx.pdi) { adxSignal = 'SELL'; adxDesc = 'Strong downtrend (ADX ' + adx.adx.toFixed(0) + ')'; }
    else if (adx.adx < 20) { warnings.push('ADX < 20 — market is sideways, avoid trending strategies'); }

    // Weighted voting: VWAP=2, Supertrend=2, RSI=1, Bollinger=1, ADX=1 (total=7)
    let buyScore = 0, sellScore = 0;
    const addScore = (sig, w) => { if (sig === 'BUY') buyScore += w; else if (sig === 'SELL') sellScore += w; };
    addScore(vwapSignal, 2); addScore(stSignal, 2); addScore(rsiSignal, 1); addScore(bollSignal, 1); addScore(adxSignal, 1);

    // Apply filters — block signals against 15m trend
    if (trend15m === 'DOWN' && buyScore > sellScore) { buyScore = Math.floor(buyScore * 0.5); warnings.push('BUY score reduced — against 15-min trend'); }
    if (trend15m === 'UP' && sellScore > buyScore) { sellScore = Math.floor(sellScore * 0.5); warnings.push('SELL score reduced — against 15-min trend'); }
    // Block if NIFTY against
    if (niftyTrend === 'DOWN' && buyScore > sellScore) buyScore = Math.max(0, buyScore - 1);
    if (niftyTrend === 'UP' && sellScore > buyScore) sellScore = Math.max(0, sellScore - 1);
    // Volume gate — reduce confidence if low volume
    if (!volCheck.ok) { buyScore = Math.ceil(buyScore * 0.6); sellScore = Math.ceil(sellScore * 0.6); }
    // Time gate
    if (!timeCheck.safe) { buyScore = Math.ceil(buyScore * 0.5); sellScore = Math.ceil(sellScore * 0.5); }

    const total = 7;
    let overall, overallClass;
    if (buyScore >= 5) { overall = 'STRONG BUY'; overallClass = 'strong-buy'; }
    else if (buyScore >= 4) { overall = 'BUY'; overallClass = 'buy'; }
    else if (sellScore >= 5) { overall = 'STRONG SELL'; overallClass = 'strong-sell'; }
    else if (sellScore >= 4) { overall = 'SELL'; overallClass = 'sell'; }
    else { overall = 'NEUTRAL'; overallClass = 'neutral'; }

    // ATR on 5-min data for proper SL
    const atr = this.calcATR(highs5m, lows5m, closes5m);
    const atrVal = atr.filter(v => v != null).pop() || (price * 0.005);

    return {
      overall, overallClass, buyScore, sellScore, total,
      strategies: [
        { name: 'VWAP', value: '\u20B9' + vwapVal.toFixed(2), signal: vwapSignal, desc: vwapDesc, weight: 2 },
        { name: 'Supertrend', value: '\u20B9' + stVal.toFixed(2), signal: stSignal, desc: stDesc, weight: 2 },
        { name: 'RSI (9)', value: rsi.toFixed(1), signal: rsiSignal, desc: rsiDesc, weight: 1 },
        { name: 'ADX', value: adx.adx.toFixed(1) + ' (+DI:' + adx.pdi.toFixed(0) + ' -DI:' + adx.mdi.toFixed(0) + ')', signal: adxSignal, desc: adxDesc, weight: 1 },
        { name: 'Bollinger', value: '\u20B9' + bL.toFixed(0) + ' - ' + bU.toFixed(0), signal: bollSignal, desc: bollDesc, weight: 1 }
      ],
      warnings, atr: atrVal, vwap: vwapVal, supertrend: stVal, supertrendDir: stDir,
      volumeOk: volCheck.ok, volRatio: volCheck.ratio, timeZone: timeCheck.zone, adxValue: adx.adx
    };
  },

  // ===== ENTRY/EXIT CALCULATOR =====
  calcEntryExit(price, atr, signal) {
    const isBuy = signal !== 'SELL' && signal !== 'STRONG SELL';
    const sl = isBuy ? price - 1.5 * atr : price + 1.5 * atr;
    const risk = Math.abs(price - sl);
    return {
      type: isBuy ? 'BUY' : 'SELL', entry: price, sl: +sl.toFixed(2), risk: +risk.toFixed(2),
      target1: +(isBuy ? price + risk : price - risk).toFixed(2),
      target2: +(isBuy ? price + 2 * risk : price - 2 * risk).toFixed(2),
      target3: +(isBuy ? price + 3 * risk : price - 3 * risk).toFixed(2)
    };
  },

  // ===== 15-MIN TREND =====
  get15mTrend(closes15m) {
    if (!closes15m || closes15m.length < 25) return null;
    const ema9 = this.calcEMA(closes15m, 9), ema21 = this.calcEMA(closes15m, 21);
    const e9 = ema9.filter(v => v != null).pop(), e21 = ema21.filter(v => v != null).pop();
    if (!e9 || !e21) return null;
    return e9 > e21 ? 'UP' : 'DOWN';
  },

  // ===== NIFTY TREND =====
  getNiftyTrend(closes) {
    if (!closes || closes.length < 10) return null;
    const valid = closes.filter(v => v != null);
    if (valid.length < 5) return null;
    const recent = valid[valid.length - 1], earlier = valid[Math.max(0, valid.length - 10)];
    return recent > earlier ? 'UP' : 'DOWN';
  }
};

// ===== POSITION MANAGER =====
const Positions = {
  KEY: 'stockpulse_positions',
  getAll() { try { return JSON.parse(localStorage.getItem(this.KEY)) || []; } catch { return []; } },
  save(p) { localStorage.setItem(this.KEY, JSON.stringify(p)); },
  add(pos) { const all = this.getAll(); pos.id = Date.now().toString(36); pos.time = new Date().toISOString(); pos.status = 'OPEN'; pos.trailSL = pos.sl; all.push(pos); this.save(all); return pos; },
  remove(id) { this.save(this.getAll().filter(p => p.id !== id)); },
  getForSymbol(sym) { return this.getAll().filter(p => p.symbol === sym && p.status === 'OPEN'); },
  updateTrailSL(id, sl) { const a = this.getAll(), p = a.find(x => x.id === id); if (p) { p.trailSL = sl; this.save(a); } },
  close(id, exitPrice) { const a = this.getAll(), p = a.find(x => x.id === id); if (p) { p.status = 'CLOSED'; p.exitPrice = exitPrice; p.closedAt = new Date().toISOString(); this.save(a); } }
};

// ===== TRADE LOG =====
const TradeLog = {
  KEY: 'stockpulse_tradelog',
  getAll() { try { return JSON.parse(localStorage.getItem(this.KEY)) || []; } catch { return []; } },
  save(l) { localStorage.setItem(this.KEY, JSON.stringify(l)); },
  log(entry) { const all = this.getAll(); entry.timestamp = new Date().toISOString(); all.push(entry); if (all.length > 100) all.shift(); this.save(all); },
  getStats() {
    const all = this.getAll().filter(t => t.pnl !== undefined);
    if (!all.length) return null;
    const wins = all.filter(t => t.pnl > 0), losses = all.filter(t => t.pnl <= 0);
    const totalPnl = all.reduce((a, t) => a + t.pnl, 0);
    const avgWin = wins.length ? wins.reduce((a, t) => a + t.pnl, 0) / wins.length : 0;
    const avgLoss = losses.length ? losses.reduce((a, t) => a + t.pnl, 0) / losses.length : 0;
    return { total: all.length, wins: wins.length, losses: losses.length, winRate: (wins.length / all.length * 100).toFixed(1), totalPnl: totalPnl.toFixed(2), avgWin: avgWin.toFixed(2), avgLoss: avgLoss.toFixed(2) };
  }
};
