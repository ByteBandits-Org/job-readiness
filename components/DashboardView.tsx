import React from 'react';
import { AnalysisResult } from '../types';
import CVFeedback from './ResumeFeedback';
import SkillRecommendations from './SkillRecommendations';
import InterviewCoach from './InterviewCoach';
import CareerStreams from './CareerStreams';
import CVStructureTip from './CVStructureTip';
import CompanyInsights from './CompanyInsights';

interface DashboardViewProps {
  result: AnalysisResult;
}

const DashboardView: React.FC<DashboardViewProps> = ({ result }) => {
  return (
    <div className="animate-fade-in-up">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Main Content */}
        <div className="flex-grow flex flex-col gap-8">
          <CVFeedback feedback={result.cvFeedback} name={result.name} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <SkillRecommendations recommendations={result.skillRecommendations} />
            <CareerStreams streams={result.careerStreams} />
          </div>

          <CompanyInsights jobDescription={result.jobDescription} />
        </div>

        {/* Right Sidebar */}
        <div className="w-full lg:w-96 lg:flex-shrink-0 flex flex-col gap-8">
           {result.cvStructureTip && (
             <CVStructureTip tip={result.cvStructureTip} />
           )}
        </div>

      </div>

      {/* Interview coach full width below */}
      <div className="mt-8">
        <InterviewCoach jobDescription={result.jobDescription} />
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

export default DashboardView;