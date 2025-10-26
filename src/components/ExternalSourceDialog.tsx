import React, { useState, useMemo } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Globe,
  MessageSquare,
  Github,
  Search,
  MessageCircle,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface ExternalSourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: (sources: string[]) => void;
  query: string;
  defaultSelectedSources?: string[];
}

const ALL_SOURCES = [
  { key: "reddit", label: "Reddit", icon: MessageCircle },
  { key: "stackoverflow", label: "Stack Overflow", icon: MessageSquare },
  { key: "github", label: "GitHub", icon: Github },
  { key: "web", label: "Web", icon: Search },
] as const;

export const ExternalSourceDialog: React.FC<ExternalSourceDialogProps> = ({
  open,
  onOpenChange,
  onApprove,
  query,
  defaultSelectedSources = [],
}) => {
  const [selected, setSelected] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {
      reddit: false,
      stackoverflow: false,
      github: false,
      web: false,
    };
    defaultSelectedSources.forEach((s) => {
      const key = s.toLowerCase();
      if (
        key === "stack overflow" ||
        key === "stack_overflow" ||
        key === "stackoverflow"
      ) {
        initial.stackoverflow = true;
      } else if (key === "reddit" || key === "github" || key === "web") {
        const k = key as keyof typeof initial;
        initial[k] = true;
      }
    });
    // if nothing provided, keep sensible defaults (all true)
    if (defaultSelectedSources.length === 0) {
      Object.keys(initial).forEach((k) => (initial[k] = true));
    }
    return initial;
  });

  // sync when prop changes
  React.useEffect(() => {
    if (!defaultSelectedSources) return;
    setSelected((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((k) => (next[k] = false));
      defaultSelectedSources.forEach((s) => {
        const key = s.toLowerCase();
        if (
          key === "stack overflow" ||
          key === "stack_overflow" ||
          key === "stackoverflow"
        ) {
          next.stackoverflow = true;
        } else if (key === "reddit" || key === "github" || key === "web") {
          const k = key as keyof typeof next;
          next[k] = true;
        }
      });
      // if nothing provided, set all true
      if (defaultSelectedSources.length === 0) {
        Object.keys(next).forEach((k) => (next[k] = true));
      }
      return next;
    });
  }, [defaultSelectedSources]);

  const selectedList = useMemo(
    () => ALL_SOURCES.filter((s) => selected[s.key]).map((s) => s.label),
    [selected]
  );

  const toggle = (key: string) => {
    setSelected((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Globe className="h-6 w-6 text-primary" />
            </div>
            <div>
              <AlertDialogTitle>Search External Sources?</AlertDialogTitle>
              <AlertDialogDescription className="text-left">
                I don't have enough information to answer your question.
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <div className="space-y-4">
          <div className="bg-muted/50 p-3 rounded-lg">
            <div className="flex items-start gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Your question:</span> "{query}"
              </p>
            </div>
          </div>

          <AlertDialogDescription>
            Select which sources you'd like me to search. This can provide more
            comprehensive and up-to-date answers.
          </AlertDialogDescription>

          <div className="grid grid-cols-2 gap-3">
            {ALL_SOURCES.map(({ key, label, icon: Icon }) => (
              <label
                key={key}
                className="flex items-center gap-2 p-2 rounded-md border hover:bg-muted cursor-pointer"
              >
                <Checkbox
                  checked={selected[key]}
                  onCheckedChange={() => toggle(key)}
                />
                <Icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{label}</span>
              </label>
            ))}
          </div>

          <div className="bg-primary/5 p-3 rounded-lg border border-primary/20">
            <p className="text-sm text-primary">
              <strong>Will search:</strong> {selectedList.join(", ")}
            </p>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>No, Thanks</AlertDialogCancel>
          <AlertDialogAction
            onClick={() =>
              onApprove(
                ALL_SOURCES.filter((s) => selected[s.key]).map((s) => s.label)
              )
            }
            className="bg-gradient-primary hover:opacity-90"
          >
            Yes, Search Sources
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
