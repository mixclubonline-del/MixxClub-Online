/**
 * CoursesPage Component
 * Main course discovery and enrollment page with filtering and search
 */

import React, { useMemo } from 'react';
import { useCourses } from '@/hooks/useCourses';
import { useCourseEnrollment } from '@/hooks/useCourseEnrollment';
import { Star, Clock, Users, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import type { Course } from '@/stores/coursesStore';

const categoryIcons: Record<string, React.ReactNode> = {
    production: '🎹',
    mixing: '🎚️',
    mastering: '✨',
    business: '💼',
    marketing: '📱',
};

const categoryLabels: Record<string, string> = {
    production: 'Music Production',
    mixing: 'Mixing Techniques',
    mastering: 'Mastering Fundamentals',
    business: 'Music Business',
    marketing: 'Artist Marketing',
};

interface CourseCardProps {
    course: Course;
    onEnroll: () => Promise<void>;
    isEnrolled: boolean;
    isLoading: boolean;
}const CourseCard: React.FC<CourseCardProps> = ({ course, onEnroll, isEnrolled, isLoading }) => {
    return (
        <div className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:shadow-md">
            {/* Thumbnail */}
            <div className="relative h-40 overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500">
                <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
                {course.tier === 'studio' && (
                    <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-1 rounded-full text-white text-xs font-bold">
                        Studio
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4">
                <div className="mb-2 flex items-center gap-2">
                    <span className="text-lg">{categoryIcons[course.category]}</span>
                    <span className="text-xs font-medium text-gray-500 uppercase">
                        {categoryLabels[course.category]}
                    </span>
                </div>

                <h3 className="mb-1 line-clamp-2 font-bold text-gray-900">{course.title}</h3>
                <p className="mb-3 line-clamp-2 text-sm text-gray-600">{course.description}</p>

                {/* Stats */}
                <div className="mb-3 flex items-center gap-3 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{course.rating?.toFixed(1) || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{course.duration}h</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{course.reviews} reviews</span>
                    </div>
                </div>

                {/* Instructor */}
                <div className="mb-3 flex items-center gap-2 text-xs">
                    <img
                        src={course.instructor.avatar}
                        alt={course.instructor.name}
                        className="h-6 w-6 rounded-full"
                    />
                    <span className="text-gray-700">{course.instructor.name}</span>
                </div>

                {/* Price & Button */}
                <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-gray-900">${course.price}</span>
                    <Button
                        disabled={isEnrolled || isLoading}
                        onClick={onEnroll}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
                    >
                        {isEnrolled ? 'Enrolled' : 'Enroll Now'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export const CoursesPage: React.FC = () => {
    const { user } = useAuth();
    const {
        courses,
        filteredCourses,
        loading,
        setCategory,
        setLevel,
        setSearchQuery,
        setSortBy,
    } = useCourses();
    const { enrollCourse, isEnrolled, loading: enrollLoading } = useCourseEnrollment(user?.id);

    const stats = useMemo(
        () => ({
            totalCourses: courses.length,
            totalStudents: courses.reduce((sum, c) => sum + (c.reviews || 0), 0),
            averageRating: (
                courses.reduce((sum, c) => sum + (c.rating || 0), 0) / Math.max(courses.length, 1)
            ).toFixed(1),
        }),
        [courses]
    );

    const handleEnroll = async (courseId: string) => {
        if (!user) {
            console.error('User must be logged in to enroll');
            return;
        }
        try {
            await enrollCourse(courseId);
        } catch (error) {
            console.error('Enrollment failed:', error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
            {/* Hero Section */}
            <section className="border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-12 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-8">
                        <h1 className="mb-2 text-4xl font-bold text-gray-900">
                            Learn Audio Production & Music Business
                        </h1>
                        <p className="text-lg text-gray-600">
                            Comprehensive courses from industry experts to advance your skills
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="rounded-lg bg-white p-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Courses</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.totalCourses}</p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-purple-500" />
                            </div>
                        </div>
                        <div className="rounded-lg bg-white p-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Students</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
                                </div>
                                <Users className="h-8 w-8 text-pink-500" />
                            </div>
                        </div>
                        <div className="rounded-lg bg-white p-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Avg Rating</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.averageRating}★</p>
                                </div>
                                <Star className="h-8 w-8 text-yellow-500" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Filters & Search */}
            <section className="border-b border-gray-200 bg-white px-4 py-6 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <Input
                            placeholder="Search courses..."
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="border-gray-300"
                        />
                        <Select onValueChange={setCategory}>
                            <SelectTrigger>
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">All Categories</SelectItem>
                                {Object.entries(categoryLabels).map(([key, label]) => (
                                    <SelectItem key={key} value={key}>
                                        {label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select onValueChange={setLevel}>
                            <SelectTrigger>
                                <SelectValue placeholder="Level" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">All Levels</SelectItem>
                                <SelectItem value="beginner">Beginner</SelectItem>
                                <SelectItem value="intermediate">Intermediate</SelectItem>
                                <SelectItem value="advanced">Advanced</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select onValueChange={(value) => setSortBy(value as 'popular' | 'newest' | 'rating' | 'price-low' | 'price-high')}>
                            <SelectTrigger>
                                <SelectValue placeholder="Sort By" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="popular">Most Popular</SelectItem>
                                <SelectItem value="newest">Newest</SelectItem>
                                <SelectItem value="rating">Highest Rated</SelectItem>
                                <SelectItem value="price-low">Price: Low to High</SelectItem>
                                <SelectItem value="price-high">Price: High to Low</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </section>

            {/* Course Grid */}
            <section className="px-4 py-12 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    {loading ? (
                        <div className="text-center text-gray-600">Loading courses...</div>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {filteredCourses.map((course) => (
                                <CourseCard
                                    key={course.id}
                                    course={course}
                                    onEnroll={() => handleEnroll(course.id)}
                                    isEnrolled={isEnrolled(course.id)}
                                    isLoading={enrollLoading}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default CoursesPage;
