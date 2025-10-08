// Simple algorithmic reverb using delays and filters
export class ReverbProcessor {
  private context: AudioContext;
  private inputNode: GainNode;
  private outputNode: GainNode;
  private wetGain: GainNode;
  private dryGain: GainNode;
  private convolver: ConvolverNode | null = null;

  constructor(context: AudioContext) {
    this.context = context;
    this.inputNode = context.createGain();
    this.outputNode = context.createGain();
    this.wetGain = context.createGain();
    this.dryGain = context.createGain();
    
    this.wetGain.gain.value = 0.3;
    this.dryGain.gain.value = 0.7;
    
    // Create simple reverb using convolver
    this.createImpulseResponse();
    
    // Routing: input splits to dry and wet paths
    this.inputNode.connect(this.dryGain);
    this.dryGain.connect(this.outputNode);
    
    if (this.convolver) {
      this.inputNode.connect(this.convolver);
      this.convolver.connect(this.wetGain);
      this.wetGain.connect(this.outputNode);
    }
  }

  private createImpulseResponse(): void {
    const sampleRate = this.context.sampleRate;
    const length = sampleRate * 2; // 2 second reverb
    const impulse = this.context.createBuffer(2, length, sampleRate);
    
    const leftChannel = impulse.getChannelData(0);
    const rightChannel = impulse.getChannelData(1);
    
    for (let i = 0; i < length; i++) {
      const decay = Math.exp(-i / (sampleRate * 0.5));
      leftChannel[i] = (Math.random() * 2 - 1) * decay;
      rightChannel[i] = (Math.random() * 2 - 1) * decay;
    }
    
    this.convolver = this.context.createConvolver();
    this.convolver.buffer = impulse;
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
      case 'mix':
        this.wetGain.gain.setValueAtTime(value, now);
        this.dryGain.gain.setValueAtTime(1 - value, now);
        break;
      case 'decay':
        // Recreate impulse with new decay time
        if (value !== 0.5) {
          this.createImpulseResponse();
          if (this.convolver) {
            this.inputNode.disconnect();
            this.inputNode.connect(this.dryGain);
            this.inputNode.connect(this.convolver);
            this.convolver.connect(this.wetGain);
          }
        }
        break;
      case 'damping':
        // Could add low-pass filter to wet signal
        break;
    }
  }

  destroy(): void {
    this.convolver?.disconnect();
    this.inputNode.disconnect();
    this.outputNode.disconnect();
    this.wetGain.disconnect();
    this.dryGain.disconnect();
  }
}
