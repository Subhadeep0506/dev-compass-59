import React, { useMemo, useState } from 'react';
import {
  MessageSquare,
  User,
  Settings,
  Moon,
  Sun,
  Plus,
  Sidebar,
  Globe,
  Hash,
  Clock,
  Trash2,
  SlidersHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { UserProfilePopover } from '@/components/UserProfilePopover';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAuth } from '@/hooks/useAuth';
import { useAppStore } from '@/store';
import { cn } from '@/lib/utils';

interface ChatHistory {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  hasExternalSources: boolean;
  pinned?: boolean;
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
  onDeleteChat: (chatId: string) => void;
  onTogglePin: (chatId: string) => void;
  onOpenRightPanel: () => void;
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
  onDeleteChat,
  onTogglePin,
  onOpenRightPanel,
}) => {
  const { user, profile } = useAuth();
  const storeUser = useAppStore((state) => state.user);
  const [query, setQuery] = useState('');

  // Use store user data if available, fallback to auth profile
  const displayName = storeUser?.full_name || profile?.full_name || storeUser?.username || profile?.username || user?.email?.split('@')[0] || 'User';
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return chatHistory.filter(c => c.title.toLowerCase().includes(q));
  }, [chatHistory, query]);
  const pinned = filtered.filter(c => c.pinned);
  const recent = filtered.filter(c => !c.pinned);
  return (
    <div className={cn(
      "bg-sidebar border-r border-sidebar-border flex flex-col h-full transition-all duration-300",
      "w-full"
    )}>
      {/* Header */}
      <div className="p-2 border-b border-sidebar-border">
        <div className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"}`}>
          {!isCollapsed && (
            <h1 className="font-semibold text-sidebar-foreground">ChatBot UI</h1>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className="hover:bg-sidebar-item-hover"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={isCollapsed ? "Expand" : "Collapse"}
          >
            <Sidebar className="w-4 h-4" />
          </Button>
        </div>

        {!isCollapsed && (
          <>
            <Button
              onClick={onNewChat}
              className="w-full mt-3 bg-gradient-primary hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </Button>
            <div className="mt-3">
              <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search chats"
                className="w-full h-9 rounded-md border bg-background px-3 text-sm"
              />
            </div>
          </>
        )}
      </div>

      {isCollapsed && (
        <>
          <div className="p-3 flex items-center justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={onNewChat}
              className="w-8 h-8 p-0 hover:bg-sidebar-item-hover"
              aria-label="New Chat"
              title="New Chat"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex-1" />
        </>
      )}

      {/* Chat History */}
      {!isCollapsed && (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="p-4 pb-2">
            <h2 className="text-sm font-medium text-sidebar-foreground mb-2">Pinned</h2>
          </div>
          <ScrollArea className="max-h-40 px-2">
            <div className="space-y-2 p-2">
              {pinned.length === 0 && (
                <div className="text-xs text-muted-foreground px-2">No pinned chats</div>
              )}
              {pinned.map((chat) => (
                <div key={chat.id} className={cn(
                  'w-full p-3 rounded-lg text-left transition-colors group',
                  'hover:bg-sidebar-item-hover',
                  activeChatId === chat.id ? 'bg-sidebar-item-active text-sidebar-accent-foreground' : 'text-sidebar-foreground'
                )} onClick={() => onSelectChat(chat.id)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <MessageSquare className="w-4 h-4 flex-shrink-0" />
                      <h3 className="font-medium truncate text-sm">{chat.title}</h3>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={(e) => { e.stopPropagation(); onTogglePin(chat.id); }} title="Unpin">
                      ★
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="p-4 pb-2">
            <h2 className="text-sm font-medium text-sidebar-foreground mb-2">Recent Chats</h2>
          </div>

          <ScrollArea className="flex-1 px-2">
            <div className="space-y-2 p-2">
              {recent.map((chat) => (
                <div
                  role="button"
                  tabIndex={0}
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
                    <div className="flex items-center gap-1 ml-1">
                      {chat.hasExternalSources && (
                        <Globe className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                      )}
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={(e) => { e.stopPropagation(); onTogglePin(chat.id); }} title="Pin">
                        ☆
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100"
                            onClick={(e) => { e.stopPropagation(); }}
                            title="Delete chat"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Chat</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete this chat and its messages. Are you sure?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => onDeleteChat(chat.id)} className="bg-destructive hover:bg-destructive/90">
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
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
                </div>
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

          <Button
            variant="ghost"
            size={isCollapsed ? "sm" : "default"}
            onClick={onOpenRightPanel}
            className={cn(
              "hover:bg-sidebar-item-hover",
              isCollapsed ? "w-8 h-8 p-0" : "w-full justify-start"
            )}
          >
            <SlidersHorizontal className="w-4 h-4" />
            {!isCollapsed && (
              <span className="ml-2">Assistant Panel</span>
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
