import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookOpen, GraduationCap, Clock, Star, Lock, Sparkles, Users } from "lucide-react";
import { useCourses } from "@/hooks/useCourses";
import { Skeleton } from "@/components/ui/skeleton";
import { isFeatureEnabled } from "@/config/featureFlags";
import { HubBreadcrumb } from "@/components/ui/hub-breadcrumb";
import { HubRecommendations } from "@/components/ui/hub-recommendations";

const EducationalHub = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState<string>("");
  const [difficulty, setDifficulty] = useState<string>("");
  const [showFreeOnly, setShowFreeOnly] = useState(false);

  const { data: courses, isLoading } = useCourses({
    category: category || undefined,
    difficulty: difficulty || undefined,
    isFree: showFreeOnly || undefined,
  });

  const featureUnlocked = isFeatureEnabled('EDUCATION_HUB_ENABLED');

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
              <CardTitle className="text-3xl">Educational Hub</CardTitle>
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
        <HubBreadcrumb items={[{ label: 'Learn' }]} />
        
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-2">
            <GraduationCap className="w-3 h-3 mr-1" />
            Tier 2 Unlocked
          </Badge>
          <h1 className="text-4xl font-bold mb-4">Educational Hub</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Master your craft with courses from industry professionals
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-4">
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
              <div className="space-y-2">
                <label className="text-sm font-medium">Price</label>
                <Button
                  variant={showFreeOnly ? "default" : "outline"}
                  className="w-full"
                  onClick={() => setShowFreeOnly(!showFreeOnly)}
                >
                  {showFreeOnly ? "Free Only" : "All Courses"}
                </Button>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium opacity-0">Action</label>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setCategory("");
                    setDifficulty("");
                    setShowFreeOnly(false);
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Courses Grid */}
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
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
        ) : courses && courses.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No courses found with these filters</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses?.map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="secondary" className="capitalize">
                      {course.category}
                    </Badge>
                    <Badge variant={course.is_free ? "default" : "outline"}>
                      {course.is_free ? "Free" : `$${course.price}`}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{course.title}</CardTitle>
                  <CardDescription className="capitalize">
                    {course.difficulty_level} Level
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
                        <Users className="w-4 h-4 mr-2" />
                        Students
                      </span>
                      <span className="font-medium">{course.total_enrollments}</span>
                    </div>
                    {course.average_rating > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center text-muted-foreground">
                          <Star className="w-4 h-4 mr-2 text-yellow-500 fill-yellow-500" />
                          Rating
                        </span>
                        <span className="font-medium">
                          {course.average_rating.toFixed(1)} ({course.total_reviews})
                        </span>
                      </div>
                    )}
                  </div>

                  <Button
                    className="w-full"
                    onClick={() => navigate(`/course/${course.id}`)}
                  >
                    View Course
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <HubRecommendations excludeHref="/education" />

        <div className="text-center mt-12">
          <a 
            href="/" 
            className="inline-block px-8 py-4 rounded-full bg-gradient-to-r from-accent-blue to-accent-cyan text-foreground hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all font-medium"
          >
            ← Back to Hub
          </a>
        </div>
      </div>
    </div>
  );
};

export default EducationalHub;
