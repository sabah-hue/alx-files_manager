// redisClient.test.js
import { RedisClient } from '../utils/redis';

describe('RedisClient', () => {
  let redisClient;

  beforeEach(() => {
    redisClient = new RedisClient();
  });

  afterEach(() => {
    // Close the connection after each test
    redisClient.client.quit();
  });

  test('isAlive returns true when connected', async () => {
    await redisClient.set('testKey', 'testValue');
    expect(await redisClient.isAlive()).toBe(true);
  });

  test('get retrieves stored value', async () => {
    const value = await redisClient.set('testKey', 'testValue');
    expect(value).toBe('testValue');
  });

  test('set stores value with expiration', async () => {
    const duration = 10000; // 10 seconds
    await redisClient.set('testKey', 'testValue', duration);
    expect(await redisClient.get('testKey')).toBe('testValue');
    await new Promise(resolve => setTimeout(resolve, duration + 50));
    expect(await redisClient.get('testKey')).toBe(null);
  });

  test('del removes value', async () => {
    await redisClient.set('testKey', 'testValue');
    expect(await redisClient.del('testKey')).toBe(1);
    expect(await redisClient.get('testKey')).toBe(null);
  });
});
