import React from 'react';
import ThemeToggle from './ThemeToggle';
import CalendarIcon from './icons/CalendarIcon';
import ClockIcon from './icons/ClockIcon';
import BellIcon from './icons/BellIcon';

type ActiveView = 'home' | 'activity' | 'insights' | 'wellness';

interface DashboardHeaderProps {
    name?: string;
    activeView: ActiveView;
    showResetButton: boolean;
    onReset: () => void;
}

const viewTitles = {
    home: {
        title: (name?: string) => name ? `Hello, ${name}!` : 'Smart Job-Readiness Coach',
        subtitle: 'Here is your personalized feedback and coaching plan.'
    },
    activity: {
        title: () => 'Activity Log',
        subtitle: 'Review your past analysis reports and coaching sessions.'
    },
    insights: {
        title: () => 'Career Insights',
        subtitle: 'Discover trends and opportunities based on your activity.'
    },
    wellness: {
        title: () => 'Your Wellness Space',
        subtitle: 'A place to manage stress, track your mood, and find balance.'
    }
};


const DashboardHeader: React.FC<DashboardHeaderProps> = ({ name, activeView, showResetButton, onReset }) => {
    const today = new Date();
    const dateString = today.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
     const timeString = today.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });

    const { title, subtitle } = viewTitles[activeView];


    return (
        <header className="bg-gradient-to-r from-header-start to-header-end text-white rounded-b-2xl shadow-lg sticky top-0 z-10">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold">
                           {title(name)}
                        </h2>
                        <p className="text-sm text-gray-200 mt-1">
                            {subtitle}
                        </p>
                    </div>
                     <div className="flex items-center gap-4">
                        {showResetButton && activeView === 'home' && (
                            <button
                            onClick={onReset}
                            className="px-4 py-2 text-sm font-semibold bg-white/20 text-white rounded-md hover:bg-white/30 transition-colors duration-300"
                            >
                            New Analysis
                            </button>
                        )}
                        <ThemeToggle />
                        <button className="p-2 rounded-full hover:bg-white/20 transition-colors" aria-label="Notifications">
                            <BellIcon />
                        </button>
                    </div>
                </div>

                <div className="flex justify-end items-center bg-black/20 backdrop-blur-sm rounded-lg px-4 py-2 text-sm">
                   <div className="hidden md:flex items-center gap-6 text-gray-200">
                        <div className="flex items-center gap-2">
                            <CalendarIcon />
                            <span>{dateString}</span>
                        </div>
                         <div className="flex items-center gap-2">
                            <ClockIcon />
                            <span>{timeString}</span>
                        </div>
                   </div>
                </div>
            </div>
        </header>
    );
};

export default DashboardHeader;