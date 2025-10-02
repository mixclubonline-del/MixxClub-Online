import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GraduationCap, BookOpen, Clock, Star, Lock, Sparkles, Search, Award } from "lucide-react";
import { useCourses, useEnrollInCourse } from "@/hooks/useCourses";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { isFeatureEnabled } from "@/config/featureFlags";

const EducationHub = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [category, setCategory] = useState<string>("");
  const [difficulty, setDifficulty] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: courses, isLoading } = useCourses({
    category: category || undefined,
    difficulty: difficulty || undefined,
  });

  const enrollInCourse = useEnrollInCourse();
  const featureUnlocked = isFeatureEnabled('EDUCATION_HUB_ENABLED');

  const handleEnroll = (courseId: string, isFree: boolean, price: number) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    
    if (isFree) {
      enrollInCourse.mutate({ courseId, userId: user.id });
    } else {
      // Navigate to payment page
      navigate(`/course/${courseId}/checkout`);
    }
  };

  const filteredCourses = courses?.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!featureUnlocked) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <Lock className="w-8 h-8 text-muted-foreground" />
                </div>
              </div>
              <CardTitle className="text-3xl">Education Hub</CardTitle>
              <CardDescription>
                This feature unlocks when the community reaches 250 members!
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Access professional courses, earn certifications, and learn from industry experts
                when we reach 250 members.
              </p>
              <Button onClick={() => navigate("/auth?signup=true")} size="lg">
                <Sparkles className="w-4 h-4 mr-2" />
                Join MixClub
              </Button>
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
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-2">
            <GraduationCap className="w-3 h-3 mr-1" />
            Tier 2 Unlocked
          </Badge>
          <h1 className="text-4xl font-bold mb-4">MixClub Education Hub</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Learn from industry professionals and earn verified certifications
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-medium">Search Courses</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by title or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All categories</SelectItem>
                    <SelectItem value="mixing">Mixing</SelectItem>
                    <SelectItem value="mastering">Mastering</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Difficulty</label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger>
                    <SelectValue placeholder="All levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All levels</SelectItem>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="all" className="space-y-8">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
            <TabsTrigger value="all">All Courses</TabsTrigger>
            <TabsTrigger value="my-courses">My Courses</TabsTrigger>
            <TabsTrigger value="certifications">Certifications</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {isLoading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-32 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredCourses && filteredCourses.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No courses found with these filters</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredCourses?.map((course) => (
                  <Card key={course.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <CardTitle className="text-xl">{course.title}</CardTitle>
                        {course.is_free ? (
                          <Badge variant="secondary">Free</Badge>
                        ) : (
                          <Badge className="bg-primary">${course.price}</Badge>
                        )}
                      </div>
                      <CardDescription className="capitalize">
                        {course.category} • {course.difficulty_level}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {course.description}
                      </p>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center text-muted-foreground">
                            <BookOpen className="w-4 h-4 mr-2" />
                            Lessons
                          </span>
                          <span className="font-medium">{course.total_lessons}</span>
                        </div>
                        {course.duration_minutes && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center text-muted-foreground">
                              <Clock className="w-4 h-4 mr-2" />
                              Duration
                            </span>
                            <span className="font-medium">
                              {Math.floor(course.duration_minutes / 60)}h {course.duration_minutes % 60}m
                            </span>
                          </div>
                        )}
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center text-muted-foreground">
                            <Star className="w-4 h-4 mr-2 text-yellow-500 fill-yellow-500" />
                            Rating
                          </span>
                          <span className="font-medium">
                            {course.average_rating.toFixed(1)} ({course.total_reviews} reviews)
                          </span>
                        </div>
                      </div>

                      <Button
                        className="w-full"
                        onClick={() => handleEnroll(course.id, course.is_free, course.price)}
                      >
                        {course.is_free ? "Enroll for Free" : "Enroll Now"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="my-courses">
            <Card>
              <CardContent className="text-center py-12">
                <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">You haven't enrolled in any courses yet</p>
                <Button className="mt-4" onClick={() => navigate("/education-hub")}>
                  Browse Courses
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="certifications">
            <Card>
              <CardContent className="text-center py-12">
                <Award className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Complete courses to earn certifications</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EducationHub;
