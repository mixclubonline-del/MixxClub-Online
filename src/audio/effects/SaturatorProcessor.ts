// Harmonic saturation/distortion
export class SaturatorProcessor {
  private context: AudioContext;
  private inputNode: GainNode;
  private outputNode: GainNode;
  private shaper: WaveShaperNode;
  private preGain: GainNode;
  private postGain: GainNode;

  constructor(context: AudioContext) {
    this.context = context;
    this.inputNode = context.createGain();
    this.outputNode = context.createGain();
    this.shaper = context.createWaveShaper();
    this.preGain = context.createGain();
    this.postGain = context.createGain();
    
    this.preGain.gain.value = 1;
    this.postGain.gain.value = 1;
    this.updateCurve(0.5);
    
    // Chain: input -> preGain -> shaper -> postGain -> output
    this.inputNode.connect(this.preGain);
    this.preGain.connect(this.shaper);
    this.shaper.connect(this.postGain);
    this.postGain.connect(this.outputNode);
  }

  private updateCurve(amount: number): void {
    const samples = 1024;
    const curve = new Float32Array(samples);
    const deg = Math.PI / 180;
    
    for (let i = 0; i < samples; i++) {
      const x = (i * 2 / samples) - 1;
      const k = amount * 100;
      
      // Soft clipping curve
      curve[i] = (1 + k) * x / (1 + k * Math.abs(x));
    }
    
    this.shaper.curve = curve;
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
      case 'drive':
        this.preGain.gain.setValueAtTime(1 + (value * 9), now); // 1x to 10x
        this.updateCurve(value);
        break;
      case 'warmth':
        this.updateCurve(value);
        break;
      case 'output':
        this.postGain.gain.setValueAtTime(value, now);
        break;
    }
  }

  destroy(): void {
    this.shaper.disconnect();
    this.preGain.disconnect();
    this.postGain.disconnect();
    this.inputNode.disconnect();
    this.outputNode.disconnect();
  }
}
