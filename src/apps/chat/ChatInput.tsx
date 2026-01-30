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
    <div className="px-6 py-5 bg-white border-t border-neutral-100">
      <div className="flex items-center gap-2 px-5 py-2 bg-neutral-50 border border-neutral-200 rounded-[28px] transition-all focus-within:border-[#00539B] focus-within:shadow-[0_0_0_3px_rgba(0,83,155,0.1)]">
        <input
          ref={inputRef}
          type="text"
          id="input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={disabled}
          className="flex-1 py-2 bg-transparent border-none text-[15px] text-neutral-900 placeholder-neutral-400 focus:outline-none disabled:text-neutral-400"
        />
        <button
          onClick={handleSend}
          disabled={disabled || !input.trim()}
          id="send-btn"
          className="w-10 h-10 flex items-center justify-center bg-[#00539B] hover:bg-[#012169] text-white rounded-full transition-colors disabled:bg-neutral-300 disabled:cursor-not-allowed flex-shrink-0"
          aria-label="Send message"
        >
          <ArrowUp size={18} />
        </button>
      </div>
    </div>
  );
}
