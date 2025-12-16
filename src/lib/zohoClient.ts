// Zoho Projects API Client
// Handles authentication and API calls to Zoho Projects

export interface ZohoConfig {
  clientId?: string;
  clientSecret?: string;
  portalName: string;
  baseUrl?: string;
  // Legacy support
  apiToken?: string;
}

export interface ZohoProject {
  id: number;
  name: string;
  description?: string;
  status: string;
  created_date: string;
  owner_name: string;
  owner_id: string;
}

export interface ZohoTask {
  id: number;
  name: string;
  description?: string;
  completed: boolean;
  status: string;
  priority: string;
  assignee_id?: string;
  assignee_name?: string;
  created_time: string;
  last_modified_time: string;
  duration?: string;
  percent_complete?: number;
  project?: {
    id: number;
    name: string;
  };
}

export interface ZohoTimeLog {
  id?: number;
  task_id: number;
  project_id: number;
  owner: string;
  owner_name: string;
  log_date: string;
  hours: number;
  minutes: number;
  total_minutes: number;
  notes?: string;
  bill_status?: string;
  created_time?: string;
  last_modified_time?: string;
}

export class ZohoClient {
  private config: ZohoConfig;

  constructor(config: ZohoConfig) {
    this.config = config;
  }

  private getBaseUrl(): string {
    return 'https://projectsapi.zoho.com/restapi';
  }

  private getPortalUrl(portalId?: string): string {
    const portal = portalId || this.config.portalName;
    return `${this.getBaseUrl()}/portal/${portal}`;
  }

  private getAuthHeaders(): HeadersInit {
    // Try different auth formats for Self Client vs OAuth tokens
    const token = this.config.apiToken;
    if (!token) {
      throw new Error('No API token provided');
    }

    // For Self Client tokens, try Bearer format first
    if (token.startsWith('1000.')) {
      return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      };
    }

    // For OAuth tokens, use Zoho-oauthtoken format
    return {
      'Authorization': `Zoho-oauthtoken ${token}`,
      'Content-Type': 'application/json',
    };
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    portalId?: string
  ): Promise<T> {
    const baseUrl = this.getPortalUrl(portalId);
    const url = `${baseUrl}/${endpoint}`;

    console.log('🔗 Zoho API Request URL:', url);
    console.log('🔧 Request Method:', options.method || 'GET');

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Zoho API Error Details:', {
          status: response.status,
          statusText: response.statusText,
          errorData,
          url: response.url
        });

        // Extract meaningful error message from Zoho API response
        let errorMessage = 'Unknown error';
        if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = typeof errorData.error === 'string' ? errorData.error : JSON.stringify(errorData.error);
        } else if (errorData.status && errorData.status.message) {
          errorMessage = errorData.status.message;
        } else if (response.status === 401) {
          errorMessage = 'Invalid OAuth access token';
        } else if (response.status === 403) {
          errorMessage = 'Access forbidden - check your permissions';
        } else if (response.status === 404) {
          errorMessage = 'Resource not found';
        } else if (Object.keys(errorData).length > 0) {
          // Try to stringify the error data, but avoid [object Object]
          errorMessage = JSON.stringify(errorData, null, 2);
        }

        throw new Error(`Zoho API Error: ${response.status} ${response.statusText} - ${errorMessage}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Zoho API request failed:', error);
      throw error;
    }
  }

  // Projects API methods
  async getProjects(): Promise<ZohoProject[]> {
    const response = await this.makeRequest<{ projects: ZohoProject[] }>('projects/');
    return response.projects || [];
  }

  async getProject(projectId: number): Promise<ZohoProject> {
    const response = await this.makeRequest<{ projects: [ZohoProject] }>(
      `projects/${projectId}/`
    );
    return response.projects[0];
  }

  // Tasks API methods
  async getTasks(projectId?: string): Promise<ZohoTask[]> {
    const endpoint = projectId
      ? `projects/${projectId}/tasks/`
      : 'tasks/';

    const response = await this.makeRequest<{ tasks: ZohoTask[] }>(endpoint);
    return response.tasks || [];
  }

  async getTask(projectId: number, taskId: number): Promise<ZohoTask> {
    const response = await this.makeRequest<{ tasks: [ZohoTask] }>(
      `projects/${projectId}/tasks/${taskId}/`
    );
    return response.tasks[0];
  }

  // Time Logs API methods
  async getTimeLogs(
    projectId?: number,
    taskId?: number,
    params?: {
      from?: string;
      to?: string;
      user?: string;
    }
  ): Promise<ZohoTimeLog[]> {
    let endpoint = 'timelogs/';

    if (projectId && taskId) {
      endpoint = `projects/${projectId}/tasks/${taskId}/logs/`;
    } else if (projectId) {
      endpoint = `projects/${projectId}/logs/`;
    }

    // Add query parameters
    const queryParams = new URLSearchParams();
    if (params?.from) queryParams.append('from', params.from);
    if (params?.to) queryParams.append('to', params.to);
    if (params?.user) queryParams.append('user', params.user);

    const queryString = queryParams.toString();
    if (queryString) {
      endpoint += `?${queryString}`;
    }

    const response = await this.makeRequest<{ timelogs: ZohoTimeLog[] }>(endpoint);
    return response.timelogs || [];
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
    const payload = {
      date: timeLog.date,
      hours: timeLog.hours,
      minutes: timeLog.minutes,
      notes: timeLog.notes || '',
      bill_status: timeLog.bill_status || 'Billable',
    };

    const response = await this.makeRequest<{ timelogs: [ZohoTimeLog] }>(
      `projects/${projectId}/tasks/${taskId}/logs/`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );

    return response.timelogs[0];
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
    const response = await this.makeRequest<{ timelogs: [ZohoTimeLog] }>(
      `projects/${projectId}/tasks/${taskId}/logs/${logId}/`,
      {
        method: 'PUT',
        body: JSON.stringify(updates),
      }
    );

    return response.timelogs[0];
  }

  async deleteTimeLog(
    projectId: number,
    taskId: number,
    logId: number
  ): Promise<void> {
    await this.makeRequest(
      `projects/${projectId}/tasks/${taskId}/logs/${logId}/`,
      {
        method: 'DELETE',
      }
    );
  }

  // Utility methods
  async testConnection(): Promise<boolean> {
    try {
      await this.getProjects();
      return true;
    } catch (error) {
      console.error('Zoho API connection test failed:', error);
      return false;
    }
  }

  // Helper method to format duration for display
  static formatDuration(hours: number, minutes: number): string {
    const totalMinutes = hours * 60 + minutes;
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  }

  // Helper method to parse duration string
  static parseDuration(duration: string): { hours: number; minutes: number } {
    const [hours, minutes] = duration.split(':').map(Number);
    return { hours, minutes };
  }
}

// Factory function to create configured client
export function s(config: ZohoConfig): ZohoClient {
  return new ZohoClient(config);
}

// Default export
export default ZohoClient;
