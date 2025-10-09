/**
 * PHASE 6: Web Worker Pool for Waveform Generation
 * 
 * Manages pool of workers for parallel waveform processing
 * - Prevents main thread blocking
 * - Handles concurrent jobs
 * - Progressive loading feedback
 */

interface WaveformJob {
  id: string;
  resolve: (result: any) => void;
  reject: (error: Error) => void;
  onProgress?: (progress: number) => void;
}

class WaveformWorkerPool {
  private workers: Worker[] = [];
  private queue: WaveformJob[] = [];
  private activeJobs = new Map<string, WaveformJob>();
  private workerCount: number;

  constructor(workerCount = navigator.hardwareConcurrency || 4) {
    this.workerCount = Math.min(workerCount, 4); // Max 4 workers
    this.initWorkers();
  }

  private initWorkers() {
    for (let i = 0; i < this.workerCount; i++) {
      const worker = new Worker('/workers/waveform-worker.js');
      
      worker.addEventListener('message', (e) => {
        this.handleWorkerMessage(e.data);
      });
      
      worker.addEventListener('error', (error) => {
        console.error('[WaveformPool] Worker error:', error);
      });
      
      this.workers.push(worker);
    }
    
    console.log(`[WaveformPool] ✅ Initialized ${this.workerCount} workers`);
  }

  private handleWorkerMessage(data: any) {
    const job = this.activeJobs.get(data.jobId);
    if (!job) return;

    switch (data.type) {
      case 'PROGRESS':
        job.onProgress?.(data.progress);
        break;
      
      case 'WAVEFORM_COMPLETE':
        job.resolve({
          peaks: new Float32Array(data.peaks),
          rms: new Float32Array(data.rms),
        });
        this.activeJobs.delete(data.jobId);
        this.processQueue();
        break;
      
      case 'MULTI_RES_COMPLETE':
        job.resolve({
          low: new Float32Array(data.low),
          medium: new Float32Array(data.medium),
          high: new Float32Array(data.high),
        });
        this.activeJobs.delete(data.jobId);
        this.processQueue();
        break;
      
      case 'DOWNSAMPLE_COMPLETE':
        job.resolve(new Float32Array(data.downsampled));
        this.activeJobs.delete(data.jobId);
        this.processQueue();
        break;
      
      case 'ERROR':
        job.reject(new Error(data.error));
        this.activeJobs.delete(data.jobId);
        this.processQueue();
        break;
    }
  }

  private processQueue() {
    if (this.queue.length === 0) return;
    
    // Find available worker
    const availableWorker = this.workers.find(w => 
      !Array.from(this.activeJobs.values()).some(job => 
        (job as any).worker === w
      )
    );
    
    if (availableWorker && this.queue.length > 0) {
      const job = this.queue.shift()!;
      (job as any).worker = availableWorker;
      // Job will be sent by caller
    }
  }

  async generateWaveform(
    channelData: Float32Array,
    samplesPerPixel: number,
    normalize = true,
    onProgress?: (progress: number) => void
  ): Promise<{ peaks: Float32Array; rms: Float32Array }> {
    return new Promise((resolve, reject) => {
      const jobId = `waveform-${Date.now()}-${Math.random()}`;
      const job: WaveformJob = { id: jobId, resolve, reject, onProgress };
      
      if (this.activeJobs.size < this.workerCount) {
        // Send immediately
        const worker = this.workers[this.activeJobs.size];
        this.activeJobs.set(jobId, job);
        worker.postMessage({
          type: 'GENERATE_WAVEFORM',
          data: {
            channelData: channelData.buffer,
            samplesPerPixel,
            normalize,
            jobId,
          }
        }, [channelData.buffer.slice(0)]); // Clone buffer
      } else {
        // Queue for later
        this.queue.push(job);
      }
    });
  }

  async generateMultiResolution(
    channelData: Float32Array,
    duration: number,
    onProgress?: (progress: number, stage?: string) => void
  ): Promise<{ low: Float32Array; medium: Float32Array; high: Float32Array }> {
    return new Promise((resolve, reject) => {
      const jobId = `multi-${Date.now()}-${Math.random()}`;
      const job: WaveformJob = { id: jobId, resolve, reject, onProgress };
      
      if (this.activeJobs.size < this.workerCount) {
        const worker = this.workers[this.activeJobs.size];
        this.activeJobs.set(jobId, job);
        worker.postMessage({
          type: 'GENERATE_MULTI_RES',
          data: {
            channelData: channelData.buffer,
            duration,
            jobId,
          }
        }, [channelData.buffer.slice(0)]);
      } else {
        this.queue.push(job);
      }
    });
  }

  dispose() {
    this.workers.forEach(w => w.terminate());
    this.workers = [];
    this.activeJobs.clear();
    this.queue = [];
    console.log('[WaveformPool] ✅ Workers terminated');
  }
}

// Singleton instance
export const waveformWorkerPool = new WaveformWorkerPool();
