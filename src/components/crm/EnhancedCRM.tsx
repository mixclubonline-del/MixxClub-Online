import React, { useState, useEffect, useRef } from "react";
import { useRealtimeProject } from "@/hooks/useRealtimeProject";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, Send, CheckCircle, Circle, Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

// Types
type Props = {
  projectId: string;
};

type ChatMessage = {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  sender_id: string;
};

type FileItem = {
  id: string;
  name: string;
  url: string;
  uploadedBy: string;
  file_path: string;
};

type Milestone = {
  id: string;
  name: string;
  completed: boolean;
  project_id: string;
};

const EnhancedCRM: React.FC<Props> = ({ projectId }) => {
  const { user } = useAuth();
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [dailyStreak, setDailyStreak] = useState<number>(0);
  const [newMessage, setNewMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Real-time updates
  useRealtimeProject(projectId, (update: any) => {
    switch (update.type) {
      case "chatMessage":
        setChatMessages((prev) => [...prev, update.data]);
        if (update.data.sender_id !== user?.id) {
          toast.success(`New message from ${update.data.sender}`);
        }
        break;
      case "fileUploaded":
        setFiles((prev) => [...prev, update.data]);
        if (update.data.uploadedBy !== user?.id) {
          toast.success(`New file uploaded`);
        }
        break;
      case "taskUpdate":
        loadMilestones();
        toast(`Task updated`, { icon: "✅" });
        break;
      default:
        break;
    }
  });

  // Load initial data
  useEffect(() => {
    if (projectId && user) {
      loadChatMessages();
      loadFiles();
      loadMilestones();
      loadUserStats();
    }
  }, [projectId, user]);

  const loadChatMessages = async () => {
    const { data, error } = await supabase
      .from('project_messages')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading messages:', error);
      return;
    }

    // Get user profiles separately
    const senderIds = [...new Set(data?.map(msg => msg.sender_id) || [])];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', senderIds);

    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

    const formattedMessages = data?.map((msg) => {
      const profile = profileMap.get(msg.sender_id);
      return {
        id: msg.id,
        sender: profile?.full_name || 'Unknown',
        text: msg.content || '',
        timestamp: msg.created_at,
        sender_id: msg.sender_id
      };
    }) || [];

    setChatMessages(formattedMessages);
  };

  const loadFiles = async () => {
    const { data, error } = await supabase
      .from('audio_files')
      .select('*')
      .eq('project_id', projectId);

    if (error) {
      console.error('Error loading files:', error);
      return;
    }

    // Get user profiles separately
    const uploaderIds = [...new Set(data?.map(file => file.uploaded_by) || [])];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', uploaderIds);

    const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

    const formattedFiles = data?.map((file) => {
      const profile = profileMap.get(file.uploaded_by);
      return {
        id: file.id,
        name: file.file_name,
        url: file.file_path,
        uploadedBy: profile?.full_name || 'Unknown',
        file_path: file.file_path
      };
    }) || [];

    setFiles(formattedFiles);
  };

  const loadMilestones = async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('project_id', projectId);

    if (error) {
      console.error('Error loading tasks:', error);
      return;
    }

    const formattedMilestones = data?.map((task) => ({
      id: task.id,
      name: task.title,
      completed: task.status === 'completed',
      project_id: task.project_id
    })) || [];

    setMilestones(formattedMilestones);
    
    // Calculate progress
    if (formattedMilestones.length > 0) {
      const completedCount = formattedMilestones.filter(m => m.completed).length;
      const progressPercent = Math.round((completedCount / formattedMilestones.length) * 100);
      setProgress(progressPercent);
    }
  };

  const loadUserStats = async () => {
    // Simulate daily streak for now
    setDailyStreak(Math.floor(Math.random() * 30) + 1);
  };

  // Send chat
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    const { error } = await supabase
      .from('project_messages')
      .insert({
        project_id: projectId,
        sender_id: user.id,
        content: newMessage,
        message_type: 'text'
      });

    if (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
      return;
    }

    setNewMessage("");
  };

  // Upload file
  const handleUploadFile = async (file: File) => {
    if (!user) return;
    
    setIsUploading(true);

    try {
      // Upload to Supabase Storage
      const fileName = `${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('audio-files')
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      // Save file record to database
      const { error: dbError } = await supabase
        .from('audio_files')
        .insert({
          project_id: projectId,
          file_name: file.name,
          file_path: uploadData.path,
          uploaded_by: user.id,
          user_id: user.id,
          file_size: file.size,
          mime_type: file.type
        });

      if (dbError) {
        throw dbError;
      }

      toast.success('File uploaded successfully');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const toggleMilestone = async (milestone: Milestone) => {
    const newStatus = milestone.completed ? 'pending' : 'completed';
    
    const { error } = await supabase
      .from('tasks')
      .update({ 
        status: newStatus,
        completed_at: newStatus === 'completed' ? new Date().toISOString() : null
      })
      .eq('id', milestone.id);

    if (error) {
      console.error('Error updating milestone:', error);
      toast.error('Failed to update milestone');
      return;
    }

    // Update local state
    const updatedMilestones = milestones.map(m =>
      m.id === milestone.id ? { ...m, completed: !m.completed } : m
    );
    setMilestones(updatedMilestones);

    // Update progress
    const completedCount = updatedMilestones.filter(m => m.completed).length;
    const newProgress = Math.round((completedCount / updatedMilestones.length) * 100);
    setProgress(newProgress);
  };

  return (
    <Card className="bg-gradient-to-br from-card to-card/80 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Live Collaboration Studio
          </span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Progress & Streak */}
        <div className="flex justify-between items-center">
          <div className="flex-1 mr-4">
            <p className="text-sm mb-2 font-medium">Project Progress</p>
            <Progress value={progress} className="h-3" />
            <p className="text-xs text-muted-foreground mt-1">{progress}% Complete</p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="font-semibold">{dailyStreak} day streak</span>
          </div>
        </div>

        {/* Milestones */}
        {milestones.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Project Milestones</h4>
            <div className="grid grid-cols-1 gap-2">
              {milestones.map((milestone) => (
                <div
                  key={milestone.id}
                  onClick={() => toggleMilestone(milestone)}
                  className="flex items-center gap-2 p-2 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  {milestone.completed ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <Circle className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className={`text-sm ${milestone.completed ? 'line-through text-muted-foreground' : ''}`}>
                    {milestone.name}
                  </span>
                  {milestone.completed && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                      Completed
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chat */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Project Chat</h4>
          <ScrollArea className="h-48 border rounded-lg p-3 bg-muted/20">
            <div className="space-y-2">
              {chatMessages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`text-xs p-2 rounded-lg max-w-[80%] ${
                    msg.sender_id === user?.id 
                      ? 'bg-primary text-primary-foreground ml-auto' 
                      : 'bg-background border'
                  }`}
                >
                  <div className="font-semibold text-xs mb-1">{msg.sender}</div>
                  <div>{msg.text}</div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1"
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            />
            <Button onClick={handleSendMessage} size="sm">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* File Sharing */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Project Files</h4>
          
          <div className="grid grid-cols-2 gap-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="p-2 border rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors cursor-pointer"
                onClick={() => {
                  // Handle file download/preview
                  toast.info('File preview coming soon');
                }}
              >
                <div className="text-xs font-medium truncate">{file.name}</div>
                <div className="text-xs text-muted-foreground">by {file.uploadedBy}</div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files?.[0] && handleUploadFile(e.target.files[0])}
              className="hidden"
              accept="audio/*,.wav,.mp3,.flac,.aiff"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              size="sm"
              disabled={isUploading}
              className="w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              {isUploading ? 'Uploading...' : 'Upload Audio File'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedCRM;