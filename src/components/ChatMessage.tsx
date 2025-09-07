import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Info, User, Bot, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: {
    id: string;
    content: string;
    sender: 'user' | 'bot';
    timestamp: Date;
    sources?: string[];
  };
  isDark?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isDark = false }) => {
  const isUser = message.sender === 'user';

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {}
  };

  return (
    <div className={cn(
      'flex gap-3 max-w-4xl mx-auto p-4 group',
      isUser ? 'flex-row-reverse' : 'flex-row'
    )}>
      {/* Avatar */}
      <div className={cn(
        'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
        isUser ? 'bg-gradient-primary' : 'bg-muted'
      )}>
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-muted-foreground" />
        )}
      </div>

      {/* Message Content */}
      <div className={cn(
        'flex-1 min-w-0 space-y-2',
        isUser ? 'flex flex-col items-end' : ''
      )}>
        <div className={cn(
          'relative px-4 py-3 rounded-2xl shadow-chat max-w-[85%] break-words',
          isUser
            ? 'bg-chat-bubble-user text-chat-bubble-user-foreground ml-8'
            : 'bg-chat-bubble-bot text-chat-bubble-bot-foreground mr-8'
        )}>
          {isUser ? (
            <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
          ) : (
            <div className="message-content prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  a: ({ href, children }) => (
                    <a href={href as string} target="_blank" rel="noreferrer" className="text-primary underline">
                      {children}
                    </a>
                  ),
                  ul: ({ children }) => <ul className="list-disc pl-6 space-y-1">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal pl-6 space-y-1">{children}</ol>,
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 pl-4 italic text-muted-foreground">{children}</blockquote>
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-3">
                      <table className="min-w-full border border-border/50 rounded-md">{children}</table>
                    </div>
                  ),
                  th: ({ children }) => (
                    <th className="border-b border-border/60 bg-muted/40 text-left px-3 py-2 text-sm font-medium">{children}</th>
                  ),
                  td: ({ children }) => (
                    <td className="border-b border-border/40 px-3 py-2 align-top text-sm">{children}</td>
                  ),
                  code({ node, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '');
                    const isInline = !match;
                    const code = String(children).replace(/\n$/, '');

                    return !isInline ? (
                      <div className="code-block my-3 rounded-md border border-border/60 overflow-hidden">
                        <div className="flex items-center justify-between px-3 py-1.5 text-xs bg-muted/50">
                          <span className="font-mono text-muted-foreground">{match?.[1] || 'code'}</span>
                          <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => copyToClipboard(code)}>
                            <Copy className="w-3 h-3 mr-1" /> Copy
                          </Button>
                        </div>
                        <SyntaxHighlighter
                          style={isDark ? oneDark : oneLight}
                          language={match?.[1]}
                          PreTag="div"
                          className="rounded-none"
                        >
                          {code}
                        </SyntaxHighlighter>
                      </div>
                    ) : (
                      <code className="px-1 py-0.5 rounded bg-muted/60" {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}

          {/* Info Icon for Bot Messages */}
          {!isUser && message.sources && message.sources.length > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute -bottom-1 -right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Info className="w-3 h-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-1">
                    <p className="font-medium">Sources:</p>
                    {message.sources.map((source, index) => (
                      <p key={index} className="text-xs">{source}</p>
                    ))}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {/* Timestamp */}
        <p className={cn(
          'text-xs text-muted-foreground px-2',
          isUser ? 'text-right' : 'text-left'
        )}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
};
