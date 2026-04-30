import "./globals.css";

export const metadata = {
  title: "StockPulse — AI-Powered Stock Analysis & Trading Signals",
  description:
    "Professional-grade stock analysis with real-time signals, TradingView-style technical gauges, AI-powered insights, and institutional-grade tools. Track NSE stocks with 85%+ signal confidence.",
  keywords: "stock analysis, trading signals, NSE, NIFTY 50, technical analysis, AI trading, candlestick charts",
  openGraph: {
    title: "StockPulse — AI-Powered Stock Analysis & Trading Signals",
    description:
      "Track. Analyze. Trade Smarter. Join thousands of traders using institutional-grade analysis tools.",
    type: "website",
    locale: "en_IN",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="theme-color" content="#0A0F1C" />
      </head>
      <body>{children}</body>
    </html>
  );
}
