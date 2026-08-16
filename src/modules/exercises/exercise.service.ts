import prisma from '../../prisma';
import { ApiError } from '../../utils/response';
import { CreateExerciseInput, QueryExercisesInput } from './exercise.schema';
import { Prisma } from '@prisma/client';

export class ExerciseService {
  async getExercises(query: QueryExercisesInput, userId?: string) {
    const { category, muscleGroup, equipment, search, page = 1, limit = 50 } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.ExerciseWhereInput = {
      OR: [
        { isCustom: false },
        ...(userId ? [{ isCustom: true, createdById: userId }] : []),
      ],
    };

    if (category) {
      where.category = { equals: category.toUpperCase() };
    }

    if (muscleGroup) {
      where.muscleGroup = { equals: muscleGroup.toUpperCase() };
    }

    if (equipment) {
      where.equipment = { equals: equipment.toUpperCase() };
    }

    if (search) {
      where.AND = [
        {
          OR: [
            { name: { contains: search } },
            { description: { contains: search } },
          ],
        },
      ];
    }

    const [total, exercises] = await Promise.all([
      prisma.exercise.count({ where }),
      prisma.exercise.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
    ]);

    return {
      exercises,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getExerciseById(id: string) {
    const exercise = await prisma.exercise.findUnique({
      where: { id },
    });

    if (!exercise) {
      throw new ApiError('Exercise not found.', 404);
    }

    return exercise;
  }

  async createCustomExercise(userId: string, input: CreateExerciseInput) {
    const existing = await prisma.exercise.findFirst({
      where: {
        name: { equals: input.name },
      },
    });

    if (existing) {
      throw new ApiError('An exercise with this name already exists.', 409);
    }

    return prisma.exercise.create({
      data: {
        name: input.name.trim(),
        description: input.description.trim(),
        category: input.category,
        muscleGroup: input.muscleGroup,
        equipment: input.equipment || 'BODYWEIGHT',
        isCustom: true,
        createdById: userId,
      },
    });
  }
}

export const exerciseService = new ExerciseService();
