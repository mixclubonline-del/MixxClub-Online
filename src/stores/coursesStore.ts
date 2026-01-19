/**
 * Premium Courses Store
 * Manages course data, enrollments, progress tracking, and certifications
 * Uses Zustand for state management with persistence
 * Aligned with database schema
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Database-aligned interfaces
export interface Lesson {
    id: string;
    course_id: string;
    title: string;
    description: string | null;
    content: string | null;
    video_url: string | null;
    duration_minutes: number | null;
    order_index: number;
    is_free_preview: boolean | null;
    created_at: string | null;
    updated_at: string | null;
}

export interface Course {
    id: string;
    title: string;
    description: string | null;
    category: string | null;
    difficulty_level: string | null;
    tier: 'free' | 'pro' | 'studio';
    price: number | null;
    currency: string | null;
    duration_hours: number | null;
    thumbnail_url: string | null;
    instructor_id: string | null;
    is_published: boolean | null;
    stripe_price_id: string | null;
    tags: string[];
    requirements: string[];
    outcomes: string[];
    total_enrollments: number;
    average_rating: number;
    created_at: string | null;
    updated_at: string | null;
    // Joined data from relationships
    instructor?: {
        id: string;
        full_name: string | null;
        avatar_url: string | null;
        bio: string | null;
    };
    lessons?: Lesson[];
    lessons_count?: number;
}

export interface CourseEnrollment {
    id: string;
    user_id: string;
    course_id: string;
    enrolled_at: string | null;
    completed_at: string | null;
    progress_percentage: number | null;
    last_accessed_lesson_id: string | null;
    certificate_issued: boolean | null;
    // Joined data
    course?: Course;
}

export interface LessonProgress {
    id: string;
    enrollment_id: string;
    lesson_id: string;
    watched_duration: number;
    completed_at: string | null;
    quiz_score: number | null;
    notes: string | null;
    created_at: string | null;
    updated_at: string | null;
}

export interface Certificate {
    id: string;
    enrollment_id: string | null;
    course_id: string;
    user_id: string;
    issued_at: string;
    certificate_number: string;
    expires_at: string | null;
    pdf_url: string | null;
    metadata: Record<string, unknown> | null;
    created_at: string | null;
}

export interface CourseStats {
    totalEnrollments: number;
    completionRate: number;
    averageRating: number;
    revenue: number;
    topLessons: Array<{ lessonId: string; views: number }>;
}

interface CoursesState {
    // Courses
    courses: Course[];
    selectedCourse: Course | null;
    enrolledCourses: CourseEnrollment[];
    courseStats: Record<string, CourseStats>;

    // Lessons & Progress
    currentLesson: Lesson | null;
    lessonProgress: LessonProgress[];
    certificates: Certificate[];

    // Filters & Sorting
    selectedCategory: string;
    selectedLevel: string;
    searchQuery: string;
    sortBy: 'popular' | 'newest' | 'rating' | 'price-low' | 'price-high';

    // Actions - Course Management
    setCourses: (courses: Course[]) => void;
    selectCourse: (course: Course | null) => void;
    addCourse: (course: Course) => void;
    updateCourse: (courseId: string, updates: Partial<Course>) => void;
    deleteCourse: (courseId: string) => void;

    // Actions - Enrollment
    setEnrollments: (enrollments: CourseEnrollment[]) => void;
    addEnrollment: (enrollment: CourseEnrollment) => void;
    updateEnrollment: (enrollmentId: string, updates: Partial<CourseEnrollment>) => void;

    // Actions - Lesson Progress
    setLessonProgress: (progress: LessonProgress[]) => void;
    addLessonProgress: (progress: LessonProgress) => void;
    updateLessonProgress: (progressId: string, updates: Partial<LessonProgress>) => void;

    // Actions - Certificates
    setCertificates: (certificates: Certificate[]) => void;
    addCertificate: (certificate: Certificate) => void;

    // Actions - Filtering & Search
    setCategory: (category: string) => void;
    setLevel: (level: string) => void;
    setSearchQuery: (query: string) => void;
    setSortBy: (sortBy: 'popular' | 'newest' | 'rating' | 'price-low' | 'price-high') => void;

    // Actions - Analytics
    getEnrollmentStats: () => { total: number; completed: number; inProgress: number };
    getStudentProgress: (userId: string) => Array<{ course: Course; progress: number }>;

    // Actions - Filters
    getFilteredCourses: () => Course[];
}

export const useCoursesStore = create<CoursesState>()(
    persist(
        (set, get) => ({
            courses: [],
            selectedCourse: null,
            enrolledCourses: [],
            courseStats: {},
            currentLesson: null,
            lessonProgress: [],
            certificates: [],
            selectedCategory: '',
            selectedLevel: '',
            searchQuery: '',
            sortBy: 'popular',

            // Course Management
            setCourses: (courses) => set({ courses }),
            selectCourse: (course) => set({ selectedCourse: course }),
            addCourse: (course) =>
                set((state) => ({
                    courses: [...state.courses, course],
                })),
            updateCourse: (courseId, updates) =>
                set((state) => ({
                    courses: state.courses.map((c) => (c.id === courseId ? { ...c, ...updates } : c)),
                })),
            deleteCourse: (courseId) =>
                set((state) => ({
                    courses: state.courses.filter((c) => c.id !== courseId),
                })),

            // Enrollment Management
            setEnrollments: (enrollments) => set({ enrolledCourses: enrollments }),
            addEnrollment: (enrollment) =>
                set((state) => ({
                    enrolledCourses: [...state.enrolledCourses, enrollment],
                })),
            updateEnrollment: (enrollmentId, updates) =>
                set((state) => ({
                    enrolledCourses: state.enrolledCourses.map((e) =>
                        e.id === enrollmentId ? { ...e, ...updates } : e
                    ),
                })),

            // Lesson Progress
            setLessonProgress: (progress) => set({ lessonProgress: progress }),
            addLessonProgress: (progress) =>
                set((state) => ({
                    lessonProgress: [...state.lessonProgress, progress],
                })),
            updateLessonProgress: (progressId, updates) =>
                set((state) => ({
                    lessonProgress: state.lessonProgress.map((lp) =>
                        lp.id === progressId ? { ...lp, ...updates } : lp
                    ),
                })),

            // Certificates
            setCertificates: (certificates) => set({ certificates }),
            addCertificate: (certificate) =>
                set((state) => ({
                    certificates: [...state.certificates, certificate],
                })),

            // Filtering
            setCategory: (category) => set({ selectedCategory: category }),
            setLevel: (level) => set({ selectedLevel: level }),
            setSearchQuery: (query) => set({ searchQuery: query }),
            setSortBy: (sortBy) => set({ sortBy }),

            // Analytics
            getEnrollmentStats: () => {
                const state = get();
                const total = state.enrolledCourses.length;
                const completed = state.enrolledCourses.filter((e) => e.completed_at).length;
                const inProgress = total - completed;

                return { total, completed, inProgress };
            },
            getStudentProgress: (userId) => {
                const state = get();
                return state.enrolledCourses
                    .filter((e) => e.user_id === userId)
                    .map((e) => {
                        const course = state.courses.find((c) => c.id === e.course_id);
                        return {
                            course: course!,
                            progress: e.progress_percentage || 0,
                        };
                    })
                    .filter((p) => p.course);
            },

            // Filter Courses
            getFilteredCourses: () => {
                const state = get();
                let filtered = state.courses.filter((c) => c.is_published);

                if (state.selectedCategory) {
                    filtered = filtered.filter((c) => c.category === state.selectedCategory);
                }

                if (state.selectedLevel) {
                    filtered = filtered.filter((c) => c.difficulty_level === state.selectedLevel);
                }

                if (state.searchQuery) {
                    const query = state.searchQuery.toLowerCase();
                    filtered = filtered.filter(
                        (c) =>
                            c.title.toLowerCase().includes(query) ||
                            c.description?.toLowerCase().includes(query) ||
                            c.tags?.some((t) => t.toLowerCase().includes(query))
                    );
                }

                // Sort
                const sorted = [...filtered];
                switch (state.sortBy) {
                    case 'newest':
                        sorted.sort((a, b) => 
                            new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
                        );
                        break;
                    case 'rating':
                        sorted.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
                        break;
                    case 'price-low':
                        sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
                        break;
                    case 'price-high':
                        sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
                        break;
                    case 'popular':
                    default:
                        sorted.sort((a, b) => (b.total_enrollments || 0) - (a.total_enrollments || 0));
                }

                return sorted;
            },
        }),
        {
            name: 'courses-store',
            version: 2,
        }
    )
);

export default useCoursesStore;
