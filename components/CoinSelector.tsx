
import React from 'react';
import { MOCK_COINS, Coin } from '../types';

interface CoinSelectorProps {
    selectedCoin: Coin;
    onSelectCoin: (coin: Coin) => void;
    disabled?: boolean;
}

const CoinSelector: React.FC<CoinSelectorProps> = ({ selectedCoin, onSelectCoin, disabled = false }) => {
    
    const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const coinId = event.target.value;
        const newSelectedCoin = MOCK_COINS.find(c => c.id === coinId);
        if (newSelectedCoin) {
            onSelectCoin(newSelectedCoin);
        }
    };
    
    return (
        <div className="relative w-full">
            <select
                id="coin-selector"
                value={selectedCoin.id}
                onChange={handleSelectChange}
                disabled={disabled}
                className="w-full appearance-none bg-gray-700 border-2 border-gray-600 text-white text-lg rounded-lg py-3 px-4 leading-tight focus:outline-none focus:bg-gray-600 focus:border-cyan-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Select a cryptocurrency"
            >
                {MOCK_COINS.map((coin) => (
                    <option key={coin.id} value={coin.id}>
                        {coin.name}
                    </option>
                ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <svg className="fill-current h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
            </div>
        </div>
    );
};

export default CoinSelector;
