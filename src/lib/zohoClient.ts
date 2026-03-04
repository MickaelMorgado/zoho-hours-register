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
  id_string?: string;
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
  id?: string;
  task_id: string;
  project_id: string;
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

/**
 * Custom error class that preserves the HTTP status code from the Zoho API.
 * This allows API routes to propagate the correct status (e.g. 401) to the client,
 * enabling zohoFetch auto-refresh to detect expired tokens.
 */
export class ZohoApiError extends Error {
  public readonly statusCode: number;
  public readonly statusText: string;

  constructor(statusCode: number, statusText: string, message: string) {
    super(message);
    this.name = 'ZohoApiError';
    this.statusCode = statusCode;
    this.statusText = statusText;
  }
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
      };
    }

    // For OAuth tokens, use Zoho-oauthtoken format
    return {
      'Authorization': `Zoho-oauthtoken ${token}`,
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

        throw new ZohoApiError(response.status, response.statusText, errorMessage);
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

  async getProject(projectId: string): Promise<ZohoProject> {
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

  async getTask(projectId: string, taskId: string): Promise<ZohoTask> {
    const response = await this.makeRequest<{ tasks: [ZohoTask] }>(
      `projects/${projectId}/tasks/${taskId}/`
    );
    return response.tasks[0];
  }

  // Time Logs API methods
  async getTimeLogs(
    projectId?: string,
    taskId?: string,
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
    projectId: string,
    taskId: string,
    timeLog: {
      date: string;
      hours: number;
      minutes: number;
      notes?: string;
      bill_status?: 'Billable' | 'Non Billable';
      start_time?: string;
      end_time?: string;
    }
  ): Promise<ZohoTimeLog> {
    // Zoho expects hours in "HH:MM" format (e.g. "02:30")
    const hoursFormatted = `${String(timeLog.hours).padStart(2, '0')}:${String(timeLog.minutes).padStart(2, '0')}`;

    const params = new URLSearchParams();
    params.append('date', timeLog.date);
    params.append('hours', hoursFormatted);
    if (timeLog.notes) params.append('notes', timeLog.notes);
    params.append('bill_status', timeLog.bill_status || 'Billable');
    if (timeLog.start_time) params.append('start_time', timeLog.start_time);
    if (timeLog.end_time) params.append('end_time', timeLog.end_time);

    const response = await this.makeRequest<{ timelogs: [ZohoTimeLog] }>(
      `projects/${projectId}/tasks/${taskId}/logs/`,
      {
        method: 'POST',
        body: params.toString(),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return response.timelogs[0];
  }

  async updateTimeLog(
    projectId: string,
    taskId: string,
    logId: string,
    updates: Partial<{
      date: string;
      hours: number;
      minutes: number;
      notes: string;
      bill_status: 'Billable' | 'Non Billable';
    }>
  ): Promise<ZohoTimeLog> {
    const params = new URLSearchParams();
    if (updates.date) params.append('date', updates.date);
    if (updates.hours !== undefined) params.append('hours', String(updates.hours));
    if (updates.minutes !== undefined) params.append('minutes', String(updates.minutes));
    if (updates.notes !== undefined) params.append('notes', updates.notes);
    if (updates.bill_status) params.append('bill_status', updates.bill_status);

    const response = await this.makeRequest<{ timelogs: [ZohoTimeLog] }>(
      `projects/${projectId}/tasks/${taskId}/logs/${logId}/`,
      {
        method: 'PUT',
        body: params.toString(),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    return response.timelogs[0];
  }

  async deleteTimeLog(
    projectId: string,
    taskId: string,
    logId: string
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
