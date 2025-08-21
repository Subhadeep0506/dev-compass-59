import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Globe, MessageSquare } from 'lucide-react';

interface ExternalSourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: () => void;
  query: string;
}

export const ExternalSourceDialog: React.FC<ExternalSourceDialogProps> = ({
  open,
  onOpenChange,
  onApprove,
  query,
}) => {
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
            Would you like me to search Reddit and other external sources for relevant information? 
            This may provide more comprehensive and up-to-date answers.
          </AlertDialogDescription>
          
          <div className="bg-primary/5 p-3 rounded-lg border border-primary/20">
            <p className="text-sm text-primary">
              <strong>Sources I'll search:</strong> Reddit communities, Stack Overflow, 
              GitHub discussions, and documentation sites.
            </p>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>No, Thanks</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onApprove}
            className="bg-gradient-primary hover:opacity-90"
          >
            Yes, Search Sources
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};