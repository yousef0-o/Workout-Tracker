import { Request, Response, NextFunction } from 'express';
import { exerciseService } from './exercise.service';
import { sendResponse } from '../../utils/response';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';

export class ExerciseController {
  async getExercises(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const result = await exerciseService.getExercises(req.query as any, userId);
      return sendResponse(res, 200, {
        success: true,
        data: result.exercises,
        meta: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async getExerciseById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const exercise = await exerciseService.getExerciseById(id);
      return sendResponse(res, 200, {
        success: true,
        data: exercise,
      });
    } catch (error) {
      next(error);
    }
  }

  async createCustomExercise(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const exercise = await exerciseService.createCustomExercise(req.user!.userId, req.body);
      return sendResponse(res, 201, {
        success: true,
        message: 'Custom exercise created successfully.',
        data: exercise,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const exerciseController = new ExerciseController();
