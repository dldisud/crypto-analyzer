import React from 'react';
import { PriceDataPoint, AnalysisResult } from '../types';

interface PriceChartProps {
    data: PriceDataPoint[];
    analysis: AnalysisResult | null;
}

const PriceChart: React.FC<PriceChartProps> = ({ data, analysis }) => {
    if (!data || data.length === 0) return null;

    const width = 500;
    const height = 280;
    const padding = 50;
    const yPaddingTop = 20;

    const prices = data.map(p => p.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice === 0 ? 1 : maxPrice - minPrice;

    const getX = (index: number) => padding + (index / (data.length - 1)) * (width - padding * 2);
    const getY = (price: number) => (height - padding - yPaddingTop) - ((price - minPrice) / priceRange) * (height - padding - yPaddingTop) + yPaddingTop;

    const path = data.map((point, i) => {
        const x = getX(i);
        const y = getY(point.price);
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
    }).join(' ');

    const lastPoint = data[data.length - 1];
    const lastPointY = getY(lastPoint.price);
    
    const stopLossY = analysis?.stop_loss_price && analysis.stop_loss_price >= minPrice && analysis.stop_loss_price <= maxPrice ? getY(analysis.stop_loss_price) : null;
    const takeProfitY = analysis?.take_profit_price && analysis.take_profit_price >= minPrice && analysis.take_profit_price <= maxPrice ? getY(analysis.take_profit_price) : null;

    const formatPriceLabel = (price: number) => {
        if (price < 1) return `$${price.toFixed(4)}`;
        if (price < 100) return `$${price.toFixed(2)}`;
        return `$${Math.round(price).toLocaleString()}`;
    }

    return (
        <div className="w-full h-auto mb-6">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" aria-labelledby="chart-title" role="img">
                <title id="chart-title">30-Day Price Chart</title>
                {/* Y-Axis labels */}
                <text x={padding - 10} y={getY(maxPrice) + 4} textAnchor="end" className="text-xs fill-current text-gray-400">{formatPriceLabel(maxPrice)}</text>
                <text x={padding - 10} y={getY(minPrice) + 4} textAnchor="end" className="text-xs fill-current text-gray-400">{formatPriceLabel(minPrice)}</text>
                {/* X-Axis labels */}
                <text x={padding} y={height - padding / 2} className="text-xs fill-current text-gray-400">30 days ago</text>
                <text x={width - padding} y={height - padding / 2} textAnchor="end" className="text-xs fill-current text-gray-400">Today</text>

                {/* Grid Lines */}
                <line x1={padding} y1={getY(maxPrice)} x2={width - padding} y2={getY(maxPrice)} className="stroke-gray-700" strokeWidth="0.5" />
                <line x1={padding} y1={getY(minPrice)} x2={width - padding} y2={getY(minPrice)} className="stroke-gray-700" strokeWidth="0.5" />
                <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} className="stroke-gray-600" strokeWidth="1" />

                {/* Price path */}
                <path d={path} className="stroke-cyan-400" fill="none" strokeWidth="2" />

                 {/* Stop Loss Line */}
                 {stopLossY && (
                    <>
                        <line x1={padding} y1={stopLossY} x2={width - padding} y2={stopLossY} className="stroke-red-500" strokeWidth="1" strokeDasharray="3,3" />
                        <text x={width - padding + 5} y={stopLossY + 4} className="text-xs fill-current text-red-400">손절</text>
                    </>
                )}

                {/* Take Profit Line */}
                {takeProfitY && (
                     <>
                        <line x1={padding} y1={takeProfitY} x2={width - padding} y2={takeProfitY} className="stroke-green-500" strokeWidth="1" strokeDasharray="3,3" />
                        <text x={width - padding + 5} y={takeProfitY + 4} className="text-xs fill-current text-green-400">익절</text>
                    </>
                )}

                {/* Last price indicator */}
                <circle cx={getX(data.length - 1)} cy={lastPointY} r="4" className="fill-current text-cyan-300 stroke-2 stroke-gray-900" />
                <text x={width - padding + 5} y={lastPointY + 4} className="text-xs font-bold fill-current text-white">{formatPriceLabel(lastPoint.price)}</text>

            </svg>
        </div>
    );
};

export default PriceChart;
