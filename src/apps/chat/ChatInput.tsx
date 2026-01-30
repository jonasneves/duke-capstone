import { useState, useRef, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!disabled) {
      inputRef.current?.focus();
    }
  }, [disabled]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || disabled) return;

    onSend(trimmed);
    setInput('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-neutral-50 px-6 py-6 flex items-center gap-3 max-w-4xl mx-auto">
      <input
        ref={inputRef}
        type="text"
        id="input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your message..."
        disabled={disabled}
        className="flex-1 px-6 py-4 bg-white border border-neutral-200 rounded-full text-base focus:outline-none focus:ring-2 focus:ring-neutral-300 focus:border-neutral-300 disabled:bg-neutral-100 disabled:text-neutral-400 shadow-sm"
      />
      <button
        onClick={handleSend}
        disabled={disabled || !input.trim()}
        id="send-btn"
        className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-neutral-900 hover:bg-neutral-800 text-white rounded-full transition-colors disabled:bg-neutral-300 disabled:cursor-not-allowed shadow-sm"
        aria-label="Send message"
      >
        <ArrowUp size={20} />
      </button>
    </div>
  );
}
