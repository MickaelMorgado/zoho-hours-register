'use client';

import React, { useEffect, useState } from 'react';
import { ArrowRightIcon } from '../../icons';

interface Task {
  id: number;
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
}

export const TasksTable: React.FC<TasksTableProps> = ({
  tasks: initialTasks,
  formatDate,
  getStatusColor,
  getPriorityColor,
  activeProjectIds = [],
  fetchTasksFromProjects,
}) => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterProject, setFilterProject] = useState('all');
  const [tasks, setTasks] = useState(initialTasks);
  const [loading, setLoading] = useState(false);

  // Fetch tasks when active project IDs change
  useEffect(() => {
    const fetchTasks = async () => {
      if (activeProjectIds.length === 0) {
        setTasks([]);
        return;
      }

      if (fetchTasksFromProjects) {
        setLoading(true);
        try {
          const fetchedTasks = await fetchTasksFromProjects(activeProjectIds);
          setTasks(fetchedTasks);
        } catch (error) {
          console.error('Failed to fetch tasks:', error);
          setTasks(initialTasks); // Fallback to initial tasks
        } finally {
          setLoading(false);
        }
      } else {
        setTasks(initialTasks);
      }
    };

    fetchTasks();
  }, [activeProjectIds, fetchTasksFromProjects, initialTasks]);

  const projects = Array.from(
    new Map(
      tasks.map(task => [task.projectId || task.id, { id: task.projectId || task.id, name: task.projectName }])
    ).values()
  );

  // Get unique status values from tasks
  const uniqueStatuses = Array.from(new Set(tasks.map(task => task.status).filter(Boolean)));

  const filteredTasks = tasks.filter(task => {
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
    const matchesProject = filterProject === 'all' || task.projectName === projects.find(p => p.id.toString() === filterProject)?.name;

    return matchesStatus && matchesPriority && matchesProject;
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mt-8">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Tasks List</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">All tasks from your projects with filtering options</p>
      </div>
      <div className="p-6">
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="all">All Status</option>
                {uniqueStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status.replace('_', ' ').toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Priority:</label>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="all">All Priority</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Project:</label>
              <select
                value={filterProject}
                onChange={(e) => setFilterProject(e.target.value)}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="all">All Projects</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

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
