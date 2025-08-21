import React, { useState, useEffect } from 'react';
import { ChatSidebar } from '@/components/ChatSidebar';
import { ChatMessage } from '@/components/ChatMessage';
import { ChatInput } from '@/components/ChatInput';
import { SettingsDialog } from '@/components/SettingsDialog';
import { ExternalSourceDialog } from '@/components/ExternalSourceDialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  sources?: string[];
}

interface ChatHistory {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  hasExternalSources: boolean;
}

const Index = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [externalSourceOpen, setExternalSourceOpen] = useState(false);
  const [currentQuery, setCurrentQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hello! I\'m your AI assistant. I can help you with programming questions, general knowledge, and much more. If I don\'t know something, I can search external sources like Reddit and Stack Overflow for you.',
      sender: 'bot',
      timestamp: new Date(),
    }
  ]);

  const [chatHistory] = useState<ChatHistory[]>([
    {
      id: '1',
      title: 'React Hooks Best Practices',
      createdAt: new Date(Date.now() - 86400000 * 2),
      updatedAt: new Date(Date.now() - 86400000),
      tags: ['react', 'javascript', 'frontend'],
      hasExternalSources: true,
    },
    {
      id: '2',
      title: 'Python Data Analysis Question',
      createdAt: new Date(Date.now() - 86400000 * 5),
      updatedAt: new Date(Date.now() - 86400000 * 3),
      tags: ['python', 'data-science'],
      hasExternalSources: false,
    },
    {
      id: '3',
      title: 'CSS Grid Layout Help',
      createdAt: new Date(Date.now() - 86400000 * 7),
      updatedAt: new Date(Date.now() - 86400000 * 6),
      tags: ['css', 'layout', 'frontend'],
      hasExternalSources: true,
    }
  ]);

  // Theme management
  useEffect(() => {
    const theme = localStorage.getItem('theme');
    if (theme === 'dark') {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    
    if (newTheme) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      // Check if we should prompt for external sources
      const shouldSearchExternal = content.toLowerCase().includes('error') || 
                                  content.toLowerCase().includes('bug') ||
                                  content.toLowerCase().includes('issue') ||
                                  content.toLowerCase().includes('problem');

      if (shouldSearchExternal && Math.random() > 0.5) {
        setCurrentQuery(content);
        setExternalSourceOpen(true);
        setIsLoading(false);
      } else {
        // Generate a mock response
        const responses = [
          "That's a great question! Here's what I can tell you:\n\n```javascript\nconst example = () => {\n  console.log('Hello, World!');\n};\n```\n\nThis demonstrates a basic function in JavaScript.",
          "I'd be happy to help you with that. Let me break it down:\n\n1. **First step**: Understanding the problem\n2. **Second step**: Planning the solution\n3. **Third step**: Implementation\n\nWould you like me to elaborate on any of these steps?",
          "Based on my knowledge, here's the most effective approach:\n\n> **Important Note**: This is a best practice recommendation.\n\nThe key principle to remember is that consistency and readability should always be your priority.",
        ];

        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: responses[Math.floor(Math.random() * responses.length)],
          sender: 'bot',
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, botMessage]);
        setIsLoading(false);
      }
    }, 1500);
  };

  const handleExternalSourceApprove = () => {
    setExternalSourceOpen(false);
    setIsLoading(true);

    // Simulate external source search
    setTimeout(() => {
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `I searched external sources for "${currentQuery}" and found some helpful information:\n\n**From Reddit r/programming:**\n\n> This is a common issue that many developers face. The solution usually involves checking your configuration files.\n\n**From Stack Overflow:**\n\n\`\`\`python\n# Here's a working solution\ndef fix_issue():\n    return "Problem solved!"\n\`\`\`\n\nThese sources provided comprehensive solutions that should help resolve your issue.`,
        sender: 'bot',
        timestamp: new Date(),
        sources: ['Reddit r/programming', 'Stack Overflow', 'GitHub Issues'],
      };

      setMessages(prev => [...prev, botMessage]);
      setIsLoading(false);
    }, 2000);
  };

  const handleNewChat = () => {
    setMessages([
      {
        id: '1',
        content: 'Hello! I\'m your AI assistant. How can I help you today?',
        sender: 'bot',
        timestamp: new Date(),
      }
    ]);
  };

  return (
    <div className="h-screen flex bg-chat-bg">
      {/* Sidebar */}
      <ChatSidebar
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        onNewChat={handleNewChat}
        onOpenSettings={() => setSettingsOpen(true)}
        chatHistory={chatHistory}
        activeChatId="1"
        onSelectChat={(id) => console.log('Selected chat:', id)}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="lg:hidden bg-chat-header border-b border-border p-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <h1 className="font-semibold">ChatBot UI</h1>
          <div className="w-8" /> {/* Spacer */}
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1">
          <div className="py-6">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                isDark={isDark}
              />
            ))}
            {isLoading && (
              <div className="flex gap-3 max-w-4xl mx-auto p-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full bg-muted-foreground animate-pulse" />
                </div>
                <div className="bg-chat-bubble-bot text-chat-bubble-bot-foreground px-4 py-3 rounded-2xl shadow-chat">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse delay-100" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse delay-200" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <ChatInput
          onSendMessage={handleSendMessage}
          onOpenConfig={() => setSettingsOpen(true)}
          isLoading={isLoading}
          placeholder="Ask me anything... I can help with coding, general questions, and more!"
        />
      </div>

      {/* Dialogs */}
      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
      />

      <ExternalSourceDialog
        open={externalSourceOpen}
        onOpenChange={setExternalSourceOpen}
        onApprove={handleExternalSourceApprove}
        query={currentQuery}
      />
    </div>
  );
};

export default Index;
