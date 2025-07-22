
export interface Coin {
    id: string;
    name: string;
}

export const MOCK_COINS: Coin[] = [
    { id: 'bitcoin', name: 'Bitcoin' },
    { id: 'ethereum', name: 'Ethereum' },
    { id: 'dogecoin', name: 'Dogecoin' },
    { id: 'solana', name: 'Solana' },
    { id: 'ripple', name: 'Ripple' },
];

export interface PriceDataPoint {
    date: string; // YYYY-MM-DD
    price: number;
}

export enum Signal {
    BUY = 'BUY',
    SELL = 'SELL',
    HOLD = 'HOLD',
}

export interface AnalysisResult {
    signal: Signal;
    confidence_score: number;
    reasoning: string;
    short_term_prediction: string;
    stop_loss_price?: number;
    take_profit_price?: number;
    suggested_trade_percentage?: number; // 0.0 to 1.0
}
