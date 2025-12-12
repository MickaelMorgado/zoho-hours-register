'use client';

import React, { useMemo } from 'react';
import { ArrowRightIcon } from '../../icons';

interface Task {
  id: number;
  name: string;
  projectName: string;
  zohoTaskUrl: string;
  status: string;
  priority: string;
  assignedTo: string;
}

interface Checkpoint {
  id: number;
  startTime: Date;
  endTime: Date | null;
  duration: string;
  description: string;
  isRunning: boolean;
  displayNumber?: number;
}

interface TaskMatchingProps {
  checkpoint: Checkpoint;
  tasks: Task[];
  onBack: () => void;
}

// Simple text similarity function using Jaccard similarity
function calculateSimilarity(text1: string, text2: string): number {
  const words1 = new Set(text1.toLowerCase().split(/\s+/).filter(word => word.length > 2));
  const words2 = new Set(text2.toLowerCase().split(/\s+/).filter(word => word.length > 2));

  const intersection = new Set([...words1].filter(word => words2.has(word)));
  const union = new Set([...words1, ...words2]);

  return union.size === 0 ? 0 : (intersection.size / union.size) * 100;
}

export const TaskMatching: React.FC<TaskMatchingProps> = ({ checkpoint, tasks, onBack }) => {
  const taskMatches = useMemo(() => {
    // Calculate similarity for all tasks
    const allTasksWithSimilarity = tasks.map(task => ({
      ...task,
      similarity: calculateSimilarity(checkpoint.description, task.name)
    }));

    // Sort by similarity descending (matched tasks first, then all others)
    return allTasksWithSimilarity
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 50); // Show up to 50 tasks for better selection
  }, [checkpoint.description, tasks]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200';
      case 'medium': return 'bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  return (
    <div className="min-h-screen">
      {/* Fixed Header */}
      <div className="fixed top-0 left-[570px] right-0 z-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onBack}
              className="flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Dashboard
            </button>
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Task Matching for Checkpoint
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Time logged: <span className="font-mono font-medium">{checkpoint.duration}</span>
              </p>
            </div>

            {/* Checkpoint Description - Condensed on side */}
            <div className="flex-1 md:flex-shrink-0">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3 min-w-0">
                <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">Description:</h3>
                <p className="text-blue-800 dark:text-blue-200 font-medium text-sm truncate">
                  {checkpoint.description || 'No description provided'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

        {/* Scrollable Content */}
        <div className="space-y-8 p-6 pt-40">
          {/* Task Matches */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Matching Tasks
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Tasks sorted by relevance to your checkpoint description ({taskMatches.length} tasks)
              </p>
            </div>

            <div className="p-6">
              {taskMatches.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-lg font-medium mb-2">No matching tasks found</p>
                  <p className="text-sm">Try adding more descriptive text to your checkpoint</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-gray-100">Task</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-gray-100">Project</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-gray-100">Zoho Task Url</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-gray-100">Status</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-gray-100">Priority</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-gray-100">Assignee</th>
                        <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-gray-100">Match</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                      {taskMatches.map((task) => (
                        <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-900 dark:text-gray-100">{task.name}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-gray-600 dark:text-gray-400">{task.projectName}</span>
                          </td>
                          <td className="px-4 py-3">
                            <a href={task.zohoTaskUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline">
                              <ArrowRightIcon className="w-4 h-4 inline" />
                            </a>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                              {task.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                              {task.priority.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-gray-600 dark:text-gray-400">{task.assignedTo}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="font-medium text-blue-600 dark:text-blue-400">
                              {Math.round(task.similarity)}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
      </div>
    </div>
  );
};
