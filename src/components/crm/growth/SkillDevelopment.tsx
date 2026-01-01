import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Star, Trophy, Lock, PlayCircle, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface SkillDevelopmentProps {
  userType: 'artist' | 'engineer';
}

interface Skill {
  id: string;
  name: string;
  level: number;
  maxLevel: number;
  xpProgress: number;
  xpRequired: number;
  status: 'mastered' | 'in-progress' | 'locked';
  courses: number;
  completedCourses: number;
}

interface Course {
  id: string;
  title: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  progress: number;
  instructor: string;
}

export const SkillDevelopment: React.FC<SkillDevelopmentProps> = ({ userType }) => {
  const skills: Skill[] = userType === 'artist' ? [
    { id: '1', name: 'Vocal Performance', level: 4, maxLevel: 5, xpProgress: 800, xpRequired: 1000, status: 'in-progress', courses: 5, completedCourses: 4 },
    { id: '2', name: 'Songwriting', level: 3, maxLevel: 5, xpProgress: 450, xpRequired: 750, status: 'in-progress', courses: 4, completedCourses: 2 },
    { id: '3', name: 'Music Theory', level: 5, maxLevel: 5, xpProgress: 1000, xpRequired: 1000, status: 'mastered', courses: 3, completedCourses: 3 },
    { id: '4', name: 'Stage Presence', level: 2, maxLevel: 5, xpProgress: 200, xpRequired: 500, status: 'in-progress', courses: 4, completedCourses: 1 },
    { id: '5', name: 'Music Business', level: 1, maxLevel: 5, xpProgress: 0, xpRequired: 250, status: 'locked', courses: 6, completedCourses: 0 },
  ] : [
    { id: '1', name: 'Mixing & Mastering', level: 4, maxLevel: 5, xpProgress: 900, xpRequired: 1000, status: 'in-progress', courses: 8, completedCourses: 7 },
    { id: '2', name: 'Pro Tools', level: 5, maxLevel: 5, xpProgress: 1000, xpRequired: 1000, status: 'mastered', courses: 5, completedCourses: 5 },
    { id: '3', name: 'Sound Design', level: 3, maxLevel: 5, xpProgress: 550, xpRequired: 750, status: 'in-progress', courses: 4, completedCourses: 3 },
    { id: '4', name: 'Analog Equipment', level: 2, maxLevel: 5, xpProgress: 300, xpRequired: 500, status: 'in-progress', courses: 3, completedCourses: 1 },
    { id: '5', name: 'Dolby Atmos', level: 1, maxLevel: 5, xpProgress: 100, xpRequired: 250, status: 'in-progress', courses: 4, completedCourses: 0 },
  ];

  const recommendedCourses: Course[] = userType === 'artist' ? [
    { id: '1', title: 'Advanced Vocal Techniques', duration: '4h 30m', difficulty: 'advanced', progress: 65, instructor: 'Dr. Melody Voice' },
    { id: '2', title: 'Hit Songwriting Masterclass', duration: '6h', difficulty: 'intermediate', progress: 20, instructor: 'Platinum Producer' },
    { id: '3', title: 'Music Industry 101', duration: '3h', difficulty: 'beginner', progress: 0, instructor: 'Industry Exec' },
  ] : [
    { id: '1', title: 'Mastering for Streaming', duration: '5h', difficulty: 'advanced', progress: 45, instructor: 'Grammy Engineer' },
    { id: '2', title: 'Dolby Atmos Mixing', duration: '8h', difficulty: 'advanced', progress: 10, instructor: 'Spatial Audio Pro' },
    { id: '3', title: 'Analog Warmth Secrets', duration: '4h', difficulty: 'intermediate', progress: 0, instructor: 'Vintage Gear Master' },
  ];

  const getStatusIcon = (status: Skill['status']) => {
    switch (status) {
      case 'mastered': return <Trophy className="w-4 h-4 text-yellow-500" />;
      case 'in-progress': return <BookOpen className="w-4 h-4 text-blue-500" />;
      case 'locked': return <Lock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getDifficultyBadge = (difficulty: Course['difficulty']) => {
    const colors = {
      beginner: 'bg-green-500/20 text-green-400 border-green-500/30',
      intermediate: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      advanced: 'bg-red-500/20 text-red-400 border-red-500/30',
    };
    return colors[difficulty];
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Skills Tree */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Skill Tree</h3>
          <Badge variant="outline" className="gap-1">
            <Star className="w-3 h-3 text-yellow-500" />
            {skills.filter(s => s.status === 'mastered').length} Mastered
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {skills.map((skill, index) => (
            <motion.div
              key={skill.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`bg-card/50 border-border/50 transition-all ${skill.status === 'locked' ? 'opacity-60' : 'hover:border-primary/30'}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(skill.status)}
                      <span className="font-medium">{skill.name}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: skill.maxLevel }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${i < skill.level ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground/30'}`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>XP: {skill.xpProgress}/{skill.xpRequired}</span>
                      <span>Level {skill.level}/{skill.maxLevel}</span>
                    </div>
                    <Progress value={(skill.xpProgress / skill.xpRequired) * 100} className="h-1.5" />
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50 text-xs text-muted-foreground">
                    <span>{skill.completedCourses}/{skill.courses} courses</span>
                    {skill.status !== 'locked' && (
                      <Button variant="ghost" size="sm" className="h-6 text-xs">
                        Continue
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recommended Courses */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Recommended Courses</h3>

        <div className="space-y-3">
          {recommendedCourses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-card/50 border-border/50 hover:border-primary/30 transition-all">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                      {course.progress > 0 ? (
                        <PlayCircle className="w-5 h-5 text-primary" />
                      ) : (
                        <BookOpen className="w-5 h-5 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">{course.title}</h4>
                      <p className="text-xs text-muted-foreground">{course.instructor}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={`${getDifficultyBadge(course.difficulty)} text-xs capitalize`}>
                          {course.difficulty}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {course.duration}
                        </span>
                      </div>
                      {course.progress > 0 && (
                        <div className="mt-2 space-y-1">
                          <Progress value={course.progress} className="h-1" />
                          <span className="text-xs text-muted-foreground">{course.progress}% complete</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Button variant="outline" className="w-full">
          Browse All Courses
        </Button>
      </div>
    </div>
  );
};
