import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Filter, X, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export interface FilterCondition {
  field: string;
  operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greaterThan' | 'lessThan';
  value: string;
}

interface AdvancedSearchProps {
  fields: Array<{ value: string; label: string }>;
  onSearch: (conditions: FilterCondition[]) => void;
  onClear: () => void;
}

export function AdvancedSearch({ fields, onSearch, onClear }: AdvancedSearchProps) {
  const [conditions, setConditions] = useState<FilterCondition[]>([
    { field: fields[0]?.value || '', operator: 'contains', value: '' }
  ]);
  const [open, setOpen] = useState(false);

  const operators = [
    { value: 'equals' as const, label: 'Equals' },
    { value: 'contains' as const, label: 'Contains' },
    { value: 'startsWith' as const, label: 'Starts with' },
    { value: 'endsWith' as const, label: 'Ends with' },
    { value: 'greaterThan' as const, label: 'Greater than' },
    { value: 'lessThan' as const, label: 'Less than' },
  ];

  const addCondition = () => {
    setConditions([
      ...conditions,
      { field: fields[0]?.value || '', operator: 'contains', value: '' }
    ]);
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const updateCondition = (index: number, updates: Partial<FilterCondition>) => {
    setConditions(conditions.map((cond, i) => 
      i === index ? { ...cond, ...updates } : cond
    ));
  };

  const handleSearch = () => {
    const validConditions = conditions.filter(c => c.field && c.value);
    onSearch(validConditions);
    setOpen(false);
  };

  const handleClear = () => {
    setConditions([{ field: fields[0]?.value || '', operator: 'contains', value: '' }]);
    onClear();
    setOpen(false);
  };

  const activeFilters = conditions.filter(c => c.value).length;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="h-4 w-4" />
          Advanced Search
          {activeFilters > 0 && (
            <Badge variant="secondary" className="ml-1">
              {activeFilters}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Advanced Search</SheetTitle>
          <SheetDescription>
            Add multiple filter conditions to narrow down your search
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 mt-6">
          {conditions.map((condition, index) => (
            <div key={index} className="space-y-3 p-4 border rounded-lg bg-card">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Condition {index + 1}</Label>
                {conditions.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCondition(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="grid gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Field</Label>
                  <Select
                    value={condition.field}
                    onValueChange={(value) => updateCondition(index, { field: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fields.map(field => (
                        <SelectItem key={field.value} value={field.value}>
                          {field.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">Operator</Label>
                  <Select
                    value={condition.operator}
                    onValueChange={(value: FilterCondition['operator']) => 
                      updateCondition(index, { operator: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {operators.map(op => (
                        <SelectItem key={op.value} value={op.value}>
                          {op.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">Value</Label>
                  <Input
                    value={condition.value}
                    onChange={(e) => updateCondition(index, { value: e.target.value })}
                    placeholder="Enter value..."
                  />
                </div>
              </div>
            </div>
          ))}

          <Button
            variant="outline"
            size="sm"
            onClick={addCondition}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Condition
          </Button>
        </div>

        <div className="flex gap-2 mt-6">
          <Button onClick={handleSearch} className="flex-1">
            Apply Filters
          </Button>
          <Button onClick={handleClear} variant="outline">
            Clear All
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
