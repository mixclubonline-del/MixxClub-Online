import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTutorial } from '@/contexts/TutorialContext';
import { Play, Clock } from 'lucide-react';
import { AppLayout } from '@/components/layouts/AppLayout';
import { CharacterEmptyState } from '@/components/characters/CharacterEmptyState';

const Tutorials = () => {
  const { allTutorials, startTutorial } = useTutorial();
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All Tutorials' },
    { id: 'getting-started', label: 'Getting Started' },
    { id: 'artist', label: 'For Artists' },
    { id: 'engineer', label: 'For Engineers' },
    { id: 'feature', label: 'Features' },
    { id: 'advanced', label: 'Advanced' },
  ];

  const filteredTutorials = activeCategory === 'all'
    ? allTutorials
    : allTutorials.filter(t => t.category === activeCategory);

  return (
    <AppLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Tutorials</h1>
          <p className="text-muted-foreground">
            Learn how to use Mixxclub with interactive step-by-step guides
          </p>
        </div>

        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="mb-8">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            {categories.map((cat) => (
              <TabsTrigger key={cat.id} value={cat.id}>
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredTutorials.map((tutorial) => (
            <Card key={tutorial.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge variant="secondary" className="capitalize">
                    {tutorial.category.replace('-', ' ')}
                  </Badge>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {tutorial.estimated_minutes}m
                  </div>
                </div>
                <CardTitle className="line-clamp-2">{tutorial.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {tutorial.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => startTutorial(tutorial.slug)}
                    className="flex-1"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start Tutorial
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTutorials.length === 0 && (
          <CharacterEmptyState
            type="search"
            title="No tutorials found"
            message="No tutorials in this category yet. Check back soon!"
          />
        )}
      </div>
    </AppLayout>
  );
};

export default Tutorials;
