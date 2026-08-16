import prisma from '../../prisma';
import { ApiError } from '../../utils/response';
import {
  ReportSummaryQuery,
  ExerciseProgressQuery,
  VolumeTrendsQuery,
} from './report.schema';
import { Prisma } from '@prisma/client';

export class ReportService {
  async getSummary(userId: string, query: ReportSummaryQuery) {
    const { startDate, endDate } = query;

    const where: Prisma.WorkoutWhereInput = {
      userId,
    };

    if (startDate || endDate) {
      where.scheduledAt = {};
      if (startDate) where.scheduledAt.gte = new Date(startDate);
      if (endDate) where.scheduledAt.lte = new Date(endDate);
    }

    const workouts = await prisma.workout.findMany({
      where,
      include: {
        exercises: {
          include: {
            exercise: true,
            sets: true,
          },
        },
      },
      orderBy: { scheduledAt: 'asc' },
    });

    const totalWorkouts = workouts.length;
    let completedWorkouts = 0;
    let scheduledWorkouts = 0;
    let inProgressWorkouts = 0;
    let cancelledWorkouts = 0;
    let totalVolumeKg = 0;
    let totalDurationMinutes = 0;
    let totalSets = 0;
    let totalReps = 0;

    const categoryDistribution: Record<string, number> = {};
    const muscleGroupDistribution: Record<string, number> = {};
    const completedDates: Set<string> = new Set();

    for (const workout of workouts) {
      if (workout.status === 'COMPLETED') {
        completedWorkouts++;
        if (workout.durationMinutes) {
          totalDurationMinutes += workout.durationMinutes;
        }
        const dateStr = (workout.completedAt || workout.scheduledAt).toISOString().split('T')[0];
        completedDates.add(dateStr);
      } else if (workout.status === 'SCHEDULED') {
        scheduledWorkouts++;
      } else if (workout.status === 'IN_PROGRESS') {
        inProgressWorkouts++;
      } else if (workout.status === 'CANCELLED') {
        cancelledWorkouts++;
      }

      for (const wEx of workout.exercises) {
        const cat = wEx.exercise.category;
        const mg = wEx.exercise.muscleGroup;

        categoryDistribution[cat] = (categoryDistribution[cat] || 0) + 1;
        muscleGroupDistribution[mg] = (muscleGroupDistribution[mg] || 0) + 1;

        for (const set of wEx.sets) {
          if (set.isCompleted) {
            totalSets++;
            totalReps += set.reps;
            totalVolumeKg += set.reps * set.weightKg;
          }
        }
      }
    }

    const completionRate =
      totalWorkouts > 0
        ? Math.round((completedWorkouts / totalWorkouts) * 100 * 10) / 10
        : 0;

    // Calculate current streak (days)
    const streak = this.calculateDayStreak(Array.from(completedDates));

    return {
      overview: {
        totalWorkouts,
        completedWorkouts,
        scheduledWorkouts,
        inProgressWorkouts,
        cancelledWorkouts,
        completionRatePercentage: completionRate,
        totalVolumeKg: Math.round(totalVolumeKg * 100) / 100,
        totalDurationMinutes,
        totalSets,
        totalReps,
        activeStreakDays: streak,
      },
      distributions: {
        byCategory: categoryDistribution,
        byMuscleGroup: muscleGroupDistribution,
      },
    };
  }

  async getExerciseProgress(userId: string, exerciseId: string, query: ExerciseProgressQuery) {
    const exercise = await prisma.exercise.findUnique({
      where: { id: exerciseId },
    });

    if (!exercise) {
      throw new ApiError('Exercise not found.', 404);
    }

    const where: Prisma.WorkoutWhereInput = {
      userId,
      exercises: {
        some: {
          exerciseId,
        },
      },
    };

    if (query.startDate || query.endDate) {
      where.scheduledAt = {};
      if (query.startDate) where.scheduledAt.gte = new Date(query.startDate);
      if (query.endDate) where.scheduledAt.lte = new Date(query.endDate);
    }

    const workouts = await prisma.workout.findMany({
      where,
      include: {
        exercises: {
          where: { exerciseId },
          include: {
            sets: {
              orderBy: { setNumber: 'asc' },
            },
          },
        },
      },
      orderBy: { scheduledAt: 'asc' },
    });

    let maxWeightAllTime = 0;
    let maxVolumeSessionAllTime = 0;
    let bestEstimatedOneRepMax = 0;

    const sessions = workouts.map((workout) => {
      const workoutExercise = workout.exercises[0];
      const sets = workoutExercise?.sets || [];

      let sessionVolume = 0;
      let sessionMaxWeight = 0;
      let sessionTotalReps = 0;
      let sessionBest1RM = 0;

      for (const set of sets) {
        if (set.isCompleted) {
          sessionVolume += set.reps * set.weightKg;
          sessionTotalReps += set.reps;
          if (set.weightKg > sessionMaxWeight) {
            sessionMaxWeight = set.weightKg;
          }

          // Epley formula for 1RM: weight * (1 + reps / 30)
          if (set.reps > 0 && set.weightKg > 0) {
            const epley1RM = set.reps === 1 ? set.weightKg : set.weightKg * (1 + set.reps / 30);
            if (epley1RM > sessionBest1RM) {
              sessionBest1RM = Math.round(epley1RM * 100) / 100;
            }
          }
        }
      }

      if (sessionMaxWeight > maxWeightAllTime) maxWeightAllTime = sessionMaxWeight;
      if (sessionVolume > maxVolumeSessionAllTime) maxVolumeSessionAllTime = sessionVolume;
      if (sessionBest1RM > bestEstimatedOneRepMax) bestEstimatedOneRepMax = sessionBest1RM;

      return {
        workoutId: workout.id,
        workoutTitle: workout.title,
        status: workout.status,
        date: workout.scheduledAt,
        completedAt: workout.completedAt,
        setsCount: sets.length,
        maxWeightKg: sessionMaxWeight,
        totalVolumeKg: Math.round(sessionVolume * 100) / 100,
        totalReps: sessionTotalReps,
        estimatedOneRepMaxKg: sessionBest1RM,
        sets: sets.map((s) => ({
          setNumber: s.setNumber,
          reps: s.reps,
          weightKg: s.weightKg,
          isCompleted: s.isCompleted,
        })),
      };
    });

    return {
      exercise: {
        id: exercise.id,
        name: exercise.name,
        category: exercise.category,
        muscleGroup: exercise.muscleGroup,
        equipment: exercise.equipment,
      },
      personalRecords: {
        maxWeightKg: maxWeightAllTime,
        maxVolumeSessionKg: Math.round(maxVolumeSessionAllTime * 100) / 100,
        bestEstimatedOneRepMaxKg: bestEstimatedOneRepMax,
        totalSessionsLogged: sessions.length,
      },
      history: sessions,
    };
  }

  async getVolumeTrends(userId: string, query: VolumeTrendsQuery) {
    const { interval = 'week', limit = 12 } = query;

    const workouts = await prisma.workout.findMany({
      where: {
        userId,
        status: 'COMPLETED',
      },
      include: {
        exercises: {
          include: {
            sets: true,
          },
        },
      },
      orderBy: { scheduledAt: 'asc' },
    });

    const groups: Map<
      string,
      { label: string; workoutCount: number; volumeKg: number; durationMinutes: number }
    > = new Map();

    for (const workout of workouts) {
      const date = workout.completedAt || workout.scheduledAt;
      const key = this.formatIntervalKey(date, interval);

      if (!groups.has(key)) {
        groups.set(key, {
          label: key,
          workoutCount: 0,
          volumeKg: 0,
          durationMinutes: 0,
        });
      }

      const entry = groups.get(key)!;
      entry.workoutCount++;
      entry.durationMinutes += workout.durationMinutes || 0;

      for (const wEx of workout.exercises) {
        for (const set of wEx.sets) {
          if (set.isCompleted) {
            entry.volumeKg += set.reps * set.weightKg;
          }
        }
      }
    }

    const result = Array.from(groups.values())
      .map((g) => ({
        ...g,
        volumeKg: Math.round(g.volumeKg * 100) / 100,
      }))
      .slice(-limit);

    return {
      interval,
      trends: result,
    };
  }

  private formatIntervalKey(date: Date, interval: 'day' | 'week' | 'month'): string {
    const d = new Date(date);
    if (interval === 'day') {
      return d.toISOString().split('T')[0];
    }
    if (interval === 'month') {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    }
    // Week format: YYYY-Www
    const startOfYear = new Date(d.getFullYear(), 0, 1);
    const days = Math.floor((d.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
    return `${d.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
  }

  private calculateDayStreak(dateStrings: string[]): number {
    if (dateStrings.length === 0) return 0;

    const uniqueSorted = Array.from(new Set(dateStrings)).sort().reverse();
    const todayStr = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // If no workout today or yesterday, streak is broken (0)
    if (uniqueSorted[0] !== todayStr && uniqueSorted[0] !== yesterdayStr) {
      return 0;
    }

    let streak = 0;
    let curr = new Date(uniqueSorted[0]);

    for (const dStr of uniqueSorted) {
      const d = new Date(dStr);
      const diffDays = Math.round((curr.getTime() - d.getTime()) / (1000 * 3600 * 24));

      if (diffDays <= 1) {
        streak++;
        curr = d;
      } else {
        break;
      }
    }

    return streak;
  }
}

export const reportService = new ReportService();
