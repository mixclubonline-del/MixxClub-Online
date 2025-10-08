// Classic VCA-style compressor
export class CompressorProcessor {
  private context: AudioContext;
  private compressor: DynamicsCompressorNode;
  private inputNode: GainNode;
  private outputNode: GainNode;
  private makeupGain: GainNode;

  constructor(context: AudioContext) {
    this.context = context;
    this.inputNode = context.createGain();
    this.outputNode = context.createGain();
    this.makeupGain = context.createGain();
    this.compressor = context.createDynamicsCompressor();
    
    // Default settings
    this.compressor.threshold.value = -24;
    this.compressor.knee.value = 30;
    this.compressor.ratio.value = 12;
    this.compressor.attack.value = 0.003;
    this.compressor.release.value = 0.25;
    
    // Chain: input -> compressor -> makeup -> output
    this.inputNode.connect(this.compressor);
    this.compressor.connect(this.makeupGain);
    this.makeupGain.connect(this.outputNode);
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
        // -60dB to 0dB
        this.compressor.threshold.setValueAtTime(-60 + (value * 60), now);
        break;
      case 'ratio':
        // 1:1 to 20:1
        this.compressor.ratio.setValueAtTime(1 + (value * 19), now);
        break;
      case 'attack':
        // 0.001s to 1s
        this.compressor.attack.setValueAtTime(0.001 + (value * 0.999), now);
        break;
      case 'release':
        // 0.01s to 3s
        this.compressor.release.setValueAtTime(0.01 + (value * 2.99), now);
        break;
      case 'makeup':
        // 0dB to +24dB
        const makeupDb = value * 24;
        this.makeupGain.gain.setValueAtTime(Math.pow(10, makeupDb / 20), now);
        break;
    }
  }

  getReduction(): number {
    // Returns gain reduction amount (0-1)
    return this.compressor.reduction / -40;
  }

  destroy(): void {
    this.compressor.disconnect();
    this.inputNode.disconnect();
    this.outputNode.disconnect();
    this.makeupGain.disconnect();
  }
}
