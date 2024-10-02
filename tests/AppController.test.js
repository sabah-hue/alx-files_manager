// appController.test.js
import AppController from '../controllers/AppController';

describe('AppController', () => {
  let req;
  let res;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  afterEach(() => {
    res.status.mockClear();
    res.json.mockClear();
  });

  describe('getStatus', () => {
    test('returns 200 with both Redis and DB alive', async () => {
      await AppController.getStatus(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        redis: true,
        db: true
      });
    });
  });

  describe('getStats', () => {
    test('returns 200 with correct stats', async () => {
      await AppController.getStats(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        users: 0,
        files: 0
      });
    });
  });
});
