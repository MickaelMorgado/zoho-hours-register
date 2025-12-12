'use client';

import React, { useEffect, useState, useMemo } from 'react';

interface DurationDisplayProps {
  startTime: Date;
  isRunning: boolean;
}

export const DurationDisplay: React.FC<DurationDisplayProps> = ({ startTime, isRunning }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Calculate duration based on props and current time
  const duration = useMemo(() => {
    return calculateDuration(startTime, currentTime);
  }, [startTime, currentTime, isRunning]);

  useEffect(() => {
    if (!isRunning) return;

    // For running checkpoints, update every second
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  return <span className="font-mono">{duration}</span>;
};

// Helper function for duration calculation
function calculateDuration(startTime: Date, endTime: Date): string {
  const duration = endTime.getTime() - startTime.getTime();
  const hours = Math.floor(duration / (1000 * 60 * 60));
  const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((duration % (1000 * 60)) / 1000);

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}
