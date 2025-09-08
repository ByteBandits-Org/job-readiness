import React, { useState, useEffect, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom';

interface OnboardingTourProps {
    onFinish: () => void;
}

interface TourStep {
    targetId: string | null;
    title: string;
    content: string;
    placement: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

const tourConfig: TourStep[] = [
    {
        targetId: null,
        title: "Welcome to your AI Coach!",
        content: "Let's take a quick tour to see how you can get the most out of the platform.",
        placement: 'center',
    },
    {
        targetId: "tour-step-1",
        title: "1. Provide Your CV",
        content: "Start by uploading or pasting your CV here. This gives the AI the context of your skills and experience.",
        placement: 'right'
    },
    {
        targetId: "tour-step-2",
        title: "2. Add the Job Description",
        content: "Next, paste the description for the job you're targeting. The more detail, the better the analysis!",
        placement: 'left'
    },
    {
        targetId: "tour-step-3",
        title: "3. Get Your Analysis",
        content: "Click here to start the analysis. You'll get a personalized dashboard with feedback, skill recommendations, and more.",
        placement: 'top'
    },
    {
        targetId: "tour-step-4",
        title: "Explore the App",
        content: "Use the sidebar to navigate to your past reports (Activity), discover trends (Insights), and access tools to manage stress (Wellness).",
        placement: 'right'
    },
    {
        targetId: null,
        title: "You're All Set!",
        content: "You're ready to go. Let's get you prepared for your next big opportunity. Good luck!",
        placement: 'center',
    },
];

const OnboardingTour: React.FC<OnboardingTourProps> = ({ onFinish }) => {
    const [stepIndex, setStepIndex] = useState(0);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

    const currentStep = tourConfig[stepIndex];
    const isModal = !currentStep.targetId;

    useLayoutEffect(() => {
        if (currentStep.targetId) {
            const element = document.getElementById(currentStep.targetId);
            if (element) {
                setTargetRect(element.getBoundingClientRect());
            }
        } else {
            setTargetRect(null);
        }
    }, [stepIndex, currentStep.targetId]);

    useEffect(() => {
        const handleResize = () => {
            if (currentStep.targetId) {
                const element = document.getElementById(currentStep.targetId);
                if (element) {
                    setTargetRect(element.getBoundingClientRect());
                }
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [currentStep.targetId]);

    const handleNext = () => {
        if (stepIndex < tourConfig.length - 1) {
            setStepIndex(stepIndex + 1);
        } else {
            onFinish();
        }
    };
    
    const handlePrev = () => {
        if (stepIndex > 0) {
            setStepIndex(stepIndex - 1);
        }
    };

    const getTooltipStyle = (): React.CSSProperties => {
        if (!targetRect) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
    
        const offset = 12;
        switch (currentStep.placement) {
            case 'top':
                return { top: targetRect.top - offset, left: targetRect.left + targetRect.width / 2, transform: 'translate(-50%, -100%)' };
            case 'bottom':
                return { top: targetRect.bottom + offset, left: targetRect.left + targetRect.width / 2, transform: 'translate(-50%, 0)' };
            case 'left':
                return { top: targetRect.top + targetRect.height / 2, left: targetRect.left - offset, transform: 'translate(-100%, -50%)' };
            case 'right':
                return { top: targetRect.top + targetRect.height / 2, left: targetRect.right + offset, transform: 'translate(0, -50%)' };
            default:
                return {};
        }
    };
    
    const spotlightStyle: React.CSSProperties = targetRect ? {
        position: 'absolute',
        top: targetRect.top - 8,
        left: targetRect.left - 8,
        width: targetRect.width + 16,
        height: targetRect.height + 16,
        borderRadius: '8px',
        boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.8)',
        transition: 'all 0.3s ease-in-out',
        zIndex: 9998
    } : {};


    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[9999]">
            {/* Spotlight element */}
            {!isModal && <div style={spotlightStyle}></div>}

            {/* Backdrop for modal steps */}
            {isModal && <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm"></div>}

            {/* Tooltip / Modal Content */}
            <div 
                style={isModal ? undefined : getTooltipStyle()} 
                className={`fixed w-80 bg-dark-surface text-dark-primary p-5 rounded-lg shadow-2xl transition-all duration-300 z-[9999] ${isModal ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' : ''}`}
                role="dialog"
                aria-labelledby="tour-title"
                aria-describedby="tour-content"
            >
                <h3 id="tour-title" className="font-bold text-lg mb-2">{currentStep.title}</h3>
                <p id="tour-content" className="text-sm text-dark-secondary mb-4">{currentStep.content}</p>
                
                <div className="flex justify-between items-center">
                    <button onClick={onFinish} className="text-xs text-dark-secondary hover:underline">
                        Skip Tour
                    </button>
                    <div className="flex items-center gap-2">
                        {stepIndex > 0 && (
                             <button onClick={handlePrev} className="px-3 py-1.5 text-sm font-semibold bg-slate-700 text-dark-primary rounded-md hover:bg-slate-600 transition-colors">
                                Prev
                            </button>
                        )}
                        <button onClick={handleNext} className="px-4 py-1.5 text-sm font-semibold bg-accent text-white rounded-md hover:bg-accent-hover transition-colors">
                            {stepIndex === tourConfig.length - 1 ? 'Finish' : 'Next'}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default OnboardingTour;