import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

export interface UserMenuItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  variant?: 'default' | 'danger';
  component?: ReactNode;
}

interface UserMenuContextValue {
  customItems: UserMenuItem[];
  setCustomItems: (items: UserMenuItem[]) => void;
  clearCustomItems: () => void;
}

const UserMenuContext = createContext<UserMenuContextValue | null>(null);

export function UserMenuProvider({ children }: { children: ReactNode }) {
  const [customItems, setCustomItems] = useState<UserMenuItem[]>([]);

  const clearCustomItems = useCallback(() => {
    setCustomItems([]);
  }, []);

  return (
    <UserMenuContext.Provider value={{ customItems, setCustomItems, clearCustomItems }}>
      {children}
    </UserMenuContext.Provider>
  );
}

export function useUserMenu() {
  const context = useContext(UserMenuContext);
  if (!context) {
    throw new Error('useUserMenu must be used within UserMenuProvider');
  }
  return context;
}
