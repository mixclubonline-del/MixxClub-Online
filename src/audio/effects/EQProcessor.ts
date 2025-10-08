// Parametric EQ with 4 bands
export class EQProcessor {
  private context: AudioContext;
  private filters: BiquadFilterNode[] = [];
  private inputNode: GainNode;
  private outputNode: GainNode;

  constructor(context: AudioContext) {
    this.context = context;
    this.inputNode = context.createGain();
    this.outputNode = context.createGain();
    
    // Create 4-band EQ: Low Shelf, Low Mid, High Mid, High Shelf
    const filterTypes: BiquadFilterType[] = ['lowshelf', 'peaking', 'peaking', 'highshelf'];
    const frequencies = [80, 400, 2500, 10000];
    
    filterTypes.forEach((type, i) => {
      const filter = context.createBiquadFilter();
      filter.type = type;
      filter.frequency.value = frequencies[i];
      filter.Q.value = 1.0;
      filter.gain.value = 0;
      
      this.filters.push(filter);
      
      // Chain filters
      if (i === 0) {
        this.inputNode.connect(filter);
      } else {
        this.filters[i - 1].connect(filter);
      }
      
      if (i === filterTypes.length - 1) {
        filter.connect(this.outputNode);
      }
    });
  }

  getInputNode(): AudioNode {
    return this.inputNode;
  }

  getOutputNode(): AudioNode {
    return this.outputNode;
  }

  setParameter(param: string, value: number): void {
    const bandMatch = param.match(/band(\d+)/);
    if (!bandMatch) return;
    
    const bandIndex = parseInt(bandMatch[1]) - 1;
    if (bandIndex < 0 || bandIndex >= this.filters.length) return;
    
    // Map 0-1 to -12dB to +12dB
    const gainDb = (value - 0.5) * 24;
    this.filters[bandIndex].gain.setValueAtTime(gainDb, this.context.currentTime);
  }

  destroy(): void {
    this.filters.forEach(filter => filter.disconnect());
    this.inputNode.disconnect();
    this.outputNode.disconnect();
  }
}
