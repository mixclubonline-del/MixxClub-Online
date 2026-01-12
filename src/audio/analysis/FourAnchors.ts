/**
 * FourAnchors - Frequency band analysis for adaptive Velvet processing
 * 
 * The Four Anchors represent the key frequency regions that define
 * the character of modern music production:
 * 
 * Body (20-200Hz): Physical impact - the 808 territory
 * Soul (200Hz-2kHz): Emotional center - vocals, melody, presence
 * Silk (1kHz-5kHz): Coherence and glue - where elements blend
 * Air (5kHz-20kHz): Space and presence - hi-hats, brightness
 */

export interface FourAnchorsResult {
  body: number;   // 0-1: 20-200Hz energy
  soul: number;   // 0-1: 200Hz-2kHz energy
  silk: number;   // 0-1: 1kHz-5kHz energy
  air: number;    // 0-1: 5kHz-20kHz energy
  dominant: 'body' | 'soul' | 'silk' | 'air';
  balance: number; // 0-1: How balanced the anchors are
}

export interface FourAnchorsConfig {
  fftSize: number;
  smoothingTimeConstant: number;
}

const DEFAULT_CONFIG: FourAnchorsConfig = {
  fftSize: 2048,
  smoothingTimeConstant: 0.6,
};

/**
 * FourAnchors analyzer class
 */
export class FourAnchorsAnalyzer {
  private context: AudioContext;
  private analyser: AnalyserNode;
  private dataArray: Uint8Array<ArrayBuffer>;
  private config: FourAnchorsConfig;
  
  // Frequency bin mappings (calculated once)
  private bodyBins: [number, number] = [0, 0];
  private soulBins: [number, number] = [0, 0];
  private silkBins: [number, number] = [0, 0];
  private airBins: [number, number] = [0, 0];
  
  constructor(context: AudioContext, config: Partial<FourAnchorsConfig> = {}) {
    this.context = context;
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    this.analyser = context.createAnalyser();
    this.analyser.fftSize = this.config.fftSize;
    this.analyser.smoothingTimeConstant = this.config.smoothingTimeConstant;
    
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    
    this.calculateBinMappings();
  }
  
  /**
   * Calculate frequency bin indices for each anchor range
   */
  private calculateBinMappings(): void {
    const sampleRate = this.context.sampleRate;
    const binCount = this.analyser.frequencyBinCount;
    const binWidth = sampleRate / this.config.fftSize;
    
    // Convert frequency to bin index
    const freqToBin = (freq: number): number => {
      return Math.round(freq / binWidth);
    };
    
    // Body: 20-200Hz
    this.bodyBins = [freqToBin(20), freqToBin(200)];
    
    // Soul: 200Hz-2kHz
    this.soulBins = [freqToBin(200), freqToBin(2000)];
    
    // Silk: 1kHz-5kHz
    this.silkBins = [freqToBin(1000), freqToBin(5000)];
    
    // Air: 5kHz-20kHz (capped at Nyquist)
    this.airBins = [freqToBin(5000), Math.min(freqToBin(20000), binCount - 1)];
  }
  
  /**
   * Get analyzer input node for connecting signal
   */
  getInputNode(): AnalyserNode {
    return this.analyser;
  }
  
  /**
   * Calculate average energy in a bin range (normalized 0-1)
   */
  private calculateBandEnergy(startBin: number, endBin: number): number {
    let sum = 0;
    const count = endBin - startBin + 1;
    
    for (let i = startBin; i <= endBin && i < this.dataArray.length; i++) {
      sum += this.dataArray[i];
    }
    
    // Normalize: 0-255 to 0-1
    return (sum / count) / 255;
  }
  
  /**
   * Analyze current audio and return Four Anchors result
   */
  analyze(): FourAnchorsResult {
    this.analyser.getByteFrequencyData(this.dataArray);
    
    const body = this.calculateBandEnergy(this.bodyBins[0], this.bodyBins[1]);
    const soul = this.calculateBandEnergy(this.soulBins[0], this.soulBins[1]);
    const silk = this.calculateBandEnergy(this.silkBins[0], this.silkBins[1]);
    const air = this.calculateBandEnergy(this.airBins[0], this.airBins[1]);
    
    // Find dominant anchor
    const anchors = { body, soul, silk, air };
    const dominant = (Object.keys(anchors) as (keyof typeof anchors)[])
      .reduce((a, b) => anchors[a] > anchors[b] ? a : b);
    
    // Calculate balance (0 = very unbalanced, 1 = perfectly balanced)
    const values = [body, soul, silk, air];
    const avg = values.reduce((a, b) => a + b, 0) / 4;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / 4;
    const balance = 1 - Math.min(1, Math.sqrt(variance) * 2);
    
    return { body, soul, silk, air, dominant, balance };
  }
  
  /**
   * Get suggested Velvet adjustments based on analysis
   */
  getSuggestions(): {
    warmthAdjust: number;
    powerAdjust: number;
    silkEdgeAdjust: number;
    emotionAdjust: number;
  } {
    const result = this.analyze();
    
    // Adaptive suggestions based on anchor balance
    return {
      // If body is high, boost warmth to complement (not fight)
      warmthAdjust: result.body > 0.6 ? 0.1 : (result.body < 0.3 ? -0.1 : 0),
      
      // If dynamics are needed (low balance), increase power
      powerAdjust: result.balance < 0.5 ? 0.1 : 0,
      
      // If air is lacking, boost silk edge
      silkEdgeAdjust: result.air < 0.4 ? 0.15 : (result.air > 0.7 ? -0.1 : 0),
      
      // If soul is dominant (vocals heavy), boost emotion
      emotionAdjust: result.dominant === 'soul' ? 0.1 : 0,
    };
  }
  
  /**
   * Get visual data for UI (normalized 0-100 for display)
   */
  getVisualData(): {
    body: number;
    soul: number;
    silk: number;
    air: number;
  } {
    const result = this.analyze();
    return {
      body: Math.round(result.body * 100),
      soul: Math.round(result.soul * 100),
      silk: Math.round(result.silk * 100),
      air: Math.round(result.air * 100),
    };
  }
  
  /**
   * Cleanup
   */
  destroy(): void {
    this.analyser.disconnect();
  }
}

/**
 * Create a Four Anchors analyzer connected to a source
 */
export const createFourAnchorsAnalyzer = (
  context: AudioContext,
  sourceNode: AudioNode,
  config?: Partial<FourAnchorsConfig>
): FourAnchorsAnalyzer => {
  const analyzer = new FourAnchorsAnalyzer(context, config);
  sourceNode.connect(analyzer.getInputNode());
  return analyzer;
};
