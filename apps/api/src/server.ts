import createApp from './app';
import config from './config';
import logger from './config/logger';
import prisma from './config/database';
import redis from './config/redis';

/**
 * Start the server
 */
async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('Database connected successfully');

    // Test Redis connection
    await redis.ping();
    logger.info('Redis connected successfully');

    // Create Express app
    const app = createApp();

    // Start server
    const server = app.listen(config.app.port, config.app.host, () => {
      logger.info(
        `🚀 DoorPasses API server running on http://${config.app.host}:${config.app.port}`
      );
      logger.info(`📝 Environment: ${config.app.env}`);
      logger.info(`🌍 Region: MENA`);
      logger.info(`🕌 Arabic RTL: ${config.features.arabicRtl ? 'Enabled' : 'Disabled'}`);
      logger.info(`🕋 Prayer Time Integration: ${config.features.prayerTimeIntegration ? 'Enabled' : 'Disabled'}`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} received, shutting down gracefully...`);

      server.close(async () => {
        logger.info('HTTP server closed');

        try {
          await prisma.$disconnect();
          logger.info('Database disconnected');

          await redis.quit();
          logger.info('Redis disconnected');

          process.exit(0);
        } catch (error) {
          logger.error({ error }, 'Error during shutdown');
          process.exit(1);
        }
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught errors
    process.on('uncaughtException', (error) => {
      logger.error({ error }, 'Uncaught exception');
      gracefulShutdown('uncaughtException');
    });

    process.on('unhandledRejection', (reason, promise) => {
      logger.error({ reason, promise }, 'Unhandled rejection');
      gracefulShutdown('unhandledRejection');
    });
  } catch (error) {
    logger.error({ error }, 'Failed to start server');
    process.exit(1);
  }
}

// Start the server
startServer();
