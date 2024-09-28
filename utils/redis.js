import { createClient } from 'redis';
import { promisify } from 'util';

class RedisClient {
  constructor() {
    this.client = createClient();
    this.client.on('error', (err) => {
      console.log(`Redis client failed to connect: ${err}`);
    });
  }

  isAlive() {
    if(this.client.connected)
      return true;
    return false;
  }

  async get(key) {
    const data = await promisify(this.client.get).bind(this.client)(key);
    return data;
  }

  async set(key, value, duration) {
    const data = promisify(this.client.set).bind(this.client);
    await data(key, value, 'EX', duration);
    // await data(key, value);
    // await this.client(key, duration);
  }

  async del(key) {
    const data = promisify(this.client.DEL).bind(this.client);
    await data(key);
  }
}

const redisClient = new RedisClient();
export default redisClient;
