import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class AppController {
  // return if Redis is alive and if the DB is alive too
  static async getStatus(req, res) {
    res.status(200).json({ redis: await redisClient.isAlive(), db: await dbClient.isAlive() });
  }

  // return the number of users and files in DB
  static async getStats(req, res) {
    res.status(200).json({ users: await dbClient.nbUsers(), files: await dbClient.nbFiles() });
  }
}

export default AppController;
