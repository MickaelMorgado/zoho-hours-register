import { useEffect, useState } from 'react';

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
  addProject: (projectId: string) => Promise<void>;
  removeProject: (projectId: string) => void;
  clearAllProjects: () => void;
  addedProjectIds: string[];
}

const STORAGE_KEY = 'user_projects';

export function useProjects(): UseProjectsReturn {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load projects from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    console.log('🔍 Loading projects from localStorage:', stored);
    if (stored) {
      try {
        const savedProjects = JSON.parse(stored);
        console.log('✅ Loaded projects from localStorage:', savedProjects);
        setProjects(savedProjects);
      } catch (e) {
        console.warn('❌ Error parsing stored projects:', e);
        setError('Failed to load saved projects');
      }
    } else {
      console.log('📭 No projects found in localStorage');
    }
  }, []);

  // Save projects to localStorage whenever projects change
  useEffect(() => {
    if (projects.length >= 0) { // Save even when empty
      try {
        console.log('💾 Saving projects to localStorage:', projects);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
        console.log('✅ Projects saved to localStorage successfully');
      } catch (e) {
        console.warn('❌ Error saving projects to localStorage:', e);
      }
    }
  }, [projects]);

  const addProject = async (projectIdStr: string) => {
    console.log('➕ Adding project with input:', projectIdStr);
    const projectId = projectIdStr.trim();

    if (!projectId || projectId === '') {
      console.error('❌ Invalid project ID format:', projectIdStr);
      setError('Invalid project ID format');
      return;
    }

    console.log('🔍 Checking if project exists:', projectId);
    console.log('📋 Current projects:', projects.map(p => p.id));
    if (projects.some(p => p.id === projectId)) {
      console.warn('⚠️ Project already exists:', projectId);
      setError('Project already exists');
      return;
    }

    console.log('✅ Creating new project with ID:', projectId);
    // Create a new project with basic info
    const newProject: Project = {
      id: projectId,
      name: `Project ${projectId}`,
      description: `Zoho Project ${projectId}`,
      tasks: 0,
      completedTasks: 0,
      totalHours: 0,
      status: 'active',
      isActive: true,
    };

    console.log('📝 New project object:', newProject);
    setProjects(prev => [...prev, newProject]);
    setError(null); // Clear any previous errors
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
