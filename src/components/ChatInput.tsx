import React, { useState, useRef } from 'react';
import { Send, Settings, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onOpenConfig: () => void;
  isLoading?: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onOpenConfig,
  isLoading = false,
  placeholder = "Type your message here..."
}) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSendMessage(message.trim());
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  return (
    <div className="sticky bottom-0 bg-chat-header border-t border-border p-4">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-end gap-2 bg-chat-input rounded-2xl border border-border p-3 shadow-chat">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onOpenConfig}
              className="hover:bg-muted flex-shrink-0"
            >
              <Settings className="w-4 h-4" />
            </Button>
            
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={isLoading}
              className={cn(
                "flex-1 min-h-[40px] max-h-[120px] resize-none border-0 bg-transparent",
                "focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground",
                "scrollbar-thin scrollbar-thumb-muted-foreground/20"
              )}
              style={{ height: 'auto' }}
            />
            
            <Button
              type="submit"
              disabled={!message.trim() || isLoading}
              className={cn(
                "flex-shrink-0 h-10 w-10 p-0",
                !message.trim() || isLoading
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-gradient-primary hover:opacity-90 text-white"
              )}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Press Enter to send, Shift + Enter for new line
          </p>
        </form>
      </div>
    </div>
  );
};