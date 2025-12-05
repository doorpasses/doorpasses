import pino from 'pino';
import config from './index';

const logger = pino({
  level: config.logging.level,
  transport:
    config.app.env === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  base: {
    env: config.app.env,
    region: 'MENA',
  },
});

export default logger;
