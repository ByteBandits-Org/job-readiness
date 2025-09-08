import React from 'react';
import LightbulbIcon from './icons/LightbulbIcon';

interface CVFeedbackProps {
  feedback: string[];
  name: string;
}

const CVFeedback: React.FC<CVFeedbackProps> = ({ feedback, name }) => {
  return (
    <div className="bg-surface dark:bg-dark-surface rounded-xl border border-border-color dark:border-dark-border p-6 shadow-sm">
      <h3 className="text-lg font-bold text-primary dark:text-dark-primary mb-4">Actionable Feedback for {name}</h3>
      <ul className="space-y-3">
        {feedback.map((item, index) => (
          <li key={index} className="flex items-start gap-3 p-3 bg-background dark:bg-dark-background rounded-lg">
            <div className="text-yellow-500 mt-1 flex-shrink-0">
                <LightbulbIcon />
            </div>
            <p className="text-secondary dark:text-dark-secondary text-sm">{item}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default CVFeedback;