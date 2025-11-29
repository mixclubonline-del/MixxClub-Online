import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTutorial } from '@/contexts/TutorialContext';

interface TutorialLauncherProps {
  contextTutorials?: string[];
}

export const TutorialLauncher = ({ contextTutorials = [] }: TutorialLauncherProps) => {
  const { allTutorials, startTutorial } = useTutorial();

  const suggestedTutorials = contextTutorials.length > 0
    ? allTutorials.filter(t => contextTutorials.includes(t.slug))
    : allTutorials.filter(t => t.category === 'getting-started').slice(0, 3);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <HelpCircle className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Quick Tutorials</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {suggestedTutorials.map((tutorial) => (
          <DropdownMenuItem
            key={tutorial.id}
            onClick={() => startTutorial(tutorial.slug)}
            className="flex flex-col items-start gap-1 cursor-pointer"
          >
            <span className="font-medium">{tutorial.title}</span>
            <span className="text-xs text-muted-foreground">
              {tutorial.estimated_minutes} min
            </span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a href="/tutorials" className="cursor-pointer">
            View All Tutorials
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
