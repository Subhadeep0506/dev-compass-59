import React, { useState, useMemo, useRef } from 'react';
import { ChatSidebar } from '@/components/ChatSidebar';
import { ChatMessage } from '@/components/ChatMessage';
import { ChatInput } from '@/components/ChatInput';
import { UserProfilePopover } from '@/components/UserProfilePopover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { SettingsDialog } from '@/components/SettingsDialog';
import { ExternalSourceDialog } from '@/components/ExternalSourceDialog';
import { RightPanel } from '@/components/RightPanel';
import { Button } from '@/components/ui/button';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { ImperativePanelHandle } from 'react-resizable-panels';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  sources?: string[];
}

const Index = () => {
  const { user, profile } = useAuth();
  const initialMessage: Message = {
    id: '1',
    content:
      'Hi! Ask me anything about the Godot docs. I can format answers with markdown, code blocks, tables, and lists. If the docs lack an answer, I can search sources like Reddit, the web, and GitHub after you approve.',
    isUser: false,
    timestamp: new Date(),
  };
  interface ChatSession {
    id: string;
    title: string;
    createdAt: Date;
    updatedAt: Date;
    tags: string[];
    hasExternalSources: boolean;
    pinned?: boolean;
    messages: Message[];
  }
  const initialChatId = Date.now().toString();
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([
    {
      id: initialChatId,
      title: 'New Chat',
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: [],
      hasExternalSources: false,
      pinned: false,
      messages: [initialMessage],
    },
  ]);
  const [activeChatId, setActiveChatId] = useState<string>(initialChatId);
  const [messages, setMessages] = useState<Message[]>([initialMessage]);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const sidebarPanelRef = useRef<ImperativePanelHandle | null>(null);
  const SIDEBAR_COLLAPSED_SIZE = 6;
  const [isDark, setIsDark] = useState(false);
  const [chatSettingsOpen, setChatSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [externalDialogOpen, setExternalDialogOpen] = useState(false);
  const [pendingQuery, setPendingQuery] = useState('');
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [externalSources, setExternalSources] = useState<Record<'reddit' | 'stackoverflow' | 'github' | 'web', boolean>>({
    reddit: true,
    stackoverflow: true,
    github: true,
    web: true,
  });

  const displayName = profile?.full_name || profile?.username || user?.email?.split('@')[0] || 'User';

  const knowledgeKeywords = useMemo(
    () => [
      'godot', 'gdscript', 'node', 'scene', 'signals', 'animation', 'physics', 'input',
      'sprite', 'characterbody', 'raycast', 'area', 'tilemap', 'http', 'yield', 'await'
    ],
    []
  );

  const generateDocsAnswer = (query: string): string => {
    return `### Answer based on Godot docs\n\nHere's a brief example using GDScript:\n\n\`\`\`language-gdscript\nextends Node\n\nfunc _ready():\n    var timer := Timer.new()\n    add_child(timer)\n    timer.wait_time = 1.0\n    timer.one_shot = true\n    timer.start()\n    timer.timeout.connect(_on_timeout)\n\nfunc _on_timeout():\n    print("Timer fired!")\n\n\`\`\`\n\n- Use signals to react to events\n- Prefer \`await\` over deprecated \`yield\` in 4.x\n\n| Concept | API |\n|--------|-----|\n| Timers | Timer |\n| Signals | .connect |\n\nIf you need a deeper dive about "${query}", let me know.`;
  };

  const handleSendMessage = (content: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setChatSessions(prev => prev.map(s => s.id === activeChatId ? {
      ...s,
      messages: [...s.messages, userMessage],
      updatedAt: new Date(),
      title: s.messages.length <= 1 ? content.slice(0, 60) : s.title,
    } : s));

    const foundInDocs = knowledgeKeywords.some(k => content.toLowerCase().includes(k));

    if (foundInDocs) {
      setIsLoading(true);
      setTimeout(() => {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: generateDocsAnswer(content),
          isUser: false,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
        setChatSessions(prev => prev.map(s => s.id === activeChatId ? {
          ...s,
          messages: [...s.messages, aiMessage],
          updatedAt: new Date(),
        } : s));
        setIsLoading(false);
      }, 800);
    } else {
      // Not found in docs -> ask for external search approval
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content:
          "I couldn't find this in the Godot docs. Would you like me to search external sources (Reddit, Stack Overflow, GitHub, web)?",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
      setChatSessions(prev => prev.map(s => s.id === activeChatId ? {
        ...s,
        messages: [...s.messages, aiMessage],
        updatedAt: new Date(),
      } : s));
      setPendingQuery(content);
      setExternalDialogOpen(true);
    }
  };

  const handleApproveExternal = (sources: string[]) => {
    setExternalDialogOpen(false);
    setIsLoading(true);
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 2).toString(),
        content:
          `Searching ${sources.join(', ')}...\n\nHere are summarized findings:\n\n- Community tips suggest verifying your project uses Godot 4.x APIs.\n- GitHub issues often point to using signals over polling.\n\n\`\`\`language-gdscript\n# Example adjustment\n@onready var body: CharacterBody2D = $CharacterBody2D\n\nfunc _physics_process(delta):\n    var input := Vector2.ZERO\n    input.x = Input.get_action_strength("ui_right") - Input.get_action_strength("ui_left")\n    body.velocity.x = input.x * 200\n    body.move_and_slide()\n\n\`\`\`\n\nIf this helps, I can gather links from ${sources.join(', ')}.`,
        isUser: false,
        timestamp: new Date(),
        sources,
      };
      setMessages(prev => [...prev, aiMessage]);
      setChatSessions(prev => prev.map(s => s.id === activeChatId ? {
        ...s,
        hasExternalSources: true,
        messages: [...s.messages, aiMessage],
        updatedAt: new Date(),
        tags: Array.from(new Set([...(s.tags || []), ...sources])),
      } : s));
      setIsLoading(false);
    }, 1200);
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const handleNewChat = () => {
    const newId = Date.now().toString();
    const botMsg: Message = {
      id: '1',
      content:
        'Hi! Ask me anything about the Godot docs. I can format answers with markdown, code blocks, tables, and lists. If the docs lack an answer, I can search sources like Reddit, the web, and GitHub after you approve.',
      isUser: false,
      timestamp: new Date(),
    };
    const newSession: ChatSession = {
      id: newId,
      title: 'New Chat',
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: [],
      hasExternalSources: false,
      pinned: false,
      messages: [botMsg],
    };
    setChatSessions(prev => [newSession, ...prev]);
    setActiveChatId(newId);
    setMessages([botMsg]);
  };

  return (
    <div className="h-screen bg-background">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel
          ref={sidebarPanelRef}
          collapsible
          collapsedSize={SIDEBAR_COLLAPSED_SIZE}
          defaultSize={24}
          minSize={8}
          maxSize={40}
          onCollapse={() => setSidebarCollapsed(true)}
          onExpand={() => setSidebarCollapsed(false)}
          onResize={(size) => {
            if (sidebarCollapsed && size > SIDEBAR_COLLAPSED_SIZE + 0.1) {
              setSidebarCollapsed(false);
              sidebarPanelRef.current?.expand();
            }
          }}
        >
          <ChatSidebar
            isCollapsed={sidebarCollapsed}
            onToggleCollapse={() => {
              setSidebarCollapsed((prev) => {
                const next = !prev;
                const ref = sidebarPanelRef.current;
                if (ref) {
                  if (next) ref.collapse();
                  else ref.expand();
                }
                return next;
              });
            }}
            isDark={isDark}
            onToggleTheme={toggleTheme}
            onNewChat={handleNewChat}
            onOpenSettings={() => { }}
            chatHistory={chatSessions.map(s => ({ id: s.id, title: s.title, createdAt: s.createdAt, updatedAt: s.updatedAt, tags: s.tags, hasExternalSources: s.hasExternalSources, pinned: s.pinned }))}
            activeChatId={activeChatId}
            onSelectChat={(id) => { setActiveChatId(id); const session = chatSessions.find(s => s.id === id); if (session) { setMessages(session.messages); } }}
            onDeleteChat={(id) => {
              setChatSessions(prev => prev.filter(s => s.id !== id));
              if (activeChatId === id) {
                setTimeout(() => {
                  setChatSessions(curr => {
                    if (curr.length > 0) {
                      const next = curr[0];
                      setActiveChatId(next.id);
                      setMessages(next.messages);
                    } else {
                      const newId = Date.now().toString();
                      const botMsg: Message = { id: '1', content: 'Hi! Ask me anything about the Godot docs. I can format answers with markdown, code blocks, tables, and lists. If the docs lack an answer, I can search sources like Reddit, the web, and GitHub after you approve.', isUser: false, timestamp: new Date() };
                      const newSession = { id: newId, title: 'New Chat', createdAt: new Date(), updatedAt: new Date(), tags: [], hasExternalSources: false, pinned: false, messages: [botMsg] };
                      setActiveChatId(newId);
                      setMessages([botMsg]);
                      return [newSession];
                    }
                    return curr;
                  });
                }, 0);
              }
            }}
            onTogglePin={(id) => {
              setChatSessions(prev => prev.map(s => s.id === id ? { ...s, pinned: !s.pinned } : s));
            }}
            onOpenRightPanel={() => setRightPanelOpen(true)}
          />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={76} minSize={40}>
          <div className="h-full flex flex-col relative">
            {/* Header */}
            <div className="h-16 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-6">
              <div className="flex items-center gap-4">
                <h1 className="text-lg font-semibold">Chat</h1>
              </div>
              <div className="flex items-center gap-2">
                <UserProfilePopover>
                  <Avatar className="h-8 w-8 cursor-pointer hover:opacity-80 transition-opacity">
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback>
                      {displayName?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </UserProfilePopover>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-auto p-6 pb-48">
              <div className="max-w-4xl mx-auto space-y-6">
                {messages.map((message) => (
                  <ChatMessage
                    key={message.id}
                    message={{
                      id: message.id,
                      content: message.content,
                      sender: message.isUser ? 'user' : 'bot',
                      timestamp: message.timestamp,
                      sources: message.sources,
                    }}
                    isDark={isDark}
                    onFollowupClick={(t) => handleSendMessage(t)}
                  />
                ))}
                {isLoading && (
                  <div className="flex gap-3 max-w-4xl mx-auto p-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted" />
                    <div className="px-4 py-3 rounded-2xl bg-chat-bubble-bot shadow-chat max-w-[85%]">
                      <div className="h-4 w-40 bg-muted/60 rounded animate-pulse mb-2" />
                      <div className="h-4 w-56 bg-muted/40 rounded animate-pulse" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom gradient overlay for appearance effect */}
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background via-background/80 to-transparent z-40" />
            {/* Input */}
            <ChatInput
              onSendMessage={handleSendMessage}
              onOpenChatSettings={() => setChatSettingsOpen(true)}
              isLoading={isLoading}
              placeholder="Ask about Godot docs..."
            />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
      <SettingsDialog open={chatSettingsOpen} onOpenChange={setChatSettingsOpen} title="Chat Settings" description="Customize how the assistant responds." />
      <ExternalSourceDialog
        open={externalDialogOpen}
        onOpenChange={setExternalDialogOpen}
        onApprove={handleApproveExternal}
        query={pendingQuery}
        defaultSelectedSources={Object.entries(externalSources).filter(([, v]) => v).map(([k]) => k as any)}
      />
      <RightPanel
        open={rightPanelOpen}
        onOpenChange={setRightPanelOpen}
        sessionTags={(chatSessions.find(s => s.id === activeChatId)?.tags) || []}
        externalSources={externalSources}
        onToggleSource={(k) => setExternalSources(prev => ({ ...prev, [k]: !prev[k] }))}
      />
    </div>
  );
};

export default Index;
