import { ArrowRight } from 'lucide-react';
import type { AppManifest } from '../types';

interface AppCardProps {
  appName: string;
  manifest: AppManifest | null;
  path: string;
  onLaunch: (path: string, name: string) => void;
}

export function AppCard({ appName, manifest, path, onLaunch }: AppCardProps) {
  if (!manifest) {
    return (
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="p-6">
          <h3 className="text-xl font-semibold text-neutral-900 mb-2">{appName}</h3>
          <p className="text-neutral-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-neutral-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-150 overflow-hidden group flex flex-col h-full">
      <div className={`w-full bg-gradient-to-br from-brand-50 to-neutral-50 flex items-center justify-center ${manifest.thumbnail ? 'h-32' : 'h-20'}`}>
        {manifest.thumbnail ? (
          <img
            src={manifest.thumbnail}
            alt={manifest.name}
            loading="lazy"
            className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        ) : (
          <div className="text-4xl text-neutral-400">{manifest.name.charAt(0)}</div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="text-base font-semibold text-neutral-900 mb-1">{manifest.name}</h3>
        <p className="text-neutral-600 text-xs leading-relaxed mb-3 line-clamp-2">{manifest.description}</p>

        {manifest.tech && manifest.tech.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {manifest.tech.map(t => (
              <span key={t} className="bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-full text-[10px] font-medium">
                {t}
              </span>
            ))}
          </div>
        )}

        <button
          onClick={() => onLaunch(path, manifest.name)}
          aria-label={`Launch ${manifest.name} app`}
          className="inline-flex items-center justify-center gap-1.5 bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white px-3 py-2 rounded-lg font-medium text-xs transition-all duration-150 group-hover:gap-2 mt-auto"
        >
          Launch App
          <ArrowRight size={14} className="transition-transform duration-150" />
        </button>
      </div>
    </div>
  );
}
