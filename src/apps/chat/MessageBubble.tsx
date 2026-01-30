import { memo } from 'react';
import type { Message } from './types';

interface MessageBubbleProps {
  message: Message;
  style?: React.CSSProperties;
}

export const MessageBubble = memo(({ message, style }: MessageBubbleProps) => {
  const baseClasses = "px-5 py-3.5 rounded-2xl text-base leading-relaxed max-w-[85%]";

  const roleClasses = {
    user: "ml-auto bg-neutral-900 text-white",
    assistant: "mr-auto bg-white border border-neutral-200 text-neutral-900 shadow-sm",
    system: "mx-auto bg-amber-50 border border-amber-200 text-amber-800 text-center text-sm"
  };

  return (
    <div
      style={style}
      className={`${baseClasses} ${roleClasses[message.role]}`}
      data-role={message.role}
    >
      {message.content}
    </div>
  );
});

MessageBubble.displayName = 'MessageBubble';
