// Brickwall limiter for mastering
export class LimiterProcessor {
  private context: AudioContext;
  private inputNode: GainNode;
  private outputNode: GainNode;
  private compressor: DynamicsCompressorNode;

  constructor(context: AudioContext) {
    this.context = context;
    this.inputNode = context.createGain();
    this.outputNode = context.createGain();
    this.compressor = context.createDynamicsCompressor();
    
    // Limiter settings (very fast, high ratio)
    this.compressor.threshold.value = -1;
    this.compressor.knee.value = 0;
    this.compressor.ratio.value = 20;
    this.compressor.attack.value = 0.001;
    this.compressor.release.value = 0.1;
    
    this.inputNode.connect(this.compressor);
    this.compressor.connect(this.outputNode);
  }

  getInputNode(): AudioNode {
    return this.inputNode;
  }

  getOutputNode(): AudioNode {
    return this.outputNode;
  }

  setParameter(param: string, value: number): void {
    const now = this.context.currentTime;
    
    switch (param) {
      case 'threshold':
        // -20dB to 0dB
        this.compressor.threshold.setValueAtTime(-20 + (value * 20), now);
        break;
      case 'release':
        // 10ms to 500ms
        this.compressor.release.setValueAtTime(0.01 + (value * 0.49), now);
        break;
      case 'ceiling':
        // Output ceiling via makeup gain
        const ceilingDb = -0.3 + (value * 0.3); // -0.3dB to 0dB
        this.outputNode.gain.setValueAtTime(Math.pow(10, ceilingDb / 20), now);
        break;
    }
  }

  getReduction(): number {
    return this.compressor.reduction / -20;
  }

  destroy(): void {
    this.compressor.disconnect();
    this.inputNode.disconnect();
    this.outputNode.disconnect();
  }
}
