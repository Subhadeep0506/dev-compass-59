/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
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
import { Info, User, Bot, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: {
    id: string;
    content: string;
    sender: "user" | "bot";
    timestamp: Date;
    sources?: string[];
  };
  isDark?: boolean;
  onFollowupClick?: (text: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  isDark = false,
  onFollowupClick,
}) => {
  const isUser = message.sender === "user";

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
                    <div className="overflow-x-auto my-3">
                      <table className="min-w-full border border-border/50 rounded-md">
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
                    const isInline = inline || !match;
                    const code = String(children).replace(/\n$/, "");
                    const detected = match?.[1]?.toLowerCase();
                    let lang = "text";
                    if (!detected) lang = "gdscript";
                    else if (
                      detected === "gdscript" ||
                      detected === "language-gdscript" ||
                      detected === "gd"
                    )
                      lang = "gdscript";
                    else lang = detected;

                    if (!isInline) {
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
                    }

                    return (
                      <code
                        className="px-1 py-0.5 rounded bg-muted/60"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {message.content}
              </ReactMarkdown>
            </ErrorBoundary>
          </div>

          {/* Info Icon for Bot Messages */}
          {!isUser && message.sources && message.sources.length > 0 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute -bottom-1 -right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Info className="w-3 h-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="space-y-1">
                    <p className="font-medium">Sources:</p>
                    {message.sources.map((source, index) => (
                      <p key={index} className="text-xs">
                        {source}
                      </p>
                    ))}
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {/* Timestamp and optional follow-up button */}
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
          {!isUser && onFollowupClick && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => onFollowupClick(message.content)}
            >
              Follow up
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
