import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Image, Video, FileText, Music, Upload, Search, 
  Filter, Grid, List, Download, Trash2, Eye
} from "lucide-react";

interface MediaItem {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'document';
  size: string;
  uploadedBy: string;
  uploadedAt: string;
  dimensions?: string;
  duration?: string;
  usageCount: number;
}

const mediaItems: MediaItem[] = [
  {
    id: '1',
    name: 'hero-banner.jpg',
    type: 'image',
    size: '2.4 MB',
    uploadedBy: 'John Smith',
    uploadedAt: '2 hours ago',
    dimensions: '1920x1080',
    usageCount: 3
  },
  {
    id: '2',
    name: 'product-demo.mp4',
    type: 'video',
    size: '45.8 MB',
    uploadedBy: 'Sarah Johnson',
    uploadedAt: '1 day ago',
    duration: '3:45',
    usageCount: 1
  },
  {
    id: '3',
    name: 'sample-track.mp3',
    type: 'audio',
    size: '8.2 MB',
    uploadedBy: 'Mike Davis',
    uploadedAt: '3 days ago',
    duration: '5:23',
    usageCount: 12
  },
  {
    id: '4',
    name: 'user-guide.pdf',
    type: 'document',
    size: '1.8 MB',
    uploadedBy: 'Tech Team',
    uploadedAt: '5 days ago',
    usageCount: 8
  },
  {
    id: '5',
    name: 'feature-showcase.jpg',
    type: 'image',
    size: '3.1 MB',
    uploadedBy: 'Admin Team',
    uploadedAt: '1 week ago',
    dimensions: '2560x1440',
    usageCount: 5
  },
  {
    id: '6',
    name: 'tutorial-intro.mp4',
    type: 'video',
    size: '67.3 MB',
    uploadedBy: 'John Smith',
    uploadedAt: '1 week ago',
    duration: '8:12',
    usageCount: 15
  }
];

export function MediaLibrary() {
  const getTypeIcon = (type: MediaItem['type']) => {
    switch (type) {
      case 'image':
        return <Image className="h-5 w-5 text-blue-500" />;
      case 'video':
        return <Video className="h-5 w-5 text-purple-500" />;
      case 'audio':
        return <Music className="h-5 w-5 text-green-500" />;
      case 'document':
        return <FileText className="h-5 w-5 text-orange-500" />;
    }
  };

  const getTypeBadge = (type: MediaItem['type']) => {
    const colors: Record<string, string> = {
      image: 'bg-blue-500',
      video: 'bg-purple-500',
      audio: 'bg-green-500',
      document: 'bg-orange-500'
    };
    return colors[type];
  };

  const totalSize = mediaItems.reduce((sum, item) => {
    const size = parseFloat(item.size);
    return sum + size;
  }, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Image className="h-5 w-5" />
              Media Library
            </CardTitle>
            <CardDescription>Manage images, videos, audio files, and documents</CardDescription>
          </div>
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Upload Media
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="p-4 border rounded-lg bg-card">
            <div className="flex items-center gap-2 mb-2">
              <Image className="h-4 w-4 text-blue-500" />
              <div className="text-sm text-muted-foreground">Images</div>
            </div>
            <div className="text-2xl font-bold">
              {mediaItems.filter(m => m.type === 'image').length}
            </div>
          </div>

          <div className="p-4 border rounded-lg bg-card">
            <div className="flex items-center gap-2 mb-2">
              <Video className="h-4 w-4 text-purple-500" />
              <div className="text-sm text-muted-foreground">Videos</div>
            </div>
            <div className="text-2xl font-bold">
              {mediaItems.filter(m => m.type === 'video').length}
            </div>
          </div>

          <div className="p-4 border rounded-lg bg-card">
            <div className="flex items-center gap-2 mb-2">
              <Music className="h-4 w-4 text-green-500" />
              <div className="text-sm text-muted-foreground">Audio</div>
            </div>
            <div className="text-2xl font-bold">
              {mediaItems.filter(m => m.type === 'audio').length}
            </div>
          </div>

          <div className="p-4 border rounded-lg bg-card">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-orange-500" />
              <div className="text-sm text-muted-foreground">Storage Used</div>
            </div>
            <div className="text-2xl font-bold">{totalSize.toFixed(1)} MB</div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search media..." className="pl-9" />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <div className="flex gap-1 border rounded-lg p-1">
            <Button variant="ghost" size="sm">
              <Grid className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Media Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mediaItems.map((item) => (
            <div
              key={item.id}
              className="p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getTypeIcon(item.type)}
                  <div className={`w-2 h-2 rounded-full ${getTypeBadge(item.type)}`} />
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Download className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-3 w-3 text-red-500" />
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-sm truncate">{item.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {item.size} • {item.uploadedAt}
                </p>
              </div>

              {item.dimensions && (
                <Badge variant="outline" className="text-xs">
                  {item.dimensions}
                </Badge>
              )}
              {item.duration && (
                <Badge variant="outline" className="text-xs">
                  {item.duration}
                </Badge>
              )}

              <div className="flex items-center justify-between text-xs pt-2 border-t">
                <span className="text-muted-foreground">By {item.uploadedBy}</span>
                <span className="text-muted-foreground">{item.usageCount} uses</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
