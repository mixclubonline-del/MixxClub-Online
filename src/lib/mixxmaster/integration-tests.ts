import { supabase } from "@/integrations/supabase/client";

export interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  duration: number;
}

export class MixxMasterIntegrationTests {
  private results: TestResult[] = [];

  async runAll(): Promise<TestResult[]> {
    this.results = [];
    
    await this.testDatabaseConnection();
    await this.testStorageAccess();
    await this.testRealtimeConnection();
    await this.testAudioProcessing();
    await this.testVersionControl();
    await this.testCollaboration();
    
    return this.results;
  }

  private async testDatabaseConnection(): Promise<void> {
    const start = performance.now();
    try {
      const { data, error } = await supabase
        .from('mixxmaster_sessions')
        .select('id')
        .limit(1);
      
      if (error) throw error;
      
      this.results.push({
        name: 'Database Connection',
        passed: true,
        duration: performance.now() - start
      });
    } catch (error) {
      this.results.push({
        name: 'Database Connection',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: performance.now() - start
      });
    }
  }

  private async testStorageAccess(): Promise<void> {
    const start = performance.now();
    try {
      const { data, error } = await supabase.storage
        .from('session-packages')
        .list('', { limit: 1 });
      
      if (error) throw error;
      
      this.results.push({
        name: 'Storage Access',
        passed: true,
        duration: performance.now() - start
      });
    } catch (error) {
      this.results.push({
        name: 'Storage Access',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: performance.now() - start
      });
    }
  }

  private async testRealtimeConnection(): Promise<void> {
    const start = performance.now();
    try {
      const channel = supabase.channel('test-channel');
      
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Realtime connection timeout'));
        }, 5000);

        channel.subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            clearTimeout(timeout);
            resolve();
          }
        });
      });

      await supabase.removeChannel(channel);
      
      this.results.push({
        name: 'Realtime Connection',
        passed: true,
        duration: performance.now() - start
      });
    } catch (error) {
      this.results.push({
        name: 'Realtime Connection',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: performance.now() - start
      });
    }
  }

  private async testAudioProcessing(): Promise<void> {
    const start = performance.now();
    try {
      // Test audio context creation
      const audioContext = new AudioContext();
      
      // Test basic audio processing
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      gainNode.gain.value = 0; // Silent
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.1);
      
      await audioContext.close();
      
      this.results.push({
        name: 'Audio Processing',
        passed: true,
        duration: performance.now() - start
      });
    } catch (error) {
      this.results.push({
        name: 'Audio Processing',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: performance.now() - start
      });
    }
  }

  private async testVersionControl(): Promise<void> {
    const start = performance.now();
    try {
      const { data, error } = await supabase
        .from('mixxmaster_versions')
        .select('id')
        .limit(1);
      
      if (error) throw error;
      
      this.results.push({
        name: 'Version Control',
        passed: true,
        duration: performance.now() - start
      });
    } catch (error) {
      this.results.push({
        name: 'Version Control',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: performance.now() - start
      });
    }
  }

  private async testCollaboration(): Promise<void> {
    const start = performance.now();
    try {
      const { data, error } = await supabase
        .from('collaboration_sessions')
        .select('id')
        .limit(1);
      
      if (error) throw error;
      
      this.results.push({
        name: 'Collaboration Features',
        passed: true,
        duration: performance.now() - start
      });
    } catch (error) {
      this.results.push({
        name: 'Collaboration Features',
        passed: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: performance.now() - start
      });
    }
  }

  getPassRate(): number {
    if (this.results.length === 0) return 0;
    const passed = this.results.filter(r => r.passed).length;
    return (passed / this.results.length) * 100;
  }

  getFailedTests(): TestResult[] {
    return this.results.filter(r => !r.passed);
  }
}
