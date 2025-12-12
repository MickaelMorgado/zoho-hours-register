'use client';

import React, { useState, useEffect } from 'react';
import { dataProvider } from '@/lib/dataProvider';

interface Checkpoint {
  id: number;
  startTime: Date;
  endTime: Date | null;
  duration: string;
  description: string;
  isRunning: boolean;
}

export const TimerPanel: React.FC = () => {
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [currentCheckpoint, setCurrentCheckpoint] = useState<Checkpoint | null>(null);
  const [inputValues, setInputValues] = useState<Record<number | string, string>>({});

  const checkpointsManager = dataProvider.getCheckpointsManager();

  // Update current checkpoint duration every second
  useEffect(() => {
    const interval = setInterval(() => {
      if (currentCheckpoint) {
        const now = new Date();
        const duration = calculateDuration(currentCheckpoint.startTime, now);
        setCurrentCheckpoint(prev => prev ? { ...prev, duration } : null);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [currentCheckpoint]);

  const handleAddCheckpoint = () => {
    checkpointsManager.addCheckpoint(checkpoints, setCheckpoints, currentCheckpoint, setCurrentCheckpoint);
  };

  const handleUpdateDescription = (checkpointId: number | string, description: string) => {
    if (checkpointId === 'current' && currentCheckpoint) {
      setCurrentCheckpoint(prev => prev ? { ...prev, description } : null);
    } else {
      setCheckpoints(prev =>
        prev.map(cp =>
          cp.id === checkpointId ? { ...cp, description } : cp
        )
      );
    }
  };

  const allCheckpoints = [...checkpoints];
  if (currentCheckpoint) {
    allCheckpoints.push(currentCheckpoint);
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mt-8">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Time Tracking Checkpoints</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Track your work sessions and time spent on tasks</p>
      </div>
      <div className="p-6">
        <div className="space-y-6">
          {/* Add Checkpoint Button */}
          <div className="flex justify-center">
            <button
              onClick={handleAddCheckpoint}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>{currentCheckpoint ? 'End & Start New Checkpoint' : 'Start Checkpoint'}</span>
            </button>
          </div>

          {/* Current Checkpoint */}
          {currentCheckpoint && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-800 dark:text-green-200">Currently Running</span>
                </div>
                <span className="text-lg font-mono font-bold text-green-800 dark:text-green-200">
                  {currentCheckpoint.duration}
                </span>
              </div>
              <input
                type="text"
                placeholder="Describe what you're working on..."
                value={currentCheckpoint.description}
                onChange={(e) => handleUpdateDescription('current', e.target.value)}
                className="w-full px-3 py-2 border border-green-300 dark:border-green-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          )}

          {/* Checkpoints List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {allCheckpoints
              .filter(cp => !cp.isRunning) // Only show completed checkpoints
              .sort((a, b) => b.startTime.getTime() - a.startTime.getTime()) // Most recent first
              .map((checkpoint, index) => (
                <div
                  key={checkpoint.id}
                  className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        #{allCheckpoints.length - index}
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {checkpointsManager.formatTime(checkpoint.startTime)} - {checkpoint.endTime ? checkpointsManager.formatTime(checkpoint.endTime) : '--:--:--'}
                      </span>
                    </div>
                    <span className="text-sm font-mono font-bold text-gray-900 dark:text-white">
                      {checkpoint.duration}
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder="Add description..."
                    value={checkpoint.description}
                    onChange={(e) => handleUpdateDescription(checkpoint.id, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
          </div>

          {/* Empty State */}
          {allCheckpoints.length === 0 && (
            <div className="text-center py-12">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-500 dark:text-gray-400 mb-2">No checkpoints yet</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">Click the button above to start tracking your time</p>
            </div>
          )}

          {/* Summary */}
          {allCheckpoints.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Total Checkpoints: <span className="font-semibold">{allCheckpoints.length}</span>
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Completed Sessions: <span className="font-semibold">{checkpoints.length}</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper function for duration calculation
function calculateDuration(startTime: Date, endTime: Date): string {
  const duration = endTime.getTime() - startTime.getTime();
  const hours = Math.floor(duration / (1000 * 60 * 60));
  const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((duration % (1000 * 60)) / 1000);

  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}
