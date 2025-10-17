# Zustand Store Documentation

This document describes the global state management solution using Zustand for the chat application.

## Overview

The store manages the complete application state including:
- **User Information**: Profile data after login
- **Chat Sessions**: List of chat conversations
- **Messages**: Messages within each chat session
- **Settings**: Application and chat-specific settings
- **Theme**: Dark/Light mode preference
- **UI State**: Sidebar collapse state, right panel visibility, dialog states
- **Assistant Panel**: External source preferences and tags

## Store Structure

### Files

- `src/store/index.ts` - Main store implementation with persistence middleware
- `src/store/types.ts` - TypeScript type definitions for all state

### State Persistence

The store automatically persists state to `localStorage` with the key `app-store`. State is persisted across browser sessions and survives page reloads.

**Key Features:**
- Automatic Date serialization/deserialization
- Type-safe state management
- Version control for migrations
- Custom storage implementation for better handling

## Usage Examples

### 1. Using the Store in Components

```tsx
import { useAppStore } from '@/store';

export const MyComponent = () => {
  // Select individual state slices
  const theme = useAppStore((state) => state.appSettings.theme);
  const isDark = theme === 'dark';
  
  // Get multiple state items
  const { chatSessions, activeChatId } = useAppStore((state) => ({
    chatSessions: state.chatSessions,
    activeChatId: state.activeChatId,
  }));
  
  // Get actions
  const toggleTheme = useAppStore((state) => state.toggleTheme);
  
  return (
    <div onClick={toggleTheme}>
      Current theme: {isDark ? 'Dark' : 'Light'}
    </div>
  );
};
```

### 2. Managing Chat Sessions

```tsx
import { useAppStore } from '@/store';
import { ChatSession, Message } from '@/store/types';

const handleNewChat = () => {
  const newSession: ChatSession = {
    id: Date.now().toString(),
    title: 'New Chat',
    createdAt: new Date(),
    updatedAt: new Date(),
    tags: [],
    hasExternalSources: false,
    pinned: false,
    messages: [],
  };
  
  useAppStore.getState().addChatSession(newSession);
};

const handleSelectChat = (id: string) => {
  useAppStore.getState().setActiveChatId(id);
};

const handleDeleteChat = (id: string) => {
  useAppStore.getState().deleteChatSession(id);
};

const handleTogglePin = (id: string) => {
  const session = useAppStore.getState().chatSessions.find(s => s.id === id);
  if (session) {
    useAppStore.getState().updateChatSession(id, { pinned: !session.pinned });
  }
};
```

### 3. Managing Messages

```tsx
import { useAppStore } from '@/store';
import { Message } from '@/store/types';

const handleSendMessage = (content: string) => {
  const message: Message = {
    id: Date.now().toString(),
    content,
    isUser: true,
    timestamp: new Date(),
  };
  
  useAppStore.getState().addMessage(message);
};

const handleUpdateMessage = (id: string, updates: Partial<Message>) => {
  useAppStore.getState().updateMessage(id, updates);
};

const handleDeleteMessage = (id: string) => {
  useAppStore.getState().deleteMessage(id);
};
```

### 4. Managing Settings

```tsx
import { useAppStore } from '@/store';

// Toggle theme
useAppStore.getState().toggleTheme();

// Update multiple app settings
useAppStore.getState().setAppSettings({
  sidebarCollapsed: true,
  rightPanelOpen: false,
});

// Toggle sidebar
useAppStore.getState().toggleSidebarCollapsed();

// Set right panel
useAppStore.getState().setRightPanelOpen(true);
```

### 5. Managing Assistant Panel

```tsx
import { useAppStore } from '@/store';

// Update assistant panel settings
useAppStore.getState().setAssistantPanel({
  isOpen: true,
  externalSources: {
    reddit: true,
    stackoverflow: true,
    github: false,
    web: true,
  },
});

// Toggle panel open/closed
useAppStore.getState().toggleAssistantPanel();
```

### 6. Managing User Profile

```tsx
import { useAppStore } from '@/store';
import { UserProfile } from '@/store/types';

const user: UserProfile = {
  id: 'user-123',
  user_id: 'user-123',
  email: 'user@example.com',
  username: 'johndoe',
  full_name: 'John Doe',
  avatar_url: 'https://example.com/avatar.jpg',
};

useAppStore.getState().setUser(user);
```

### 7. Reset Store

```tsx
import { useAppStore } from '@/store';

// Reset to initial state (useful on sign out)
useAppStore.getState().resetStore();
```

## State Shape

```typescript
interface AppState {
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
}
```

## Type Definitions

See `src/store/types.ts` for complete type definitions including:
- `Message`
- `ChatSession`
- `UserProfile`
- `ChatSettings`
- `AppSettings`
- `AssistantPanel`
- `AppState`

## Integration with App

The store is integrated into the app through:

1. **StoreInitializer Component** in `src/App.tsx`:
   - Syncs Supabase auth state with the store
   - Applies theme preferences to the DOM
   - Initializes user profile after authentication

2. **Index.tsx Page**:
   - Uses store for chat session management
   - Uses store for message management
   - Uses store for UI state (sidebar, panels, dialogs)
   - Uses store for theme toggling

3. **UserProfilePopover Component**:
   - Resets store on sign out for clean logout

## Persistence Details

### What Gets Persisted

All state in the AppState is automatically persisted to localStorage:
- Chat sessions with full message history
- User information
- All settings and preferences
- UI state (sidebar collapse, panel visibility)
- Dialog states

### What Doesn't Get Persisted

The store persists everything by default. To exclude certain properties, you can modify the `persist` middleware configuration in `src/store/index.ts`.

### Storage Key

- **Key**: `app-store`
- **Storage**: Browser localStorage
- **Format**: JSON (with Date serialization support)

### Accessing Raw Storage

```typescript
// Get raw store data from localStorage
const storeData = localStorage.getItem('app-store');
const parsed = JSON.parse(storeData || '{}');

// Clear store data
localStorage.removeItem('app-store');
```

## Best Practices

1. **Use Selectors for Performance**:
   ```tsx
   // Good - only re-renders when theme changes
   const theme = useAppStore((state) => state.appSettings.theme);
   
   // Avoid - re-renders on any state change
   const state = useAppStore();
   ```

2. **Batch Updates When Possible**:
   ```tsx
   // Update multiple messages in one operation
   useAppStore.setState((state) => ({
    messages: state.messages.map((m) => 
      m.id === targetId ? { ...m, ...updates } : m
    ),
  }));
   ```

3. **Reset on Sign Out**:
   ```tsx
   // Always reset store when user signs out
   useAppStore.getState().resetStore();
   ```

4. **Use Actions for Complex Operations**:
   The store provides actions like `addMessage`, `updateChatSession`, etc. Use these instead of directly manipulating state for consistency.

## Debugging

### View Store State

```typescript
// In browser console
localStorage.getItem('app-store')
```

### Clear Store

```typescript
// In browser console
localStorage.removeItem('app-store')
location.reload()
```

### Monitor Store Changes

```typescript
import { useAppStore } from '@/store';

// Subscribe to all changes
useAppStore.subscribe((state) => {
  console.log('Store updated:', state);
});

// Subscribe to specific changes
useAppStore.subscribe(
  (state) => state.appSettings.theme,
  (theme) => {
    console.log('Theme changed to:', theme);
  }
);
```

## Migration and Versioning

The store includes a migration system. If you need to change the state structure:

1. Increment the `version` in the persist config
2. Add migration logic in the `migrate` function
3. Return the transformed state

Example:
```typescript
migrate: (persistedState: any, version: number) => {
  if (version === 0) {
    // Transform old structure to new structure
    return {
      ...persistedState,
      newField: 'default value',
    };
  }
  return persistedState;
},
```

## Future Enhancements

- Add undo/redo functionality
- Implement state snapshots
- Add selective persistence (persist only certain fields)
- Implement cloud sync with backend
- Add state validation schemas
