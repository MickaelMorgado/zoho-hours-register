import { useEffect, useState } from 'react';
import { zohoFetch } from '@/lib/zohoFetch';

export interface Project {
  id: string;
  name: string;
  description: string;
  tasks: number;
  completedTasks: number;
  totalHours: number;
  status: string;
  isActive: boolean;
}

export interface UseProjectsReturn {
  projects: Project[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  toggleProject: (projectId: string) => void;
  addProject: (projectId: string, projectName?: string) => Promise<'added' | 'exists'>;
  removeProject: (projectId: string) => void;
  clearAllProjects: () => void;
  addedProjectIds: string[];
}

const STORAGE_KEY = 'user_projects';

export function useProjects(): UseProjectsReturn {
  const [projects, setProjects] = useState<Project[]>(() => {
    // Lazy initializer: load from localStorage synchronously on first render
    // This avoids the race condition where the save effect overwrites stored data
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('Loaded projects from localStorage:', parsed);
        return parsed;
      }
    } catch (e) {
      console.warn('Error parsing stored projects:', e);
    }
    return [];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Save projects to localStorage whenever projects change
  useEffect(() => {
    try {
      console.log('Saving projects to localStorage:', projects);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    } catch (e) {
      console.warn('Error saving projects to localStorage:', e);
    }
  }, [projects]);

  const addProject = async (projectIdStr: string, projectName?: string): Promise<'added' | 'exists'> => {
    console.log('➕ Adding project with input:', projectIdStr, 'name:', projectName);
    const projectId = projectIdStr.trim();

    if (!projectId || projectId === '') {
      console.error('❌ Invalid project ID format:', projectIdStr);
      throw new Error('Invalid project ID format');
    }

    console.log('🔍 Checking if project exists:', projectId);
    console.log('📋 Current projects:', projects.map(p => p.id));
    if (projects.some(p => p.id === projectId)) {
      console.warn('⚠️ Project already exists:', projectId);
      return 'exists';
    }

    // Determine the project name
    let resolvedName = projectName?.trim() || '';

    // If no name provided, try to fetch it from the Zoho API
    if (!resolvedName) {
      try {
        console.log('🌐 Fetching project name from Zoho API for ID:', projectId);
        const response = await zohoFetch(`/api/zoho/projects/${projectId}`);
        if (response.ok) {
          const data = await response.json();
          resolvedName = data.project?.name || '';
          console.log('✅ Fetched project name from Zoho:', resolvedName);
        } else {
          console.warn('⚠️ Failed to fetch project from Zoho API, status:', response.status);
        }
      } catch (e) {
        console.warn('⚠️ Error fetching project name from Zoho API:', e);
      }
    }

    // Fall back to generic name if still empty (never expose raw numeric IDs to users)
    if (!resolvedName) {
      resolvedName = 'Unnamed Project';
    }

    console.log('✅ Creating new project with ID:', projectId, 'name:', resolvedName);
    const newProject: Project = {
      id: projectId,
      name: resolvedName,
      description: resolvedName,
      tasks: 0,
      completedTasks: 0,
      totalHours: 0,
      status: 'active',
      isActive: true,
    };

    console.log('📝 New project object:', newProject);
    setProjects(prev => [...prev, newProject]);
    setError(null); // Clear any previous errors
    return 'added';
  };

  const removeProject = (projectId: string) => {
    console.log('🗑️ Removing project:', projectId);
    console.log('📋 Projects before removal:', projects);
    setProjects(prev => {
      const updatedProjects = prev.filter((p: Project) => p.id !== projectId);
      console.log('📋 Projects after removal:', updatedProjects);
      return updatedProjects;
    });
    setError(null);
  };

  const toggleProject = (projectId: string) => {
    setProjects(prevProjects =>
      prevProjects.map(project =>
        project.id === projectId
          ? { ...project, isActive: !project.isActive }
          : project
      )
    );
  };

  const clearAllProjects = () => {
    console.log('🧹 Clearing all projects from localStorage');
    console.log('📋 Projects before clearing:', projects);
    setProjects([]);
    localStorage.removeItem(STORAGE_KEY);
    console.log('✅ All projects cleared from localStorage');
    setError(null);
  };

  const refetch = async () => {
    // For static storage, refetch is a no-op since data is local
    setLoading(false);
    setError(null);
  };

  const addedProjectIds = projects.map(p => p.id);

  return {
    projects,
    loading,
    error,
    refetch,
    toggleProject,
    addProject,
    removeProject,
    clearAllProjects,
    addedProjectIds,
  };
}
