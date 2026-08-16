import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import prisma from '../src/prisma';

const app = createApp();

describe('Workout Management Endpoints', () => {
  let user1Token: string;
  let user2Token: string;
  let sampleExerciseId1: string;
  let sampleExerciseId2: string;
  let createdWorkoutId: string;

  beforeAll(async () => {
    // Get 2 sample exercises
    const ex1 = await prisma.exercise.findFirst({ where: { name: 'Barbell Bench Press' } });
    const ex2 = await prisma.exercise.findFirst({ where: { name: 'Barbell Back Squat' } });
    sampleExerciseId1 = ex1!.id;
    sampleExerciseId2 = ex2!.id;

    // Create User 1
    const user1Email = `user1_${Date.now()}@example.com`;
    const res1 = await request(app).post('/api/auth/signup').send({
      email: user1Email,
      password: 'Password123!',
      name: 'User One',
    });
    user1Token = res1.body.data.token;

    // Create User 2 (for authorization tests)
    const user2Email = `user2_${Date.now()}@example.com`;
    const res2 = await request(app).post('/api/auth/signup').send({
      email: user2Email,
      password: 'Password123!',
      name: 'User Two',
    });
    user2Token = res2.body.data.token;
  });

  describe('POST /api/workouts', () => {
    it('should create a workout plan with exercises and sets', async () => {
      const scheduledDate = new Date(Date.now() + 86400000).toISOString(); // tomorrow

      const res = await request(app)
        .post('/api/workouts')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          title: 'Chest and Leg Power Day',
          description: 'Heavy compound day',
          scheduledAt: scheduledDate,
          status: 'SCHEDULED',
          durationMinutes: 75,
          notes: 'Focus on perfect form',
          exercises: [
            {
              exerciseId: sampleExerciseId1,
              orderIndex: 0,
              targetSets: 3,
              targetReps: 8,
              targetWeightKg: 80,
              restSeconds: 120,
              sets: [
                { setNumber: 1, reps: 8, weightKg: 80, isCompleted: true },
                { setNumber: 2, reps: 8, weightKg: 80, isCompleted: true },
                { setNumber: 3, reps: 7, weightKg: 80, isCompleted: true },
              ],
            },
            {
              exerciseId: sampleExerciseId2,
              orderIndex: 1,
              targetSets: 3,
              targetReps: 5,
              targetWeightKg: 100,
              restSeconds: 180,
              sets: [
                { setNumber: 1, reps: 5, weightKg: 100, isCompleted: true },
                { setNumber: 2, reps: 5, weightKg: 100, isCompleted: true },
              ],
            },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Chest and Leg Power Day');
      expect(res.body.data.exercises).toHaveLength(2);
      expect(res.body.data.exercises[0].sets).toHaveLength(3);
      createdWorkoutId = res.body.data.id;
    });

    it('should reject workout creation with invalid exercise ID', async () => {
      const res = await request(app)
        .post('/api/workouts')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          title: 'Invalid Workout',
          scheduledAt: new Date().toISOString(),
          exercises: [
            {
              exerciseId: '00000000-0000-0000-0000-000000000000',
              targetSets: 3,
            },
          ],
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should reject unauthenticated request', async () => {
      const res = await request(app)
        .post('/api/workouts')
        .send({
          title: 'No Auth Workout',
          scheduledAt: new Date().toISOString(),
          exercises: [{ exerciseId: sampleExerciseId1, targetSets: 3 }],
        });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/workouts', () => {
    it('should list workouts for authenticated user', async () => {
      const res = await request(app)
        .get('/api/workouts')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('should filter workouts by status', async () => {
      const res = await request(app)
        .get('/api/workouts?status=SCHEDULED')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      res.body.data.forEach((w: any) => {
        expect(w.status).toBe('SCHEDULED');
      });
    });

    it('should return empty list for user with no workouts', async () => {
      const res = await request(app)
        .get('/api/workouts')
        .set('Authorization', `Bearer ${user2Token}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(0);
    });
  });

  describe('GET /api/workouts/:id', () => {
    it('should retrieve workout details for the owner', async () => {
      const res = await request(app)
        .get(`/api/workouts/${createdWorkoutId}`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(createdWorkoutId);
      expect(res.body.data.exercises).toBeDefined();
    });

    it('should deny access to another user (User 2 attempting to view User 1 workout)', async () => {
      const res = await request(app)
        .get(`/api/workouts/${createdWorkoutId}`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/workouts/:id', () => {
    it('should update workout title, notes, and duration', async () => {
      const res = await request(app)
        .put(`/api/workouts/${createdWorkoutId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          title: 'Updated Heavy Chest & Squats',
          notes: 'Added extra warm-up',
          durationMinutes: 80,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Updated Heavy Chest & Squats');
      expect(res.body.data.durationMinutes).toBe(80);
      expect(res.body.data.notes).toBe('Added extra warm-up');
    });
  });

  describe('PATCH /api/workouts/:id/status', () => {
    it('should quickly update workout status to COMPLETED', async () => {
      const res = await request(app)
        .patch(`/api/workouts/${createdWorkoutId}/status`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          status: 'COMPLETED',
          durationMinutes: 85,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('COMPLETED');
      expect(res.body.data.completedAt).toBeDefined();
    });
  });

  describe('Comments (/api/workouts/:id/comments)', () => {
    it('should allow adding comments to a workout', async () => {
      const res = await request(app)
        .post(`/api/workouts/${createdWorkoutId}/comments`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          content: 'Felt great during the squat sets today!',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.content).toBe('Felt great during the squat sets today!');
    });

    it('should retrieve comments for the workout', async () => {
      const res = await request(app)
        .get(`/api/workouts/${createdWorkoutId}/comments`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data[0].content).toContain('Felt great');
    });
  });

  describe('DELETE /api/workouts/:id', () => {
    it('should deny deletion by another user', async () => {
      const res = await request(app)
        .delete(`/api/workouts/${createdWorkoutId}`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(res.status).toBe(404);
    });

    it('should delete workout successfully by owner', async () => {
      const res = await request(app)
        .delete(`/api/workouts/${createdWorkoutId}`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify it no longer exists
      const verifyRes = await request(app)
        .get(`/api/workouts/${createdWorkoutId}`)
        .set('Authorization', `Bearer ${user1Token}`);
      expect(verifyRes.status).toBe(404);
    });
  });
});
