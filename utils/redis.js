#!/usr/bin/env node
import { createClient } from 'redis';
import { promisify } from 'util';


class RedisClient {
  constructor() {
    this.client = createClient();
    this.isConnect = true;
    this.client.on('error', (err) => {
        console.error('Redis client failed to connect:', err.message || err.toString());
        this.isConnect = false;
    });
    this.client.on('connect', () => {this.isConnect = true});
  }

  isAlive() {
    return this.client.isConnect;
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
