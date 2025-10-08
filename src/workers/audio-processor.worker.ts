// Web Worker for offloading CPU-intensive audio processing

interface AudioProcessingTask {
  type: 'normalize' | 'eq' | 'compress' | 'analyze' | 'fft';
  audioData: Float32Array;
  parameters?: Record<string, any>;
}

interface AudioProcessingResult {
  success: boolean;
  processedData?: Float32Array;
  analysis?: Record<string, any>;
  error?: string;
}

self.onmessage = async (e: MessageEvent<AudioProcessingTask>) => {
  const { type, audioData, parameters = {} } = e.data;

  try {
    let result: AudioProcessingResult;

    switch (type) {
      case 'normalize':
        result = normalizeAudio(audioData, parameters);
        break;
      case 'eq':
        result = applyEQ(audioData, parameters);
        break;
      case 'compress':
        result = applyCompression(audioData, parameters);
        break;
      case 'analyze':
        result = analyzeAudio(audioData);
        break;
      case 'fft':
        result = performFFT(audioData, parameters);
        break;
      default:
        result = {
          success: false,
          error: `Unknown task type: ${type}`
        };
    }

    self.postMessage(result);
  } catch (error) {
    self.postMessage({
      success: false,
      error: error instanceof Error ? error.message : 'Processing failed'
    });
  }
};

function normalizeAudio(audioData: Float32Array, params: Record<string, any>): AudioProcessingResult {
  const targetLevel = params.targetLevel || -3; // dB
  const output = new Float32Array(audioData.length);

  // Find peak
  let peak = 0;
  for (let i = 0; i < audioData.length; i++) {
    peak = Math.max(peak, Math.abs(audioData[i]));
  }

  // Calculate gain
  const targetLinear = Math.pow(10, targetLevel / 20);
  const gain = peak > 0 ? targetLinear / peak : 1;

  // Apply gain
  for (let i = 0; i < audioData.length; i++) {
    output[i] = audioData[i] * gain;
  }

  return { success: true, processedData: output };
}

function applyEQ(audioData: Float32Array, params: Record<string, any>): AudioProcessingResult {
  // Simplified biquad filter implementation
  const { frequency = 1000, gain = 0, q = 1, filterType = 'peaking' } = params;
  const output = new Float32Array(audioData.length);

  const sampleRate = 44100;
  const omega = (2 * Math.PI * frequency) / sampleRate;
  const sn = Math.sin(omega);
  const cs = Math.cos(omega);
  const alpha = sn / (2 * q);
  const A = Math.pow(10, gain / 40);

  let b0, b1, b2, a0, a1, a2;

  if (filterType === 'peaking') {
    b0 = 1 + alpha * A;
    b1 = -2 * cs;
    b2 = 1 - alpha * A;
    a0 = 1 + alpha / A;
    a1 = -2 * cs;
    a2 = 1 - alpha / A;
  } else {
    b0 = b1 = b2 = a0 = a1 = a2 = 1;
  }

  // Normalize coefficients
  b0 /= a0;
  b1 /= a0;
  b2 /= a0;
  a1 /= a0;
  a2 /= a0;

  // Apply filter
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;

  for (let i = 0; i < audioData.length; i++) {
    const x0 = audioData[i];
    const y0 = b0 * x0 + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;

    output[i] = y0;

    x2 = x1;
    x1 = x0;
    y2 = y1;
    y1 = y0;
  }

  return { success: true, processedData: output };
}

function applyCompression(audioData: Float32Array, params: Record<string, any>): AudioProcessingResult {
  const {
    threshold = -12,
    ratio = 4,
    attack = 0.003,
    release = 0.1,
    knee = 3,
    makeupGain = 0
  } = params;

  const output = new Float32Array(audioData.length);
  const sampleRate = 44100;

  const thresholdLinear = Math.pow(10, threshold / 20);
  const attackCoeff = Math.exp(-1 / (attack * sampleRate));
  const releaseCoeff = Math.exp(-1 / (release * sampleRate));
  const kneeLinear = Math.pow(10, knee / 20);
  const makeupGainLinear = Math.pow(10, makeupGain / 20);

  let envelope = 0;

  for (let i = 0; i < audioData.length; i++) {
    const input = Math.abs(audioData[i]);

    // Envelope follower
    const coeff = input > envelope ? attackCoeff : releaseCoeff;
    envelope = coeff * envelope + (1 - coeff) * input;

    // Calculate gain reduction
    let gainReduction = 1;

    if (envelope > thresholdLinear) {
      const overshoot = envelope / thresholdLinear;

      if (envelope > thresholdLinear + kneeLinear) {
        // Hard knee
        gainReduction = Math.pow(overshoot, 1 / ratio - 1);
      } else {
        // Soft knee
        const kneeRange = envelope - thresholdLinear;
        const kneeRatio = kneeRange / (2 * kneeLinear);
        gainReduction = Math.pow(overshoot, kneeRatio * (1 / ratio - 1));
      }
    }

    output[i] = audioData[i] * gainReduction * makeupGainLinear;
  }

  return { success: true, processedData: output };
}

function analyzeAudio(audioData: Float32Array): AudioProcessingResult {
  // Calculate various audio metrics
  let sumSquares = 0;
  let peak = 0;
  let dcOffset = 0;

  for (let i = 0; i < audioData.length; i++) {
    const sample = audioData[i];
    dcOffset += sample;
    sumSquares += sample * sample;
    peak = Math.max(peak, Math.abs(sample));
  }

  const mean = dcOffset / audioData.length;
  const rms = Math.sqrt(sumSquares / audioData.length);
  const crestFactor = peak > 0 ? 20 * Math.log10(peak / rms) : 0;

  const analysis = {
    peak: 20 * Math.log10(peak),
    rms: 20 * Math.log10(rms),
    crestFactor,
    dcOffset: mean,
    samples: audioData.length
  };

  return { success: true, analysis };
}

function performFFT(audioData: Float32Array, params: Record<string, any>): AudioProcessingResult {
  const fftSize = params.fftSize || 2048;
  const windowType = params.windowType || 'hann';

  // Apply windowing function
  const windowed = applyWindow(audioData.slice(0, fftSize), windowType);

  // Simplified FFT (Cooley-Tukey)
  const fft = cooleyTukeyFFT(windowed);

  // Calculate magnitudes
  const magnitudes = new Float32Array(fftSize / 2);
  for (let i = 0; i < fftSize / 2; i++) {
    const real = fft[i * 2];
    const imag = fft[i * 2 + 1];
    magnitudes[i] = Math.sqrt(real * real + imag * imag);
  }

  return {
    success: true,
    analysis: {
      magnitudes: Array.from(magnitudes),
      frequencies: Array.from({ length: fftSize / 2 }, (_, i) => (i * 44100) / fftSize)
    }
  };
}

function applyWindow(data: Float32Array, windowType: string): Float32Array {
  const windowed = new Float32Array(data.length);
  const N = data.length;

  for (let i = 0; i < N; i++) {
    let w = 1;

    if (windowType === 'hann') {
      w = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (N - 1)));
    } else if (windowType === 'hamming') {
      w = 0.54 - 0.46 * Math.cos((2 * Math.PI * i) / (N - 1));
    } else if (windowType === 'blackman') {
      w = 0.42 - 0.5 * Math.cos((2 * Math.PI * i) / (N - 1)) +
          0.08 * Math.cos((4 * Math.PI * i) / (N - 1));
    }

    windowed[i] = data[i] * w;
  }

  return windowed;
}

function cooleyTukeyFFT(data: Float32Array): Float32Array {
  const N = data.length;
  const output = new Float32Array(N * 2); // Real and imaginary components

  // Copy input to output (real part)
  for (let i = 0; i < N; i++) {
    output[i * 2] = data[i];
    output[i * 2 + 1] = 0;
  }

  // Bit-reversal permutation
  let j = 0;
  for (let i = 0; i < N; i++) {
    if (j > i) {
      [output[i * 2], output[j * 2]] = [output[j * 2], output[i * 2]];
      [output[i * 2 + 1], output[j * 2 + 1]] = [output[j * 2 + 1], output[i * 2 + 1]];
    }

    let k = N / 2;
    while (k <= j) {
      j -= k;
      k /= 2;
    }
    j += k;
  }

  // FFT
  for (let len = 2; len <= N; len *= 2) {
    const halfLen = len / 2;
    const angle = -2 * Math.PI / len;

    for (let i = 0; i < N; i += len) {
      for (let j = 0; j < halfLen; j++) {
        const idx1 = (i + j) * 2;
        const idx2 = (i + j + halfLen) * 2;

        const wReal = Math.cos(angle * j);
        const wImag = Math.sin(angle * j);

        const tReal = wReal * output[idx2] - wImag * output[idx2 + 1];
        const tImag = wReal * output[idx2 + 1] + wImag * output[idx2];

        output[idx2] = output[idx1] - tReal;
        output[idx2 + 1] = output[idx1 + 1] - tImag;

        output[idx1] += tReal;
        output[idx1 + 1] += tImag;
      }
    }
  }

  return output;
}

export {};
