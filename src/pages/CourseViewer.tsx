import { useParams, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Clock, Star, Award, PlayCircle, CheckCircle } from "lucide-react";
import { useCourseDetails, useEnrollInCourse } from "@/hooks/useCourses";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

const CourseViewer = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: course, isLoading } = useCourseDetails(courseId!);
  const enrollInCourse = useEnrollInCourse();

  const handleEnroll = () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (courseId && user.id) {
      enrollInCourse.mutate({ courseId, userId: user.id });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="h-64 w-full mb-8" />
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Skeleton className="h-96 w-full" />
            </div>
            <div>
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-16 text-center">
          <h2 className="text-2xl font-bold mb-4">Course Not Found</h2>
          <Button onClick={() => navigate("/education")}>
            Browse Courses
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-8 mb-8">
          <div className="max-w-4xl">
            <div className="flex gap-2 mb-4">
              <Badge variant="secondary" className="capitalize">
                {course.category}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {course.difficulty_level}
              </Badge>
            </div>
            <h1 className="text-4xl font-bold mb-4">{course.title}</h1>
            <p className="text-lg text-muted-foreground mb-6">
              {course.description}
            </p>
            <div className="flex gap-6 text-sm">
              <div className="flex items-center">
                <BookOpen className="w-4 h-4 mr-2" />
                <span>{course.total_lessons} lessons</span>
              </div>
              {course.duration_minutes && (
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>{Math.floor(course.duration_minutes / 60)}h {course.duration_minutes % 60}m</span>
                </div>
              )}
              {course.average_rating > 0 && (
                <div className="flex items-center">
                  <Star className="w-4 h-4 mr-2 text-yellow-500 fill-yellow-500" />
                  <span>{course.average_rating.toFixed(1)} ({course.total_reviews} reviews)</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Course Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>What You'll Learn</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {(course.learning_outcomes || []).map((outcome: string, idx: number) => (
                        <li key={idx} className="flex items-start">
                          <CheckCircle className="w-5 h-5 mr-2 mt-0.5 text-primary shrink-0" />
                          <span>{outcome}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                {(course.prerequisites || []).length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Prerequisites</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-1">
                        {course.prerequisites.map((prereq: string, idx: number) => (
                          <li key={idx} className="text-sm text-muted-foreground">
                            • {prereq}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="curriculum">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Curriculum</CardTitle>
                    <CardDescription>
                      {course.total_lessons} lessons to complete
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Lesson details will be available after enrollment
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews">
                <Card>
                  <CardHeader>
                    <CardTitle>Student Reviews</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Reviews will appear here once students complete the course
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Enrollment Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-2xl">
                  {course.is_free ? "Free" : `$${course.price}`}
                </CardTitle>
                <CardDescription>One-time payment</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleEnroll}
                  disabled={enrollInCourse.isPending}
                >
                  {course.is_free ? "Enroll for Free" : "Purchase Course"}
                </Button>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Students enrolled</span>
                    <span className="font-medium">{course.total_enrollments}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Lifetime access</span>
                    <CheckCircle className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Certificate</span>
                    <Award className="w-4 h-4 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseViewer;
