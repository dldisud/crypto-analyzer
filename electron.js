import { app, BrowserWindow, screen, ipcMain } from 'electron';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type, GenerateContentResponse } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = process.env.NODE_ENV !== 'production';

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  const win = new BrowserWindow({
    width: Math.floor(width * 0.6) < 800 ? 800 : Math.floor(width * 0.6),
    height: Math.floor(height * 0.85) < 600 ? 600 : Math.floor(height * 0.85),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // For dev, load from Vite dev server. For production, load from the built file.
  if (isDev) {
    win.loadURL('http://localhost:5173'); // Default Vite port
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }
}

// All the Gemini API logic will now live in the main process.
const analysisSchema = {
    type: Type.OBJECT,
    properties: {
      signal: { type: Type.STRING, enum: ['BUY', 'SELL', 'HOLD'] },
      confidence_score: { type: Type.NUMBER },
      reasoning: { type: Type.STRING },
      short_term_prediction: { type: Type.STRING },
      stop_loss_price: { type: Type.NUMBER },
      take_profit_price: { type: Type.NUMBER },
      suggested_trade_percentage: { type: Type.NUMBER },
    },
    required: ['signal', 'confidence_score', 'reasoning', 'short_term_prediction'],
};

async function fetchAnalysisFromGemini(priceData, coinName) {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API_KEY is not defined in .env file");
    }
    const ai = new GoogleGenAI({ apiKey });

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

    const response = await ai.models.generateContentStream({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: analysisSchema,
        },
    });

    return response;
}


app.whenReady().then(() => {
  createWindow();

  ipcMain.handle('fetch-analysis-stream', async (event, priceData, coinName) => {
    try {
        const stream = await fetchAnalysisFromGemini(priceData, coinName);
        for await (const chunk of stream) {
            event.sender.send('stream-chunk', chunk);
        }
        event.sender.send('stream-end');
    } catch (error) {
        console.error('Error fetching analysis stream:', error);
        event.sender.send('stream-error', error.message);
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
