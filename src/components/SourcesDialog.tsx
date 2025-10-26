import React, { useState } from "react";
import { ChevronDown, ChevronRight, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface SourceItem {
  id: number;
  source: string;
  content: string;
}

interface SourcesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sources: SourceItem[];
}

export const SourcesDialog: React.FC<SourcesDialogProps> = ({
  open,
  onOpenChange,
  sources,
}) => {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  const expandAll = () => {
    setExpandedItems(new Set(sources.map((_, index) => index)));
  };

  const collapseAll = () => {
    setExpandedItems(new Set());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Sources ({sources.length})
          </DialogTitle>
          <DialogDescription>
            All individual sources used to generate this response. Each source
            is indexed and contains unique content.
          </DialogDescription>
        </DialogHeader>

        {sources.length > 0 && (
          <div className="flex gap-2 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={expandAll}
              className="text-xs"
            >
              Expand All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={collapseAll}
              className="text-xs"
            >
              Collapse All
            </Button>
          </div>
        )}

        <ScrollArea className="h-[calc(85vh-200px)] w-full">
          <div className="space-y-3 pr-4">
            {sources.map((sourceItem, index) => {
              const isExpanded = expandedItems.has(index);
              return (
                <Collapsible
                  key={index}
                  open={isExpanded}
                  onOpenChange={() => toggleExpanded(index)}
                  className="w-full"
                >
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between p-4 h-auto text-left min-h-[60px]"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          <Badge
                            variant="secondary"
                            className="text-xs px-2 py-1 border-slate-200 text-center"
                          >
                            {sourceItem.id}
                          </Badge>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className="font-medium text-sm leading-relaxed truncate md:text-base"
                            title={sourceItem.source}
                          >
                            {sourceItem.source.length > 80 ? sourceItem.source.substring(0, 80) + " ..." : sourceItem.source}
                          </p>
                        </div>
                      </div>
                      <div className="flex-shrink-0 ml-2">
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </div>
                    </Button>
                  </CollapsibleTrigger>

                  <CollapsibleContent className="mt-2">
                    <div className="border rounded-lg p-4 bg-muted/20">
                      <div className="prose prose-sm dark:prose-invert max-w-none break-words overflow-hidden">
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
                              <ul className="list-disc pl-6 space-y-1">
                                {children}
                              </ul>
                            ),
                            ol: ({ children }) => (
                              <ol className="list-decimal pl-6 space-y-1">
                                {children}
                              </ol>
                            ),
                            blockquote: ({ children }) => (
                              <blockquote className="border-l-4 pl-4 italic text-muted-foreground">
                                {children}
                              </blockquote>
                            ),
                            code: ({ inline, children, ...props }: any) => {
                              if (inline) {
                                return (
                                  <code
                                    className="px-1 py-0.5 rounded bg-muted/60"
                                    {...props}
                                  >
                                    {children}
                                  </code>
                                );
                              }
                              return (
                                <pre className="bg-muted/60 p-2 rounded overflow-x-auto whitespace-pre-wrap break-words">
                                  <code {...props}>{children}</code>
                                </pre>
                              );
                            },
                            table: ({ children }) => (
                              <div className="overflow-x-auto my-3">
                                <table className="border border-border/50 rounded-md min-w-full table-auto">
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
                          }}
                        >
                          {sourceItem.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              );
            })}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
