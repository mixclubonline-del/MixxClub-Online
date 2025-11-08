/**
 * Premium Courses Store
 * Manages course data, enrollments, progress tracking, and certifications
 * Uses Zustand for state management with persistence
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Lesson {
    id: string;
    courseId: string;
    title: string;
    description: string;
    videoUrl: string;
    duration: number; // in minutes
    order: number;
    resources: string[];
    quiz?: {
        id: string;
        questions: number;
        passingScore: number;
    };
}

export interface Course {
    id: string;
    title: string;
    description: string;
    category: 'production' | 'mixing' | 'mastering' | 'business' | 'marketing';
    thumbnail: string;
    instructor: {
        id: string;
        name: string;
        bio: string;
        avatar: string;
    };
    price: number;
    tier: 'pro' | 'studio';
    level: 'beginner' | 'intermediate' | 'advanced';
    duration: number; // total hours
    lessons: Lesson[];
    totalLessons: number;
    rating: number;
    reviews: number;
    tags: string[];
    requirements: string[];
    outcomes: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface CourseEnrollment {
    id: string;
    userId: string;
    courseId: string;
    enrolledAt: Date;
    completedAt?: Date;
    progress: number; // 0-100 percentage
    lessonsCompleted: string[]; // lesson IDs
    currentLesson?: string;
    certificateId?: string;
}

export interface LessonProgress {
    id: string;
    enrollmentId: string;
    lessonId: string;
    completedAt?: Date;
    watchedDuration: number; // in seconds
    quizScore?: number;
    notes?: string;
}

export interface Certificate {
    id: string;
    enrollmentId: string;
    courseId: string;
    userId: string;
    issuedAt: Date;
    certificateNumber: string;
    displayName: string;
    verificationUrl: string;
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
    enrollCourse: (userId: string, courseId: string) => void;
    completeCourse: (enrollmentId: string) => void;
    getEnrollmentProgress: (enrollmentId: string) => number;

    // Actions - Lesson Progress
    startLesson: (enrollmentId: string, lessonId: string) => void;
    completeLesson: (enrollmentId: string, lessonId: string, watchedDuration: number) => void;
    submitLessonQuiz: (enrollmentId: string, lessonId: string, score: number) => void;
    saveNotes: (enrollmentId: string, lessonId: string, notes: string) => void;

    // Actions - Certificates
    issueCertificate: (enrollmentId: string, courseId: string, userId: string) => void;
    getCertificate: (enrollmentId: string) => Certificate | undefined;

    // Actions - Filtering & Search
    setCategory: (category: string) => void;
    setLevel: (level: string) => void;
    setSearchQuery: (query: string) => void;
    setSortBy: (sortBy: 'popular' | 'newest' | 'rating' | 'price-low' | 'price-high') => void;

    // Actions - Analytics
    getEnrollmentStats: () => { total: number; completed: number; inProgress: number };
    getCourseStats: (courseId: string) => CourseStats;
    getStudentProgress: (userId: string) => Array<{ course: Course; progress: number }>;

    // Actions - Filters
    getFilteredCourses: () => Course[];
}

export const useCoursesStore = create<CoursesState>(
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

            // Enrollment
            enrollCourse: (userId, courseId) =>
                set((state) => {
                    const enrollment: CourseEnrollment = {
                        id: `enr_${Date.now()}`,
                        userId,
                        courseId,
                        enrolledAt: new Date(),
                        progress: 0,
                        lessonsCompleted: [],
                    };
                    return {
                        enrolledCourses: [...state.enrolledCourses, enrollment],
                    };
                }),
            completeCourse: (enrollmentId) =>
                set((state) => ({
                    enrolledCourses: state.enrolledCourses.map((e) =>
                        e.id === enrollmentId
                            ? { ...e, completedAt: new Date(), progress: 100 }
                            : e
                    ),
                })),
            getEnrollmentProgress: (enrollmentId) => {
                const state = get();
                const enrollment = state.enrolledCourses.find((e) => e.id === enrollmentId);
                return enrollment?.progress ?? 0;
            },

            // Lesson Progress
            startLesson: (enrollmentId, lessonId) =>
                set((state) => {
                    const enrollment = state.enrolledCourses.find((e) => e.id === enrollmentId);
                    const course = state.courses.find((c) => c.id === enrollment?.courseId);
                    const lesson = course?.lessons.find((l) => l.id === lessonId);

                    return {
                        currentLesson: lesson || null,
                        enrolledCourses: state.enrolledCourses.map((e) =>
                            e.id === enrollmentId ? { ...e, currentLesson: lessonId } : e
                        ),
                    };
                }),
            completeLesson: (enrollmentId, lessonId, watchedDuration) =>
                set((state) => {
                    const enrollment = state.enrolledCourses.find((e) => e.id === enrollmentId);
                    const course = state.courses.find((c) => c.id === enrollment?.courseId);
                    const lessonsCompleted = new Set(enrollment?.lessonsCompleted || []);
                    lessonsCompleted.add(lessonId);

                    const progress = course
                        ? (lessonsCompleted.size / course.totalLessons) * 100
                        : 0;

                    const progress_record: LessonProgress = {
                        id: `lp_${Date.now()}`,
                        enrollmentId,
                        lessonId,
                        completedAt: new Date(),
                        watchedDuration,
                    };

                    return {
                        lessonProgress: [...state.lessonProgress, progress_record],
                        enrolledCourses: state.enrolledCourses.map((e) =>
                            e.id === enrollmentId
                                ? {
                                    ...e,
                                    lessonsCompleted: Array.from(lessonsCompleted),
                                    progress: Math.round(progress),
                                }
                                : e
                        ),
                    };
                }),
            submitLessonQuiz: (enrollmentId, lessonId, score) =>
                set((state) => ({
                    lessonProgress: state.lessonProgress.map((lp) =>
                        lp.enrollmentId === enrollmentId && lp.lessonId === lessonId
                            ? { ...lp, quizScore: score }
                            : lp
                    ),
                })),
            saveNotes: (enrollmentId, lessonId, notes) =>
                set((state) => ({
                    lessonProgress: state.lessonProgress.map((lp) =>
                        lp.enrollmentId === enrollmentId && lp.lessonId === lessonId
                            ? { ...lp, notes }
                            : lp
                    ),
                })),

            // Certificates
            issueCertificate: (enrollmentId, courseId, userId) =>
                set((state) => {
                    const certificate: Certificate = {
                        id: `cert_${Date.now()}`,
                        enrollmentId,
                        courseId,
                        userId,
                        issuedAt: new Date(),
                        certificateNumber: `MIX-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        displayName: state.courses.find((c) => c.id === courseId)?.title || 'Certificate',
                        verificationUrl: `https://raven-mix-ai.com/verify/${`cert_${Date.now()}`}`,
                    };

                    return {
                        certificates: [...state.certificates, certificate],
                        enrolledCourses: state.enrolledCourses.map((e) =>
                            e.id === enrollmentId ? { ...e, certificateId: certificate.id } : e
                        ),
                    };
                }),
            getCertificate: (enrollmentId) => {
                const state = get();
                const enrollment = state.enrolledCourses.find((e) => e.id === enrollmentId);
                return state.certificates.find((c) => c.enrollmentId === enrollmentId);
            },

            // Filtering
            setCategory: (category) => set({ selectedCategory: category }),
            setLevel: (level) => set({ selectedLevel: level }),
            setSearchQuery: (query) => set({ searchQuery: query }),
            setSortBy: (sortBy) => set({ sortBy }),

            // Analytics
            getEnrollmentStats: () => {
                const state = get();
                const total = state.enrolledCourses.length;
                const completed = state.enrolledCourses.filter((e) => e.completedAt).length;
                const inProgress = total - completed;

                return { total, completed, inProgress };
            },
            getCourseStats: (courseId) => {
                const state = get();
                const enrollments = state.enrolledCourses.filter((e) => e.courseId === courseId);
                const completed = enrollments.filter((e) => e.completedAt).length;
                const completionRate = enrollments.length > 0 ? (completed / enrollments.length) * 100 : 0;
                const course = state.courses.find((c) => c.id === courseId);

                return {
                    totalEnrollments: enrollments.length,
                    completionRate: Math.round(completionRate),
                    averageRating: course?.rating || 0,
                    revenue: enrollments.length * (course?.price || 0),
                    topLessons: [],
                };
            },
            getStudentProgress: (userId) => {
                const state = get();
                return state.enrolledCourses
                    .filter((e) => e.userId === userId)
                    .map((e) => {
                        const course = state.courses.find((c) => c.id === e.courseId);
                        return {
                            course: course!,
                            progress: e.progress,
                        };
                    });
            },

            // Filter Courses
            getFilteredCourses: () => {
                const state = get();
                let filtered = state.courses;

                if (state.selectedCategory) {
                    filtered = filtered.filter((c) => c.category === state.selectedCategory);
                }

                if (state.selectedLevel) {
                    filtered = filtered.filter((c) => c.level === state.selectedLevel);
                }

                if (state.searchQuery) {
                    const query = state.searchQuery.toLowerCase();
                    filtered = filtered.filter(
                        (c) =>
                            c.title.toLowerCase().includes(query) ||
                            c.description.toLowerCase().includes(query) ||
                            c.tags.some((t) => t.toLowerCase().includes(query))
                    );
                }

                // Sort
                const sorted = [...filtered];
                switch (state.sortBy) {
                    case 'newest':
                        sorted.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
                        break;
                    case 'rating':
                        sorted.sort((a, b) => b.rating - a.rating);
                        break;
                    case 'price-low':
                        sorted.sort((a, b) => a.price - b.price);
                        break;
                    case 'price-high':
                        sorted.sort((a, b) => b.price - a.price);
                        break;
                    case 'popular':
                    default:
                        sorted.sort((a, b) => b.reviews - a.reviews);
                }

                return sorted;
            },
        }),
        {
            name: 'courses-store',
            version: 1,
        }
    )
);

export default useCoursesStore;
