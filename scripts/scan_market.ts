
import axios from 'axios';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'stocks.json');

// Interface for Stock Data
interface Stock {
    symbol: string;
    description: string;
    close: number;
    change: number;
    change_abs: number;
    volume: number;
    market_cap_basic: number;
    price_earnings_ttm: number;
    earnings_per_share_diluted_ttm: number;
    return_on_equity_fq: number;
    debt_to_equity_fq: number;
    sector: string;
    exchange: string;
}

// 🕒 Helper: Check if Indian Market (NSE/BSE) is open
// Market Hours: 09:15 to 15:30 IST, Mon-Fri
function isIndianMarketOpen(): boolean {
    const now = new Date();

    // Convert to IST
    const istOffset = 5.5 * 60 * 60 * 1000;
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const istDate = new Date(utc + istOffset);

    const day = istDate.getDay();
    const hours = istDate.getHours();
    const minutes = istDate.getMinutes();

    // 1. Check Weekend (0 = Sun, 6 = Sat)
    if (day === 0 || day === 6) {
        return false;
    }

    // 2. Check Time (09:15 - 15:30)
    const currentTime = hours * 60 + minutes; // Minutes from midnight
    const marketOpen = 9 * 60 + 15;  // 09:15
    const marketClose = 15 * 60 + 30; // 15:30

    return currentTime >= marketOpen && currentTime <= marketClose;
}

async function fetchStocks(exchange: 'NSE' | 'BSE'): Promise<Stock[]> {
    console.log(`📡 Fetching ${exchange} data...`);
    try {
        const response = await axios.post('https://scanner.tradingview.com/india/scan', {
            filter: [
                { left: "exchange", operation: "equal", right: exchange },
                { left: "typespecs", operation: "has_none_of", right: ["bonds", "futures", "options"] }
            ],
            options: { lang: "en" },
            symbols: { query: { types: [] }, tickers: [] },
            columns: [
                "name", "description", "close", "change", "change_abs", "volume",
                "market_cap_basic", "price_earnings_ttm", "earnings_per_share_diluted_ttm",
                "return_on_equity_fq", "debt_to_equity_fq", "sector", "exchange"
            ],
            sort: { sortBy: "market_cap_basic", sortOrder: "desc" },
            range: [0, 8000]
        }, {
            headers: { 'Content-Type': 'application/json' }
        });

        const data = response.data.data;
        if (!data || !Array.isArray(data)) return [];

        return data.map((item: any) => ({
            symbol: item.d[0],
            description: item.d[1],
            close: item.d[2],
            change: item.d[3],
            change_abs: item.d[4],
            volume: item.d[5],
            market_cap_basic: item.d[6],
            price_earnings_ttm: item.d[7],
            earnings_per_share_diluted_ttm: item.d[8],
            return_on_equity_fq: item.d[9],
            debt_to_equity_fq: item.d[10],
            sector: item.d[11],
            exchange: item.d[12]
        }));

    } catch (error) {
        console.error(`❌ Error fetching ${exchange}:`, error instanceof Error ? error.message : error);
        return [];
    }
}

async function scanMarket() {
    // 🛠️ Check Market Hours
    // NOTE: Commen this check out if testing continuously outside hours!
    if (!isIndianMarketOpen()) {
        const now = new Date();
        const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
        console.log(`💤 Market Closed [${istTime.toISOString().slice(11, 19)} IST]. Sleeping...`);
        return;
    }

    console.log(`\n🔄 Starting Scan at ${new Date().toLocaleTimeString()}...`);
    const nseStocks = await fetchStocks('NSE');
    const bseStocks = await fetchStocks('BSE');

    const allStocks = [...nseStocks, ...bseStocks];
    if (allStocks.length > 0) {
        fs.writeFileSync(DATA_FILE, JSON.stringify(allStocks, null, 2));
        console.log(`✅ Updated ${allStocks.length} stocks in ${DATA_FILE}`);
    } else {
        console.log("⚠️ No data fetched. Skipping update.");
    }
}

async function main() {
    if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    console.log("🚀 Market Scanner Started!");
    console.log("   - Rate: Every 60 seconds");
    console.log("   - Hours: 09:15 - 15:30 IST (Mon-Fri)");

    // Run immediately on start
    await scanMarket();

    // In CI/GitHub Actions, run once and exit
    if (process.env.CI) {
        console.log("🤖 CI Environment detected. Run complete.");
        process.exit(0);
    }

    // Loop every 60 seconds (Local Mode)
    setInterval(scanMarket, 60 * 1000);
}

main();
