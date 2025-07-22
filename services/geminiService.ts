import { PriceDataPoint, AnalysisResult } from '../types';

// This function now communicates with the main process via the preload script
export const fetchTradingAnalysisStream = (priceData: PriceDataPoint[], coinName: string): Promise<AnalysisResult> => {
    return new Promise((resolve, reject) => {
        let accumulatedJson = '';

        const handleChunk = (chunk: any) => {
             if (chunk && chunk.text) {
                accumulatedJson += chunk.text;
            }
        };

        const handleError = (error: string) => {
            console.error("Stream Error:", error);
            // Unsubscribe from all events
            removeChunkListener();
            removeErrorListener();
            removeEndListener();
             if (error.includes("API_KEY")) {
                 reject(new Error("API 키가 설정되지 않았습니다. .env 파일을 확인해주세요."));
            } else {
                reject(new Error(`AI 분석 중 오류 발생: ${error}`));
            }
        };

        const handleEnd = () => {
            // Unsubscribe from all events
            removeChunkListener();
            removeErrorListener();
            removeEndListener();

            if (!accumulatedJson) {
                return reject(new Error("AI로부터 빈 응답을 받았습니다."));
            }
            try {
                // Clean up potential markdown fences from the Gemini response
                const cleanedJson = accumulatedJson.replace(/```json\n?|\n?```/g, '');
                const finalResult = JSON.parse(cleanedJson) as AnalysisResult;
                resolve(finalResult);
            } catch (e) {
                 console.error("JSON parsing error:", e);
                 reject(new Error("AI 응답을 처리하는 중 오류가 발생했습니다. 응답 형식이 올바르지 않을 수 있습니다."));
            }
        };

        // Subscribe to IPC events from the main process
        const removeChunkListener = window.gemini.on('stream-chunk', handleChunk);
        const removeErrorListener = window.gemini.on('stream-error', handleError);
        const removeEndListener = window.gemini.on('stream-end', handleEnd);

        // Invoke the main process to start the stream
        window.gemini.invoke('fetch-analysis-stream', priceData, coinName)
            .catch(err => {
                 // This initial invoke call might fail if the handler isn't set up
                 // or if there's an immediate error.
                 handleError(err.message);
            });
    });
};