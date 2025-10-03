import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BulkOperations } from './BulkOperations';
import { DataExporter } from './DataExporter';
import { AdvancedSearch, FilterCondition } from './AdvancedSearch';
import { useAuditLog } from '@/hooks/useAuditLog';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

// Example data structure
interface ExampleItem {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  role: string;
  createdAt: string;
}

// Sample data
const sampleData: ExampleItem[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', status: 'active', role: 'admin', createdAt: '2024-01-15' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', status: 'active', role: 'user', createdAt: '2024-02-20' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', status: 'inactive', role: 'user', createdAt: '2024-03-10' },
  { id: '4', name: 'Alice Williams', email: 'alice@example.com', status: 'active', role: 'moderator', createdAt: '2024-04-05' },
  { id: '5', name: 'Charlie Brown', email: 'charlie@example.com', status: 'inactive', role: 'user', createdAt: '2024-05-12' },
];

export function AdvancedFeaturesDemo() {
  const [data, setData] = useState<ExampleItem[]>(sampleData);
  const [selectedItems, setSelectedItems] = useState<ExampleItem[]>([]);
  const [filteredData, setFilteredData] = useState<ExampleItem[]>(sampleData);
  const { logAction } = useAuditLog();

  const searchFields = [
    { value: 'name', label: 'Name' },
    { value: 'email', label: 'Email' },
    { value: 'status', label: 'Status' },
    { value: 'role', label: 'Role' },
  ];

  const handleToggleSelect = (item: ExampleItem) => {
    setSelectedItems(prev => 
      prev.find(i => i.id === item.id)
        ? prev.filter(i => i.id !== item.id)
        : [...prev, item]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === filteredData.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredData);
    }
  };

  const handleBulkDelete = async (items: ExampleItem[]) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const itemIds = items.map(i => i.id);
    setData(prev => prev.filter(item => !itemIds.includes(item.id)));
    setFilteredData(prev => prev.filter(item => !itemIds.includes(item.id)));
    
    // Log audit action
    await logAction({
      user_id: 'current-user-id',
      action: 'bulk_delete',
      resource_type: 'users',
      resource_id: 'multiple',
      metadata: {
        count: items.length,
        ids: itemIds,
      },
    });
  };

  const handleExport = (items: ExampleItem[]) => {
    // The DataExporter component handles the actual export
    logAction({
      user_id: 'current-user-id',
      action: 'export_data',
      resource_type: 'users',
      resource_id: 'multiple',
      metadata: {
        count: items.length,
        format: 'csv',
      },
    });
  };

  const handleAdvancedSearch = (conditions: FilterCondition[]) => {
    let filtered = [...data];
    
    conditions.forEach(condition => {
      filtered = filtered.filter(item => {
        const value = String(item[condition.field as keyof ExampleItem]).toLowerCase();
        const searchValue = condition.value.toLowerCase();
        
        switch (condition.operator) {
          case 'equals':
            return value === searchValue;
          case 'contains':
            return value.includes(searchValue);
          case 'startsWith':
            return value.startsWith(searchValue);
          case 'endsWith':
            return value.endsWith(searchValue);
          default:
            return true;
        }
      });
    });
    
    setFilteredData(filtered);
    setSelectedItems([]);
    
    logAction({
      user_id: 'current-user-id',
      action: 'advanced_search',
      resource_type: 'users',
      resource_id: 'search',
      metadata: {
        conditions,
        resultsCount: filtered.length,
      },
    });
  };

  const handleClearSearch = () => {
    setFilteredData(data);
    setSelectedItems([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Advanced Features Demo</h2>
          <p className="text-sm text-muted-foreground">
            Example of bulk operations, advanced search, and data export
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <AdvancedSearch
            fields={searchFields}
            onSearch={handleAdvancedSearch}
            onClear={handleClearSearch}
          />
          <DataExporter
            data={selectedItems.length > 0 ? selectedItems : filteredData}
            filename="users-export"
            headers={{
              id: 'ID',
              name: 'Full Name',
              email: 'Email Address',
              status: 'Status',
              role: 'Role',
              createdAt: 'Created Date',
            }}
          />
        </div>
      </div>

      <BulkOperations
        selectedItems={selectedItems}
        onClearSelection={() => setSelectedItems([])}
        onDelete={handleBulkDelete}
        onExport={handleExport}
        totalItems={filteredData.length}
      />

      <Card>
        <div className="p-6">
          <div className="space-y-4">
            {/* Header Row */}
            <div className="flex items-center gap-4 pb-3 border-b font-medium">
              <div className="w-12">
                <Checkbox
                  checked={selectedItems.length === filteredData.length && filteredData.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </div>
              <div className="flex-1">Name</div>
              <div className="flex-1">Email</div>
              <div className="w-32">Status</div>
              <div className="w-32">Role</div>
              <div className="w-32">Created</div>
            </div>

            {/* Data Rows */}
            {filteredData.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No results found
              </div>
            ) : (
              filteredData.map(item => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 py-3 border-b last:border-0 hover:bg-accent/50 transition-colors rounded"
                >
                  <div className="w-12">
                    <Checkbox
                      checked={selectedItems.some(i => i.id === item.id)}
                      onCheckedChange={() => handleToggleSelect(item)}
                    />
                  </div>
                  <div className="flex-1 font-medium">{item.name}</div>
                  <div className="flex-1 text-sm text-muted-foreground">{item.email}</div>
                  <div className="w-32">
                    <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
                      {item.status}
                    </Badge>
                  </div>
                  <div className="w-32 text-sm">{item.role}</div>
                  <div className="w-32 text-sm text-muted-foreground">{item.createdAt}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-muted/50">
        <h3 className="font-semibold mb-3">Features Demonstrated:</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>✓ <strong>Bulk Selection:</strong> Select multiple items using checkboxes</li>
          <li>✓ <strong>Bulk Operations:</strong> Delete multiple items at once</li>
          <li>✓ <strong>Advanced Search:</strong> Multi-condition filtering with various operators</li>
          <li>✓ <strong>Data Export:</strong> Export to CSV or JSON format</li>
          <li>✓ <strong>Audit Logging:</strong> All actions are automatically logged</li>
          <li>✓ <strong>Responsive Design:</strong> Works on all screen sizes</li>
        </ul>
      </Card>
    </div>
  );
}
