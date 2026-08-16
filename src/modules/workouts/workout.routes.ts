import { Router } from 'express';
import { workoutController } from './workout.controller';
import { validate } from '../../middleware/validate.middleware';
import {
  createWorkoutSchema,
  updateWorkoutSchema,
  updateWorkoutStatusSchema,
  queryWorkoutsSchema,
  workoutIdParamSchema,
  createCommentSchema,
} from './workout.schema';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

// All workout routes require authentication
router.use(authenticate);

// Create workout plan
router.post(
  '/',
  validate({ body: createWorkoutSchema }),
  workoutController.createWorkout
);

// List user's workouts with filters & sorting
router.get(
  '/',
  validate({ query: queryWorkoutsSchema }),
  workoutController.getWorkouts
);

// Get single workout plan details
router.get(
  '/:id',
  validate({ params: workoutIdParamSchema }),
  workoutController.getWorkoutById
);

// Full update of workout plan
router.put(
  '/:id',
  validate({ params: workoutIdParamSchema, body: updateWorkoutSchema }),
  workoutController.updateWorkout
);

// Quick status update of workout plan
router.patch(
  '/:id/status',
  validate({ params: workoutIdParamSchema, body: updateWorkoutStatusSchema }),
  workoutController.updateWorkoutStatus
);

// Delete workout plan
router.delete(
  '/:id',
  validate({ params: workoutIdParamSchema }),
  workoutController.deleteWorkout
);

// Add comment to workout plan
router.post(
  '/:id/comments',
  validate({ params: workoutIdParamSchema, body: createCommentSchema }),
  workoutController.addComment
);

// Get comments for workout plan
router.get(
  '/:id/comments',
  validate({ params: workoutIdParamSchema }),
  workoutController.getComments
);

export default router;
