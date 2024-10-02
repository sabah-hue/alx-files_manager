// authController.test.js
import AuthController from '../controllers/AuthController';
import { dbClient, redisClient } from '../utils/redis';

jest.mock('../utils/redis', () => ({
  set: jest.fn(),
  get: jest.fn(),
  del: jest.fn()
}));

jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('testToken')
}));

describe('AuthController', () => {
  let req;
  let res;

  beforeEach(() => {
    req = { header: jest.fn().mockReturnValue('Basic dXNlcm5hbWU6cGFzc3dvcmQ=')};
    res = { 
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    dbClient.db.collection = jest.fn().mockImplementation(() => ({
      findOne: jest.fn().mockResolvedValue(null)
    }));
  });

  afterEach(() => {
    req.header.mockReset();
    res.status.mockClear();
    res.json.mockClear();
    dbClient.db.collection.mockClear();
  });

  describe('getConnect', () => {
    test('returns 401 for unauthorized access', async () => {
      await AuthController.getConnect(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });

    test('generates and returns a token for valid credentials', async () => {
      dbClient.db.collection.findOne.mockResolvedValue({
        email: 'test@example.com',
        password: 'hashedPassword'
      });
      
      await AuthController.getConnect(req, res);

      expect(dbClient.db.collection.findOne).toHaveBeenCalledWith(
        { email: 'test@example.com', password: 'hashedPassword' }
      );
      expect(redisClient.set).toHaveBeenCalledWith('auth_testToken', 'testUserId', 86400);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ token: 'testToken' });
    });
  });

  describe('getDisconnect', () => {
    test('returns 401 for invalid token', async () => {
      req.header.mockReturnValue('X-Token: invalidToken');
      await AuthController.getDisconnect(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });

    test('deletes token and returns 204 for valid token', async () => {
      redisClient.get.mockResolvedValue('testUserId');
      await AuthController.getDisconnect(req, res);

      expect(redisClient.del).toHaveBeenCalledWith('auth_testToken');
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.json).toHaveBeenCalledWith({});
    });
  });
});
