import React, { useState } from 'react';
import { 
  MessageSquare, 
  User, 
  Settings, 
  Moon, 
  Sun, 
  Plus, 
  MoreHorizontal,
  Globe,
  Hash,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { UserProfilePopover } from '@/components/UserProfilePopover';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface ChatHistory {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  hasExternalSources: boolean;
}

interface ChatSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onNewChat: () => void;
  onOpenSettings: () => void;
  chatHistory: ChatHistory[];
  activeChatId?: string;
  onSelectChat: (chatId: string) => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  isDark,
  onToggleTheme,
  onNewChat,
  onOpenSettings,
  chatHistory,
  activeChatId,
  onSelectChat,
}) => {
  const { user, profile } = useAuth();
  
  const displayName = profile?.full_name || profile?.username || user?.email?.split('@')[0] || 'User';
  return (
    <div className={cn(
      "bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300",
      isCollapsed ? "w-16" : "w-80"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h1 className="font-semibold text-sidebar-foreground">ChatBot UI</h1>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="hover:bg-sidebar-item-hover"
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
        
        {!isCollapsed && (
          <Button
            onClick={onNewChat}
            className="w-full mt-3 bg-gradient-primary hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        )}
      </div>

      {/* Chat History */}
      {!isCollapsed && (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="p-4 pb-2">
            <h2 className="text-sm font-medium text-sidebar-foreground mb-2">Recent Chats</h2>
          </div>
          
          <ScrollArea className="flex-1 px-2">
            <div className="space-y-2 p-2">
              {chatHistory.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => onSelectChat(chat.id)}
                  className={cn(
                    "w-full p-3 rounded-lg text-left transition-colors group",
                    "hover:bg-sidebar-item-hover",
                    activeChatId === chat.id 
                      ? "bg-sidebar-item-active text-sidebar-accent-foreground" 
                      : "text-sidebar-foreground"
                  )}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <MessageSquare className="w-4 h-4 flex-shrink-0" />
                      <h3 className="font-medium truncate text-sm">{chat.title}</h3>
                    </div>
                    {chat.hasExternalSources && (
                      <Globe className="w-3 h-3 text-muted-foreground flex-shrink-0 ml-1" />
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>Updated {chat.updatedAt.toLocaleDateString()}</span>
                    </div>
                    
                    {chat.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {chat.tags.slice(0, 2).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs px-2 py-0.5">
                            <Hash className="w-2 h-2 mr-1" />
                            {tag}
                          </Badge>
                        ))}
                        {chat.tags.length > 2 && (
                          <Badge variant="secondary" className="text-xs px-2 py-0.5">
                            +{chat.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Bottom Actions */}
      <div className="p-4 border-t border-sidebar-border">
        <div className={cn(
          "space-y-2",
          isCollapsed ? "flex flex-col items-center" : ""
        )}>
          <Button
            variant="ghost"
            size={isCollapsed ? "sm" : "default"}
            onClick={onToggleTheme}
            className={cn(
              "hover:bg-sidebar-item-hover",
              isCollapsed ? "w-8 h-8 p-0" : "w-full justify-start"
            )}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {!isCollapsed && (
              <span className="ml-2">{isDark ? 'Light Mode' : 'Dark Mode'}</span>
            )}
          </Button>
          
          <UserProfilePopover>
            <Button
              variant="ghost"
              size={isCollapsed ? "sm" : "default"}
              className={cn(
                "hover:bg-sidebar-item-hover",
                isCollapsed ? "w-8 h-8 p-0" : "w-full justify-start"
              )}
            >
              <User className="w-4 h-4" />
              {!isCollapsed && <span className="ml-2 truncate">{displayName}</span>}
            </Button>
          </UserProfilePopover>
        </div>
      </div>
    </div>
  );
};