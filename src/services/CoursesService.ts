/**
 * Courses Service - Database Implementation
 * Provides all course-related database operations via Supabase
 */

import { supabase } from '@/integrations/supabase/client';
import type { Course, CourseEnrollment, LessonProgress, Certificate, Lesson } from '@/stores/coursesStore';

export class CoursesService {
    /**
     * Fetch all published courses with optional filters
     */
    static async getCourses(filters?: {
        category?: string;
        level?: string;
        tier?: string;
        limit?: number;
    }): Promise<Course[]> {
        let query = supabase
            .from('courses')
            .select(`
                *,
                instructor:profiles!courses_instructor_id_fkey(id, full_name, avatar_url, bio)
            `)
            .eq('is_published', true);

        if (filters?.category) {
            query = query.eq('category', filters.category);
        }
        if (filters?.level) {
            query = query.eq('difficulty_level', filters.level);
        }
        if (filters?.tier) {
            query = query.eq('tier', filters.tier);
        }
        if (filters?.limit) {
            query = query.limit(filters.limit);
        }

        const { data, error } = await query.order('created_at', { ascending: false });
        
        if (error) {
            console.error('CoursesService: Error fetching courses:', error);
            throw error;
        }

        // Transform data to match Course interface with defaults
        return (data || []).map((course) => ({
            ...course,
            tags: course.tags || [],
            requirements: course.requirements || [],
            outcomes: course.outcomes || [],
            total_enrollments: course.total_enrollments || 0,
            average_rating: course.average_rating || 0,
            tier: course.tier || 'pro',
        })) as Course[];
    }

    /**
     * Fetch single course with all details including lessons
     */
    static async getCourse(courseId: string): Promise<Course | null> {
        const { data, error } = await supabase
            .from('courses')
            .select(`
                *,
                instructor:profiles!courses_instructor_id_fkey(id, full_name, avatar_url, bio),
                lessons(*)
            `)
            .eq('id', courseId)
            .single();

        if (error) {
            console.error('CoursesService: Error fetching course:', error);
            return null;
        }

        // Sort lessons by order_index
        if (data.lessons) {
            data.lessons.sort((a: Lesson, b: Lesson) => (a.order_index || 0) - (b.order_index || 0));
        }

        return {
            ...data,
            tags: data.tags || [],
            requirements: data.requirements || [],
            outcomes: data.outcomes || [],
            total_enrollments: data.total_enrollments || 0,
            average_rating: data.average_rating || 0,
            tier: data.tier || 'pro',
        } as Course;
    }

    /**
     * Fetch course lessons
     */
    static async getCourseLessons(courseId: string): Promise<Lesson[]> {
        const { data, error } = await supabase
            .from('lessons')
            .select('*')
            .eq('course_id', courseId)
            .order('order_index', { ascending: true });

        if (error) {
            console.error('CoursesService: Error fetching lessons:', error);
            throw error;
        }

        return data || [];
    }

    /**
     * Enroll user in a course (for free courses or after payment verification)
     */
    static async enrollCourse(userId: string, courseId: string): Promise<CourseEnrollment> {
        // Check if already enrolled
        const { data: existing } = await supabase
            .from('course_enrollments')
            .select('id')
            .eq('user_id', userId)
            .eq('course_id', courseId)
            .single();

        if (existing) {
            throw new Error('Already enrolled in this course');
        }

        const { data, error } = await supabase
            .from('course_enrollments')
            .insert({
                user_id: userId,
                course_id: courseId,
                progress_percentage: 0,
            })
            .select()
            .single();

        if (error) {
            console.error('CoursesService: Error enrolling in course:', error);
            throw error;
        }

        // Increment enrollment count
        try {
            await supabase.rpc('increment_course_enrollments', { p_course_id: courseId });
        } catch (e) {
            console.warn('CoursesService: Could not increment enrollment count:', e);
        }

        return data as CourseEnrollment;
    }

    /**
     * Get user's enrollments with course data
     */
    static async getUserEnrollments(userId: string): Promise<CourseEnrollment[]> {
        const { data, error } = await supabase
            .from('course_enrollments')
            .select(`
                *,
                course:courses(
                    *,
                    instructor:profiles!courses_instructor_id_fkey(id, full_name, avatar_url)
                )
            `)
            .eq('user_id', userId)
            .order('enrolled_at', { ascending: false });

        if (error) {
            console.error('CoursesService: Error fetching enrollments:', error);
            throw error;
        }

        return (data || []) as CourseEnrollment[];
    }

    /**
     * Check if user is enrolled in a course
     */
    static async isUserEnrolled(userId: string, courseId: string): Promise<boolean> {
        const { data } = await supabase
            .from('course_enrollments')
            .select('id')
            .eq('user_id', userId)
            .eq('course_id', courseId)
            .single();

        return !!data;
    }

    /**
     * Get enrollment by ID
     */
    static async getEnrollment(enrollmentId: string): Promise<CourseEnrollment | null> {
        const { data, error } = await supabase
            .from('course_enrollments')
            .select(`
                *,
                course:courses(*)
            `)
            .eq('id', enrollmentId)
            .single();

        if (error) return null;
        return data as CourseEnrollment;
    }

    /**
     * Track lesson progress
     */
    static async updateLessonProgress(
        enrollmentId: string,
        lessonId: string,
        watchedDuration: number,
        completed: boolean = false
    ): Promise<LessonProgress> {
        const { data, error } = await supabase
            .from('lesson_progress')
            .upsert({
                enrollment_id: enrollmentId,
                lesson_id: lessonId,
                watched_duration: watchedDuration,
                updated_at: new Date().toISOString(),
                completed_at: completed ? new Date().toISOString() : undefined,
            }, { onConflict: 'enrollment_id,lesson_id' })
            .select()
            .single();

        if (error) {
            console.error('CoursesService: Error updating lesson progress:', error);
            throw error;
        }

        // Recalculate enrollment progress
        await CoursesService.recalculateEnrollmentProgress(enrollmentId);

        return data as LessonProgress;
    }

    /**
     * Recalculate enrollment progress percentage
     */
    static async recalculateEnrollmentProgress(enrollmentId: string): Promise<number> {
        // Get enrollment with course info
        const { data: enrollment } = await supabase
            .from('course_enrollments')
            .select('course_id')
            .eq('id', enrollmentId)
            .single();

        if (!enrollment) return 0;

        // Count total lessons
        const { count: totalLessons } = await supabase
            .from('lessons')
            .select('id', { count: 'exact' })
            .eq('course_id', enrollment.course_id);

        // Count completed lessons
        const { count: completedLessons } = await supabase
            .from('lesson_progress')
            .select('id', { count: 'exact' })
            .eq('enrollment_id', enrollmentId)
            .not('completed_at', 'is', null);

        const progress = totalLessons ? Math.round(((completedLessons || 0) / totalLessons) * 100) : 0;

        // Update enrollment
        await supabase
            .from('course_enrollments')
            .update({ progress_percentage: progress })
            .eq('id', enrollmentId);

        return progress;
    }

    /**
     * Submit quiz answer for a lesson
     */
    static async submitLessonQuiz(
        enrollmentId: string,
        lessonId: string,
        score: number
    ): Promise<void> {
        const { error } = await supabase
            .from('lesson_progress')
            .upsert({
                enrollment_id: enrollmentId,
                lesson_id: lessonId,
                quiz_score: score,
                updated_at: new Date().toISOString(),
            }, { onConflict: 'enrollment_id,lesson_id' });

        if (error) {
            console.error('CoursesService: Error submitting quiz:', error);
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
        const { error } = await supabase
            .from('lesson_progress')
            .upsert({
                enrollment_id: enrollmentId,
                lesson_id: lessonId,
                notes,
                updated_at: new Date().toISOString(),
            }, { onConflict: 'enrollment_id,lesson_id' });

        if (error) {
            console.error('CoursesService: Error saving notes:', error);
            throw error;
        }
    }

    /**
     * Get lesson progress for an enrollment
     */
    static async getLessonProgress(enrollmentId: string): Promise<LessonProgress[]> {
        const { data, error } = await supabase
            .from('lesson_progress')
            .select('*')
            .eq('enrollment_id', enrollmentId);

        if (error) {
            console.error('CoursesService: Error fetching lesson progress:', error);
            throw error;
        }

        return (data || []) as LessonProgress[];
    }

    /**
     * Complete course and generate certificate
     */
    static async completeCourse(
        enrollmentId: string,
        courseId: string,
        userId: string
    ): Promise<Certificate> {
        const certificateNumber = `MIX-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        const { data, error } = await supabase
            .from('certificates')
            .insert({
                enrollment_id: enrollmentId,
                course_id: courseId,
                user_id: userId,
                certificate_number: certificateNumber,
                issued_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) {
            console.error('CoursesService: Error generating certificate:', error);
            throw error;
        }

        // Update enrollment as completed
        await supabase
            .from('course_enrollments')
            .update({
                completed_at: new Date().toISOString(),
                certificate_issued: true,
                progress_percentage: 100,
            })
            .eq('id', enrollmentId);

        return data as Certificate;
    }

    /**
     * Get user certificates
     */
    static async getUserCertificates(userId: string): Promise<Certificate[]> {
        const { data, error } = await supabase
            .from('certificates')
            .select(`
                *,
                course:courses(id, title, thumbnail_url)
            `)
            .eq('user_id', userId)
            .order('issued_at', { ascending: false });

        if (error) {
            console.error('CoursesService: Error fetching certificates:', error);
            throw error;
        }

        return (data || []) as Certificate[];
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
        // Fetch course data
        const { data: course } = await supabase
            .from('courses')
            .select('total_enrollments, average_rating, price')
            .eq('id', courseId)
            .single();

        // Count completed enrollments
        const { count: completedCount } = await supabase
            .from('course_enrollments')
            .select('id', { count: 'exact' })
            .eq('course_id', courseId)
            .not('completed_at', 'is', null);

        const totalEnrollments = course?.total_enrollments || 0;
        const completionRate = totalEnrollments > 0 
            ? Math.round(((completedCount || 0) / totalEnrollments) * 100) 
            : 0;

        return {
            totalEnrollments,
            completionRate,
            averageRating: course?.average_rating || 0,
            revenue: totalEnrollments * (course?.price || 0),
        };
    }
}

export default CoursesService;
