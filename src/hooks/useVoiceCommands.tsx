import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface VoiceCommand {
  command_text: string;
  command_type: string;
  parameters: Record<string, any>;
}

export const useVoiceCommands = (sessionId: string, userId: string) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const { toast } = useToast();

  const startListening = useCallback(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognizer = new SpeechRecognition();
      
      recognizer.continuous = true;
      recognizer.interimResults = false;
      recognizer.lang = 'en-US';

      recognizer.onresult = async (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
        
        await processVoiceCommand(transcript);
      };

      recognizer.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        toast({
          title: "Voice Command Error",
          description: "Failed to recognize speech. Please try again.",
          variant: "destructive",
        });
        setIsListening(false);
      };

      recognizer.start();
      setRecognition(recognizer);
      setIsListening(true);
      
      toast({
        title: "Voice Commands Active",
        description: "Listening for audio mixing commands...",
      });
    } else {
      toast({
        title: "Not Supported",
        description: "Voice commands are not supported in this browser.",
        variant: "destructive",
      });
    }
  }, [sessionId, userId, toast]);

  const stopListening = useCallback(() => {
    if (recognition) {
      recognition.stop();
      setRecognition(null);
      setIsListening(false);
      
      toast({
        title: "Voice Commands Stopped",
        description: "No longer listening for commands.",
      });
    }
  }, [recognition, toast]);

  const processVoiceCommand = async (commandText: string) => {
    let commandType = 'unknown';
    const parameters: Record<string, any> = {};

    // Parse common mixing commands
    if (commandText.includes('add reverb') || commandText.includes('more reverb')) {
      commandType = 'audio_effect';
      parameters.effect = 'reverb';
      parameters.action = 'add';
    } else if (commandText.includes('remove reverb') || commandText.includes('less reverb')) {
      commandType = 'audio_effect';
      parameters.effect = 'reverb';
      parameters.action = 'remove';
    } else if (commandText.includes('increase volume') || commandText.includes('louder')) {
      commandType = 'mixer_control';
      parameters.control = 'volume';
      parameters.action = 'increase';
    } else if (commandText.includes('decrease volume') || commandText.includes('quieter')) {
      commandType = 'mixer_control';
      parameters.control = 'volume';
      parameters.action = 'decrease';
    } else if (commandText.includes('play') || commandText.includes('start playback')) {
      commandType = 'playback';
      parameters.action = 'play';
    } else if (commandText.includes('pause') || commandText.includes('stop')) {
      commandType = 'playback';
      parameters.action = 'pause';
    }

    // Voice command logging disabled (table not implemented yet)

    // Execute the command
    if (commandType !== 'unknown') {
      toast({
        title: "Command Executed",
        description: `${commandText}`,
      });
      
      // Return command for the calling component to handle
      return { commandType, parameters };
    } else {
      toast({
        title: "Command Not Recognized",
        description: "Try commands like 'add reverb' or 'increase volume'",
        variant: "destructive",
      });
    }
  };

  return {
    isListening,
    startListening,
    stopListening,
  };
};
