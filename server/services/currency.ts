import { storage } from "../storage";

interface ExchangeRateResponse {
  rates: Record<string, number>;
  base: string;
  timestamp: number;
}

class CurrencyService {
  private apiKey: string;
  private baseUrl: string;
  private cacheTimeout: number = 60 * 60 * 1000; // 1 hour

  constructor() {
    this.apiKey = process.env.EXCHANGE_RATE_API_KEY || process.env.FIXER_API_KEY || "demo_key";
    this.baseUrl = "https://api.exchangerate-api.com/v4/latest";
  }

  async getExchangeRates(baseCurrency: string): Promise<ExchangeRateResponse> {
    try {
      // Try to get cached rates first
      const cachedRates = await storage.getCurrencyRates(baseCurrency);
      const cacheKey = `${baseCurrency}-USD`;
      const cachedRate = await storage.getCurrencyRate(baseCurrency, 'USD');
      
      // Check if cache is still valid (less than 1 hour old)
      if (cachedRate && cachedRate.lastUpdated) {
        const cacheAge = Date.now() - cachedRate.lastUpdated.getTime();
        if (cacheAge < this.cacheTimeout && Object.keys(cachedRates).length > 0) {
          return {
            rates: cachedRates,
            base: baseCurrency,
            timestamp: Math.floor(cachedRate.lastUpdated.getTime() / 1000)
          };
        }
      }

      // Fetch fresh rates from API
      const response = await fetch(`${this.baseUrl}/${baseCurrency}`);
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.rates) {
        throw new Error("Invalid API response format");
      }

      // Cache the rates
      for (const [currency, rate] of Object.entries(data.rates)) {
        if (typeof rate === 'number') {
          await storage.saveCurrencyRate(baseCurrency, currency, rate);
        }
      }

      return {
        rates: data.rates,
        base: baseCurrency,
        timestamp: Math.floor(Date.now() / 1000)
      };

    } catch (error) {
      console.error("Currency service error:", error);
      
      // Fallback to cached data if available
      const cachedRates = await storage.getCurrencyRates(baseCurrency);
      if (Object.keys(cachedRates).length > 0) {
        console.log("Using cached rates due to API failure");
        return {
          rates: cachedRates,
          base: baseCurrency,
          timestamp: Math.floor(Date.now() / 1000)
        };
      }

      // Ultimate fallback with static rates
      const fallbackRates = this.getFallbackRates(baseCurrency);
      return {
        rates: fallbackRates,
        base: baseCurrency,
        timestamp: Math.floor(Date.now() / 1000)
      };
    }
  }

  private getFallbackRates(baseCurrency: string): Record<string, number> {
    // Static fallback rates (these would be outdated but better than nothing)
    const baseRates: Record<string, Record<string, number>> = {
      USD: {
        EUR: 0.85,
        GBP: 0.73,
        JPY: 110.0,
        CAD: 1.25,
        AUD: 1.35,
        CHF: 0.92,
        CNY: 6.45,
        INR: 74.5,
        KRW: 1180.0,
        BRL: 5.2,
        RUB: 75.0,
        MXN: 20.0,
        SGD: 1.35,
        HKD: 7.8,
      },
      EUR: {
        USD: 1.18,
        GBP: 0.86,
        JPY: 129.5,
        CAD: 1.47,
        AUD: 1.59,
        CHF: 1.08,
        CNY: 7.6,
        INR: 87.8,
        KRW: 1390.0,
        BRL: 6.1,
      }
    };

    return baseRates[baseCurrency] || baseRates.USD;
  }

  async getSupportedCurrencies(): Promise<string[]> {
    return [
      'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 
      'INR', 'KRW', 'BRL', 'RUB', 'MXN', 'SGD', 'HKD'
    ];
  }
}

export const currencyService = new CurrencyService();
