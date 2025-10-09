/**
 * AudioWorklet Processor for Real-Time Pitch Correction
 * Replaces deprecated ScriptProcessorNode with modern, performant API
 */

// This file will be registered as an AudioWorklet module
const workletCode = `
class PitchCorrectionProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.bufferSize = 1024;
    this.inputBuffer = new Float32Array(this.bufferSize);
    this.bufferIndex = 0;
    
    // Pitch correction parameters
    this.correction = 0.5;
    this.speed = 0.5;
    this.humanize = 0;
    this.targetPitch = 440;
    this.detectedPitch = 0;
    
    this.port.onmessage = (event) => {
      const { type, data } = event.data;
      if (type === 'updateParams') {
        Object.assign(this, data);
      }
    };
  }
  
  // YIN pitch detection algorithm (simplified for real-time)
  detectPitch(buffer) {
    const threshold = 0.1;
    const yinBuffer = new Float32Array(buffer.length / 2);
    yinBuffer[0] = 1;
    
    let runningSum = 0;
    for (let tau = 1; tau < yinBuffer.length; tau++) {
      yinBuffer[tau] = 0;
      for (let i = 0; i < yinBuffer.length; i++) {
        const delta = buffer[i] - buffer[i + tau];
        yinBuffer[tau] += delta * delta;
      }
      
      runningSum += yinBuffer[tau];
      if (runningSum === 0) {
        yinBuffer[tau] = 1;
      } else {
        yinBuffer[tau] *= tau / runningSum;
      }
      
      if (tau > 1 && yinBuffer[tau] < threshold) {
        let betterTau = tau;
        if (tau < yinBuffer.length - 1) {
          const s0 = yinBuffer[tau - 1];
          const s1 = yinBuffer[tau];
          const s2 = yinBuffer[tau + 1];
          const adjustment = (s2 - s0) / (2 * (2 * s1 - s2 - s0));
          betterTau = tau + adjustment;
        }
        
        if (yinBuffer[tau] < 0.01) {
          return sampleRate / betterTau;
        }
      }
    }
    
    return 0;
  }
  
  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];
    
    if (!input || !input[0]) {
      return true;
    }
    
    const inputChannel = input[0];
    const outputChannel = output[0];
    
    // Fill buffer for pitch detection
    for (let i = 0; i < inputChannel.length; i++) {
      this.inputBuffer[this.bufferIndex] = inputChannel[i];
      this.bufferIndex++;
      
      if (this.bufferIndex >= this.bufferSize) {
        // Buffer full - detect pitch
        this.detectedPitch = this.detectPitch(this.inputBuffer);
        this.bufferIndex = 0;
        
        // Send detected pitch to main thread
        this.port.postMessage({
          type: 'pitchDetected',
          pitch: this.detectedPitch
        });
      }
    }
    
    // Apply pitch correction (simplified - in production use phase vocoder)
    if (this.detectedPitch > 0 && this.targetPitch > 0) {
      const pitchRatio = this.targetPitch / this.detectedPitch;
      const correctedRatio = 1 + (pitchRatio - 1) * this.correction;
      
      // Add humanization
      const variation = (Math.random() - 0.5) * 0.01 * this.humanize;
      const finalRatio = correctedRatio * (1 + variation);
      
      // Simple pitch shift via resampling
      for (let i = 0; i < outputChannel.length; i++) {
        const sourceIndex = i * finalRatio;
        const index0 = Math.floor(sourceIndex) % inputChannel.length;
        const index1 = (index0 + 1) % inputChannel.length;
        const fraction = sourceIndex - Math.floor(sourceIndex);
        
        outputChannel[i] = inputChannel[index0] * (1 - fraction) + 
                          inputChannel[index1] * fraction;
      }
    } else {
      // Pass through
      outputChannel.set(inputChannel);
    }
    
    return true;
  }
}

registerProcessor('pitch-correction-processor', PitchCorrectionProcessor);
`;

// Export as blob URL for registration
export const createPitchCorrectionWorklet = (): string => {
  const blob = new Blob([workletCode], { type: 'application/javascript' });
  return URL.createObjectURL(blob);
};
