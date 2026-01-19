/**
 * LessonPlayer Component
 * Video lesson player with progress tracking, notes, and quiz
 */

import React, { useState, useCallback } from 'react';
import { useProgressTracking } from '@/hooks/useProgressTracking';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { BookOpen, CheckCircle, PlayCircle } from 'lucide-react';
import type { Lesson } from '@/stores/coursesStore';

interface LessonPlayerProps {
    enrollmentId: string;
    lesson: Lesson;
    onComplete: () => void;
}

export const LessonPlayer: React.FC<LessonPlayerProps> = ({
    enrollmentId,
    lesson,
    onComplete,
}) => {
    const [notes, setNotes] = useState('');
    const [showNotes, setShowNotes] = useState(false);
    const [watchedTime, setWatchedTime] = useState(0);
    const [isWatched, setIsWatched] = useState(false);

    const { updateLessonProgress, saveNotes, loading, error } =
        useProgressTracking(enrollmentId);

    const durationSeconds = (lesson.duration_minutes || 0) * 60;
    const watchPercentage = durationSeconds > 0 ? (watchedTime / durationSeconds) * 100 : 0;
    const isMinimumWatched = watchPercentage >= 80;

    const handleVideoProgress = useCallback((currentTime: number) => {
        setWatchedTime(currentTime);
    }, []);

    const handleCompleteLesson = useCallback(async () => {
        try {
            await updateLessonProgress(enrollmentId, lesson.id, watchedTime);
            setIsWatched(true);
            onComplete();
        } catch (err) {
            console.error('Failed to complete lesson:', err);
        }
    }, [enrollmentId, lesson.id, watchedTime, updateLessonProgress, onComplete]);

    const handleSaveNotes = useCallback(async () => {
        try {
            await saveNotes(enrollmentId, lesson.id, notes);
            alert('Notes saved successfully!');
        } catch (err) {
            console.error('Failed to save notes:', err);
        }
    }, [enrollmentId, lesson.id, notes, saveNotes]);

    return (
        <div className="min-h-screen bg-gray-900">
            <div className="mx-auto max-w-6xl">
                {/* Video Player Section */}
                <div className="bg-black">
                    <div className="aspect-video bg-gradient-to-br from-purple-900 to-black flex items-center justify-center">
                        <div className="text-center w-full h-full">
                            {lesson.video_url ? (
                                <video
                                    src={lesson.video_url}
                                    controls
                                    className="h-full w-full"
                                    onTimeUpdate={(e) => handleVideoProgress(e.currentTarget.currentTime)}
                                    onEnded={() => {
                                        if (isMinimumWatched) {
                                            setIsWatched(true);
                                        }
                                    }}
                                >
                                    Your browser does not support the video tag.
                                </video>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full">
                                    <PlayCircle className="h-16 w-16 text-purple-400 mb-4" />
                                    <p className="text-white text-lg font-semibold">{lesson.title}</p>
                                    <p className="text-gray-400 text-sm mt-2">Video content not available</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="border-t border-gray-700 bg-gray-800 px-6 py-4">
                        <div className="mb-2 flex items-center justify-between text-sm">
                            <span className="text-gray-400">Watch Progress</span>
                            <span className="text-purple-400 font-semibold">{Math.round(watchPercentage)}%</span>
                        </div>
                        <Progress value={watchPercentage} className="h-2 bg-gray-700" />
                        <p className="mt-2 text-xs text-gray-500">
                            {isMinimumWatched
                                ? '✓ You can mark this lesson as complete'
                                : `Watch ${(80 - Math.round(watchPercentage)).toFixed(0)}% more to complete`}
                        </p>
                    </div>
                </div>

                {/* Content Area */}
                <div className="grid grid-cols-3 gap-6 p-6">
                    {/* Main Content */}
                    <div className="col-span-2">
                        {/* Lesson Info */}
                        <div className="mb-6 rounded-lg bg-gray-800 p-6">
                            <h1 className="mb-4 text-2xl font-bold text-white">{lesson.title}</h1>
                            <p className="mb-4 text-gray-300">{lesson.description || 'No description available.'}</p>

                            <div className="mb-4 grid grid-cols-2 gap-4">
                                <div className="rounded bg-gray-700 p-3">
                                    <p className="text-sm text-gray-400">Duration</p>
                                    <p className="font-semibold text-white">{lesson.duration_minutes || 0} minutes</p>
                                </div>
                                <div className="rounded bg-gray-700 p-3">
                                    <p className="text-sm text-gray-400">Order</p>
                                    <p className="font-semibold text-white">Lesson {lesson.order_index}</p>
                                </div>
                            </div>

                            {/* Status */}
                            <div className="rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 p-4">
                                <div className="flex items-center gap-3">
                                    {isWatched ? (
                                        <>
                                            <CheckCircle className="h-6 w-6 text-white" />
                                            <span className="font-semibold text-white">Lesson Completed!</span>
                                        </>
                                    ) : (
                                        <>
                                            <PlayCircle className="h-6 w-6 text-white" />
                                            <span className="font-semibold text-white">In Progress</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <Button
                                disabled={!isMinimumWatched || loading}
                                onClick={handleCompleteLesson}
                                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
                            >
                                {loading ? 'Marking Complete...' : 'Mark as Complete'}
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setShowNotes(!showNotes)}
                                className="border-gray-600 text-gray-300 hover:bg-gray-700"
                            >
                                <BookOpen className="h-4 w-4 mr-2" />
                                Notes
                            </Button>
                        </div>

                        {error && (
                            <div className="mt-4 rounded-lg bg-red-900 p-4 text-red-200">
                                {error.message}
                            </div>
                        )}
                    </div>

                    {/* Sidebar - Notes */}
                    {showNotes && (
                        <div className="rounded-lg bg-gray-800 p-6">
                            <h3 className="mb-4 font-bold text-white">Lesson Notes</h3>
                            <Textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Add your notes for this lesson..."
                                className="mb-4 min-h-[300px] bg-gray-700 text-white border-gray-600"
                            />
                            <Button
                                onClick={handleSaveNotes}
                                disabled={loading}
                                className="w-full bg-purple-600 text-white hover:bg-purple-700"
                            >
                                Save Notes
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LessonPlayer;
