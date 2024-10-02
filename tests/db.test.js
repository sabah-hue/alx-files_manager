// dbClient.test.js
const { DBClient } = require('../utils/db');

describe('DBClient', () => {
  let dbClient;

  beforeEach(() => {
    dbClient = new DBClient();
  });

  afterEach(() => {
    // Close the connection after each test
    dbClient.client.close();
  });

  test('isAlive returns true', async () => {
    expect(await dbClient.isAlive()).toBe(true);
  });

  test('nbUsers returns the correct count', async () => {
    const usersCount = await dbClient.nbUsers();
    expect(usersCount).toBeGreaterThan(0);
  });

  test('nbFiles returns the correct count', async () => {
    const filesCount = await dbClient.nbFiles();
    expect(filesCount).toBeGreaterThan(0);
  });
});
