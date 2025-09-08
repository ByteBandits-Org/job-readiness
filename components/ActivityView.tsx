import React, { useState, useMemo } from 'react';
import { AnalysisResult } from '../types';
import EyeIcon from './icons/EyeIcon';
import SortIcon from './icons/SortIcon';
import InfoIcon from './icons/InfoIcon';

interface ActivityViewProps {
    history: AnalysisResult[];
    onViewReport: (id: string) => void;
}

const ActivityView: React.FC<ActivityViewProps> = ({ history, onViewReport }) => {
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

    const sortedHistory = useMemo(() => {
        return [...history].sort((a, b) => {
            const dateA = new Date(a.date).getTime();
            const dateB = new Date(b.date).getTime();
            return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });
    }, [history, sortOrder]);

    const toggleSortOrder = () => {
        setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
    };
    
    if (history.length === 0) {
        return (
             <div className="flex flex-col items-center justify-center gap-4 py-16 text-center bg-surface dark:bg-dark-surface rounded-xl border border-border-color dark:border-dark-border shadow-sm">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                    <InfoIcon width={32} height={32}/>
                </div>
                <h3 className="text-xl font-bold text-primary dark:text-dark-primary">No Activity Yet</h3>
                <p className="text-secondary dark:text-dark-secondary max-w-sm">
                    Perform your first CV analysis on the 'Home' tab. Your past reports will appear here for you to review anytime.
                </p>
            </div>
        )
    }

    return (
        <div className="bg-surface dark:bg-dark-surface rounded-xl border border-border-color dark:border-dark-border shadow-sm animate-fade-in-up">
            <div className="p-4 border-b border-border-color dark:border-dark-border flex justify-between items-center">
                <h3 className="text-lg font-bold text-primary dark:text-dark-primary">Analysis History ({history.length})</h3>
                <button
                    onClick={toggleSortOrder}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-200 bg-gray-100 dark:bg-slate-700 text-secondary dark:text-dark-secondary hover:bg-gray-200 dark:hover:bg-slate-600"
                    aria-label={`Sort by date ${sortOrder === 'desc' ? 'ascending' : 'descending'}`}
                >
                    <SortIcon />
                    <span>Date ({sortOrder === 'desc' ? 'Newest' : 'Oldest'})</span>
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-background dark:bg-dark-background text-xs text-secondary dark:text-dark-secondary uppercase">
                        <tr>
                            <th scope="col" className="px-6 py-3">Job Title</th>
                            <th scope="col" className="px-6 py-3">Analysis Date</th>
                            <th scope="col" className="px-6 py-3 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedHistory.map(item => (
                            <tr key={item.id} className="border-b border-border-color dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-background/50 transition-colors">
                                <td className="px-6 py-4 font-medium text-primary dark:text-dark-primary whitespace-nowrap">{item.jobTitle}</td>
                                <td className="px-6 py-4 text-secondary dark:text-dark-secondary">
                                    {new Date(item.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button 
                                        onClick={() => onViewReport(item.id)}
                                        className="inline-flex items-center gap-2 px-4 py-2 font-semibold bg-accent text-white rounded-lg hover:bg-accent-hover transition-opacity duration-300 shadow-sm text-xs"
                                    >
                                        <EyeIcon />
                                        View Report
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
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

export default ActivityView;
