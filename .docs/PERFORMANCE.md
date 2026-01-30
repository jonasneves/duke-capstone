# Performance Optimizations

## Transition Speed Guidelines

For a snappy, responsive UI:
- **100ms**: Interactive elements (buttons, inputs, menus)
- **150ms**: Card hovers, moderate animations
- **200ms**: Complex animations only (avoid if possible)

## Recent Optimizations

### User Menu
- Dropdown animation: 200ms → **100ms**
- Button hover expansion: 300ms → **150ms**
- Name reveal transition: 300ms → **150ms**

**Result**: Menu now opens instantly, feels much more responsive

### App Gallery
- Card hover effects: 200ms → **150ms**
- Launch button animation: 200ms → **150ms**
- Arrow icon transition: 200ms → **150ms**

**Result**: Cards feel more interactive and immediate

### Chat App
- Input focus ring: default → **100ms**
- Send button hover: default → **100ms**

**Result**: Input interactions feel instant

### Todo App
- Filter pill toggle: 200ms → **100ms**

**Result**: Filter switching feels immediate

### Settings App
- Storage bar animation: 300ms → **150ms**

**Result**: Progress bars update smoothly without lag

## Best Practices

1. **Critical interactions** (clicks, focus): 100ms or instant
2. **Visual feedback** (hovers, highlights): 100-150ms
3. **Decorative animations** (slides, fades): 150ms max
4. **Avoid**: Transitions over 200ms (feels sluggish)

## What NOT to Optimize

- **Loading spinners**: Keep smooth (1s is fine)
- **Breathe animations**: Slow is intentional
- **Toast notifications**: 300ms entry/exit is acceptable
