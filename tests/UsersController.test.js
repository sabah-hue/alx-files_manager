// usersController.test.js
import UsersController from '../controllers/UsersController';

describe('UsersController', () => {
  let req;
  let res;

  beforeEach(() => {
    req = { body: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  afterEach(() => {
    req.body = {};
    res.status.mockClear();
    res.json.mockClear();
  });

  describe('postNew', () => {
    test('returns 400 for missing email', async () => {
      req.body.email = '';
      await UsersController.postNew(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Missing email' });
    });

    test('returns 201 with new user data', async () => {
      req.body.email = 'test@example.com';
      req.body.password = 'password123';
      await UsersController.postNew(req, res);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ id: expect.any(String), email: 'test@example.com' });
    });
  });

  describe('getMe', () => {
    test('returns 401 for missing token', async () => {
      await UsersController.getMe(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });

    test('returns 200 with user data for valid token', async () => {
      req.headers['X-Token'] = 'valid-token';
      await UsersController.getMe(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ id: expect.any(String), email: expect.any(String) });
    });
  });
});
