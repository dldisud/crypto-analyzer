import React, { useState, useEffect } from 'react';
import { AnalysisResult, PriceDataPoint } from '../types';

interface AnalysisDisplayProps {
    analysis: AnalysisResult;
    priceData: PriceDataPoint[];
}

const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ analysis, priceData }) => {
    const [displayedReasoning, setDisplayedReasoning] = useState('');
    const [isTyping, setIsTyping] = useState(true);

    const currentPrice = priceData.length > 0 ? priceData[priceData.length - 1].price : 0;

    useEffect(() => {
        if (analysis.reasoning) {
            setIsTyping(true);
            setDisplayedReasoning('');
            let i = 0;
            const timer = setInterval(() => {
                if (i < analysis.reasoning.length) {
                    setDisplayedReasoning(prev => prev + analysis.reasoning[i]);
                    i++;
                } else {
                    clearInterval(timer);
                    setIsTyping(false);
                }
            }, 20); // Adjust typing speed here (lower is faster)

            return () => clearInterval(timer);
        }
    }, [analysis.reasoning]);


    const calculatePercentage = (targetPrice: number) => {
        if (currentPrice === 0) return 0;
        return ((targetPrice - currentPrice) / currentPrice) * 100;
    };

    return (
        <div className="space-y-6 text-gray-300">
            <div>
                <h3 className="font-semibold text-lg text-cyan-300 mb-2">AI의 분석 요약</h3>
                <p className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 text-sm leading-relaxed min-h-[100px]">
                    {displayedReasoning}
                    {isTyping && <span className="inline-block w-2 h-4 bg-cyan-400 ml-1 animate-pulse" />}
                </p>
            </div>
             
             {!isTyping && analysis.confidence_score !== undefined && (
                <div className="animate-fade-in">
                    <h3 className="font-semibold text-lg text-cyan-300 mb-2">신뢰도 점수</h3>
                    <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
                        <div className="bg-gradient-to-r from-cyan-500 to-blue-500 h-4 rounded-full transition-all duration-1000 ease-out" style={{ width: `${analysis.confidence_score * 100}%` }}></div>
                    </div>
                     <p className="text-right text-sm mt-1 font-mono">{ (analysis.confidence_score * 100).toFixed(1) }%</p>
                </div>
            )}
            
            {!isTyping && (analysis.take_profit_price || analysis.stop_loss_price) && currentPrice > 0 && (
                <div className="animate-fade-in">
                     <h3 className="font-semibold text-lg text-cyan-300 mb-2">추천 가격 (BUY 신호 시)</h3>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {analysis.take_profit_price && (
                             <div className="bg-green-900/30 border border-green-600/50 p-4 rounded-lg">
                                 <div className="flex justify-between items-baseline">
                                     <p className="text-sm text-green-300">이익 실현가</p>
                                     <p className="text-sm font-semibold text-green-400">
                                        +{calculatePercentage(analysis.take_profit_price).toFixed(2)}%
                                     </p>
                                 </div>
                                 <p className="text-xl font-bold text-white">${analysis.take_profit_price.toFixed(2)}</p>
                             </div>
                        )}
                         {analysis.stop_loss_price && (
                             <div className="bg-red-900/30 border border-red-600/50 p-4 rounded-lg">
                                  <div className="flex justify-between items-baseline">
                                     <p className="text-sm text-red-300">손절가</p>
                                      <p className="text-sm font-semibold text-red-400">
                                        {calculatePercentage(analysis.stop_loss_price).toFixed(2)}%
                                     </p>
                                 </div>
                                 <p className="text-xl font-bold text-white">${analysis.stop_loss_price.toFixed(2)}</p>
                             </div>
                        )}
                     </div>
                </div>
            )}
        </div>
    );
};

export default AnalysisDisplay;
