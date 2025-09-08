import React from 'react';
import HomeIcon from './icons/HomeIcon';
import ActivityIcon from './icons/ActivityIcon';
import InsightsIcon from './icons/InsightsIcon';
import SettingsIcon from './icons/SettingsIcon';
import SupportIcon from './icons/SupportIcon';
import LogoutIcon from './icons/LogoutIcon';
import HeartHandIcon from './icons/HeartHandIcon';
import CoachIcon from './icons/CoachIcon';

type ActiveView = 'home' | 'activity' | 'insights' | 'wellness';

interface NavItemProps {
    icon: React.ReactNode;
    label: string;
    active?: boolean;
    onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors duration-200 text-left ${
      active
        ? 'bg-accent/10 text-accent font-semibold'
        : 'text-secondary hover:bg-gray-100 dark:text-dark-secondary dark:hover:bg-dark-surface'
    }`}
  >
    {icon}
    <span className="text-sm font-medium">{label}</span>
  </button>
);

interface SidebarProps {
    activeView: ActiveView;
    setActiveView: (view: ActiveView) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView }) => {
  return (
    <aside className="w-64 bg-surface dark:bg-dark-surface border-r border-border-color dark:border-dark-border flex-shrink-0 hidden lg:flex flex-col">
      <div className="h-20 flex items-center px-6 border-b border-border-color dark:border-dark-border">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-white">
            <CoachIcon />
          </div>
          <h1 className="text-lg font-bold text-primary dark:text-dark-primary">
            AI Coach
          </h1>
        </div>
      </div>
      
      <nav id="tour-step-4" className="flex-1 px-4 py-6 space-y-2">
        <NavItem icon={<HomeIcon />} label="Home" active={activeView === 'home'} onClick={() => setActiveView('home')} />
        <NavItem icon={<ActivityIcon />} label="Activity" active={activeView === 'activity'} onClick={() => setActiveView('activity')} />
        <NavItem icon={<InsightsIcon />} label="Insights" active={activeView === 'insights'} onClick={() => setActiveView('insights')} />
        <NavItem icon={<HeartHandIcon />} label="Wellness" active={activeView === 'wellness'} onClick={() => setActiveView('wellness')} />
      </nav>

      <div className="px-4 py-6 border-t border-border-color dark:border-dark-border">
         <div className="space-y-2 mb-6">
            <NavItem icon={<SettingsIcon />} label="Settings" onClick={() => {}} />
            <NavItem icon={<SupportIcon />} label="Support" onClick={() => {}} />
            <NavItem icon={<LogoutIcon />} label="Logout" onClick={() => {}} />
         </div>
        <div className="bg-background dark:bg-dark-background rounded-lg p-4 flex items-center space-x-4">
            <img
                className="w-10 h-10 rounded-full"
                src="https://i.pravatar.cc/150?u=a042581f4e29026704d"
                alt="User avatar"
            />
            <div>
                <p className="text-sm font-semibold text-primary dark:text-dark-primary">Sebastian M.</p>
                <p className="text-xs text-secondary dark:text-dark-secondary">Senior Admin</p>
            </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;