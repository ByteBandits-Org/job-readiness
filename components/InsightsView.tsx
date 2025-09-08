import React, { useMemo } from 'react';
import { AnalysisResult } from '../types';
import TargetIcon from './icons/TargetIcon';
import BriefcaseIcon from './icons/BriefcaseIcon';
import InfoIcon from './icons/InfoIcon';

interface InsightsViewProps {
    history: AnalysisResult[];
}

const InsightsView: React.FC<InsightsViewProps> = ({ history }) => {
    const insights = useMemo(() => {
        if (history.length < 2) return null;

        const skillCounts = new Map<string, number>();
        const streamCounts = new Map<string, number>();

        history.forEach(analysis => {
            analysis.skillRecommendations.forEach(rec => {
                skillCounts.set(rec.skill, (skillCounts.get(rec.skill) || 0) + 1);
            });
            analysis.careerStreams.forEach(stream => {
                streamCounts.set(stream.stream, (streamCounts.get(stream.stream) || 0) + 1);
            });
        });

        const topSkills = [...skillCounts.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([skill, count]) => ({ item: skill, count }));

        const topStreams = [...streamCounts.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([stream, count]) => ({ item: stream, count }));

        return { topSkills, topStreams };
    }, [history]);

    if (history.length < 2) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 py-16 text-center bg-surface dark:bg-dark-surface rounded-xl border border-border-color dark:border-dark-border shadow-sm">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                    <InfoIcon width={32} height={32}/>
                </div>
                <h3 className="text-xl font-bold text-primary dark:text-dark-primary">More Data Needed for Insights</h3>
                <p className="text-secondary dark:text-dark-secondary max-w-sm">
                    This page will automatically analyze trends from your reports once you have at least two entries in your Activity Log.
                </p>
            </div>
        );
    }

    if (!insights) return null;

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in-up">
            {/* Top Skill Gaps */}
            <div className="bg-surface dark:bg-dark-surface rounded-xl border border-border-color dark:border-dark-border p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                        <TargetIcon />
                    </div>
                    <h3 className="text-lg font-bold text-primary dark:text-dark-primary">Top Skill Gaps</h3>
                </div>
                <p className="text-sm text-secondary dark:text-dark-secondary mb-4">
                    These are the skills most frequently identified as gaps across all your analyzed job applications.
                </p>
                <ul className="space-y-2">
                    {insights.topSkills.map(({ item, count }) => (
                        <li key={item} className="flex justify-between items-center p-3 bg-background dark:bg-dark-background rounded-lg text-sm">
                            <span className="font-semibold text-primary dark:text-dark-primary">{item}</span>
                            <span className="text-xs font-medium bg-accent/20 text-accent px-2 py-1 rounded-full">
                                Recommended in {count} {count > 1 ? 'analyses' : 'analysis'}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Top Career Paths */}
            <div className="bg-surface dark:bg-dark-surface rounded-xl border border-border-color dark:border-dark-border p-6 shadow-sm">
                 <div className="flex items-center gap-3 mb-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                        <BriefcaseIcon />
                    </div>
                    <h3 className="text-lg font-bold text-primary dark:text-dark-primary">Top Career Paths</h3>
                </div>
                <p className="text-sm text-secondary dark:text-dark-secondary mb-4">
                    Based on your skills, these alternative career paths are most frequently suggested for you.
                </p>
                <ul className="space-y-2">
                    {insights.topStreams.map(({ item, count }) => (
                         <li key={item} className="flex justify-between items-center p-3 bg-background dark:bg-dark-background rounded-lg text-sm">
                            <span className="font-semibold text-primary dark:text-dark-primary">{item}</span>
                            <span className="text-xs font-medium bg-accent/20 text-accent px-2 py-1 rounded-full">
                                Suggested in {count} {count > 1 ? 'analyses' : 'analysis'}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
             {/* Simple CSS for animations */}
            <style>{`
                @keyframes fade-in-up {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
                }
                .animate-fade-in-up {
                animation: fade-in-up 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default InsightsView;
