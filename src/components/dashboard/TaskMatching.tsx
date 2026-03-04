'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { ArrowRightIcon } from '../../icons';
import { zohoFetch } from '@/lib/zohoFetch';
import { Checkpoint, DashboardTask } from '@/types';
import { TaskFilters, TaskFilterValues, ProjectInfo, applyTaskFilters } from './TaskFilters';

interface TaskMatchingProps {
  checkpoint: Checkpoint;
  tasks: DashboardTask[];
  onBack: () => void;
  activeProjectIds?: string[];
  fetchTasksFromProjects?: (projectIds: string[]) => Promise<DashboardTask[]>;
  currentUserName?: string;
  onCheckpointLogged?: (checkpointId: number) => void;
  projects?: ProjectInfo[];
}

// Normalize text: lowercase, remove punctuation, collapse whitespace
function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Tokenize into words (min 2 chars to keep "UI", "QA", "db", etc.)
function tokenize(text: string): string[] {
  return normalize(text).split(' ').filter(w => w.length >= 2);
}

// Simple stemming: strip common suffixes to help match word variants
// e.g. "testing" -> "test", "fixed" -> "fix", "pages" -> "page"
function stem(word: string): string {
  return word
    .replace(/ing$/, '')
    .replace(/tion$/, '')
    .replace(/ment$/, '')
    .replace(/ed$/, '')
    .replace(/es$/, '')
    .replace(/ly$/, '')
    .replace(/er$/, '')
    .replace(/s$/, '');
}

// Calculate similarity between checkpoint description (text1) and task name (text2)
// Uses multiple strategies combined for robust matching.
// Key principle: when the description is short (e.g. "Support"), tasks whose name
// is closest in meaning / length should rank highest (e.g. "Internal Support" over
// "Support for migrating legacy infrastructure").
function calculateSimilarity(text1: string, text2: string): number {
  if (!text1.trim() || !text2.trim()) return 0;

  const norm1 = normalize(text1);
  const norm2 = normalize(text2);

  // --- Strategy 1: Substring / phrase matching ---
  let substringScore = 0;

  // Exact equality
  if (norm1 === norm2) {
    substringScore = 100;
  }
  // One fully contains the other
  else if (norm1.includes(norm2) || norm2.includes(norm1)) {
    // Scale by how much of the longer string the shorter covers
    const coverage = Math.min(norm1.length, norm2.length) / Math.max(norm1.length, norm2.length);
    substringScore = 60 + coverage * 35; // range: 60-95 depending on coverage
  }
  // Multi-word phrase overlap
  else {
    const words1 = tokenize(text1);
    for (let len = Math.min(words1.length, 4); len >= 2; len--) {
      for (let i = 0; i <= words1.length - len; i++) {
        const phrase = words1.slice(i, i + len).join(' ');
        if (phrase.length >= 4 && norm2.includes(phrase)) {
          const phraseCoverage = phrase.length / norm2.length;
          substringScore = Math.max(substringScore, 30 + len * 10 + phraseCoverage * 20);
        }
      }
    }
  }

  // --- Strategy 2: Token overlap with stemming (Jaccard on stems) ---
  const tokens1 = tokenize(text1);
  const tokens2 = tokenize(text2);
  const stems1 = new Set(tokens1.map(stem));
  const stems2 = new Set(tokens2.map(stem));
  const stemIntersection = new Set([...stems1].filter(s => stems2.has(s)));
  const stemUnion = new Set([...stems1, ...stems2]);
  const stemJaccard = stemUnion.size === 0 ? 0 : (stemIntersection.size / stemUnion.size) * 100;

  // --- Strategy 3: Token containment (directional) ---
  // What fraction of description tokens appear in task name?
  const containment = stems1.size === 0
    ? 0
    : (stemIntersection.size / stems1.size) * 100;

  // --- Strategy 4: Individual token partial match (prefix matching) ---
  let partialScore = 0;
  if (tokens1.length > 0 && tokens2.length > 0) {
    let matches = 0;
    for (const t1 of tokens1) {
      const s1 = stem(t1);
      for (const t2 of tokens2) {
        const s2 = stem(t2);
        if (s1.length >= 2 && s2.length >= 2 && (s2.startsWith(s1) || s1.startsWith(s2))) {
          matches++;
          break;
        }
      }
    }
    partialScore = (matches / tokens1.length) * 80;
  }

  // --- Strategy 5: Length similarity bonus ---
  // When description tokens fully match, prefer tasks with fewer extra words
  // e.g. "Support" → prefer "Internal Support" (2 words) over a 10-word task name
  let lengthBonus = 0;
  if (stemIntersection.size > 0 && stemIntersection.size === stems1.size) {
    // All description stems found in task — bonus based on token count ratio
    const ratio = stems1.size / stems2.size; // closer to 1 = task name is tighter
    lengthBonus = ratio * 15; // up to 15 extra points
  }

  // Combine scores
  const combined = Math.max(
    substringScore,
    stemJaccard * 0.3 + containment * 0.4 + partialScore * 0.3
  ) + lengthBonus;

  return Math.min(100, combined);
}

export const TaskMatching: React.FC<TaskMatchingProps> = ({
  checkpoint,
  tasks: initialTasks,
  onBack,
  activeProjectIds = [],
  fetchTasksFromProjects,
  currentUserName = '',
  onCheckpointLogged,
  projects: externalProjects = [],
}) => {
  const [tasks, setTasks] = useState(initialTasks);
  const [loading, setLoading] = useState(false);
  const [confirmingTaskId, setConfirmingTaskId] = useState<string | null>(null);
  const [submittingTaskId, setSubmittingTaskId] = useState<string | null>(null);
  const [submittedTaskIds, setSubmittedTaskIds] = useState<Set<string>>(new Set());
  const [errorTaskId, setErrorTaskId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [filters, setFilters] = useState<TaskFilterValues>({ status: 'all', priority: 'all', project: 'all' });
  // Parse "HH:MM:SS" duration into { hours, minutes }
  function parseDuration(duration: string): { hours: number; minutes: number } {
    const parts = duration.split(':').map(Number);
    const hours = parts[0] || 0;
    const minutes = parts[1] || 0;
    return { hours, minutes };
  }

  // Format the checkpoint's start date as MM-DD-YYYY for Zoho API
  // Uses the checkpoint's actual time period rather than "today"
  function getCheckpointDateFormatted(): string {
    const date = checkpoint.startTime instanceof Date ? checkpoint.startTime : new Date(checkpoint.startTime);
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${mm}-${dd}-${yyyy}`;
  }

  // Format a Date as "hh:mm AM/PM" for the Zoho time period fields
  function formatTime12h(d: Date | string): string {
    const date = d instanceof Date ? d : new Date(d);
    let h = date.getHours();
    const m = String(date.getMinutes()).padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${String(h).padStart(2, '0')}:${m} ${ampm}`;
  }

  async function handleConfirmLog(task: DashboardTask & { similarity: number }) {
    if (!task.projectId) {
      setErrorTaskId(task.id);
      setErrorMessage('Task is missing projectId');
      return;
    }

    setSubmittingTaskId(task.id);
    setConfirmingTaskId(null);
    setErrorTaskId(null);

    const { hours, minutes } = parseDuration(checkpoint.duration);
    const date = getCheckpointDateFormatted();
    const notes = checkpoint.description || '';

    // Time period: start and end times from the checkpoint
    const start_time = formatTime12h(checkpoint.startTime);
    const end_time = checkpoint.endTime ? formatTime12h(checkpoint.endTime) : undefined;

    try {
      const response = await zohoFetch(
        `/api/zoho/projects/${task.projectId}/tasks/${task.id}/timelogs`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date, hours, minutes, notes, bill_status: 'Billable', start_time, end_time }),
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.details || data.error || 'Failed to create time log');
      }

      setSubmittedTaskIds(prev => new Set(prev).add(task.id));
      // Mark the checkpoint as logged in the sidebar
      onCheckpointLogged?.(checkpoint.id);
    } catch (error) {
      setErrorTaskId(task.id);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to log time');
    } finally {
      setSubmittingTaskId(null);
    }
  }

  // Keep a stable ref to fetchTasksFromProjects so the effect only re-runs
  // when activeProjectIds changes, not when the function reference changes.
  const fetchTasksRef = React.useRef(fetchTasksFromProjects);
  fetchTasksRef.current = fetchTasksFromProjects;

  // Fetch tasks when active project IDs change
  useEffect(() => {
    let cancelled = false;

    const fetchTasks = async () => {
      if (activeProjectIds.length === 0) {
        setTasks([]);
        return;
      }

      if (fetchTasksRef.current) {
        setLoading(true);
        try {
          const fetchedTasks = await fetchTasksRef.current(activeProjectIds);
          if (!cancelled) setTasks(fetchedTasks);
        } catch (error) {
          console.error('Failed to fetch tasks:', error);
          if (!cancelled) setTasks(initialTasks); // Fallback to initial tasks
        } finally {
          if (!cancelled) setLoading(false);
        }
      } else {
        setTasks(initialTasks);
      }
    };

    fetchTasks();

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProjectIds]);

  const taskMatches = useMemo(() => {
    const normalizedUserName = currentUserName.trim().toLowerCase();

    // Calculate similarity for all tasks
    const allTasksWithSimilarity = tasks.map(task => {
      const textSimilarity = calculateSimilarity(checkpoint.description, task.name);

      // Self-assigned bonus: boost tasks assigned to the current user
      // Only applies when we know the user's name and the task has some text relevance
      let selfAssignedBonus = 0;
      if (normalizedUserName && task.assignedTo && task.assignedTo.toLowerCase().includes(normalizedUserName)) {
        // Flat bonus for being assigned to the user — enough to break ties
        // and push self-assigned tasks noticeably higher, but not enough
        // to override a strong text mismatch
        selfAssignedBonus = 15;
      }

      // Recency bonus: boost recently modified tasks so they float higher
      // in the results. Meaningful for tie-breaking but won't override
      // strong text matches.
      let recencyBonus = 0;
      if (task.lastModifiedTimeLong) {
        const ageMs = Date.now() - task.lastModifiedTimeLong;
        const ageHours = ageMs / (1000 * 60 * 60);
        if (ageHours <= 24) {
          recencyBonus = 10;       // Modified in the last day
        } else if (ageHours <= 24 * 7) {
          recencyBonus = 7;        // Modified in the last week
        } else if (ageHours <= 24 * 30) {
          recencyBonus = 4;        // Modified in the last month
        } else if (ageHours <= 24 * 90) {
          recencyBonus = 2;        // Modified in the last 3 months
        }
        // Older than 3 months: no bonus
      }

      return {
        ...task,
        similarity: Math.min(100, textSimilarity + selfAssignedBonus + recencyBonus),
        isSelfAssigned: selfAssignedBonus > 0,
      };
    });

    // Sort by similarity descending (matched tasks first, then all others)
    return allTasksWithSimilarity
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 50); // Show up to 50 tasks for better selection
  }, [checkpoint.description, tasks, currentUserName]);

  // Derive filter options from the full task list
  const uniqueStatuses = useMemo(
    () => Array.from(new Set(tasks.map(task => task.status).filter(Boolean))),
    [tasks],
  );

  const projects: ProjectInfo[] = useMemo(
    () => externalProjects.length > 0
      ? externalProjects
      : Array.from(
          new Map(
            tasks.map(task => [task.projectId || task.id, { id: String(task.projectId || task.id), name: task.projectName }])
          ).values()
        ),
    [externalProjects, tasks],
  );

  // Apply filters on top of the scored/sorted list
  const filteredTaskMatches = useMemo(
    () => applyTaskFilters(taskMatches, filters),
    [taskMatches, filters],
  );

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
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Fixed Header */}
      <div className="fixed top-0 left-64 lg:left-72 xl:left-96 right-0 z-20 bg-white dark:bg-gray-900 animate-fade-slide-down">
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
            <div className="flex-1 animate-fade-slide-right stagger-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Task Matching for Checkpoint
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Time logged: <span className="font-mono font-medium">{checkpoint.duration}</span>
                <span className="mx-2">·</span>
                Date: <span className="font-mono font-medium">{getCheckpointDateFormatted()}</span>
              </p>
            </div>

            {/* Checkpoint Description - Condensed on side */}
            <div className="flex-1 md:flex-shrink-0 animate-fade-slide-left stagger-2">
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
        <div className="space-y-8 p-6 pt-40 bg-gray-100 dark:bg-gray-900">
          {/* Task Matches */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 animate-fade-slide-up stagger-3">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Matching Tasks
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Tasks sorted by relevance to your checkpoint description ({filteredTaskMatches.length} tasks)
              </p>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Loading tasks...</p>
                  </div>
                </div>
              ) : taskMatches.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-lg font-medium mb-2">No matching tasks found</p>
                  <p className="text-sm">Try adding more descriptive text to your checkpoint</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Filters */}
                  <TaskFilters
                    filters={filters}
                    onFiltersChange={setFilters}
                    statuses={uniqueStatuses}
                    projects={projects}
                  />

                  {filteredTaskMatches.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <p className="text-lg font-medium mb-2">No tasks match the current filters</p>
                      <p className="text-sm">Try adjusting the filters above</p>
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
                        <th className="px-4 py-3 text-left font-medium text-gray-900 dark:text-gray-100">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                      {filteredTaskMatches.map((task) => {
                        const isConfirming = confirmingTaskId === task.id;
                        const isSubmitting = submittingTaskId === task.id;
                        const isSubmitted = submittedTaskIds.has(task.id);
                        const hasError = errorTaskId === task.id;

                        return (
                          <React.Fragment key={`${task.projectId}-${task.id}`}>
                            <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
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
                                {task.isSelfAssigned && (
                                  <span className="ml-1.5 px-1.5 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-800 dark:text-purple-200 rounded-full">
                                    You
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <span className="font-medium text-blue-600 dark:text-blue-400">
                                  {Math.round(task.similarity)}%
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                {isSubmitted ? (
                                  <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 font-medium text-sm">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                    </svg>
                                    Logged!
                                  </span>
                                ) : isSubmitting ? (
                                  <span className="inline-flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 dark:border-blue-400"></div>
                                    Logging...
                                  </span>
                                ) : isConfirming ? (
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => handleConfirmLog(task)}
                                      className="px-2.5 py-1 text-xs font-medium text-white bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-500 rounded transition-colors"
                                    >
                                      Confirm
                                    </button>
                                    <button
                                      onClick={() => { setConfirmingTaskId(null); setErrorTaskId(null); }}
                                      className="px-2.5 py-1 text-xs font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 dark:text-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 rounded transition-colors"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => { setConfirmingTaskId(task.id); setErrorTaskId(null); }}
                                    className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400 rounded transition-colors"
                                  >
                                    Log Time
                                  </button>
                                )}
                              </td>
                            </tr>
                            {/* Confirmation detail row */}
                            {isConfirming && (
                              <tr className="bg-blue-50 dark:bg-blue-900/20">
                                <td colSpan={8} className="px-4 py-2">
                                  <p className="text-sm text-blue-800 dark:text-blue-200">
                                    Log <span className="font-mono font-semibold">{checkpoint.duration}</span> to &apos;{task.name}&apos; on <span className="font-mono font-semibold">{getCheckpointDateFormatted()}</span>?
                                  </p>
                                </td>
                              </tr>
                            )}
                            {/* Error row */}
                            {hasError && !isConfirming && (
                              <tr className="bg-red-50 dark:bg-red-900/20">
                                <td colSpan={8} className="px-4 py-2">
                                  <p className="text-sm text-red-600 dark:text-red-400">
                                    Error: {errorMessage}
                                  </p>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                  )}
                </div>
              )}
            </div>
          </div>
      </div>
    </div>
  );
};
