import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pin, MoreVertical, MessageSquare, Phone, Users, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ClientNotesProps {
  clientId: string;
}

const noteTypeIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  general: MessageSquare,
  call: Phone,
  meeting: Users,
  email: Mail,
};

const noteTypeColors: Record<string, string> = {
  general: 'bg-slate-500/20 text-slate-400',
  call: 'bg-blue-500/20 text-blue-400',
  meeting: 'bg-purple-500/20 text-purple-400',
  email: 'bg-amber-500/20 text-amber-400',
};

export const ClientNotes: React.FC<ClientNotesProps> = ({ clientId }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [noteType, setNoteType] = useState<string>('general');

  // Fetch notes
  const { data: notes, isLoading } = useQuery({
    queryKey: ['crm-notes', clientId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_notes')
        .select('*')
        .eq('client_id', clientId)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Create note mutation
  const createNote = useMutation({
    mutationFn: async (content: string) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('crm_notes')
        .insert({
          client_id: clientId,
          user_id: user.id,
          content,
          note_type: noteType,
          is_pinned: false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-notes', clientId] });
      setNewNote('');
      setIsAdding(false);
      toast.success('Note added');
    },
    onError: () => {
      toast.error('Failed to add note');
    },
  });

  // Toggle pin mutation
  const togglePin = useMutation({
    mutationFn: async ({ id, isPinned }: { id: string; isPinned: boolean }) => {
      const { error } = await supabase
        .from('crm_notes')
        .update({ is_pinned: !isPinned })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-notes', clientId] });
    },
  });

  // Delete note mutation
  const deleteNote = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('crm_notes')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-notes', clientId] });
      toast.success('Note deleted');
    },
  });

  const handleSubmit = () => {
    if (newNote.trim()) {
      createNote.mutate(newNote.trim());
    }
  };

  return (
    <div className="p-6 space-y-4">
      {/* Add Note */}
      {isAdding ? (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-2">
            <Select value={noteType} onValueChange={setNoteType}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="call">Call</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="email">Email</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Textarea
            placeholder="Write your note..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            rows={4}
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsAdding(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSubmit} disabled={!newNote.trim()}>
              Save Note
            </Button>
          </div>
        </motion.div>
      ) : (
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={() => setIsAdding(true)}
        >
          <Plus className="h-4 w-4" />
          Add Note
        </Button>
      )}

      {/* Notes List */}
      <AnimatePresence>
        {notes?.map((note) => {
          const Icon = noteTypeIcons[note.note_type || 'general'] || MessageSquare;
          
          return (
            <motion.div
              key={note.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              className={cn(
                'group p-4 rounded-lg border border-border',
                note.is_pinned && 'bg-primary/5 border-primary/30'
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="outline" 
                    className={cn('text-xs', noteTypeColors[note.note_type || 'general'])}
                  >
                    <Icon className="h-3 w-3 mr-1" />
                    {note.note_type || 'general'}
                  </Badge>
                  {note.is_pinned && (
                    <Pin className="h-3 w-3 text-primary fill-primary" />
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 opacity-0 group-hover:opacity-100"
                    >
                      <MoreVertical className="h-3.5 w-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      onClick={() => togglePin.mutate({ id: note.id, isPinned: note.is_pinned || false })}
                    >
                      {note.is_pinned ? 'Unpin' : 'Pin'} Note
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-destructive"
                      onClick={() => deleteNote.mutate(note.id)}
                    >
                      Delete Note
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <p className="mt-2 text-sm text-foreground whitespace-pre-wrap">
                {note.content}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
              </p>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {(!notes || notes.length === 0) && !isAdding && (
        <div className="text-center py-8 text-muted-foreground">
          <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No notes yet</p>
        </div>
      )}
    </div>
  );
};
