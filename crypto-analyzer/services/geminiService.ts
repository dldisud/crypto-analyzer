import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { PriceDataPoint, Signal } from '../types';

const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    signal: {
      type: Type.STRING,
      enum: [Signal.BUY, Signal.SELL, Signal.HOLD],
      description: 'The recommended trading action: BUY, SELL, or HOLD.',
    },
    confidence_score: {
      type: Type.NUMBER,
      description: 'A score from 0.0 to 1.0 indicating the confidence in the signal. This score must be dynamic, reflecting the clarity and strength of the observed patterns. A strong, clear trend should yield a higher score (e.g., >0.8), while a sideways or highly volatile market should result in a lower score (e.g., <0.6).',
    },
    reasoning: {
      type: Type.STRING,
      description: 'A detailed explanation for the trading signal based on the provided price data analysis, in Korean.',
    },
    short_term_prediction: {
        type: Type.STRING,
        description: 'A brief summary of the expected short-term price movement, in Korean.'
    },
    stop_loss_price: {
      type: Type.NUMBER,
      description: 'A suggested price at which to sell to limit losses if the trade moves against the prediction. Only for BUY signal.',
    },
    take_profit_price: {
      type: Type.NUMBER,
      description: 'A suggested price at which to sell to lock in profits. Only for BUY signal.',
    },
    suggested_trade_percentage: {
      type: Type.NUMBER,
      description: 'For BUY signals only. A suggested percentage of available cash to invest (from 0.05 to 0.5 for 5% to 50%). Base this on confidence and market volatility. A higher confidence score and lower volatility should lead to a higher percentage (e.g., 0.3 or 30%). A lower confidence score or high volatility should result in a lower percentage (e.g., 0.1 or 10%).',
    },
  },
  required: ['signal', 'confidence_score', 'reasoning', 'short_term_prediction'],
};


export const fetchTradingAnalysisStream = async (priceData: PriceDataPoint[], coinName: string): Promise<AsyncGenerator<GenerateContentResponse>> => {
    const ai = new GoogleGenAI({apiKey: process.env.API_KEY});

    const prompt = `
        You are an expert crypto trading analyst. Your response must be in Korean.
        Analyze the following 30-day price data for ${coinName}.
        The data is in JSON format with date and price.
        Provide a trading signal (BUY, SELL, or HOLD).
        Explain your reasoning clearly and concisely in Korean.
        Provide a dynamic confidence score from 0.0 to 1.0 based on trend strength and volatility.

        **If the signal is BUY, you must also provide:**
        1. A 'stop_loss_price'.
        2. A 'take_profit_price'.
        3. A 'suggested_trade_percentage': This is crucial. Recommend a percentage of available cash to invest, as a decimal between 0.05 (5%) and 0.5 (50%). A higher confidence score and lower volatility should lead to a higher percentage (e.g., 0.3 or 30%). A lower confidence score or high volatility should result in a lower percentage (e.g., 0.1 or 10%).

        **If the signal is SELL or HOLD, do not include stop_loss_price, take_profit_price, or suggested_trade_percentage.**

        Price Data:
        ${JSON.stringify(priceData)}
    `;

    try {
        const response = await ai.models.generateContentStream({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: analysisSchema,
            },
        });
        
        return response;
    } catch(e) {
        console.error("Error fetching AI analysis stream:", e);
        if (e instanceof Error && e.message.toLowerCase().includes('api key')) {
             throw new Error("API_KEY is not configured or is invalid. Please check your .env file.");
        }
        throw new Error("Failed to get analysis from AI. The API call failed.");
    }
};