/**
 * useProgressTracking Hook
 * Manages lesson progress tracking, quiz submissions, and progress calculations
 */

import { useState, useCallback } from 'react';
import { useCoursesStore } from '@/stores/coursesStore';
import { CoursesService } from '@/services/CoursesService';
import type { LessonProgress } from '@/stores/coursesStore';

export interface UseProgressResult {
    progress: number;
    loading: boolean;
    error: Error | null;
    updateLessonProgress: (enrollmentId: string, lessonId: string, duration: number) => Promise<void>;
    submitQuiz: (enrollmentId: string, lessonId: string, score: number) => Promise<void>;
    saveNotes: (enrollmentId: string, lessonId: string, notes: string) => Promise<void>;
    getLessonProgress: (enrollmentId: string, lessonId: string) => LessonProgress | undefined;
    calculateProgress: (enrollmentId: string) => Promise<number>;
}

export function useProgressTracking(enrollmentId: string): UseProgressResult {
    const [progress, setProgress] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const { lessonProgress, addLessonProgress, updateLessonProgress: updateStoreProgress } = useCoursesStore();

    const updateLessonProgress = useCallback(
        async (enrollmentId: string, lessonId: string, duration: number) => {
            try {
                setLoading(true);
                const result = await CoursesService.updateLessonProgress(
                    enrollmentId,
                    lessonId,
                    duration,
                    true // Mark as completed
                );
                addLessonProgress(result);
                setError(null);
            } catch (err) {
                const error = err instanceof Error ? err : new Error('Failed to update progress');
                setError(error);
                throw error;
            } finally {
                setLoading(false);
            }
        },
        [addLessonProgress]
    );

    const submitQuiz = useCallback(
        async (enrollmentId: string, lessonId: string, score: number) => {
            try {
                setLoading(true);
                await CoursesService.submitLessonQuiz(enrollmentId, lessonId, score);
                setError(null);
            } catch (err) {
                const error = err instanceof Error ? err : new Error('Failed to submit quiz');
                setError(error);
                throw error;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const saveNotesLocal = useCallback(
        async (enrollmentId: string, lessonId: string, notes: string) => {
            try {
                setLoading(true);
                await CoursesService.saveLessonNotes(enrollmentId, lessonId, notes);
                setError(null);
            } catch (err) {
                const error = err instanceof Error ? err : new Error('Failed to save notes');
                setError(error);
                throw error;
            } finally {
                setLoading(false);
            }
        },
        []
    );

    const getLessonProgress = useCallback(
        (enrollmentId: string, lessonId: string) => {
            return lessonProgress.find(
                (lp) => lp.enrollment_id === enrollmentId && lp.lesson_id === lessonId
            );
        },
        [lessonProgress]
    );

    const calculateProgress = useCallback(async (enrollmentId: string) => {
        try {
            setLoading(true);
            const calculatedProgress = await CoursesService.recalculateEnrollmentProgress(enrollmentId);
            setProgress(calculatedProgress);
            setError(null);
            return calculatedProgress;
        } catch (err) {
            const error = err instanceof Error ? err : new Error('Failed to calculate progress');
            setError(error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        progress,
        loading,
        error,
        updateLessonProgress,
        submitQuiz,
        saveNotes: saveNotesLocal,
        getLessonProgress,
        calculateProgress,
    };
}

export default useProgressTracking;
