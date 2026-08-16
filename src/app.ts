import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { openApiSpec } from './config/swagger';
import authRoutes from './modules/auth/auth.routes';
import exerciseRoutes from './modules/exercises/exercise.routes';
import workoutRoutes from './modules/workouts/workout.routes';
import reportRoutes from './modules/reports/report.routes';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { sendResponse } from './utils/response';

export function createApp(): Application {
  const app = express();

  // Core Middlewares
  app.use(helmet({ contentSecurityPolicy: false })); // allows swagger-ui to load assets smoothly
  app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health Check Endpoint
  app.get('/api/health', (req: Request, res: Response) => {
    return sendResponse(res, 200, {
      success: true,
      message: 'Workout Tracker API is healthy and operational.',
      data: {
        status: 'UP',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
      },
    });
  });

  // Swagger Documentation Endpoints
  app.get('/api/docs.json', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(openApiSpec);
  });
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

  // Application Feature Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/exercises', exerciseRoutes);
  app.use('/api/workouts', workoutRoutes);
  app.use('/api/reports', reportRoutes);

  // 404 and Global Error Handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export default createApp;
