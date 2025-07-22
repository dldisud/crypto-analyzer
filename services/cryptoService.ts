import { PriceDataPoint } from '../types';

// Fetches real crypto data for the last 30 days from CoinGecko API
export const fetchRealCryptoData = async (coinId: string): Promise<PriceDataPoint[]> => {
    const url = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=30&interval=daily`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch crypto data from CoinGecko: ${response.statusText}`);
        }
        const data = await response.json();

        if (!data.prices || !Array.isArray(data.prices)) {
            throw new Error('Invalid data format received from CoinGecko API');
        }

        const formattedData: PriceDataPoint[] = data.prices.map((pricePoint: [number, number]) => {
            const [timestamp, price] = pricePoint;
            const date = new Date(timestamp);
            return {
                date: date.toISOString().split('T')[0], // 'YYYY-MM-DD'
                price: parseFloat(price.toFixed(4)),
            };
        });
        
        // The API might return 31 data points for 30 days, we'll take the most recent 30.
        return formattedData.slice(-30);
    } catch (error) {
        console.error("Error fetching real crypto data:", error);
        throw error;
    }
};