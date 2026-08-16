import prisma from '../../prisma';
import { ApiError } from '../../utils/response';
import {
  CreateWorkoutInput,
  UpdateWorkoutInput,
  UpdateWorkoutStatusInput,
  QueryWorkoutsInput,
  CreateCommentInput,
} from './workout.schema';
import { Prisma } from '@prisma/client';

export class WorkoutService {
  async createWorkout(userId: string, input: CreateWorkoutInput) {
    // Verify that all exercise IDs exist
    const exerciseIds = input.exercises.map((e) => e.exerciseId);
    const existingExercises = await prisma.exercise.findMany({
      where: { id: { in: exerciseIds } },
      select: { id: true },
    });

    if (existingExercises.length !== exerciseIds.length) {
      throw new ApiError('One or more referenced exercise IDs are invalid.', 400);
    }

    const scheduledDate = new Date(input.scheduledAt);
    const status = input.status || 'SCHEDULED';
    const completedAt = status === 'COMPLETED' ? new Date() : null;

    const workout = await prisma.workout.create({
      data: {
        userId,
        title: input.title.trim(),
        description: input.description?.trim(),
        status,
        scheduledAt: scheduledDate,
        completedAt,
        durationMinutes: input.durationMinutes,
        notes: input.notes?.trim(),
        exercises: {
          create: input.exercises.map((ex, index) => ({
            exerciseId: ex.exerciseId,
            orderIndex: ex.orderIndex !== undefined ? ex.orderIndex : index,
            targetSets: ex.targetSets,
            targetReps: ex.targetReps,
            targetWeightKg: ex.targetWeightKg,
            targetDurationSec: ex.targetDurationSec,
            restSeconds: ex.restSeconds ?? 60,
            notes: ex.notes?.trim(),
            sets: ex.sets && ex.sets.length > 0
              ? {
                  create: ex.sets.map((s, sIdx) => ({
                    setNumber: s.setNumber || sIdx + 1,
                    reps: s.reps,
                    weightKg: s.weightKg,
                    durationSec: s.durationSec,
                    isCompleted: s.isCompleted !== undefined ? s.isCompleted : true,
                  })),
                }
              : undefined,
          })),
        },
      },
      include: {
        exercises: {
          include: {
            exercise: true,
            sets: {
              orderBy: { setNumber: 'asc' },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
      },
    });

    return workout;
  }

  async getWorkouts(userId: string, query: QueryWorkoutsInput) {
    const { status, view, from, to, sort = 'asc', page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.WorkoutWhereInput = {
      userId,
    };

    if (status) {
      where.status = status;
    } else if (view) {
      if (view === 'active') {
        where.status = { in: ['SCHEDULED', 'IN_PROGRESS'] };
      } else if (view === 'pending') {
        where.status = 'SCHEDULED';
      } else if (view === 'completed') {
        where.status = 'COMPLETED';
      }
    }

    if (from || to) {
      where.scheduledAt = {};
      if (from) {
        where.scheduledAt.gte = new Date(from);
      }
      if (to) {
        where.scheduledAt.lte = new Date(to);
      }
    }

    const [total, workouts] = await Promise.all([
      prisma.workout.count({ where }),
      prisma.workout.findMany({
        where,
        skip,
        take: limit,
        orderBy: { scheduledAt: sort },
        include: {
          exercises: {
            include: {
              exercise: true,
              sets: {
                orderBy: { setNumber: 'asc' },
              },
            },
            orderBy: { orderIndex: 'asc' },
          },
          _count: {
            select: {
              comments: true,
            },
          },
        },
      }),
    ]);

    return {
      workouts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getWorkoutById(userId: string, workoutId: string) {
    const workout = await prisma.workout.findFirst({
      where: {
        id: workoutId,
        userId,
      },
      include: {
        exercises: {
          include: {
            exercise: true,
            sets: {
              orderBy: { setNumber: 'asc' },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!workout) {
      throw new ApiError('Workout not found or access denied.', 404);
    }

    return workout;
  }

  async updateWorkout(userId: string, workoutId: string, input: UpdateWorkoutInput) {
    // Ensure workout exists and belongs to user
    const existing = await prisma.workout.findFirst({
      where: { id: workoutId, userId },
    });

    if (!existing) {
      throw new ApiError('Workout not found or access denied.', 404);
    }

    const updateData: Prisma.WorkoutUpdateInput = {};

    if (input.title !== undefined) updateData.title = input.title.trim();
    if (input.description !== undefined) updateData.description = input.description?.trim() || null;
    if (input.notes !== undefined) updateData.notes = input.notes?.trim() || null;
    if (input.durationMinutes !== undefined) updateData.durationMinutes = input.durationMinutes;
    if (input.scheduledAt !== undefined) updateData.scheduledAt = new Date(input.scheduledAt);
    
    if (input.status !== undefined) {
      updateData.status = input.status;
      if (input.status === 'COMPLETED' && !input.completedAt && !existing.completedAt) {
        updateData.completedAt = new Date();
      }
    }

    if (input.completedAt !== undefined) {
      updateData.completedAt = input.completedAt ? new Date(input.completedAt) : null;
    }

    // If exercises are provided, replace them
    if (input.exercises) {
      const exerciseIds = input.exercises.map((e) => e.exerciseId);
      const foundExercises = await prisma.exercise.findMany({
        where: { id: { in: exerciseIds } },
        select: { id: true },
      });

      if (foundExercises.length !== exerciseIds.length) {
        throw new ApiError('One or more referenced exercise IDs are invalid.', 400);
      }

      // Delete existing workout exercises and re-create in transaction
      return prisma.$transaction(async (tx) => {
        await tx.workoutExercise.deleteMany({
          where: { workoutId },
        });

        const updated = await tx.workout.update({
          where: { id: workoutId },
          data: {
            ...updateData,
            exercises: {
              create: input.exercises!.map((ex, index) => ({
                exerciseId: ex.exerciseId,
                orderIndex: ex.orderIndex !== undefined ? ex.orderIndex : index,
                targetSets: ex.targetSets,
                targetReps: ex.targetReps,
                targetWeightKg: ex.targetWeightKg,
                targetDurationSec: ex.targetDurationSec,
                restSeconds: ex.restSeconds ?? 60,
                notes: ex.notes?.trim(),
                sets: ex.sets && ex.sets.length > 0
                  ? {
                      create: ex.sets.map((s, sIdx) => ({
                        setNumber: s.setNumber || sIdx + 1,
                        reps: s.reps,
                        weightKg: s.weightKg,
                        durationSec: s.durationSec,
                        isCompleted: s.isCompleted !== undefined ? s.isCompleted : true,
                      })),
                    }
                  : undefined,
              })),
            },
          },
          include: {
            exercises: {
              include: {
                exercise: true,
                sets: {
                  orderBy: { setNumber: 'asc' },
                },
              },
              orderBy: { orderIndex: 'asc' },
            },
            comments: true,
          },
        });

        return updated;
      });
    }

    const updated = await prisma.workout.update({
      where: { id: workoutId },
      data: updateData,
      include: {
        exercises: {
          include: {
            exercise: true,
            sets: {
              orderBy: { setNumber: 'asc' },
            },
          },
          orderBy: { orderIndex: 'asc' },
        },
        comments: true,
      },
    });

    return updated;
  }

  async updateWorkoutStatus(userId: string, workoutId: string, input: UpdateWorkoutStatusInput) {
    const existing = await prisma.workout.findFirst({
      where: { id: workoutId, userId },
    });

    if (!existing) {
      throw new ApiError('Workout not found or access denied.', 404);
    }

    const completedAt =
      input.status === 'COMPLETED'
        ? input.completedAt ? new Date(input.completedAt) : new Date()
        : input.status === 'SCHEDULED' || input.status === 'IN_PROGRESS'
        ? null
        : existing.completedAt;

    return prisma.workout.update({
      where: { id: workoutId },
      data: {
        status: input.status,
        completedAt,
        ...(input.durationMinutes !== undefined ? { durationMinutes: input.durationMinutes } : {}),
      },
      include: {
        exercises: {
          include: {
            exercise: true,
            sets: true,
          },
        },
      },
    });
  }

  async deleteWorkout(userId: string, workoutId: string) {
    const existing = await prisma.workout.findFirst({
      where: { id: workoutId, userId },
    });

    if (!existing) {
      throw new ApiError('Workout not found or access denied.', 404);
    }

    await prisma.workout.delete({
      where: { id: workoutId },
    });

    return { message: 'Workout plan deleted successfully.' };
  }

  async addComment(userId: string, workoutId: string, input: CreateCommentInput) {
    const existing = await prisma.workout.findFirst({
      where: { id: workoutId, userId },
    });

    if (!existing) {
      throw new ApiError('Workout not found or access denied.', 404);
    }

    const comment = await prisma.workoutComment.create({
      data: {
        workoutId,
        userId,
        content: input.content.trim(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return comment;
  }

  async getComments(userId: string, workoutId: string) {
    const existing = await prisma.workout.findFirst({
      where: { id: workoutId, userId },
    });

    if (!existing) {
      throw new ApiError('Workout not found or access denied.', 404);
    }

    return prisma.workoutComment.findMany({
      where: { workoutId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}

export const workoutService = new WorkoutService();
