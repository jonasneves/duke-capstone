import { useState, useCallback, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { useStreamAccumulator } from '@/hooks/useStreamAccumulator';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { useAuthStore } from '@/stores';
import { useUserMenu } from '@/framework';
import type { Message, Model } from './types';

const MODELS: { value: Model; label: string }[] = [
  { value: 'gpt-4o', label: 'GPT-4o' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
  { value: 'meta-llama-3.1-70b-instruct', label: 'Llama 3.1 70B' },
  { value: 'mistral-large', label: 'Mistral Large' }
];

export default function ChatApp() {
  const token = useAuthStore(state => state.token);
  const { startTimer, endTimer } = usePerformanceMonitor('chat');
  const [messages, setMessages, clearMessages] = useLocalStorage<Message[]>('chat_history', []);
  const [selectedModel, setSelectedModel] = useLocalStorage<Model>('chat_model', 'gpt-4o-mini');
  const [isLoading, setIsLoading] = useState(false);
  const { setCustomItems, clearCustomItems } = useUserMenu();

  const handleClearChat = useCallback(() => {
    if (confirm('Clear all chat history?')) {
      clearMessages();
    }
  }, [clearMessages]);

  useEffect(() => {
    setCustomItems([
      {
        id: 'model-selector',
        label: 'Model',
        onClick: () => {},
        component: (
          <div className="px-4 py-3">
            <label htmlFor="chat-model" className="block text-xs font-medium text-neutral-500 mb-2">
              AI Model
            </label>
            <select
              id="chat-model"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value as Model)}
              className="w-full px-3 py-2 text-sm bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            >
              {MODELS.map(model => (
                <option key={model.value} value={model.value}>
                  {model.label}
                </option>
              ))}
            </select>
          </div>
        )
      },
      {
        id: 'clear-chat',
        label: 'Clear Chat',
        icon: Trash2,
        onClick: handleClearChat,
        variant: 'danger' as const
      }
    ]);

    return () => clearCustomItems();
  }, [selectedModel, setSelectedModel, handleClearChat, setCustomItems, clearCustomItems]);

  // RAF batching for message updates
  const handleFlush = useCallback((newMessages: Message[]) => {
    setMessages(prev => [...prev, ...newMessages]);
  }, [setMessages]);

  const { accumulate } = useStreamAccumulator<Message>(handleFlush);

  const addMessage = useCallback((role: Message['role'], content: string) => {
    const message: Message = {
      role,
      content,
      id: `${Date.now()}-${Math.random()}`
    };
    accumulate(message);
  }, [accumulate]);

  const handleSend = useCallback(async (content: string) => {
    if (!token || isLoading) return;

    setIsLoading(true);
    addMessage('user', content);

    const streamingMessageId = `${Date.now()}-${Math.random()}`;
    const streamingMessage: Message = {
      role: 'assistant',
      content: '',
      id: streamingMessageId
    };

    try {
      startTimer('api_latency_ms');
      const response = await fetch('https://models.inference.ai.azure.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [...messages, { role: 'user', content }]
            .slice(-20)
            .map(m => ({
              role: m.role,
              content: m.content
            })),
          temperature: 0.7,
          max_tokens: 1000,
          stream: true
        })
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: { message: `API error: ${response.status}` } }));
        throw new Error(error.error?.message || `API error: ${response.status}`);
      }

      setMessages(prev => [...prev, streamingMessage]);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';

      if (!reader) throw new Error('No response body');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim().startsWith('data:'));

        for (const line of lines) {
          const data = line.replace(/^data:\s*/, '').trim();
          if (data === '[DONE]') continue;

          try {
            const parsed = JSON.parse(data);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              accumulatedContent += delta;
              setMessages(prev => prev.map(msg =>
                msg.id === streamingMessageId
                  ? { ...msg, content: accumulatedContent }
                  : msg
              ));
            }
          } catch (e) {
            // Skip malformed JSON chunks
          }
        }
      }

      endTimer('api_latency_ms');
    } catch (error: any) {
      addMessage('system', `Error: ${error.message}`);
      setMessages(prev => prev.filter(msg => msg.id !== streamingMessageId));
    } finally {
      setIsLoading(false);
    }
  }, [token, selectedModel, messages, isLoading, addMessage, startTimer, endTimer, setMessages]);

  return (
    <div className="h-screen flex flex-col bg-neutral-100">
      <div className="flex-1 flex justify-center p-6 overflow-hidden">
        <div className="w-full max-w-[800px] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden">
          <MessageList messages={messages} />
          <ChatInput onSend={handleSend} disabled={isLoading} />
        </div>
      </div>
    </div>
  );
}
