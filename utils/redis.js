import { createClient } from 'redis';
import { promisify } from 'util';
class RedisClient {
  constructor() {
    this.client = createClient();
    this.isConnect = true;
    this.getAsync = promisify(this.client.get).bind(this.client);
    this.client.on('error', (err) => {
        console.error('Redis client failed to connect:', err.message || err.toString());
        this.isConnect = false;
    });
    this.client.on('connect', () => {this.isConnect = true;});
  }

  isAlive() {
    return this.client.isConnect;
  }

  async get(key) {
    const value = await this.getAsync(key);
    return value;
  }

  async set(key, value, duration) {
    await this.client.set(key, value, 'EX', duration);
  }

  async del(key) {
    await this.client.del(key);
  }
}

const redisClient = new RedisClient();
export default redisClient;
