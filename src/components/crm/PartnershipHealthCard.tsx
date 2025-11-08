import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle2, Target } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { PartnershipHealth, PartnershipMetrics } from '@/types/partnership';

interface PartnershipHealthCardProps {
    partnership: { partner_name?: string; id?: string };
    health?: PartnershipHealth;
    metrics?: PartnershipMetrics;
    isLoading?: boolean;
}/**
 * PartnershipHealthCard Component
 * 
 * Displays comprehensive partnership health metrics including:
 * - Overall health score (0-100)
 * - Component scores (activity, payment reliability, communication, milestones)
 * - Trend indicators
 * - Risk assessment with recommendations
 * - Visual health gauge
 */
export const PartnershipHealthCard: React.FC<PartnershipHealthCardProps> = ({
    partnership,
    health,
    metrics,
    isLoading = false,
}) => {
    const [healthData, setHealthData] = useState<PartnershipHealth | null>(health || null);

    useEffect(() => {
        if (health) {
            setHealthData(health);
        }
    }, [health]);

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Partnership Health</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!healthData) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Partnership Health</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-gray-500">No health data available yet</p>
                </CardContent>
            </Card>
        );
    }

    const healthScore = healthData.health_score || 0;
    const riskLevel = healthData.risk_level || 'unknown';

    // Determine health status color and label
    const getHealthStatus = (score: number) => {
        if (score >= 80) return { label: 'Excellent', color: 'bg-green-500', textColor: 'text-green-700' };
        if (score >= 60) return { label: 'Good', color: 'bg-blue-500', textColor: 'text-blue-700' };
        if (score >= 40) return { label: 'Fair', color: 'bg-yellow-500', textColor: 'text-yellow-700' };
        return { label: 'Poor', color: 'bg-red-500', textColor: 'text-red-700' };
    };

    const healthStatus = getHealthStatus(healthScore);

    // Determine risk level color
    const getRiskColor = (risk: string) => {
        switch (risk) {
            case 'high':
                return 'destructive';
            case 'medium':
                return 'secondary';
            case 'low':
                return 'default';
            default:
                return 'outline';
        }
    };

    // Component scores
    const scores = {
        activity: healthData.activity_level || 0,
        payment: healthData.payment_reliability || 0,
        communication: healthData.communication_quality || 0,
        milestones: healthData.milestone_completion || 0,
    };

    // Calculate trend (simulated based on metrics)
    const trend = metrics && metrics.collaboration_frequency > 3 ? 'up' : 'down';

    return (
        <Card className="col-span-1">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle>Partnership Health</CardTitle>
                        <CardDescription>
                            {partnership?.partner_name || 'Partnership'} · Last assessed{' '}
                            {healthData.last_assessed
                                ? new Date(healthData.last_assessed).toLocaleDateString()
                                : 'never'}
                        </CardDescription>
                    </div>
                    <Badge variant={getRiskColor(riskLevel)} className="capitalize">
                        {riskLevel} Risk
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Health Score Gauge */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Overall Health Score</span>
                        <div className="flex items-center gap-2">
                            <span className={`text-2xl font-bold ${healthStatus.textColor}`}>
                                {Math.round(healthScore)}
                            </span>
                            <span className="text-xs text-gray-500">/100</span>
                        </div>
                    </div>
                    <Progress value={healthScore} className="h-3" />
                    <p className={`text-xs font-medium ${healthStatus.textColor}`}>{healthStatus.label}</p>
                </div>

                {/* Trend Indicator */}
                <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50">
                    {trend === 'up' ? (
                        <>
                            <TrendingUp className="w-4 h-4 text-green-600" />
                            <span className="text-sm font-medium text-green-700">
                                Partnership improving
                            </span>
                        </>
                    ) : (
                        <>
                            <TrendingDown className="w-4 h-4 text-red-600" />
                            <span className="text-sm font-medium text-red-700">
                                Partnership needs attention
                            </span>
                        </>
                    )}
                </div>

                {/* Component Scores */}
                <div className="space-y-3">
                    <h4 className="text-sm font-semibold">Component Scores</h4>

                    {/* Activity Level */}
                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-medium text-gray-700">Activity Level</label>
                            <span className="text-xs font-semibold text-gray-900">{Math.round(scores.activity)}</span>
                        </div>
                        <Progress value={scores.activity} className="h-2" />
                    </div>

                    {/* Payment Reliability */}
                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-medium text-gray-700">Payment Reliability</label>
                            <span className="text-xs font-semibold text-gray-900">{Math.round(scores.payment)}</span>
                        </div>
                        <Progress value={scores.payment} className="h-2" />
                    </div>

                    {/* Communication Quality */}
                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-medium text-gray-700">Communication Quality</label>
                            <span className="text-xs font-semibold text-gray-900">{Math.round(scores.communication)}</span>
                        </div>
                        <Progress value={scores.communication} className="h-2" />
                    </div>

                    {/* Milestone Completion */}
                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-medium text-gray-700">Milestone Completion</label>
                            <span className="text-xs font-semibold text-gray-900">{Math.round(scores.milestones)}</span>
                        </div>
                        <Progress value={scores.milestones} className="h-2" />
                    </div>
                </div>

                {/* Recommendations */}
                {healthData.recommendations && healthData.recommendations.length > 0 && (
                    <div className="space-y-2 p-3 rounded-lg bg-blue-50 border border-blue-200">
                        <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-blue-600" />
                            <h4 className="text-sm font-semibold text-blue-900">Recommendations</h4>
                        </div>
                        <ul className="space-y-1">
                            {healthData.recommendations.slice(0, 3).map((rec, idx) => (
                                <li key={idx} className="text-xs text-blue-800 flex items-start gap-2">
                                    <span className="flex-shrink-0 w-4 h-4 rounded-full bg-blue-300 flex items-center justify-center text-blue-900 text-xs">
                                        {idx + 1}
                                    </span>
                                    <span>{rec}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Metrics Summary */}
                {metrics && (
                    <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-gray-50">
                        <div>
                            <p className="text-xs text-gray-600">Projects</p>
                            <p className="text-lg font-bold text-gray-900">
                                {metrics.total_projects}/{metrics.completed_projects}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-600">Success Rate</p>
                            <p className="text-lg font-bold text-gray-900">
                                {Math.round(metrics.success_rate * 100)}%
                            </p>
                        </div>
                    </div>
                )}

                {/* Status Indicator */}
                <div className="flex items-center gap-2 pt-2 border-t">
                    {healthScore >= 60 ? (
                        <>
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            <span className="text-xs font-medium text-green-700">
                                Partnership is healthy
                            </span>
                        </>
                    ) : (
                        <>
                            <AlertCircle className="w-4 h-4 text-yellow-600" />
                            <span className="text-xs font-medium text-yellow-700">
                                Consider action items
                            </span>
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default PartnershipHealthCard;
