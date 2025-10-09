/**
 * PHASE 6: Waveform Processing Web Worker
 * 
 * Offloads waveform generation to dedicated thread
 * - Prevents main thread blocking
 * - Handles large audio files (10+ hours)
 * - Multi-resolution downsampling
 * - Progressive updates during generation
 */

self.addEventListener('message', async (e) => {
  const { type, data } = e.data;

  try {
    switch (type) {
      case 'GENERATE_WAVEFORM':
        await generateWaveform(data);
        break;
      
      case 'DOWNSAMPLE':
        downsampleWaveform(data);
        break;
      
      case 'GENERATE_MULTI_RES':
        await generateMultiResolution(data);
        break;
      
      default:
        throw new Error(`Unknown message type: ${type}`);
    }
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      error: error.message || 'Waveform processing failed'
    });
  }
});

/**
 * Generate waveform from AudioBuffer channel data
 */
async function generateWaveform({ channelData, samplesPerPixel, normalize, jobId }) {
  const data = new Float32Array(channelData);
  const bars = Math.ceil(data.length / samplesPerPixel);
  const peaks = new Float32Array(bars);
  const rms = new Float32Array(bars);
  
  let maxPeak = 0;
  const progressInterval = Math.floor(bars / 20); // Report progress 20 times
  
  for (let i = 0; i < bars; i++) {
    const startSample = i * samplesPerPixel;
    const endSample = Math.min(startSample + samplesPerPixel, data.length);
    
    let peak = 0;
    let sumSquares = 0;
    let count = 0;
    
    for (let j = startSample; j < endSample; j++) {
      const sample = Math.abs(data[j]);
      peak = Math.max(peak, sample);
      sumSquares += sample * sample;
      count++;
    }
    
    peaks[i] = peak;
    rms[i] = count > 0 ? Math.sqrt(sumSquares / count) : 0;
    maxPeak = Math.max(maxPeak, peak);
    
    // Report progress periodically
    if (i % progressInterval === 0) {
      self.postMessage({
        type: 'PROGRESS',
        jobId,
        progress: i / bars,
      });
    }
  }
  
  // Normalize if requested
  if (normalize && maxPeak > 0) {
    for (let i = 0; i < bars; i++) {
      peaks[i] /= maxPeak;
      rms[i] /= maxPeak;
    }
  }
  
  self.postMessage({
    type: 'WAVEFORM_COMPLETE',
    jobId,
    peaks: peaks.buffer,
    rms: rms.buffer,
  }, [peaks.buffer, rms.buffer]); // Transfer ownership for zero-copy
}

/**
 * Downsample waveform to lower resolution
 */
function downsampleWaveform({ peaks, targetLength, jobId }) {
  const peaksArr = peaks instanceof Float32Array ? peaks : new Float32Array(peaks);
  const ratio = peaksArr.length / targetLength;
  const downsampled = new Float32Array(targetLength);
  
  for (let i = 0; i < targetLength; i++) {
    const startIdx = Math.floor(i * ratio);
    const endIdx = Math.floor((i + 1) * ratio);
    
    let maxPeak = 0;
    for (let j = startIdx; j < endIdx; j++) {
      maxPeak = Math.max(maxPeak, peaksArr[j]);
    }
    
    downsampled[i] = maxPeak;
  }
  
  self.postMessage({
    type: 'DOWNSAMPLE_COMPLETE',
    jobId,
    downsampled: downsampled.buffer,
  }, [downsampled.buffer]);
}

/**
 * Generate multi-resolution waveform pyramid
 */
async function generateMultiResolution({ channelData, duration, jobId }) {
  const data = new Float32Array(channelData);
  
  // Three resolution levels
  const lowSamples = Math.ceil(duration * 100);   // 100 samples/sec
  const mediumSamples = Math.ceil(duration * 500); // 500 samples/sec
  const highSamples = Math.ceil(duration * 2000);  // 2000 samples/sec
  
  // Generate high resolution first
  self.postMessage({ type: 'PROGRESS', jobId, progress: 0, stage: 'high' });
  const high = resampleToPeaks(data, highSamples);
  
  self.postMessage({ type: 'PROGRESS', jobId, progress: 0.33, stage: 'medium' });
  const medium = resampleToPeaks(data, mediumSamples);
  
  self.postMessage({ type: 'PROGRESS', jobId, progress: 0.66, stage: 'low' });
  const low = resampleToPeaks(data, lowSamples);
  
  self.postMessage({
    type: 'MULTI_RES_COMPLETE',
    jobId,
    low: low.buffer,
    medium: medium.buffer,
    high: high.buffer,
  }, [low.buffer, medium.buffer, high.buffer]);
}

/**
 * Resample audio data to target peak count
 */
function resampleToPeaks(data, targetLength) {
  const result = new Float32Array(targetLength);
  const samplesPerPeak = Math.floor(data.length / targetLength);
  
  for (let i = 0; i < targetLength; i++) {
    const start = i * samplesPerPeak;
    const end = Math.min(start + samplesPerPeak, data.length);
    let peak = 0;
    
    for (let j = start; j < end; j++) {
      peak = Math.max(peak, Math.abs(data[j]));
    }
    
    result[i] = peak;
  }
  
  return result;
}

console.log('[WaveformWorker] 🚀 Worker initialized');
