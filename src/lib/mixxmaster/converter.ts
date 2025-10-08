import { DAWPlatform, PluginChain, PluginInstance, MixxMasterError } from './types';

/**
 * Cross-DAW compatibility layer for MixxMaster.tsx
 * Maps plugin chains and parameters between Logic Pro, FL Studio, Pro Tools, and Studio One
 */
export class DAWConverter {
  // Plugin mapping database (simplified - would be expanded with full mappings)
  private static readonly PLUGIN_MAPPINGS: Record<string, Record<DAWPlatform, string>> = {
    // EQ mappings
    'fabfilter_pro_q3': {
      logic: 'Channel EQ',
      fl_studio: 'Parametric EQ 2',
      protools: 'EQ III',
      studio_one: 'Channel Strip EQ',
    },
    'waves_req': {
      logic: 'Channel EQ',
      fl_studio: 'Parametric EQ 2',
      protools: 'EQ III',
      studio_one: 'Pro EQ',
    },
    // Compressor mappings
    'fabfilter_pro_c2': {
      logic: 'Compressor',
      fl_studio: 'Fruity Compressor',
      protools: 'Dyn3 Compressor',
      studio_one: 'Compressor',
    },
    'waves_cla76': {
      logic: 'Compressor',
      fl_studio: 'Fruity Limiter',
      protools: 'Dyn3 Compressor',
      studio_one: 'Channel Strip Compressor',
    },
    // Reverb mappings
    'valhalla_vintage_verb': {
      logic: 'Space Designer',
      fl_studio: 'Fruity Reverb 2',
      protools: 'D-Verb',
      studio_one: 'Room Reverb',
    },
  };

  // Parameter mapping templates
  private static readonly PARAMETER_MAPPINGS: Record<string, Record<string, string>> = {
    eq: {
      frequency: 'freq',
      gain: 'gain',
      q: 'resonance',
      type: 'filter_type',
    },
    compressor: {
      threshold: 'thresh',
      ratio: 'ratio',
      attack: 'attack',
      release: 'release',
      makeup: 'output_gain',
    },
    reverb: {
      decay: 'decay_time',
      size: 'room_size',
      damping: 'high_damp',
      mix: 'wet_dry',
    },
  };

  /**
   * Convert plugin chain to target DAW format
   */
  static convertPluginChain(
    chain: PluginChain,
    targetDAW: DAWPlatform
  ): PluginChain {
    return {
      ...chain,
      plugins: chain.plugins.map(plugin => this.convertPlugin(plugin, targetDAW)),
    };
  }

  /**
   * Convert individual plugin to target DAW
   */
  static convertPlugin(
    plugin: PluginInstance,
    targetDAW: DAWPlatform
  ): PluginInstance {
    // Check if we have a mapping for this plugin
    const pluginKey = this.normalizePluginName(plugin.name);
    const mapping = this.PLUGIN_MAPPINGS[pluginKey];

    if (!mapping || !mapping[targetDAW]) {
      // No direct mapping found, keep original
      return {
        ...plugin,
        dawSpecific: {
          ...plugin.dawSpecific,
          [targetDAW]: plugin.name,
        },
      };
    }

    // Convert plugin name
    const convertedName = mapping[targetDAW];

    // Convert parameters
    const convertedParameters = this.convertParameters(
      plugin.parameters,
      plugin.type,
      targetDAW
    );

    return {
      ...plugin,
      name: convertedName,
      parameters: convertedParameters,
      dawSpecific: {
        ...plugin.dawSpecific,
        [targetDAW]: convertedName,
      },
    };
  }

  /**
   * Convert plugin parameters for target DAW
   */
  private static convertParameters(
    parameters: Record<string, any>,
    pluginType: string,
    targetDAW: DAWPlatform
  ): Record<string, any> {
    const mapping = this.PARAMETER_MAPPINGS[pluginType];
    if (!mapping) return parameters;

    const converted: Record<string, any> = {};

    Object.entries(parameters).forEach(([key, value]) => {
      const mappedKey = mapping[key] || key;
      
      // Apply DAW-specific parameter scaling
      converted[mappedKey] = this.scaleParameter(value, key, pluginType, targetDAW);
    });

    return converted;
  }

  /**
   * Scale parameter values for different DAWs
   */
  private static scaleParameter(
    value: any,
    paramName: string,
    pluginType: string,
    targetDAW: DAWPlatform
  ): any {
    // Different DAWs may use different scales (e.g., 0-1 vs 0-100)
    if (typeof value !== 'number') return value;

    // Example scaling logic - would be expanded per plugin/parameter
    if (paramName === 'mix' || paramName === 'wet_dry') {
      switch (targetDAW) {
        case 'logic':
          return value; // Logic uses 0-100
        case 'fl_studio':
          return value / 100; // FL uses 0-1
        case 'protools':
          return value; // Pro Tools uses 0-100
        case 'studio_one':
          return value / 100; // Studio One uses 0-1
      }
    }

    return value;
  }

  /**
   * Normalize plugin name for mapping lookup
   */
  private static normalizePluginName(name: string): string {
    return name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
  }

  /**
   * Get equivalent plugins across DAWs
   */
  static getPluginEquivalents(pluginName: string): Record<DAWPlatform, string> | null {
    const normalized = this.normalizePluginName(pluginName);
    return this.PLUGIN_MAPPINGS[normalized] || null;
  }

  /**
   * Validate plugin compatibility
   */
  static validateCompatibility(
    plugin: PluginInstance,
    targetDAW: DAWPlatform
  ): {
    compatible: boolean;
    hasDirectMapping: boolean;
    suggestedAlternative?: string;
  } {
    const normalized = this.normalizePluginName(plugin.name);
    const mapping = this.PLUGIN_MAPPINGS[normalized];

    if (!mapping) {
      return {
        compatible: false,
        hasDirectMapping: false,
        suggestedAlternative: this.suggestAlternative(plugin.type, targetDAW),
      };
    }

    const targetPlugin = mapping[targetDAW];

    return {
      compatible: true,
      hasDirectMapping: !!targetPlugin,
      suggestedAlternative: targetPlugin,
    };
  }

  /**
   * Suggest alternative plugin for target DAW
   */
  private static suggestAlternative(pluginType: string, targetDAW: DAWPlatform): string {
    const alternatives: Record<string, Record<DAWPlatform, string>> = {
      eq: {
        logic: 'Channel EQ',
        fl_studio: 'Parametric EQ 2',
        protools: 'EQ III',
        studio_one: 'Pro EQ',
      },
      compressor: {
        logic: 'Compressor',
        fl_studio: 'Fruity Compressor',
        protools: 'Dyn3 Compressor',
        studio_one: 'Compressor',
      },
      reverb: {
        logic: 'Space Designer',
        fl_studio: 'Fruity Reverb 2',
        protools: 'D-Verb',
        studio_one: 'Room Reverb',
      },
      delay: {
        logic: 'Stereo Delay',
        fl_studio: 'Fruity Delay 3',
        protools: 'Mod Delay III',
        studio_one: 'Analog Delay',
      },
      saturation: {
        logic: 'Distortion',
        fl_studio: 'Fruity Fast Dist',
        protools: 'Lo-Fi',
        studio_one: 'Tricomp',
      },
      limiter: {
        logic: 'Adaptive Limiter',
        fl_studio: 'Fruity Limiter',
        protools: 'Maxim',
        studio_one: 'Limiter',
      },
    };

    return alternatives[pluginType]?.[targetDAW] || 'No suggestion available';
  }

  /**
   * Generate compatibility report for entire session
   */
  static generateCompatibilityReport(
    chains: PluginChain[],
    targetDAW: DAWPlatform
  ): {
    totalPlugins: number;
    compatible: number;
    incompatible: number;
    warnings: string[];
  } {
    let totalPlugins = 0;
    let compatible = 0;
    const warnings: string[] = [];

    chains.forEach(chain => {
      chain.plugins.forEach(plugin => {
        totalPlugins++;
        const check = this.validateCompatibility(plugin, targetDAW);
        
        if (check.compatible) {
          compatible++;
        } else {
          warnings.push(
            `${plugin.name} on ${chain.trackName}: No direct mapping. Suggested: ${check.suggestedAlternative}`
          );
        }
      });
    });

    return {
      totalPlugins,
      compatible,
      incompatible: totalPlugins - compatible,
      warnings,
    };
  }
}
