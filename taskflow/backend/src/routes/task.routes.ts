import { Router } from 'express';
import { taskController } from '../controllers/task.controller';
import { authenticate } from '../middleware/auth';
import { validateBody, validateQuery } from '../middleware/validate';
import {
  createTaskSchema,
  updateTaskSchema,
  taskQuerySchema,
} from '../schemas';

const router = Router();

// All task routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks for authenticated user
 * @access  Private
 */
router.get(
  '/',
  validateQuery(taskQuerySchema),
  taskController.getTasks.bind(taskController)
);

/**
 * @route   GET /api/tasks/stats
 * @desc    Get task statistics
 * @access  Private
 */
router.get(
  '/stats',
  taskController.getTaskStats.bind(taskController)
);

/**
 * @route   GET /api/tasks/:id
 * @desc    Get single task by ID
 * @access  Private
 */
router.get(
  '/:id',
  taskController.getTaskById.bind(taskController)
);

/**
 * @route   POST /api/tasks
 * @desc    Create a new task
 * @access  Private
 */
router.post(
  '/',
  validateBody(createTaskSchema),
  taskController.createTask.bind(taskController)
);

/**
 * @route   PATCH /api/tasks/:id
 * @desc    Update a task
 * @access  Private
 */
router.patch(
  '/:id',
  validateBody(updateTaskSchema),
  taskController.updateTask.bind(taskController)
);

/**
 * @route   PATCH /api/tasks/:id/toggle
 * @desc    Toggle task status
 * @access  Private
 */
router.patch(
  '/:id/toggle',
  taskController.toggleTaskStatus.bind(taskController)
);

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete a task
 * @access  Private
 */
router.delete(
  '/:id',
  taskController.deleteTask.bind(taskController)
);

export default router;
