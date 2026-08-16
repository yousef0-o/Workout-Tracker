import { z } from 'zod';

export const WorkoutStatusEnum = z.enum([
  'SCHEDULED',
  'IN_PROGRESS',
  'COMPLETED',
  'CANCELLED',
]);

export const exerciseSetSchema = z.object({
  setNumber: z.number().int().min(1),
  reps: z.number().int().min(0).default(0),
  weightKg: z.number().min(0).default(0),
  durationSec: z.number().int().min(0).optional(),
  isCompleted: z.boolean().default(true),
});

export const workoutExerciseInputSchema = z.object({
  exerciseId: z.string().uuid('Invalid exercise ID format'),
  orderIndex: z.number().int().min(0).default(0),
  targetSets: z.number().int().min(1).default(3),
  targetReps: z.number().int().min(0).optional(),
  targetWeightKg: z.number().min(0).optional(),
  targetDurationSec: z.number().int().min(0).optional(),
  restSeconds: z.number().int().min(0).default(60).optional(),
  notes: z.string().max(500).optional(),
  sets: z.array(exerciseSetSchema).optional(),
});

export const createWorkoutSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters').max(150),
  description: z.string().max(1000).optional(),
  scheduledAt: z.string().datetime({ message: 'scheduledAt must be a valid ISO 8601 datetime' }),
  status: WorkoutStatusEnum.default('SCHEDULED').optional(),
  durationMinutes: z.number().int().min(1).max(1440).optional(),
  notes: z.string().max(2000).optional(),
  exercises: z.array(workoutExerciseInputSchema).min(1, 'At least one exercise is required'),
});

export const updateWorkoutSchema = z.object({
  title: z.string().min(2).max(150).optional(),
  description: z.string().max(1000).nullable().optional(),
  scheduledAt: z.string().datetime().optional(),
  status: WorkoutStatusEnum.optional(),
  completedAt: z.string().datetime().nullable().optional(),
  durationMinutes: z.number().int().min(1).max(1440).nullable().optional(),
  notes: z.string().max(2000).nullable().optional(),
  exercises: z.array(workoutExerciseInputSchema).optional(),
});

export const updateWorkoutStatusSchema = z.object({
  status: WorkoutStatusEnum,
  completedAt: z.string().datetime().optional(),
  durationMinutes: z.number().int().min(1).max(1440).optional(),
});

export const queryWorkoutsSchema = z.object({
  status: WorkoutStatusEnum.optional(),
  view: z.enum(['active', 'pending', 'completed', 'all']).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  sort: z.enum(['asc', 'desc']).default('asc').optional(),
  page: z.coerce.number().min(1).default(1).optional(),
  limit: z.coerce.number().min(1).max(100).default(20).optional(),
});

export const workoutIdParamSchema = z.object({
  id: z.string().uuid('Invalid workout ID format'),
});

export const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty').max(1000),
});

export type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>;
export type UpdateWorkoutInput = z.infer<typeof updateWorkoutSchema>;
export type UpdateWorkoutStatusInput = z.infer<typeof updateWorkoutStatusSchema>;
export type QueryWorkoutsInput = z.infer<typeof queryWorkoutsSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
