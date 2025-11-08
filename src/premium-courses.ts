/**
 * Premium Courses System - Centralized Export
 * Complete course platform with enrollment, progress tracking, and certificates
 *
 * QUICK START GUIDE:
 * ==================
 *
 * 1. STORE SETUP
 *    import { useCoursesStore } from '@/stores/coursesStore';
 *
 *    const { courses, enrollCourse, completeLesson } = useCoursesStore();
 *
 * 2. HOOKS SETUP
 *    import { useCourses, useCourseEnrollment, useProgressTracking } from '@/hooks';
 *
 *    const { courses, filteredCourses } = useCourses();
 *    const { enrollments, enrollCourse } = useCourseEnrollment(userId);
 *    const { progress, updateLessonProgress } = useProgressTracking(enrollmentId);
 *
 * 3. SERVICE LAYER
 *    import CoursesService from '@/services/CoursesService';
 *
 *    const courses = await CoursesService.getCourses();
 *    const enrollment = await CoursesService.enrollCourse(userId, courseId);
 *    const certificate = await CoursesService.completeCourse(enrollmentId, courseId, userId);
 *
 * 4. COMPONENTS
 *    import { CoursesPage, LessonPlayer, ProgressTracker, CertificateDisplay } from '@/components/courses';
 *
 *    <CoursesPage />
 *    <LessonPlayer enrollmentId={id} lesson={lesson} onComplete={callback} />
 *    <ProgressTracker enrollment={enrollment} lessons={lessons} onLessonClick={callback} />
 *    <CertificateDisplay certificate={certificate} />
 *
 * 5. INTEGRATION IN PAGES
 *    // Dashboard Page
 *    import CoursesPage from '@/components/courses/CoursesPage';
 *    const Dashboard = () => <CoursesPage />;
 *
 *    // Lesson Page
 *    import { LessonPlayer, ProgressTracker } from '@/components/courses';
 *    const LessonPage = ({ enrollmentId, lessonId }) => {
 *      const lesson = ...
 *      return (
 *        <div className="grid grid-cols-3 gap-6">
 *          <LessonPlayer enrollmentId={enrollmentId} lesson={lesson} />
 *          <ProgressTracker enrollment={enrollment} lessons={lessons} />
 *        </div>
 *      );
 *    };
 */

// Store
export { useCoursesStore } from '@/stores/coursesStore';
export type {
    Course,
    Lesson,
    CourseEnrollment,
    LessonProgress,
    Certificate,
    CourseStats,
} from '@/stores/coursesStore';

// Service
export { default as CoursesService } from '@/services/CoursesService';

// Hooks
export { useCourses } from '@/hooks/useCourses';
export { useCourseEnrollment } from '@/hooks/useCourseEnrollment';
export { useProgressTracking } from '@/hooks/useProgressTracking';
export type { UseCoursesResult, CourseStats as CourseStatsType } from '@/hooks/useCourses';
export type { UseEnrollmentResult } from '@/hooks/useCourseEnrollment';
export type { UseProgressResult } from '@/hooks/useProgressTracking';

// Components
export { CoursesPage } from '@/components/courses/CoursesPage';
export { LessonPlayer } from '@/components/courses/LessonPlayer';
export { ProgressTracker } from '@/components/courses/ProgressTracker';
export { CertificateDisplay } from '@/components/courses/CertificateDisplay';

/**
 * EXAMPLE: Complete Course Enrollment Flow
 * ==========================================
 *
 * import { useCourses, useCourseEnrollment, useProgressTracking, CoursesPage, LessonPlayer } from '@/premium-courses';
 *
 * export default function CourseApp({ userId }) {
 *   // Fetch courses
 *   const { courses, selectedCourse, getCourse } = useCourses();
 *
 *   // Handle enrollment
 *   const { enrollCourse, isEnrolled, enrollments } = useCourseEnrollment(userId);
 *
 *   // Track progress
 *   const { progress, updateLessonProgress, calculateProgress } = useProgressTracking(enrollmentId);
 *
 *   return (
 *     <>
 *       {!isEnrolled(selectedCourse.id) ? (
 *         <CoursesPage />
 *       ) : (
 *         <LessonPlayer
 *           enrollmentId={enrollmentId}
 *           lesson={currentLesson}
 *           onComplete={() => updateLessonProgress(enrollmentId, lessonId, duration)}
 *         />
 *       )}
 *     </>
 *   );
 * }
 *
 * FEATURES INCLUDED:
 * - Course discovery with filtering & search
 * - Enrollment management with tier restrictions
 * - Video lesson player with progress tracking
 * - Lesson notes and quiz submission
 * - Automatic certificate generation
 * - Real-time progress synchronization
 * - Student analytics dashboard
 * - Course ratings and reviews
 * - Lesson resources & materials
 * - Full TypeScript support
 *
 * DATABASE TABLES REQUIRED:
 * - courses (id, title, description, instructor_id, price, tier, category, level, thumbnail, rating, etc.)
 * - lessons (id, course_id, title, video_url, duration, lesson_order, resources, quiz)
 * - enrollments (id, user_id, course_id, enrolled_at, completed_at, progress, lessons_completed)
 * - lesson_progress (id, enrollment_id, lesson_id, watched_duration, quiz_score, completed_at, notes)
 * - certificates (id, enrollment_id, course_id, user_id, certificate_number, issued_at)
 *
 * SUBSCRIPTION TIER RESTRICTIONS:
 * - Free: No course access (view only)
 * - Starter ($9): Access to 5 beginner courses
 * - Pro ($29): Access to all courses except Studio-tier
 * - Studio ($99): Access to all courses including Studio-tier exclusive content
 */
