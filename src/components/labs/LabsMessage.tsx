import type { ChatMessage } from '../../lib/labs/types';

export default function LabsMessage({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed ${
          isUser
            ? 'bg-[color:var(--labs-accent)] text-white rounded-tr-sm'
            : 'bg-[color:var(--labs-bg-elevated)] text-[color:var(--labs-ink)] border border-[color:var(--labs-rule)] rounded-tl-sm'
        }`}
      >
        <div className="whitespace-pre-wrap">{message.content || (isUser ? '' : '…')}</div>
      </div>
    </div>
  );
}
