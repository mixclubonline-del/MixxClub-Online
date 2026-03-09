import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Helmet } from 'react-helmet-async';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Award,
  GraduationCap,
  Trophy,
  CheckCircle,
  Lock,
  Download,
  ArrowLeft,
  BookOpen,
  Headphones,
  Music,
  Zap,
  Star,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';

const COMMUNITY_COUNT = 47;
const UNLOCK_THRESHOLD = 250;
const IS_UNLOCKED = COMMUNITY_COUNT >= UNLOCK_THRESHOLD;

interface Certification {
  id: string;
  title: string;
  description: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  lessons: number;
  hours: number;
  icon: React.ReactNode;
  isEnrolled?: boolean;
  progress?: number;
  isCompleted?: boolean;
  certificateId?: string;
}

const CERTIFICATIONS: Certification[] = [
  {
    id: 'mixing-101',
    title: 'Mixing 101',
    description: 'Master the fundamentals of audio mixing — gain staging, EQ, compression, and stereo width.',
    category: 'Mixing',
    level: 'beginner',
    lessons: 12,
    hours: 6,
    icon: <Headphones className="w-6 h-6" />,
  },
  {
    id: 'mastering-101',
    title: 'Mastering 101',
    description: 'Learn how to prepare your mixes for distribution — limiting, loudness, and format export.',
    category: 'Mastering',
    level: 'beginner',
    lessons: 10,
    hours: 5,
    icon: <Star className="w-6 h-6" />,
  },
  {
    id: 'producer-bootcamp',
    title: 'Producer Bootcamp',
    description: 'End-to-end beat making — from sample selection and sound design to arrangement and mixing.',
    category: 'Production',
    level: 'intermediate',
    lessons: 20,
    hours: 14,
    icon: <Music className="w-6 h-6" />,
  },
  {
    id: 'advanced-mixing',
    title: 'Advanced Mixing Techniques',
    description: 'Mid/side processing, parallel compression, frequency masking, and mixing in Dolby Atmos.',
    category: 'Mixing',
    level: 'advanced',
    lessons: 16,
    hours: 10,
    icon: <Zap className="w-6 h-6" />,
  },
  {
    id: 'vocal-production',
    title: 'Vocal Production',
    description: 'Tuning, comping, de-essing, vocal chain design, and spatial placement in the mix.',
    category: 'Production',
    level: 'intermediate',
    lessons: 14,
    hours: 8,
    icon: <BookOpen className="w-6 h-6" />,
  },
  {
    id: 'engineer-business',
    title: 'Engineer Business Foundations',
    description: 'Build your client roster, set rates, write contracts, and grow your engineering brand.',
    category: 'Business',
    level: 'beginner',
    lessons: 8,
    hours: 4,
    icon: <GraduationCap className="w-6 h-6" />,
  },
];

const LEVEL_COLORS: Record<string, string> = {
  beginner: 'text-green-500',
  intermediate: 'text-amber-500',
  advanced: 'text-red-500',
};

const LEVEL_BADGE: Record<string, string> = {
  beginner: 'bg-green-500/10 text-green-600 border-green-500/20',
  intermediate: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  advanced: 'bg-red-500/10 text-red-600 border-red-500/20',
};

export default function MyCertifications() {
  const { toast } = useToast();
  const [enrollments, setEnrollments] = useState<Record<string, number>>({});
  const [completedCerts, setCompletedCerts] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<string | null>(null);

  useEffect(() => {
    loadEnrollments();
  }, []);

  const loadEnrollments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('course_enrollments')
        .select('course_id, progress_percentage, certificate_issued')
        .eq('user_id', user.id);

      if (error) throw error;

      const progressMap: Record<string, number> = {};
      const completedSet = new Set<string>();

      data?.forEach((e) => {
        progressMap[e.course_id] = e.progress_percentage ?? 0;
        if (e.certificate_issued) completedSet.add(e.course_id);
      });

      setEnrollments(progressMap);
      setCompletedCerts(completedSet);
    } catch (error) {
      console.error('Error loading enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (certId: string, title: string) => {
    setEnrolling(certId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: 'Sign in to enroll', variant: 'destructive' });
        return;
      }

      // Check if course exists in DB, if not create a demo entry
      const { error } = await supabase
        .from('course_enrollments')
        .upsert({
          user_id: user.id,
          course_id: certId,
          progress_percentage: 0,
        });

      if (error) throw error;

      setEnrollments((prev) => ({ ...prev, [certId]: 0 }));
      toast({ title: 'Enrolled!', description: `You're now enrolled in ${title}` });
    } catch (error: any) {
      console.error('Error enrolling:', error);
      toast({ title: 'Error', description: error.message || 'Failed to enroll', variant: 'destructive' });
    } finally {
      setEnrolling(null);
    }
  };

  const handleDownloadCert = (certId: string, title: string) => {
    // In production, this would generate and download a PDF certificate
    toast({
      title: 'Certificate generating...',
      description: `Your ${title} certificate is being prepared`,
    });
  };

  const enrolledCerts = CERTIFICATIONS.filter((c) => c.id in enrollments);
  const availableCerts = CERTIFICATIONS.filter((c) => !(c.id in enrollments));
  const completedList = CERTIFICATIONS.filter((c) => completedCerts.has(c.id));

  const CertCard = ({ cert }: { cert: Certification }) => {
    const progress = enrollments[cert.id] ?? null;
    const isCompleted = completedCerts.has(cert.id);
    const isEnrolled = cert.id in enrollments;

    return (
      <Card className="p-5 flex flex-col justify-between gap-4 hover:bg-muted/20 transition-colors">
        <div>
          <div className="flex items-start justify-between mb-3">
            <div className={`p-2 rounded-lg bg-primary/10 ${LEVEL_COLORS[cert.level]}`}>
              {cert.icon}
            </div>
            <Badge className={`text-xs ${LEVEL_BADGE[cert.level]}`}>
              {cert.level}
            </Badge>
          </div>
          <h3 className="font-bold text-base mb-1">{cert.title}</h3>
          <p className="text-sm text-muted-foreground mb-3">{cert.description}</p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" />
              {cert.lessons} lessons
            </span>
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" />
              {cert.hours}h content
            </span>
            <Badge variant="secondary" className="text-xs">{cert.category}</Badge>
          </div>
        </div>

        {isEnrolled && progress !== null && (
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        )}

        <div className="flex gap-2">
          {isCompleted ? (
            <>
              <Button size="sm" className="flex-1 gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                Completed
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleDownloadCert(cert.id, cert.title)}
              >
                <Download className="w-3.5 h-3.5" />
              </Button>
            </>
          ) : isEnrolled ? (
            <Button size="sm" className="flex-1">
              Continue Learning
            </Button>
          ) : (
            <Button
              size="sm"
              className="flex-1"
              onClick={() => handleEnroll(cert.id, cert.title)}
              disabled={enrolling === cert.id}
            >
              {enrolling === cert.id ? 'Enrolling...' : 'Enroll Free'}
            </Button>
          )}
        </div>
      </Card>
    );
  };

  return (
    <>
      <Helmet>
        <title>My Certifications | Mixx Club</title>
        <meta name="description" content="Earn and showcase professional certifications in mixing, mastering, and audio engineering." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <main className="container max-w-5xl mx-auto px-4 py-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>

          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
              <Award className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Certifications</h1>
              <p className="text-muted-foreground">Prove your skills. Build your reputation.</p>
            </div>
          </div>

          {/* Unlock overlay wrapper */}
          <div className="relative">
            {!IS_UNLOCKED && (
              <div className="absolute inset-0 z-20 flex items-start justify-center pt-16 rounded-xl" style={{ background: 'hsl(var(--background)/0.92)', backdropFilter: 'blur(8px)' }}>
                <Card className="p-10 text-center max-w-md border-amber-500/30">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/10 flex items-center justify-center">
                    <Lock className="w-8 h-8 text-amber-500" />
                  </div>
                  <h2 className="text-2xl font-bold mb-2">Education Hub Unlocking Soon</h2>
                  <p className="text-muted-foreground mb-4">
                    Certifications unlock at <strong>{UNLOCK_THRESHOLD} community members</strong>.
                  </p>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full bg-amber-500 transition-all"
                      style={{ width: `${(COMMUNITY_COUNT / UNLOCK_THRESHOLD) * 100}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {COMMUNITY_COUNT} / {UNLOCK_THRESHOLD} members — {UNLOCK_THRESHOLD - COMMUNITY_COUNT} to go
                  </p>
                  <div className="flex justify-center gap-3 mt-6">
                    <Badge className="bg-amber-500/10 text-amber-600">Phase 3 Feature</Badge>
                  </div>
                </Card>
              </div>
            )}

            <div className={!IS_UNLOCKED ? 'pointer-events-none select-none' : ''}>
              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <Card className="p-4 text-center">
                  <p className="text-2xl font-bold">{enrolledCerts.length}</p>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                </Card>
                <Card className="p-4 text-center">
                  <p className="text-2xl font-bold">{completedList.length}</p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </Card>
                <Card className="p-4 text-center">
                  <p className="text-2xl font-bold">{CERTIFICATIONS.length}</p>
                  <p className="text-sm text-muted-foreground">Available</p>
                </Card>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="all">
                <TabsList>
                  <TabsTrigger value="all">All Courses</TabsTrigger>
                  <TabsTrigger value="enrolled">Enrolled ({enrolledCerts.length})</TabsTrigger>
                  <TabsTrigger value="completed">
                    <Trophy className="w-3.5 h-3.5 mr-1" />
                    Completed ({completedList.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-4">
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {CERTIFICATIONS.map((cert) => (
                      <CertCard key={cert.id} cert={cert} />
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="enrolled" className="mt-4">
                  {enrolledCerts.length === 0 ? (
                    <Card className="p-12 text-center">
                      <BookOpen className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">No courses in progress. Browse and enroll above!</p>
                    </Card>
                  ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {enrolledCerts.map((cert) => (
                        <CertCard key={cert.id} cert={cert} />
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="completed" className="mt-4">
                  {completedList.length === 0 ? (
                    <Card className="p-12 text-center">
                      <Trophy className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">Complete a course to earn your first certification!</p>
                    </Card>
                  ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {completedList.map((cert) => (
                        <CertCard key={cert.id} cert={cert} />
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
