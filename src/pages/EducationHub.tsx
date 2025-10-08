import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, BookOpen, Trophy } from "lucide-react";
import { isFeatureEnabled } from "@/config/featureFlags";

const EducationHub = () => {
  const isUnlocked = isFeatureEnabled("EDUCATION_HUB_ENABLED");

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-2xl mx-auto text-center">
            <CardHeader>
              <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-fit">
                <GraduationCap className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Education Hub - Coming Soon</CardTitle>
              <CardDescription className="text-lg">
                Unlock at 250 community members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Master your craft with expert-led courses and certifications
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Education Hub</h1>
          <p className="text-muted-foreground">
            Master your craft with expert-led courses and certifications
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <BookOpen className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Courses</CardTitle>
              <CardDescription>
                Expert-led video courses covering mixing, mastering, and production
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <GraduationCap className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Certifications</CardTitle>
              <CardDescription>
                Earn verified certifications to showcase your skills
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Trophy className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Achievements</CardTitle>
              <CardDescription>
                Track your progress and unlock achievement badges
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Database Setup Complete</CardTitle>
            <CardDescription>
              Backend infrastructure is ready. Frontend integration coming soon!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Tables created: courses, course_enrollments
              <br />
              Edge functions deployed: course-enroll
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EducationHub;
