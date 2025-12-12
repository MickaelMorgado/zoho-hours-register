'use client';

import React, { useState } from 'react';

interface Project {
  id: number;
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
  onToggleProject: (projectId: number) => void;
}

export const ProjectsOverview: React.FC<ProjectsOverviewProps> = ({
  projects,
  onToggleProject,
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Projects Overview</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Toggle project activation</p>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className={`relative border rounded-lg p-4 hover:shadow-md transition-all duration-200 ${
                project.isActive
                  ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-700'
                  : 'border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-600'
              }`}
            >
              {/* Active Indicator */}
              {project.isActive && (
                <div className="absolute top-2 right-2 w-3 h-3 bg-blue-500 rounded-full"></div>
              )}

              <div className="flex items-center justify-between">
                <h3 className="text-md font-semibold text-gray-900 dark:text-white">
                  {project.name}
                </h3>

                {/* Toggle Switch */}
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={project.isActive}
                    onChange={() => onToggleProject(project.id)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
