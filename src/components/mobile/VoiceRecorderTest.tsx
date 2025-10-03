import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, Square, Play, Upload, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const VoiceRecorderTest = () => {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      });

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      toast({ title: "Recording started" });
    } catch (error) {
      toast({
        title: "Recording failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast({ title: "Recording stopped" });
    }
  };

  const playRecording = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
    }
  };

  const transcribeAudio = async () => {
    if (!audioBlob) return;

    setIsTranscribing(true);
    try {
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onloadend = async () => {
        const base64Audio = reader.result?.toString().split(',')[1];
        
        if (!base64Audio) {
          throw new Error("Failed to convert audio");
        }

        // Call transcription edge function
        const { data, error } = await supabase.functions.invoke('transcribe-audio', {
          body: { audio: base64Audio }
        });

        if (error) throw error;

        setTranscription(data.text);
        toast({ title: "Transcription complete!" });
      };
    } catch (error) {
      toast({
        title: "Transcription failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  const uploadToStorage = async () => {
    if (!audioBlob) return;

    try {
      const fileName = `voice-test-${Date.now()}.webm`;
      const { data, error } = await supabase.storage
        .from('audio-files')
        .upload(fileName, audioBlob, {
          contentType: 'audio/webm'
        });

      if (error) throw error;

      toast({ 
        title: "Upload successful!",
        description: `File saved as ${fileName}`
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Mic className="h-5 w-5 text-primary" />
          <CardTitle>Voice Recorder Test</CardTitle>
        </div>
        <CardDescription>
          Test audio recording, playback, and transcription
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          {!isRecording ? (
            <Button onClick={startRecording} className="flex-1">
              <Mic className="h-4 w-4 mr-2" />
              Start Recording
            </Button>
          ) : (
            <Button onClick={stopRecording} variant="destructive" className="flex-1">
              <Square className="h-4 w-4 mr-2" />
              Stop Recording
            </Button>
          )}
        </div>

        {isRecording && (
          <div className="flex items-center justify-center gap-2 p-4 bg-red-500/10 rounded-lg">
            <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium">Recording...</span>
          </div>
        )}

        {audioBlob && (
          <div className="space-y-3">
            <Badge variant="secondary">
              Recording ready ({(audioBlob.size / 1024).toFixed(2)} KB)
            </Badge>

            <div className="grid grid-cols-3 gap-2">
              <Button onClick={playRecording} variant="outline" size="sm">
                <Play className="h-4 w-4 mr-1" />
                Play
              </Button>
              <Button onClick={uploadToStorage} variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-1" />
                Upload
              </Button>
              <Button 
                onClick={transcribeAudio} 
                variant="outline" 
                size="sm"
                disabled={isTranscribing}
              >
                {isTranscribing ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <Mic className="h-4 w-4 mr-1" />
                )}
                Transcribe
              </Button>
            </div>
          </div>
        )}

        {transcription && (
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm font-semibold mb-2">Transcription:</p>
            <p className="text-sm">{transcription}</p>
          </div>
        )}

        <div className="text-xs text-muted-foreground pt-4 border-t">
          <p className="font-semibold mb-1">Requirements:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Microphone permission required</li>
            <li>Transcription requires OpenAI API key</li>
            <li>Upload requires authenticated user</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
