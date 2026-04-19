import logger from '@/utils/logger';

const AI_API_URL = process.env['AI_API_URL'] || 'http://localhost:8000';

export interface AIAnalysisResult {
  is_phishing: boolean;
  phishing_probability: number;
  safe_probability: number;
  risk_level: string;
  confidence: number;
  model_breakdown: {
    random_forest: number;
    distilbert: number;
    ensemble: number;
  };
}

export const aiService = {
  async analyzeEmail(emailText: string): Promise<AIAnalysisResult> {
    const response = await fetch(`${AI_API_URL}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email_text: emailText }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      logger.error(`AI service error: ${response.status} - ${errorBody}`);
      throw new Error(`AI analysis failed: ${response.statusText}`);
    }

    return response.json() as Promise<AIAnalysisResult>;
  },

  async batchAnalyze(emails: string[]): Promise<AIAnalysisResult[]> {
    const response = await fetch(`${AI_API_URL}/batch-analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emails.map((email_text) => ({ email_text }))),
    });

    if (!response.ok) {
      throw new Error(`AI batch analysis failed: ${response.statusText}`);
    }

    const data = await response.json() as { results: AIAnalysisResult[] };
    return data.results;
  },

  async checkHealth(): Promise<{ status: string; models_loaded: boolean }> {
    try {
      const response = await fetch(`${AI_API_URL}/health`);
      if (!response.ok) {
        return { status: 'unhealthy', models_loaded: false };
      }
      return response.json() as Promise<{ status: string; models_loaded: boolean }>;
    } catch {
      return { status: 'unreachable', models_loaded: false };
    }
  },
};