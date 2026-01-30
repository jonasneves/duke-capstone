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
    <div className="flex items-center gap-3 px-6 py-3 bg-white border-b border-neutral-100">
      <label htmlFor="model" className="text-sm font-medium text-neutral-600">Model:</label>
      <select
        id="model"
        value={selectedModel}
        onChange={(e) => onModelChange(e.target.value as Model)}
        className="px-3 py-1.5 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-300 focus:border-neutral-300 bg-white"
      >
        {MODELS.map(model => (
          <option key={model.value} value={model.value}>
            {model.label}
          </option>
        ))}
      </select>
      <button
        onClick={onClearChat}
        className="ml-auto px-3 py-1.5 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-lg transition-colors"
      >
        Clear Chat
      </button>
    </div>
  );
}
