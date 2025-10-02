import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Video, Award, Plus, Edit, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AdminEducation = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data } = await supabase.rpc("is_admin", { user_uuid: user.id });
      if (!data) {
        navigate("/");
        return;
      }

      setIsAdmin(true);
      setLoading(false);
    };

    checkAdmin();
  }, [user, navigate]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Educational Content Hub</h1>
            <p className="text-muted-foreground">Manage courses, tutorials, and certifications</p>
          </div>
          <Badge variant="outline" className="text-warning border-warning">
            Coming Soon
          </Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="w-5 h-5" />
                Video Tutorials
              </CardTitle>
              <CardDescription>Upload and manage tutorial content</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Create comprehensive video courses covering mixing, mastering, and production techniques.
              </p>
              <Button disabled className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Tutorial
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Course Management
              </CardTitle>
              <CardDescription>Structure learning paths</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Organize tutorials into structured courses with progression tracking and quizzes.
              </p>
              <Button disabled className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Create Course
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Certifications
              </CardTitle>
              <CardDescription>Award completion certificates</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Issue certificates when artists or engineers complete course milestones.
              </p>
              <Button disabled className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Setup Certification
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Feature Roadmap</CardTitle>
            <CardDescription>Planned capabilities for the Education Hub</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Video upload and streaming infrastructure</li>
              <li>• Progress tracking for students</li>
              <li>• Quiz and assessment system</li>
              <li>• Certificate generation and verification</li>
              <li>• Community discussion forums per course</li>
              <li>• Guest instructor management</li>
              <li>• Premium course pricing options</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminEducation;
