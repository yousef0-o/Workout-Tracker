import { z } from 'zod';

export const reportSummaryQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const exerciseProgressParamSchema = z.object({
  exerciseId: z.string().uuid('Invalid exercise ID format'),
});

export const exerciseProgressQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const volumeTrendsQuerySchema = z.object({
  interval: z.enum(['day', 'week', 'month']).default('week').optional(),
  limit: z.coerce.number().min(1).max(52).default(12).optional(),
});

export type ReportSummaryQuery = z.infer<typeof reportSummaryQuerySchema>;
export type ExerciseProgressQuery = z.infer<typeof exerciseProgressQuerySchema>;
export type VolumeTrendsQuery = z.infer<typeof volumeTrendsQuerySchema>;
