import { useCallback, useRef, useState, useEffect } from 'react';
import { useAIStudioStore } from '@/stores/aiStudioStore';

export type AutomationRecordMode = 'touch' | 'latch' | 'write' | 'off';

export interface AutomationPoint {
  time: number; // In seconds
  value: number; // 0-1 normalized
}

/**
 * Live automation recording hook
 * Records parameter changes during playback
 */
export const useAutomationRecording = () => {
  const {
    isPlaying,
    currentTime,
    selectedTrackId,
    tracks,
    updateTrack,
  } = useAIStudioStore();

  const [recordMode, setRecordMode] = useState<AutomationRecordMode>('off');
  const [isRecording, setIsRecording] = useState(false);
  const [activeParameter, setActiveParameter] = useState<string>('volume');
  
  // Recording state
  const recordingPoints = useRef<AutomationPoint[]>([]);
  const lastRecordTime = useRef<number>(0);
  const isTouching = useRef<boolean>(false);

  /**
   * Start automation recording for a parameter
   */
  const startRecording = useCallback((
    parameter: string,
    mode: AutomationRecordMode = 'touch'
  ) => {
    if (!isPlaying) {
      console.warn('Cannot record automation when not playing');
      return;
    }

    setActiveParameter(parameter);
    setRecordMode(mode);
    setIsRecording(true);
    recordingPoints.current = [];
    lastRecordTime.current = currentTime;
    
    console.log(`Started automation recording: ${parameter} in ${mode} mode`);
  }, [isPlaying, currentTime]);

  /**
   * Stop automation recording and commit to track
   */
  const stopRecording = useCallback(() => {
    if (!selectedTrackId || recordingPoints.current.length === 0) {
      setIsRecording(false);
      return;
    }

    // TODO: Commit automation points to track
    // This will be integrated with the automation lane system
    console.log('Recorded automation points:', recordingPoints.current);
    
    setIsRecording(false);
    setRecordMode('off');
    recordingPoints.current = [];
  }, [selectedTrackId]);

  /**
   * Record a parameter change
   */
  const recordParameterChange = useCallback((
    value: number,
    touching: boolean = true
  ) => {
    if (!isRecording || !isPlaying) return;

    isTouching.current = touching;

    // Determine if we should record this point based on mode
    let shouldRecord = false;

    switch (recordMode) {
      case 'touch':
        // Record only while touching/moving control
        shouldRecord = touching;
        break;
      
      case 'latch':
        // Record from first touch until stop
        shouldRecord = true;
        break;
      
      case 'write':
        // Always record (overwrite all automation)
        shouldRecord = true;
        break;
    }

    if (!shouldRecord) return;

    // Throttle recording to avoid too many points
    const now = currentTime;
    const timeSinceLastRecord = now - lastRecordTime.current;
    
    if (timeSinceLastRecord < 0.01) return; // Max 100 points per second

    recordingPoints.current.push({
      time: now,
      value: Math.max(0, Math.min(1, value)),
    });

    lastRecordTime.current = now;
  }, [isRecording, isPlaying, currentTime, recordMode]);

  /**
   * Handle playback stop - commit or discard recording
   */
  useEffect(() => {
    if (!isPlaying && isRecording) {
      stopRecording();
    }
  }, [isPlaying, isRecording, stopRecording]);

  /**
   * Handle touch/latch mode release
   */
  const handleRelease = useCallback(() => {
    if (recordMode === 'touch') {
      // Stop recording immediately
      isTouching.current = false;
    }
    // Latch and write modes continue recording
  }, [recordMode]);

  return {
    recordMode,
    isRecording,
    activeParameter,
    recordingPoints: recordingPoints.current,
    startRecording,
    stopRecording,
    recordParameterChange,
    handleRelease,
    setRecordMode,
  };
};
