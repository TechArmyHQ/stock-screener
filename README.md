# 🚀 Local Stock Screener

A privacy-focused, real-time stock screener for Indian Markets (NSE/BSE). This application runs entirely on your local machine or Vercel, fetching data directly from TradingView without needing a complex backend server.

![Stock Screener UI](https://github.com/TechArmyHQ/stock-screener/assets/placeholder.png)

## ✨ Key Features

*   **Real-Time Data**: Fetches fresh market data for 7,000+ stocks every 60 seconds.
*   **Dynamic Filtering**: Instantly search and filter by Price, P/E, Market Cap, Volume, EPS, and more.
*   **Smart Alerts**: Set custom criteria (e.g., "P/E < 20 and Change > 5%") and get **Browser Notifications** when stocks match.
*   **Zero-Server Architecture**: Data is stored in a simple JSON file committed to the repo, acting as a lightweight database.
*   **Automated Updates**: A GitHub Action runs every 5 minutes during market hours to keep data fresh without manual intervention.

## 🛠️ Tech Stack

*   **Frontend**: Next.js 15 (React 19)
*   **Styling**: Tailwind CSS v4 (Dark/Light Mode)
*   **Data Processing**: TypeScript Node.js Scripts
*   **CI/CD**: GitHub Actions (Cron Jobs)

## 🚀 Getting Started

### Option 1: Run Locally (Recommended for dev)

1.  **Clone the repo**
    ```bash
    git clone https://github.com/TechArmyHQ/stock-screener.git
    cd stock-screener
    npm install
    ```

2.  **Start the Data Scanner**
    This script runs in the background and updates `data/stocks.json`.
    ```bash
    npm run scan
    ```

3.  **Start the App**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000).

### Option 2: Deploy to Vercel (Free Cloud Hosting)

1.  Fork/Clone this repo.
2.  Import it into [Vercel](https://vercel.com).
3.  The **GitHub Action** is already configured to update data every 5 minutes (Mon-Fri, 09:15-15:30 IST).
4.  Every time the action runs, Vercel will automatically redeploy with the fresh data!

## 📜 License
MIT
