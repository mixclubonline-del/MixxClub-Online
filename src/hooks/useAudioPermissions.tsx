import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface AudioPermissionsState {
  microphone: 'granted' | 'denied' | 'prompt' | 'requesting';
  audio: 'granted' | 'denied' | 'prompt' | 'requesting';
  stream: MediaStream | null;
}

export const useAudioPermissions = () => {
  const { toast } = useToast();
  const [permissions, setPermissions] = useState<AudioPermissionsState>({
    microphone: 'prompt',
    audio: 'prompt',
    stream: null
  });

  // Check initial permissions
  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    try {
      if ('permissions' in navigator) {
        const microphonePermission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        
        setPermissions(prev => ({
          ...prev,
          microphone: microphonePermission.state as any,
          audio: microphonePermission.state as any
        }));

        // Listen for permission changes
        microphonePermission.addEventListener('change', () => {
          setPermissions(prev => ({
            ...prev,
            microphone: microphonePermission.state as any,
            audio: microphonePermission.state as any
          }));
        });
      }
    } catch (error) {
      console.warn('Permissions API not supported:', error);
    }
  };

  const requestAudioPermissions = async (): Promise<boolean> => {
    setPermissions(prev => ({ ...prev, microphone: 'requesting', audio: 'requesting' }));

    try {
      // Request high-quality audio with specific constraints for DAW use
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false, // Disable for recording quality
          noiseSuppression: false, // Disable for recording quality
          autoGainControl: false,  // Manual control for mixing
          sampleRate: 48000,       // High quality sample rate
          channelCount: 2         // Stereo
        }
      });

      setPermissions({
        microphone: 'granted',
        audio: 'granted',
        stream
      });

      // Show platform-specific instructions
      const platform = navigator.platform.toLowerCase();
      const isMac = platform.includes('mac');
      const isWindows = platform.includes('win');

      let permissionMessage = "Audio permissions granted! You can now record and monitor audio.";
      
      if (isMac) {
        permissionMessage += " You may need to enable microphone access in System Preferences → Security & Privacy → Privacy → Microphone if prompted.";
      } else if (isWindows) {
        permissionMessage += " You may need to enable microphone access in Windows Settings → Privacy → Microphone if prompted.";
      }

      toast({
        title: "Audio Ready",
        description: permissionMessage,
        duration: 6000
      });

      return true;
    } catch (error: any) {
      console.error('Audio permission denied:', error);
      
      setPermissions(prev => ({ 
        ...prev, 
        microphone: 'denied', 
        audio: 'denied',
        stream: null 
      }));

      let errorMessage = "Audio access is required for recording and monitoring. ";
      
      if (error.name === 'NotAllowedError') {
        const platform = navigator.platform.toLowerCase();
        if (platform.includes('mac')) {
          errorMessage += "Please check System Preferences → Security & Privacy → Privacy → Microphone and allow access for your browser.";
        } else if (platform.includes('win')) {
          errorMessage += "Please check Windows Settings → Privacy → Microphone and allow access for your browser.";
        } else {
          errorMessage += "Please allow microphone access when prompted by your browser.";
        }
      } else if (error.name === 'NotFoundError') {
        errorMessage = "No microphone found. Please connect an audio device and try again.";
      } else if (error.name === 'OverconstrainedError') {
        errorMessage = "Your audio device doesn't support the required settings. Try using a different microphone.";
      }

      toast({
        title: "Audio Permission Required",
        description: errorMessage,
        variant: "destructive",
        duration: 8000
      });

      return false;
    }
  };

  const releaseAudioStream = () => {
    if (permissions.stream) {
      permissions.stream.getTracks().forEach(track => track.stop());
      setPermissions(prev => ({ ...prev, stream: null }));
    }
  };

  return {
    permissions,
    requestAudioPermissions,
    releaseAudioStream,
    hasAudioAccess: permissions.microphone === 'granted' && permissions.audio === 'granted',
    isRequesting: permissions.microphone === 'requesting' || permissions.audio === 'requesting'
  };
};