'use client';

import { ConnectionStatus } from "@/components/dashboard/ConnectionStatus";
import { ProjectsOverview } from "@/components/dashboard/ProjectsOverview";
import { SetupWizard } from "@/components/dashboard/SetupWizard";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { TaskMatching } from "@/components/dashboard/TaskMatching";
import { TasksTable } from "@/components/dashboard/TasksTable";
import { TimerSidebar } from "@/components/dashboard/TimerSidebar";
import { useAuth } from "@/context/AuthContext";
import { useProjects } from "@/hooks/useProjects";
import { dataProvider } from "@/lib/dataProvider";
import { Checkpoint } from "@/types";
import { useEffect, useMemo, useState, useCallback, useRef } from "react";

export default function ZohoHoursDashboard() {
  const { status, credentials } = useAuth();
  const { projects, loading: projectsLoading, error: projectsError, toggleProject, addProject, removeProject, clearAllProjects, addedProjectIds } = useProjects();
  const [currentView, setCurrentView] = useState<'dashboard' | 'task-matching'>('dashboard');
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<Checkpoint | null>(null);
  const tasksManager = useMemo(() => dataProvider.getTasksManager(), []);

  // Track which checkpoints have been logged — persisted in localStorage
  // Lazy initializer to avoid the save effect overwriting stored data on first render.
  const [loggedCheckpointIds, setLoggedCheckpointIds] = useState<Set<number>>(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      const saved = localStorage.getItem('logged-checkpoint-ids');
      if (saved) {
        const ids: number[] = JSON.parse(saved);
        return new Set(ids);
      }
    } catch (e) {
      console.warn('Error loading logged checkpoint IDs:', e);
    }
    return new Set();
  });

  const loggedIdsInitializedRef = useRef(false);

  // Persist to localStorage whenever the set changes (after initialization)
  useEffect(() => {
    if (!loggedIdsInitializedRef.current) {
      loggedIdsInitializedRef.current = true;
      return;
    }
    localStorage.setItem('logged-checkpoint-ids', JSON.stringify([...loggedCheckpointIds]));
  }, [loggedCheckpointIds]);

  const handleCheckpointLogged = useCallback((checkpointId: number) => {
    setLoggedCheckpointIds(prev => {
      const next = new Set(prev);
      next.add(checkpointId);
      return next;
    });
  }, []);

  const handleToggleCheckpointLogged = useCallback((checkpointId: number) => {
    setLoggedCheckpointIds(prev => {
      const next = new Set(prev);
      if (next.has(checkpointId)) {
        next.delete(checkpointId);
      } else {
        next.add(checkpointId);
      }
      return next;
    });
  }, []);

  const stats = useMemo(() => ({
    activeProjects: projects.filter(p => p.isActive).length,
    completedTasks: projects.reduce((sum, p) => sum + p.completedTasks, 0),
    totalHours: projects.reduce((sum, p) => sum + p.totalHours, 0).toFixed(1),
    totalProjects: projects.length,
  }), [projects]);

  const handleSaveCheckpoint = (checkpoint: Checkpoint) => {
    setSelectedCheckpoint(checkpoint);
    setCurrentView('task-matching');
  };

  const handleUpdateSelectedCheckpoint = (checkpointId: number | string, description: string) => {
    // In task matching mode, update the selected checkpoint description
    if (currentView === 'task-matching' && selectedCheckpoint) {
      const isMatch = selectedCheckpoint.id === checkpointId
        || (checkpointId === 'current' && selectedCheckpoint.isRunning);
      if (isMatch) {
        setSelectedCheckpoint(prev => prev ? { ...prev, description } : null);
      }
    }
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedCheckpoint(null);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Timer Sidebar - always visible */}
      <div className="fixed left-0 top-0 h-screen w-64 lg:w-72 xl:w-96">
        <TimerSidebar
          onSaveCheckpoint={handleSaveCheckpoint}
          onUpdateCheckpoint={handleUpdateSelectedCheckpoint}
          currentView={currentView}
          savedCheckpointId={selectedCheckpoint?.id || selectedCheckpoint?.id === 0 ? selectedCheckpoint.id : null}
          loggedCheckpointIds={loggedCheckpointIds}
          onToggleCheckpointLogged={handleToggleCheckpointLogged}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 ml-64 lg:ml-72 xl:ml-96 relative">
          {currentView === 'task-matching' && selectedCheckpoint ? (
            <div className="relative z-10">
              <TaskMatching
                key={`task-matching-${selectedCheckpoint.id}`}
                checkpoint={selectedCheckpoint}
                tasks={tasksManager.tasks}
                onBack={handleBackToDashboard}
                activeProjectIds={addedProjectIds}
                fetchTasksFromProjects={tasksManager.fetchTasksFromProjects}
                currentUserName={credentials?.displayName || ''}
                onCheckpointLogged={handleCheckpointLogged}
                projects={projects.map(p => ({ id: p.id, name: p.name }))}
              />
            </div>
          ) : (
            <div className="space-y-8 relative z-10 p-6">
            {/* Page Header */}
            <div className="mb-8 flex items-center justify-between animate-fade-slide-down stagger-1">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Zoho Hours Register Dashboard
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Monitor your projects and time tracking progress
                </p>
              </div>
              <div className="flex items-center gap-3">
                <ConnectionStatus />
                <a
                  href="/profile"
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Settings
                </a>
              </div>
            </div>

            {/* Auth-gated dashboard content */}
            {status === 'loading' ? (
              <div className="flex flex-col items-center justify-center py-24">
                <svg
                  className="h-8 w-8 animate-spin text-blue-500 dark:text-blue-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                  Checking Zoho connection...
                </p>
              </div>
            ) : status !== 'connected' ? (
              <div className="flex flex-col items-center justify-center py-16">
                <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
                  Connect your Zoho account to start tracking hours and managing projects.
                </p>
                <SetupWizard />
              </div>
            ) : (
              <>
                {/* Stats Cards */}
                <div className="animate-fade-slide-up stagger-2">
                  <StatsCards stats={stats} />
                </div>

                {/* Projects Overview */}
                <div className="animate-fade-slide-up stagger-3">
                  <ProjectsOverview
                    projects={projects}
                    onToggleProject={toggleProject}
                    onAddProject={addProject}
                    onRemoveProject={removeProject}
                    onClearAllProjects={clearAllProjects}
                    loading={projectsLoading}
                    error={projectsError}
                  />
                </div>

                {/* Tasks List */}
                <div className="animate-fade-slide-up stagger-4">
                  <TasksTable
                    tasks={tasksManager.tasks}
                    formatDate={tasksManager.formatDate}
                    getStatusColor={tasksManager.getStatusColor}
                    getPriorityColor={tasksManager.getPriorityColor}
                    activeProjectIds={addedProjectIds}
                    fetchTasksFromProjects={tasksManager.fetchTasksFromProjects}
                    projects={projects.map(p => ({ id: p.id, name: p.name }))}
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
