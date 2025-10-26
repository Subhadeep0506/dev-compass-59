import React, { useState } from "react";
import ErrorBoundary from "@/components/ErrorBoundary";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneDark,
  oneLight,
  gruvboxDark,
  gruvboxLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  Info,
  User,
  Bot,
  Copy,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FeedbackDialog } from "@/components/FeedbackDialog";
import { SourcesDialog } from "@/components/SourcesDialog";
import { cn } from "@/lib/utils";
import { QuerySource } from "@/api/types";

interface ChatMessageProps {
  message: {
    id: string;
    content: string;
    sender: "user" | "bot";
    timestamp: Date;
    sources?: QuerySource[];
    like_status?: "like" | "dislike";
    message_id?: string; // For API calls
    feedback?: {
      feedback: string;
      stars: number;
    };
  };
  isDark?: boolean;
  onLikeMessage?: (
    messageId: string,
    likeStatus: "like" | "dislike"
  ) => Promise<void> | void;
  onSubmitFeedback?: (
    messageId: string,
    feedback: string,
    stars: number
  ) => Promise<void> | void;
  isSubmittingFeedback?: boolean;
  isLiking?: boolean;
  isDisliking?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isDark = false,
  onLikeMessage,
  onSubmitFeedback,
  isSubmittingFeedback = false,
  isLiking = false,
  isDisliking = false,
}) => {
  const isUser = message.sender === "user";
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [sourcesDialogOpen, setSourcesDialogOpen] = useState(false);

  // Process sources for tooltip (grouped with counts)
  const groupedSources = React.useMemo(() => {
    if (!message.sources || message.sources.length === 0) return [];

    const sourceMap = new Map<string, number>();
    message.sources.forEach((sourceItem) => {
      sourceMap.set(
        sourceItem.source,
        (sourceMap.get(sourceItem.source) || 0) + 1
      );
    });

    return Array.from(sourceMap.entries()).map(([source, count]) => ({
      source,
      count,
    }));
  }, [message.sources]);

  // Individual sources for dialog (all sources with their unique content)
  const individualSources = React.useMemo(() => {
    if (!message.sources || message.sources.length === 0) return [];

    return message.sources.map((sourceItem, index) => ({
      id: index + 1,
      source: sourceItem.source,
      content: sourceItem.content,
    }));
  }, [message.sources]);

  const handleLikeClick = async (likeStatus: "like" | "dislike") => {
    if (onLikeMessage && message.message_id) {
      await onLikeMessage(message.message_id, likeStatus);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (e) {
      // ignore clipboard errors (fall back silently)
      // console.debug('clipboard error', e);
    }
  };

  return (
    <div
      className={cn(
        "flex gap-3 max-w-4xl mx-auto p-4 group",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
          isUser ? "bg-gradient-primary" : "bg-muted"
        )}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-muted-foreground" />
        )}
      </div>

      {/* Message Content */}
      <div
        className={cn(
          "flex-1 min-w-0 space-y-2",
          isUser ? "flex flex-col items-end" : ""
        )}
      >
        <div
          className={cn(
            "relative px-4 py-3 rounded-2xl shadow-chat max-w-[85%] break-words",
            isUser
              ? "bg-chat-bubble-user text-chat-bubble-user-foreground ml-8"
              : "bg-chat-bubble-bot text-chat-bubble-bot-foreground mr-8"
          )}
        >
          <div className="message-content prose prose-md dark:prose-invert max-w-none">
            <ErrorBoundary>
              <ReactMarkdown
                remarkPlugins={[remarkBreaks, remarkGfm]}
                components={{
                  a: ({ href, children }) => (
                    <a
                      href={href as string}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary underline"
                    >
                      {children}
                    </a>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc pl-6 space-y-1">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal pl-6 space-y-1">{children}</ol>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 pl-4 italic text-muted-foreground">
                      {children}
                    </blockquote>
                  ),
                  del: ({ children }) => (
                    <del className="line-through text-muted-foreground">
                      {children}
                    </del>
                  ),
                  table: ({ children }) => (
                    <div className="overflow-x-auto my-0">
                      <table className="min-w-full border border-border/50 rounded-md my-0">
                        {children}
                      </table>
                    </div>
                  ),
                  thead: ({ children }) => (
                    <thead className="bg-muted/10">{children}</thead>
                  ),
                  tbody: ({ children }) => <tbody>{children}</tbody>,
                  tr: ({ children }) => (
                    <tr className="odd:bg-transparent even:bg-muted/2">
                      {children}
                    </tr>
                  ),
                  th: ({ children }) => (
                    <th className="border-b border-border/60 bg-muted/40 text-left px-3 py-2 text-sm font-medium">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="border-b border-border/40 px-3 py-2 align-top text-sm">
                      {children}
                    </td>
                  ),
                  code: ({
                    node,
                    inline,
                    className,
                    children,
                    ...props
                  }: any) => {
                    const match = /language-(\w+)/.exec(className || "");
                    const code = String(children).replace(/\n$/, "");
                    const detected = match?.[1]?.toLowerCase();
                    let lang = "text";
                    const isInlineHeuristic =
                      inline || (!code.includes("\n") && code.length < 200);

                    if (isInlineHeuristic) {
                      return (
                        <code
                          className={cn(
                            "inline-code px-1.5 py-0.5 rounded-md bg-muted/70 text-foreground font-mono text-[13px] whitespace-nowrap align-baseline",
                            detected ? undefined : className
                          )}
                          {...props}
                        >
                          {code}
                        </code>
                      );
                    }

                    // Handle code blocks (triple backticks)
                    if (!detected) lang = "gdscript";
                    else if (
                      detected === "gdscript" ||
                      detected === "language-gdscript" ||
                      detected === "gd"
                    )
                      lang = "gdscript";
                    else lang = detected;

                    return (
                      <div className="code-block my-0 rounded-md overflow-hidden relative">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute top-2 right-2 z-10"
                          onClick={() => copyToClipboard(code)}
                        >
                          <Copy className="w-3 h-3 " />
                        </Button>
                        <SyntaxHighlighter
                          style={isDark ? gruvboxDark : gruvboxLight}
                          language={lang}
                          PreTag="pre"
                          className="rounded-none"
                          customStyle={{
                            background: "transparent",
                            margin: 0,
                            padding: 0,
                          }}
                        >
                          {code}
                        </SyntaxHighlighter>
                      </div>
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            </ErrorBoundary>
          </div>

          {/* Info Icon for Bot Messages */}
          {!isUser && groupedSources.length > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute -bottom-1 -right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => setSourcesDialogOpen(true)}
                  >
                    <Info className="w-3 h-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-2 max-w-sm">
                    <p className="font-medium">
                      Sources ({individualSources.length}):
                    </p>
                    <div className="space-y-1">
                      {groupedSources
                        .slice(0, 3)
                        .map(({ source, count }, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between gap-2"
                          >
                            <p
                              className="text-xs flex-1 truncate"
                              title={source}
                            >
                              {source}
                            </p>
                            {count > 1 && (
                              <Badge
                                variant="secondary"
                                className="text-xs px-1.5 py-0.5 h-auto min-w-0"
                              >
                                {count}
                              </Badge>
                            )}
                          </div>
                        ))}
                      {groupedSources.length > 3 && (
                        <p className="text-xs text-muted-foreground">
                          +{groupedSources.length - 3} more...
                        </p>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground border-t pt-1">
                      Click to view detailed sources
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {/* Timestamp and action buttons */}
        <div
          className={cn(
            "flex items-center gap-2 px-2",
            isUser ? "justify-end" : "justify-start"
          )}
        >
          <p className="text-xs text-muted-foreground">
            {message.timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>

          {!isUser && (onLikeMessage || onSubmitFeedback) && (
            <div className="flex items-center gap-1">
              {onLikeMessage && message.message_id && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-7 w-7 p-0 text-xs text-muted-foreground hover:text-green-600",
                      message.like_status === "like" &&
                        "text-green-600 bg-green-100 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400"
                    )}
                    onClick={() => handleLikeClick("like")}
                    disabled={isLiking || isDisliking}
                    title="Like this response"
                  >
                    {isLiking ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <ThumbsUp className="w-3 h-3" />
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-7 w-7 p-0 text-xs text-muted-foreground hover:text-red-600",
                      message.like_status === "dislike" &&
                        "text-red-600 bg-red-100 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400"
                    )}
                    onClick={() => handleLikeClick("dislike")}
                    disabled={isLiking || isDisliking}
                    title="Dislike this response"
                  >
                    {isDisliking ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <ThumbsDown className="w-3 h-3" />
                    )}
                  </Button>
                </>
              )}

              {onSubmitFeedback && message.message_id && (
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-7 w-7 p-0 text-xs text-muted-foreground hover:text-blue-600",
                    message.feedback.stars > 0 || message.feedback.feedback
                      ? "text-blue-600 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400"
                      : ""
                  )}
                  onClick={() => setFeedbackDialogOpen(true)}
                  title={
                    message.feedback.stars > 0 || message.feedback.feedback
                      ? `Feedback: ${message.feedback.stars} stars - Click to edit`
                      : "Provide feedback"
                  }
                >
                  <MessageSquare className="w-3 h-3" />
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Feedback Dialog */}
      {onSubmitFeedback && message.message_id && (
        <FeedbackDialog
          open={feedbackDialogOpen}
          onOpenChange={setFeedbackDialogOpen}
          onSubmit={(feedback, stars) =>
            onSubmitFeedback(message.message_id!, feedback, stars)
          }
          isSubmitting={isSubmittingFeedback}
          initialFeedback={message.feedback?.feedback || ""}
          initialStars={message.feedback?.stars || 0}
        />
      )}

      {/* Sources Dialog */}
      {!isUser && individualSources.length > 0 && (
        <SourcesDialog
          open={sourcesDialogOpen}
          onOpenChange={setSourcesDialogOpen}
          sources={individualSources}
        />
      )}
    </div>
  );
};
