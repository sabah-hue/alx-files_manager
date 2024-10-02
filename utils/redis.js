import { createClient } from 'redis';
import { promisify } from 'util';

// Redis utils
class RedisClient {
  constructor() {
    this.client = createClient();
    this.client.on('error', (e) => {
      /* eslint-disable-next-line no-console */
      console.log(`Redis client not connected to server: ${e}`);
    });
  }

  // returns true when connection success otherwise, false
  isAlive() {
    if (this.client.connected) {
      return true;
    }
    return false;
  }

  // returns the Redis value stored for this key
  async get(key) {
    const data = promisify(this.client.get).bind(this.client);
    const value = await data(key);
    return value;
  }

  // store in redis
  async set(key, value, duration) {
    const data = promisify(this.client.set).bind(this.client);
    // await data(key, value, 'EX', duration);
    await data(key, value);
    await this.client.expire(key, duration);
  }

  // remove the value in Redis for given key
  async del(key) {
    const data = promisify(this.client.del).bind(this.client);
    await data(key);
  }
}

const redisClient = new RedisClient();
module.exports = redisClient;
