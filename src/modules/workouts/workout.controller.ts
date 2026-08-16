import { Response, NextFunction } from 'express';
import { workoutService } from './workout.service';
import { sendResponse } from '../../utils/response';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';

export class WorkoutController {
  async createWorkout(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const workout = await workoutService.createWorkout(req.user!.userId, req.body);
      return sendResponse(res, 201, {
        success: true,
        message: 'Workout plan created successfully.',
        data: workout,
      });
    } catch (error) {
      next(error);
    }
  }

  async getWorkouts(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await workoutService.getWorkouts(req.user!.userId, req.query as any);
      return sendResponse(res, 200, {
        success: true,
        data: result.workouts,
        meta: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async getWorkoutById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const workout = await workoutService.getWorkoutById(req.user!.userId, id);
      return sendResponse(res, 200, {
        success: true,
        data: workout,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateWorkout(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const workout = await workoutService.updateWorkout(
        req.user!.userId,
        id,
        req.body
      );
      return sendResponse(res, 200, {
        success: true,
        message: 'Workout plan updated successfully.',
        data: workout,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateWorkoutStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const workout = await workoutService.updateWorkoutStatus(
        req.user!.userId,
        id,
        req.body
      );
      return sendResponse(res, 200, {
        success: true,
        message: 'Workout status updated successfully.',
        data: workout,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteWorkout(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const result = await workoutService.deleteWorkout(req.user!.userId, id);
      return sendResponse(res, 200, {
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  async addComment(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const comment = await workoutService.addComment(
        req.user!.userId,
        id,
        req.body
      );
      return sendResponse(res, 201, {
        success: true,
        message: 'Comment added successfully.',
        data: comment,
      });
    } catch (error) {
      next(error);
    }
  }

  async getComments(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const comments = await workoutService.getComments(req.user!.userId, id);
      return sendResponse(res, 200, {
        success: true,
        data: comments,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const workoutController = new WorkoutController();
