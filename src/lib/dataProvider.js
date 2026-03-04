// Data Provider for Zoho Hours Register
// Centralizes all data management and business logic

import { zohoFetch } from './zohoFetch';

// React-compatible Data Provider
export class DataProvider {
  // Tasks Manager - returns plain object with helper functions
  getTasksManager() {
    return {
      tasks: [],

      // Method to fetch tasks from activated projects
      fetchTasksFromProjects: async (activeProjectIds, options = {}) => {
        const { refreshCache = false } = options;
        if (!activeProjectIds || activeProjectIds.length === 0) {
          return [];
        }

        try {
          let credentials = null;
          const savedCredentials = localStorage.getItem('zoho_credentials');
          if (savedCredentials) {
            try {
              credentials = JSON.parse(savedCredentials);
            } catch (e) {
              console.warn('Error parsing saved credentials:', e);
            }
          }

          const allTasks = [];
          for (const projectId of activeProjectIds) {
            const query = refreshCache ? '?refreshCache=true' : '';
            const response = await zohoFetch(`/api/zoho/projects/${projectId}/tasks${query}`);

            if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              throw new Error(errorData.details || errorData.error || `Zoho API ${response.status}`);
            }

            const data = await response.json();
            const projectTasks = data.tasks || [];

            let storedProjectName = '';
            try {
              const storedProjects = JSON.parse(localStorage.getItem('user_projects') || '[]');
              const match = storedProjects.find(p => p.id === projectId || p.id === String(projectId));
              if (match?.name) storedProjectName = match.name;
            } catch (e) { /* ignore parse errors */ }

            const transformedTasks = projectTasks.map(task => ({
              id: task.id_string || String(task.id),
              name: task.name,
              projectName: task.project?.name || storedProjectName || 'Unnamed Project',
              zohoTaskUrl: credentials?.portalSlug
                ? `https://projects.zoho.com/portal/${credentials.portalSlug}/projects/${projectId}/tasks/custom-view/970116000018113003/list/task-detail/${task.id_string || task.id}`
                : '',
              status: typeof task.status === 'object' ? task.status.name || 'pending' : (task.status || 'pending'),
              priority: typeof task.priority === 'object' ? task.priority.name || 'medium' : (task.priority || 'medium'),
              assignedTo: task.assignee_name || 'Unassigned',
              completed: task.completed || task.status === 'completed' || task.status === 'closed',
              projectId: projectId.toString(),
              estimatedHours: task.duration ? parseFloat(task.duration) : 0,
              actualHours: task.percent_complete ? (task.percent_complete / 100) * (task.duration ? parseFloat(task.duration) : 0) : 0,
              dueDate: task.created_time ? new Date(task.created_time).toISOString().split('T')[0] : null,
              lastModifiedTimeLong: task.last_modified_time_long || task.created_time_long || null,
            }));

            allTasks.push(...transformedTasks);
          }

          return allTasks;
        } catch (error) {
          console.error('Error fetching tasks from projects:', error);
          throw error;
        }
      },

      formatDate: (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
      },

      getStatusColor: (status) => {
        switch (status) {
          case 'completed':
          case 'closed': return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200';
          case 'in_progress':
          case 'inprogress':
          case 'open': return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200';
          case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200';
          default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
        }
      },

      getPriorityColor: (priority) => {
        switch (priority) {
          case 'high': return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200';
          case 'medium': return 'bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-200';
          case 'low': return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200';
          default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
        }
      }
    };
  }
}

// Create singleton instance
export const dataProvider = new DataProvider();
