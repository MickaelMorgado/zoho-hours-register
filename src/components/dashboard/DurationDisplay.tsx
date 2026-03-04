'use client';

import React, { useEffect, useState, useMemo } from 'react';

interface DurationDisplayProps {
  startTime: Date;
  isRunning: boolean;
  /** For stopped checkpoints, pass the end time so duration recalculates when times are edited */
  endTime?: Date | null;
}

export const DurationDisplay: React.FC<DurationDisplayProps> = ({ startTime, isRunning, endTime }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Calculate duration based on props and current time
  const duration = useMemo(() => {
    const end = isRunning ? currentTime : (endTime ?? currentTime);
    return calculateDuration(startTime, end);
  }, [startTime, currentTime, isRunning, endTime]);

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
