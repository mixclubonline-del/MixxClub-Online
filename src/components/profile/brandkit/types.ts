/**
 * Brand Kit types — Shared types for the brand kit system.
 */

export interface PressKitData {
    artistName: string;
    bio: string;
    tagline: string;
    role: string;
    location: string;
    avatarUrl: string;
    coverImageUrl: string;
    socialLinks: Record<string, string>;
    stats: {
        followers: number;
        following: number;
        profileViews: number;
        level: number;
        totalXp: number;
    };
    links: { title: string; url: string }[];
}

export interface AnalyticsData {
    profileViews: number;
    profileViewsTrend: number;   // % change
    followers: number;
    followersTrend: number;
    messagesSent: number;
    messagesTrend: number;
    hireRequests: number;
    hireTrend: number;
    topReferrers: { source: string; count: number }[];
    viewsByDay: { day: string; views: number }[];
}
