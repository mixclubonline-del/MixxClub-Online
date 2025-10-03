import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Send, Pin, CheckCircle } from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: string;
  author: string;
  message: string;
  timestamp: string;
  avatar?: string;
  isPinned?: boolean;
}

interface Task {
  id: string;
  title: string;
  assignee: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
}

const demoMessages: Message[] = [
  {
    id: '1',
    author: 'John Smith',
    message: 'Reminder: Launch presentation scheduled for tomorrow at 2 PM',
    timestamp: '10 minutes ago',
    isPinned: true
  },
  {
    id: '2',
    author: 'Sarah Johnson',
    message: 'Just processed all pending payouts. Everything looks good!',
    timestamp: '1 hour ago'
  },
  {
    id: '3',
    author: 'Mike Davis',
    message: 'Fixed the rate limiting issue. Should be stable now.',
    timestamp: '2 hours ago'
  },
];

const demoTasks: Task[] = [
  {
    id: '1',
    title: 'Review new feature requests',
    assignee: 'Sarah Johnson',
    status: 'in-progress',
    priority: 'high',
    dueDate: 'Today'
  },
  {
    id: '2',
    title: 'Update API documentation',
    assignee: 'Mike Davis',
    status: 'todo',
    priority: 'medium',
    dueDate: 'Tomorrow'
  },
  {
    id: '3',
    title: 'Process refund requests',
    assignee: 'John Smith',
    status: 'done',
    priority: 'high',
    dueDate: 'Yesterday'
  },
];

export function InternalCollaboration() {
  const [messages, setMessages] = useState(demoMessages);
  const [newMessage, setNewMessage] = useState('');

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const message: Message = {
      id: Date.now().toString(),
      author: 'You',
      message: newMessage,
      timestamp: 'Just now'
    };

    setMessages([message, ...messages]);
    setNewMessage('');
    toast.success('Message sent');
  };

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'todo':
        return 'bg-gray-500';
      case 'in-progress':
        return 'bg-blue-500';
      case 'done':
        return 'bg-green-500';
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'low':
        return 'bg-gray-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'high':
        return 'bg-red-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Team Chat */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Team Chat
            </CardTitle>
            <CardDescription>Internal communication for admin team</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Messages */}
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-lg ${msg.isPinned ? 'border-2 border-primary bg-primary/5' : 'border bg-card'}`}
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={msg.avatar} />
                      <AvatarFallback>
                        {msg.author.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">{msg.author}</span>
                        {msg.isPinned && <Pin className="h-3 w-3 text-primary" />}
                        <span className="text-xs text-muted-foreground">{msg.timestamp}</span>
                      </div>
                      <p className="text-sm">{msg.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="flex gap-2">
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              />
              <Button onClick={sendMessage} size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Team Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Team Tasks
            </CardTitle>
            <CardDescription>Shared task management for admin team</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {demoTasks.map((task) => (
                <div
                  key={task.id}
                  className="p-3 rounded-lg border bg-card"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="font-medium text-sm mb-1">{task.title}</div>
                      <div className="text-xs text-muted-foreground">
                        Assigned to {task.assignee}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(task.status)}>
                      {task.status}
                    </Badge>
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Due: {task.dueDate}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Team Notes</CardTitle>
          <CardDescription>Shared notes and important information</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="Add notes for the team..."
            rows={4}
            className="mb-3"
          />
          <Button className="gap-2">
            <Send className="h-4 w-4" />
            Save Note
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
