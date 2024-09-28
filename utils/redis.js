// utils/redis.js

import { createClient } from 'redis';

class RedisClient {
  constructor() {
    this.client = createClient();
    
    // Set up error handling
    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err);
    });
  }

  isAlive() {
    return this.client.connected;
  }

  async get(key) {
    try {
      const data = await this.client.get(key);
      return data;
    } catch (error) {
      console.error(`Error fetching key ${key}:`, error);
      throw error;
    }
  }

  async set(key, value, duration) {
    try {
      await this.client.set(key, value, 'EX', duration);
    } catch (error) {
      console.error(`Error setting key ${key}:`, error);
      throw error;
    }
  }

  async del(key) {
    try {
      await this.client.del(key);
    } catch (error) {
      console.error(`Error deleting key ${key}:`, error);
      throw error;
    }
  }
}

// Export an instance of RedisClient
const redisClient = new RedisClient();

export default redisClient;
