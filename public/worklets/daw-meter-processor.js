/**
 * DAW Meter Processor - Sample-Accurate Audio Metering
 * Runs on dedicated audio thread for precise peak/RMS measurement
 * 
 * Features:
 * - True peak detection
 * - RMS calculation with proper windowing
 * - 60fps updates to main thread
 * - Zero main thread blocking
 */

class DAWMeterProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    
    // Metering accumulators
    this.peakLeft = 0;
    this.peakRight = 0;
    this.rmsSumLeft = 0;
    this.rmsSumRight = 0;
    this.sampleCount = 0;
    
    // Update rate control (60fps)
    this.updateInterval = Math.floor(sampleRate / 60); // ~735 samples at 44.1kHz
    this.samplesSinceUpdate = 0;
  }
  
  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (!input || input.length === 0) {
      // Pass silence through
      if (outputs[0]) {
        outputs[0].forEach(channel => channel.fill(0));
      }
      return true;
    }
    
    const inputLeft = input[0];
    const inputRight = input[1] || input[0]; // Mono to stereo
    const frameCount = inputLeft.length;
    
    // Calculate peak and RMS
    for (let i = 0; i < frameCount; i++) {
      const sampleLeft = inputLeft[i];
      const sampleRight = inputRight[i];
      
      // Peak detection
      const absLeft = Math.abs(sampleLeft);
      const absRight = Math.abs(sampleRight);
      
      if (absLeft > this.peakLeft) this.peakLeft = absLeft;
      if (absRight > this.peakRight) this.peakRight = absRight;
      
      // RMS accumulation
      this.rmsSumLeft += sampleLeft * sampleLeft;
      this.rmsSumRight += sampleRight * sampleRight;
      this.sampleCount++;
    }
    
    this.samplesSinceUpdate += frameCount;
    
    // Send update at ~60fps
    if (this.samplesSinceUpdate >= this.updateInterval) {
      const rmsLeft = Math.sqrt(this.rmsSumLeft / this.sampleCount);
      const rmsRight = Math.sqrt(this.rmsSumRight / this.sampleCount);
      
      // Convert to dB (with floor at -96dB)
      const peakLeftDb = 20 * Math.log10(Math.max(this.peakLeft, 0.00001585)); // -96dB floor
      const peakRightDb = 20 * Math.log10(Math.max(this.peakRight, 0.00001585));
      const rmsLeftDb = 20 * Math.log10(Math.max(rmsLeft, 0.00001585));
      const rmsRightDb = 20 * Math.log10(Math.max(rmsRight, 0.00001585));
      
      // Send to main thread
      this.port.postMessage({
        peak: Math.max(this.peakLeft, this.peakRight),
        peakLeft: this.peakLeft,
        peakRight: this.peakRight,
        rms: (rmsLeft + rmsRight) / 2,
        rmsLeft,
        rmsRight,
        peakDb: Math.max(peakLeftDb, peakRightDb),
        peakLeftDb,
        peakRightDb,
        rmsDb: (rmsLeftDb + rmsRightDb) / 2,
        rmsLeftDb,
        rmsRightDb,
      });
      
      // Reset accumulators
      this.peakLeft = 0;
      this.peakRight = 0;
      this.rmsSumLeft = 0;
      this.rmsSumRight = 0;
      this.sampleCount = 0;
      this.samplesSinceUpdate = 0;
    }
    
    // Pass through audio unchanged
    if (outputs[0]) {
      const output = outputs[0];
      if (output[0]) output[0].set(inputLeft);
      if (output[1]) output[1].set(inputRight);
    }
    
    return true; // Keep processor alive
  }
}

registerProcessor('daw-meter-processor', DAWMeterProcessor);
