import React from 'react';
import { CareerStream } from '../types';
import CompassIcon from './icons/CompassIcon';

interface CareerStreamsProps {
  streams: CareerStream[];
}

const CareerStreams: React.FC<CareerStreamsProps> = ({ streams }) => {
  if (!streams || streams.length === 0) {
    return null;
  }
  
  return (
    <div className="bg-surface dark:bg-dark-surface rounded-xl border border-border-color dark:border-dark-border p-6 shadow-sm h-full">
      <h3 className="text-lg font-bold text-primary dark:text-dark-primary mb-4">Alternative Career Paths</h3>
      <div className="space-y-3">
        {streams.map((stream, index) => (
          <div key={index} className="bg-background dark:bg-dark-background p-3 rounded-lg">
            <h4 className="font-semibold text-primary dark:text-dark-primary flex items-center gap-2 text-sm">
              <span className="text-accent"><CompassIcon /></span>
              {stream.stream}
            </h4>
            <p className="text-secondary dark:text-dark-secondary text-xs mt-1 pl-6">{stream.reason}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CareerStreams;