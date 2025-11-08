/**
 * AI MATCHING ENGINE - USAGE EXAMPLES
 * 
 * Complete guide to using the AI Matching Engine system
 * for auto-matching engineers to projects
 */

// ============================================================================
// EXAMPLE 1: Basic Usage in a Component
// ============================================================================

import { useMatchingEngine } from '@/hooks/useMatchingEngine';

export function ProjectMatchFinder() {
    const {
        findMatches,
        engineers,
        topMatches,
        selectMatch,
    } = useMatchingEngine();

    const projectId = 'project-1';

    // Find top 5 matches for a project
    const handleFindMatches = () => {
        const matches = findMatches(projectId, 5);
        console.log('Top matches:', matches);
        // Output:
        // [
        //   { matchScore: 92, confidence: 'high', reason: '...' },
        //   { matchScore: 85, confidence: 'high', reason: '...' },
        //   ...
        // ]
    };

    return (
        <div>
            <button onClick={handleFindMatches}>Find Matches</button>
            {topMatches.map((match) => (
                <div key={match.engineerId}>
                    <h3>Match Score: {match.matchScore}%</h3>
                    <p>{match.reason}</p>
                    <button onClick={() => selectMatch(match)}>Select</button>
                </div>
            ))}
        </div>
    );
}


// ============================================================================
// EXAMPLE 2: Advanced Filtering
// ============================================================================

export function AdvancedEngineerSearch() {
    const {
        getEngineersByGenre,
        getTopRatedEngineers,
        getAvailableEngineers,
        getHighConfidenceMatches,
        findBestMatch,
    } = useMatchingEngine();

    // Find engineers by genre
    const hipHopSpecialists = getEngineersByGenre('hip-hop');
    // Returns: [Alex Rivera, ...]

    // Get top-rated engineers
    const topEngineers = getTopRatedEngineers();
    // Returns: [Sophie Laurent (4.95★), David Kim (4.85★), ...]

    // Get immediately available engineers
    const availableNow = getAvailableEngineers();
    // Returns: [Alex Rivera, Jordan Chen, Sophie Laurent]

    // Get only high-confidence matches for a project
    const bestMatches = getHighConfidenceMatches('project-1');
    // Returns: [Match, Match] (confidence: 'high' only)

    // Get single best match
    const bestMatch = findBestMatch('project-1');
    // Returns: { matchScore: 95, engineerId: 'eng-1', ... }

    return (
        <div>
            <h2>Hip-Hop Specialists: {hipHopSpecialists.length}</h2>
            <h2>Top Rated: {topEngineers[0].name} ({topEngineers[0].rating}★)</h2>
            <h2>Available Now: {availableNow.length}</h2>
            <h2>Best Match Score: {bestMatch?.matchScore}%</h2>
        </div>
    );
}


// ============================================================================
// EXAMPLE 3: Match Scoring Breakdown
// ============================================================================

export function MatchScoreExplanation() {
    /**
     * Match Score = Weighted Sum of 5 Factors
     * 
     * 1. GENRE COMPATIBILITY (30% weight)
     *    - Measures how many genres overlap between engineer and project
     *    - Exact match calculation
     *    - Example: Engineer specializes in [hip-hop, trap, r&b]
     *              Project needs [hip-hop, trap]
     *              → 2/3 genres match → 67% genre score
     *    - Weight: 30% → Contributes ~20% to final score
     * 
     * 2. EXPERIENCE SCORE (20% weight)
     *    - Years of experience normalized to 0-100
     *    - Formula: Math.min((years / 20) * 100, 100)
     *    - Example: 8 years experience → 40% experience score
     *    - Example: 20+ years experience → 100% experience score
     *    - Weight: 20% → Contributes ~8% to final score
     * 
     * 3. PERFORMANCE SCORE (30% weight) - HIGHEST WEIGHT
     *    - Combines: Rating + Success Rate + Completion Rate
     *    - Formula: (rating * 20) + successRate + (completionRate / 2)
     *    - Example: 4.9★ rating, 98% success, 99.5% completion
     *              → (4.9 * 20) + 98 + 49.75 = 147.75%
     *              → Capped at 100% = 100% performance score
     *    - Weight: 30% → Contributes ~30% to final score
     * 
     * 4. PRICE ALIGNMENT (10% weight)
     *    - How well engineer's pricing fits project budget
     *    - Formula: 100 - Math.abs(pricePerTrack - budgetPerTrack) / 2
     *    - Example: Budget $3000 for 3 tracks = $1000/track
     *              Engineer charges $75/track
     *              → 100 - |75 - 1000| / 2 = 100 - 462.5 = Capped at 0
     *    - Example: Engineer charges $950/track
     *              → 100 - |950 - 1000| / 2 = 100 - 25 = 75% price alignment
     *    - Weight: 10% → Contributes ~7.5% to final score
     * 
     * 5. AVAILABILITY SCORE (10% weight)
     *    - Simple availability check
     *    - Available: 100%
     *    - Busy: 60%
     *    - Unavailable: 0%
     *    - Weight: 10% → Contributes ~6-10% to final score
     * 
     * CONFIDENCE LEVELS:
     * - High (🟢): Score ≥ 80 = Great match, recommend selection
     * - Medium (🟡): Score 60-79 = Good match, consider alternatives
     * - Low (🔴): Score < 60 = Marginal match, explore other options
     */

    const matchExample = {
        engineerId: 'eng-1', // Alex Rivera
        projectId: 'project-1', // Hip-Hop Album
        genreMatch: 67,
        experienceScore: 40,
        performanceScore: 94,
        priceAlignment: 50,
        availabilityScore: 100,
        // Final Score:
        // (67 * 0.3) + (40 * 0.2) + (94 * 0.3) + (50 * 0.1) + (100 * 0.1)
        // = 20.1 + 8 + 28.2 + 5 + 10
        // = 71.3 → 71% MEDIUM CONFIDENCE
        matchScore: 71,
        confidence: 'medium' as const,
        reason: 'Good experience in hip-hop genre • 4.9★ top-rated engineer • Price point favorable',
    };

    return (
        <div>
            <h3>Match Score Calculation Example</h3>
            <pre>{JSON.stringify(matchExample, null, 2)}</pre>
        </div>
    );
}


// ============================================================================
// EXAMPLE 4: Using in MatchingDashboard
// ============================================================================

import { type Project } from '@/stores/matchingEngineStore';

export function DashboardExample() {
    const {
        findMatches,
        getEngineer,
        selectMatch,
        selectedMatch,
    } = useMatchingEngine();

    // User selects a project
    const project: Project = {
        id: 'project-1',
        title: 'Hip-Hop Album Mixing & Mastering',
        description: '12-track album needing professional mixing and mastering',
        genres: ['hip-hop', 'trap'],
        budget: 3000,
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        artistId: 'artist-1',
        artistName: 'Demo Artist',
        skills: ['mixing', 'mastering', 'production'],
        complexity: 'complex',
        priority: 'high',
        createdAt: new Date(),
    };

    // Find all matches for this project
    const matches = findMatches(project.id, 10);

    // Display matches
    return (
        <div>
            {matches.map((match) => {
                const engineer = getEngineer(match.engineerId);
                return (
                    <div
                        key={match.engineerId}
                        onClick={() => selectMatch(match)}
                        style={{
                            border: match.confidence === 'high' ? '2px solid green' : '1px solid gray',
                        }}
                    >
                        <h3>{engineer?.name}</h3>
                        <p>Score: {match.matchScore}% ({match.confidence})</p>
                        <p>{match.reason}</p>
                    </div>
                );
            })}

            {selectedMatch && (
                <div>
                    <h2>Selected Match Details</h2>
                    <p>Overall: {selectedMatch.matchScore}%</p>
                    <p>Genre: {selectedMatch.genreMatch}%</p>
                    <p>Experience: {selectedMatch.experienceScore}%</p>
                    <p>Performance: {selectedMatch.performanceScore}%</p>
                    <p>Price: {selectedMatch.priceAlignment}%</p>
                    <p>Availability: {selectedMatch.availabilityScore}%</p>
                </div>
            )}
        </div>
    );
}


// ============================================================================
// EXAMPLE 5: Recording Match Outcomes for ML Improvement
// ============================================================================

export function TrackingMatchSuccess() {
    const { recordMatchOutcome } = useMatchingEngine();

    // When an engineer accepts the project
    const handleEngineerAccepted = (matchId: string) => {
        recordMatchOutcome(matchId, true); // success: true
    };

    // When a match fails (engineer declines or project goes elsewhere)
    const handleMatchFailed = (matchId: string) => {
        recordMatchOutcome(matchId, false); // success: false
    };

    /**
     * Backend Integration:
     * These outcomes should be saved to database to:
     * 1. Track match success rate (calculate accuracy)
     * 2. Train ML model with real feedback
     * 3. Adjust weights based on what works
     * 4. Improve future matches over time
     */

    return (
        <div>
            <button onClick={() => handleEngineerAccepted('match-1')}>
                Engineer Accepted ✅
            </button>
            <button onClick={() => handleMatchFailed('match-1')}>
                Match Failed ❌
            </button>
        </div>
    );
}


// ============================================================================
// EXAMPLE 6: Backend Integration (Supabase)
// ============================================================================

/**
 * Backend Integration Points:
 *
 * 1. ENGINEER DATA SOURCE
 *    - Replace SAMPLE_ENGINEERS with database query
 *    - Query: SELECT * FROM engineers WHERE verified = true
 *    - Include real-time stats: rating, projects, earnings
 *
 * 2. PROJECT DATA SOURCE
 *    - Load projects from artist dashboard
 *    - Track which projects use matching engine
 *    - Store match selections for analytics
 *
 * 3. MATCH PERSISTENCE
 *    - Save match results to database
 *    - Track engineer selection by artist
 *    - Record match outcome (accepted/declined/completed)
 *
 * 4. ANALYTICS
 *    - Calculate match success rate
 *    - Measure conversion (match → project confirmation)
 *    - Track time to acceptance
 *    - Measure artist satisfaction
 *
 * 5. ML IMPROVEMENTS
 *    - Use success/failure data to retrain model
 *    - Test different weights (A/B testing)
 *    - Personalize weights per engineer/artist pair
 *    - Track seasonal trends in genre preferences
 *
 * Database Schema (Needed):
 * - matches table: id, engineerId, projectId, score, confidence, outcome
 * - match_outcomes table: matchId, accepted, completed, rating, feedback
 * - engineer_stats table: engineerId, totalMatches, successRate, avgScore
 */


// ============================================================================
// EXAMPLE 7: Revenue Implementation
// ============================================================================

/**
 * Monetization Strategies:
 * 
 * 1. INCLUDED IN PRO TIER ($29/month)
 *    - Artists on Pro+ get AI matching for their projects
 *    - Includes top 5 match recommendations
 *    - Basic filtering and search
 * 
 * 2. INCLUDED IN STUDIO TIER ($99/month)
 *    - Unlimited projects
 *    - Unlimited match generations
 *    - Priority matching (faster results)
 *    - Custom weighting (adjust factors)
 * 
 * 3. PREMIUM MATCHING SERVICE
 *    - $49 per project for match consultation
 *    - AI selects top engineer + handles negotiations
 *    - Money-back guarantee if engineer declines
 * 
 * 4. ENGINEER PLACEMENT (Partner Program)
 *    - Resellers/labels can white-label matching
 *    - $500/month for 100 projects
 *    - Custom branding and integrations
 * 
 * 5. ENTERPRISE MATCHING
 *    - Music labels: Unlimited matching for roster
 *    - Recording studios: Match projects to rooms/engineers
 *    - Universities: Match students to projects
 *    - Custom ML model per organization
 * 
 * Revenue Projection:
 * - Base tier subscription: $460K
 * - Matching feature add-on: +$60K
 * - Premium services: +$50K
 * - Enterprise: +$200K+
 * = $770K+ annual potential (10% penetration)
 */
