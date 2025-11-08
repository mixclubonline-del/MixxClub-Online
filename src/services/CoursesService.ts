/**
 * Courses Service
 * Backend service for course management, enrollment, progress tracking, and certificates
 * Integrates with Supabase and Stripe for complete course platform functionality
 */

import { supabase } from '@/services/supabaseClient';
import { Course, CourseEnrollment, LessonProgress, Certificate, Lesson } from '@/stores/coursesStore';

export class CoursesService {
    /**
     * Fetch all courses with filters
     */
    static async getCourses(filters?: {
        category?: string;
        level?: string;
        tier?: string;
        limit?: number;
    }): Promise<Course[]> {
        try {
            let query = supabase.from('courses').select(`
        *,
        instructor:instructor_id(*),
        lessons:lessons(*),
        ratings:course_ratings(count)
      `);

            if (filters?.category) {
                query = query.eq('category', filters.category);
            }
            if (filters?.level) {
                query = query.eq('level', filters.level);
            }
            if (filters?.tier) {
                query = query.eq('tier', filters.tier);
            }

            const { data, error } = await query
                .order('created_at', { ascending: false })
                .limit(filters?.limit || 50);

            if (error) throw error;

            return (data || []).map((course) => ({
                id: course.id,
                title: course.title,
                description: course.description,
                category: course.category,
                thumbnail: course.thumbnail,
                instructor: course.instructor,
                price: course.price,
                tier: course.tier,
                level: course.level,
                duration: course.duration,
                lessons: course.lessons || [],
                totalLessons: course.total_lessons,
                rating: course.rating,
                reviews: course.review_count,
                tags: course.tags || [],
                requirements: course.requirements || [],
                outcomes: course.outcomes || [],
                createdAt: new Date(course.created_at),
                updatedAt: new Date(course.updated_at),
            }));
        } catch (error) {
            console.error('Error fetching courses:', error);
            throw error;
        }
    }

    /**
     * Fetch single course with all details
     */
    static async getCourse(courseId: string): Promise<Course | null> {
        try {
            const { data, error } = await supabase
                .from('courses')
                .select(`
          *,
          instructor:instructor_id(*),
          lessons:lessons(*),
          ratings:course_ratings(avg_rating, count)
        `)
                .eq('id', courseId)
                .single();

            if (error) throw error;
            if (!data) return null;

            return {
                id: data.id,
                title: data.title,
                description: data.description,
                category: data.category,
                thumbnail: data.thumbnail,
                instructor: data.instructor,
                price: data.price,
                tier: data.tier,
                level: data.level,
                duration: data.duration,
                lessons: data.lessons || [],
                totalLessons: data.total_lessons,
                rating: data.rating,
                reviews: data.review_count,
                tags: data.tags || [],
                requirements: data.requirements || [],
                outcomes: data.outcomes || [],
                createdAt: new Date(data.created_at),
                updatedAt: new Date(data.updated_at),
            };
        } catch (error) {
            console.error('Error fetching course:', error);
            throw error;
        }
    }

    /**
     * Fetch course lessons
     */
    static async getCourseLessons(courseId: string): Promise<Lesson[]> {
        try {
            const { data, error } = await supabase
                .from('lessons')
                .select('*')
                .eq('course_id', courseId)
                .order('lesson_order', { ascending: true });

            if (error) throw error;

            return (data || []).map((lesson) => ({
                id: lesson.id,
                courseId: lesson.course_id,
                title: lesson.title,
                description: lesson.description,
                videoUrl: lesson.video_url,
                duration: lesson.duration,
                order: lesson.lesson_order,
                resources: lesson.resources || [],
                quiz: lesson.quiz ? JSON.parse(lesson.quiz) : undefined,
            }));
        } catch (error) {
            console.error('Error fetching lessons:', error);
            throw error;
        }
    }

    /**
     * Enroll user in a course
     */
    static async enrollCourse(userId: string, courseId: string): Promise<CourseEnrollment> {
        try {
            const { data, error } = await supabase
                .from('enrollments')
                .insert([
                    {
                        user_id: userId,
                        course_id: courseId,
                        progress: 0,
                        enrolled_at: new Date().toISOString(),
                    },
                ])
                .select()
                .single();

            if (error) throw error;

            return {
                id: data.id,
                userId: data.user_id,
                courseId: data.course_id,
                enrolledAt: new Date(data.enrolled_at),
                completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
                progress: data.progress,
                lessonsCompleted: data.lessons_completed || [],
                currentLesson: data.current_lesson,
                certificateId: data.certificate_id,
            };
        } catch (error) {
            console.error('Error enrolling in course:', error);
            throw error;
        }
    }

    /**
     * Get user's enrollments
     */
    static async getUserEnrollments(userId: string): Promise<CourseEnrollment[]> {
        try {
            const { data, error } = await supabase
                .from('enrollments')
                .select('*')
                .eq('user_id', userId);

            if (error) throw error;

            return (data || []).map((enrollment) => ({
                id: enrollment.id,
                userId: enrollment.user_id,
                courseId: enrollment.course_id,
                enrolledAt: new Date(enrollment.enrolled_at),
                completedAt: enrollment.completed_at ? new Date(enrollment.completed_at) : undefined,
                progress: enrollment.progress,
                lessonsCompleted: enrollment.lessons_completed || [],
                currentLesson: enrollment.current_lesson,
                certificateId: enrollment.certificate_id,
            }));
        } catch (error) {
            console.error('Error fetching enrollments:', error);
            throw error;
        }
    }

    /**
     * Track lesson progress
     */
    static async updateLessonProgress(
        enrollmentId: string,
        lessonId: string,
        watchedDuration: number
    ): Promise<LessonProgress> {
        try {
            // Insert or update progress record
            const { data, error } = await supabase
                .from('lesson_progress')
                .upsert([
                    {
                        enrollment_id: enrollmentId,
                        lesson_id: lessonId,
                        watched_duration: watchedDuration,
                        updated_at: new Date().toISOString(),
                    },
                ])
                .select()
                .single();

            if (error) throw error;

            // Update enrollment progress
            const enrollment = await supabase
                .from('enrollments')
                .select('lessons_completed, current_lesson')
                .eq('id', enrollmentId)
                .single();

            if (!enrollment.data?.lessons_completed.includes(lessonId)) {
                const updatedLessons = [...(enrollment.data?.lessons_completed || []), lessonId];
                await supabase
                    .from('enrollments')
                    .update({
                        lessons_completed: updatedLessons,
                        current_lesson: lessonId,
                    })
                    .eq('id', enrollmentId);
            }

            return {
                id: data.id,
                enrollmentId: data.enrollment_id,
                lessonId: data.lesson_id,
                completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
                watchedDuration: data.watched_duration,
                quizScore: data.quiz_score,
                notes: data.notes,
            };
        } catch (error) {
            console.error('Error updating lesson progress:', error);
            throw error;
        }
    }

    /**
     * Submit quiz answer for a lesson
     */
    static async submitLessonQuiz(
        enrollmentId: string,
        lessonId: string,
        score: number
    ): Promise<void> {
        try {
            const { error } = await supabase
                .from('lesson_progress')
                .update({
                    quiz_score: score,
                    completed_at: new Date().toISOString(),
                })
                .eq('enrollment_id', enrollmentId)
                .eq('lesson_id', lessonId);

            if (error) throw error;
        } catch (error) {
            console.error('Error submitting quiz:', error);
            throw error;
        }
    }

    /**
     * Save lesson notes
     */
    static async saveLessonNotes(
        enrollmentId: string,
        lessonId: string,
        notes: string
    ): Promise<void> {
        try {
            const { error } = await supabase
                .from('lesson_progress')
                .update({ notes })
                .eq('enrollment_id', enrollmentId)
                .eq('lesson_id', lessonId);

            if (error) throw error;
        } catch (error) {
            console.error('Error saving notes:', error);
            throw error;
        }
    }

    /**
     * Complete course and generate certificate
     */
    static async completeCourse(
        enrollmentId: string,
        courseId: string,
        userId: string
    ): Promise<Certificate> {
        try {
            // Mark course as completed
            await supabase
                .from('enrollments')
                .update({
                    completed_at: new Date().toISOString(),
                    progress: 100,
                })
                .eq('id', enrollmentId);

            // Generate certificate
            const certificateNumber = `MIX-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const { data, error } = await supabase
                .from('certificates')
                .insert([
                    {
                        enrollment_id: enrollmentId,
                        course_id: courseId,
                        user_id: userId,
                        certificate_number: certificateNumber,
                        issued_at: new Date().toISOString(),
                    },
                ])
                .select()
                .single();

            if (error) throw error;

            return {
                id: data.id,
                enrollmentId: data.enrollment_id,
                courseId: data.course_id,
                userId: data.user_id,
                issuedAt: new Date(data.issued_at),
                certificateNumber: data.certificate_number,
                displayName: '',
                verificationUrl: `https://raven-mix-ai.com/verify/${data.id}`,
            };
        } catch (error) {
            console.error('Error completing course:', error);
            throw error;
        }
    }

    /**
     * Get user certificates
     */
    static async getUserCertificates(userId: string): Promise<Certificate[]> {
        try {
            const { data, error } = await supabase
                .from('certificates')
                .select('*')
                .eq('user_id', userId);

            if (error) throw error;

            return (data || []).map((cert) => ({
                id: cert.id,
                enrollmentId: cert.enrollment_id,
                courseId: cert.course_id,
                userId: cert.user_id,
                issuedAt: new Date(cert.issued_at),
                certificateNumber: cert.certificate_number,
                displayName: '',
                verificationUrl: `https://raven-mix-ai.com/verify/${cert.id}`,
            }));
        } catch (error) {
            console.error('Error fetching certificates:', error);
            throw error;
        }
    }

    /**
     * Get course statistics
     */
    static async getCourseStats(courseId: string): Promise<{
        totalEnrollments: number;
        completionRate: number;
        averageRating: number;
        revenue: number;
    }> {
        try {
            const { data: enrollments, error: enrollmentError } = await supabase
                .from('enrollments')
                .select('*')
                .eq('course_id', courseId);

            if (enrollmentError) throw enrollmentError;

            const { data: course, error: courseError } = await supabase
                .from('courses')
                .select('price, rating')
                .eq('id', courseId)
                .single();

            if (courseError) throw courseError;

            const total = enrollments?.length || 0;
            const completed = enrollments?.filter((e) => e.completed_at).length || 0;
            const completionRate = total > 0 ? (completed / total) * 100 : 0;
            const revenue = total * (course?.price || 0);

            return {
                totalEnrollments: total,
                completionRate: Math.round(completionRate),
                averageRating: course?.rating || 0,
                revenue,
            };
        } catch (error) {
            console.error('Error fetching course stats:', error);
            throw error;
        }
    }

    /**
     * Calculate enrollment progress
     */
    static async calculateProgress(enrollmentId: string): Promise<number> {
        try {
            const { data: enrollment, error: enrollmentError } = await supabase
                .from('enrollments')
                .select('lessons_completed, course_id')
                .eq('id', enrollmentId)
                .single();

            if (enrollmentError) throw enrollmentError;

            const { data: course, error: courseError } = await supabase
                .from('courses')
                .select('total_lessons')
                .eq('id', enrollment.course_id)
                .single();

            if (courseError) throw courseError;

            const completed = enrollment.lessons_completed?.length || 0;
            const total = course?.total_lessons || 1;
            const progress = Math.round((completed / total) * 100);

            return progress;
        } catch (error) {
            console.error('Error calculating progress:', error);
            throw error;
        }
    }
}

export default CoursesService;
