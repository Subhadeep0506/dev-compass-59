import React, { useMemo, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Paperclip, Copy } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface RightPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionTags: string[];
  externalSources: Record<'reddit' | 'stackoverflow' | 'github' | 'web', boolean>;
  onToggleSource: (key: 'reddit' | 'stackoverflow' | 'github' | 'web') => void;
}

export const RightPanel: React.FC<RightPanelProps> = ({
  open,
  onOpenChange,
  sessionTags,
  externalSources,
  onToggleSource,
}) => {
  const [systemPrompt, setSystemPrompt] = useState(
    'You are an assistant focused on the Godot documentation. Prefer official docs, include concise GDScript examples, and use markdown.'
  );
  const [files, setFiles] = useState<File[]>([]);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setFiles(Array.from(e.target.files));
  };

  const activeCount = useMemo(
    () => Object.values(externalSources).filter(Boolean).length,
    [externalSources]
  );

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(systemPrompt);
    } catch {}
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-full p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>Assistant Panel</DialogTitle>
        </DialogHeader>
        <div className="px-6 pb-6">
          <Tabs defaultValue="context" className="flex-1 flex flex-col min-h-0">
            <TabsList>
              <TabsTrigger value="context">Context</TabsTrigger>
              <TabsTrigger value="tools">Tools</TabsTrigger>
              <TabsTrigger value="attachments">Attachments</TabsTrigger>
              <TabsTrigger value="snippets">Snippets</TabsTrigger>
            </TabsList>

            <TabsContent value="context" className="mt-4">
              <ScrollArea className="max-h-[60vh] pr-3">
                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label>System Prompt</Label>
                    <Textarea value={systemPrompt} onChange={e => setSystemPrompt(e.target.value)} rows={6} />
                    <div className="flex gap-2">
                      <Button variant="secondary" onClick={copyPrompt}><Copy className="w-4 h-4 mr-1"/>Copy</Button>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label>Session Tags</Label>
                    <div className="flex flex-wrap gap-2">
                      {sessionTags.length === 0 && <span className="text-xs text-muted-foreground">No tags yet</span>}
                      {sessionTags.map((t, i) => (
                        <Badge key={i} variant="secondary">{t}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="tools" className="mt-4">
              <ScrollArea className="max-h-[60vh] pr-3">
                <div className="space-y-4 py-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>External Sources</Label>
                      <p className="text-xs text-muted-foreground">Active: {activeCount}/4</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {([['reddit','Reddit'], ['stackoverflow','Stack Overflow'], ['github','GitHub'], ['web','Web']] as const).map(([k, label]) => (
                      <div key={k} className="flex items-center justify-between border rounded-md p-2">
                        <span className="text-sm">{label}</span>
                        <Switch checked={externalSources[k]} onCheckedChange={() => onToggleSource(k)} />
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="attachments" className="mt-4">
              <ScrollArea className="max-h-[60vh] pr-3">
                <div className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label>Attach files</Label>
                    <div className="border rounded-md p-4 text-center">
                      <Input type="file" multiple onChange={handleFiles} />
                      <p className="text-xs text-muted-foreground mt-2 flex items-center justify-center"><Paperclip className="w-3 h-3 mr-1"/>Supported: txt, md, gd, png</p>
                    </div>
                  </div>
                  {files.length > 0 && (
                    <div>
                      <Label>Selected</Label>
                      <ul className="mt-2 space-y-1 text-sm">
                        {files.map((f, i) => (
                          <li key={i} className="flex justify-between border rounded p-2">
                            <span className="truncate mr-2">{f.name}</span>
                            <span className="text-xs text-muted-foreground">{Math.round(f.size/1024)} KB</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="snippets" className="mt-4">
              <ScrollArea className="max-h-[60vh] pr-3">
                <div className="space-y-3 py-2">
                  {[
                    { label: 'Query: Input handling template', text: 'How to handle input in Godot 4 with actions and events?' },
                    { label: 'Query: Physics movement template', text: 'CharacterBody2D move_and_slide example with jump and gravity.' },
                    { label: 'Query: Signals template', text: 'Best practices for connecting and disconnecting signals dynamically.' },
                  ].map((snip, i) => (
                    <div key={i} className="flex items-center justify-between border rounded-md p-2">
                      <div className="text-sm">{snip.label}</div>
                      <Button size="sm" variant="secondary" onClick={async () => { try { await navigator.clipboard.writeText(snip.text);} catch {} }}>Copy</Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};
