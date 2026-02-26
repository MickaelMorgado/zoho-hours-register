'use client';

import React from 'react';

export interface ProjectInfo {
  id: string;
  name: string;
}

export interface TaskFilterValues {
  status: string;
  priority: string;
  project: string;
}

interface TaskFiltersProps {
  filters: TaskFilterValues;
  onFiltersChange: (filters: TaskFilterValues) => void;
  /** Unique status values extracted from the current task list */
  statuses: string[];
  /** Project list for the project dropdown */
  projects: ProjectInfo[];
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({
  filters,
  onFiltersChange,
  statuses,
  projects,
}) => {
  const selectClass =
    'px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100';

  return (
    <div className="flex flex-wrap gap-4">
      {/* Project */}
      <div className="flex items-center space-x-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Project:</label>
        <select
          value={filters.project}
          onChange={(e) => onFiltersChange({ ...filters, project: e.target.value })}
          className={selectClass}
        >
          <option value="all">All Projects</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}{project.name !== project.id ? ` (${project.id})` : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Status */}
      <div className="flex items-center space-x-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</label>
        <select
          value={filters.status}
          onChange={(e) => onFiltersChange({ ...filters, status: e.target.value })}
          className={selectClass}
        >
          <option value="all">All Status</option>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {status.replace('_', ' ').toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      {/* Priority */}
      <div className="flex items-center space-x-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Priority:</label>
        <select
          value={filters.priority}
          onChange={(e) => onFiltersChange({ ...filters, priority: e.target.value })}
          className={selectClass}
        >
          <option value="all">All Priority</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>
    </div>
  );
};

/** Helper: filter a task array using the current filter values */
export function applyTaskFilters<T extends { status: string; priority: string; projectId?: string }>(
  tasks: T[],
  filters: TaskFilterValues,
): T[] {
  return tasks.filter((task) => {
    const matchesStatus = filters.status === 'all' || task.status === filters.status;
    const matchesPriority = filters.priority === 'all' || task.priority === filters.priority;
    const matchesProject = filters.project === 'all' || String(task.projectId) === filters.project;
    return matchesStatus && matchesPriority && matchesProject;
  });
}
