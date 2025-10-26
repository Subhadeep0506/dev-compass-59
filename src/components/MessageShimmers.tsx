import React from "react";
import { User, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

// Shimmer animation keyframes
const shimmerKeyframes = `
  @keyframes shimmer {
    0% {
      background-position: -200px 0;
    }
    100% {
      background-position: calc(200px + 100%) 0;
    }
  }
`;

// Bouncing dots animation keyframes
const bouncingDotsKeyframes = `
  @keyframes bounce {
    0%, 80%, 100% {
      transform: scale(0);
      opacity: 0.5;
    }
    40% {
      transform: scale(1);
      opacity: 1;
    }
  }
`;

// Shimmer base styles
const shimmerStyles = {
  background: `linear-gradient(90deg, 
    transparent, 
    rgba(255, 255, 255, 0.2), 
    transparent
  )`,
  backgroundSize: "200px 100%",
  animation: "shimmer 1.6s ease-in-out infinite",
};

const darkShimmerStyles = {
  background: `linear-gradient(90deg, 
    transparent, 
    rgba(255, 255, 255, 0.1), 
    transparent
  )`,
  backgroundSize: "200px 100%",
  animation: "shimmer 1.6s ease-in-out infinite",
};

interface MessageShimmerProps {
  isDark?: boolean;
}

export const UserMessageShimmer: React.FC<MessageShimmerProps> = ({
  isDark = false,
}) => {
  return (
    <>
      <style>{shimmerKeyframes}</style>
      <div className="flex justify-end gap-3 animate-pulse">
        <div className="flex flex-col items-end max-w-[80%] space-y-2">
          {/* Message content placeholder */}
          <div className="bg-blue-500/20 rounded-2xl rounded-tr-md px-4 py-3 min-w-[120px]">
            <div
              className={cn(
                "h-4 rounded mb-2",
                isDark ? "bg-slate-600" : "bg-slate-300"
              )}
              style={isDark ? darkShimmerStyles : shimmerStyles}
            />
            <div
              className={cn(
                "h-4 rounded w-3/4",
                isDark ? "bg-slate-600" : "bg-slate-300"
              )}
              style={isDark ? darkShimmerStyles : shimmerStyles}
            />
          </div>

          {/* Timestamp placeholder */}
          <div
            className={cn(
              "h-3 w-16 rounded",
              isDark ? "bg-slate-700" : "bg-slate-200"
            )}
            style={isDark ? darkShimmerStyles : shimmerStyles}
          />
        </div>

        {/* User avatar */}
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
            isDark ? "bg-slate-700" : "bg-slate-200"
          )}
        >
          <User className="w-4 h-4 text-slate-400" />
        </div>
      </div>
    </>
  );
};

export const BotMessageShimmer: React.FC<MessageShimmerProps> = ({
  isDark = false,
}) => {
  return (
    <>
      <style>{shimmerKeyframes}</style>
      <div className="flex gap-3 animate-pulse">
        {/* Bot avatar */}
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
            isDark ? "bg-slate-700" : "bg-slate-200"
          )}
        >
          <Bot className="w-4 h-4 text-slate-400" />
        </div>

        <div className="flex flex-col max-w-[80%] space-y-2">
          {/* Message content placeholder */}
          <div
            className={cn(
              "rounded-2xl rounded-tl-md px-4 py-3 min-w-[200px]",
              isDark ? "bg-slate-800/50" : "bg-slate-100/50"
            )}
          >
            <div
              className={cn(
                "h-4 rounded mb-2",
                isDark ? "bg-slate-600" : "bg-slate-300"
              )}
              style={isDark ? darkShimmerStyles : shimmerStyles}
            />
            <div
              className={cn(
                "h-4 rounded mb-2 w-5/6",
                isDark ? "bg-slate-600" : "bg-slate-300"
              )}
              style={isDark ? darkShimmerStyles : shimmerStyles}
            />
            <div
              className={cn(
                "h-4 rounded w-3/4",
                isDark ? "bg-slate-600" : "bg-slate-300"
              )}
              style={isDark ? darkShimmerStyles : shimmerStyles}
            />
          </div>

          {/* Actions placeholder */}
          <div className="flex items-center gap-2">
            <div
              className={cn(
                "h-6 w-6 rounded",
                isDark ? "bg-slate-700" : "bg-slate-200"
              )}
              style={isDark ? darkShimmerStyles : shimmerStyles}
            />
            <div
              className={cn(
                "h-6 w-6 rounded",
                isDark ? "bg-slate-700" : "bg-slate-200"
              )}
              style={isDark ? darkShimmerStyles : shimmerStyles}
            />
            <div
              className={cn(
                "h-3 w-16 rounded ml-2",
                isDark ? "bg-slate-700" : "bg-slate-200"
              )}
              style={isDark ? darkShimmerStyles : shimmerStyles}
            />
          </div>
        </div>
      </div>
    </>
  );
};

interface BotThinkingProps {
  isDark?: boolean;
}

export const BotThinking: React.FC<BotThinkingProps> = ({ isDark = false }) => {
  return (
    <>
      <style>{bouncingDotsKeyframes}</style>
      <div className="flex gap-3">
        {/* Bot avatar */}
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
            isDark
              ? "bg-gradient-to-br from-blue-600 to-purple-600"
              : "bg-gradient-to-br from-blue-500 to-purple-500"
          )}
        >
          <Bot className="w-4 h-4 text-white" />
        </div>

        <div className="flex flex-col">
          {/* Thinking message */}
          <div
            className={cn(
              "rounded-2xl rounded-tl-md px-4 py-3 flex items-center gap-2",
              isDark ? "bg-slate-800/50" : "bg-slate-100/50"
            )}
          >
            <span
              className={cn(
                "text-sm",
                isDark ? "text-slate-300" : "text-slate-600"
              )}
            >
              Thinking
            </span>

            {/* Bouncing dots */}
            <div className="flex gap-1">
              {[0, 1, 2].map((index) => (
                <div
                  key={index}
                  className={cn(
                    "w-2 h-2 rounded-full",
                    isDark ? "bg-blue-400" : "bg-blue-500"
                  )}
                  style={{
                    animation: `bounce 1.4s ease-in-out ${
                      index * 0.16
                    }s infinite both`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

interface SessionLoadingShimmersProps {
  isDark?: boolean;
  messageCount?: number;
}

export const SessionLoadingShimmers: React.FC<SessionLoadingShimmersProps> = ({
  isDark = false,
  messageCount = 3,
}) => {
  const messages = Array.from({ length: messageCount }, (_, index) => ({
    id: index,
    isUser: index % 2 === 0, // Alternate between user and bot messages
  }));

  return (
    <div className="space-y-6">
      {messages.map((msg) => (
        <div key={msg.id}>
          {msg.isUser ? (
            <UserMessageShimmer isDark={isDark} />
          ) : (
            <BotMessageShimmer isDark={isDark} />
          )}
        </div>
      ))}
    </div>
  );
};
