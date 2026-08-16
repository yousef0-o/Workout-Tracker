import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import prisma from '../src/prisma';

const app = createApp();

describe('Exercise Endpoints', () => {
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    // Register user for authenticated requests
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'exercisetester@example.com',
        password: 'Password123!',
        name: 'Exercise Tester',
      });

    if (res.status === 201) {
      authToken = res.body.data.token;
      userId = res.body.data.user.id;
    } else {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'exercisetester@example.com',
          password: 'Password123!',
        });
      authToken = loginRes.body.data.token;
      userId = loginRes.body.data.user.id;
    }
  });

  describe('GET /api/exercises', () => {
    it('should retrieve list of seeded exercises with pagination', async () => {
      const res = await request(app).get('/api/exercises?limit=10&page=1');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.meta).toBeDefined();
      expect(res.body.meta.total).toBeGreaterThanOrEqual(25);
    });

    it('should filter exercises by muscleGroup', async () => {
      const res = await request(app).get('/api/exercises?muscleGroup=CHEST');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      res.body.data.forEach((ex: any) => {
        expect(ex.muscleGroup).toBe('CHEST');
      });
    });

    it('should filter exercises by category', async () => {
      const res = await request(app).get('/api/exercises?category=CALISTHENICS');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      res.body.data.forEach((ex: any) => {
        expect(ex.category).toBe('CALISTHENICS');
      });
    });

    it('should search exercises by name query', async () => {
      const res = await request(app).get('/api/exercises?search=Bench');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.some((e: any) => e.name.includes('Bench'))).toBe(true);
    });
  });

  describe('GET /api/exercises/:id', () => {
    it('should retrieve a single exercise by valid UUID', async () => {
      const listRes = await request(app).get('/api/exercises?limit=1');
      const firstExercise = listRes.body.data[0];

      const res = await request(app).get(`/api/exercises/${firstExercise.id}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(firstExercise.id);
      expect(res.body.data.name).toBe(firstExercise.name);
    });

    it('should return 404 for non-existent exercise UUID', async () => {
      const res = await request(app).get('/api/exercises/00000000-0000-0000-0000-000000000000');
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/exercises', () => {
    it('should allow authenticated user to create a custom exercise', async () => {
      const customName = `Custom Incline Curl ${Date.now()}`;
      const res = await request(app)
        .post('/api/exercises')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: customName,
          description: 'Special angle incline curl on 60 degree bench.',
          category: 'STRENGTH',
          muscleGroup: 'ARMS',
          equipment: 'DUMBBELL',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe(customName);
      expect(res.body.data.isCustom).toBe(true);
    });

    it('should reject unauthenticated custom exercise creation', async () => {
      const res = await request(app)
        .post('/api/exercises')
        .send({
          name: 'Unauthorized Exercise',
          description: 'Should fail without token.',
          category: 'STRENGTH',
          muscleGroup: 'CHEST',
        });

      expect(res.status).toBe(401);
    });
  });
});
