
'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { Stock } from './types';
import StockTable from './components/StockTable';
import FilterPanel, { FilterConfig } from './components/FilterPanel';

const DEFAULT_FILTERS: FilterConfig = {
  search: '',
  minPE: '', maxPE: '',
  minPrice: '', maxPrice: '',
  minCap: '', minVolume: '',
  minChange: '', maxChange: '',
  minEPS: '',
  minROE: '',
  maxDebtToEquity: ''
};

// Cross-platform notification helper
// Uses Service Worker on mobile (Android Chrome) and falls back to new Notification() on desktop
const showNotification = async (title: string, body: string) => {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  try {
    // Try Service Worker method first (required for Android Chrome)
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, { body, icon: '/icon-192.png' });
    } else {
      // Fallback to direct Notification (works on desktop)
      new Notification(title, { body });
    }
  } catch (error) {
    console.error('Notification error:', error);
    // Final fallback
    try {
      new Notification(title, { body });
    } catch (e) {
      console.error('Fallback notification also failed:', e);
    }
  }
};

const applyFilters = (stockList: Stock[], filters: FilterConfig) => {
  return stockList.filter(stock => {
    if (filters.search && !stock.symbol.toLowerCase().includes(filters.search.toLowerCase()) &&
      !stock.description.toLowerCase().includes(filters.search.toLowerCase())) return false;

    // Valuation
    if (filters.minPE && stock.price_earnings_ttm < parseFloat(filters.minPE)) return false;
    if (filters.maxPE && stock.price_earnings_ttm > parseFloat(filters.maxPE)) return false;
    if (filters.minEPS && stock.earnings_per_share_diluted_ttm < parseFloat(filters.minEPS)) return false;

    // Price & Volume
    if (filters.minPrice && stock.close < parseFloat(filters.minPrice)) return false;
    if (filters.maxPrice && stock.close > parseFloat(filters.maxPrice)) return false;
    if (filters.minCap && stock.market_cap_basic < parseFloat(filters.minCap)) return false;
    if (filters.minVolume && stock.volume < parseFloat(filters.minVolume)) return false;

    // Health & Returns
    if (filters.maxDebtToEquity && stock.debt_to_equity_fq > parseFloat(filters.maxDebtToEquity)) return false;
    if (filters.minROE && stock.return_on_equity_fq < parseFloat(filters.minROE)) return false;

    // Momentum
    if (filters.minChange && stock.change < parseFloat(filters.minChange)) return false;
    if (filters.maxChange && stock.change > parseFloat(filters.maxChange)) return false;

    return true;
  });
};

export default function Home() {
  // Data State
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Filter State
  const [viewFilters, setViewFilters] = useState<FilterConfig>(DEFAULT_FILTERS);
  const [alertFilters, setAlertFilters] = useState<FilterConfig>(DEFAULT_FILTERS);
  const [isAlertsActive, setIsAlertsActive] = useState(false);

  // Pagination & Theme
  const [displayCount, setDisplayCount] = useState(50);
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to Dark

  // Refs
  const prevAlertStockSymbols = useRef<Set<string>>(new Set());
  const isFirstLoad = useRef(true);
  const alertFiltersRef = useRef(DEFAULT_FILTERS);
  const isAlertsActiveRef = useRef(false);

  // Apply Filters Logic
  const filteredStocks = useMemo(() => {
    return stocks.filter(stock => {
      const f = viewFilters;
      if (f.search && !stock.symbol.toLowerCase().includes(f.search.toLowerCase()) &&
        !stock.description.toLowerCase().includes(f.search.toLowerCase())) return false;

      // Valuation
      if (f.minPE && stock.price_earnings_ttm < parseFloat(f.minPE)) return false;
      if (f.maxPE && stock.price_earnings_ttm > parseFloat(f.maxPE)) return false;
      if (f.minEPS && stock.earnings_per_share_diluted_ttm < parseFloat(f.minEPS)) return false;

      // Price & Volume
      if (f.minPrice && stock.close < parseFloat(f.minPrice)) return false;
      if (f.maxPrice && stock.close > parseFloat(f.maxPrice)) return false;
      if (f.minCap && stock.market_cap_basic < parseFloat(f.minCap)) return false;
      if (f.minVolume && stock.volume < parseFloat(f.minVolume)) return false;

      // Health & Returns
      if (f.maxDebtToEquity && stock.debt_to_equity_fq > parseFloat(f.maxDebtToEquity)) return false;
      if (f.minROE && stock.return_on_equity_fq < parseFloat(f.minROE)) return false;

      // Momentum
      if (f.minChange && stock.change < parseFloat(f.minChange)) return false;
      if (f.maxChange && stock.change > parseFloat(f.maxChange)) return false;

      return true;
    });
  }, [stocks, viewFilters]);

  // Reset pagination
  useEffect(() => {
    setDisplayCount(50);
  }, [viewFilters]);

  // Initial Load & Polling
  useEffect(() => {
    // Register Service Worker (required for mobile notifications)
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(err => {
        console.error('Service Worker registration failed:', err);
      });
    }

    const savedAlerts = localStorage.getItem('alertFilters');
    if (savedAlerts) {
      const parsed = JSON.parse(savedAlerts);
      setAlertFilters(parsed);
      setIsAlertsActive(true);
      setViewFilters(parsed);
    }

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') setIsDarkMode(false);

    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  // Sync Refs
  useEffect(() => {
    alertFiltersRef.current = alertFilters;
    isAlertsActiveRef.current = isAlertsActive;
  }, [alertFilters, isAlertsActive]);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/stocks');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      const newStockList: Stock[] = data.data;

      setStocks(newStockList);
      setLastUpdated(new Date().toLocaleTimeString());
      setLoading(false);

      if (isAlertsActiveRef.current) {
        // Re-calculate matches for notification diffing
        // We must use a fresh filter logic here distinct from UI memoization
        const activeFilters = alertFiltersRef.current;
        const matches = newStockList.filter(stock => {
          const f = activeFilters;
          if (f.search && !stock.symbol.toLowerCase().includes(f.search.toLowerCase())) return false;
          if (f.minPE && stock.price_earnings_ttm < parseFloat(f.minPE)) return false;
          if (f.maxPE && stock.price_earnings_ttm > parseFloat(f.maxPE)) return false;
          if (f.minEPS && stock.earnings_per_share_diluted_ttm < parseFloat(f.minEPS)) return false;
          if (f.minPrice && stock.close < parseFloat(f.minPrice)) return false;
          if (f.maxPrice && stock.close > parseFloat(f.maxPrice)) return false;
          if (f.minCap && stock.market_cap_basic < parseFloat(f.minCap)) return false;
          if (f.minVolume && stock.volume < parseFloat(f.minVolume)) return false;
          if (f.maxDebtToEquity && stock.debt_to_equity_fq > parseFloat(f.maxDebtToEquity)) return false;
          if (f.minROE && stock.return_on_equity_fq < parseFloat(f.minROE)) return false;
          if (f.minChange && stock.change < parseFloat(f.minChange)) return false;
          if (f.maxChange && stock.change > parseFloat(f.maxChange)) return false;
          return true;
        });

        const currentSymbols = new Set(matches.map(s => s.symbol));

        if (!isFirstLoad.current) {
          const prevSymbols = prevAlertStockSymbols.current;
          const added = [...currentSymbols].filter(x => !prevSymbols.has(x));
          const removed = [...prevSymbols].filter(x => !currentSymbols.has(x));

          if (added.length > 0 || removed.length > 0) {
            const msg = `Alert: ${added.length} added, ${removed.length} removed from your watchlist.`;
            showNotification("Market Scanner Update", msg);
          }
        }

        prevAlertStockSymbols.current = currentSymbols;
        isFirstLoad.current = false;
      }

    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  // Handlers
  const handleSetAlerts = async () => {
    // Request permission on user gesture (required for mobile)
    if ('Notification' in window && Notification.permission !== 'granted') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        alert("Please enable notifications to use alerts! Check your browser settings.");
        return;
      }
    }

    // 1. Calculate New Watchlist
    const newMatches = filteredStocks;
    const newSymbols = new Set(newMatches.map(s => s.symbol));

    // 2. Compare with Old Watchlist (if alerts were already active)
    if (isAlertsActive) {
      const oldSymbols = prevAlertStockSymbols.current;
      const added = [...newSymbols].filter(x => !oldSymbols.has(x));
      const removed = [...oldSymbols].filter(x => !newSymbols.has(x));

      const msg = `Rules Updated: ${added.length} added, ${removed.length} removed from watchlist.`;
      showNotification("Stock Screener", msg);
    } else {
      const msg = `Alerts Enabled! Now tracking ${newMatches.length} stocks.`;
      showNotification("Stock Screener", msg);
    }

    // 3. Update State & Persistence
    setAlertFilters(viewFilters);
    setIsAlertsActive(true);
    localStorage.setItem('alertFilters', JSON.stringify(viewFilters));

    // 4. Update Reference for next poll
    prevAlertStockSymbols.current = newSymbols;
    isFirstLoad.current = false;
  };

  const handleStopAlerts = () => {
    setIsAlertsActive(false);
    alert("Alerts Stopped.");
  };

  const handleResetFilters = () => {
    setViewFilters(DEFAULT_FILTERS);
  };

  const handleLoadWatchlist = () => {
    setViewFilters(alertFilters);
  };

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
  };

  const testNotification = async () => {
    if (!('Notification' in window)) {
      alert("This browser does not support notifications.");
      return;
    }

    if (Notification.permission === "granted") {
      showNotification("Test Notification", "This is how alerts will look!");
    } else if (Notification.permission === "denied") {
      alert("Notifications are blocked. Please enable them in your browser settings.");
    } else {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        showNotification("Test Notification", "This is how alerts will look!");
      } else {
        alert("Permission denied. You can enable notifications in browser settings.");
      }
    }
  };

  const visibleStocks = filteredStocks.slice(0, displayCount);

  const watchlistCount = isAlertsActive ? applyFilters(stocks, alertFilters).length : 0;

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans transition-colors duration-300">
        {/* Header */}
        <header className="bg-white dark:bg-[#161b22] border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 sticky top-0 z-50 transition-colors">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/30">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">Stock Screener</h1>
              <p className="text-xs text-gray-500 font-medium">Serverless • Local Edition</p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap justify-center">
            <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition">
              {isDarkMode ? '☀️' : '🌙'}
            </button>

            <button onClick={testNotification} className="text-xs font-semibold text-gray-500 hover:text-blue-500 underline decoration-dotted underline-offset-4">
              Test Alert
            </button>

            {isAlertsActive && (
              <button onClick={handleStopAlerts} className="px-4 py-2 border border-red-500/30 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded text-xs font-semibold uppercase tracking-wider transition">
                Stop Alerts
              </button>
            )}



            <button
              onClick={handleLoadWatchlist}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg shadow-blue-600/20 transition flex items-center gap-2"
            >
              <span>Watchlist: {watchlistCount}</span>
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6 max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Sidebar */}
          <aside className="lg:col-span-3 space-y-6">
            {isAlertsActive && (
              <div className="bg-white dark:bg-[#161b22] rounded-xl border border-blue-200 dark:border-blue-900/30 p-5 shadow-sm transition-colors relative overflow-hidden mb-6">
                <div className="absolute top-0 right-0 p-2 opacity-10">
                  <svg className="w-16 h-16 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" /></svg>
                </div>
                <h3 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase mb-3 flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                  </span>
                  Active Monitoring Rules
                </h3>
                <div className="space-y-1">
                  {Object.entries(alertFilters).map(([key, value]) => {
                    if (!value) return null;
                    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                    return (
                      <div key={key} className="flex justify-between text-xs border-b border-gray-100 dark:border-gray-800/50 last:border-0 py-1">
                        <span className="text-gray-500 dark:text-gray-400">{label}</span>
                        <span className="font-mono font-medium text-gray-900 dark:text-white">{value}</span>
                      </div>
                    );
                  })}
                  {Object.values(alertFilters).every(x => x === '') && (
                    <p className="text-xs text-gray-400 italic">No specific filters (Catch-all)</p>
                  )}
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-[#161b22] rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm transition-colors">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Filters</h3>
                <button
                  onClick={handleResetFilters}
                  className="text-xs text-blue-500 hover:text-blue-600 font-medium hover:underline"
                >
                  Reset
                </button>
              </div>
              <FilterPanel filters={viewFilters} onFilterChange={setViewFilters} />

              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={handleSetAlerts}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm shadow-md transition-all flex justify-center items-center gap-2"
                >
                  {isAlertsActive ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                      Update Alerts
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      Enable Alerts
                    </>
                  )}
                </button>
                {isAlertsActive && (
                  <p className="text-center text-xs text-green-600 dark:text-green-400 mt-2 font-medium animate-pulse">
                    ● Monitoring Active
                  </p>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-[#161b22] rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm transition-colors">
              <h3 className="text-xs font-bold text-gray-500 uppercase mb-2">System Status</h3>
              <div className="flex justify-between text-sm mb-1">
                <span>Last Scanned</span>
                <span className="text-gray-900 dark:text-white font-medium">{lastUpdated || '-'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total Stocks</span>
                <span className="text-gray-900 dark:text-white font-medium">{stocks.length}</span>
              </div>
            </div>


          </aside>

          {/* Content */}
          <section className="lg:col-span-9 space-y-4">
            <div className="flex justify-between items-end px-2">
              <h2 className="text-gray-500 dark:text-gray-400 font-medium">
                Found <span className="text-gray-900 dark:text-white font-bold">{filteredStocks.length}</span> matches
                {filteredStocks.length > displayCount && <span className="text-xs ml-2">(Showing top {displayCount})</span>}
              </h2>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64 text-gray-500 animate-pulse">Loading...</div>
            ) : (
              <div className="bg-white dark:bg-[#161b22] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm min-h-[500px] transition-colors">
                <StockTable stocks={visibleStocks} />

                {filteredStocks.length > displayCount && (
                  <div className="p-4 flex justify-center border-t border-gray-200 dark:border-gray-800">
                    <button
                      onClick={() => setDisplayCount(prev => prev + 50)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-500 text-sm font-semibold"
                    >
                      Load More Stocks
                    </button>
                  </div>
                )}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
