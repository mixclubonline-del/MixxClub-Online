import { useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface VoiceCommand {
  command_text: string;
  command_type: string;
  parameters: Record<string, any>;
}

export const useVoiceCommands = (sessionId: string, userId: string) => {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const processVoiceCommand = async (commandText: string) => {
    let commandType = 'unknown';
    const parameters: Record<string, any> = {};

    // Playback controls
    if (commandText.includes('play') || commandText.includes('start playback')) {
      commandType = 'playback';
      parameters.action = 'play';
    } else if (commandText.includes('pause') || commandText.includes('stop')) {
      commandType = 'playback';
      parameters.action = 'pause';
    } else if (commandText.includes('record')) {
      commandType = 'playback';
      parameters.action = 'record';
    } else if (commandText.includes('loop')) {
      commandType = 'playback';
      parameters.action = 'loop';
    }
    
    // Track controls
    else if (commandText.includes('mute track')) {
      commandType = 'track_control';
      parameters.action = 'mute';
      const trackMatch = commandText.match(/track (\d+)/);
      if (trackMatch) parameters.trackNumber = parseInt(trackMatch[1]);
    } else if (commandText.includes('solo track')) {
      commandType = 'track_control';
      parameters.action = 'solo';
      const trackMatch = commandText.match(/track (\d+)/);
      if (trackMatch) parameters.trackNumber = parseInt(trackMatch[1]);
    } else if (commandText.includes('unmute track')) {
      commandType = 'track_control';
      parameters.action = 'unmute';
      const trackMatch = commandText.match(/track (\d+)/);
      if (trackMatch) parameters.trackNumber = parseInt(trackMatch[1]);
    }
    
    // Volume controls
    else if (commandText.includes('increase volume') || commandText.includes('louder')) {
      commandType = 'mixer_control';
      parameters.control = 'volume';
      parameters.action = 'increase';
    } else if (commandText.includes('decrease volume') || commandText.includes('quieter')) {
      commandType = 'mixer_control';
      parameters.control = 'volume';
      parameters.action = 'decrease';
    }
    
    // Effects
    else if (commandText.includes('add reverb') || commandText.includes('more reverb')) {
      commandType = 'audio_effect';
      parameters.effect = 'reverb';
      parameters.action = 'add';
    } else if (commandText.includes('remove reverb') || commandText.includes('less reverb')) {
      commandType = 'audio_effect';
      parameters.effect = 'reverb';
      parameters.action = 'remove';
    } else if (commandText.includes('add compression')) {
      commandType = 'audio_effect';
      parameters.effect = 'compression';
      parameters.action = 'add';
    } else if (commandText.includes('add delay')) {
      commandType = 'audio_effect';
      parameters.effect = 'delay';
      parameters.action = 'add';
    }
    
    // Edit commands
    else if (commandText.includes('undo')) {
      commandType = 'edit';
      parameters.action = 'undo';
    } else if (commandText.includes('redo')) {
      commandType = 'edit';
      parameters.action = 'redo';
    } else if (commandText.includes('save') || commandText.includes('save project')) {
      commandType = 'edit';
      parameters.action = 'save';
    } else if (commandText.includes('export')) {
      commandType = 'edit';
      parameters.action = 'export';
    }

    // Log the command
    const { error } = await supabase
      .from("voice_commands_log")
      .insert({
        session_id: sessionId,
        user_id: userId,
        command_text: commandText,
        command_type: commandType,
        parameters: parameters,
        executed_successfully: commandType !== 'unknown',
      });

    if (error) {
      console.error('Failed to log voice command:', error);
    }

    // Execute the command
    if (commandType !== 'unknown') {
      toast.success("Command Executed", {
        description: commandText,
      });
      
      return { commandType, parameters };
    } else {
      toast.error("Command Not Recognized", {
        description: "Try commands like 'add reverb' or 'increase volume'",
      });
    }
  };

  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error("Not Supported", {
        description: "Voice commands are not supported in this browser.",
      });
      return;
    }

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
      toast.error("Voice Command Error", {
        description: "Failed to recognize speech. Please try again.",
      });
      setIsListening(false);
    };

    recognizer.onend = () => {
      setIsListening(false);
    };

    recognizer.start();
    recognitionRef.current = recognizer;
    setIsListening(true);
    
    toast.success("Voice Commands Active", {
      description: "Listening for audio mixing commands...",
    });
  }, [sessionId, userId]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
      setIsListening(false);
      
      toast.info("Voice Commands Stopped", {
        description: "No longer listening for commands.",
      });
    }
  }, []);

  return {
    isListening,
    startListening,
    stopListening,
  };
};
