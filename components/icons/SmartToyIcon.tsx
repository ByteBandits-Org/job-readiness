import React from 'react';

const SmartToyIcon: React.FC = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <rect x="6" y="11" width="12" height="10" rx="2" />
        <path d="M12 7a2 2 0 1 0-4 0" />
        <path d="M12 7a2 2 0 1 1 4 0" />
        <path d="M7 11v-1a5 5 0 0 1 10 0v1" />
    </svg>
);

export default SmartToyIcon;