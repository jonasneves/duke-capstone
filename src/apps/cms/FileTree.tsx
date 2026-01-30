import { useState, memo, useCallback } from 'react';
import { Folder, FileText } from 'lucide-react';
import type { FileNode } from './types';

interface FileTreeProps {
  files: FileNode[];
  onFileSelect: (file: FileNode) => void;
  selectedFile: FileNode | null;
  onLoadDirectory: (path: string) => Promise<FileNode[]>;
}

interface DirectoryState {
  [path: string]: {
    isOpen: boolean;
    children: FileNode[];
    isLoaded: boolean;
  };
}

// Memoized tree item to prevent unnecessary re-renders
const TreeItem = memo(function TreeItem({
  item,
  level,
  isOpen,
  isSelected,
  hasChildren,
  onToggle,
  onSelect,
}: {
  item: FileNode;
  level: number;
  isOpen: boolean;
  isSelected: boolean;
  hasChildren: boolean;
  onToggle?: () => void;
  onSelect?: () => void;
}) {
  const isDir = item.type === 'dir';

  if (isDir) {
    return (
      <div
        className="flex items-center gap-2 px-2 py-1.5 hover:bg-neutral-100 cursor-pointer text-sm text-neutral-700 transition-colors"
        style={{ paddingLeft: `${level * 16 + 16}px` }}
        onClick={onToggle}
      >
        <Folder size={16} className={isOpen ? 'text-brand-600' : ''} />
        <span className="font-medium">{item.name}</span>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-2 px-2 py-1.5 hover:bg-neutral-100 cursor-pointer text-sm transition-colors ${
        isSelected ? 'bg-brand-50 text-brand-700' : 'text-neutral-600'
      }`}
      style={{ paddingLeft: `${level * 16 + 16}px` }}
      onClick={onSelect}
    >
      <FileText size={16} />
      <span>{item.name}</span>
    </div>
  );
});

export function FileTree({ files, onFileSelect, selectedFile, onLoadDirectory }: FileTreeProps) {
  const [directories, setDirectories] = useState<DirectoryState>({});

  const toggleDirectory = useCallback(async (dir: FileNode) => {
    setDirectories(prev => {
      const currentState = prev[dir.path] || { isOpen: false, children: [], isLoaded: false };

      // Toggle open state
      if (currentState.isOpen) {
        return {
          ...prev,
          [dir.path]: { ...currentState, isOpen: false }
        };
      }

      // If not loaded, we'll load async (return current state first)
      if (!currentState.isLoaded) {
        // Start async load
        onLoadDirectory(dir.path).then(children => {
          setDirectories(p => ({
            ...p,
            [dir.path]: { isOpen: true, children, isLoaded: true }
          }));
        });
        return prev;
      }

      // Just open if already loaded
      return {
        ...prev,
        [dir.path]: { ...currentState, isOpen: true }
      };
    });
  }, [onLoadDirectory]);

  const renderItem = useCallback((item: FileNode, level = 0): JSX.Element => {
    const isDir = item.type === 'dir';
    const dirState = directories[item.path];
    const isOpen = dirState?.isOpen || false;
    const isSelected = selectedFile?.path === item.path;

    if (isDir) {
      return (
        <div key={item.path}>
          <TreeItem
            item={item}
            level={level}
            isOpen={isOpen}
            isSelected={false}
            hasChildren={dirState?.children?.length > 0}
            onToggle={() => toggleDirectory(item)}
          />
          {isOpen && dirState?.children?.length > 0 && (
            <div>
              {dirState.children.map(child => renderItem(child, level + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <TreeItem
        key={item.path}
        item={item}
        level={level}
        isOpen={false}
        isSelected={isSelected}
        hasChildren={false}
        onSelect={() => onFileSelect(item)}
      />
    );
  }, [directories, selectedFile, toggleDirectory, onFileSelect]);

  return (
    <div>
      {files.map(item => renderItem(item))}
    </div>
  );
}
