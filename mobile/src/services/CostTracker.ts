import * as SQLite from 'expo-sqlite';

const DB_NAME = 'gemini_usage_v1.db';
const EXCHANGE_RATE_MXN = 20.50; // Aproximado

// Costos estimados en USD (por unidad)
const PRICING = {
  'gemini-1.5-flash': {
    inputToken: 0.075 / 1_000_000,
    outputToken: 0.30 / 1_000_000,
  },
  'gemini-2.0-flash-exp': {
    inputToken: 0.10 / 1_000_000, // Estimado
    outputToken: 0.40 / 1_000_000, // Estimado
    imageGen: 0.04, // Costo estimado por imagen generada
  },
  // Fallback
  'default': {
    inputToken: 0.10 / 1_000_000,
    outputToken: 0.40 / 1_000_000,
  }
};

interface UsageRecord {
  id?: number;
  timestamp: string;
  model: string;
  operationType: 'text_analysis' | 'image_generation';
  inputTokens: number;
  outputTokens: number;
  imagesGenerated: number;
  costUsd: number;
}

let db: SQLite.SQLiteDatabase | null = null;

async function getDB() {
  if (!db) {
    db = await SQLite.openDatabaseAsync(DB_NAME);
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS usage_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        model TEXT NOT NULL,
        operation_type TEXT NOT NULL,
        input_tokens INTEGER DEFAULT 0,
        output_tokens INTEGER DEFAULT 0,
        images_generated INTEGER DEFAULT 0,
        cost_usd REAL DEFAULT 0
      );
    `);
  }
  return db;
}

export const CostTracker = {
  async logTransaction(
    model: string,
    operationType: 'text_analysis' | 'image_generation',
    usage: { inputTokens?: number; outputTokens?: number; imagesGenerated?: number }
  ) {
    try {
      const database = await getDB();
      const input = usage.inputTokens || 0;
      const output = usage.outputTokens || 0;
      const images = usage.imagesGenerated || 0;

      // Calcular costo
      let cost = 0;
      const pricing = (PRICING as any)[model] || PRICING['default'];

      if (pricing) {
        cost += input * (pricing.inputToken || 0);
        cost += output * (pricing.outputToken || 0);
        if (pricing.imageGen) {
          cost += images * pricing.imageGen;
        }
      }

      await database.runAsync(
        `INSERT INTO usage_logs (timestamp, model, operation_type, input_tokens, output_tokens, images_generated, cost_usd)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          new Date().toISOString(),
          model,
          operationType,
          input,
          output,
          images,
          cost
        ]
      );

      console.log(`[CostTracker] Logged: $${cost.toFixed(6)} USD for ${operationType}`);
    } catch (error) {
      console.error("[CostTracker] Failed to log transaction:", error);
    }
  },

  async getStats() {
    try {
      const database = await getDB();
      // Total usage
      const result = await database.getFirstAsync<{
        total_usd: number;
        total_calls: number;
        total_images: number;
      }>(`
        SELECT 
          SUM(cost_usd) as total_usd, 
          COUNT(*) as total_calls,
          SUM(images_generated) as total_images
        FROM usage_logs
      `);

      const totalUsd = result?.total_usd || 0;
      const totalMxn = totalUsd * EXCHANGE_RATE_MXN;

      return {
        totalUsd,
        totalMxn,
        totalCalls: result?.total_calls || 0,
        totalImages: result?.total_images || 0
      };
    } catch (error) {
      console.error("[CostTracker] Failed to get stats:", error);
      return { totalUsd: 0, totalMxn: 0, totalCalls: 0, totalImages: 0 };
    }
  },

  async resetLogs() {
    try {
      const database = await getDB();
      await database.runAsync("DELETE FROM usage_logs");
      console.log("[CostTracker] Logs reset.");
    } catch (e) {
      console.error(e);
    }
  }
};
