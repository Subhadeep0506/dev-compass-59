import React, { useState } from "react";
import { Star, MessageSquare, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface FeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (feedback: string, stars: number) => Promise<void> | void;
  isSubmitting?: boolean;
  initialFeedback?: string;
  initialStars?: number;
}

export const FeedbackDialog: React.FC<FeedbackDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
  initialFeedback = "",
  initialStars = 0,
}) => {
  const [stars, setStars] = useState<number>(initialStars);
  const [feedback, setFeedback] = useState<string>(initialFeedback);
  const [hoveredStar, setHoveredStar] = useState<number>(0);

  // Update state when initial values change
  React.useEffect(() => {
    setStars(initialStars);
    setFeedback(initialFeedback);
  }, [initialStars, initialFeedback, open]);

  const handleSubmit = async () => {
    if (stars > 0) {
      try {
        await onSubmit(feedback.trim(), stars);
        // Reset form and close dialog only after successful submission
        setStars(0);
        setFeedback("");
        onOpenChange(false);
      } catch (error) {
        // Error handling can be done by parent component
        console.error("Failed to submit feedback:", error);
      }
    }
  };

  const handleCancel = () => {
    setStars(0);
    setFeedback("");
    onOpenChange(false);
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starIndex = index + 1;
      const isActive = starIndex <= (hoveredStar || stars);

      return (
        <button
          key={starIndex}
          type="button"
          className={cn(
            "transition-colors duration-150",
            isActive ? "text-yellow-400" : "text-gray-300 hover:text-yellow-300"
          )}
          onClick={() => setStars(starIndex)}
          onMouseEnter={() => setHoveredStar(starIndex)}
          onMouseLeave={() => setHoveredStar(0)}
          disabled={isSubmitting}
        >
          <Star
            className={cn(
              "w-6 h-6",
              isActive ? "fill-current" : "fill-transparent"
            )}
          />
        </button>
      );
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Provide Feedback
          </DialogTitle>
          <DialogDescription>
            Help us improve by rating this response and sharing your thoughts.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Star Rating */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Rate this response (1-5 stars):
            </label>
            <div className="flex items-center gap-1">
              {renderStars()}
              {stars > 0 && (
                <span className="ml-2 text-sm text-muted-foreground">
                  {stars} star{stars !== 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>

          {/* Feedback Text */}
          <div className="space-y-2">
            <label htmlFor="feedback-text" className="text-sm font-medium">
              Additional feedback (optional):
            </label>
            <Textarea
              id="feedback-text"
              placeholder="Share your thoughts about this response..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="min-h-[80px] resize-none"
              disabled={isSubmitting}
              maxLength={1000}
            />
            <div className="text-xs text-muted-foreground text-right">
              {feedback.length}/1000 characters
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={stars === 0 || isSubmitting}
            className="min-w-[100px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
