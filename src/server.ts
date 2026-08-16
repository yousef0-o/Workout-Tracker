import { createApp } from './app';
import config from './config/env';
import prisma from './prisma';

const app = createApp();

async function bootstrap() {
  try {
    // Verify database connection
    await prisma.$connect();
    console.log('✅ Connected to SQLite database via Prisma.');

    const server = app.listen(config.port, () => {
      console.log(`🚀 Workout Tracker API is running on http://localhost:${config.port}`);
      console.log(`📑 Swagger Documentation available at http://localhost:${config.port}/api/docs`);
      console.log(`🔍 OpenAPI JSON available at http://localhost:${config.port}/api/docs.json`);
    });

    const shutdown = async () => {
      console.log('\n⏳ Gracefully shutting down...');
      server.close(async () => {
        await prisma.$disconnect();
        console.log('🛑 Server closed and database disconnected.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();
