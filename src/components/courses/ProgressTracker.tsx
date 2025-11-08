/**
 * ProgressTracker Component
 * Visual course progress tracking with lesson list
 */

import React from 'react';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, Clock } from 'lucide-react';
import type { Lesson, CourseEnrollment } from '@/stores/coursesStore';

interface ProgressTrackerProps {
    enrollment: CourseEnrollment;
    lessons: Lesson[];
    onLessonClick: (lessonId: string) => void;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
    enrollment,
    lessons,
    onLessonClick,
}) => {
    return (
        <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            {/* Progress Summary */}
            <div className="mb-6">
                <h3 className="mb-3 font-bold text-gray-900">Course Progress</h3>
                <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                        {enrollment.lessonsCompleted.length} of {lessons.length} lessons completed
                    </span>
                    <span className="font-bold text-gray-900">{enrollment.progress}%</span>
                </div>
                <Progress value={enrollment.progress} className="h-2" />
            </div>

            {/* Lesson List */}
            <div className="space-y-2">
                <h4 className="mb-3 font-semibold text-gray-900">Lessons</h4>
                {lessons.map((lesson, index) => {
                    const isCompleted = enrollment.lessonsCompleted.includes(lesson.id);
                    const isCurrent = enrollment.currentLesson === lesson.id;

                    return (
                        <button
                            key={lesson.id}
                            onClick={() => onLessonClick(lesson.id)}
                            className={`w-full rounded-lg px-4 py-3 text-left transition-colors ${isCurrent
                                    ? 'bg-purple-100 border border-purple-300'
                                    : isCompleted
                                        ? 'bg-gray-50 border border-gray-200'
                                        : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                {isCompleted ? (
                                    <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                                ) : (
                                    <Circle className="mt-0.5 h-5 w-5 flex-shrink-0 text-gray-400" />
                                )}
                                <div className="flex-1">
                                    <p className={`text-sm font-medium ${isCompleted ? 'text-gray-600' : 'text-gray-900'}`}>
                                        Lesson {index + 1}: {lesson.title}
                                    </p>
                                    <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                                        <Clock className="h-3 w-3" />
                                        {lesson.duration} min
                                    </div>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Completion Status */}
            {enrollment.progress === 100 && (
                <div className="mt-6 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-4">
                    <p className="text-sm font-semibold text-green-900">
                        ✓ Course completed! Your certificate is ready.
                    </p>
                </div>
            )}
        </div>
    );
};

export default ProgressTracker;
