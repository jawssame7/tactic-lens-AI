import { useEffect, useRef, useState } from 'react';
import { analyzeImage } from './api/gemini';
import ChatInput from './components/ChatInput';
import ImageUpload from './components/ImageUpload';
import LoadingIndicator from './components/LoadingIndicator';
import MessageBubble from './components/MessageBubble';
import type { Message } from './types';
import { fileToBase64 } from './utils/image';

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedImage, setSelectedImage] = useState<{
    file: File;
    previewUrl: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleImageSelect = (file: File, previewUrl: string) => {
    setSelectedImage({ file, previewUrl });
    setError('');
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
  };

  const handleClearHistory = () => {
    if (window.confirm('会話履歴をクリアしますか?')) {
      setMessages([]);
      setSelectedImage(null);
      setError('');
    }
  };

  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim() && !selectedImage) {
      return;
    }

    setError('');
    setIsLoading(true);

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      imageUrl: selectedImage?.previewUrl,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      // Convert image to base64 if present
      let imageBase64: string | undefined;
      if (selectedImage) {
        imageBase64 = await fileToBase64(selectedImage.file);
      }

      // Prepare conversation history
      const conversationHistory = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Call API
      const response = await analyzeImage({
        message: messageText,
        image: imageBase64,
        conversationHistory,
      });

      // Add AI response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.reply,
        timestamp: new Date(response.timestamp),
      };

      setMessages((prev) => [...prev, aiMessage]);
      setSelectedImage(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : '分析中にエラーが発生しました'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm px-4 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-900">サッカー戦術分析AI</h1>
        {messages.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            履歴をクリア
          </button>
        )}
      </header>

      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 mt-20">
              <h2 className="text-2xl font-semibold mb-4">
                サッカー戦術分析を始めましょう
              </h2>
              <p className="mb-2">試合やトレーニングの画像をアップロードして</p>
              <p>戦術的なアドバイスを受けられます</p>
            </div>
          )}
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {isLoading && <LoadingIndicator />}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <footer className="bg-white border-t border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <ImageUpload
            onImageSelect={handleImageSelect}
            selectedImage={selectedImage}
            onRemoveImage={handleRemoveImage}
          />
          <ChatInput onSend={handleSendMessage} disabled={isLoading} />
        </div>
      </footer>
    </div>
  );
}

export default App;
