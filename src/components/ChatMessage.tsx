import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Info, User, Bot } from 'lucide-react';
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

  return (
    <div className={cn(
      "flex gap-3 max-w-4xl mx-auto p-4 group",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      {/* Avatar */}
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
        isUser ? "bg-gradient-primary" : "bg-muted"
      )}>
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-muted-foreground" />
        )}
      </div>

      {/* Message Content */}
      <div className={cn(
        "flex-1 min-w-0 space-y-2",
        isUser ? "flex flex-col items-end" : ""
      )}>
        <div className={cn(
          "relative px-4 py-3 rounded-2xl shadow-chat max-w-[85%] break-words",
          isUser 
            ? "bg-chat-bubble-user text-chat-bubble-user-foreground ml-8"
            : "bg-chat-bubble-bot text-chat-bubble-bot-foreground mr-8"
        )}>
          {isUser ? (
            <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
          ) : (
            <div className="message-content">
              <ReactMarkdown
                components={{
                  code({ node, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '');
                    const isInline = !match;
                    
                    return !isInline ? (
                      <div className="code-block my-3">
                        <SyntaxHighlighter
                          style={isDark ? oneDark : oneLight}
                          language={match[1]}
                          PreTag="div"
                          className="rounded-lg"
                        >
                          {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                      </div>
                    ) : (
                      <code className={className} {...props}>
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
          "text-xs text-muted-foreground px-2",
          isUser ? "text-right" : "text-left"
        )}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
};