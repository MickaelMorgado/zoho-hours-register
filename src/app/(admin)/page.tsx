'use client';

import { ProjectsOverview } from "@/components/dashboard/ProjectsOverview";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { TaskMatching } from "@/components/dashboard/TaskMatching";
import { TasksTable } from "@/components/dashboard/TasksTable";
import { TimerSidebar } from "@/components/dashboard/TimerSidebar";
import { dataProvider } from "@/lib/dataProvider";
import { useMemo, useState } from "react";

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
  const [projects, setProjects] = useState(dataProvider.getProjectsManager().projects);
  const [currentView, setCurrentView] = useState<'dashboard' | 'task-matching'>('dashboard');
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<Checkpoint | null>(null);
  const tasksManager = dataProvider.getTasksManager();

  const stats = useMemo(() => dataProvider.getProjectStats(), []);

  const handleToggleProject = (projectId: number) => {
    setProjects(prevProjects =>
      prevProjects.map(p =>
        p.id === projectId ? { ...p, isActive: !p.isActive } : p
      )
    );
  };

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
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Zoho Hours Register Dashboard
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Monitor your projects and time tracking progress
              </p>
            </div>

            {/* Stats Cards */}
            <StatsCards stats={stats} />

            {/* Projects Overview */}
            <ProjectsOverview
              projects={projects}
              onToggleProject={handleToggleProject}
            />

            {/* Tasks List */}
            <TasksTable
              tasks={tasksManager.tasks}
              formatDate={tasksManager.formatDate}
              getStatusColor={tasksManager.getStatusColor}
              getPriorityColor={tasksManager.getPriorityColor}
            />
          </div>
        )}
      </div>
    </div>
  );
}
