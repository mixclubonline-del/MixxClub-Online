/**
 * Global type declarations for audio worklet integration
 */

interface AudioMeterData {
  peak: number;
  peakLeft: number;
  peakRight: number;
  rms: number;
  rmsLeft: number;
  rmsRight: number;
  peakDb: number;
  peakLeftDb: number;
  peakRightDb: number;
  rmsDb: number;
  rmsLeftDb: number;
  rmsRightDb: number;
}

declare global {
  interface Window {
    audioMeterData?: Record<string, AudioMeterData>;
  }
}

export {};
