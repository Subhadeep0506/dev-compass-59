import { create } from 'zustand';
import { persist, StorageValue, StateStorage } from 'zustand/middleware';
import { AppState, ChatSession, Message, UserProfile, ChatSettings, AppSettings, AssistantPanel } from './types';

// Custom storage that handles Date serialization
const customStorage: StateStorage = {
  getItem: (name: string): StorageValue<AppState> | null => {
    const item = localStorage.getItem(name);
    if (!item) return null;
    try {
      return JSON.parse(item, (key, value) => {
        // Deserialize Date objects
        if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
          return new Date(value);
        }
        return value;
      });
    } catch (error) {
      console.error('Failed to parse stored state:', error);
      return null;
    }
  },
  setItem: (name: string, value: StorageValue<AppState>): void => {
    try {
      localStorage.setItem(name, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to store state:', error);
    }
  },
  removeItem: (name: string): void => {
    localStorage.removeItem(name);
  },
};

const initialChatSession: ChatSession = {
  id: Date.now().toString(),
  title: 'New Chat',
  createdAt: new Date(),
  updatedAt: new Date(),
  tags: [],
  hasExternalSources: false,
  pinned: false,
  messages: [
    {
      id: '1',
      content:
        'Hi! Ask me anything about the Godot docs. I can format answers with markdown, code blocks, tables, and lists. If the docs lack an answer, I can search sources like Reddit, the web, and GitHub after you approve.',
      isUser: false,
      timestamp: new Date(),
    },
  ],
};

const initialState: AppState = {
  user: null,
  chatSessions: [initialChatSession],
  activeChatId: initialChatSession.id,
  messages: initialChatSession.messages,
  chatSettings: {
    searchApprovalEnabled: true,
    externalSources: {
      reddit: true,
      stackoverflow: true,
      github: true,
      web: true,
    },
    querySettings: {
      model: 'codestral-latest',
      temperature: 0.7,
      topK: 5,
      memoryService: 'astradb',
      category: 'tutorials',
      subCategory: 'tutorials',
      redditUsername: '',
      relevance: 'top',
    },
  },
  appSettings: {
    theme: 'light',
    sidebarCollapsed: false,
    rightPanelOpen: true,
  },
  assistantPanel: {
    isOpen: true,
    selectedTags: [],
    externalSources: {
      reddit: true,
      stackoverflow: true,
      github: true,
      web: true,
    },
  },
  isLoading: false,
  chatSettingsOpen: false,
  externalDialogOpen: false,
  pendingQuery: '',

  setUser: (user) => {
    useAppStore.setState({ user });
  },

  setChatSessions: (sessions) => {
    useAppStore.setState({ chatSessions: sessions });
  },

  addChatSession: (session) => {
    useAppStore.setState((state) => ({
      chatSessions: [session, ...state.chatSessions],
    }));
  },

  updateChatSession: (id, updates) => {
    useAppStore.setState((state) => ({
      chatSessions: state.chatSessions.map((s) =>
        s.id === id ? { ...s, ...updates, updatedAt: new Date() } : s
      ),
    }));
  },

  deleteChatSession: (id) => {
    useAppStore.setState((state) => {
      const filtered = state.chatSessions.filter((s) => s.id !== id);
      return {
        chatSessions: filtered,
        activeChatId:
          state.activeChatId === id
            ? filtered.length > 0
              ? filtered[0].id
              : null
            : state.activeChatId,
      };
    });
  },

  setActiveChatId: (id) => {
    useAppStore.setState((state) => {
      console.log('Setting active chat ID in store:', id);
      const session = state.chatSessions.find((s) => s.id === id);
      return {
        activeChatId: id,
        // Don't set messages here - let the API loading handle it
        // messages: session?.messages || [],
      };
    });
  },

  setMessages: (messages) => {
    useAppStore.setState({ messages });
  },

  addMessage: (message) => {
    useAppStore.setState((state) => {
      const updatedMessages = [...state.messages, message];
      const updatedSessions = state.chatSessions.map((s) =>
        s.id === state.activeChatId
          ? {
            ...s,
            messages: updatedMessages,
            updatedAt: new Date(),
            title: s.messages.length === 0 ? message.content.slice(0, 60) : s.title,
          }
          : s
      );
      return {
        messages: updatedMessages,
        chatSessions: updatedSessions,
      };
    });
  },

  updateMessage: (id, updates) => {
    useAppStore.setState((state) => {
      const updatedMessages = state.messages.map((m) =>
        m.id === id ? { ...m, ...updates } : m
      );
      const updatedSessions = state.chatSessions.map((s) =>
        s.id === state.activeChatId
          ? { ...s, messages: updatedMessages, updatedAt: new Date() }
          : s
      );
      return {
        messages: updatedMessages,
        chatSessions: updatedSessions,
      };
    });
  },

  deleteMessage: (id) => {
    useAppStore.setState((state) => {
      const updatedMessages = state.messages.filter((m) => m.id !== id);
      const updatedSessions = state.chatSessions.map((s) =>
        s.id === state.activeChatId
          ? { ...s, messages: updatedMessages, updatedAt: new Date() }
          : s
      );
      return {
        messages: updatedMessages,
        chatSessions: updatedSessions,
      };
    });
  },

  setChatSettings: (settings) => {
    useAppStore.setState({ chatSettings: settings });
  },

  setAppSettings: (settings) => {
    useAppStore.setState((state) => ({
      appSettings: { ...state.appSettings, ...settings },
    }));
  },

  toggleTheme: () => {
    useAppStore.setState((state) => ({
      appSettings: {
        ...state.appSettings,
        theme: state.appSettings.theme === 'light' ? 'dark' : 'light',
      },
    }));
  },

  toggleSidebarCollapsed: () => {
    useAppStore.setState((state) => ({
      appSettings: {
        ...state.appSettings,
        sidebarCollapsed: !state.appSettings.sidebarCollapsed,
      },
    }));
  },

  setRightPanelOpen: (open) => {
    useAppStore.setState((state) => ({
      appSettings: {
        ...state.appSettings,
        rightPanelOpen: open,
      },
    }));
  },

  setAssistantPanel: (panel) => {
    useAppStore.setState((state) => ({
      assistantPanel: { ...state.assistantPanel, ...panel },
    }));
  },

  toggleAssistantPanel: () => {
    useAppStore.setState((state) => ({
      assistantPanel: {
        ...state.assistantPanel,
        isOpen: !state.assistantPanel.isOpen,
      },
    }));
  },

  setIsLoading: (loading) => {
    useAppStore.setState({ isLoading: loading });
  },

  setChatSettingsOpen: (open) => {
    useAppStore.setState({ chatSettingsOpen: open });
  },

  setExternalDialogOpen: (open) => {
    useAppStore.setState({ externalDialogOpen: open });
  },

  setPendingQuery: (query) => {
    useAppStore.setState({ pendingQuery: query });
  },

  resetStore: () => {
    useAppStore.setState(initialState);
  },
};

export const useAppStore = create<AppState>()(
  persist(
    (set) => initialState,
    {
      name: 'app-store',
      storage: customStorage,
      version: 1,
      partialize: (state) => ({
        // Persist user, app settings, chat settings, and active chat ID
        user: state.user,
        activeChatId: state.activeChatId,
        appSettings: state.appSettings,
        chatSettings: state.chatSettings,
        assistantPanel: state.assistantPanel,
        // Don't persist chatSessions and messages - these will be loaded from API
        // This prevents stale data and ensures we always have fresh data from the server
      }),
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          return initialState;
        }
        return persistedState;
      },
    }
  )
);
