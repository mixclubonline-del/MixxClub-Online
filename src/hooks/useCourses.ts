/**
 * useCourses Hook
 * Manages course data fetching, filtering, and basic operations
 */

import { useState, useCallback, useEffect } from 'react';
import { useCoursesStore } from '@/stores/coursesStore';
import { CoursesService } from '@/services/CoursesService';
import type { Course } from '@/stores/coursesStore';

export interface CourseStats {
    totalEnrollments: number;
    completionRate: number;
    averageRating: number;
    revenue: number;
}

export interface UseCoursesResult {
    courses: Course[];
    filteredCourses: Course[];
    selectedCourse: Course | null;
    loading: boolean;
    error: Error | null;
    fetchCourses: (filters?: {
        category?: string;
        level?: string;
        tier?: string;
    }) => Promise<void>;
    getCourse: (courseId: string) => Promise<Course | null>;
    selectCourse: (course: Course | null) => void;
    setCategory: (category: string) => void;
    setLevel: (level: string) => void;
    setSearchQuery: (query: string) => void;
    setSortBy: (sortBy: 'popular' | 'newest' | 'rating' | 'price-low' | 'price-high') => void;
    getCourseStats: (courseId: string) => Promise<CourseStats>;
}

export function useCourses(): UseCoursesResult {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const {
        courses,
        selectedCourse,
        setCourses,
        selectCourse,
        setCategory,
        setLevel,
        setSearchQuery,
        setSortBy,
        getFilteredCourses,
    } = useCoursesStore();

    // Fetch all courses on mount
    useEffect(() => {
        const initializeCourses = async () => {
            try {
                setLoading(true);
                const fetchedCourses = await CoursesService.getCourses({ limit: 100 });
                setCourses(fetchedCourses);
                setError(null);
            } catch (err) {
                const error = err instanceof Error ? err : new Error('Failed to fetch courses');
                setError(error);
            } finally {
                setLoading(false);
            }
        };

        if (courses.length === 0) {
            initializeCourses();
        }
    }, [setCourses, courses.length]); const fetchCourses = useCallback(
        async (filters?: { category?: string; level?: string; tier?: string }) => {
            try {
                setLoading(true);
                const fetchedCourses = await CoursesService.getCourses(filters);
                setCourses(fetchedCourses);
                setError(null);
            } catch (err) {
                const error = err instanceof Error ? err : new Error('Failed to fetch courses');
                setError(error);
                throw error;
            } finally {
                setLoading(false);
            }
        },
        [setCourses]
    );

    const getCourse = useCallback(
        async (courseId: string) => {
            try {
                setLoading(true);
                const course = await CoursesService.getCourse(courseId);
                if (course) {
                    selectCourse(course);
                }
                setError(null);
                return course;
            } catch (err) {
                const error = err instanceof Error ? err : new Error('Failed to fetch course');
                setError(error);
                throw error;
            } finally {
                setLoading(false);
            }
        },
        [selectCourse]
    );

    const getCourseStats = useCallback(async (courseId: string) => {
        try {
            setLoading(true);
            const stats = await CoursesService.getCourseStats(courseId);
            setError(null);
            return stats;
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to fetch stats');
            setError(error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        courses,
        filteredCourses: getFilteredCourses(),
        selectedCourse,
        loading,
        error,
        fetchCourses,
        getCourse,
        selectCourse,
        setCategory,
        setLevel,
        setSearchQuery,
        setSortBy,
        getCourseStats,
    };
}

export default useCourses;
