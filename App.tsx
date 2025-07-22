import React, { useState, useCallback } from 'react';
import { PriceDataPoint, AnalysisResult, Signal, MOCK_COINS, Coin } from './types';
import { fetchRealCryptoData } from './services/cryptoService';
import { fetchTradingAnalysisStream } from './services/geminiService';
import CoinSelector from './components/CoinSelector';
import PriceChart from './components/PriceChart';
import AnalysisDisplay from './components/AnalysisDisplay';
import { LogoIcon } from './components/icons/LogoIcon';

const App: React.FC = () => {
    const [selectedCoin, setSelectedCoin] = useState<Coin>(MOCK_COINS[0]);
    const [priceData, setPriceData] = useState<PriceDataPoint[]>([]);
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    
    const handleAnalyze = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setAnalysis(null);
        setPriceData([]);

        try {
            const data = await fetchRealCryptoData(selectedCoin.id);
            setPriceData(data);
            
            // The service now returns a Promise of the final result
            const finalResult = await fetchTradingAnalysisStream(data, selectedCoin.name);
            setAnalysis(finalResult);

        } catch (err) {
            console.error("Analysis failed:", err);
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
            if (errorMessage.includes("API_KEY")) {
                 setError("API 키가 설정되지 않았습니다. .env 파일을 확인해주세요.");
            } else if (errorMessage.includes("JSON")) {
                setError("AI 응답을 처리하는 중 오류가 발생했습니다. 응답 형식이 올바르지 않을 수 있습니다.");
            }
            else {
                 setError("데이터를 가져오는 데 실패했습니다. 잠시 후 다시 시도해주세요.");
            }
        } finally {
            setIsLoading(false);
        }
    }, [selectedCoin]);

    const getSignalColor = (signal: Signal | undefined): string => {
        if(!signal) return 'bg-gray-700';
        switch (signal) {
            case Signal.BUY:
                return 'from-green-500 to-emerald-600';
            case Signal.SELL:
                return 'from-red-500 to-rose-600';
            case Signal.HOLD:
                return 'from-yellow-500 to-amber-600';
            default:
                return 'from-gray-600 to-gray-700';
        }
    };
    
    const outputContent = () => {
        if (analysis) {
            return (
                 <div className="bg-gray-800/50 rounded-xl shadow-lg p-6 space-y-6 animate-fade-in">
                     <div className={`p-6 rounded-xl bg-gradient-to-br ${getSignalColor(analysis.signal)} shadow-xl text-center`}>
                        <h3 className="text-lg font-semibold text-white/80 mb-2">AI 분석 결과</h3>
                        <p className="text-5xl font-bold text-white mb-1">{analysis.signal}</p>
                        <p className="text-sm font-medium text-white/90">{analysis.short_term_prediction}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                        <div className="md:col-span-3">
                             {priceData.length > 0 && <PriceChart data={priceData} analysis={analysis} />}
                        </div>
                        <div className="md:col-span-2">
                             <AnalysisDisplay analysis={analysis} priceData={priceData} />
                        </div>
                    </div>
                </div>
            )
        }

        if (error) {
            return <div className="bg-red-900/50 border border-red-500 text-red-300 px-4 py-3 rounded-lg text-center animate-fade-in">{error}</div>
        }

        if (!isLoading && !analysis) {
            return (
                <div className="text-center py-12 text-gray-500">
                    <p>분석을 시작하려면 'AI 분석 시작' 버튼을 클릭하세요.</p>
                </div>
            );
        }

        return null;
    }


    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-4xl mx-auto">
                <header className="text-center mb-8">
                    <div className="flex items-center justify-center space-x-3 mb-2">
                        <LogoIcon className="h-8 w-8 text-cyan-400" />
                        <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Gradio Crypto Analyzer</h1>
                    </div>
                    <p className="text-gray-400">AI를 사용하여 암호화폐 거래 신호를 분석합니다.</p>
                </header>

                <main className="space-y-8">
                    {/* Input Section */}
                    <div className="bg-gray-800/50 rounded-xl shadow-lg p-6 space-y-4">
                        <div>
                            <label htmlFor="coin-selector" className="block text-lg font-semibold mb-2 text-cyan-300">1. 코인 선택</label>
                            <CoinSelector selectedCoin={selectedCoin} onSelectCoin={setSelectedCoin} disabled={isLoading} />
                        </div>
                        
                        <div>
                            <h2 className="text-lg font-semibold mb-2 text-cyan-300">2. 분석 실행</h2>
                            <button
                                onClick={handleAnalyze}
                                disabled={isLoading}
                                className={`w-full text-lg font-bold py-3 px-4 rounded-lg transition-all duration-300 ease-in-out flex items-center justify-center
                                    ${isLoading ? 'bg-gray-600 cursor-not-allowed' : `bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-md hover:shadow-cyan-500/50 transform hover:-translate-y-0.5`}
                                `}
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        분석 중...
                                    </>
                                ) : (
                                    'AI 분석 시작'
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Output Section */}
                    <div className="min-h-[200px]">
                        {outputContent()}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default App;
