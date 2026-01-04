import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Smile, X } from "lucide-react";

const STATUS_EMOJIS = [
  "🎵", "🎧", "🎤", "🔥", "💫", "🎹", "🎸", "🎺", "🥁", "🎷", 
  "✨", "💿", "📀", "🎼", "🎶", "🔴", "💪", "🚀", "💭", "🌙",
  "☕", "🎯", "🏆", "💎", "⚡", "🌟", "🎪", "🎭", "🎨", "🖤"
];

interface ProfileStatusEditorProps {
  currentEmoji?: string;
  currentText?: string;
  isAvailable?: boolean;
  onSave: (data: { status_emoji: string; status_text: string; is_available_for_collab: boolean }) => void;
  isLoading?: boolean;
}

export function ProfileStatusEditor({
  currentEmoji = "",
  currentText = "",
  isAvailable = true,
  onSave,
  isLoading = false,
}: ProfileStatusEditorProps) {
  const [emoji, setEmoji] = useState(currentEmoji);
  const [text, setText] = useState(currentText);
  const [available, setAvailable] = useState(isAvailable);
  const [isOpen, setIsOpen] = useState(false);

  const handleSave = () => {
    onSave({ status_emoji: emoji, status_text: text, is_available_for_collab: available });
  };

  const handleClear = () => {
    setEmoji("");
    setText("");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-medium">Current Status</Label>
          <p className="text-xs text-muted-foreground">Let people know what you're up to</p>
        </div>
        <Switch
          checked={available}
          onCheckedChange={setAvailable}
        />
      </div>

      <div className="flex gap-2">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="h-10 w-10 text-xl"
            >
              {emoji || <Smile className="h-5 w-5 text-muted-foreground" />}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 p-2">
            <div className="grid grid-cols-6 gap-1">
              {STATUS_EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => {
                    setEmoji(e);
                    setIsOpen(false);
                  }}
                  className={`text-xl p-2 rounded hover:bg-muted transition-colors ${
                    emoji === e ? "bg-primary/20" : ""
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <Input
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 50))}
          placeholder="What's on your mind?"
          className="flex-1"
        />

        {(emoji || text) && (
          <Button variant="ghost" size="icon" onClick={handleClear}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{text.length}/50</span>
        <Button onClick={handleSave} disabled={isLoading} size="sm">
          Update Status
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        {available ? "✨ You're marked as open to collaboration" : "You're currently not taking new work"}
      </p>
    </div>
  );
}
