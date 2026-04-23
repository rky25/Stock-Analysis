let currentSymbol='',refreshTimer=null,lastPrice=0,chartType='candle';
let rawData=null,raw5m=null,raw15m=null,rawNifty=null;
let analysisResult=null,calcResult=null;

/* THEME */
function toggleTheme(){
  const d=document.documentElement,isDark=d.getAttribute('data-theme')==='dark';
  d.setAttribute('data-theme',isDark?'':'dark');
  document.getElementById('themeIcon').textContent=isDark?'\u263E':'\u2600';
  localStorage.setItem('theme',isDark?'light':'dark');
  if(rawData)renderAll(rawData,true);
}
(function(){if(localStorage.getItem('theme')==='dark'){document.documentElement.setAttribute('data-theme','dark');document.addEventListener('DOMContentLoaded',()=>{document.getElementById('themeIcon').textContent='\u2600'})}})();

/* MARKET STATUS */
function updateMkt(){
  const n=new Date(),ist=new Date(n.toLocaleString('en-US',{timeZone:'Asia/Kolkata'})),h=ist.getHours(),m=ist.getMinutes(),d=ist.getDay();
  const o=d>=1&&d<=5&&(h>9||(h===9&&m>=15))&&(h<15||(h===15&&m<=30));
  document.getElementById('mktDot').className='mkt-dot '+(o?'open':'closed');
  document.getElementById('mktLabel').textContent=o?'Open':'Closed';
}
document.addEventListener('DOMContentLoaded',()=>{updateMkt();setInterval(updateMkt,30000)});

/* SEARCH */
let sto;
document.addEventListener('DOMContentLoaded',()=>{
  const inp=document.getElementById('searchInput'),dd=document.getElementById('dropdown');
  inp.addEventListener('input',function(){clearTimeout(sto);const q=this.value.trim();if(!q){dd.classList.remove('show');return}sto=setTimeout(()=>doSearch(q),300)});
  inp.addEventListener('keydown',function(e){if(e.key==='Enter'){const q=this.value.trim();if(q){loadStock(q.toUpperCase()+'.NS');dd.classList.remove('show')}}});
  document.addEventListener('click',e=>{if(!e.target.closest('.search-box'))dd.classList.remove('show')});
  // Load initial trade log
  renderTradeLog();
});
async function doSearch(q){
  const dd=document.getElementById('dropdown');
  try{const r=await fetch('/api/search/'+encodeURIComponent(q)),d=await r.json();
  if(!d.quotes||!d.quotes.length){dd.innerHTML='<div style="padding:12px;text-align:center;color:var(--text3);font-size:12px">No results</div>';dd.classList.add('show');return}
  dd.innerHTML=d.quotes.filter(s=>s.symbol).slice(0,6).map(s=>`<div class="dd-item" onclick="loadStock('${s.symbol}')"><div><div class="dd-sym">${s.symbol}</div><div class="dd-name">${s.shortname||s.longname||''}</div></div><span class="dd-exch">${s.exchange||''}</span></div>`).join('');
  dd.classList.add('show')}catch(e){console.error(e)}
}

/* FETCH ALL CONTEXT DATA */
async function loadStock(sym){
  document.getElementById('dropdown').classList.remove('show');
  document.getElementById('searchInput').value=sym.replace('.NS','').replace('.BO','');
  currentSymbol=sym;lastPrice=0;if(refreshTimer)clearInterval(refreshTimer);
  show('loadingView');hide('welcomeView','stockView','errorView');
  try{
    await fetchContextData(sym);
    document.querySelectorAll('.range-tab').forEach(t=>t.classList.remove('active'));
    document.querySelector('.range-tab[data-range="1d"]').classList.add('active');
    refreshTimer=setInterval(()=>fetchContextData(sym,true),60000); // 1-minute full refresh
  }catch(e){hide('loadingView');document.getElementById('errorView').textContent='Error: '+(e.message||'Failed');show('errorView')}
}

async function fetchContextData(sym, silent=false) {
  try {
    // Parallel fetch: 1m (chart), 5m (signals), 15m (trend), NIFTY 15m (market trend)
    const [res1m, res5m, res15m, resNifty] = await Promise.all([
      fetch(`/api/chart/${sym}?range=1d&interval=1m`).then(r => r.json()),
      fetch(`/api/chart/${sym}?range=5d&interval=5m`).then(r => r.json()),
      fetch(`/api/chart/${sym}?range=1mo&interval=15m`).then(r => r.json()),
      fetch(`/api/chart/%5ENSEI?range=5d&interval=15m`).then(r => r.json()) // ^NSEI is Nifty 50
    ]);

    if(!res1m.chart||!res1m.chart.result) throw new Error('No 1m data');
    rawData = res1m.chart.result[0];
    if(res5m.chart && res5m.chart.result) raw5m = res5m.chart.result[0];
    if(res15m.chart && res15m.chart.result) raw15m = res15m.chart.result[0];
    if(resNifty.chart && resNifty.chart.result) rawNifty = resNifty.chart.result[0];

    renderAll(rawData, silent);
  } catch (e) {
    if(!silent) throw e;
    console.error('Background fetch failed:', e);
  }
}

async function fetchRawData(sym,range,interval,silent){
  const r=await fetch(`/api/chart/${sym}?range=${range}&interval=${interval}`);
  if(!r.ok)throw new Error('API '+r.status);const d=await r.json();
  if(!d.chart||!d.chart.result)throw new Error('No data');
  rawData=d.chart.result[0];renderAll(rawData,silent);
}

/* RENDER ALL */
function renderAll(res,silent){
  const meta=res.meta,q=res.indicators.quote[0]||{};
  const closes=q.close||[],opens=q.open||[],highs=q.high||[],lows=q.low||[],vols=q.volume||[];
  if(!silent)hide('loadingView');
  const vc=closes.filter(v=>v!=null),vh=highs.filter(v=>v!=null),vl=lows.filter(v=>v!=null),vv=vols.filter(v=>v!=null);

  // Price header
  document.getElementById('sName').textContent=meta.shortName||meta.symbol||currentSymbol;
  document.getElementById('sSub').textContent=(meta.symbol||'')+' \u2022 '+(meta.exchangeName||'NSE');
  const price=meta.regularMarketPrice,prev=meta.chartPreviousClose||meta.previousClose||price;
  const chg=price-prev,pct=chg/prev*100,up=chg>=0;
  const pe=document.getElementById('sPrice');
  if(lastPrice&&lastPrice!==price){pe.classList.remove('flash-green','flash-red');void pe.offsetWidth;pe.classList.add(price>lastPrice?'flash-green':'flash-red')}
  pe.textContent=fmt(price);lastPrice=price;
  const ce=document.getElementById('sChange');ce.className='ph-change '+(up?'up':'down');
  ce.textContent=(up?'\u25B2':'\u25BC')+' '+(up?'+':'')+chg.toFixed(2)+' ('+(up?'+':'')+pct.toFixed(2)+'%)';

  // OHLC
  const o=meta.regularMarketOpen||opens.find(v=>v!=null)||0;
  const h=meta.regularMarketDayHigh||Math.max(...vh);
  const l=meta.regularMarketDayLow||Math.min(...vl);
  document.getElementById('ohlcBar').innerHTML=
    `<div class="ohlc-item">O<span>${fmt(o)}</span></div><div class="ohlc-item">H<span style="color:var(--green)">${fmt(h)}</span></div><div class="ohlc-item">L<span style="color:var(--red)">${fmt(l)}</span></div><div class="ohlc-item">C<span>${fmt(price)}</span></div><div class="ohlc-item">Vol<span>${shortNum(meta.regularMarketVolume||0)}</span></div>`;

  // --- ENHANCED SIGNAL ENGINE (v2) ---
  if(raw5m && raw15m && rawNifty) {
    // 1. Get 15m trend
    const q15=raw15m.indicators.quote[0]||{};
    const trend15m = Trading.get15mTrend(q15.close||[]);

    // 2. Get NIFTY trend
    const qNifty=rawNifty.indicators.quote[0]||{};
    const niftyTrend = Trading.getNiftyTrend(qNifty.close||[]);

    // 3. Analyze on 5m data
    const q5=raw5m.indicators.quote[0]||{};
    analysisResult = Trading.analyze(
      q5.close||[], q5.high||[], q5.low||[], q5.volume||[], 
      price, trend15m, niftyTrend
    );

    if(analysisResult){
      renderSignals(analysisResult, trend15m, niftyTrend);
      calcResult=Trading.calcEntryExit(price,analysisResult.atr,analysisResult.overall);
      renderCalc(calcResult);
      // Log signal if strong
      if(!silent && (analysisResult.overall==='STRONG BUY'||analysisResult.overall==='STRONG SELL')){
         TradeLog.log({type:'SIGNAL', symbol:currentSymbol, action:analysisResult.overall, price, time:new Date().toISOString()});
      }
    }
  }

  // Position tracker
  renderPositions(price);

  // Chart
  drawChart(res.timestamp||[],opens,highs,lows,closes,vols,prev);

  // Depth (marked as estimated)
  renderDepth(meta,price,vc,vv);

  // Stats
  const vol=meta.regularMarketVolume||0;
  document.getElementById('statsBox').innerHTML=[
    ['Open',fmt(o)],['Prev Close',fmt(prev)],['Day High',fmt(h)],['Day Low',fmt(l)],
    ['Volume',vol.toLocaleString('en-IN')],['52W High',fmt(meta.fiftyTwoWeekHigh||0)],
    ['52W Low',fmt(meta.fiftyTwoWeekLow||0)],['Day Range',fmt(l)+' - '+fmt(h)]
  ].map(s=>`<div class="stat-row"><span class="sl">${s[0]}</span><span class="sv">${s[1]}</span></div>`).join('');

  show('stockView');
}

/* SIGNALS */
function renderSignals(a, trend15m, niftyTrend){
  const icons={buy:'\u2705','strong-buy':'\u{1F525}',sell:'\u274C','strong-sell':'\u26D4',neutral:'\u26A0\uFE0F'};
  
  // Render overall verdict
  document.getElementById('signalOverall').className='signal-overall '+a.overallClass;
  document.getElementById('signalOverall').innerHTML=`<span class="so-icon">${icons[a.overallClass]||'\u26A0\uFE0F'}</span><div class="so-text"><div class="so-verdict">${a.overall}</div><div class="so-sub">Score: ${a.buyScore} Buy vs ${a.sellScore} Sell (out of ${a.total}) \u2022 5m Base</div></div>`;
  
  // Render Warnings/Context
  const ctxDiv = document.getElementById('signalContext');
  if(a.warnings && a.warnings.length > 0) {
    ctxDiv.innerHTML = a.warnings.map(w => `<div class="warn-pill"><span class="warn-icon">\u26A0\uFE0F</span>${w}</div>`).join('');
    ctxDiv.style.display = 'flex';
  } else {
    ctxDiv.innerHTML = `<div class="warn-pill safe"><span class="warn-icon">\u2705</span>All filters clear: Good volume, favorable trend, safe time</div>`;
    ctxDiv.style.display = 'flex';
  }

  // Render strategies
  document.getElementById('stratGrid').innerHTML=a.strategies.map(s=>`<div class="strat-card"><div class="strat-top"><span class="strat-name">${s.name} <span style="font-size:8px;color:var(--text3);font-weight:normal">(wt:${s.weight})</span></span><span class="strat-sig ${s.signal}">${s.signal}</span></div><div class="strat-val">${s.value}</div><div class="strat-desc">${s.desc}</div></div>`).join('');
}

/* CALCULATOR */
function renderCalc(c){
  const prices=[c.sl,c.entry,c.target1,c.target2,c.target3];
  const mn=Math.min(...prices),mx=Math.max(...prices),rng=mx-mn||1;
  const pct=v=>((v-mn)/rng*100).toFixed(0);
  const rows=[
    {cls:'sl',label:'SL',price:c.sl,pos:pct(c.sl)},
    {cls:'entry',label:'Entry',price:c.entry,pos:pct(c.entry)},
    {cls:'t1',label:'T1',price:c.target1,pos:pct(c.target1)},
    {cls:'t2',label:'T2',price:c.target2,pos:pct(c.target2)},
    {cls:'t3',label:'T3',price:c.target3,pos:pct(c.target3)}
  ];
  if(c.type==='SELL')rows.reverse();
  let html=rows.map(r=>`<div class="calc-row ${r.cls}"><span class="calc-label">${r.label}</span><div class="calc-bar"><div class="calc-marker" style="left:${r.pos}%"></div></div><span class="calc-price">${fmt(r.price)}</span></div>`).join('');
  html+=`<div class="calc-rr"><div class="rr-item">Risk/Share<strong>${fmt(c.risk)}</strong></div><div class="rr-item">R:R 1:1<strong>${fmt(c.target1)}</strong></div><div class="rr-item">R:R 1:2<strong>${fmt(c.target2)}</strong></div><div class="rr-item">R:R 1:3<strong>${fmt(c.target3)}</strong></div></div>`;
  document.getElementById('calcBody').innerHTML=html;
  document.getElementById('calcType').textContent=c.type==='BUY'?'Suggested: BUY':'Suggested: SELL';
  document.getElementById('calcType').className='pos-badge '+(c.type==='BUY'?'buy':'sell');
  
  // Pre-fill trade form
  document.getElementById('tfType').value=c.type.toLowerCase();
  document.getElementById('tfPrice').value=c.entry.toFixed(2);
  document.getElementById('tfSL').value=c.sl;
  document.getElementById('tfT1').value=c.target1;
  updateTradeBtn();
}

/* TRADE FORM */
function updateTradeBtn(){
  const btn=document.getElementById('tfBtn');
  const type=document.getElementById('tfType').value;
  btn.textContent=type==='buy'?'Add BUY Position':'Add SELL Position';
  btn.className='btn-trade '+(type==='buy'?'buy-btn':'sell-btn');
  checkRisk();
}

function checkRisk() {
  const price=parseFloat(document.getElementById('tfPrice').value);
  const qty=parseInt(document.getElementById('tfQty').value)||0;
  const sl=parseFloat(document.getElementById('tfSL').value);
  const warnDiv = document.getElementById('riskWarning');
  
  if(!price || !qty || !sl) { warnDiv.style.display='none'; return; }
  
  const risk = Math.abs(price - sl) * qty;
  const totalValue = price * qty;
  
  if (risk > 5000 || totalValue > 100000) { // Arbitrary high risk thresholds for demo
    warnDiv.textContent = `\u26A0\uFE0F High Risk Warning: You are risking \u20B9${risk.toFixed(0)} on a \u20B9${(totalValue/1000).toFixed(1)}k position. Max recommended risk per trade is 1-2% of capital.`;
    warnDiv.style.display = 'block';
  } else {
    warnDiv.style.display = 'none';
  }
}

// Add listeners to check risk
document.getElementById('tfPrice').addEventListener('input', checkRisk);
document.getElementById('tfQty').addEventListener('input', checkRisk);
document.getElementById('tfSL').addEventListener('input', checkRisk);

function addPosition(){
  const type=document.getElementById('tfType').value.toUpperCase();
  const price=parseFloat(document.getElementById('tfPrice').value);
  const qty=parseInt(document.getElementById('tfQty').value)||1;
  const sl=parseFloat(document.getElementById('tfSL').value);
  const t1=parseFloat(document.getElementById('tfT1').value);
  if(!price||!sl||!t1){alert('Fill all fields');return}
  const risk=Math.abs(price-sl);
  
  const pos = Positions.add({symbol:currentSymbol,type,entry:price,qty,sl,trailSL:sl,
    target1:t1,target2:+(type==='BUY'?price+2*risk:price-2*risk).toFixed(2),
    target3:+(type==='BUY'?price+3*risk:price-3*risk).toFixed(2)});
    
  TradeLog.log({type:'ENTRY', symbol:currentSymbol, action:type, price, qty, time:new Date().toISOString()});
  
  document.getElementById('tfQty').value='';
  renderPositions(lastPrice);
  if(rawData)renderAll(rawData,true); // Re-draw to show lines
}

/* POSITION TRACKER */
function renderPositions(price){
  const box=document.getElementById('posTracker');
  const positions=Positions.getForSymbol(currentSymbol);
  if(!positions.length){box.style.display='none';return}
  box.style.display='block';
  let html='';
  positions.forEach(p=>{
    const isBuy=p.type==='BUY';
    const pnl=isBuy?(price-p.entry)*p.qty:(p.entry-price)*p.qty;
    const pnlPct=isBuy?(price-p.entry)/p.entry*100:(p.entry-price)/p.entry*100;
    const isProfit=pnl>=0;
    // Trailing SL update
    if(isBuy&&price>p.entry){const newSL=Math.max(p.trailSL,price-1.5*(p.entry-p.sl));if(newSL>p.trailSL)Positions.updateTrailSL(p.id,newSL);p.trailSL=Math.max(p.trailSL,newSL)}
    if(!isBuy&&price<p.entry){const newSL=Math.min(p.trailSL,price+1.5*(p.sl-p.entry));if(newSL<p.trailSL)Positions.updateTrailSL(p.id,newSL);p.trailSL=Math.min(p.trailSL,newSL)}
    
    // Status
    let status='HOLD',statusClass='hold',statusMsg='Trend is intact, hold your position';
    if(isBuy&&price<=p.trailSL){status='EXIT NOW';statusClass='exit';statusMsg='Stop loss hit! Close position'}
    else if(!isBuy&&price>=p.trailSL){status='EXIT NOW';statusClass='exit';statusMsg='Stop loss hit! Close position'}
    else if(isBuy&&price>=p.target1&&price<p.target2){status='T1 HIT - HOLD';statusClass='watch';statusMsg='Target 1 reached. Trail your SL'}
    else if(!isBuy&&price<=p.target1&&price>p.target2){status='T1 HIT - HOLD';statusClass='watch';statusMsg='Target 1 reached. Trail your SL'}
    else if((isBuy&&price>=p.target2)||((!isBuy)&&price<=p.target2)){status='T2 HIT - BOOK';statusClass='hold';statusMsg='Target 2 reached! Consider booking profit'}
    const elapsed=Math.round((Date.now()-new Date(p.time).getTime())/60000);

    html+=`<div style="margin-bottom:10px;padding-bottom:10px;border-bottom:1px solid var(--border2)">
      <div class="pos-head"><span class="pos-title">${p.type} Position</span><span class="pos-badge ${p.type.toLowerCase()}">${p.type} \u2022 ${p.qty} shares \u2022 ${elapsed}min</span></div>
      <div class="pos-pnl ${isProfit?'profit':'loss'}"><div class="pnl-amount">${isProfit?'+':''}\u20B9${pnl.toFixed(2)}</div><div class="pnl-pct">${isProfit?'+':''}${pnlPct.toFixed(2)}% on \u20B9${(p.entry*p.qty).toFixed(0)} invested</div></div>
      <div class="pos-status ${statusClass}">${status} \u2014 ${statusMsg}</div>
      <div class="pos-levels"><div class="lv"><div class="lv-label">SL</div><div class="lv-val sl">${fmt(p.trailSL)}</div></div><div class="lv"><div class="lv-label">Entry</div><div class="lv-val">${fmt(p.entry)}</div></div><div class="lv"><div class="lv-label">T1</div><div class="lv-val t1">${fmt(p.target1)}</div></div><div class="lv"><div class="lv-label">T2</div><div class="lv-val t2">${fmt(p.target2)}</div></div><div class="lv"><div class="lv-label">T3</div><div class="lv-val t3">${fmt(p.target3)}</div></div></div>
      <div class="pos-actions"><button class="btn-close-pos" onclick="closePosition('${p.id}', ${p.qty})">Close Position</button></div></div>`;
  });
  box.querySelector('.pos-content').innerHTML=html;
}

function closePosition(id, qty){
  const p = Positions.getAll().find(x => x.id === id);
  if(p) {
      const isBuy = p.type === 'BUY';
      const pnl = isBuy ? (lastPrice - p.entry)*qty : (p.entry - lastPrice)*qty;
      TradeLog.log({type:'EXIT', symbol:currentSymbol, action:isBuy?'SELL':'BUY', price:lastPrice, qty, pnl, time:new Date().toISOString()});
  }
  Positions.close(id, lastPrice);
  renderPositions(lastPrice);
  renderTradeLog();
  if(rawData)renderAll(rawData,true);
}

/* TRADE LOG DISPLAY */
function renderTradeLog() {
    const stats = TradeLog.getStats();
    if(!stats) return;
    
    // Create or update log section
    let logSec = document.getElementById('tradeLogSection');
    if(!logSec) {
        logSec = document.createElement('div');
        logSec.id = 'tradeLogSection';
        logSec.className = 'section-card';
        logSec.style.marginTop = '12px';
        document.querySelector('.two-col').parentElement.appendChild(logSec);
    }
    
    const isProfitable = parseFloat(stats.totalPnl) >= 0;
    
    logSec.innerHTML = `
      <h3>Performance Stats</h3>
      <div style="display:flex;gap:10px;margin-bottom:10px;">
        <div style="flex:1;background:var(--bg);padding:10px;border-radius:var(--radius-sm);text-align:center;">
           <div style="font-size:10px;color:var(--text3);text-transform:uppercase;">Win Rate</div>
           <div style="font-size:18px;font-weight:700;color:${stats.winRate > 50 ? 'var(--green)' : 'var(--text)'}">${stats.winRate}%</div>
        </div>
        <div style="flex:1;background:var(--bg);padding:10px;border-radius:var(--radius-sm);text-align:center;">
           <div style="font-size:10px;color:var(--text3);text-transform:uppercase;">Total P&L</div>
           <div style="font-size:18px;font-weight:700;color:${isProfitable ? 'var(--green)' : 'var(--red)'}">${isProfitable?'+':''}\u20B9${stats.totalPnl}</div>
        </div>
      </div>
      <div style="font-size:11px;color:var(--text2);display:flex;justify-content:space-between;">
        <span>Trades: ${stats.total} (${stats.wins}W / ${stats.losses}L)</span>
        <span>Avg W: \u20B9${stats.avgWin} | Avg L: \u20B9${Math.abs(stats.avgLoss)}</span>
      </div>
    `;
}


/* MARKET DEPTH */
function renderDepth(meta,price,closes,volumes){
  const box=document.getElementById('depthBox');
  if(closes.length<5){box.innerHTML='<p style="color:var(--text3);font-size:11px;text-align:center;padding:16px">Insufficient data</p>';return}
  const step=price*0.001;const bids=[],asks=[];
  for(let i=0;i<5;i++){
    bids.push({px:price-step*(i+1),qty:Math.round((Math.random()*.3+.7)*(volumes[volumes.length-1-i]||100)/(closes.length/5))});
    asks.push({px:price+step*(i+1),qty:Math.round((Math.random()*.3+.7)*(volumes[volumes.length-1-i]||100)/(closes.length/5))});
  }
  const maxQ=Math.max(...bids.map(b=>b.qty),...asks.map(a=>a.qty));
  const tBid=bids.reduce((a,b)=>a+b.qty,0),tAsk=asks.reduce((a,b)=>a+b.qty,0),bp=Math.round(tBid/(tBid+tAsk)*100);
  let h=`<div class="depth-header"><span>BID</span><span>ESTIMATED PRICE</span><span>ASK</span></div>`;
  for(let i=0;i<5;i++){const w=(bids[i].qty/maxQ*100).toFixed(0);h+=`<div class="depth-row bid"><span class="qty">${shortNum(bids[i].qty)}</span><div class="bar-wrap"><div class="bar" style="width:${w}%"></div></div><span class="px">${bids[i].px.toFixed(2)}</span><div class="bar-wrap"></div><span class="qty" style="visibility:hidden">0</span></div>`}
  for(let i=0;i<5;i++){const w=(asks[i].qty/maxQ*100).toFixed(0);h+=`<div class="depth-row ask"><span class="qty" style="visibility:hidden">0</span><div class="bar-wrap"></div><span class="px">${asks[i].px.toFixed(2)}</span><div class="bar-wrap"><div class="bar" style="width:${w}%"></div></div><span class="qty">${shortNum(asks[i].qty)}</span></div>`}
  h+=`<div class="depth-totals"><span class="buy-t">Buy: ${shortNum(tBid)} (${bp}%)</span><span class="sell-t">Sell: ${shortNum(tAsk)} (${100-bp}%)</span></div><div class="depth-ratio"><div class="buy-bar" style="width:${bp}%"></div><div class="sell-bar" style="width:${100-bp}%"></div></div>
      <div style="font-size:9px;color:var(--text3);text-align:center;margin-top:6px;font-style:italic;">*Approximated based on volume distribution</div>`;
  box.innerHTML=h;
}

/* CHART */
function drawChart(ts,opens,highs,lows,closes,volumes,prevClose){
  const canvas=document.getElementById('chartCanvas'),ctx=canvas.getContext('2d');
  const dpr=window.devicePixelRatio||1,cw=canvas.parentElement.clientWidth-28,totalH=280;
  canvas.width=cw*dpr;canvas.height=totalH*dpr;canvas.style.width=cw+'px';canvas.style.height=totalH+'px';
  ctx.scale(dpr,dpr);
  const w=cw,priceH=210,volH=50,volTop=priceH+20,padT=8;
  const data=[];
  for(let i=0;i<ts.length;i++){if(closes[i]!=null&&opens[i]!=null)data.push({o:opens[i],h:highs[i]||closes[i],l:lows[i]||closes[i],c:closes[i],v:volumes[i]||0})}
  if(data.length<2)return;
  const allP=data.flatMap(d=>[d.h,d.l]),minP=Math.min(...allP)*.9995,maxP=Math.max(...allP)*1.0005,rngP=maxP-minP||1;
  const maxV=Math.max(...data.map(d=>d.v))||1;
  const dk=document.documentElement.getAttribute('data-theme')==='dark';
  ctx.clearRect(0,0,w,totalH);
  // Grid
  ctx.strokeStyle=dk?'rgba(255,255,255,.04)':'rgba(0,0,0,.04)';ctx.lineWidth=1;
  for(let i=0;i<=4;i++){const y=padT+(priceH-padT)*(i/4);ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke()}
  // Prev close
  const prevY=padT+(priceH-padT)*(1-(prevClose-minP)/rngP);
  if(prevY>padT&&prevY<priceH){ctx.setLineDash([4,4]);ctx.strokeStyle=dk?'rgba(255,255,255,.12)':'rgba(0,0,0,.1)';ctx.beginPath();ctx.moveTo(0,prevY);ctx.lineTo(w,prevY);ctx.stroke();ctx.setLineDash([])}
  const green=dk?'#00d09c':'#00b386',red=dk?'#ff5252':'#eb4d4b';
  const greenA=dk?'rgba(0,208,156,.3)':'rgba(0,179,134,.2)',redA=dk?'rgba(255,82,82,.3)':'rgba(235,77,75,.2)';
  const toY=v=>padT+(priceH-padT)*(1-(v-minP)/rngP);

  // Pivot Points on Chart (if analyzed)
  if(analysisResult && data.length > 0) {
      // Very basic pivot lines
       ctx.setLineDash([2,2]);
       ctx.lineWidth=1;
       const pivots = [
          {v: prevClose * 1.01, c: '--green', l: 'R1'}, 
          {v: prevClose * 0.99, c: '--red', l: 'S1'}
       ];
       pivots.forEach(p => {
           const y = toY(p.v);
           if(y>padT&&y<priceH) {
              ctx.strokeStyle=dk?getComputedStyle(document.documentElement).getPropertyValue(p.c):getComputedStyle(document.documentElement).getPropertyValue(p.c);
              ctx.globalAlpha=0.2;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();
              ctx.globalAlpha=1;
           }
       });
       ctx.setLineDash([]);
  }

  // Position lines on chart
  const positions=Positions.getForSymbol(currentSymbol);
  positions.forEach(p=>{
    [['sl',p.trailSL,'--red'],['entry',p.entry,'--accent'],['target1',p.target1,'--green'],['target2',p.target2,'--green'],['target3',p.target3,'--green']].forEach(([label,val,color])=>{
      const y=toY(val);if(y>padT&&y<priceH){
        ctx.setLineDash(label==='entry'?[]:[5,3]);ctx.strokeStyle=dk?getComputedStyle(document.documentElement).getPropertyValue(color):getComputedStyle(document.documentElement).getPropertyValue(color);
        ctx.lineWidth=1;ctx.globalAlpha=0.6;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();ctx.globalAlpha=1;ctx.setLineDash([]);
        ctx.fillStyle=ctx.strokeStyle;ctx.font='9px Inter';ctx.fillText(label.toUpperCase()+' '+val.toFixed(1),3,y-3);
      }
    });
  });

  if(chartType==='candle'){
    const cw2=Math.max(1,Math.floor(w/data.length*.7));
    data.forEach((d,i)=>{
      const x=(i/(data.length-1))*w,oY=toY(d.o),cY=toY(d.c),hY=toY(d.h),lY=toY(d.l),isUp=d.c>=d.o;
      ctx.strokeStyle=isUp?green:red;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x,hY);ctx.lineTo(x,lY);ctx.stroke();
      const bt=Math.min(oY,cY),bh=Math.max(1,Math.abs(cY-oY));
      if(isUp){ctx.fillStyle=dk?'#0f1117':'#fff';ctx.strokeStyle=green;ctx.strokeRect(x-cw2/2,bt,cw2,bh);ctx.fillRect(x-cw2/2+.5,bt+.5,cw2-1,bh-1)}
      else{ctx.fillStyle=red;ctx.fillRect(x-cw2/2,bt,cw2,bh)}
    });
  }else{
    const last=data[data.length-1].c,isUp=last>=prevClose,lc=isUp?green:red;
    ctx.beginPath();data.forEach((d,i)=>{const x=(i/(data.length-1))*w,y=toY(d.c);i===0?ctx.moveTo(x,y):ctx.lineTo(x,y)});
    ctx.strokeStyle=lc;ctx.lineWidth=1.5;ctx.lineJoin='round';ctx.stroke();
    ctx.lineTo(w,priceH);ctx.lineTo(0,priceH);ctx.closePath();
    const gr=ctx.createLinearGradient(0,0,0,priceH);gr.addColorStop(0,isUp?greenA:redA);gr.addColorStop(1,'transparent');ctx.fillStyle=gr;ctx.fill();
  }
  // Volume
  data.forEach((d,i)=>{const x=(i/(data.length-1))*w,bw=Math.max(1,w/data.length*.6),bh=(d.v/maxV)*volH;ctx.fillStyle=d.c>=d.o?greenA:redA;ctx.fillRect(x-bw/2,volTop+volH-bh,bw,bh)});
  // Y labels
  ctx.fillStyle=dk?'rgba(255,255,255,.3)':'rgba(0,0,0,.3)';ctx.font='9px Inter';ctx.textAlign='left';
  for(let i=0;i<=4;i++){const v=minP+(rngP*(4-i)/4);ctx.fillText(v.toFixed(1),2,padT+(priceH-padT)*(i/4)-2)}
}

/* CHART CONTROLS */
document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('.range-tab').forEach(t=>{t.addEventListener('click',function(){
    document.querySelectorAll('.range-tab').forEach(b=>b.classList.remove('active'));this.classList.add('active');
    if(refreshTimer)clearInterval(refreshTimer);
    if(this.dataset.range==='1d') {
        fetchContextData(currentSymbol);
        refreshTimer=setInterval(()=>fetchContextData(currentSymbol,true),60000);
    } else {
        fetchRawData(currentSymbol,this.dataset.range,this.dataset.interval);
    }
  })});
  document.querySelectorAll('.ct-btn').forEach(b=>{b.addEventListener('click',function(){
    document.querySelectorAll('.ct-btn').forEach(x=>x.classList.remove('active'));this.classList.add('active');
    chartType=this.dataset.type;if(rawData)renderAll(rawData,true);
  })});
});
window.addEventListener('resize',()=>{if(rawData&&document.getElementById('stockView').style.display!=='none')renderAll(rawData,true)});

/* HELPERS */
function fmt(v){return'\u20B9'+Number(v).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2})}
function shortNum(n){if(n>=1e7)return(n/1e7).toFixed(2)+'Cr';if(n>=1e5)return(n/1e5).toFixed(2)+'L';if(n>=1e3)return(n/1e3).toFixed(1)+'K';return n.toString()}
function show(id){document.getElementById(id).style.display='block'}
function hide(...ids){ids.forEach(id=>document.getElementById(id).style.display='none')}
