import React from 'react';
import { SkillRecommendation } from '../types';
import SparklesIcon from './icons/SparklesIcon';

interface SkillRecommendationsProps {
  recommendations: SkillRecommendation[];
}

const SkillRecommendations: React.FC<SkillRecommendationsProps> = ({ recommendations }) => {
  return (
    <div className="bg-surface dark:bg-dark-surface rounded-xl border border-border-color dark:border-dark-border p-6 shadow-sm h-full">
      <h3 className="text-lg font-bold text-primary dark:text-dark-primary mb-4">Top Skill Recommendations</h3>
      <div className="space-y-3">
        {recommendations.map((rec, index) => (
          <div key={index} className="bg-background dark:bg-dark-background p-3 rounded-lg">
            <h4 className="font-semibold text-primary dark:text-dark-primary flex items-center gap-2 text-sm">
              <span className="text-accent"><SparklesIcon /></span>
              {rec.skill}
            </h4>
            <p className="text-secondary dark:text-dark-secondary text-xs mt-1 pl-6">{rec.recommendation}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SkillRecommendations;