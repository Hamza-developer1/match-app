import { createClient } from 'redis';

let client: ReturnType<typeof createClient> | null = null;

export async function getRedisClient() {
  if (!client) {
    const redisUrl = process.env.REDIS_URL || 
      `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`;
    
    client = createClient({
      url: redisUrl,
      password: process.env.REDIS_PASSWORD || undefined,
      database: parseInt(process.env.REDIS_DB || '0'),
      socket: {
        connectTimeout: 5000,
      },
    });

    client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });

    client.on('connect', () => {
      console.log('🔗 Redis: Connected successfully');
    });

    client.on('disconnect', () => {
      console.log('🔗 Redis: Disconnected');
    });

    await client.connect();
  }

  return client;
}

export class CacheService {
  private static instance: CacheService;
  private client: Awaited<ReturnType<typeof getRedisClient>> | null = null;

  private constructor() {}

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  async getClient() {
    if (!this.client) {
      this.client = await getRedisClient();
    }
    return this.client;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const client = await this.getClient();
      const data = await client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Redis GET error:', error);
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds: number = 300): Promise<boolean> {
    try {
      const client = await this.getClient();
      await client.setEx(key, ttlSeconds, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Redis SET error:', error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      const client = await this.getClient();
      await client.del(key);
      return true;
    } catch (error) {
      console.error('Redis DEL error:', error);
      return false;
    }
  }

  async delPattern(pattern: string): Promise<boolean> {
    try {
      const client = await this.getClient();
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(keys);
      }
      return true;
    } catch (error) {
      console.error('Redis DEL pattern error:', error);
      return false;
    }
  }

  // Generate cache keys
  static keys = {
    conversations: (userId: string) => `conversations:${userId}`,
    messages: (matchId: string, page: number) => `messages:${matchId}:page:${page}`,
    messageCount: (matchId: string) => `message_count:${matchId}`,
    userProfile: (userId: string) => `user:${userId}`,
    userByEmail: (email: string) => `user:email:${email}`,
  };
}

export default CacheService.getInstance();