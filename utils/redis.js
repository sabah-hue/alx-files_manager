#!/usr/bin/env node
import { createClient } from 'redis';
import { promisify } from 'util';


class RedisClient {
  constracture() {
    this.client = createClient();
    client.on('error', err => console.log('Redis Client Error', err));
  }

  isAlive() {
    return this.client.connected;
  }

  async get(key) {
    const data = promisify(this.client.get).bind(this.client)(key);
    return data;
  }

  async set(key, value, duration) {
    await promisify(this.client.set)
      .bind(this.client)(key, value, 'EX', duration);
  }

  async del(key) {
    await promisify(this.client.DEL).bind(this.client)(key);
  }
}

const redisClient = new RedisClient();
export default redisClient;
