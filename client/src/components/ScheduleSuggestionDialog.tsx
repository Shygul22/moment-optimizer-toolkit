import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, Zap, MessageSquare, ArrowRight } from "lucide-react";
import { TimeBlock } from "@/types/TimeTracking";

interface ScheduleSuggestionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  block: TimeBlock | null;
  onSubmitSuggestion: (blockId: string, suggestions: any) => void;
}

export const ScheduleSuggestionDialog = ({ 
  isOpen, 
  onClose, 
  block, 
  onSubmitSuggestion 
}: ScheduleSuggestionDialogProps) => {
  const [newTime, setNewTime] = useState("");
  const [newDuration, setNewDuration] = useState("");
  const [newPriority, setNewPriority] = useState("");
  const [feedback, setFeedback] = useState("");
  const [suggestionType, setSuggestionType] = useState<'time' | 'duration' | 'priority' | 'feedback'>('time');

  if (!block) return null;

  const handleSubmit = () => {
    const suggestions: any = {};
    
    if (suggestionType === 'time' && newTime) {
      const [hours, minutes] = newTime.split(':');
      const newStart = new Date(block.startTime);
      newStart.setHours(parseInt(hours), parseInt(minutes));
      suggestions.newTime = newStart.toISOString();
    }
    
    if (suggestionType === 'duration' && newDuration) {
      suggestions.newDuration = parseInt(newDuration);
    }
    
    if (suggestionType === 'priority' && newPriority) {
      suggestions.newPriority = newPriority;
    }
    
    if (feedback) {
      suggestions.feedback = feedback;
    }

    onSubmitSuggestion(block.id, suggestions);
    onClose();
    
    // Reset form
    setNewTime("");
    setNewDuration("");
    setNewPriority("");
    setFeedback("");
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getCurrentDuration = () => {
    return Math.round((block.endTime.getTime() - block.startTime.getTime()) / (1000 * 60));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            Suggest Changes
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Current Block Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">{block.title}</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {formatTime(block.startTime)} - {formatTime(block.endTime)}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {getCurrentDuration()} minutes
              </div>
              <Badge variant="outline" className="text-xs">
                {block.blockType}
              </Badge>
            </div>
          </div>

          {/* Suggestion Type */}
          <div>
            <Label className="text-sm font-medium">What would you like to change?</Label>
            <Select value={suggestionType} onValueChange={(value: any) => setSuggestionType(value)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="time">Start Time</SelectItem>
                <SelectItem value="duration">Duration</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="feedback">General Feedback</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Dynamic Input Fields */}
          {suggestionType === 'time' && (
            <div>
              <Label htmlFor="newTime" className="text-sm font-medium">
                New Start Time
              </Label>
              <Input
                id="newTime"
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="mt-1"
              />
              {newTime && (
                <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-700">
                  <ArrowRight className="w-4 h-4 inline mr-1" />
                  Will move from {formatTime(block.startTime)} to {newTime}
                </div>
              )}
            </div>
          )}

          {suggestionType === 'duration' && (
            <div>
              <Label htmlFor="newDuration" className="text-sm font-medium">
                New Duration (minutes)
              </Label>
              <Input
                id="newDuration"
                type="number"
                min="15"
                max="180"
                step="15"
                value={newDuration}
                onChange={(e) => setNewDuration(e.target.value)}
                placeholder={getCurrentDuration().toString()}
                className="mt-1"
              />
              {newDuration && (
                <div className="mt-2 p-2 bg-blue-50 rounded text-sm text-blue-700">
                  <ArrowRight className="w-4 h-4 inline mr-1" />
                  Will change from {getCurrentDuration()} to {newDuration} minutes
                </div>
              )}
            </div>
          )}

          {suggestionType === 'priority' && (
            <div>
              <Label className="text-sm font-medium">New Priority Level</Label>
              <Select value={newPriority} onValueChange={setNewPriority}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="low">Low Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Feedback */}
          <div>
            <Label htmlFor="feedback" className="text-sm font-medium">
              Additional Comments (Optional)
            </Label>
            <Textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Any specific feedback about this time block or suggestions for improvement..."
              className="mt-1"
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!newTime && !newDuration && !newPriority && !feedback}
          >
            Submit Suggestion
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};