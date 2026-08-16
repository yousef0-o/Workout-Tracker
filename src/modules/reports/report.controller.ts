import { Response, NextFunction } from 'express';
import { reportService } from './report.service';
import { sendResponse } from '../../utils/response';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';

export class ReportController {
  async getSummary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const summary = await reportService.getSummary(req.user!.userId, req.query as any);
      return sendResponse(res, 200, {
        success: true,
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  }

  async getExerciseProgress(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const exerciseId = req.params.exerciseId as string;
      const progress = await reportService.getExerciseProgress(
        req.user!.userId,
        exerciseId,
        req.query as any
      );
      return sendResponse(res, 200, {
        success: true,
        data: progress,
      });
    } catch (error) {
      next(error);
    }
  }

  async getVolumeTrends(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const trends = await reportService.getVolumeTrends(req.user!.userId, req.query as any);
      return sendResponse(res, 200, {
        success: true,
        data: trends,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const reportController = new ReportController();
