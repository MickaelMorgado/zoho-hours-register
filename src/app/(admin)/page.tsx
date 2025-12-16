'use client';

import { ProjectsOverview } from "@/components/dashboard/ProjectsOverview";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { TaskMatching } from "@/components/dashboard/TaskMatching";
import { TasksTable } from "@/components/dashboard/TasksTable";
import { TimerSidebar } from "@/components/dashboard/TimerSidebar";
import { useProjects } from "@/hooks/useProjects";
import { dataProvider } from "@/lib/dataProvider";
import { useEffect, useMemo, useState } from "react";

interface Checkpoint {
  id: number;
  startTime: Date;
  endTime: Date | null;
  duration: string;
  description: string;
  isRunning: boolean;
  displayNumber?: number;
}

export default function ZohoHoursDashboard() {
  const { projects, loading: projectsLoading, error: projectsError, toggleProject, addProject, removeProject, clearAllProjects, addedProjectIds } = useProjects();
  const [currentView, setCurrentView] = useState<'dashboard' | 'task-matching'>('dashboard');
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<Checkpoint | null>(null);
  const tasksManager = dataProvider.getTasksManager();

  const stats = useMemo(() => dataProvider.getProjectStats(), []);

  const handleSaveCheckpoint = (checkpoint: Checkpoint) => {
    setSelectedCheckpoint(checkpoint);
    setCurrentView('task-matching');
  };

  const handleUpdateSelectedCheckpoint = (checkpointId: number | string, description: string) => {
    // In task matching mode, update the selected checkpoint description only if this is the selected checkpoint
    if (currentView === 'task-matching' && selectedCheckpoint && selectedCheckpoint.id === checkpointId) {
      setSelectedCheckpoint(prev => prev ? { ...prev, description } : null);
    }
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedCheckpoint(null);
  };

  // Update body background based on current view
  useEffect(() => {
    if (currentView === 'task-matching') {
      document.body.classList.add('bg-brand-50', 'dark:bg-brand-900');
      document.body.classList.remove('bg-gray-50');
    } else {
      document.body.classList.add('bg-gray-50');
      document.body.classList.remove('bg-brand-50', 'dark:bg-brand-900');
    }
  }, [currentView]);

  return (
    <div className="min-h-screen flex">
      {/* Left Timer Sidebar - always visible */}
      <div className="fixed left-0 top-0 h-screen w-72 lg:w-80 xl:w-[570px]">
        <TimerSidebar
          onSaveCheckpoint={handleSaveCheckpoint}
          onUpdateCheckpoint={handleUpdateSelectedCheckpoint}
          currentView={currentView}
          savedCheckpointId={selectedCheckpoint?.id || selectedCheckpoint?.id === 0 ? selectedCheckpoint.id : null}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 ml-72 lg:ml-80 xl:ml-[570px] relative">

        {currentView === 'task-matching' && selectedCheckpoint ? (
          <div className="relative z-10">
            <TaskMatching
              key={`task-matching-${selectedCheckpoint.id}-${selectedCheckpoint.description}`}
              checkpoint={selectedCheckpoint}
              tasks={tasksManager.tasks}
              onBack={handleBackToDashboard}
            />
          </div>
        ) : (
          <div className="space-y-8 relative z-10 p-6">
            {/* Page Header */}
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Zoho Hours Register Dashboard
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Monitor your projects and time tracking progress
                </p>
              </div>
              <a
                href="/profile"
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Settings
              </a>
            </div>

            {/* Stats Cards */}
            <StatsCards stats={stats} />

            {/* Projects Overview */}
            <ProjectsOverview
              projects={projects}
              onToggleProject={toggleProject}
              onAddProject={addProject}
              onRemoveProject={removeProject}
              onClearAllProjects={clearAllProjects}
              loading={projectsLoading}
              error={projectsError}
            />

            {/* Tasks List */}
            <TasksTable
              tasks={tasksManager.tasks}
              formatDate={tasksManager.formatDate}
              getStatusColor={tasksManager.getStatusColor}
              getPriorityColor={tasksManager.getPriorityColor}
              activeProjectIds={addedProjectIds}
              fetchTasksFromProjects={tasksManager.fetchTasksFromProjects}
            />
          </div>
        )}
      </div>
    </div>
  );
}
