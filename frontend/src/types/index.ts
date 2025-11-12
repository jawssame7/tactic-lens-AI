export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  imageUrl?: string;
  timestamp: Date;
}

export interface AnalyzeRequest {
  message: string;
  image?: string;
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

export interface AnalyzeResponse {
  reply: string;
  timestamp: string;
  processingTime?: number;
}

export interface ErrorResponse {
  error: string;
  code: string;
}
