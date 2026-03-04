'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { ArrowRightIcon } from '../../icons';
import { TaskFilters, TaskFilterValues, ProjectInfo, applyTaskFilters } from './TaskFilters';

interface Task {
  id: string;
  name: string;
  projectName: string;
  zohoTaskUrl: string;
  status: string;
  priority: string;
  assignedTo: string;
  projectId?: string;
}

interface TasksTableProps {
  tasks: Task[];
  formatDate: (dateString: string) => string;
  getStatusColor: (status: string) => string;
  getPriorityColor: (priority: string) => string;
  activeProjectIds?: string[];
  fetchTasksFromProjects?: (projectIds: string[]) => Promise<Task[]>;
  projects?: ProjectInfo[];
}

export const TasksTable: React.FC<TasksTableProps> = ({
  tasks: initialTasks,
  formatDate,
  getStatusColor,
  getPriorityColor,
  activeProjectIds = [],
  fetchTasksFromProjects,
  projects: externalProjects = [],
}) => {
  const [filters, setFilters] = useState<TaskFilterValues>({ status: 'all', priority: 'all', project: 'all' });
  const [tasks, setTasks] = useState(initialTasks);
  const [loading, setLoading] = useState(false);
  const [lastFetchError, setLastFetchError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [debouncedProjectIds, setDebouncedProjectIds] = useState(activeProjectIds);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => setDebouncedProjectIds(activeProjectIds), 400);
    return () => window.clearTimeout(timeoutId);
  }, [activeProjectIds]);

  const executeFetch = useCallback(async (projectIds: string[], forceRefresh = false) => {
    if (projectIds.length === 0) {
      setTasks([]);
      setLastFetchError(null);
      setLoading(false);
      if (forceRefresh) setRefreshing(false);
      return;
    }

    if (!fetchTasksFromProjects) {
      setTasks(initialTasks);
      setLastFetchError(null);
      setLoading(false);
      if (forceRefresh) setRefreshing(false);
      return;
    }

    setLoading(true);
    if (forceRefresh) setRefreshing(true);
    setLastFetchError(null);

    try {
      const fetchedTasks = await fetchTasksFromProjects(projectIds, { refreshCache: forceRefresh });
      setTasks(fetchedTasks);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch tasks';
      setLastFetchError(message);
    } finally {
      setLoading(false);
      if (forceRefresh) {
        setRefreshing(false);
      }
    }
  }, [fetchTasksFromProjects, initialTasks]);

  useEffect(() => {
    executeFetch(debouncedProjectIds, false);
  }, [debouncedProjectIds, executeFetch]);

  const handleManualRefresh = useCallback(() => {
    if (!fetchTasksFromProjects || debouncedProjectIds.length === 0) return;
    executeFetch(debouncedProjectIds, true);
  }, [debouncedProjectIds, executeFetch, fetchTasksFromProjects]);

  // Use external projects list (real names from useProjects) when available,
  // otherwise derive from task data
  const projects: ProjectInfo[] = externalProjects.length > 0
    ? externalProjects
    : Array.from(
        new Map(
          tasks.map(task => [task.projectId || task.id, { id: String(task.projectId || task.id), name: task.projectName }])
        ).values()
      );

  const canRefresh = Boolean(fetchTasksFromProjects && debouncedProjectIds.length > 0);

  // Get unique status values from tasks
  const uniqueStatuses = useMemo(
    () => Array.from(new Set(tasks.map(task => task.status).filter(Boolean))),
    [tasks],
  );

  const filteredTasks = useMemo(() => applyTaskFilters(tasks, filters), [tasks, filters]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 mt-8">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Tasks List</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">All tasks from your projects with filtering options</p>
          </div>
          {canRefresh && (
            <button
              type="button"
              onClick={handleManualRefresh}
              disabled={loading || refreshing}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {refreshing ? 'Refreshing…' : 'Refresh tasks'}
            </button>
          )}
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-6">
          {lastFetchError && (
            <div className="flex flex-col gap-3 rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800 md:flex-row md:items-center md:justify-between">
              <span>{lastFetchError}</span>
              {canRefresh && (
                <button
                  type="button"
                  onClick={handleManualRefresh}
                  disabled={loading || refreshing}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-yellow-900 bg-white border border-yellow-300 rounded-md hover:bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
                >
                  Retry now
                </button>
              )}
            </div>
          )}

          {/* Filters */}
          <TaskFilters
            filters={filters}
            onFiltersChange={setFilters}
            statuses={uniqueStatuses}
            projects={projects}
          />

          {/* Tasks Table */}
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
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                {filteredTasks.map((task) => (
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
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(String(task.status || 'pending'))}`}>
                        {String(task.status || 'pending').replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(String(task.priority || 'medium'))}`}>
                        {String(task.priority || 'medium').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-gray-600 dark:text-gray-400">{task.assignedTo}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredTasks.length === 0 && (
            <div className="text-center py-12">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-gray-500 dark:text-gray-400">No tasks match the current filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
