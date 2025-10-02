import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, MicOff, Sparkles } from "lucide-react";
import { useVoiceCommands } from "@/hooks/useVoiceCommands";

interface VoiceCommandPanelProps {
  sessionId: string;
  userId: string;
}

export const VoiceCommandPanel = ({ sessionId, userId }: VoiceCommandPanelProps) => {
  const { isListening, startListening, stopListening } = useVoiceCommands(sessionId, userId);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Voice Commands
            </CardTitle>
            <CardDescription>
              Control your mix with natural language
            </CardDescription>
          </div>
          <Badge variant={isListening ? "default" : "secondary"}>
            {isListening ? "Active" : "Inactive"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          onClick={isListening ? stopListening : startListening}
          variant={isListening ? "destructive" : "default"}
          className="w-full"
          size="lg"
        >
          {isListening ? (
            <>
              <MicOff className="w-5 h-5 mr-2" />
              Stop Listening
            </>
          ) : (
            <>
              <Mic className="w-5 h-5 mr-2" />
              Start Voice Commands
            </>
          )}
        </Button>

        <div className="space-y-2">
          <p className="text-sm font-medium">Try saying:</p>
          <div className="grid gap-2">
            {[
              "Add reverb",
              "Increase volume",
              "Add compression",
              "Play",
              "Pause",
            ].map((command, idx) => (
              <div
                key={idx}
                className="text-xs bg-muted p-2 rounded-md text-muted-foreground"
              >
                "{command}"
              </div>
            ))}
          </div>
        </div>

        {isListening && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span>Listening for commands...</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
