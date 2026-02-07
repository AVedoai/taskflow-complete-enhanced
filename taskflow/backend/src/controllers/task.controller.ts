import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { taskService } from '../services/task.service';
import type { CreateTaskInput, UpdateTaskInput, TaskQueryInput } from '../schemas';

export class TaskController {
  async getTasks(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.userId;
      const query = req.query as unknown as TaskQueryInput;
      const result = await taskService.getTasks(userId, query);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getTaskById(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.userId;
      const taskId = req.params.id;
      const result = await taskService.getTaskById(taskId, userId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async createTask(
    req: AuthRequest<{}, {}, CreateTaskInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.userId;
      const result = await taskService.createTask(userId, req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async updateTask(
    req: AuthRequest<{ id: string }, {}, UpdateTaskInput>,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.userId;
      const taskId = req.params.id;
      const result = await taskService.updateTask(taskId, userId, req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async deleteTask(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.userId;
      const taskId = req.params.id;
      const result = await taskService.deleteTask(taskId, userId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async toggleTaskStatus(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.userId;
      const taskId = req.params.id;
      const result = await taskService.toggleTaskStatus(taskId, userId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getTaskStats(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user!.userId;
      const result = await taskService.getTaskStats(userId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const taskController = new TaskController();
