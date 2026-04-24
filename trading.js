/* =============================================
   TRADING ENGINE v3 — Confidence-Based Decisions
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

  calcRSI(data, period=14) {
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

  calcVWAP(timestamps, closes, volumes, highs, lows) {
    let cumVol = 0, cumTP = 0; const r = [];
    let currentDay = null;
    for (let i = 0; i < closes.length; i++) {
      if (closes[i] == null || volumes[i] == null || timestamps[i] == null) { r.push(null); continue; }
      const date = new Date(timestamps[i] * 1000);
      const day = date.getDate();
      if (day !== currentDay) {
        cumVol = 0; cumTP = 0; currentDay = day;
      }
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
    if (valid.length < 20) return { ok: false, ratio: 0, avg: 0, current: 0 };
    // 20-period SMA to prevent morning spikes from permanently skewing the baseline
    const recent = valid[valid.length - 1];
    let sum = 0;
    for(let i = valid.length - 21; i < valid.length - 1; i++) {
      if(i >= 0) sum += valid[i];
    }
    const avg = sum / 20;
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

  // ===== MAIN ANALYSIS — v3 Confidence-Based =====
  analyze(timestamps, closes5m, highs5m, lows5m, vols5m, price, trend15m, niftyTrend, prevDayData, vixValue) {
    const n = closes5m.length;
    if (n < 30) return null;

    const warnings = [];
    const timeCheck = this.checkTime();
    if (!timeCheck.safe) warnings.push(timeCheck.warn);

    const volCheck = this.checkVolume(vols5m);
    if (!volCheck.ok) warnings.push('Low volume (' + volCheck.ratio.toFixed(1) + 'x avg) — signals unreliable');

    if (trend15m === 'DOWN') warnings.push('15-min trend BEARISH');
    else if (trend15m === 'UP') warnings.push('15-min trend BULLISH');
    if (niftyTrend === 'DOWN') warnings.push('NIFTY 50 falling');
    else if (niftyTrend === 'UP') warnings.push('NIFTY 50 rising');
    if (vixValue > 20) warnings.push('VIX > 20 — High fear, reduce size');

    // === INDICATORS ===
    const vwap = this.calcVWAP(timestamps, closes5m, vols5m, highs5m, lows5m);
    const vwapVal = vwap.filter(v => v != null).pop() || price;
    const vwapSignal = price > vwapVal ? 'BUY' : 'SELL';
    const vwapDesc = price > vwapVal ? 'Above VWAP — buyers control' : 'Below VWAP — sellers control';

    const rsiArr = this.calcRSI(closes5m, 14);
    const rsi = rsiArr.filter(v => v != null).pop() || 50;

    const st = this.calcSupertrend(highs5m, lows5m, closes5m);
    const stDir = st.direction.filter(v => v !== 0).pop() || 0;
    const stVal = st.values.filter(v => v != null).pop() || 0;
    const stSignal = stDir === 1 ? 'BUY' : 'SELL';
    let stDesc = stDir === 1 ? 'Supertrend bullish' : 'Supertrend bearish';

    const boll = this.calcBollinger(closes5m);
    const bU = boll.upper.filter(v => v != null).pop() || 0;
    const bL = boll.lower.filter(v => v != null).pop() || 0;

    const adx = this.calcADX(highs5m, lows5m, closes5m);

    // EMA 9/21 crossover
    const ema9 = this.calcEMA(closes5m, 9);
    const ema21 = this.calcEMA(closes5m, 21);
    const e9 = ema9.filter(v => v != null).pop() || 0;
    const e21 = ema21.filter(v => v != null).pop() || 0;
    const emaSignal = e9 > e21 ? 'BUY' : 'SELL';
    const emaDesc = e9 > e21 ? 'EMA9 > EMA21 — momentum up' : 'EMA9 < EMA21 — momentum down';

    // === 3-ZONE ADX REGIME ===
    let regime, regimeDesc;
    if (adx.adx > 25) { regime = 'TRENDING'; regimeDesc = 'Strong Trend (ADX ' + adx.adx.toFixed(0) + ')'; }
    else if (adx.adx >= 15) { regime = 'WEAK'; regimeDesc = 'Weak Trend (ADX ' + adx.adx.toFixed(0) + ')'; }
    else { regime = 'RANGING'; regimeDesc = 'Sideways (ADX ' + adx.adx.toFixed(0) + ')'; }

    // === SCORE SYSTEM (0-6) — 6 indicators, each +1 ===
    let buyVotes = 0, sellVotes = 0;
    const indicators = [];

    // 1. VWAP (+1)
    if (vwapSignal === 'BUY') buyVotes++; else sellVotes++;
    indicators.push({ name: 'VWAP', value: '\u20B9' + vwapVal.toFixed(2), signal: vwapSignal, desc: vwapDesc, vote: vwapSignal });

    // 2. Supertrend (+1, only in trending/weak)
    if (regime === 'RANGING') {
      stDesc = 'Ignored (Ranging market)';
      indicators.push({ name: 'Supertrend', value: '\u20B9' + stVal.toFixed(2), signal: 'SKIP', desc: stDesc, vote: 'SKIP' });
    } else {
      if (stSignal === 'BUY') buyVotes++; else sellVotes++;
      indicators.push({ name: 'Supertrend', value: '\u20B9' + stVal.toFixed(2), signal: stSignal, desc: stDesc, vote: stSignal });
    }

    // 3. RSI(14) (+1)
    let rsiSignal = 'NEUTRAL', rsiDesc = 'RSI neutral zone';
    if (regime === 'TRENDING' || regime === 'WEAK') {
      if (rsi > 55) { rsiSignal = 'BUY'; rsiDesc = 'RSI > 55 confirms up'; buyVotes++; }
      else if (rsi < 45) { rsiSignal = 'SELL'; rsiDesc = 'RSI < 45 confirms down'; sellVotes++; }
    } else {
      if (rsi < 30) { rsiSignal = 'BUY'; rsiDesc = 'Oversold — bounce likely'; buyVotes++; }
      else if (rsi > 70) { rsiSignal = 'SELL'; rsiDesc = 'Overbought — drop likely'; sellVotes++; }
    }
    indicators.push({ name: 'RSI (14)', value: rsi.toFixed(1), signal: rsiSignal, desc: rsiDesc, vote: rsiSignal });

    // 4. EMA 9/21 (+1)
    if (emaSignal === 'BUY') buyVotes++; else sellVotes++;
    indicators.push({ name: 'EMA 9/21', value: 'EMA9:' + e9.toFixed(1) + ' / EMA21:' + e21.toFixed(1), signal: emaSignal, desc: emaDesc, vote: emaSignal });

    // 5. 15-Min Trend (+1)
    let t15Signal = 'NEUTRAL', t15Desc = 'No 15m trend data';
    if (trend15m === 'UP') { t15Signal = 'BUY'; t15Desc = '15m trend UP'; buyVotes++; }
    else if (trend15m === 'DOWN') { t15Signal = 'SELL'; t15Desc = '15m trend DOWN'; sellVotes++; }
    indicators.push({ name: '15m Trend', value: trend15m || '--', signal: t15Signal, desc: t15Desc, vote: t15Signal });

    // 6. Nifty Alignment (+1)
    let niftySignal = 'NEUTRAL', niftyDesc = 'No Nifty data';
    if (niftyTrend === 'UP') { niftySignal = 'BUY'; niftyDesc = 'Nifty rising'; buyVotes++; }
    else if (niftyTrend === 'DOWN') { niftySignal = 'SELL'; niftyDesc = 'Nifty falling'; sellVotes++; }
    indicators.push({ name: 'Nifty 50', value: niftyTrend || '--', signal: niftySignal, desc: niftyDesc, vote: niftySignal });

    // 7. Bollinger (bonus in ranging, replaces skipped Supertrend)
    let bollSignal = 'NEUTRAL', bollDesc = 'Within bands';
    if (regime === 'RANGING') {
      if (price <= bL * 1.005) { bollSignal = 'BUY'; bollDesc = 'At lower band — bounce'; buyVotes++; }
      else if (price >= bU * 0.995) { bollSignal = 'SELL'; bollDesc = 'At upper band — reversal'; sellVotes++; }
    }
    indicators.push({ name: 'Bollinger', value: '\u20B9' + bL.toFixed(0) + ' - ' + bU.toFixed(0), signal: bollSignal, desc: bollDesc, vote: bollSignal });

    // === CONFIDENCE SCORE (0-100) ===
    const totalVotes = buyVotes + sellVotes;
    const dominantSide = buyVotes >= sellVotes ? 'BUY' : 'SELL';
    const dominantVotes = Math.max(buyVotes, sellVotes);
    const minorityVotes = Math.min(buyVotes, sellVotes);

    let confidence = 0;
    // Base: agreement ratio (max 40 pts)
    confidence += totalVotes > 0 ? (dominantVotes / totalVotes) * 40 : 0;
    // ADX clarity (max 15 pts): strong trend or very clear range
    if (adx.adx > 30) confidence += 15;
    else if (adx.adx > 25) confidence += 10;
    else if (adx.adx < 12) confidence += 12; // clear range
    else confidence += 5;
    // Volume confirmation (max 15 pts)
    if (volCheck.ratio >= 2) confidence += 15;
    else if (volCheck.ratio >= 1.2) confidence += 10;
    else confidence += 3;
    // Nifty alignment (max 10 pts)
    if ((dominantSide === 'BUY' && niftyTrend === 'UP') || (dominantSide === 'SELL' && niftyTrend === 'DOWN')) confidence += 10;
    else if (niftyTrend === null) confidence += 5;
    // 15m alignment (max 10 pts)
    if ((dominantSide === 'BUY' && trend15m === 'UP') || (dominantSide === 'SELL' && trend15m === 'DOWN')) confidence += 10;
    else if (trend15m === null) confidence += 5;
    // Time safety (max 10 pts)
    if (timeCheck.safe) confidence += 10;
    else if (timeCheck.zone === 'LATE') confidence += 3;

    // VIX penalty
    if (vixValue > 20) confidence = Math.max(0, confidence - 10);

    confidence = Math.min(100, Math.round(confidence));

    // === FINAL VERDICT — Only BUY/SELL if confidence >= 70 ===
    let overall, overallClass, verdictReason;
    if (confidence >= 85 && dominantVotes >= 5) {
      overall = dominantSide === 'BUY' ? 'STRONG BUY' : 'STRONG SELL';
      overallClass = dominantSide === 'BUY' ? 'strong-buy' : 'strong-sell';
      verdictReason = dominantVotes + '/6 indicators agree. Very high confidence.';
    } else if (confidence >= 70 && dominantVotes >= 4) {
      overall = dominantSide;
      overallClass = dominantSide.toLowerCase();
      verdictReason = dominantVotes + '/6 indicators agree. Good confidence.';
    } else {
      overall = 'NEUTRAL';
      overallClass = 'neutral';
      verdictReason = 'Only ' + dominantVotes + '/6 agree (confidence ' + confidence + '%). Not enough conviction — WAIT.';
    }

    // Pivots
    let pivots = null;
    if (prevDayData) pivots = this.calcPivotPoints(prevDayData.high, prevDayData.low, prevDayData.close);

    const atr = this.calcATR(highs5m, lows5m, closes5m);
    const atrVal = atr.filter(v => v != null).pop() || (price * 0.005);

    return {
      overall, overallClass, confidence, verdictReason,
      buyVotes, sellVotes, dominantSide, regime, regimeDesc,
      strategies: indicators,
      warnings, atr: atrVal, vwap: vwapVal, supertrend: stVal, supertrendDir: stDir,
      volumeOk: volCheck.ok, volRatio: volCheck.ratio, timeZone: timeCheck.zone, adxValue: adx.adx, pivots
    };
  },

  // ===== ENTRY/EXIT CALCULATOR (1.5:1 and 3:1 R:R) =====
  calcEntryExit(price, atr, signal, pivots) {
    const isBuy = signal !== 'SELL' && signal !== 'STRONG SELL';
    let sl = isBuy ? price - 1.5 * atr : price + 1.5 * atr;
    if (pivots) {
      if (isBuy && price > pivots.pivot && price - pivots.pivot < 2 * atr) sl = pivots.pivot - atr * 0.5;
      else if (!isBuy && price < pivots.pivot && pivots.pivot - price < 2 * atr) sl = pivots.pivot + atr * 0.5;
    }
    const risk = Math.abs(price - sl);
    let t1 = isBuy ? price + 1.5 * risk : price - 1.5 * risk;
    let t2 = isBuy ? price + 3 * risk : price - 3 * risk;
    let t3 = isBuy ? price + 4 * risk : price - 4 * risk;
    if (pivots) {
      if (isBuy) {
        if (t1 < pivots.r1 && price < pivots.r1) t1 = pivots.r1;
        if (t2 < pivots.r2 && price < pivots.r2) t2 = pivots.r2;
      } else {
        if (t1 > pivots.s1 && price > pivots.s1) t1 = pivots.s1;
        if (t2 > pivots.s2 && price > pivots.s2) t2 = pivots.s2;
      }
    }
    return {
      type: isBuy ? 'BUY' : 'SELL', entry: price, sl: +sl.toFixed(2), risk: +risk.toFixed(2),
      target1: +t1.toFixed(2), target2: +t2.toFixed(2), target3: +t3.toFixed(2)
    };
  },

  // ===== 15-MIN TREND =====
  get15mTrend(closes15m) {
    if (!closes15m || closes15m.length < 20) return null;
    const sma20 = this.calcSMA(closes15m, 20);
    const s20 = sma20.filter(v => v != null).pop();
    const current = closes15m[closes15m.length - 1];
    if (!s20 || !current) return null;
    return current > s20 ? 'UP' : 'DOWN';
  },

  // ===== NIFTY TREND =====
  getNiftyTrend(closes) {
    if (!closes || closes.length < 25) return null;
    const ema9 = this.calcEMA(closes, 9), ema21 = this.calcEMA(closes, 21);
    const e9 = ema9.filter(v => v != null).pop(), e21 = ema21.filter(v => v != null).pop();
    if (!e9 || !e21) return null;
    return e9 > e21 ? 'UP' : 'DOWN';
  },

  // ===== IMMEDIATE ACTION ENGINE (1-Min Data) =====
  analyzeImmediateAction(timestamps1m, closes1m, highs1m, lows1m, vols1m, currentPrice, vwap, pivots, dayHigh, dayLow) {
    if (!closes1m || closes1m.length < 5) return null;
    const n = closes1m.length;
    
    // Get last few candles (use previous close if open is not available in arrays)
    const c0 = closes1m[n-1], o0 = closes1m[n-2], h0 = highs1m[n-1], l0 = lows1m[n-1], v0 = vols1m[n-1] || 0;
    const isBullishCandle = c0 > o0;
    const isBearishCandle = c0 < o0;
    
    // 1. Volume Anomaly (Spike Detection)
    let avgVol = 0;
    const volPeriod = Math.min(20, n);
    for(let i = n - volPeriod; i < n - 1; i++) avgVol += (vols1m[i] || 0);
    avgVol = avgVol / (volPeriod - 1) || 1;
    const isVolumeSpike = v0 > avgVol * 3; // 300% volume spike
    
    // 2. Proximity to Key Levels (0.1% buffer)
    const buffer = currentPrice * 0.001;
    let nearLevel = null;
    let bounceType = null; // 'SUPPORT' or 'RESISTANCE'
    
    if (dayHigh && Math.abs(currentPrice - dayHigh) <= buffer) {
      nearLevel = 'DAY HIGH';
      bounceType = 'RESISTANCE';
    } else if (dayLow && Math.abs(currentPrice - dayLow) <= buffer) {
      nearLevel = 'DAY LOW';
      bounceType = 'SUPPORT';
    } else if (vwap && Math.abs(currentPrice - vwap) <= buffer) {
      nearLevel = 'VWAP';
      bounceType = currentPrice >= vwap ? 'SUPPORT' : 'RESISTANCE';
    } else if (pivots) {
      const levels = [
        {name: 'Pivot', val: pivots.pivot}, {name: 'R1', val: pivots.r1}, {name: 'R2', val: pivots.r2},
        {name: 'S1', val: pivots.s1}, {name: 'S2', val: pivots.s2}
      ];
      for (const lvl of levels) {
        if (Math.abs(currentPrice - lvl.val) <= buffer) {
          nearLevel = lvl.name;
          bounceType = currentPrice >= lvl.val ? 'SUPPORT' : 'RESISTANCE';
          break;
        }
      }
    }

    // 3. Evaluate Setup
    let action = 'WAIT';
    let msg = 'Price is floating. Wait for a setup at key levels.';
    let intensity = 0; // 0: None, 1: Info, 2: Alert, 3: Action

    if (nearLevel) {
      if (isVolumeSpike) {
        if (nearLevel === 'DAY HIGH' && isBullishCandle) {
          action = 'BUY NOW';
          msg = `🚀 DAY HIGH BREAKOUT: Massive volume pushing through the high of the day!`;
          intensity = 3;
        } else if (nearLevel === 'DAY LOW' && isBearishCandle) {
          action = 'SELL NOW';
          msg = `🩸 DAY LOW BREAKDOWN: Massive volume crashing through the low of the day!`;
          intensity = 3;
        } else if (isBullishCandle && bounceType === 'SUPPORT') {
          action = 'BUY NOW';
          msg = `🔥 BUYERS STEPPING IN: Strong volume rejection at ${nearLevel} support.`;
          intensity = 3;
        } else if (isBearishCandle && bounceType === 'RESISTANCE') {
          action = 'SELL NOW';
          msg = `🚨 SELLERS STEPPING IN: Strong volume rejection at ${nearLevel} resistance.`;
          intensity = 3;
        } else if (isBullishCandle && bounceType === 'RESISTANCE') {
          action = 'ALERT';
          msg = `⚡ BREAKOUT ATTEMPT: High volume pushing against ${nearLevel} resistance. Watch for close above.`;
          intensity = 2;
        } else if (isBearishCandle && bounceType === 'SUPPORT') {
          action = 'ALERT';
          msg = `⚠️ BREAKDOWN WARNING: High volume pushing against ${nearLevel} support. Watch for close below.`;
          intensity = 2;
        }
      } else {
        msg = `👀 Watching ${nearLevel}: Price is testing ${nearLevel} ${bounceType}. Wait for volume confirmation.`;
        intensity = 1;
      }
    } else if (isVolumeSpike) {
      action = 'ALERT';
      msg = `💨 SUDDEN MOMENTUM: Volume spike detected (${(v0/avgVol).toFixed(1)}x avg), but not at a key level. Scalp with caution.`;
      intensity = 2;
    }

    return { action, msg, intensity, isVolumeSpike, nearLevel };
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
