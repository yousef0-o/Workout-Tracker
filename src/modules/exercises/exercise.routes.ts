import { Router } from 'express';
import { exerciseController } from './exercise.controller';
import { validate } from '../../middleware/validate.middleware';
import {
  createExerciseSchema,
  queryExercisesSchema,
  exerciseIdParamSchema,
} from './exercise.schema';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

// List exercises (supports optional auth to include custom ones)
router.get(
  '/',
  (req, res, next) => {
    // Optional auth check: if token provided, decode user
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authenticate(req, res, next);
    }
    next();
  },
  validate({ query: queryExercisesSchema }),
  exerciseController.getExercises
);

// Get single exercise by ID
router.get(
  '/:id',
  validate({ params: exerciseIdParamSchema }),
  exerciseController.getExerciseById
);

// Create custom exercise (Auth required)
router.post(
  '/',
  authenticate,
  validate({ body: createExerciseSchema }),
  exerciseController.createCustomExercise
);

export default router;
