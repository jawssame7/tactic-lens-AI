import { readFileSync } from 'fs';
import { join } from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Part } from '@google/generative-ai';
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

// Load environment variables from JSON file in development
if (process.env.NODE_ENV !== 'production') {
  try {
    const envPath = join(process.cwd(), 'env.local.json');
    const envConfig = JSON.parse(readFileSync(envPath, 'utf-8'));
    Object.assign(process.env, envConfig);
  } catch (error) {
    // Ignore if file doesn't exist (e.g., in Lambda environment)
  }
}

// Types
interface AnalyzeRequest {
  message: string;
  image?: string;
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

interface AnalyzeResponse {
  reply: string;
  timestamp: string;
  processingTime?: number;
}

const GEMINI_REQUEST_TIMEOUT_MS = Number(
  process.env.GEMINI_API_TIMEOUT_MS ?? 45_000
);

function buildPromptParts(
  messageText?: string,
  imageBase64?: string
): Part[] {
  const parts: Part[] = [{ text: SYSTEM_PROMPT }];

  if (messageText) {
    parts.push({ text: messageText });
  }

  if (imageBase64) {
    parts.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: imageBase64,
      },
    });
  }

  return parts;
}

// System prompt for Gemini
const SYSTEM_PROMPT = `あなたはプロサッカーの戦術アナリストです。
画像や動画から試合状況を分析し、具体的で実践的な戦術アドバイスを提供してください。

分析の観点:
- フォーメーションと選手配置
- スペースの活用状況
- プレスとプレス回避
- 攻守の切り替え
- ボール保持とポジショニング

回答形式:
- **必ずマークダウン形式で回答してください**
- 見出し(##, ###)と箇条書き(-, *)を使った構造化
- 具体的な改善案の提示
- 実例やプレーパターンの説明`;

console.log(
  'Gemini AI Lambda initialized',
  process.env.GEMINI_API_KEY ? '' : '(GEMINI_API_KEY not set)'
);
// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY ?? '');

// Helper function to create response
function createResponse(
  statusCode: number,
  body: unknown
): APIGatewayProxyResult {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
    },
    body: JSON.stringify(body),
  };
}

// Main Lambda handler
export async function handler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  const startTime = Date.now();
  console.log(
    'Gemini AI Lambda initialized',
    process.env.GEMINI_API_KEY ? '' : '(GEMINI_API_KEY not set)'
  );
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return createResponse(200, {});
  }

  // Validate request method
  if (event.httpMethod !== 'POST') {
    return createResponse(405, {
      error: 'Method not allowed',
      code: 'METHOD_NOT_ALLOWED',
    });
  }

  try {
    // Parse request body
    if (!event.body) {
      return createResponse(400, {
        error: 'Request body is required',
        code: 'MISSING_BODY',
      });
    }

    const requestBody: AnalyzeRequest = JSON.parse(event.body);

    // Validate required fields
    if (!requestBody.message && !requestBody.image) {
      return createResponse(400, {
        error: 'Either message or image is required',
        code: 'MISSING_CONTENT',
      });
    }

    // Check API key
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not set');
      return createResponse(500, {
        error: 'Server configuration error',
        code: 'MISSING_API_KEY',
      });
    }

    // Initialize Gemini model
    const requestOptions = {
      apiVersion: 'v1',
      timeout: GEMINI_REQUEST_TIMEOUT_MS,
    } as const;

    const model = genAI.getGenerativeModel(
      {
        model: 'gemini-2.5-flash',
      },
      requestOptions
    );

    // Prepare the chat history
    const history = (requestBody.conversationHistory || []).map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    // Start chat
    const chat = model.startChat({ history });

    // If both message and image, combine them
    if (requestBody.message && requestBody.image) {
      const result = await chat.sendMessage(
        buildPromptParts(requestBody.message, requestBody.image),
        { timeout: GEMINI_REQUEST_TIMEOUT_MS }
      );
      const response = result.response;
      const text = response.text();

      const processingTime = Date.now() - startTime;

      return createResponse(200, {
        reply: text,
        timestamp: new Date().toISOString(),
        processingTime,
      });
    }

    // If only image, send with a default message
    if (requestBody.image && !requestBody.message) {
      const result = await chat.sendMessage(
        buildPromptParts('この画像を分析してください', requestBody.image),
        { timeout: GEMINI_REQUEST_TIMEOUT_MS }
      );
      const response = result.response;
      const text = response.text();

      const processingTime = Date.now() - startTime;

      return createResponse(200, {
        reply: text,
        timestamp: new Date().toISOString(),
        processingTime,
      });
    }

    // If only text message
    const result = await chat.sendMessage(
      buildPromptParts(requestBody.message),
      { timeout: GEMINI_REQUEST_TIMEOUT_MS }
    );
    const response = result.response;
    const text = response.text();

    const processingTime = Date.now() - startTime;

    // Return success response
    const responseBody: AnalyzeResponse = {
      reply: text,
      timestamp: new Date().toISOString(),
      processingTime,
    };

    return createResponse(200, responseBody);
  } catch (error) {
    console.error('Error processing request:', error);

    // Handle specific error types
    if (error instanceof SyntaxError) {
      return createResponse(400, {
        error: 'Invalid JSON in request body',
        code: 'INVALID_JSON',
      });
    }

    return createResponse(500, {
      error: error instanceof Error ? error.message : 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
}
