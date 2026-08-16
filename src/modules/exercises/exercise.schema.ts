import { z } from 'zod';

export const CategoryEnum = z.enum([
  'STRENGTH',
  'CARDIO',
  'FLEXIBILITY',
  'HIIT',
  'CALISTHENICS',
  'OTHER',
]);

export const MuscleGroupEnum = z.enum([
  'CHEST',
  'BACK',
  'LEGS',
  'SHOULDERS',
  'ARMS',
  'CORE',
  'FULL_BODY',
  'OTHER',
]);

export const EquipmentEnum = z.enum([
  'BARBELL',
  'DUMBBELL',
  'MACHINE',
  'BODYWEIGHT',
  'CABLE',
  'KETTLEBELL',
  'BAND',
  'OTHER',
]);

export const createExerciseSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  description: z.string().min(5, 'Description must be at least 5 characters').max(1000),
  category: CategoryEnum,
  muscleGroup: MuscleGroupEnum,
  equipment: EquipmentEnum.default('BODYWEIGHT'),
});

export const queryExercisesSchema = z.object({
  category: z.string().optional(),
  muscleGroup: z.string().optional(),
  equipment: z.string().optional(),
  search: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(50).optional(),
  page: z.coerce.number().min(1).default(1).optional(),
});

export const exerciseIdParamSchema = z.object({
  id: z.string().uuid('Invalid exercise ID format'),
});

export type CreateExerciseInput = z.infer<typeof createExerciseSchema>;
export type QueryExercisesInput = z.infer<typeof queryExercisesSchema>;
