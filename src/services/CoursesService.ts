/**
 * Courses Service - Stubbed Implementation
 * The database schema doesn't match the Course interface.
 * This provides a mock implementation until tables are aligned.
 */

import { Course, CourseEnrollment, LessonProgress, Certificate, Lesson } from '@/stores/coursesStore';

// In-memory mock data
const mockCourses: Course[] = [];
const mockEnrollments: CourseEnrollment[] = [];
const mockCertificates: Certificate[] = [];

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
        console.warn('CoursesService: Using mock data - courses schema mismatch');
        let result = [...mockCourses];

        if (filters?.category) {
            result = result.filter(c => c.category === filters.category);
        }
        if (filters?.level) {
            result = result.filter(c => c.level === filters.level);
        }
        if (filters?.tier) {
            result = result.filter(c => c.tier === filters.tier);
        }
        if (filters?.limit) {
            result = result.slice(0, filters.limit);
        }

        return result;
    }

    /**
     * Fetch single course with all details
     */
    static async getCourse(courseId: string): Promise<Course | null> {
        console.warn('CoursesService: Using mock data - courses schema mismatch');
        return mockCourses.find(c => c.id === courseId) || null;
    }

    /**
     * Fetch course lessons
     */
    static async getCourseLessons(courseId: string): Promise<Lesson[]> {
        console.warn('CoursesService: Using mock data - lessons schema mismatch');
        const course = mockCourses.find(c => c.id === courseId);
        return course?.lessons || [];
    }

    /**
     * Enroll user in a course
     */
    static async enrollCourse(userId: string, courseId: string): Promise<CourseEnrollment> {
        console.warn('CoursesService: Using mock data - enrollments table not configured');
        const enrollment: CourseEnrollment = {
            id: crypto.randomUUID(),
            userId,
            courseId,
            enrolledAt: new Date(),
            progress: 0,
            lessonsCompleted: [],
        };
        mockEnrollments.push(enrollment);
        return enrollment;
    }

    /**
     * Get user's enrollments
     */
    static async getUserEnrollments(userId: string): Promise<CourseEnrollment[]> {
        console.warn('CoursesService: Using mock data - enrollments table not configured');
        return mockEnrollments.filter(e => e.userId === userId);
    }

    /**
     * Track lesson progress
     */
    static async updateLessonProgress(
        enrollmentId: string,
        lessonId: string,
        watchedDuration: number
    ): Promise<LessonProgress> {
        console.warn('CoursesService: Using mock data - lesson_progress table not configured');
        return {
            id: crypto.randomUUID(),
            enrollmentId,
            lessonId,
            watchedDuration,
        };
    }

    /**
     * Submit quiz answer for a lesson
     */
    static async submitLessonQuiz(
        enrollmentId: string,
        lessonId: string,
        score: number
    ): Promise<void> {
        console.warn('CoursesService: Using mock data - lesson_progress table not configured');
    }

    /**
     * Save lesson notes
     */
    static async saveLessonNotes(
        enrollmentId: string,
        lessonId: string,
        notes: string
    ): Promise<void> {
        console.warn('CoursesService: Using mock data - lesson_progress table not configured');
    }

    /**
     * Complete course and generate certificate
     */
    static async completeCourse(
        enrollmentId: string,
        courseId: string,
        userId: string
    ): Promise<Certificate> {
        console.warn('CoursesService: Using mock data - certificates table not configured');
        const certificate: Certificate = {
            id: crypto.randomUUID(),
            enrollmentId,
            courseId,
            userId,
            issuedAt: new Date(),
            certificateNumber: `MIX-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            displayName: '',
            verificationUrl: `https://example.com/verify/${crypto.randomUUID()}`,
        };
        mockCertificates.push(certificate);
        return certificate;
    }

    /**
     * Get user certificates
     */
    static async getUserCertificates(userId: string): Promise<Certificate[]> {
        console.warn('CoursesService: Using mock data - certificates table not configured');
        return mockCertificates.filter(c => c.userId === userId);
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
        console.warn('CoursesService: Using mock data - courses schema mismatch');
        return {
            totalEnrollments: 0,
            completionRate: 0,
            averageRating: 0,
            revenue: 0,
        };
    }

    /**
     * Calculate enrollment progress
     */
    static async calculateProgress(enrollmentId: string): Promise<number> {
        console.warn('CoursesService: Using mock data - enrollments table not configured');
        const enrollment = mockEnrollments.find(e => e.id === enrollmentId);
        return enrollment?.progress || 0;
    }
}

export default CoursesService;
