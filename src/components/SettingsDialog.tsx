import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/store";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
}

interface Settings {
  model: string;
  temperature: number;
  topK: number;
  memoryService: string;
  category: string;
  subCategory: string;
  redditUsername: string;
  relevance: string;
}

export const SettingsDialog: React.FC<SettingsDialogProps> = ({
  open,
  onOpenChange,
  title = "Chat Settings",
  description = "Customize how the assistant responds and searches external sources.",
}) => {
  // Get current settings from store
  const chatSettings = useAppStore((state) => state.chatSettings);
  const setChatSettings = useAppStore((state) => state.setChatSettings);

  const [settings, setSettings] = useState<Settings>({
    model: "codestral-latest",
    temperature: 0.7,
    topK: 5,
    memoryService: "astradb",
    category: "tutorials",
    subCategory: "tutorials",
    redditUsername: "",
    relevance: "top",
  });

  // Load current settings from store when dialog opens
  useEffect(() => {
    if (open && chatSettings.querySettings) {
      setSettings({
        model: chatSettings.querySettings.model,
        temperature: chatSettings.querySettings.temperature,
        topK: chatSettings.querySettings.topK,
        memoryService: chatSettings.querySettings.memoryService,
        category: chatSettings.querySettings.category,
        subCategory: chatSettings.querySettings.subCategory,
        redditUsername: chatSettings.querySettings.redditUsername,
        relevance: chatSettings.querySettings.relevance,
      });
    }
  }, [open, chatSettings.querySettings]);

  const handleSave = () => {
    // Update the store with new settings
    setChatSettings({
      ...chatSettings,
      querySettings: {
        model: settings.model,
        temperature: settings.temperature,
        topK: settings.topK,
        memoryService: settings.memoryService,
        category: settings.category,
        subCategory: settings.subCategory,
        redditUsername: settings.redditUsername,
        relevance: settings.relevance,
      },
    });

    console.log("Saved settings:", settings);
    onOpenChange(false);
  };

  const handleReset = () => {
    setSettings({
      model: "codestral-latest",
      temperature: 0.7,
      topK: 5,
      memoryService: "astradb",
      category: "tutorials",
      subCategory: "tutorials",
      redditUsername: "",
      relevance: "top",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] px-6">
          <div className="space-y-3 px-2 pb-3">
            {/* Model Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Model Selection</Label>
              <Select
                value={settings.model}
                onValueChange={(value) =>
                  setSettings({ ...settings, model: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a model" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="codestral-latest">
                    Codestral Latest
                  </SelectItem>
                  <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                  <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                  <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
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
                Controls randomness in responses. Lower values make responses
                more focused and deterministic.
              </p>
              <Slider
                value={[settings.temperature]}
                onValueChange={(value) =>
                  setSettings({ ...settings, temperature: value[0] })
                }
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

            {/* Top K */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Top K</Label>
                <Badge variant="secondary">{settings.topK}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Number of top results to consider for answer generation. Higher
                values provide more context.
              </p>
              <Slider
                value={[settings.topK]}
                onValueChange={(value) =>
                  setSettings({ ...settings, topK: value[0] })
                }
                max={20}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Precise (1)</span>
                <span>Comprehensive (20)</span>
              </div>
            </div>

            <Separator />

            {/* Memory Service */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Memory Service</Label>
              <p className="text-sm text-muted-foreground">
                Choose the memory service for storing conversation context.
              </p>
              <Select
                value={settings.memoryService}
                onValueChange={(value) =>
                  setSettings({ ...settings, memoryService: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select memory service" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="astradb">AstraDB</SelectItem>
                  <SelectItem value="default">Default</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Category */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Category</Label>
              <p className="text-sm text-muted-foreground">
                Select the documentation category to focus search on.
              </p>
              <Select
                value={settings.category}
                onValueChange={(value) =>
                  setSettings({ ...settings, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tutorials">Tutorials</SelectItem>
                  <SelectItem value="classes">Classes</SelectItem>
                  <SelectItem value="getting_started">
                    Getting Started
                  </SelectItem>
                  <SelectItem value="engine_details">Engine Details</SelectItem>
                  <SelectItem value="about">About</SelectItem>
                  <SelectItem value="community">Community</SelectItem>
                  <SelectItem value="None">None (All Categories)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Sub-Category */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">Sub-Category</Label>
              <p className="text-sm text-muted-foreground">
                Select a specific sub-category for more focused results.
              </p>
              <Select
                value={settings.subCategory}
                onValueChange={(value) =>
                  setSettings({ ...settings, subCategory: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select sub-category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tutorials">Tutorials</SelectItem>
                  <SelectItem value="classes">Classes</SelectItem>
                  <SelectItem value="getting_started">
                    Getting Started
                  </SelectItem>
                  <SelectItem value="engine_details">Engine Details</SelectItem>
                  <SelectItem value="about">About</SelectItem>
                  <SelectItem value="community">Community</SelectItem>
                  <SelectItem value="None">
                    None (All Sub-Categories)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Reddit Integration */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">
                Reddit Integration
              </Label>
              <p className="text-sm text-muted-foreground">
                Configure Reddit search parameters for external source searches.
              </p>

              <div className="space-y-2">
                <Label className="text-sm">Reddit Username (optional)</Label>
                <Input
                  value={settings.redditUsername}
                  onChange={(e) =>
                    setSettings({ ...settings, redditUsername: e.target.value })
                  }
                  placeholder="Enter Reddit username"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Search Relevance</Label>
                <Select
                  value={settings.relevance}
                  onValueChange={(value) =>
                    setSettings({ ...settings, relevance: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select relevance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="top">Top Posts</SelectItem>
                    <SelectItem value="hot">Hot Posts</SelectItem>
                    <SelectItem value="new">New Posts</SelectItem>
                    <SelectItem value="rising">Rising Posts</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            {/* External Sources */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">
                External Sources
              </Label>
              <p className="text-sm text-muted-foreground">
                When the chatbot can't answer your question, it will prompt to
                search these sources:
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

        <div className="flex justify-between p-3 pt-0 bg-muted/30 rounded-b-lg">
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
