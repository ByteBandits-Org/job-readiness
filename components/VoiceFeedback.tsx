import React from 'react';
import { VoiceFeedbackData } from '../types';
import SoundWaveIcon from './icons/SoundWaveIcon';
import SpeedometerIcon from './icons/SpeedometerIcon';
import MessageCircleIcon from './icons/MessageCircleIcon';
import StarIcon from './icons/StarIcon';

interface VoiceFeedbackProps {
    feedback: VoiceFeedbackData;
}

const VoiceFeedback: React.FC<VoiceFeedbackProps> = ({ feedback }) => {
    return (
        <div className="mt-3 border-t border-gray-500/30 dark:border-dark-border pt-3">
            <h4 className="font-semibold text-xs text-secondary dark:text-dark-secondary flex items-center gap-2 mb-2 uppercase">
                <SoundWaveIcon />
                Vocal Delivery
            </h4>
            <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2">
                    <div className="text-blue-400 mt-0.5"><SpeedometerIcon /></div>
                    <div>
                        <span className="font-semibold text-secondary dark:text-dark-secondary/90">Pace:</span>
                        <p className="text-secondary/80 dark:text-dark-secondary/70">{feedback.pace}</p>
                    </div>
                </div>
                <div className="flex items-start gap-2">
                    <div className="text-green-400 mt-0.5"><MessageCircleIcon /></div>
                    <div>
                        <span className="font-semibold text-secondary dark:text-dark-secondary/90">Clarity:</span>
                        <p className="text-secondary/80 dark:text-dark-secondary/70">{feedback.clarity}</p>
                    </div>
                </div>
                <div className="flex items-start gap-2">
                    <div className="text-yellow-400 mt-0.5"><StarIcon /></div>
                    <div>
                        <span className="font-semibold text-secondary dark:text-dark-secondary/90">Confidence:</span>
                        <p className="text-secondary/80 dark:text-dark-secondary/70">{feedback.confidence}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VoiceFeedback;