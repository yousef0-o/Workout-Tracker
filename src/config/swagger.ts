export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Workout Tracker API',
    version: '1.0.0',
    description: `
**Workout Tracker RESTful API**

A backend system for managing workout plans, exercise catalogs, workout scheduling, and tracking fitness progress over time with comprehensive reporting and JWT authentication.

### Features
- **JWT Authentication**: Secure user registration, login, and token-based protected endpoints.
- **Exercise Catalog**: Seeded repository of standard exercises with muscle group, category, and equipment filters, plus custom exercise creation.
- **Workout Planning & Scheduling**: Full CRUD for workouts, nested exercise sets, scheduling by date/time, and status workflows (\`SCHEDULED\`, \`IN_PROGRESS\`, \`COMPLETED\`, \`CANCELLED\`).
- **Comments & Reflections**: Add workout notes and feedback.
- **Analytics & Reporting**: Workout summary metrics, exercise progression history with 1-Rep Max estimation, and volume trends.
    `,
    contact: {
      name: 'Workout Tracker API Support',
    },
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Local Development Server',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token in the format: Bearer <token>',
      },
    },
    schemas: {
      StandardResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: { type: 'object', nullable: true },
          error: { type: 'string', nullable: true },
          meta: { type: 'object', nullable: true },
        },
      },
      SignupRequest: {
        type: 'object',
        required: ['email', 'password', 'name'],
        properties: {
          email: { type: 'string', format: 'email', example: 'user@example.com' },
          password: { type: 'string', minLength: 6, example: 'securePassword123' },
          name: { type: 'string', minLength: 2, example: 'Jane Doe' },
        },
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'user@example.com' },
          password: { type: 'string', example: 'securePassword123' },
        },
      },
      AuthResponseData: {
        type: 'object',
        properties: {
          user: {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              email: { type: 'string', format: 'email' },
              name: { type: 'string' },
              createdAt: { type: 'string', format: 'date-time' },
            },
          },
          token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsIn...' },
        },
      },
      Exercise: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string', example: 'Barbell Bench Press' },
          description: { type: 'string', example: 'Compound chest pressing exercise.' },
          category: {
            type: 'string',
            enum: ['STRENGTH', 'CARDIO', 'FLEXIBILITY', 'HIIT', 'CALISTHENICS', 'OTHER'],
            example: 'STRENGTH',
          },
          muscleGroup: {
            type: 'string',
            enum: ['CHEST', 'BACK', 'LEGS', 'SHOULDERS', 'ARMS', 'CORE', 'FULL_BODY', 'OTHER'],
            example: 'CHEST',
          },
          equipment: {
            type: 'string',
            enum: ['BARBELL', 'DUMBBELL', 'MACHINE', 'BODYWEIGHT', 'CABLE', 'KETTLEBELL', 'BAND', 'OTHER'],
            example: 'BARBELL',
          },
          isCustom: { type: 'boolean', example: false },
          createdById: { type: 'string', format: 'uuid', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      CreateExerciseRequest: {
        type: 'object',
        required: ['name', 'description', 'category', 'muscleGroup'],
        properties: {
          name: { type: 'string', minLength: 2, example: 'Incline Cable Fly' },
          description: { type: 'string', minLength: 5, example: 'Upper chest isolation using low cable pulleys.' },
          category: { type: 'string', enum: ['STRENGTH', 'CARDIO', 'FLEXIBILITY', 'HIIT', 'CALISTHENICS', 'OTHER'], example: 'STRENGTH' },
          muscleGroup: { type: 'string', enum: ['CHEST', 'BACK', 'LEGS', 'SHOULDERS', 'ARMS', 'CORE', 'FULL_BODY', 'OTHER'], example: 'CHEST' },
          equipment: { type: 'string', enum: ['BARBELL', 'DUMBBELL', 'MACHINE', 'BODYWEIGHT', 'CABLE', 'KETTLEBELL', 'BAND', 'OTHER'], default: 'BODYWEIGHT', example: 'CABLE' },
        },
      },
      ExerciseSetInput: {
        type: 'object',
        required: ['setNumber'],
        properties: {
          setNumber: { type: 'integer', example: 1 },
          reps: { type: 'integer', default: 10, example: 10 },
          weightKg: { type: 'number', default: 60, example: 60 },
          durationSec: { type: 'integer', nullable: true, example: 45 },
          isCompleted: { type: 'boolean', default: true, example: true },
        },
      },
      WorkoutExerciseInput: {
        type: 'object',
        required: ['exerciseId'],
        properties: {
          exerciseId: { type: 'string', format: 'uuid' },
          orderIndex: { type: 'integer', default: 0, example: 0 },
          targetSets: { type: 'integer', default: 3, example: 3 },
          targetReps: { type: 'integer', example: 10 },
          targetWeightKg: { type: 'number', example: 60 },
          targetDurationSec: { type: 'integer', nullable: true },
          restSeconds: { type: 'integer', default: 60, example: 90 },
          notes: { type: 'string', example: 'Focus on slow eccentric' },
          sets: {
            type: 'array',
            items: { $ref: '#/components/schemas/ExerciseSetInput' },
          },
        },
      },
      CreateWorkoutRequest: {
        type: 'object',
        required: ['title', 'scheduledAt', 'exercises'],
        properties: {
          title: { type: 'string', example: 'Upper Body Hypertrophy' },
          description: { type: 'string', example: 'Chest, Shoulders & Triceps focus' },
          scheduledAt: { type: 'string', format: 'date-time', example: '2026-08-18T09:00:00Z' },
          status: { type: 'string', enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'], default: 'SCHEDULED' },
          durationMinutes: { type: 'integer', example: 60 },
          notes: { type: 'string', example: 'Felt energetic and well-rested' },
          exercises: {
            type: 'array',
            items: { $ref: '#/components/schemas/WorkoutExerciseInput' },
          },
        },
      },
      UpdateWorkoutRequest: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string', nullable: true },
          scheduledAt: { type: 'string', format: 'date-time' },
          status: { type: 'string', enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] },
          completedAt: { type: 'string', format: 'date-time', nullable: true },
          durationMinutes: { type: 'integer', nullable: true },
          notes: { type: 'string', nullable: true },
          exercises: {
            type: 'array',
            items: { $ref: '#/components/schemas/WorkoutExerciseInput' },
          },
        },
      },
      UpdateWorkoutStatusRequest: {
        type: 'object',
        required: ['status'],
        properties: {
          status: { type: 'string', enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'], example: 'COMPLETED' },
          completedAt: { type: 'string', format: 'date-time' },
          durationMinutes: { type: 'integer', example: 65 },
        },
      },
      CreateCommentRequest: {
        type: 'object',
        required: ['content'],
        properties: {
          content: { type: 'string', example: 'Hit a new PR on the 3rd set!' },
        },
      },
    },
  },
  paths: {
    '/api/health': {
      get: {
        tags: ['Health'],
        summary: 'Check API service health status',
        responses: {
          200: {
            description: 'API is healthy and operational',
          },
        },
      },
    },
    '/api/auth/signup': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SignupRequest' },
            },
          },
        },
        responses: {
          201: { description: 'User successfully registered' },
          409: { description: 'Email already exists' },
          422: { description: 'Validation failed' },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Authenticate user and receive JWT',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginRequest' },
            },
          },
        },
        responses: {
          200: { description: 'Login successful' },
          401: { description: 'Invalid credentials' },
        },
      },
    },
    '/api/auth/logout': {
      post: {
        tags: ['Auth'],
        summary: 'Logout user (instructs client to discard token)',
        responses: {
          200: { description: 'Logged out successfully' },
        },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current user profile',
        security: [{ BearerAuth: [] }],
        responses: {
          200: { description: 'User profile returned' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/exercises': {
      get: {
        tags: ['Exercises'],
        summary: 'List exercises with filtering, search, and pagination',
        parameters: [
          { name: 'category', in: 'query', schema: { type: 'string' }, description: 'Filter by category (STRENGTH, CARDIO, etc.)' },
          { name: 'muscleGroup', in: 'query', schema: { type: 'string' }, description: 'Filter by muscle group (CHEST, BACK, LEGS, etc.)' },
          { name: 'equipment', in: 'query', schema: { type: 'string' }, description: 'Filter by equipment' },
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Search name and description' },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 50 } },
        ],
        responses: {
          200: { description: 'List of exercises returned' },
        },
      },
      post: {
        tags: ['Exercises'],
        summary: 'Create a custom exercise',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateExerciseRequest' },
            },
          },
        },
        responses: {
          201: { description: 'Custom exercise created' },
          401: { description: 'Unauthorized' },
          409: { description: 'Exercise name already exists' },
        },
      },
    },
    '/api/exercises/{id}': {
      get: {
        tags: ['Exercises'],
        summary: 'Get exercise by ID',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          200: { description: 'Exercise details returned' },
          404: { description: 'Exercise not found' },
        },
      },
    },
    '/api/workouts': {
      get: {
        tags: ['Workouts'],
        summary: 'List user workouts with filters and sorting',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] } },
          { name: 'view', in: 'query', schema: { type: 'string', enum: ['active', 'pending', 'completed', 'all'] } },
          { name: 'from', in: 'query', schema: { type: 'string', format: 'date-time' }, description: 'Start date filter' },
          { name: 'to', in: 'query', schema: { type: 'string', format: 'date-time' }, description: 'End date filter' },
          { name: 'sort', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'], default: 'asc' } },
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        ],
        responses: {
          200: { description: 'List of workouts returned' },
          401: { description: 'Unauthorized' },
        },
      },
      post: {
        tags: ['Workouts'],
        summary: 'Create a new workout plan with exercises and sets',
        security: [{ BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateWorkoutRequest' },
            },
          },
        },
        responses: {
          201: { description: 'Workout created successfully' },
          400: { description: 'Invalid exercise reference' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/workouts/{id}': {
      get: {
        tags: ['Workouts'],
        summary: 'Get workout plan details by ID',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          200: { description: 'Workout details returned' },
          404: { description: 'Workout not found' },
        },
      },
      put: {
        tags: ['Workouts'],
        summary: 'Update workout plan details, exercises, or sets',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateWorkoutRequest' },
            },
          },
        },
        responses: {
          200: { description: 'Workout updated successfully' },
          404: { description: 'Workout not found' },
        },
      },
      delete: {
        tags: ['Workouts'],
        summary: 'Delete workout plan',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          200: { description: 'Workout deleted successfully' },
          404: { description: 'Workout not found' },
        },
      },
    },
    '/api/workouts/{id}/status': {
      patch: {
        tags: ['Workouts'],
        summary: 'Quick update workout status (e.g. mark COMPLETED)',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateWorkoutStatusRequest' },
            },
          },
        },
        responses: {
          200: { description: 'Workout status updated' },
          404: { description: 'Workout not found' },
        },
      },
    },
    '/api/workouts/{id}/comments': {
      get: {
        tags: ['Workouts'],
        summary: 'Get comments for a workout plan',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          200: { description: 'List of comments returned' },
          404: { description: 'Workout not found' },
        },
      },
      post: {
        tags: ['Workouts'],
        summary: 'Add a comment or reflection to a workout plan',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateCommentRequest' },
            },
          },
        },
        responses: {
          201: { description: 'Comment added' },
          404: { description: 'Workout not found' },
        },
      },
    },
    '/api/reports/summary': {
      get: {
        tags: ['Reports'],
        summary: 'Get comprehensive workout summary & progress statistics',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date-time' } },
          { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date-time' } },
        ],
        responses: {
          200: { description: 'Summary statistics returned' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/reports/exercise-progress/{exerciseId}': {
      get: {
        tags: ['Reports'],
        summary: 'Get exercise progression history, personal records, and estimated 1RM',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'exerciseId', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } },
          { name: 'startDate', in: 'query', schema: { type: 'string', format: 'date-time' } },
          { name: 'endDate', in: 'query', schema: { type: 'string', format: 'date-time' } },
        ],
        responses: {
          200: { description: 'Exercise progression returned' },
          404: { description: 'Exercise not found' },
        },
      },
    },
    '/api/reports/volume-trends': {
      get: {
        tags: ['Reports'],
        summary: 'Get training volume and frequency trends grouped by interval',
        security: [{ BearerAuth: [] }],
        parameters: [
          { name: 'interval', in: 'query', schema: { type: 'string', enum: ['day', 'week', 'month'], default: 'week' } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 12 } },
        ],
        responses: {
          200: { description: 'Volume trends returned' },
          401: { description: 'Unauthorized' },
        },
      },
    },
  },
};
