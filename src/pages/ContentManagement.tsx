import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, FileText, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ContentEditor } from "@/components/admin/ContentEditor";
import { MediaLibrary } from "@/components/admin/MediaLibrary";
import { ContentVersionControl } from "@/components/admin/ContentVersionControl";
import { SEOOptimizer } from "@/components/admin/SEOOptimizer";

export default function ContentManagement() {
  const navigate = useNavigate();

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <FileText className="h-8 w-8 text-primary" />
                Content Management System
              </h1>
              <p className="text-muted-foreground mt-2">
                Create, edit, and publish content with version control and SEO optimization
              </p>
            </div>
          </div>
          <Badge variant="outline" className="gap-2 px-4 py-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            All Systems Ready
          </Badge>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="editor" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="editor">Content Editor</TabsTrigger>
            <TabsTrigger value="media">Media Library</TabsTrigger>
            <TabsTrigger value="versions">Version Control</TabsTrigger>
            <TabsTrigger value="seo">SEO Optimizer</TabsTrigger>
          </TabsList>

          <TabsContent value="editor" className="space-y-6">
            <ContentEditor />
          </TabsContent>

          <TabsContent value="media" className="space-y-6">
            <MediaLibrary />
          </TabsContent>

          <TabsContent value="versions" className="space-y-6">
            <ContentVersionControl />
          </TabsContent>

          <TabsContent value="seo" className="space-y-6">
            <SEOOptimizer />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
