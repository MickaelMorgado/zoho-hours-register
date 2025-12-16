// Zoho Projects Service
// Integrates Zoho API client with caching and data management

import { ZohoClient, ZohoConfig, ZohoProject, ZohoTask, ZohoTimeLog } from './zohoClient';
import { dummyProjects, dummyTasks } from './dummyProjects';

// ZohoServiceConfig extends ZohoConfig but adds service-specific options
export interface ZohoServiceConfig extends Omit<ZohoConfig, 'companyId'> {
  useCache?: boolean;
  cacheExpiry?: number; // in milliseconds
}

export interface ProjectWithTasks extends ZohoProject {
  tasks: ZohoTask[];
  progress: number;
  totalHours: number;
}

export interface CachedData<T> {
  data: T;
  timestamp: number;
  expiry: number;
}

export class ZohoService {
  private client: ZohoClient;
  private config: ZohoServiceConfig;
  private cache: Map<string, CachedData<any>> = new Map();

  constructor(config: ZohoServiceConfig) {
    this.config = {
      useCache: true,
      cacheExpiry: 5 * 60 * 1000, // 5 minutes
      ...config,
    };
    this.client = new ZohoClient(config);
  }

  private getCacheKey(key: string): string {
    return `zoho_${key}`;
  }

  private getCachedData<T>(key: string): T | null {
    if (!this.config.useCache) return null;

    const cacheKey = this.getCacheKey(key);
    const cached = this.cache.get(cacheKey);

    if (!cached) return null;

    const now = Date.now();
    if (now > cached.expiry) {
      this.cache.delete(cacheKey);
      return null;
    }

    return cached.data;
  }

  private setCachedData<T>(key: string, data: T): void {
    if (!this.config.useCache) return;

    const cacheKey = this.getCacheKey(key);
    const cached: CachedData<T> = {
      data,
      timestamp: Date.now(),
      expiry: Date.now() + this.config.cacheExpiry!,
    };

    this.cache.set(cacheKey, cached);
  }

  private clearCache(): void {
    this.cache.clear();
  }

  // Project methods
  async getProjects(): Promise<ZohoProject[]> {
    const cacheKey = 'projects';
    const cached = this.getCachedData<ZohoProject[]>(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const projects = await this.client.getProjects();
      this.setCachedData(cacheKey, projects);
      return projects;
    } catch (error) {
      console.error('Failed to fetch projects from Zoho API:', error);
      // Fallback to dummy data in development
      console.warn('Using dummy project data as fallback');
      return dummyProjects.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        status: p.status,
        created_date: p.startDate || new Date().toISOString(),
        owner_name: p.assignedUsers[0] || 'Unknown',
        owner_id: 'dummy',
      }));
    }
  }

  async getProject(projectId: number): Promise<ZohoProject> {
    const cacheKey = `project_${projectId}`;
    const cached = this.getCachedData<ZohoProject>(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const project = await this.client.getProject(projectId);
      this.setCachedData(cacheKey, project);
      return project;
    } catch (error) {
      console.error(`Failed to fetch project ${projectId} from Zoho API:`, error);
      throw error;
    }
  }

  async getProjectsWithTasks(): Promise<ProjectWithTasks[]> {
    const cacheKey = 'projects_with_tasks';
    const cached = this.getCachedData<ProjectWithTasks[]>(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const [projects, allTasks] = await Promise.all([
        this.getProjects(),
        this.getAllTasks(),
      ]);

      const projectsWithTasks = projects.map(project => {
        const projectTasks = allTasks.filter(task => task.project?.id === project.id);
        const completedTasks = projectTasks.filter(task => task.completed);
        const progress = projectTasks.length > 0
          ? Math.round((completedTasks.length / projectTasks.length) * 100)
          : 0;
        const totalHours = projectTasks.reduce((sum, task) => {
          // Note: Zoho API might not provide actual hours directly
          // This would need to be calculated from time logs
          return sum;
        }, 0);

        return {
          ...project,
          tasks: projectTasks,
          progress,
          totalHours,
        };
      });

      this.setCachedData(cacheKey, projectsWithTasks);
      return projectsWithTasks;
    } catch (error) {
      console.error('Failed to fetch projects with tasks from Zoho API:', error);
      // Fallback to dummy data
      console.warn('Using dummy project data with tasks as fallback');
      return dummyProjects.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        status: p.status,
        created_date: p.startDate || new Date().toISOString(),
        owner_name: p.assignedUsers[0] || 'Unknown',
        owner_id: 'dummy',
        tasks: dummyTasks.filter(t => t.projectId === p.id).map(t => ({
          id: t.id,
          name: t.name,
          description: '',
          completed: t.completed,
          status: t.status,
          priority: t.priority,
          assignee_name: t.assignedTo,
          created_time: new Date().toISOString(),
          last_modified_time: new Date().toISOString(),
          project: { id: p.id, name: p.name },
        })),
        progress: p.progress,
        totalHours: p.totalHours,
      }));
    }
  }

  // Task methods
  async getTasks(projectId?: number): Promise<ZohoTask[]> {
    const cacheKey = projectId ? `tasks_${projectId}` : 'tasks_all';
    const cached = this.getCachedData<ZohoTask[]>(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const tasks = await this.client.getTasks(projectId);
      this.setCachedData(cacheKey, tasks);
      return tasks;
    } catch (error) {
      console.error(`Failed to fetch tasks from Zoho API:`, error);
      // Fallback to dummy data
      console.warn('Using dummy task data as fallback');
      return projectId
        ? dummyTasks.filter(t => t.projectId === projectId).map(t => ({
            id: t.id,
            name: t.name,
            description: '',
            completed: t.completed,
            status: t.status,
            priority: t.priority,
            assignee_name: t.assignedTo,
            created_time: new Date().toISOString(),
            last_modified_time: new Date().toISOString(),
            project: { id: projectId, name: dummyProjects.find(p => p.id === projectId)?.name || 'Unknown' },
          }))
        : dummyTasks.map(t => ({
            id: t.id,
            name: t.name,
            description: '',
            completed: t.completed,
            status: t.status,
            priority: t.priority,
            assignee_name: t.assignedTo,
            created_time: new Date().toISOString(),
            last_modified_time: new Date().toISOString(),
            project: { id: t.projectId, name: dummyProjects.find(p => p.id === t.projectId)?.name || 'Unknown' },
          }));
    }
  }

  async getAllTasks(): Promise<ZohoTask[]> {
    return this.getTasks(); // Get all tasks
  }

  async getTask(projectId: number, taskId: number): Promise<ZohoTask> {
    const cacheKey = `task_${projectId}_${taskId}`;
    const cached = this.getCachedData<ZohoTask>(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const task = await this.client.getTask(projectId, taskId);
      this.setCachedData(cacheKey, task);
      return task;
    } catch (error) {
      console.error(`Failed to fetch task ${taskId} from Zoho API:`, error);
      throw error;
    }
  }

  // Time log methods
  async getTimeLogs(
    projectId?: number,
    taskId?: number,
    params?: {
      from?: string;
      to?: string;
      user?: string;
    }
  ): Promise<ZohoTimeLog[]> {
    const cacheKey = `timelogs_${projectId || 'all'}_${taskId || 'all'}_${JSON.stringify(params)}`;
    const cached = this.getCachedData<ZohoTimeLog[]>(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const logs = await this.client.getTimeLogs(projectId, taskId, params);
      this.setCachedData(cacheKey, logs);
      return logs;
    } catch (error) {
      console.error('Failed to fetch time logs from Zoho API:', error);
      return []; // Return empty array as fallback
    }
  }

  async createTimeLog(
    projectId: number,
    taskId: number,
    timeLog: {
      date: string;
      hours: number;
      minutes: number;
      notes?: string;
      bill_status?: 'Billable' | 'Non Billable';
    }
  ): Promise<ZohoTimeLog> {
    try {
      const newLog = await this.client.createTimeLog(projectId, taskId, timeLog);

      // Clear relevant caches
      this.clearCache();

      return newLog;
    } catch (error) {
      console.error('Failed to create time log in Zoho API:', error);
      throw error;
    }
  }

  async updateTimeLog(
    projectId: number,
    taskId: number,
    logId: number,
    updates: Partial<{
      date: string;
      hours: number;
      minutes: number;
      notes: string;
      bill_status: 'Billable' | 'Non Billable';
    }>
  ): Promise<ZohoTimeLog> {
    try {
      const updatedLog = await this.client.updateTimeLog(projectId, taskId, logId, updates);

      // Clear relevant caches
      this.clearCache();

      return updatedLog;
    } catch (error) {
      console.error('Failed to update time log in Zoho API:', error);
      throw error;
    }
  }

  async deleteTimeLog(projectId: number, taskId: number, logId: number): Promise<void> {
    try {
      await this.client.deleteTimeLog(projectId, taskId, logId);

      // Clear relevant caches
      this.clearCache();
    } catch (error) {
      console.error('Failed to delete time log in Zoho API:', error);
      throw error;
    }
  }

  // Utility methods
  async testConnection(): Promise<boolean> {
    try {
      await this.client.testConnection();
      return true;
    } catch (error) {
      console.error('Zoho API connection test failed:', error);
      return false;
    }
  }

  refreshCache(): void {
    this.clearCache();
  }
}

// Environment configuration
function getZohoConfig(): ZohoServiceConfig {
  // For client-side usage, we need to use NEXT_PUBLIC variables or API routes
  // For now, we'll use dummy data since direct API calls from client are blocked by CORS
  const portalName = process.env.NEXT_PUBLIC_ZOHO_PORTAL_NAME || 'your-portal-id';

  console.log('🔧 Zoho Config Debug (Client):');
  console.log('- NEXT_PUBLIC_ZOHO_PORTAL_NAME:', portalName);

  // Client-side can only use public variables and must go through API routes for actual API calls
  return {
    portalName,
    apiToken: 'dummy-token', // Will be handled by API routes
    useCache: false, // Disable client-side caching for now
    cacheExpiry: 5 * 60 * 1000, // 5 minutes
  };
}

// Singleton instance
let zohoServiceInstance: ZohoService | null = null;

export function getZohoService(): ZohoService {
  if (!zohoServiceInstance) {
    const config = getZohoConfig();
    zohoServiceInstance = new ZohoService(config);
  }
  return zohoServiceInstance;
}

// Export types
export type { ZohoConfig, ZohoProject, ZohoTask, ZohoTimeLog };
