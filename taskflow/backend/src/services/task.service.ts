import { prisma } from '../lib/prisma';
import { TaskStatus } from '@prisma/client';
import {
  NotFoundError,
  ForbiddenError,
} from '../utils/errors';
import type { CreateTaskInput, UpdateTaskInput, TaskQueryInput } from '../schemas';

export class TaskService {
  async getTasks(userId: string, query: TaskQueryInput) {
    const page = parseInt(query.page, 10);
    const limit = parseInt(query.limit, 10);
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = { userId };

    if (query.status) {
      where.status = query.status;
    }

    if (query.search) {
      where.title = {
        contains: query.search,
        mode: 'insensitive',
      };
    }

    // Get tasks and total count
    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          description: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.task.count({ where }),
    ]);

    return {
      success: true,
      tasks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getTaskById(taskId: string, userId: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
      },
    });

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    // Verify ownership
    if (task.userId !== userId) {
      throw new ForbiddenError('You do not have permission to access this task');
    }

    // Remove userId from response
    const { userId: _, ...taskData } = task;

    return {
      success: true,
      task: taskData,
    };
  }

  async createTask(userId: string, data: CreateTaskInput) {
    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        userId,
      },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      success: true,
      message: 'Task created successfully',
      task,
    };
  }

  async updateTask(taskId: string, userId: string, data: UpdateTaskInput) {
    // Check if task exists and user owns it
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
      select: { userId: true },
    });

    if (!existingTask) {
      throw new NotFoundError('Task not found');
    }

    if (existingTask.userId !== userId) {
      throw new ForbiddenError('You do not have permission to update this task');
    }

    // Update task
    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
      },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      success: true,
      message: 'Task updated successfully',
      task,
    };
  }

  async deleteTask(taskId: string, userId: string) {
    // Check if task exists and user owns it
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
      select: { userId: true },
    });

    if (!existingTask) {
      throw new NotFoundError('Task not found');
    }

    if (existingTask.userId !== userId) {
      throw new ForbiddenError('You do not have permission to delete this task');
    }

    // Delete task
    await prisma.task.delete({
      where: { id: taskId },
    });

    return {
      success: true,
      message: 'Task deleted successfully',
    };
  }

  async toggleTaskStatus(taskId: string, userId: string) {
    // Check if task exists and user owns it
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
      select: { userId: true, status: true },
    });

    if (!existingTask) {
      throw new NotFoundError('Task not found');
    }

    if (existingTask.userId !== userId) {
      throw new ForbiddenError('You do not have permission to update this task');
    }

    // Toggle status
    const newStatus = existingTask.status === TaskStatus.PENDING 
      ? TaskStatus.COMPLETED 
      : TaskStatus.PENDING;

    const task = await prisma.task.update({
      where: { id: taskId },
      data: { status: newStatus },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      success: true,
      message: 'Task status updated successfully',
      task,
    };
  }

  async getTaskStats(userId: string) {
    const [total, completed, pending] = await Promise.all([
      prisma.task.count({ where: { userId } }),
      prisma.task.count({ where: { userId, status: TaskStatus.COMPLETED } }),
      prisma.task.count({ where: { userId, status: TaskStatus.PENDING } }),
    ]);

    return {
      success: true,
      stats: {
        total,
        completed,
        pending,
      },
    };
  }
}

export const taskService = new TaskService();
