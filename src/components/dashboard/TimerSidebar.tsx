'use client';

import { dataProvider } from '@/lib/dataProvider';
import { Save } from 'lucide-react';
import React, { useRef, useState } from 'react';
import { DurationDisplay } from './DurationDisplay';

interface Checkpoint {
  id: number;
  startTime: Date;
  endTime: Date | null;
  duration: string;
  description: string;
  isRunning: boolean;
  displayNumber?: number;
}

interface TimerSidebarProps {
  onSaveCheckpoint?: (checkpoint: Checkpoint) => void;
  onUpdateCheckpoint?: (checkpointId: number | string, description: string) => void;
  currentView?: 'dashboard' | 'task-matching';
  savedCheckpointId?: number | string | null;
}

export const TimerSidebar: React.FC<TimerSidebarProps> = ({
  onSaveCheckpoint,
  onUpdateCheckpoint,
  currentView = 'dashboard',
  savedCheckpointId = null
}) => {
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [currentCheckpoint, setCurrentCheckpoint] = useState<Checkpoint | null>(null);
  const [inputValues, setInputValues] = useState<Record<string | number, string>>({});
  const scrollableContainerRef = useRef<HTMLDivElement>(null);

  const checkpointsManager = dataProvider.getCheckpointsManager();

  // Load checkpoints from localStorage on component mount
  React.useEffect(() => {
    const savedCheckpoints = localStorage.getItem('zoho-checkpoints');
    const savedCurrentCheckpoint = localStorage.getItem('current-checkpoint');

    if (savedCheckpoints) {
      try {
        const parsed = JSON.parse(savedCheckpoints);
        const loadedCheckpoints = parsed.map((cp: any) => ({
          ...cp,
          startTime: new Date(cp.startTime),
          endTime: cp.endTime ? new Date(cp.endTime) : cp.endTime,
          description: cp.description || ''
        }));
        setCheckpoints(loadedCheckpoints);
      } catch (e) {
        console.error('Error loading checkpoints:', e);
      }
    }

    if (savedCurrentCheckpoint) {
      try {
        const parsed = JSON.parse(savedCurrentCheckpoint);
        const loadedCurrentCheckpoint = {
          ...parsed,
          startTime: new Date(parsed.startTime),
          endTime: parsed.endTime ? new Date(parsed.endTime) : null,
          description: parsed.description || ''
        };
        setCurrentCheckpoint(loadedCurrentCheckpoint);
      } catch (e) {
        console.error('Error loading current checkpoint:', e);
      }
    }
  }, []);

  // Save checkpoints to localStorage whenever they change
  React.useEffect(() => {
    localStorage.setItem('zoho-checkpoints', JSON.stringify(checkpoints));
  }, [checkpoints]);

  // Save current checkpoint to localStorage whenever it changes
  React.useEffect(() => {
    if (currentCheckpoint) {
      localStorage.setItem('current-checkpoint', JSON.stringify({
        ...currentCheckpoint,
        startTime: currentCheckpoint.startTime.toISOString()
      }));
    } else {
      localStorage.removeItem('current-checkpoint');
    }
  }, [currentCheckpoint]);

  const handleAddCheckpoint = () => {
    checkpointsManager.addCheckpoint(checkpoints, setCheckpoints, currentCheckpoint, setCurrentCheckpoint);
    // Scroll to bottom to show the new active checkpoint
    setTimeout(() => {
      if (scrollableContainerRef.current) {
        scrollableContainerRef.current.scrollTo({
          top: scrollableContainerRef.current.scrollHeight,
          behavior: 'smooth'
        });
      }
    }, 100); // Small delay to ensure DOM updates
  };

  const handleClearAllCheckpoints = () => {
    const totalCheckpoints = checkpoints.length + (currentCheckpoint ? 1 : 0);

    if (window.confirm(`Are you sure you want to clear all ${totalCheckpoints} checkpoint(s)? This action cannot be undone.`)) {
      setCheckpoints([]);
      setCurrentCheckpoint(null);
    }
  };

  const handleUpdateDescription = (checkpointId: number | string, description: string) => {
    // Update input values state immediately for responsive UI
    setInputValues(prev => ({ ...prev, [checkpointId]: description }));

    // Update the actual checkpoint data
    let updatedCheckpoint: Checkpoint | null = null;
    if (checkpointId === 'current' && currentCheckpoint) {
      updatedCheckpoint = { ...currentCheckpoint, description };
      setCurrentCheckpoint(updatedCheckpoint);
    } else {
      setCheckpoints(prev =>
        prev.map(cp => {
          if (cp.id === checkpointId) {
            updatedCheckpoint = { ...cp, description };
            return updatedCheckpoint;
          }
          return cp;
        })
      );
    }

    // Notify parent component for all checkpoint updates
    if (updatedCheckpoint && onUpdateCheckpoint) {
      onUpdateCheckpoint(checkpointId, description);
    }
  };

  // Initialize input values for new checkpoints and sync with current descriptions
  // Only set defaults for checkpoints that don't already have custom input values
  React.useEffect(() => {
    setInputValues(prev => {
      const newValues = { ...prev };
      checkpoints.forEach(cp => {
        if (!(cp.id in newValues)) {
          newValues[cp.id] = cp.description || '';
        }
      });
      if (currentCheckpoint && !('current' in newValues)) {
        newValues['current'] = currentCheckpoint.description || '';
      }
      return newValues;
    });
  }, [checkpoints, currentCheckpoint]);

  // Create all checkpoints array with display numbers
  const allCheckpoints = [...checkpoints];
  if (currentCheckpoint) {
    allCheckpoints.push(currentCheckpoint);
  }

  // Sort so active checkpoint is at the bottom
  const sortedCheckpoints = allCheckpoints
    .sort((a, b) => {
      if (a.isRunning && !b.isRunning) return 1; // Active goes to bottom
      if (!a.isRunning && b.isRunning) return -1; // Active goes to bottom
      return a.startTime.getTime() - b.startTime.getTime(); // Otherwise sort by time
    })
    .map((checkpoint, index) => ({
      ...checkpoint,
      displayNumber: index + 1,
    }));

  return (
    <aside className="h-full w-full border-l border-gray-200 bg-white dark:border-gray-800 dark:bg-black flex-shrink-0 grid grid-rows-[auto_1fr_auto]">
      {/* SIDEBAR HEADER */}
      <div className="flex items-center gap-2 pt-4 pb-4 px-5">
        <div className="flex items-center">
          <svg className="h-5 w-5 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mr-2">Timer</h2>
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
            {allCheckpoints.length}
          </span>
        </div>
      </div>

      {/* MAIN CONTENT - Scrollable Checkpoints List */}
      <div ref={scrollableContainerRef} className="px-6 py-4 min-h-0 overflow-y-auto">
        <div className="space-y-2">
          {sortedCheckpoints.map((checkpoint) => (
            <div
              key={checkpoint.id || 'current'}
              className={`rounded-md p-2 text-xs ${
                checkpoint.endTime
                  ? 'bg-gray-50 dark:bg-gray-800'
                  : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700'
              }`}
            >
                <div className="flex items-center justify-between mb-1">
                  <input
                    type="text"
                    placeholder={`Timer ${checkpoint.displayNumber}`}
                    value={inputValues[checkpoint.id || 'current'] || ''}
                    onChange={(e) => handleUpdateDescription(checkpoint.id || 'current', e.target.value)}
                    className={`flex-1 bg-transparent text-xs font-medium border-none outline-none rounded px-1 py-0.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 ${
                      checkpoint.endTime
                        ? 'text-gray-700 dark:text-gray-300'
                        : 'text-blue-700 dark:text-blue-300'
                    }`}
                  />
                  <div className="flex items-center space-x-2">
                    <DurationDisplay
                      startTime={checkpoint.startTime}
                      isRunning={!checkpoint.endTime}
                    />
                    <div className="relative">
                      {onSaveCheckpoint && (
                        <button
                          onClick={() => {
                            onSaveCheckpoint(checkpoint);
                          }}
                          className="p-1 text-green-600 hover:text-green-700 dark:text-green-500 dark:hover:text-green-400 transition-colors"
                          title="Save time log and match to tasks"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                      )}

                      {/* Floating Badge with Dual Arrows - shows in task matching mode */}
                      {currentView === 'task-matching' && savedCheckpointId === (checkpoint.id || 'current') && (
                        <div className="absolute top-0 left-0 right-[-33px] bottom-0 z-50">
                          <div className="bg-gray-100 dark:bg-brand-900 text-gray-900 dark:text-white rounded-l-full p-2 shadow-xl">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                          </div>

                          {/* Curly bracket connection line */}
                          {/* <div className="absolute top-0 left-full w-5 h-0 bg-transparent">
                            <div className="w-5 left-0 h-5 -top-5 border-t-2 border-l-2 border-blue-50 rounded-tl-full"></div>
                            <div className="absolute -left-5 top-5 w-5 h-5 border-b-2 border-r-2 border-blue-50 rounded-br-full"></div>
                          </div> */}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div
                    className={`flex items-center space-x-2 ${
                      checkpoint.endTime
                        ? 'text-gray-600 dark:text-gray-400'
                        : 'text-blue-700 dark:text-blue-300'
                    }`}
                  >
                    <span className="font-mono">
                      {checkpointsManager.formatTime(checkpoint.startTime)}
                    </span>
                    <span>→</span>
                    <span className="font-mono">
                      {checkpoint.endTime
                        ? checkpointsManager.formatTime(checkpoint.endTime)
                        : 'Running...'
                      }
                    </span>
                  </div>
                  {!checkpoint.endTime && (
                    <span className="px-1.5 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200 rounded">
                      Active
                    </span>
                  )}
                </div>
              </div>
            ))}

            {allCheckpoints.length === 0 && (
              <div className="text-center py-6 px-4">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                  <svg className="w-8 h-8 text-blue-500 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                    Zoho Hours Register
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mb-3 leading-relaxed">
                    <strong className="text-gray-900 dark:text-white">Tired of being interrupted by sudden missions, urgent tasks, or unexpected meetings?</strong> Streamlined time tracking for Zoho users. Start timers, add descriptions now or later, and save time logs at the end of the day with intelligent matching across projects in no time.
                  </p>
                  <div className="text-left space-y-2 text-xs text-gray-600 dark:text-gray-300">
                    <div className="flex items-start">
                      <span className="text-green-500 mr-2 mt-0.5">✓</span>
                      <span><strong>Quick start:</strong> Description is optional - jump right into tasks, meetings, or fixes</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-green-500 mr-2 mt-0.5">✓</span>
                      <span><strong>Frustration-free:</strong> No more getting overwhelmed by multiple tasks across projects</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-green-500 mr-2 mt-0.5">✓</span>
                      <span><strong>Smart matching:</strong> Just add keywords or descriptions - it guesses your actual task</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-green-500 mr-2 mt-0.5">✓</span>
                      <span><strong>Works offline:</strong> Timer runs anywhere, syncs when online</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {allCheckpoints.length === 0 && (
              <div className="mt-6 flex flex-col items-center justify-center text-center">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-3">
                  Let&#39;s get started - hit the button below
                </p>
                <svg className="w-8 h-8 text-blue-500 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
            )}
          </div>
        </div>

        {/* Sticky Action Buttons */}
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
          <div className="space-y-2">
            <button
              onClick={handleAddCheckpoint}
              className="w-full flex items-center justify-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Checkpoint
            </button>

            {(checkpoints.length > 0 || currentCheckpoint) && (
              <button
                onClick={handleClearAllCheckpoints}
                className="w-full flex items-center justify-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear All Checkpoints
              </button>
            )}
          </div>
        </div>
    </aside>
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
