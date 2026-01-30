# User Menu Context

Allows apps to add custom menu items to the user menu.

## Usage

```tsx
import { useEffect } from 'react';
import { useUserMenu } from '@/framework';
import { Icon } from 'lucide-react';

export default function MyApp() {
  const { setCustomItems, clearCustomItems } = useUserMenu();

  useEffect(() => {
    setCustomItems([
      // Button item
      {
        id: 'my-action',
        label: 'My Action',
        icon: Icon,
        onClick: () => console.log('Action clicked'),
        variant: 'default' // or 'danger'
      },
      // Custom component item
      {
        id: 'my-component',
        label: 'Settings',
        onClick: () => {},
        component: (
          <div className="px-4 py-3">
            <label className="block text-xs font-medium text-neutral-500 mb-2">
              Option
            </label>
            <select className="w-full px-3 py-2 text-sm bg-white border border-neutral-200 rounded-lg">
              <option>Option 1</option>
              <option>Option 2</option>
            </select>
          </div>
        )
      }
    ]);

    // Cleanup when component unmounts
    return () => clearCustomItems();
  }, [setCustomItems, clearCustomItems]);

  return <div>My App</div>;
}
```

## Example: Chat App

See `src/apps/chat/ChatApp.tsx` for a real implementation that adds:
- Model selector dropdown
- Clear chat button
