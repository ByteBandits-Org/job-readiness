import React from 'react';
import { CVStructureExample } from '../types';
import WandIcon from './icons/WandIcon';

interface CVStructureTipProps {
  tip: CVStructureExample;
}

const CVStructureTip: React.FC<CVStructureTipProps> = ({ tip }) => {
  const cleanedAfter = tip.after.replace(/\*\*/g, '').replace(/^\s*[\*\-]\s+/gm, '');

  return (
    <div className="bg-surface dark:bg-dark-surface rounded-xl border border-border-color dark:border-dark-border p-6 shadow-sm h-full">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
            <WandIcon />
        </div>
        <h3 className="text-lg font-bold text-primary dark:text-dark-primary">CV Pro-Tip</h3>
      </div>
      <p className="text-secondary dark:text-dark-secondary mb-6 text-sm">{tip.tip}</p>
      
      <div className="space-y-4">
        {/* Before */}
        <div>
          <h4 className="font-semibold text-red-500 text-xs uppercase tracking-wider mb-2">Before</h4>
          <pre className="bg-red-500/10 p-3 rounded-lg text-sm text-red-500/80 whitespace-pre-wrap font-sans">
            {tip.before}
          </pre>
        </div>
        
        {/* After */}
        <div>
          <h4 className="font-semibold text-green-500 text-xs uppercase tracking-wider mb-2">After</h4>
          <pre className="bg-green-500/10 p-3 rounded-lg text-sm text-green-500/80 whitespace-pre-wrap font-sans">
            {cleanedAfter}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default CVStructureTip;