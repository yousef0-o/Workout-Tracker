import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import prisma from '../src/prisma';

const app = createApp();

describe('Reports & Analytics Endpoints', () => {
  let authToken: string;
  let userId: string;
  let benchPressId: string;
  let squatId: string;

  beforeAll(async () => {
    // Get exercises
    const bp = await prisma.exercise.findFirst({ where: { name: 'Barbell Bench Press' } });
    const sq = await prisma.exercise.findFirst({ where: { name: 'Barbell Back Squat' } });
    benchPressId = bp!.id;
    squatId = sq!.id;

    // Create a dedicated analytics user
    const email = `analytics_${Date.now()}@example.com`;
    const signupRes = await request(app).post('/api/auth/signup').send({
      email,
      password: 'Password123!',
      name: 'Analytics User',
    });
    authToken = signupRes.body.data.token;
    userId = signupRes.body.data.user.id;

    // Create 2 completed workouts with logged sets to test calculations
    // Workout 1: Bench Press session 1 (80kg x 10, 85kg x 8) -> Volume = 800 + 680 = 1480kg
    const w1Date = new Date(Date.now() - 3 * 86400000).toISOString();
    await request(app)
      .post('/api/workouts')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Bench Session 1',
        status: 'COMPLETED',
        scheduledAt: w1Date,
        durationMinutes: 45,
        exercises: [
          {
            exerciseId: benchPressId,
            orderIndex: 0,
            targetSets: 2,
            sets: [
              { setNumber: 1, reps: 10, weightKg: 80, isCompleted: true },
              { setNumber: 2, reps: 8, weightKg: 85, isCompleted: true },
            ],
          },
        ],
      });

    // Workout 2: Bench Press + Squat session 2 (Bench: 90kg x 6 -> Vol = 540kg; Squat: 120kg x 5 -> Vol = 600kg)
    const w2Date = new Date(Date.now() - 1 * 86400000).toISOString();
    await request(app)
      .post('/api/workouts')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Full Body Session 2',
        status: 'COMPLETED',
        scheduledAt: w2Date,
        durationMinutes: 60,
        exercises: [
          {
            exerciseId: benchPressId,
            orderIndex: 0,
            targetSets: 1,
            sets: [
              { setNumber: 1, reps: 6, weightKg: 90, isCompleted: true },
            ],
          },
          {
            exerciseId: squatId,
            orderIndex: 1,
            targetSets: 1,
            sets: [
              { setNumber: 1, reps: 5, weightKg: 120, isCompleted: true },
            ],
          },
        ],
      });
  });

  describe('GET /api/reports/summary', () => {
    it('should return aggregated overview stats and distributions', async () => {
      const res = await request(app)
        .get('/api/reports/summary')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const { overview, distributions } = res.body.data;
      expect(overview.totalWorkouts).toBe(2);
      expect(overview.completedWorkouts).toBe(2);
      expect(overview.completionRatePercentage).toBe(100);
      // Total volume: 1480 + 540 + 600 = 2620 kg
      expect(overview.totalVolumeKg).toBe(2620);
      expect(overview.totalDurationMinutes).toBe(105);
      expect(overview.totalSets).toBe(4);
      expect(overview.totalReps).toBe(29); // 10 + 8 + 6 + 5 = 29

      expect(distributions.byCategory.STRENGTH).toBeGreaterThanOrEqual(2);
      expect(distributions.byMuscleGroup.CHEST).toBeGreaterThanOrEqual(2);
      expect(distributions.byMuscleGroup.LEGS).toBeGreaterThanOrEqual(1);
    });

    it('should respect date range filtering', async () => {
      const futureStart = new Date(Date.now() + 86400000).toISOString();
      const res = await request(app)
        .get(`/api/reports/summary?startDate=${futureStart}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.overview.totalWorkouts).toBe(0);
      expect(res.body.data.overview.totalVolumeKg).toBe(0);
    });
  });

  describe('GET /api/reports/exercise-progress/:exerciseId', () => {
    it('should return historical progression and PRs for Bench Press', async () => {
      const res = await request(app)
        .get(`/api/reports/exercise-progress/${benchPressId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const { exercise, personalRecords, history } = res.body.data;
      expect(exercise.name).toBe('Barbell Bench Press');
      expect(personalRecords.maxWeightKg).toBe(90); // highest weight lifted
      expect(personalRecords.maxVolumeSessionKg).toBe(1480); // session 1 volume
      expect(personalRecords.bestEstimatedOneRepMaxKg).toBeGreaterThan(100); // 90*(1+6/30) = 108 kg or 85*(1+8/30) = 107.67 kg
      expect(history).toHaveLength(2);
    });

    it('should return 404 for invalid exercise ID', async () => {
      const res = await request(app)
        .get('/api/reports/exercise-progress/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/reports/volume-trends', () => {
    it('should return volume and frequency trends grouped by interval', async () => {
      const res = await request(app)
        .get('/api/reports/volume-trends?interval=day')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.interval).toBe('day');
      expect(Array.isArray(res.body.data.trends)).toBe(true);
      expect(res.body.data.trends.length).toBeGreaterThanOrEqual(1);
    });
  });
});
