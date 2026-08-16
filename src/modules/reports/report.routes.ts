import { Router } from 'express';
import { reportController } from './report.controller';
import { validate } from '../../middleware/validate.middleware';
import {
  reportSummaryQuerySchema,
  exerciseProgressParamSchema,
  exerciseProgressQuerySchema,
  volumeTrendsQuerySchema,
} from './report.schema';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

// All report endpoints require authentication
router.use(authenticate);

// Overall summary report
router.get(
  '/summary',
  validate({ query: reportSummaryQuerySchema }),
  reportController.getSummary
);

// Specific exercise progress and personal records
router.get(
  '/exercise-progress/:exerciseId',
  validate({
    params: exerciseProgressParamSchema,
    query: exerciseProgressQuerySchema,
  }),
  reportController.getExerciseProgress
);

// Volume and frequency trends
router.get(
  '/volume-trends',
  validate({ query: volumeTrendsQuerySchema }),
  reportController.getVolumeTrends
);

export default router;
