import { usePluginStore } from '@/stores/pluginStore';
import { MixxEQ } from '@/components/plugins/MixxEQ';
import { MixxComp } from '@/components/plugins/MixxComp';
import { MixxReverb } from '@/components/plugins/MixxReverb';
import { MixxDelay } from '@/components/plugins/MixxDelay';
import { MixxMaster } from '@/components/plugins/MixxMaster';
import { MixxVintage } from '@/components/plugins/MixxVintage';

export const PluginManager = () => {
  const { openPlugins, closePlugin } = usePluginStore();

  return (
    <>
      {openPlugins.map((pluginId) => {
        const isOpen = true;
        const onClose = () => closePlugin(pluginId);

        switch (pluginId) {
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
          default:
            return null;
        }
      })}
    </>
  );
};
