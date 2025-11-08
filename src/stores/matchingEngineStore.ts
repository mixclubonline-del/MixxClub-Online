import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * AI MATCHING ENGINE STORE
 * Auto-matches engineers to projects based on:
 * - Genre compatibility
 * - Technical skills
 * - Past performance & ratings
 * - Availability & turnaround time
 * - Price alignment
 */

export interface Engineer {
    id: string;
    name: string;
    avatar?: string;
    genres: string[];
    experience: number; // years
    rating: number; // 0-5
    completedProjects: number;
    avgTurnaroundHours: number;
    pricePerTrack: number;
    availability: 'available' | 'busy' | 'unavailable';
    successRate: number; // percentage
    completionRate: number; // percentage
    skills: string[];
    bio: string;
    portfolio?: string;
    verified: boolean;
    joinedDate: Date;
    stats: {
        totalProjects: number;
        onTimeDelivery: number;
        clientSatisfaction: number;
        averageScore: number;
    };
}

export interface Project {
    id: string;
    title: string;
    description: string;
    genres: string[];
    budget: number;
    deadline: Date;
    artistId: string;
    artistName: string;
    skills: string[];
    complexity: 'simple' | 'medium' | 'complex';
    priority: 'low' | 'medium' | 'high';
    createdAt: Date;
}

export interface Match {
    engineerId: string;
    projectId: string;
    matchScore: number; // 0-100
    genreMatch: number; // 0-100
    experienceScore: number; // 0-100
    performanceScore: number; // 0-100
    priceAlignment: number; // 0-100
    availabilityScore: number; // 0-100
    confidence: 'high' | 'medium' | 'low';
    reason: string;
    timestamp: Date;
}

interface MatchingEngineStore {
    // Data
    engineers: Engineer[];
    projects: Project[];
    matches: Map<string, Match[]>; // projectId -> matches[]

    // Matching results
    topMatches: Match[];
    selectedMatch: Match | null;

    // Stats
    matchSuccessRate: number;
    avgMatchQuality: number;
    totalMatchesMade: number;

    // Actions
    addEngineer: (engineer: Engineer) => void;
    addProject: (project: Project) => void;
    findMatches: (projectId: string, topN?: number) => Match[];
    getTopMatches: (projectId: string) => Match[];
    selectMatch: (match: Match) => void;
    recordMatchOutcome: (matchId: string, success: boolean) => void;
    getEngineersByGenre: (genre: string) => Engineer[];
    getProjectMatches: (projectId: string) => Match[];
}

// Sample engineers for demo
const SAMPLE_ENGINEERS: Engineer[] = [
    {
        id: 'eng-1',
        name: 'Alex Rivera',
        genres: ['hip-hop', 'trap', 'r&b'],
        experience: 8,
        rating: 4.9,
        completedProjects: 342,
        avgTurnaroundHours: 18,
        pricePerTrack: 75,
        availability: 'available',
        successRate: 98,
        completionRate: 99.5,
        skills: ['mixing', 'mastering', 'production'],
        bio: 'Grammy-nominated engineer specializing in hip-hop & trap production',
        verified: true,
        joinedDate: new Date('2020-03-15'),
        stats: {
            totalProjects: 342,
            onTimeDelivery: 337,
            clientSatisfaction: 4.9,
            averageScore: 96,
        },
    },
    {
        id: 'eng-2',
        name: 'Jordan Chen',
        genres: ['electronic', 'house', 'ambient'],
        experience: 12,
        rating: 4.8,
        completedProjects: 521,
        avgTurnaroundHours: 24,
        pricePerTrack: 95,
        availability: 'available',
        successRate: 97,
        completionRate: 98.8,
        skills: ['mixing', 'mastering', 'sound design'],
        bio: 'Expert in electronic and ambient music production',
        verified: true,
        joinedDate: new Date('2018-07-22'),
        stats: {
            totalProjects: 521,
            onTimeDelivery: 512,
            clientSatisfaction: 4.8,
            averageScore: 95,
        },
    },
    {
        id: 'eng-3',
        name: 'Maya Patel',
        genres: ['pop', 'indie', 'folk'],
        experience: 6,
        rating: 4.7,
        completedProjects: 198,
        avgTurnaroundHours: 16,
        pricePerTrack: 55,
        availability: 'available',
        successRate: 96,
        completionRate: 97.5,
        skills: ['mixing', 'vocal production'],
        bio: 'Pop and indie specialist with a ear for radio-ready mixes',
        verified: true,
        joinedDate: new Date('2021-01-10'),
        stats: {
            totalProjects: 198,
            onTimeDelivery: 190,
            clientSatisfaction: 4.7,
            averageScore: 94,
        },
    },
    {
        id: 'eng-4',
        name: 'David Kim',
        genres: ['metal', 'rock', 'alternative'],
        experience: 15,
        rating: 4.85,
        completedProjects: 612,
        avgTurnaroundHours: 20,
        pricePerTrack: 85,
        availability: 'busy',
        successRate: 99,
        completionRate: 99.8,
        skills: ['mixing', 'mastering', 'drum processing'],
        bio: 'Rock and metal mixing specialist, worked with major labels',
        verified: true,
        joinedDate: new Date('2016-05-03'),
        stats: {
            totalProjects: 612,
            onTimeDelivery: 606,
            clientSatisfaction: 4.85,
            averageScore: 97,
        },
    },
    {
        id: 'eng-5',
        name: 'Sophie Laurent',
        genres: ['jazz', 'classical', 'soul'],
        experience: 20,
        rating: 4.95,
        completedProjects: 876,
        avgTurnaroundHours: 36,
        pricePerTrack: 125,
        availability: 'available',
        successRate: 99.5,
        completionRate: 99.9,
        skills: ['mixing', 'mastering', 'orchestration'],
        bio: 'Legendary engineer with 20 years classical and jazz experience',
        verified: true,
        joinedDate: new Date('2014-02-14'),
        stats: {
            totalProjects: 876,
            onTimeDelivery: 872,
            clientSatisfaction: 4.95,
            averageScore: 98,
        },
    },
];

export const useMatchingEngineStore = create<MatchingEngineStore>()(
    persist(
        (set, get) => ({
            engineers: SAMPLE_ENGINEERS,
            projects: [],
            matches: new Map(),
            topMatches: [],
            selectedMatch: null,
            matchSuccessRate: 0.94,
            avgMatchQuality: 87,
            totalMatchesMade: 3421,

            addEngineer: (engineer) => {
                const { engineers } = get();
                set({ engineers: [...engineers, engineer] });
            },

            addProject: (project) => {
                const { projects } = get();
                set({ projects: [...projects, project] });
            },

            findMatches: (projectId, topN = 5) => {
                const { engineers, projects, matches } = get();
                const project = projects.find((p) => p.id === projectId);

                if (!project) return [];

                // Calculate match score for each engineer
                const engineerMatches = engineers
                    .map((engineer) => {
                        // 1. Genre compatibility (30% weight)
                        const genreMatch =
                            (engineer.genres.filter((g) =>
                                project.genres.some((pg) => pg.toLowerCase() === g.toLowerCase())
                            ).length /
                                (engineer.genres.length || 1)) *
                            100;

                        // 2. Experience score (20% weight) - more experience = better
                        const experienceScore = Math.min(
                            (engineer.experience / 20) * 100,
                            100
                        );

                        // 3. Performance score (30% weight)
                        const performanceScore =
                            engineer.rating * 20 + // rating 0-5 -> 0-100
                            engineer.successRate +
                            engineer.completionRate / 2;

                        // 4. Price alignment (10% weight)
                        const budgetPerTrack = project.budget / 3; // assume 3 tracks
                        const priceAlignment = Math.max(
                            0,
                            100 - Math.abs(engineer.pricePerTrack - budgetPerTrack) / 2
                        );

                        // 5. Availability score (10% weight)
                        const availabilityScore =
                            engineer.availability === 'available'
                                ? 100
                                : engineer.availability === 'busy'
                                    ? 60
                                    : 0;

                        // Calculate weighted match score
                        const matchScore =
                            genreMatch * 0.3 +
                            experienceScore * 0.2 +
                            performanceScore * 0.3 +
                            priceAlignment * 0.1 +
                            availabilityScore * 0.1;

                        const confidence =
                            matchScore >= 80 ? 'high' : matchScore >= 60 ? 'medium' : 'low';

                        // Generate match reason inline
                        const reasons = [];
                        if (genreMatch >= 66) {
                            reasons.push(`Genre specialist (${engineer.genres.join(', ')})`);
                        }
                        if (engineer.rating >= 4.8) {
                            reasons.push(`Top-rated engineer (${engineer.rating}★)`);
                        }
                        if (engineer.experience > 10) {
                            reasons.push(`${engineer.experience}+ years experience`);
                        }
                        if (availabilityScore === 100) {
                            reasons.push('Immediately available');
                        }
                        const reason =
                            reasons.join(' • ') || 'Solid match based on skills and experience';

                        return {
                            engineerId: engineer.id,
                            projectId,
                            matchScore: Math.round(matchScore),
                            genreMatch: Math.round(genreMatch),
                            experienceScore: Math.round(experienceScore),
                            performanceScore: Math.round(performanceScore),
                            priceAlignment: Math.round(priceAlignment),
                            availabilityScore: Math.round(availabilityScore),
                            confidence,
                            reason,
                            timestamp: new Date(),
                        } as Match;
                    })
                    .sort((a, b) => b.matchScore - a.matchScore)
                    .slice(0, topN);

                // Store matches
                matches.set(projectId, engineerMatches);
                set({
                    matches,
                    topMatches: engineerMatches,
                });

                return engineerMatches;
            },

            getTopMatches: (projectId) => {
                const { matches } = get();
                return matches.get(projectId) || [];
            },

            selectMatch: (match) => {
                set({ selectedMatch: match });
            },

            recordMatchOutcome: (matchId, success) => {
                const { engineers } = get();
                // In real implementation, would update engineer stats
                if (success) {
                    console.log(`Match ${matchId} successful - updating engineer rating`);
                }
            },

            getEngineersByGenre: (genre) => {
                const { engineers } = get();
                return engineers.filter((e) =>
                    e.genres.some((g) => g.toLowerCase() === genre.toLowerCase())
                );
            },

            getProjectMatches: (projectId) => {
                const { matches } = get();
                return matches.get(projectId) || [];
            },
        }),
        {
            name: 'matching-engine-store',
        }
    )
);
