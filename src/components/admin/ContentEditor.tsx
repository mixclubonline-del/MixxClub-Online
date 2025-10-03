import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, Save, Eye, Send, Trash2, Image, 
  Link, Code, Bold, Italic, List, CheckSquare
} from "lucide-react";

interface ContentItem {
  id: string;
  title: string;
  type: 'blog' | 'help' | 'documentation' | 'faq';
  status: 'draft' | 'published' | 'scheduled' | 'archived';
  author: string;
  lastEdited: string;
  views?: number;
  category: string;
}

const recentContent: ContentItem[] = [
  {
    id: '1',
    title: 'Getting Started with MixxMatch',
    type: 'help',
    status: 'published',
    author: 'Admin Team',
    lastEdited: '2 hours ago',
    views: 1234,
    category: 'Tutorials'
  },
  {
    id: '2',
    title: 'Introducing New AI Mastering Features',
    type: 'blog',
    status: 'published',
    author: 'John Smith',
    lastEdited: '1 day ago',
    views: 892,
    category: 'Product Updates'
  },
  {
    id: '3',
    title: 'API Authentication Guide',
    type: 'documentation',
    status: 'published',
    author: 'Tech Team',
    lastEdited: '3 days ago',
    views: 456,
    category: 'API Docs'
  },
  {
    id: '4',
    title: 'Q1 2024 Platform Updates',
    type: 'blog',
    status: 'draft',
    author: 'Sarah Johnson',
    lastEdited: '5 hours ago',
    category: 'Announcements'
  },
  {
    id: '5',
    title: 'How to Upload Audio Files',
    type: 'faq',
    status: 'published',
    author: 'Support Team',
    lastEdited: '1 week ago',
    views: 2341,
    category: 'General'
  }
];

export function ContentEditor() {
  const getStatusBadge = (status: ContentItem['status']) => {
    const variants: Record<string, any> = {
      published: 'default',
      draft: 'secondary',
      scheduled: 'outline',
      archived: 'outline'
    };
    return variants[status];
  };

  const getTypeColor = (type: ContentItem['type']) => {
    const colors: Record<string, string> = {
      blog: 'text-blue-500',
      help: 'text-green-500',
      documentation: 'text-purple-500',
      faq: 'text-orange-500'
    };
    return colors[type];
  };

  return (
    <div className="space-y-6">
      {/* Editor */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Content Editor
              </CardTitle>
              <CardDescription>Create and edit platform content</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button variant="outline" size="sm">
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
              <Button size="sm">
                <Send className="h-4 w-4 mr-2" />
                Publish
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Metadata */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Content Type</label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">Blog Post</Button>
                <Button variant="outline" size="sm" className="flex-1">Help Article</Button>
                <Button variant="outline" size="sm" className="flex-1">Documentation</Button>
                <Button variant="outline" size="sm" className="flex-1">FAQ</Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Input placeholder="e.g., Tutorials, Product Updates..." />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input placeholder="Enter content title..." />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">SEO Meta Description</label>
            <Input placeholder="Brief description for search engines (150-160 characters)" />
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2 p-3 border rounded-lg bg-muted/50">
            <Button variant="ghost" size="sm">
              <Bold className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Italic className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-border" />
            <Button variant="ghost" size="sm">
              <List className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <CheckSquare className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-border" />
            <Button variant="ghost" size="sm">
              <Link className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Image className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Code className="h-4 w-4" />
            </Button>
            <div className="flex-1" />
            <span className="text-xs text-muted-foreground">0 / 5000 words</span>
          </div>

          {/* Content Editor */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Content</label>
            <Textarea 
              placeholder="Start writing your content here..." 
              rows={15}
              className="resize-none font-mono"
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tags</label>
            <Input placeholder="Add tags separated by commas" />
          </div>

          {/* Scheduling */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Publish Date</label>
              <Input type="datetime-local" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Author</label>
              <Input placeholder="Author name" defaultValue="Admin Team" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Content */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Content</CardTitle>
          <CardDescription>Recently created and edited content</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentContent.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <FileText className={`h-4 w-4 ${getTypeColor(item.type)}`} />
                    <h3 className="font-semibold">{item.title}</h3>
                    <Badge variant={getStatusBadge(item.status)} className="text-xs capitalize">
                      {item.status}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {item.category}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>{item.author}</span>
                    <span>•</span>
                    <span>Edited {item.lastEdited}</span>
                    {item.views !== undefined && (
                      <>
                        <span>•</span>
                        <span>{item.views.toLocaleString()} views</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <FileText className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
