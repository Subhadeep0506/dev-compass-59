import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
}

interface Settings {
  model: string;
  temperature: number;
  topP: number;
  maxTokens: number;
  redditUsername: string;
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({
  open,
  onOpenChange,
  title = "Settings",
  description = "Manage your preferences and settings."
}) => {
  const [settings, setSettings] = useState<Settings>({
    model: 'gpt-4',
    temperature: 0.7,
    topP: 0.9,
    maxTokens: 2048,
    redditUsername: '',
  });

  const handleSave = () => {
    // TODO: Implement settings save logic
    console.log('Saving settings:', settings);
    onOpenChange(false);
  };

  const handleReset = () => {
    setSettings({
      model: 'gpt-4',
      temperature: 0.7,
      topP: 0.9,
      maxTokens: 2048,
      redditUsername: '',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] px-6">
          <div className="space-y-6 pb-6">
            {/* Model Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Model Selection</Label>
              <Select
                value={settings.model}
                onValueChange={(value) => setSettings({ ...settings, model: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4">GPT-4</SelectItem>
                  <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                  <SelectItem value="claude-3">Claude 3</SelectItem>
                  <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Temperature */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Temperature</Label>
                <Badge variant="secondary">{settings.temperature}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Controls randomness in responses. Lower values make responses more focused and deterministic.
              </p>
              <Slider
                value={[settings.temperature]}
                onValueChange={(value) => setSettings({ ...settings, temperature: value[0] })}
                max={2}
                min={0}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Conservative (0)</span>
                <span>Creative (2)</span>
              </div>
            </div>

            <Separator />

            {/* Top P */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Top P</Label>
                <Badge variant="secondary">{settings.topP}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Controls diversity of responses via nucleus sampling. Lower values reduce randomness.
              </p>
              <Slider
                value={[settings.topP]}
                onValueChange={(value) => setSettings({ ...settings, topP: value[0] })}
                max={1}
                min={0}
                step={0.05}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Focused (0)</span>
                <span>Diverse (1)</span>
              </div>
            </div>

            <Separator />

            {/* Max Tokens */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Max Tokens</Label>
                <Badge variant="secondary">{settings.maxTokens}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Maximum length of the response. Higher values allow longer responses.
              </p>
              <Slider
                value={[settings.maxTokens]}
                onValueChange={(value) => setSettings({ ...settings, maxTokens: value[0] })}
                max={4096}
                min={256}
                step={256}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Short (256)</span>
                <span>Long (4096)</span>
              </div>
            </div>

            <Separator />

            {/* Reddit Integration */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Reddit Integration</Label>
              <p className="text-sm text-muted-foreground">
                Enter your Reddit username to personalize external source searches.
              </p>
              <Input
                value={settings.redditUsername}
                onChange={(e) => setSettings({ ...settings, redditUsername: e.target.value })}
                placeholder="Enter Reddit username (optional)"
              />
            </div>

            <Separator />

            {/* External Sources */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">External Sources</Label>
              <p className="text-sm text-muted-foreground">
                When the chatbot can't answer your question, it will prompt to search these sources:
              </p>
              <div className="flex flex-wrap gap-2">
                <Badge>Reddit</Badge>
                <Badge>Stack Overflow</Badge>
                <Badge>GitHub Issues</Badge>
                <Badge>Documentation Sites</Badge>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="flex justify-between p-6 pt-4 bg-muted/30 rounded-b-lg">
          <Button variant="outline" onClick={handleReset}>
            Reset to Defaults
          </Button>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-gradient-primary">
              Save Settings
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};