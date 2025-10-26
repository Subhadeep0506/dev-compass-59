import React, { useMemo, useRef, useEffect } from "react";
import { ChatSidebar } from "@/components/ChatSidebar";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import {
  SessionLoadingShimmers,
  BotThinking,
} from "@/components/MessageShimmers";
import { UserProfilePopover } from "@/components/UserProfilePopover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import {
  useSessions,
  useCreateSession,
  useSessionMessages,
} from "@/hooks/useApi";
import { deleteSession, likeMessage, submitMessageFeedback } from "@/api";
import {
  submitQuery,
  submitRedditQuery,
  createDefaultQueryState,
  createRedditQueryState,
} from "@/api/query";
import { QueryState } from "@/api/types";
import { SettingsDialog } from "@/components/SettingsDialog";
import { ExternalSourceDialog } from "@/components/ExternalSourceDialog";
import { RightPanel } from "@/components/RightPanel";
import { Button } from "@/components/ui/button";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { ImperativePanelHandle } from "react-resizable-panels";
import { useAppStore } from "@/store";
import { ChatSession, Message } from "@/store/types";
import { SessionData } from "@/api/types";
import { isApologeticResponse } from "@/utils/responseAnalysis";

const Index = () => {
  const { user, profile } = useAuth();
  const sidebarPanelRef = useRef<ImperativePanelHandle | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const SIDEBAR_COLLAPSED_SIZE = 6;

  // Store selectors
  const chatSessions = useAppStore((state) => state.chatSessions);
  const activeChatId = useAppStore((state) => state.activeChatId);
  const messages = useAppStore((state) => state.messages);
  const isLoading = useAppStore((state) => state.isLoading);
  const chatSettings = useAppStore((state) => state.chatSettings);
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
  const setExternalDialogOpen = useAppStore(
    (state) => state.setExternalDialogOpen
  );
  const setPendingQuery = useAppStore((state) => state.setPendingQuery);
  const toggleTheme = useAppStore((state) => state.toggleTheme);
  const toggleSidebarCollapsed = useAppStore(
    (state) => state.toggleSidebarCollapsed
  );
  const setRightPanelOpen = useAppStore((state) => state.setRightPanelOpen);
  const addChatSession = useAppStore((state) => state.addChatSession);
  const setAssistantPanel = useAppStore((state) => state.setAssistantPanel);

  // Load sessions from API when user is authenticated
  const {
    data: apiSessions,
    loading: sessionsLoading,
    error: sessionsError,
    refetch: refetchSessions,
  } = useSessions(user?.id);

  // Create session hook
  const {
    mutate: createNewSession,
    loading: creatingSession,
    error: createSessionError,
  } = useCreateSession();

  // Load messages for active session
  const {
    data: sessionMessages,
    loading: messagesLoading,
    error: messagesError,
    refetch: refetchMessages,
  } = useSessionMessages(activeChatId);

  // Local state for UI interactions
  const [isSubmittingFeedback, setIsSubmittingFeedback] = React.useState(false);
  const [likingMessageId, setLikingMessageId] = React.useState<string | null>(
    null
  );
  const [dislikingMessageId, setDislikingMessageId] = React.useState<
    string | null
  >(null);

  // Convert API sessions to ChatSession format and sync with store
  useEffect(() => {
    console.log("API Sessions changed:", { apiSessions, user, activeChatId });

    if (apiSessions && apiSessions.length > 0) {
      console.log("Converting API sessions to local format:", apiSessions);

      const convertedSessions: ChatSession[] = apiSessions.map(
        (session: SessionData) => ({
          id: session.session_id,
          title: session.title,
          createdAt: new Date(session.time_created),
          updatedAt: new Date(session.time_updated),
          tags: [], // API doesn't provide tags yet, so default to empty
          hasExternalSources: false, // Default value, can be enhanced later
          pinned: false, // Default value, can be enhanced later
          messages: [], // Messages will be loaded separately when needed
        })
      );

      console.log("Setting converted sessions:", convertedSessions);
      setChatSessions(convertedSessions);

      // Handle active session selection
      if (activeChatId) {
        // Check if the persisted activeChatId still exists in the loaded sessions
        const sessionExists = convertedSessions.some(
          (s) => s.id === activeChatId
        );
        if (!sessionExists) {
          // Persisted session no longer exists, select the first available session
          console.log(
            "Persisted session no longer exists, selecting first session:",
            convertedSessions[0].id
          );
          setActiveChatId(convertedSessions[0].id);
        } else {
          console.log(
            "Persisted session still exists, keeping it active:",
            activeChatId
          );
          // Session exists, messages will be loaded by useSessionMessages hook
        }
      } else {
        // No active session, select the first one
        console.log(
          "No active session, setting first session as active:",
          convertedSessions[0].id
        );
        setActiveChatId(convertedSessions[0].id);
      }
    } else if (apiSessions && apiSessions.length === 0 && user) {
      console.log("User has no sessions, clearing active session");
      setActiveChatId(null);
      setMessages([]);
    }
  }, [
    apiSessions,
    setChatSessions,
    activeChatId,
    setActiveChatId,
    setMessages,
    user,
  ]);

  // Show loading state when sessions are being fetched, created, or messages are loading
  useEffect(() => {
    if (sessionsLoading || creatingSession || messagesLoading) {
      useAppStore.setState({ isLoading: true });
    } else {
      useAppStore.setState({ isLoading: false });
    }
  }, [sessionsLoading, creatingSession, messagesLoading]);

  // Handle session loading errors
  useEffect(() => {
    if (sessionsError) {
      console.error("Failed to load sessions:", sessionsError);
      // Keep the default session if API fails
    }
  }, [sessionsError]);

  // Convert and set messages when loaded from API
  useEffect(() => {
    console.log("Message loading effect triggered:", {
      sessionMessages: sessionMessages?.length,
      activeChatId,
      messagesLoading,
    });

    if (sessionMessages && sessionMessages.length > 0 && activeChatId) {
      console.log("Converting API messages to local format:", sessionMessages);

      const convertedMessages: Message[] = sessionMessages.flatMap((msg) => {
        const messages: Message[] = [];

        // Debug log for each message
        console.log(`Processing message ${msg.message_id}:`, {
          feedback: msg.feedback,
          stars: msg.stars,
          like: msg.like,
        });

        // Add user message (question)
        if (msg.content.question) {
          messages.push({
            id: `${msg.message_id}-question`,
            content: msg.content.question,
            isUser: true,
            timestamp: new Date(msg.timestamp),
          });
        }

        // Add AI response (answer)
        if (msg.content.answer) {
          const feedbackObject =
            msg.feedback !== undefined && msg.stars !== undefined
              ? {
                  feedback: msg.feedback,
                  stars: msg.stars,
                }
              : undefined;

          if (feedbackObject) {
            console.log(
              `✓ Including feedback for message ${msg.message_id}:`,
              feedbackObject
            );
          } else {
            console.log(`✗ No feedback for message ${msg.message_id}`, {
              feedback: msg.feedback,
              stars: msg.stars,
            });
          }

          messages.push({
            id: `${msg.message_id}-answer`,
            content: msg.content.answer,
            isUser: false,
            timestamp: new Date(msg.timestamp),
            sources: msg.sources,
            message_id: msg.message_id, // Map backend message ID for API calls
            like_status: msg.like, // Map like field from backend
            feedback: feedbackObject, // Construct feedback object from flat fields
          });
        }

        return messages;
      });

      console.log("Setting converted messages:", convertedMessages);
      setMessages(convertedMessages);
    } else if (
      sessionMessages &&
      sessionMessages.length === 0 &&
      activeChatId &&
      !messagesLoading
    ) {
      // If session exists but has no messages, clear messages and show an empty state banner in the UI
      console.log(
        "Session has no messages, clearing messages to show empty state banner"
      );
      setMessages([]);
    } else if (!activeChatId) {
      // No active session, clear messages
      console.log("No active session, clearing messages");
      setMessages([]);
    }
  }, [sessionMessages, activeChatId, setMessages, messagesLoading]);

  // Handle message loading errors
  useEffect(() => {
    if (messagesError) {
      console.error("Failed to load messages:", messagesError);
    }
  }, [messagesError]);

  // Sync auth user with store user
  useEffect(() => {
    if (user && profile && !storeUser) {
      const userData = {
        id: user.id,
        user_id: user.id,
        username: profile.username || user.email?.split("@")[0],
        full_name: profile.full_name || "",
        avatar_url: profile.avatar_url || "",
        email: user.email || "",
      };
      useAppStore.setState({ user: userData });
    }
  }, [user, profile, storeUser]);

  const isDark = appSettings.theme === "dark";
  const sidebarCollapsed = appSettings.sidebarCollapsed;
  const rightPanelOpen = appSettings.rightPanelOpen;
  const externalSources = assistantPanel.externalSources;

  // Use store user data if available, fallback to auth profile
  const displayName =
    storeUser?.full_name ||
    profile?.full_name ||
    storeUser?.username ||
    profile?.username ||
    user?.email?.split("@")[0] ||
    "User";
  const userAvatar = storeUser?.avatar_url || profile?.avatar_url;

  const knowledgeKeywords = useMemo(
    () => [
      "godot",
      "gdscript",
      "node",
      "scene",
      "signals",
      "animation",
      "physics",
      "input",
      "sprite",
      "characterbody",
      "raycast",
      "area",
      "tilemap",
      "http",
      "yield",
      "await",
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

  const handleSendMessage = async (content: string) => {
    if (!activeChatId) {
      console.error("No active chat session");
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      isUser: true,
      timestamp: new Date(),
    };

    addMessage(userMessage);
    useAppStore.setState({ isLoading: true });

    try {
      // Get current query settings from the store
      const currentSettings = chatSettings.querySettings;

      // Create the query request with user's settings
      const queryStateOverrides: Partial<QueryState> = {
        model_name: currentSettings.model,
        temperature: currentSettings.temperature,
        top_k: currentSettings.topK,
        memory_service: currentSettings.memoryService,
      };

      // Only include category and sub_category if they're not "None"
      if (currentSettings.category !== "None") {
        queryStateOverrides.category = currentSettings.category;
      }
      if (currentSettings.subCategory !== "None") {
        queryStateOverrides.sub_category = currentSettings.subCategory;
      }

      const queryRequest = {
        query: content,
        session_id: activeChatId,
        state: createDefaultQueryState(queryStateOverrides),
      };

      console.log("Submitting query with settings:", queryRequest);

      // Submit to the API
      const response = await submitQuery(queryRequest);

      // Check if the response is apologetic and Reddit is enabled
      if (
        response.data?.response?.answer &&
        isApologeticResponse(response.data.response.answer) &&
        chatSettings.externalSources.reddit
      ) {
        console.log(
          "Detected apologetic response, triggering Reddit fallback..."
        );

        // Create Reddit query request with same content and settings
        const redditQueryStateOverrides: Partial<QueryState> = {
          model_name: currentSettings.model,
          temperature: currentSettings.temperature,
          top_k: currentSettings.topK,
          memory_service: currentSettings.memoryService,
        };

        // Only include category and sub_category if they're not "None"
        if (currentSettings.category !== "None") {
          redditQueryStateOverrides.category = currentSettings.category;
        }
        if (currentSettings.subCategory !== "None") {
          redditQueryStateOverrides.sub_category = currentSettings.subCategory;
        }

        const redditQueryRequest = {
          query: content,
          session_id: activeChatId,
          state: createRedditQueryState(
            currentSettings.redditUsername || undefined,
            currentSettings.relevance,
            redditQueryStateOverrides
          ),
        };

        console.log(
          "Submitting Reddit query with settings:",
          redditQueryRequest
        );

        // Submit Reddit query
        await submitRedditQuery(redditQueryRequest);

        // Update session tags to indicate external sources were used
        if (activeChatId) {
          updateChatSession(activeChatId, {
            hasExternalSources: true,
            tags: Array.from(
              new Set([
                ...(chatSessions.find((s) => s.id === activeChatId)?.tags ||
                  []),
                "reddit",
              ])
            ),
          });
        }
      }

      // The API handles adding the message to the database
      // So we need to refetch messages to get the complete conversation
      await refetchMessages();

      useAppStore.setState({ isLoading: false });
    } catch (error) {
      console.error("Failed to submit query:", error);

      // Show error message to user
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content:
          "Sorry, I encountered an error processing your request. Please try again.",
        isUser: false,
        timestamp: new Date(),
      };
      addMessage(errorMessage);

      useAppStore.setState({ isLoading: false });
    }
  };

  const handleApproveExternal = async (sources: string[]) => {
    if (!activeChatId || !pendingQuery) {
      console.error("No active chat session or pending query");
      return;
    }

    setExternalDialogOpen(false);
    useAppStore.setState({ isLoading: true });

    try {
      // If Reddit is included in sources, use Reddit query endpoint
      if (sources.includes("reddit")) {
        const queryRequest = {
          query: pendingQuery,
          session_id: activeChatId,
          state: createRedditQueryState(),
        };

        await submitRedditQuery(queryRequest);
      } else {
        // Use regular query with external sources enabled
        const queryRequest = {
          query: pendingQuery,
          session_id: activeChatId,
          state: createDefaultQueryState({
            // You might want to add additional state for external sources
            category: "external",
          }),
        };

        await submitQuery(queryRequest);
      }

      // Refetch messages to get the API response
      await refetchMessages();

      // Update session tags
      if (activeChatId) {
        updateChatSession(activeChatId, {
          hasExternalSources: true,
          tags: Array.from(
            new Set([
              ...(chatSessions.find((s) => s.id === activeChatId)?.tags || []),
              ...sources,
            ])
          ),
        });
      }

      setPendingQuery("");
      useAppStore.setState({ isLoading: false });
    } catch (error) {
      console.error("Failed to submit external query:", error);

      // Show error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content:
          "Sorry, I encountered an error searching external sources. Please try again.",
        isUser: false,
        timestamp: new Date(),
      };
      addMessage(errorMessage);

      setPendingQuery("");
      useAppStore.setState({ isLoading: false });
    }
  };

  const handleNewChat = async () => {
    if (!user?.id) {
      console.error("User not authenticated");
      return;
    }

    try {
      // Create session via API
      const sessionId = await createNewSession({
        user_id: user.id,
        title: "New Chat",
      });

      // Create the initial bot message
      const botMsg: Message = {
        id: "1",
        content:
          "Hi! Ask me anything about the Godot docs. I can format answers with markdown, code blocks, tables, and lists. If the docs lack an answer, I can search sources like Reddit, the web, and GitHub after you approve.",
        isUser: false,
        timestamp: new Date(),
      };

      // Create local session object
      const newSession: ChatSession = {
        id: sessionId,
        title: "New Chat",
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: [],
        hasExternalSources: false,
        pinned: false,
        messages: [botMsg],
      };

      // Add to local store
      addChatSession(newSession);
      setActiveChatId(sessionId);
      setMessages([botMsg]);

      // Refresh sessions list to keep it in sync
      await refetchSessions();
    } catch (error) {
      console.error("Failed to create new chat session:", error);
      // Fallback to local session creation if API fails
      const newId = Date.now().toString();
      const botMsg: Message = {
        id: "1",
        content:
          "Hi! Ask me anything about the Godot docs. I can format answers with markdown, code blocks, tables, and lists. If the docs lack an answer, I can search sources like Reddit, the web, and GitHub after you approve.",
        isUser: false,
        timestamp: new Date(),
      };
      const fallbackSession: ChatSession = {
        id: newId,
        title: "New Chat",
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: [],
        hasExternalSources: false,
        pinned: false,
        messages: [botMsg],
      };
      addChatSession(fallbackSession);
      setActiveChatId(newId);
    }
  };

  // Handler for like/dislike messages
  const handleLikeMessage = async (
    messageId: string,
    likeStatus: "like" | "dislike"
  ) => {
    try {
      // Set loading state based on action
      if (likeStatus === "like") {
        setLikingMessageId(messageId);
      } else {
        setDislikingMessageId(messageId);
      }

      await likeMessage(messageId, likeStatus);

      // Refetch messages to update the UI with the new like status
      await refetchMessages();

      console.log(`Message ${messageId} ${likeStatus}d successfully`);
    } catch (error) {
      console.error(`Failed to ${likeStatus} message:`, error);
      // Could show a toast notification here
    } finally {
      // Clear loading state
      if (likeStatus === "like") {
        setLikingMessageId(null);
      } else {
        setDislikingMessageId(null);
      }
    }
  };

  // Handler for feedback submission
  const handleSubmitFeedback = async (
    messageId: string,
    feedback: string,
    stars: number
  ) => {
    try {
      setIsSubmittingFeedback(true);
      console.log(`Submitting feedback for message ${messageId}:`, {
        feedback,
        stars,
      });

      await submitMessageFeedback(messageId, feedback, stars);
      console.log(`Feedback API call successful for message ${messageId}`);

      // Refetch messages to update the UI with the new feedback data
      console.log(`Refetching messages to update UI...`);

      // Add a small delay to ensure backend has processed the feedback
      await new Promise((resolve) => setTimeout(resolve, 500));

      await refetchMessages();
      console.log(`Messages refetched successfully`);

      console.log(`Feedback submitted for message ${messageId}`);
      // Could show a success toast notification here
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      // Could show an error toast notification here
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  // Scroll to bottom when messages change, active session changes, or loading completes
  useEffect(() => {
    try {
      if (!messagesEndRef.current) return;
      // allow DOM to paint
      const t = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      }, 50);
      return () => clearTimeout(t);
    } catch (err) {
      console.error("Failed to scroll messages into view:", err);
    }
  }, [messages.length, isLoading, activeChatId]);

  // When loading, suppress the initial greeting message (id === "1") so
  // we can show shimmers instead of duplicating the greeting.
  const suppressGreetingDuringLoading =
    isLoading &&
    messages.length === 1 &&
    !messages[0].isUser &&
    (messages[0].id === "1" ||
      (typeof messages[0].content === "string" &&
        messages[0].content.startsWith("Hi")));

  const displayedMessages = suppressGreetingDuringLoading ? [] : messages;

  // Distinguish between two loading scenarios:
  // 1) messages are being fetched/loaded (show shimmer skeletons)
  // 2) user just sent a query and we're awaiting the assistant (show thinking loader)
  const isAwaitingBotResponse =
    isLoading && messages.length > 0 && messages[messages.length - 1].isUser;

  return (
    <div className="h-screen bg-background">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel
          ref={sidebarPanelRef}
          collapsible
          collapsedSize={SIDEBAR_COLLAPSED_SIZE}
          defaultSize={12}
          minSize={8}
          maxSize={24}
          onCollapse={() =>
            useAppStore.setState({
              appSettings: { ...appSettings, sidebarCollapsed: true },
            })
          }
          onExpand={() =>
            useAppStore.setState({
              appSettings: { ...appSettings, sidebarCollapsed: false },
            })
          }
          onResize={(size) => {
            if (sidebarCollapsed && size > SIDEBAR_COLLAPSED_SIZE + 0.2) {
              useAppStore.setState({
                appSettings: { ...appSettings, sidebarCollapsed: false },
              });
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
            onOpenSettings={() => setChatSettingsOpen(true)}
            chatHistory={chatSessions.map((s) => ({
              id: s.id,
              title: s.title,
              createdAt: s.createdAt,
              updatedAt: s.updatedAt,
              tags: s.tags,
              hasExternalSources: s.hasExternalSources,
              pinned: s.pinned,
            }))}
            activeChatId={activeChatId}
            isLoading={sessionsLoading}
            onSelectChat={async (id) => {
              console.log("Selecting chat session:", id);

              // Set the active chat ID - this will trigger the useSessionMessages hook
              setActiveChatId(id);

              // Clear current messages while loading new ones
              setMessages([]);

              // The useSessionMessages hook will automatically load messages
              // when activeChatId changes, but we can also manually trigger a refetch
              // if the session is the same as currently active (for refresh)
              if (activeChatId === id) {
                await refetchMessages();
              }
            }}
            onDeleteChat={async (id) => {
              try {
                // Delete from API
                await deleteSession(id);

                // Remove from local store
                deleteChatSession(id);

                // If this was the active session, switch to another one
                if (activeChatId === id) {
                  const remainingSessions = chatSessions.filter(
                    (s) => s.id !== id
                  );
                  if (remainingSessions.length > 0) {
                    setActiveChatId(remainingSessions[0].id);
                  } else {
                    // No sessions left, create a new one
                    await handleNewChat();
                  }
                }

                // Refresh sessions list
                await refetchSessions();
              } catch (error) {
                console.error("Failed to delete session:", error);
                // Still remove from local store as fallback
                deleteChatSession(id);
              }
            }}
            onTogglePin={(id) => {
              const session = chatSessions.find((s) => s.id === id);
              if (session) {
                updateChatSession(id, { pinned: !session.pinned });
              }
            }}
            onOpenRightPanel={() => setRightPanelOpen(true)}
          />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={30} minSize={40}>
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
                      {displayName?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </UserProfilePopover>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-auto p-6 pb-48">
              <div className="max-w-4xl mx-auto space-y-6">
                {displayedMessages.length === 0 && !isLoading ? (
                  <div className="w-full p-8 rounded-lg border border-border bg-card">
                    <h2 className="text-lg font-semibold mb-2">
                      Start a conversation
                    </h2>
                    <p className="text-sm text-muted-foreground mb-4">
                      This session has no messages yet. Here are some ways to
                      get started:
                    </p>
                    <ul className="list-disc list-inside text-sm mb-4 text-muted-foreground">
                      <li>
                        Choose a model & tune response settings (Open Chat
                        Settings)
                      </li>
                      <li>
                        Set a category / sub-category for domain-specific
                        answers
                      </li>
                      <li>
                        Open the Assistant Panel to enable external sources or
                        tools
                      </li>
                      <li>Type a question in the input below to ask the bot</li>
                      <li>
                        Or switch to a different session from the left sidebar
                      </li>
                    </ul>
                    <div className="flex gap-2">
                      <Button onClick={() => setChatSettingsOpen(true)}>
                        Open Chat Settings
                      </Button>
                      <Button
                        onClick={() => setRightPanelOpen(true)}
                        variant="secondary"
                      >
                        Open Assistant Panel
                      </Button>
                      <Button onClick={handleNewChat} variant="ghost">
                        New Chat
                      </Button>
                    </div>
                  </div>
                ) : (
                  displayedMessages.map((message) => (
                    <ChatMessage
                      key={message.id}
                      message={{
                        id: message.id,
                        content: message.content,
                        sender: message.isUser ? "user" : "bot",
                        timestamp: message.timestamp,
                        sources: message.sources,
                        message_id: message.message_id, // Use the actual message ID from backend
                        like_status: message.like_status, // Use the actual like status
                        feedback: message.feedback, // Use the actual feedback data
                      }}
                      isDark={isDark}
                      onLikeMessage={handleLikeMessage}
                      onSubmitFeedback={handleSubmitFeedback}
                      isSubmittingFeedback={isSubmittingFeedback}
                      isLiking={likingMessageId === message.message_id}
                      isDisliking={dislikingMessageId === message.message_id}
                    />
                  ))
                )}
                {/* Loading states */}
                {isLoading && (
                  <div className="max-w-4xl mx-auto p-4 space-y-6">
                    {isAwaitingBotResponse ? (
                      // User sent a query, show only bot thinking animation
                      <BotThinking isDark={isDark} />
                    ) : (
                      // Session is being loaded, show user+bot message shimmers
                      <SessionLoadingShimmers
                        isDark={isDark}
                        messageCount={4}
                      />
                    )}
                  </div>
                )}

                {/* Anchor element for scrolling to the bottom */}
                <div ref={messagesEndRef} />
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
      <SettingsDialog
        open={chatSettingsOpen}
        onOpenChange={setChatSettingsOpen}
        title="Chat Settings"
        description="Customize how the assistant responds."
      />
      <ExternalSourceDialog
        open={externalDialogOpen}
        onOpenChange={setExternalDialogOpen}
        onApprove={handleApproveExternal}
        query={pendingQuery}
        defaultSelectedSources={Object.entries(externalSources)
          .filter(([, v]) => v)
          .map(([k]) => k as keyof typeof externalSources as string)}
      />
      <RightPanel
        open={rightPanelOpen}
        onOpenChange={setRightPanelOpen}
        sessionTags={
          chatSessions.find((s) => s.id === activeChatId)?.tags || []
        }
        externalSources={externalSources}
        onToggleSource={(k) =>
          setAssistantPanel({
            externalSources: {
              ...externalSources,
              [k]: !externalSources[k as keyof typeof externalSources],
            },
          })
        }
      />
    </div>
  );
};

export default Index;
