/**
 * useCourseEnrollment Hook
 * Manages course enrollment, completion tracking, and certificate generation
 */

import { useState, useCallback, useEffect } from 'react';
import { useCoursesStore } from '@/stores/coursesStore';
import { CoursesService } from '@/services/CoursesService';
import type { CourseEnrollment, Certificate } from '@/stores/coursesStore';

export interface UseEnrollmentResult {
    enrollments: CourseEnrollment[];
    loading: boolean;
    error: Error | null;
    enrollCourse: (courseId: string) => Promise<CourseEnrollment>;
    completeCourse: (enrollmentId: string, courseId: string) => Promise<Certificate>;
    getEnrollment: (enrollmentId: string) => CourseEnrollment | undefined;
    isEnrolled: (courseId: string) => boolean;
}

export function useCourseEnrollment(userId?: string): UseEnrollmentResult {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const { enrolledCourses, enrollCourse: storeEnroll, completeCourse: storeComplete } =
        useCoursesStore();

    // Fetch enrollments on mount
    useEffect(() => {
        if (!userId) return;

        const fetchEnrollments = async () => {
            try {
                setLoading(true);
                const enrollments = await CoursesService.getUserEnrollments(userId);
                enrollments.forEach((enrollment) => storeEnroll(userId, enrollment.courseId));
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err : new Error('Failed to fetch enrollments'));
            } finally {
                setLoading(false);
            }
        };

        fetchEnrollments();
    }, [userId, storeEnroll]);

    const enrollCourse = useCallback(
        async (courseId: string) => {
            if (!userId) throw new Error('User ID required');

            try {
                setLoading(true);
                const enrollment = await CoursesService.enrollCourse(userId, courseId);
                storeEnroll(userId, courseId);
                setError(null);
                return enrollment;
            } catch (err) {
                const error = err instanceof Error ? err : new Error('Failed to enroll in course');
                setError(error);
                throw error;
            } finally {
                setLoading(false);
            }
        },
        [userId, storeEnroll]
    );

    const completeCourse = useCallback(
        async (enrollmentId: string, courseId: string) => {
            if (!userId) throw new Error('User ID required');

            try {
                setLoading(true);
                const certificate = await CoursesService.completeCourse(enrollmentId, courseId, userId);
                storeComplete(enrollmentId);
                setError(null);
                return certificate;
            } catch (err) {
                const error = err instanceof Error ? err : new Error('Failed to complete course');
                setError(error);
                throw error;
            } finally {
                setLoading(false);
            }
        },
        [userId, storeComplete]
    );

    const getEnrollment = useCallback(
        (enrollmentId: string) => {
            return enrolledCourses.find((e) => e.id === enrollmentId);
        },
        [enrolledCourses]
    );

    const isEnrolled = useCallback(
        (courseId: string) => {
            return enrolledCourses.some((e) => e.courseId === courseId);
        },
        [enrolledCourses]
    );

    return {
        enrollments: enrolledCourses,
        loading,
        error,
        enrollCourse,
        completeCourse,
        getEnrollment,
        isEnrolled,
    };
}

export default useCourseEnrollment;
