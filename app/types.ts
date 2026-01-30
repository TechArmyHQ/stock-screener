
export interface Stock {
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
