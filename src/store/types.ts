export interface Message {
    id: string;
    content: string;
    isUser: boolean;
    timestamp: Date;
    sources?: string[];
  }
  
  export interface ChatSession {
    id: string;
    title: string;
    createdAt: Date;
    updatedAt: Date;
    tags: string[];
    hasExternalSources: boolean;
    pinned?: boolean;
    messages: Message[];
  }
  
  export interface UserProfile {
    id?: string;
    user_id?: string;
    username?: string;
    full_name?: string;
    avatar_url?: string;
    email?: string;
  }
  
  export interface ChatSettings {
    searchApprovalEnabled: boolean;
    externalSources: {
      reddit: boolean;
      stackoverflow: boolean;
      github: boolean;
      web: boolean;
    };
  }
  
  export interface AppSettings {
    theme: 'light' | 'dark';
    sidebarCollapsed: boolean;
    rightPanelOpen: boolean;
  }
  
  export interface AssistantPanel {
    isOpen: boolean;
    selectedTags: string[];
    externalSources: {
      reddit: boolean;
      stackoverflow: boolean;
      github: boolean;
      web: boolean;
    };
  }
  
  export interface AppState {
    // User related
    user: UserProfile | null;
    
    // Chat sessions
    chatSessions: ChatSession[];
    activeChatId: string | null;
    
    // Messages
    messages: Message[];
    
    // Settings
    chatSettings: ChatSettings;
    appSettings: AppSettings;
    
    // Assistant panel
    assistantPanel: AssistantPanel;
    
    // Loading states
    isLoading: boolean;
    
    // Dialog states
    chatSettingsOpen: boolean;
    externalDialogOpen: boolean;
    pendingQuery: string;
    
    // Actions
    setUser: (user: UserProfile | null) => void;
    setChatSessions: (sessions: ChatSession[]) => void;
    addChatSession: (session: ChatSession) => void;
    updateChatSession: (id: string, updates: Partial<ChatSession>) => void;
    deleteChatSession: (id: string) => void;
    setActiveChatId: (id: string | null) => void;
    
    setMessages: (messages: Message[]) => void;
    addMessage: (message: Message) => void;
    updateMessage: (id: string, updates: Partial<Message>) => void;
    deleteMessage: (id: string) => void;
    
    setChatSettings: (settings: ChatSettings) => void;
    setAppSettings: (settings: Partial<AppSettings>) => void;
    toggleTheme: () => void;
    toggleSidebarCollapsed: () => void;
    setRightPanelOpen: (open: boolean) => void;
    
    setAssistantPanel: (panel: Partial<AssistantPanel>) => void;
    toggleAssistantPanel: () => void;
    
    setIsLoading: (loading: boolean) => void;
    setChatSettingsOpen: (open: boolean) => void;
    setExternalDialogOpen: (open: boolean) => void;
    setPendingQuery: (query: string) => void;
    
    // Reset
    resetStore: () => void;
  }
  