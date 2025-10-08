import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StemSeparationWindow from '@/components/studio/StemSeparationWindow';

const AIStudio = () => {
  const [activeTab, setActiveTab] = useState('stem-separation');

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">AI Studio</h1>
          <p className="text-muted-foreground">
            Advanced AI-powered tools for audio processing
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="stem-separation">Stem Separation</TabsTrigger>
            <TabsTrigger value="coming-soon">More Tools</TabsTrigger>
          </TabsList>

          <TabsContent value="stem-separation" className="mt-6">
            <StemSeparationWindow />
          </TabsContent>

          <TabsContent value="coming-soon" className="mt-6">
            <Card className="p-8 text-center">
              <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
              <p className="text-muted-foreground">
                More AI tools are on the way!
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AIStudio;
