import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trash2, Tag, X, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface BulkActionsProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkCategoryChange: (category: string) => void;
  onBulkDelete: () => void;
  selectedUrls: string[];
}

const categories = [
  { value: 'characters', label: 'Characters' },
  { value: 'logos', label: 'Logos' },
  { value: 'backgrounds', label: 'Backgrounds' },
  { value: 'videos', label: 'Videos' },
  { value: 'ui_elements', label: 'UI Elements' },
  { value: 'uncategorized', label: 'Uncategorized' },
];

export function BulkActions({
  selectedCount,
  onClearSelection,
  onBulkCategoryChange,
  onBulkDelete,
  selectedUrls,
}: BulkActionsProps) {
  const handleCopyUrls = () => {
    navigator.clipboard.writeText(selectedUrls.join('\n'));
    toast.success(`Copied ${selectedUrls.length} URLs to clipboard`);
  };

  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-background border rounded-lg shadow-lg p-3 flex items-center gap-3 animate-in slide-in-from-bottom-4">
      <span className="text-sm font-medium px-2">
        {selectedCount} selected
      </span>

      <div className="h-6 w-px bg-border" />

      <Select onValueChange={onBulkCategoryChange}>
        <SelectTrigger className="w-[140px] h-8">
          <Tag className="w-4 h-4 mr-2" />
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          {categories.map((cat) => (
            <SelectItem key={cat.value} value={cat.value}>
              {cat.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button variant="outline" size="sm" onClick={handleCopyUrls}>
        <Copy className="w-4 h-4 mr-2" />
        Copy URLs
      </Button>

      <Button 
        variant="destructive" 
        size="sm" 
        onClick={onBulkDelete}
      >
        <Trash2 className="w-4 h-4 mr-2" />
        Delete
      </Button>

      <Button variant="ghost" size="sm" onClick={onClearSelection}>
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}
