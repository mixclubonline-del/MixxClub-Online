/**
 * Genre Pattern Generator - One-click drum patterns for modern production
 * Generates authentic patterns for Trap, Drill, Reggaeton, Afrobeat
 */

export interface PatternStep {
  active: boolean;
  velocity: number;    // 0-127
  pitch?: number;      // MIDI note offset (-12 to +12)
  slide?: boolean;     // Enable slide to next note
}

export interface DrumPattern {
  id: string;
  name: string;
  genre: string;
  bpm: number;
  steps: number;       // 16 or 32
  kick: PatternStep[];
  snare: PatternStep[];
  hihat: PatternStep[];
  openHat: PatternStep[];
  perc?: PatternStep[];
}

/**
 * Create an empty step
 */
const off = (): PatternStep => ({ active: false, velocity: 0 });

/**
 * Create an active step with velocity
 */
const on = (velocity: number = 100, pitch?: number, slide?: boolean): PatternStep => ({
  active: true,
  velocity,
  pitch,
  slide,
});

export class GenrePatternGenerator {
  /**
   * Generate Trap Hi-Hat pattern with 32nd note rolls
   */
  static trapHiHat(variation: 'basic' | 'complex' | 'rolls' = 'basic'): PatternStep[] {
    const steps: PatternStep[] = [];
    
    for (let i = 0; i < 32; i++) {
      if (variation === 'basic') {
        // Basic 16th note pattern
        steps.push(i % 2 === 0 ? on(100) : on(70));
      } else if (variation === 'complex') {
        // Complex trap pattern with velocity ramps
        const isDownbeat = i % 8 === 0;
        const isUpbeat = i % 4 === 2;
        const velocity = isDownbeat ? 110 : isUpbeat ? 95 : 60 + Math.random() * 40;
        steps.push(on(velocity));
      } else if (variation === 'rolls') {
        // 32nd note rolls on beats 2 and 4
        const inRollZone = (i >= 12 && i <= 15) || (i >= 28 && i <= 31);
        if (inRollZone) {
          const rampVel = 70 + ((i % 4) * 15); // Velocity ramps up
          steps.push(on(rampVel));
        } else if (i % 2 === 0) {
          steps.push(on(90));
        } else {
          steps.push(on(50));
        }
      }
    }
    
    return steps;
  }
  
  /**
   * Generate UK Drill pattern with sliding 808s
   */
  static ukDrill808(): PatternStep[] {
    // 16 step pattern - characteristic sliding bass
    return [
      on(110, 0),         // 1
      off(),              // .
      off(),              // .
      on(90, 5, true),    // slide up
      off(),              // .
      off(),              // .
      on(100, 0),         // 2
      off(),              // .
      off(),              // .
      on(85, 7, true),    // slide up more
      off(),              // .
      on(95, 0),          // and
      off(),              // .
      on(80, -5, true),   // slide down
      off(),              // .
      off(),              // .
    ];
  }
  
  /**
   * Generate Reggaeton Dembow pattern (3+3+2)
   */
  static dembowKick(): PatternStep[] {
    // Classic 3+3+2 pattern
    const pattern: PatternStep[] = [];
    
    for (let i = 0; i < 16; i++) {
      // Dembow: hits on 1, 4 (3 apart), 7 (3 apart), 9 (2 apart)
      // Then repeats: 1, 4, 7, 9, 11, 14, 15
      const dembowHits = [0, 3, 6, 8, 10, 13, 15];
      
      if (dembowHits.includes(i)) {
        const velocity = i === 0 ? 110 : i === 8 ? 105 : 95;
        pattern.push(on(velocity));
      } else {
        pattern.push(off());
      }
    }
    
    return pattern;
  }
  
  /**
   * Generate Reggaeton snare/rimshot pattern
   */
  static dembowSnare(): PatternStep[] {
    const pattern: PatternStep[] = [];
    
    for (let i = 0; i < 16; i++) {
      // Snare on 2, 4 (every 4 steps, offset by 2)
      if (i === 4 || i === 12) {
        pattern.push(on(110));
      } else if (i === 6 || i === 14) {
        // Ghost note
        pattern.push(on(60));
      } else {
        pattern.push(off());
      }
    }
    
    return pattern;
  }
  
  /**
   * Generate Afrobeat 12/8 polyrhythm kick
   */
  static afrobeatKick(): PatternStep[] {
    // 12/8 feel: groups of 3 within 4 beats
    const pattern: PatternStep[] = [];
    
    for (let i = 0; i < 16; i++) {
      // Afrobeat often emphasizes 1, the "and" of 2, and 3
      const afroHits = [0, 5, 8, 10];
      
      if (afroHits.includes(i)) {
        const velocity = i === 0 ? 110 : 90;
        pattern.push(on(velocity));
      } else {
        pattern.push(off());
      }
    }
    
    return pattern;
  }
  
  /**
   * Generate Afrobeat log drum/percussion pattern
   */
  static afrobeatPerc(): PatternStep[] {
    const pattern: PatternStep[] = [];
    
    for (let i = 0; i < 16; i++) {
      // Syncopated shaker/percussion pattern
      if (i % 3 === 0 || i % 5 === 0) {
        pattern.push(on(70 + Math.random() * 30));
      } else if (i % 2 === 1) {
        pattern.push(on(40 + Math.random() * 20));
      } else {
        pattern.push(off());
      }
    }
    
    return pattern;
  }
  
  /**
   * Generate complete drum pattern for a genre
   */
  static generatePattern(genre: 'trap' | 'uk-drill' | 'reggaeton' | 'afrobeat'): DrumPattern {
    switch (genre) {
      case 'trap':
        return {
          id: `trap-${Date.now()}`,
          name: 'Trap Pattern',
          genre: 'trap',
          bpm: 140,
          steps: 32,
          kick: [
            on(110), off(), off(), off(),
            off(), off(), on(90), off(),
            off(), off(), on(100), off(),
            off(), off(), off(), off(),
            on(110), off(), off(), off(),
            off(), off(), on(95), off(),
            off(), on(80), off(), off(),
            on(100), off(), off(), off(),
          ],
          snare: [
            off(), off(), off(), off(),
            on(110), off(), off(), off(),
            off(), off(), off(), off(),
            on(110), off(), off(), off(),
            off(), off(), off(), off(),
            on(110), off(), off(), off(),
            off(), off(), off(), off(),
            on(110), off(), on(60), off(),
          ],
          hihat: this.trapHiHat('complex'),
          openHat: Array(32).fill(null).map((_, i) => 
            i === 6 || i === 14 || i === 22 || i === 30 ? on(80) : off()
          ),
        };
        
      case 'uk-drill':
        return {
          id: `drill-${Date.now()}`,
          name: 'UK Drill Pattern',
          genre: 'uk-drill',
          bpm: 140,
          steps: 16,
          kick: this.ukDrill808(),
          snare: [
            off(), off(), off(), off(),
            on(110), off(), off(), off(),
            off(), off(), off(), on(70),
            on(110), off(), off(), off(),
          ],
          hihat: Array(16).fill(null).map((_, i) => 
            i % 2 === 0 ? on(90) : on(50)
          ),
          openHat: Array(16).fill(null).map((_, i) => 
            i === 7 || i === 15 ? on(85) : off()
          ),
        };
        
      case 'reggaeton':
        return {
          id: `reggaeton-${Date.now()}`,
          name: 'Dembow Pattern',
          genre: 'reggaeton',
          bpm: 95,
          steps: 16,
          kick: this.dembowKick(),
          snare: this.dembowSnare(),
          hihat: Array(16).fill(null).map((_, i) => 
            on(i % 2 === 0 ? 90 : 60)
          ),
          openHat: Array(16).fill(null).map((_, i) => 
            i === 2 || i === 10 ? on(70) : off()
          ),
        };
        
      case 'afrobeat':
        return {
          id: `afrobeat-${Date.now()}`,
          name: 'Afrobeat Pattern',
          genre: 'afrobeat',
          bpm: 105,
          steps: 16,
          kick: this.afrobeatKick(),
          snare: [
            off(), off(), off(), off(),
            on(100), off(), off(), off(),
            off(), off(), off(), off(),
            on(100), off(), off(), on(50),
          ],
          hihat: Array(16).fill(null).map((_, i) => on(i % 3 === 0 ? 95 : 65)),
          openHat: Array(16).fill(null).map((_, i) => 
            i === 3 || i === 11 ? on(80) : off()
          ),
          perc: this.afrobeatPerc(),
        };
        
      default:
        throw new Error(`Unknown genre: ${genre}`);
    }
  }
  
  /**
   * Get available genres
   */
  static getGenres(): string[] {
    return ['trap', 'uk-drill', 'reggaeton', 'afrobeat'];
  }
}
