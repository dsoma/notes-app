import session from 'express-session';
import { RedisStore } from 'connect-redis';
import { createClient } from 'redis';
import SessionFileStore from 'session-file-store';
import { logError } from './app-logger.js';

export async function getSessionStore(redisHost, redisPort) {
    if (redisHost?.length && redisPort) {
        const redisClient = createClient({
            url: `redis://${redisHost}:${redisPort}`
        });

        redisClient.on('error', err => logError('Redis Client Error', err));

        await redisClient.connect();

        return new RedisStore({ client: redisClient });
    }

    const FileStore = SessionFileStore(session);
    return new FileStore({ path: 'sessions' });
}
