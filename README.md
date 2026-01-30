# 📈 Stock Screener - https://stock-screener-sooty-xi.vercel.app/

A real-time stock screening tool for Indian markets (NSE/BSE) with browser notifications. Built with Next.js, deployed on Vercel, with automated data updates via GitHub Actions.

![Stock Screener](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?logo=typescript)
![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)

## ✨ Features

- **7,300+ Stocks** — Full NSE + BSE coverage
- **Advanced Filters** — P/E, Price, Market Cap, Volume, ROE, Debt/Equity, EPS, and more
- **Real-Time Alerts** — Browser notifications when stocks enter/exit your criteria
- **Dark/Light Mode** — Toggle theme with one click
- **Mobile PWA** — Install as an app on Android & iOS
- **Auto-Updates** — Data refreshes every 5 minutes during market hours

## 📱 Mobile Installation

### Android (Chrome)
1. Open the app in Chrome
2. Tap **"Add to Home Screen"** from the browser menu
3. Open from your home screen
4. Tap **"Test Alert"** and allow notifications

### iOS (Safari)
> ⚠️ iOS only supports notifications when installed as a PWA

1. Open the app in **Safari** (not Chrome)
2. Tap the **Share button** (box with arrow)
3. Select **"Add to Home Screen"**
4. Open the app from your home screen
5. Now notifications will work!

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 16, React 19, TypeScript |
| **Styling** | Tailwind CSS v4 |
| **Data Source** | TradingView Scanner API |
| **Notifications** | Service Workers + Web Push API |
| **Hosting** | Vercel (Frontend), GitHub Actions (Data Pipeline) |

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                   GitHub Actions                     │
│              (Runs every 5 min M-F)                  │
│                        ↓                             │
│              TradingView Scanner API                 │
│                        ↓                             │
│              data/stocks.json                        │
│                   (committed)                        │
└─────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────┐
│                   Vercel                             │
│                        ↓                             │
│              /api/stocks endpoint                    │
│                        ↓                             │
│              React Frontend (PWA)                    │
│                        ↓                             │
│              Browser Notifications                   │
└─────────────────────────────────────────────────────┘
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Local Development

```bash
# Clone the repository
git clone https://github.com/TechArmyHQ/stock-screener.git
cd stock-screener

# Install dependencies
npm install

# Run the scanner (fetches latest data)
npm run scan

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

No environment variables required for local development. The app uses the TradingView public API.

## 📂 Project Structure

```
stock-screener/
├── app/
│   ├── api/stocks/route.ts    # API endpoint
│   ├── components/            # React components
│   ├── page.tsx               # Main dashboard
│   └── layout.tsx             # Root layout + PWA config
├── data/
│   └── stocks.json            # Stock data (auto-updated)
├── public/
│   ├── sw.js                  # Service Worker
│   ├── manifest.json          # PWA manifest
│   └── icon-*.png             # App icons
├── scripts/
│   └── scan_market.ts         # Market scanner script
└── .github/workflows/
    └── market_scanner.yml     # GitHub Actions workflow
```

## 🔔 How Alerts Work

1. Set your filter criteria (P/E, Price, etc.)
2. Click **"Enable Alerts"** to save your watchlist
3. The app checks for changes every 60 seconds
4. When stocks enter or exit your criteria, you get a notification

> **Note:** Notifications require browser permission. On mobile, you must install the app for notifications to work reliably.

## 📊 Available Filters

| Filter | Description |
|--------|-------------|
| Search | Symbol or company name |
| Min/Max P/E | Price-to-earnings ratio |
| Min/Max Price | Stock price in ₹ |
| Min Market Cap | Market capitalization (in Cr) |
| Min Volume | Trading volume |
| Min/Max Change % | Daily price change |
| Min EPS | Earnings per share |
| Min ROE | Return on equity |
| Max Debt/Equity | Debt-to-equity ratio |

## ⏰ Market Hours

Data is updated every 5 minutes during market hours:
- **Days:** Monday - Friday
- **Time:** 9:15 AM - 3:30 PM IST

Outside market hours, the last available data is displayed.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## ⚠️ Disclaimer

This tool is for informational purposes only. It does not constitute financial advice. Always do your own research before making investment decisions.

---

Made with ❤️ by [TechArmyHQ](https://github.com/TechArmyHQ)
