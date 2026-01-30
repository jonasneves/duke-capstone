import type { Model } from './types';

interface ModelSelectorProps {
  selectedModel: Model;
  onModelChange: (model: Model) => void;
  onClearChat: () => void;
}

const MODELS: { value: Model; label: string }[] = [
  { value: 'gpt-4o', label: 'GPT-4o' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
  { value: 'meta-llama-3.1-70b-instruct', label: 'Llama 3.1 70B' },
  { value: 'mistral-large', label: 'Mistral Large' }
];

export function ModelSelector({ selectedModel, onModelChange, onClearChat }: ModelSelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <select
        id="model"
        value={selectedModel}
        onChange={(e) => onModelChange(e.target.value as Model)}
        className="px-3 py-1.5 text-xs bg-white/10 text-white border border-white/20 rounded-full focus:outline-none focus:bg-white/20 transition-colors"
      >
        {MODELS.map(model => (
          <option key={model.value} value={model.value} className="text-neutral-900">
            {model.label}
          </option>
        ))}
      </select>
      <button
        onClick={onClearChat}
        className="px-3 py-1.5 text-xs text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
      >
        Clear
      </button>
    </div>
  );
}
