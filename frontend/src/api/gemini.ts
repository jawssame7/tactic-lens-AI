import type { AnalyzeRequest, AnalyzeResponse, ErrorResponse } from '../types';

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT || '/api/analyze';

export async function analyzeImage(
  request: AnalyzeRequest
): Promise<AnalyzeResponse> {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    // Check if response has content
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      throw new Error(
        `Expected JSON response but got: ${text || 'empty response'}. API Endpoint: ${API_ENDPOINT}`
      );
    }

    if (!response.ok) {
      let errorData: ErrorResponse;
      try {
        errorData = await response.json();
      } catch {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      throw new Error(errorData.error || 'Failed to analyze image');
    }

    const data: AnalyzeResponse = await response.json();
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}
