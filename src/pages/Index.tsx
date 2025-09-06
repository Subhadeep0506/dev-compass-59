import { useState } from 'react';
import { ChatSidebar } from '@/components/ChatSidebar';
import { ChatMessage } from '@/components/ChatMessage';
import { ChatInput } from '@/components/ChatInput';
import { UserProfilePopover } from '@/components/UserProfilePopover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Trash2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const Index = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState([
    {
      id: '1',
      content: 'Hello! How can I help you today?',
      isUser: false,
      timestamp: new Date(),
    },
  ]);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const displayName = profile?.full_name || profile?.username || user?.email?.split('@')[0] || 'User';

  const handleSendMessage = (content: string) => {
    const userMessage = {
      id: Date.now().toString(),
      content,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        content: "I'm a demo AI assistant. In a real application, this would be connected to an actual AI service.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
    }, 1000);
  };

  const handleDeleteHistory = () => {
    setMessages([
      {
        id: '1',
        content: 'Hello! How can I help you today?',
        isUser: false,
        timestamp: new Date(),
      },
    ]);
    toast({
      title: 'Chat history deleted',
      description: 'All messages have been cleared.',
    });
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const handleNewChat = () => {
    setMessages([
      {
        id: '1',
        content: 'Hello! How can I help you today?',
        isUser: false,
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <div className="h-screen flex bg-background">
      <ChatSidebar
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        onNewChat={handleNewChat}
        onOpenSettings={() => {}} // Removed settings functionality
        chatHistory={[]}
        activeChatId="1"
        onSelectChat={(id) => console.log('Selected chat:', id)}
      />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold">Chat</h1>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear History
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Chat History</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete all chat messages? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteHistory} className="bg-destructive hover:bg-destructive/90">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          <UserProfilePopover>
            <Avatar className="h-8 w-8 cursor-pointer hover:opacity-80 transition-opacity">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback>
                {displayName?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          </UserProfilePopover>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={{
                  id: message.id,
                  content: message.content,
                  sender: message.isUser ? 'user' : 'bot',
                  timestamp: message.timestamp,
                }}
                isDark={isDark}
              />
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="border-t p-6">
          <ChatInput
            onSendMessage={handleSendMessage}
            onOpenChatSettings={() => {}}
            isLoading={false}
            placeholder="Type your message..."
          />
        </div>
      </div>
    </div>
  );
};

export default Index;