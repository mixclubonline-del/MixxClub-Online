import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PluginBrowser } from './PluginBrowser';
import { PluginRack } from './PluginRack';
import { usePluginStore } from '@/stores/pluginStore';

// Import all plugins
import { MixxPort } from './MixxPort';
import { MixxEQ } from './MixxEQ';
import { MixxComp } from './MixxComp';
import { MixxReverb } from './MixxReverb';
import { MixxDelay } from './MixxDelay';
import { MixxMaster } from './MixxMasterPlugin';
import { MixxVoice } from './MixxVoice';
import { MixxClip } from './MixxClip';
import { MixxFX } from './MixxFX';
import { MixxVintage } from './MixxVintage';
import { PrimeBot } from './PrimeBot';
import { MixxTunePlugin } from '@/components/studio/MixxTunePlugin';

interface PluginManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PluginManager: React.FC<PluginManagerProps> = ({ isOpen, onClose }) => {
  const { openPlugins, openPlugin, closePlugin } = usePluginStore();
  const [activePluginWindows, setActivePluginWindows] = useState<Record<string, boolean>>({});

  const handlePluginSelect = (pluginId: string) => {
    openPlugin(pluginId);
    setActivePluginWindows(prev => ({ ...prev, [pluginId]: true }));
  };

  const handleRemovePlugin = (pluginId: string) => {
    closePlugin(pluginId);
    setActivePluginWindows(prev => ({ ...prev, [pluginId]: false }));
  };

  const handleOpenPluginWindow = (pluginId: string) => {
    setActivePluginWindows(prev => ({ ...prev, [pluginId]: true }));
  };

  const handleClosePluginWindow = (pluginId: string) => {
    setActivePluginWindows(prev => ({ ...prev, [pluginId]: false }));
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Plugin Manager</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="browser" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="browser">Browse Plugins</TabsTrigger>
              <TabsTrigger value="rack">Active Rack ({openPlugins.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="browser" className="mt-6">
              <PluginBrowser onPluginSelect={handlePluginSelect} />
            </TabsContent>
            
            <TabsContent value="rack" className="mt-6">
              <PluginRack 
                openPlugins={openPlugins}
                onRemovePlugin={handleRemovePlugin}
                onOpenPlugin={handleOpenPluginWindow}
              />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Plugin Windows */}
      <MixxPort 
        isOpen={activePluginWindows['mixx-port'] || false} 
        onClose={() => handleClosePluginWindow('mixx-port')}
        onAudioLoaded={(file, analysis) => console.log('Audio loaded:', file, analysis)}
      />
      <MixxEQ 
        isOpen={activePluginWindows['mixx-eq'] || false} 
        onClose={() => handleClosePluginWindow('mixx-eq')}
      />
      <MixxComp 
        isOpen={activePluginWindows['mixx-comp'] || false} 
        onClose={() => handleClosePluginWindow('mixx-comp')}
      />
      <MixxReverb 
        isOpen={activePluginWindows['mixx-reverb'] || false} 
        onClose={() => handleClosePluginWindow('mixx-reverb')}
      />
      <MixxDelay 
        isOpen={activePluginWindows['mixx-delay'] || false} 
        onClose={() => handleClosePluginWindow('mixx-delay')}
      />
      <MixxMaster 
        isOpen={activePluginWindows['mixx-master'] || false} 
        onClose={() => handleClosePluginWindow('mixx-master')}
      />
      <MixxVoice 
        isOpen={activePluginWindows['mixx-voice'] || false} 
        onClose={() => handleClosePluginWindow('mixx-voice')}
      />
      <MixxClip 
        isOpen={activePluginWindows['mixx-clip'] || false} 
        onClose={() => handleClosePluginWindow('mixx-clip')}
      />
      <MixxFX 
        isOpen={activePluginWindows['mixx-fx'] || false} 
        onClose={() => handleClosePluginWindow('mixx-fx')}
      />
      <MixxVintage 
        isOpen={activePluginWindows['mixx-vintage'] || false} 
        onClose={() => handleClosePluginWindow('mixx-vintage')}
      />
      <PrimeBot 
        isOpen={activePluginWindows['prime-bot'] || false} 
        onClose={() => handleClosePluginWindow('prime-bot')}
      />
      {activePluginWindows['mixxtune'] && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="relative max-w-2xl w-full">
            <MixxTunePlugin onClose={() => handleClosePluginWindow('mixxtune')} />
          </div>
        </div>
      )}
    </>
  );
};
