import { apiClient } from '../lib/api-client';

export type TaskStatus = 'PENDING' | 'COMPLETED';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskData {
  title: string;
  description?: string;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
}

export interface TasksResponse {
  success: boolean;
  tasks: Task[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface TaskResponse {
  success: boolean;
  task: Task;
  message?: string;
}

export interface TaskStatsResponse {
  success: boolean;
  stats: {
    total: number;
    completed: number;
    pending: number;
  };
}

export interface TaskQueryParams {
  page?: number;
  limit?: number;
  status?: TaskStatus;
  search?: string;
}

export const taskApi = {
  getTasks: async (params?: TaskQueryParams): Promise<TasksResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.search) queryParams.append('search', params.search);

    const response = await apiClient.get<TasksResponse>(
      `/tasks?${queryParams.toString()}`
    );
    return response.data;
  },

  getTaskById: async (id: string): Promise<TaskResponse> => {
    const response = await apiClient.get<TaskResponse>(`/tasks/${id}`);
    return response.data;
  },

  createTask: async (data: CreateTaskData): Promise<TaskResponse> => {
    const response = await apiClient.post<TaskResponse>('/tasks', data);
    return response.data;
  },

  updateTask: async (id: string, data: UpdateTaskData): Promise<TaskResponse> => {
    const response = await apiClient.patch<TaskResponse>(`/tasks/${id}`, data);
    return response.data;
  },

  deleteTask: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(`/tasks/${id}`);
    return response.data;
  },

  toggleTaskStatus: async (id: string): Promise<TaskResponse> => {
    const response = await apiClient.patch<TaskResponse>(`/tasks/${id}/toggle`);
    return response.data;
  },

  getStats: async (): Promise<TaskStatsResponse> => {
    const response = await apiClient.get<TaskStatsResponse>('/tasks/stats');
    return response.data;
  },
};
