// Stereo delay with feedback and filtering
export class DelayProcessor {
  private context: AudioContext;
  private inputNode: GainNode;
  private outputNode: GainNode;
  private delayNodeL: DelayNode;
  private delayNodeR: DelayNode;
  private feedbackL: GainNode;
  private feedbackR: GainNode;
  private wetGain: GainNode;
  private dryGain: GainNode;
  private filter: BiquadFilterNode;

  constructor(context: AudioContext) {
    this.context = context;
    this.inputNode = context.createGain();
    this.outputNode = context.createGain();
    
    this.delayNodeL = context.createDelay(5.0);
    this.delayNodeR = context.createDelay(5.0);
    this.feedbackL = context.createGain();
    this.feedbackR = context.createGain();
    this.wetGain = context.createGain();
    this.dryGain = context.createGain();
    this.filter = context.createBiquadFilter();
    
    // Default settings
    this.delayNodeL.delayTime.value = 0.375; // 1/4 note at 120 BPM
    this.delayNodeR.delayTime.value = 0.5; // dotted 1/4
    this.feedbackL.gain.value = 0.4;
    this.feedbackR.gain.value = 0.4;
    this.wetGain.gain.value = 0.3;
    this.dryGain.gain.value = 0.7;
    this.filter.type = 'lowpass';
    this.filter.frequency.value = 4000;
    
    // Routing
    this.inputNode.connect(this.dryGain);
    this.dryGain.connect(this.outputNode);
    
    // Wet path with feedback
    this.inputNode.connect(this.delayNodeL);
    this.delayNodeL.connect(this.filter);
    this.filter.connect(this.feedbackL);
    this.feedbackL.connect(this.delayNodeL); // Feedback loop L
    this.feedbackL.connect(this.delayNodeR); // Cross to R
    
    this.inputNode.connect(this.delayNodeR);
    this.delayNodeR.connect(this.feedbackR);
    this.feedbackR.connect(this.delayNodeR); // Feedback loop R
    this.feedbackR.connect(this.delayNodeL); // Cross to L
    
    this.feedbackL.connect(this.wetGain);
    this.feedbackR.connect(this.wetGain);
    this.wetGain.connect(this.outputNode);
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
      case 'time':
        // 10ms to 2s
        const delayTime = 0.01 + (value * 1.99);
        this.delayNodeL.delayTime.setValueAtTime(delayTime, now);
        this.delayNodeR.delayTime.setValueAtTime(delayTime * 1.33, now);
        break;
      case 'feedback':
        this.feedbackL.gain.setValueAtTime(value * 0.8, now);
        this.feedbackR.gain.setValueAtTime(value * 0.8, now);
        break;
      case 'mix':
        this.wetGain.gain.setValueAtTime(value, now);
        this.dryGain.gain.setValueAtTime(1 - value, now);
        break;
      case 'filter':
        // 200Hz to 20kHz
        this.filter.frequency.setValueAtTime(200 + (value * 19800), now);
        break;
    }
  }

  destroy(): void {
    this.delayNodeL.disconnect();
    this.delayNodeR.disconnect();
    this.feedbackL.disconnect();
    this.feedbackR.disconnect();
    this.wetGain.disconnect();
    this.dryGain.disconnect();
    this.filter.disconnect();
    this.inputNode.disconnect();
    this.outputNode.disconnect();
  }
}
