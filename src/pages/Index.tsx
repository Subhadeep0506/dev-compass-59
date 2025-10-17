import React, { useMemo, useRef, useEffect } from 'react';
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
import { useAppStore } from '@/store';
import { ChatSession, Message } from '@/store/types';

const Index = () => {
  const { user, profile } = useAuth();
  const sidebarPanelRef = useRef<ImperativePanelHandle | null>(null);
  const SIDEBAR_COLLAPSED_SIZE = 6;

  // Store selectors
  const chatSessions = useAppStore((state) => state.chatSessions);
  const activeChatId = useAppStore((state) => state.activeChatId);
  const messages = useAppStore((state) => state.messages);
  const isLoading = useAppStore((state) => state.isLoading);
  const chatSettingsOpen = useAppStore((state) => state.chatSettingsOpen);
  const externalDialogOpen = useAppStore((state) => state.externalDialogOpen);
  const pendingQuery = useAppStore((state) => state.pendingQuery);
  const appSettings = useAppStore((state) => state.appSettings);
  const assistantPanel = useAppStore((state) => state.assistantPanel);
  const storeUser = useAppStore((state) => state.user);

  // Store actions
  const setChatSessions = useAppStore((state) => state.setChatSessions);
  const setActiveChatId = useAppStore((state) => state.setActiveChatId);
  const setMessages = useAppStore((state) => state.setMessages);
  const addMessage = useAppStore((state) => state.addMessage);
  const updateChatSession = useAppStore((state) => state.updateChatSession);
  const deleteChatSession = useAppStore((state) => state.deleteChatSession);
  const setChatSettingsOpen = useAppStore((state) => state.setChatSettingsOpen);
  const setExternalDialogOpen = useAppStore((state) => state.setExternalDialogOpen);
  const setPendingQuery = useAppStore((state) => state.setPendingQuery);
  const toggleTheme = useAppStore((state) => state.toggleTheme);
  const toggleSidebarCollapsed = useAppStore((state) => state.toggleSidebarCollapsed);
  const setRightPanelOpen = useAppStore((state) => state.setRightPanelOpen);
  const addChatSession = useAppStore((state) => state.addChatSession);
  const setAssistantPanel = useAppStore((state) => state.setAssistantPanel);

  const isDark = appSettings.theme === 'dark';
  const sidebarCollapsed = appSettings.sidebarCollapsed;
  const rightPanelOpen = appSettings.rightPanelOpen;
  const externalSources = assistantPanel.externalSources;

  // Use store user data if available, fallback to auth profile
  const displayName = storeUser?.full_name || profile?.full_name || storeUser?.username || profile?.username || user?.email?.split('@')[0] || 'User';
  const userAvatar = storeUser?.avatar_url || profile?.avatar_url;

  const knowledgeKeywords = useMemo(
    () => [
      'godot', 'gdscript', 'node', 'scene', 'signals', 'animation', 'physics', 'input',
      'sprite', 'characterbody', 'raycast', 'area', 'tilemap', 'http', 'yield', 'await'
    ],
    []
  );

  // Sync sidebar collapse state with panel
  useEffect(() => {
    if (sidebarCollapsed && sidebarPanelRef.current) {
      sidebarPanelRef.current.collapse();
    } else if (!sidebarCollapsed && sidebarPanelRef.current) {
      sidebarPanelRef.current.expand();
    }
  }, [sidebarCollapsed]);

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

    addMessage(userMessage);

    const foundInDocs = knowledgeKeywords.some(k => content.toLowerCase().includes(k));

    if (foundInDocs) {
      useAppStore.setState({ isLoading: true });
      setTimeout(() => {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: generateDocsAnswer(content),
          isUser: false,
          timestamp: new Date(),
        };
        addMessage(aiMessage);
        useAppStore.setState({ isLoading: false });
      }, 800);
    } else {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content:
          "I couldn't find this in the Godot docs. Would you like me to search external sources (Reddit, Stack Overflow, GitHub, web)?",
        isUser: false,
        timestamp: new Date(),
      };
      addMessage(aiMessage);
      setPendingQuery(content);
      setExternalDialogOpen(true);
    }
  };

  const handleApproveExternal = (sources: string[]) => {
    setExternalDialogOpen(false);
    useAppStore.setState({ isLoading: true });
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 2).toString(),
        content:
          `Searching ${sources.join(', ')}...\n\nHere are summarized findings:\n\n- Community tips suggest verifying your project uses Godot 4.x APIs.\n- GitHub issues often point to using signals over polling.\n\n\`\`\`language-gdscript\n# Example adjustment\n@onready var body: CharacterBody2D = $CharacterBody2D\n\nfunc _physics_process(delta):\n    var input := Vector2.ZERO\n    input.x = Input.get_action_strength("ui_right") - Input.get_action_strength("ui_left")\n    body.velocity.x = input.x * 200\n    body.move_and_slide()\n\n\`\`\`\n\nIf this helps, I can gather links from ${sources.join(', ')}.`,
        isUser: false,
        timestamp: new Date(),
        sources,
      };
      addMessage(aiMessage);
      if (activeChatId) {
        updateChatSession(activeChatId, {
          hasExternalSources: true,
          tags: Array.from(new Set([...(chatSessions.find(s => s.id === activeChatId)?.tags || []), ...sources])),
        });
      }
      useAppStore.setState({ isLoading: false });
    }, 1200);
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
    addChatSession(newSession);
    setActiveChatId(newId);
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
          onCollapse={() => useAppStore.setState({ appSettings: { ...appSettings, sidebarCollapsed: true } })}
          onExpand={() => useAppStore.setState({ appSettings: { ...appSettings, sidebarCollapsed: false } })}
          onResize={(size) => {
            if (sidebarCollapsed && size > SIDEBAR_COLLAPSED_SIZE + 0.1) {
              useAppStore.setState({ appSettings: { ...appSettings, sidebarCollapsed: false } });
              sidebarPanelRef.current?.expand();
            }
          }}
        >
          <ChatSidebar
            isCollapsed={sidebarCollapsed}
            onToggleCollapse={() => {
              toggleSidebarCollapsed();
            }}
            isDark={isDark}
            onToggleTheme={toggleTheme}
            onNewChat={handleNewChat}
            onOpenSettings={() => { }}
            chatHistory={chatSessions.map(s => ({ id: s.id, title: s.title, createdAt: s.createdAt, updatedAt: s.updatedAt, tags: s.tags, hasExternalSources: s.hasExternalSources, pinned: s.pinned }))}
            activeChatId={activeChatId}
            onSelectChat={(id) => { setActiveChatId(id); }}
            onDeleteChat={(id) => {
              deleteChatSession(id);
            }}
            onTogglePin={(id) => {
              const session = chatSessions.find(s => s.id === id);
              if (session) {
                updateChatSession(id, { pinned: !session.pinned });
              }
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
                    <AvatarImage src={userAvatar} />
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
        onToggleSource={(k) => setAssistantPanel({ externalSources: { ...externalSources, [k]: !externalSources[k as keyof typeof externalSources] } })}
      />
    </div>
  );
};

export default Index;
