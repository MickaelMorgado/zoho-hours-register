'use client';

import React, { useState } from 'react';

interface Project {
  id: string;
  name: string;
  description: string;
  tasks: number;
  completedTasks: number;
  totalHours: number;
  status: string;
  isActive: boolean;
}

interface ProjectsOverviewProps {
  projects: Project[];
  onToggleProject: (projectId: string) => void;
  onAddProject: (projectId: string, projectName?: string) => Promise<'added' | 'exists'>;
  onRemoveProject: (projectId: string) => void;
  onClearAllProjects: () => void;
  loading?: boolean;
  error?: string | null;
}

export const ProjectsOverview: React.FC<ProjectsOverviewProps> = ({
  projects,
  onToggleProject,
  onAddProject,
  onRemoveProject,
  onClearAllProjects,
  loading = false,
  error = null,
}) => {
  const [newProjectId, setNewProjectId] = useState('');
  const [newProjectName, setNewProjectName] = useState('');
  const [addingProject, setAddingProject] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [highlightProjectId, setHighlightProjectId] = useState<string | null>(null);
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Projects Overview</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Loading projects...</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="border rounded-lg p-4 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                  <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    const isOAuthError = error.toLowerCase().includes('invalid') &&
                        (error.toLowerCase().includes('oauth') ||
                         error.toLowerCase().includes('token') ||
                         error.toLowerCase().includes('access'));

    // Extract the actual Zoho error message from the details
    let zohoErrorMessage = '';
    if (isOAuthError && error.includes('details')) {
      try {
        // The error contains something like: details: "Zoho API Error: 401  - {\"code\":6401,\"message\":\"Invalid OAuth access token.\"}"
        // We need to extract the JSON part after the dash
        const dashIndex = error.lastIndexOf(' - ');
        if (dashIndex > 0) {
          const jsonPart = error.substring(dashIndex + 3);
          const detailsJson = JSON.parse(jsonPart);
          if (detailsJson.message) {
            zohoErrorMessage = detailsJson.message;
          }
        }
      } catch (e) {
        // If parsing fails, keep zohoErrorMessage empty
      }
    }

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-red-200 dark:border-red-700">
        <div className="px-6 py-4 border-b border-red-200 dark:border-red-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Projects Overview</h2>
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">
            {isOAuthError ? 'Authentication Error' : 'Failed to load projects'}
          </p>
        </div>
        <div className="p-6">
          <div className="text-center py-8">
            <div className="text-red-500 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {isOAuthError ? (
                <>
                  {zohoErrorMessage || 'Your Zoho access token is invalid or expired. Please configure OAuth tokens in Settings.'}
                  <br />
                  <span className="text-xs text-gray-500 mt-2 block">
                    Required scopes: ZohoProjects.portals.READ,ZohoProjects.tasks.ALL,ZohoProjects.bugs.READ
                    <br />
                    Go to Settings to configure your OAuth tokens.
                  </span>
                </>
              ) : (
                error
              )}
            </p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Retry
              </button>
              {isOAuthError && (
                <button
                  onClick={() => {
                    // Redirect to settings page
                    window.location.href = '/profile';
                  }}
                   className="px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
                >
                  Go to Settings
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleAddProject = async () => {
    if (!newProjectId.trim() || addingProject) return;

    setAddingProject(true);
    setAddError(null);
    setInfoMessage(null);
    try {
      const trimmedId = newProjectId.trim();
      const name = newProjectName.trim() || undefined;
      const result = await onAddProject(trimmedId, name);

      if (result === 'exists') {
        // Gentle info message instead of error
        setInfoMessage('Project already added');
        // Highlight the existing card and scroll to it
        setHighlightProjectId(trimmedId);
        setTimeout(() => setHighlightProjectId(null), 2000);
        const el = document.getElementById(`project-card-${trimmedId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      } else {
        // Successfully added
        setNewProjectId('');
        setNewProjectName('');
      }
    } catch (error) {
      console.error('Failed to add project:', error);
      setAddError(error instanceof Error ? error.message : 'Failed to add project');
    } finally {
      setAddingProject(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Projects Overview</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Add projects by ID and manage your active projects
            </p>
          </div>
          {projects.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to remove all projects? This will clear your localStorage.')) {
                  onClearAllProjects();
                }
              }}
              className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              title="Clear all projects"
            >
              Clear All
            </button>
          )}
        </div>
      </div>
      <div className="p-6">
        {/* Add Project Input */}
        <div className="mb-6">
          <div className="flex gap-2">
            <div className="flex flex-1 gap-2">
              <input
                type="text"
                value={newProjectId}
                onChange={(e) => { setNewProjectId(e.target.value); setAddError(null); setInfoMessage(null); }}
                placeholder="Project ID"
                className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                onKeyPress={(e) => e.key === 'Enter' && handleAddProject()}
                disabled={addingProject}
              />
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Project name (optional, auto-fetched from Zoho)"
                className="w-1/2 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                onKeyPress={(e) => e.key === 'Enter' && handleAddProject()}
                disabled={addingProject}
              />
            </div>
            <button
              onClick={handleAddProject}
              disabled={!newProjectId.trim() || addingProject}
              className="px-4 py-2 bg-brand-500 text-white rounded-md hover:bg-brand-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
            >
              {addingProject ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding...
                </span>
              ) : 'Add Project'}
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Enter a Zoho project ID to add it to your dashboard. The project name will be auto-fetched if left empty.
          </p>
          {addError && (
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">
              {addError}
            </p>
          )}
          {infoMessage && (
             <p className="text-xs text-brand-600 dark:text-brand-400 mt-1">
              {infoMessage}
            </p>
          )}
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              No projects added yet. Add a project using the input above.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                id={`project-card-${project.id}`}
                className={`relative border rounded-lg p-4 transition-all duration-500 ${
                  highlightProjectId === project.id
                    ? 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/30 dark:border-yellow-600 ring-2 ring-yellow-300 dark:ring-yellow-600'
                    : project.isActive
                      ? 'border-brand-300 bg-brand-50 dark:bg-brand-900/20 dark:border-brand-700'
                      : 'border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-600'
                }`}
              >
                {/* Remove Button */}
                <button
                  onClick={() => onRemoveProject(project.id)}
                  className="absolute top-2 left-2 w-6 h-6 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors flex items-center justify-center text-xs"
                  title="Remove project"
                >
                  ×
                </button>

                {/* Active Indicator */}
                {project.isActive && (
                  <div className="absolute top-2 right-2 w-3 h-3 bg-brand-500 rounded-full"></div>
                )}

                <div className="flex items-center justify-between mt-6">
                  <div className="pr-12 truncate max-w-[150px]">
                    <h3 className="text-md font-semibold text-gray-900 dark:text-white truncate" title={project.name}>
                      {project.name}
                    </h3>
                    <p className="text-xs text-gray-400 dark:text-gray-500 truncate" title={project.id}>
                      ID: {project.id}
                    </p>
                  </div>

                  {/* Toggle Switch */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={project.isActive}
                      onChange={() => onToggleProject(project.id)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 dark:peer-focus:ring-brand-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-600"></div>
                  </label>
                </div>

                {/* Project Stats */}
                <div className="mt-3 text-xs text-gray-600 dark:text-gray-400">
                  <div className="flex justify-between">
                    <span>{project.tasks} tasks</span>
                    <span>{project.completedTasks} completed</span>
                  </div>
                  {project.totalHours > 0 && (
                    <div className="mt-1">
                      <span>{project.totalHours.toFixed(1)} hours logged</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
