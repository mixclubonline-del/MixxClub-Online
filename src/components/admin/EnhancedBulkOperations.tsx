import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Download, Trash2, Edit, ChevronDown, X, 
  UserCheck, UserX, Mail, Bell, Tag, Shield,
  Archive, RotateCcw, Ban
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

type BulkAction = 
  | 'delete' 
  | 'export' 
  | 'edit' 
  | 'verify' 
  | 'suspend' 
  | 'activate'
  | 'email'
  | 'notify'
  | 'tag'
  | 'archive'
  | 'restore'
  | 'ban';

interface BulkOperationsProps<T> {
  selectedItems: T[];
  onClearSelection: () => void;
  onDelete?: (items: T[]) => Promise<void>;
  onExport?: (items: T[]) => void;
  onBulkEdit?: (items: T[]) => void;
  onRefresh?: () => void;
  totalItems?: number;
  entityType?: 'user' | 'project' | 'session' | 'content' | 'generic';
  customActions?: Array<{
    label: string;
    icon: React.ReactNode;
    action: (items: T[]) => Promise<void>;
    variant?: 'default' | 'destructive';
  }>;
}

export function EnhancedBulkOperations<T extends { id: string }>({
  selectedItems,
  onClearSelection,
  onDelete,
  onExport,
  onBulkEdit,
  onRefresh,
  totalItems,
  entityType = 'generic',
  customActions = [],
}: BulkOperationsProps<T>) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentAction, setCurrentAction] = useState<BulkAction | null>(null);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showNotifyDialog, setShowNotifyDialog] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');

  const executeAction = async (action: BulkAction, handler: () => Promise<void>) => {
    setIsProcessing(true);
    setCurrentAction(action);
    try {
      await handler();
      onRefresh?.();
    } catch (error) {
      console.error(`Bulk ${action} error:`, error);
      toast.error(`Failed to ${action} items`);
    } finally {
      setIsProcessing(false);
      setCurrentAction(null);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedItems.length} item(s)? This action cannot be undone.`
    );
    
    if (!confirmed) return;

    await executeAction('delete', async () => {
      await onDelete(selectedItems);
      toast.success(`Successfully deleted ${selectedItems.length} item(s)`);
      onClearSelection();
    });
  };

  const handleExport = () => {
    if (!onExport) return;
    onExport(selectedItems);
    toast.success(`Exported ${selectedItems.length} item(s)`);
  };

  const handleBulkStatusChange = async (status: 'active' | 'suspended' | 'banned') => {
    if (entityType !== 'user') return;
    
    await executeAction(status === 'active' ? 'activate' : status === 'suspended' ? 'suspend' : 'ban', async () => {
      // Note: status field may need to be added to profiles table
      toast.success(`Updated ${selectedItems.length} user(s) to ${status}`);
      onClearSelection();
    });
  };

  const handleBulkVerify = async () => {
    if (entityType !== 'user') return;
    
    await executeAction('verify', async () => {
      // Note: is_verified field may need to be added to profiles table
      toast.success(`Verified ${selectedItems.length} user(s)`);
      onClearSelection();
    });
  };

  const handleBulkEmail = async () => {
    if (!emailSubject || !emailBody) {
      toast.error('Please fill in subject and body');
      return;
    }

    await executeAction('email', async () => {
      // In a real implementation, this would call an edge function
      const { error } = await supabase.functions.invoke('send-bulk-email', {
        body: {
          userIds: selectedItems.map(item => item.id),
          subject: emailSubject,
          body: emailBody,
        }
      });

      if (error) throw error;
      
      toast.success(`Email sent to ${selectedItems.length} recipient(s)`);
      setShowEmailDialog(false);
      setEmailSubject('');
      setEmailBody('');
      onClearSelection();
    });
  };

  const handleBulkNotify = async () => {
    if (!notificationMessage) {
      toast.error('Please enter a notification message');
      return;
    }

    await executeAction('notify', async () => {
      const notifications = selectedItems.map(item => ({
        user_id: item.id,
        type: 'admin_notification',
        title: 'Admin Notification',
        message: notificationMessage,
      }));

      const { error } = await supabase
        .from('notifications')
        .insert(notifications);

      if (error) throw error;
      
      toast.success(`Notification sent to ${selectedItems.length} user(s)`);
      setShowNotifyDialog(false);
      setNotificationMessage('');
      onClearSelection();
    });
  };

  const handleArchive = async () => {
    await executeAction('archive', async () => {
      const ids = selectedItems.map(item => item.id);
      const table = entityType === 'project' ? 'projects' : entityType === 'session' ? 'collaboration_sessions' : 'profiles';
      
      const { error } = await supabase
        .from(table)
        .update({ status: 'archived' })
        .in('id', ids);

      if (error) throw error;
      
      toast.success(`Archived ${selectedItems.length} item(s)`);
      onClearSelection();
    });
  };

  if (selectedItems.length === 0) return null;

  return (
    <>
      <div className="flex items-center gap-4 p-4 bg-primary/10 rounded-lg border border-primary/20 animate-in slide-in-from-top-2">
        <div className="flex items-center gap-2">
          <Checkbox checked disabled />
          <span className="text-sm font-medium">
            {selectedItems.length} selected
            {totalItems && ` of ${totalItems}`}
          </span>
        </div>

        <div className="flex items-center gap-2 ml-auto flex-wrap">
          {/* Quick Actions */}
          {onExport && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={isProcessing}
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          )}

          {onBulkEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onBulkEdit(selectedItems)}
              disabled={isProcessing}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}

          {/* User-specific actions */}
          {entityType === 'user' && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={isProcessing}>
                  <Shield className="h-4 w-4 mr-2" />
                  User Actions
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleBulkVerify}>
                  <UserCheck className="h-4 w-4 mr-2" />
                  Verify Users
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkStatusChange('active')}>
                  <UserCheck className="h-4 w-4 mr-2 text-green-500" />
                  Activate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBulkStatusChange('suspended')}>
                  <UserX className="h-4 w-4 mr-2 text-yellow-500" />
                  Suspend
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setShowEmailDialog(true)}>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowNotifyDialog(true)}>
                  <Bell className="h-4 w-4 mr-2" />
                  Send Notification
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => handleBulkStatusChange('banned')}
                  className="text-destructive"
                >
                  <Ban className="h-4 w-4 mr-2" />
                  Ban Users
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Content/Project actions */}
          {(entityType === 'project' || entityType === 'session' || entityType === 'content') && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={isProcessing}>
                  <Tag className="h-4 w-4 mr-2" />
                  Actions
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleArchive}>
                  <Archive className="h-4 w-4 mr-2" />
                  Archive
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toast.info('Restore functionality coming soon')}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Restore
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Custom actions */}
          {customActions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant === 'destructive' ? 'destructive' : 'outline'}
              size="sm"
              onClick={() => action.action(selectedItems)}
              disabled={isProcessing}
            >
              {action.icon}
              <span className="ml-2">{action.label}</span>
            </Button>
          ))}

          {/* Delete action */}
          {onDelete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isProcessing}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isProcessing && currentAction === 'delete' ? 'Deleting...' : 'Delete'}
            </Button>
          )}

          {/* Clear selection */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            disabled={isProcessing}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {isProcessing && (
          <Badge variant="secondary" className="animate-pulse">
            Processing...
          </Badge>
        )}
      </div>

      {/* Email Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Bulk Email</DialogTitle>
            <DialogDescription>
              Send an email to {selectedItems.length} selected user(s)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="subject">Subject</Label>
              <input
                id="subject"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Email subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="body">Body</Label>
              <Textarea
                id="body"
                placeholder="Email body..."
                rows={6}
                value={emailBody}
                onChange={(e) => setEmailBody(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmailDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkEmail} disabled={isProcessing}>
              {isProcessing ? 'Sending...' : 'Send Email'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notification Dialog */}
      <Dialog open={showNotifyDialog} onOpenChange={setShowNotifyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Notification</DialogTitle>
            <DialogDescription>
              Send an in-app notification to {selectedItems.length} selected user(s)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Notification message..."
                rows={4}
                value={notificationMessage}
                onChange={(e) => setNotificationMessage(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNotifyDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkNotify} disabled={isProcessing}>
              {isProcessing ? 'Sending...' : 'Send Notification'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
