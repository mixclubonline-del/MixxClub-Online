import { usePluginStore } from '@/stores/pluginStore';
import { MixxEQ } from '@/components/plugins/MixxEQ';
import { MixxComp } from '@/components/plugins/MixxComp';
import { MixxReverb } from '@/components/plugins/MixxReverb';
import { MixxDelay } from '@/components/plugins/MixxDelay';
import { MixxMaster } from '@/components/plugins/MixxMaster';
import { MixxVintage } from '@/components/plugins/MixxVintage';
import { MixxPort } from '@/components/plugins/MixxPort';
import { MixxVoice } from '@/components/plugins/MixxVoice';
import { MixxClip } from '@/components/plugins/MixxClip';
import { MixxFX } from '@/components/plugins/MixxFX';

export const PluginManager = () => {
  const { openPlugins, closePlugin } = usePluginStore();

  const handleAudioLoaded = (file: File, analysis: any) => {
    console.log('Audio loaded:', file.name, analysis);
  };

  return (
    <>
      {openPlugins.map((pluginId) => {
        const isOpen = true;
        const onClose = () => closePlugin(pluginId);

        switch (pluginId) {
          case 'mixx-port':
            return <MixxPort key={pluginId} isOpen={isOpen} onClose={onClose} onAudioLoaded={handleAudioLoaded} />;
          case 'mixx-eq':
            return <MixxEQ key={pluginId} isOpen={isOpen} onClose={onClose} />;
          case 'mixx-comp':
            return <MixxComp key={pluginId} isOpen={isOpen} onClose={onClose} />;
          case 'mixx-reverb':
            return <MixxReverb key={pluginId} isOpen={isOpen} onClose={onClose} />;
          case 'mixx-delay':
            return <MixxDelay key={pluginId} isOpen={isOpen} onClose={onClose} />;
          case 'mixx-master':
            return <MixxMaster key={pluginId} isOpen={isOpen} onClose={onClose} />;
          case 'mixx-vintage':
            return <MixxVintage key={pluginId} isOpen={isOpen} onClose={onClose} />;
          case 'mixx-voice':
            return <MixxVoice key={pluginId} isOpen={isOpen} onClose={onClose} />;
          case 'mixx-clip':
            return <MixxClip key={pluginId} isOpen={isOpen} onClose={onClose} />;
          case 'mixx-fx':
            return <MixxFX key={pluginId} isOpen={isOpen} onClose={onClose} />;
          default:
            return null;
        }
      })}
    </>
  );
};
