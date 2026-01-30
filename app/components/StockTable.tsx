
'use client';

import { Stock } from '../types';
import { useState } from 'react';

interface StockTableProps {
    stocks: Stock[];
}

type SortKey = keyof Stock;
type SortDirection = 'asc' | 'desc';

export default function StockTable({ stocks }: StockTableProps) {
    const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: SortDirection } | null>(null);

    const handleSort = (key: SortKey) => {
        let direction: SortDirection = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedStocks = [...stocks].sort((a, b) => {
        if (!sortConfig) return 0;
        const { key, direction } = sortConfig;
        if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
        if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
        return 0;
    });

    const formatCurrency = (val: number) => `₹${val.toFixed(2)}`;
    const formatLargeNumber = (val: number) => {
        if (val === null || val === undefined) return '-';
        if (val >= 10000000) return `${(val / 10000000).toFixed(2)} Cr`;
        if (val >= 100000) return `${(val / 100000).toFixed(2)} L`;
        return val.toLocaleString();
    };

    const getChangeColor = (val: number) => {
        if (val > 0) return 'text-green-500 font-medium';
        if (val < 0) return 'text-red-500 font-medium';
        return 'text-gray-500 dark:text-gray-400';
    };

    // Helper for table headers to reduce boilerplate
    const Th = ({ label, sortKey, align = "left" }: { label: string, sortKey: SortKey, align?: "left" | "right" }) => (
        <th
            className={`px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200 transition select-none text-${align}`}
            onClick={() => handleSort(sortKey)}
        >
            <div className={`flex items-center gap-1 ${align === "right" ? "justify-end" : ""}`}>
                {label}
                {sortConfig?.key === sortKey && (
                    <span className="text-blue-500">{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                )}
            </div>
        </th>
    );

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                <thead className="bg-gray-50 dark:bg-[#1f262e]">
                    <tr>
                        <Th label="Symbol" sortKey="symbol" />
                        <Th label="Price" sortKey="close" />
                        <Th label="Change %" sortKey="change" />
                        <Th label="P/E" sortKey="price_earnings_ttm" align="right" />
                        <Th label="Market Cap" sortKey="market_cap_basic" align="right" />
                        <Th label="ROE %" sortKey="return_on_equity_fq" align="right" />
                        <Th label="D/E" sortKey="debt_to_equity_fq" align="right" />
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-[#161b22]">
                    {sortedStocks.map((stock) => (
                        <tr key={`${stock.symbol}-${stock.exchange}`} className="hover:bg-gray-50 dark:hover:bg-[#1c2128] transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                    <div className="text-sm font-bold text-gray-900 dark:text-white">{stock.symbol}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px]">{stock.description}</div>
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200 font-mono">
                                {formatCurrency(stock.close)}
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${getChangeColor(stock.change)} font-mono`}>
                                {stock.change > 0 ? '+' : ''}{stock.change.toFixed(2)}%
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 text-right font-mono">
                                {stock.price_earnings_ttm ? stock.price_earnings_ttm.toFixed(2) : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 text-right font-mono">
                                {formatLargeNumber(stock.market_cap_basic)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 text-right font-mono">
                                {stock.return_on_equity_fq ? `${stock.return_on_equity_fq.toFixed(2)}%` : '-%'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300 text-right font-mono">
                                {stock.debt_to_equity_fq ? stock.debt_to_equity_fq.toFixed(2) : '-'}
                            </td>
                        </tr>
                    ))}
                    {stocks.length === 0 && (
                        <tr>
                            <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                                No stocks match the current filters.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
