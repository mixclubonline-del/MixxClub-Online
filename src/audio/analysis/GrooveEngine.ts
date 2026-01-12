/**
 * Groove Engine - Musical feel and swing quantization
 * Brings human feel to perfectly quantized audio
 */

export interface GrooveTemplate {
  id: string;
  name: string;
  description: string;
  swingAmount: number; // 0-100 percentage
  offsets: number[]; // 16th note offsets in percentage (-50 to +50)
  velocity: number[]; // 16th note velocity adjustments (0-127)
}

export class GrooveEngine {
  // Pre-built groove templates - 2026 Genre-Native Collection
  static readonly TEMPLATES: Record<string, GrooveTemplate> = {
    // === TRAP & MELODIC ===
    'atlanta-trap': {
      id: 'atlanta-trap',
      name: 'Atlanta Trap',
      description: '16% swing with snappy hi-hats and 808 bounce',
      swingAmount: 16,
      offsets: [0, 0, 8, 0, 0, 0, 8, 0, 0, 0, 10, 0, 0, 0, 10, 0],
      velocity: [100, 90, 110, 85, 100, 88, 112, 82, 100, 92, 108, 87, 100, 89, 110, 84],
    },
    
    'melodic-trap': {
      id: 'melodic-trap',
      name: 'Melodic Trap',
      description: 'Gunna/Lil Baby pocket with subtle push',
      swingAmount: 12,
      offsets: [0, 2, 6, 0, 0, 3, 5, 0, 0, 2, 6, 0, 0, 3, 5, 0],
      velocity: [100, 85, 92, 80, 100, 88, 95, 78, 100, 85, 92, 80, 100, 88, 95, 78],
    },
    
    // === DRILL ===
    'uk-drill': {
      id: 'uk-drill',
      name: 'UK Drill',
      description: '140 BPM, no swing, perfect quantization for sliding 808s',
      swingAmount: 0,
      offsets: new Array(16).fill(0), // Dead straight
      velocity: [100, 88, 100, 85, 100, 90, 100, 82, 100, 88, 100, 85, 100, 90, 100, 82],
    },
    
    'ny-drill': {
      id: 'ny-drill',
      name: 'NY Drill',
      description: 'Brooklyn drill - aggressive bouncy feel',
      swingAmount: 5,
      offsets: [0, 3, 0, 2, 0, 4, 0, 2, 0, 3, 0, 2, 0, 4, 0, 2],
      velocity: [100, 85, 95, 82, 100, 88, 95, 80, 100, 85, 95, 82, 100, 88, 95, 80],
    },
    
    // === LATIN ===
    'dembow': {
      id: 'dembow',
      name: 'Dembow',
      description: 'Classic reggaeton 3+3+2 rhythm pattern',
      swingAmount: 0,
      offsets: new Array(16).fill(0),
      velocity: [100, 0, 0, 95, 0, 0, 90, 0, 100, 0, 0, 95, 0, 0, 90, 0], // 3+3+2 accents
    },
    
    // === AFRICAN ===
    'amapiano': {
      id: 'amapiano',
      name: 'Amapiano',
      description: 'South African house groove with deep swing',
      swingAmount: 22,
      offsets: [0, -5, 10, -3, 0, -6, 12, -4, 0, -5, 10, -3, 0, -6, 12, -4],
      velocity: [100, 70, 85, 68, 100, 72, 88, 65, 100, 70, 85, 68, 100, 72, 88, 65],
    },
    
    'afrobeat': {
      id: 'afrobeat',
      name: 'Afrobeat',
      description: '12/8 polyrhythm feel with organic swing',
      swingAmount: 18,
      offsets: [0, -4, 8, 0, -3, 6, 0, -5, 0, -4, 8, 0, -3, 6, 0, -5],
      velocity: [100, 75, 85, 90, 80, 88, 78, 72, 100, 75, 85, 90, 80, 88, 78, 72],
    },
    
    // === R&B ===
    'rnb-pocket': {
      id: 'rnb-pocket',
      name: 'R&B Pocket',
      description: 'Deep laid-back groove for smooth R&B',
      swingAmount: 15,
      offsets: [0, -3, 8, -2, 0, -4, 7, -3, 0, -3, 8, -2, 0, -4, 7, -3],
      velocity: [95, 70, 82, 68, 98, 72, 85, 70, 95, 70, 82, 68, 98, 72, 85, 70],
    },
    
    // === UTILITY ===
    'straight': {
      id: 'straight',
      name: 'Straight (No Swing)',
      description: 'Perfect quantization - grid-locked',
      swingAmount: 0,
      offsets: new Array(16).fill(0),
      velocity: new Array(16).fill(100),
    },
    
    'shuffle': {
      id: 'shuffle',
      name: 'Shuffle',
      description: 'Triplet-based shuffle feel for R&B/Neo-Soul',
      swingAmount: 33,
      offsets: [0, -12, 16, -8, 0, -10, 18, -6, 0, -14, 15, -9, 0, -11, 17, -7],
      velocity: [100, 80, 90, 75, 100, 78, 92, 73, 100, 82, 88, 77, 100, 79, 91, 74],
    },
  };

  /**
   * Apply groove template to a time value
   * @param time - Original time in seconds
   * @param tempo - BPM
   * @param template - Groove template to apply
   * @returns Adjusted time with groove applied
   */
  static applyGroove(
    time: number,
    tempo: number,
    template: GrooveTemplate
  ): number {
    const beatsPerSecond = tempo / 60;
    const secondsPerBeat = 1 / beatsPerSecond;
    const secondsPer16th = secondsPerBeat / 4;

    // Find which 16th note this time falls on
    const beatNumber = time / secondsPerBeat;
    const sixteenthNote = Math.floor((beatNumber % 4) * 4);
    
    // Get offset for this 16th note (wrap around if pattern is shorter)
    const offsetIndex = sixteenthNote % template.offsets.length;
    const offsetPercent = template.offsets[offsetIndex];
    
    // Convert offset percentage to time
    const offsetTime = (offsetPercent / 100) * secondsPer16th;
    
    return time + offsetTime;
  }

  /**
   * Apply groove to multiple time values (batch operation)
   */
  static applyGrooveBatch(
    times: number[],
    tempo: number,
    template: GrooveTemplate
  ): number[] {
    return times.map(time => this.applyGroove(time, tempo, template));
  }

  /**
   * Get velocity adjustment for a given time
   * Used for MIDI or sample triggering
   */
  static getVelocityAdjustment(
    time: number,
    tempo: number,
    template: GrooveTemplate
  ): number {
    const beatsPerSecond = tempo / 60;
    const secondsPerBeat = 1 / beatsPerSecond;
    
    const beatNumber = time / secondsPerBeat;
    const sixteenthNote = Math.floor((beatNumber % 4) * 4);
    
    const velocityIndex = sixteenthNote % template.velocity.length;
    return template.velocity[velocityIndex];
  }

  /**
   * Create custom groove template from user input
   */
  static createCustomTemplate(
    name: string,
    swingAmount: number,
    customOffsets?: number[]
  ): GrooveTemplate {
    // Generate offsets based on swing amount if not provided
    const offsets = customOffsets || this.generateSwingOffsets(swingAmount);
    
    return {
      id: `custom-${Date.now()}`,
      name,
      description: 'Custom groove',
      swingAmount,
      offsets,
      velocity: new Array(16).fill(100), // Default to constant velocity
    };
  }

  /**
   * Generate swing offsets from swing percentage
   */
  private static generateSwingOffsets(swingPercent: number): number[] {
    const offsets: number[] = [];
    
    for (let i = 0; i < 16; i++) {
      if (i % 2 === 0) {
        // On-beat: no offset
        offsets.push(0);
      } else {
        // Off-beat: apply swing
        // Swing moves odd 16th notes later
        const offset = (swingPercent / 100) * 25; // Max 25% offset
        offsets.push(offset);
      }
    }
    
    return offsets;
  }

  /**
   * Analyze region timing to detect existing groove
   * Returns closest matching template
   */
  static detectGroove(
    regionStartTimes: number[],
    tempo: number
  ): { template: GrooveTemplate; confidence: number } {
    const beatsPerSecond = tempo / 60;
    const secondsPerBeat = 1 / beatsPerSecond;
    const secondsPer16th = secondsPerBeat / 4;

    // Calculate timing deviations
    const deviations: number[] = [];
    
    for (const time of regionStartTimes) {
      const expectedTime = Math.round(time / secondsPer16th) * secondsPer16th;
      const deviation = ((time - expectedTime) / secondsPer16th) * 100;
      deviations.push(deviation);
    }

    // Compare against templates
    let bestMatch: GrooveTemplate = this.TEMPLATES['straight'];
    let lowestError = Infinity;

    for (const template of Object.values(this.TEMPLATES)) {
      let error = 0;
      
      for (let i = 0; i < deviations.length; i++) {
        const offsetIndex = i % template.offsets.length;
        const expectedOffset = template.offsets[offsetIndex];
        error += Math.abs(deviations[i] - expectedOffset);
      }
      
      const avgError = error / deviations.length;
      
      if (avgError < lowestError) {
        lowestError = avgError;
        bestMatch = template;
      }
    }

    const confidence = Math.max(0, 100 - lowestError);
    
    return { template: bestMatch, confidence };
  }

  /**
   * Quantize regions to groove template
   * Used for "Quantize to Groove" operation
   */
  static quantizeToGroove(
    regions: Array<{ id: string; startTime: number }>,
    tempo: number,
    template: GrooveTemplate,
    strength: number = 100 // 0-100: how much to apply groove
  ): Array<{ id: string; newStartTime: number }> {
    return regions.map(region => {
      const groovedTime = this.applyGroove(region.startTime, tempo, template);
      
      // Blend original and grooved time based on strength
      const blendFactor = strength / 100;
      const newStartTime = region.startTime + (groovedTime - region.startTime) * blendFactor;
      
      return {
        id: region.id,
        newStartTime,
      };
    });
  }
}
