import sha1 from 'sha1';
import { v4 as uuidv4 } from 'uuid';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class AuthController {
  // sign-in the user by generating a new authentication token
  static async getConnect(req, res) {
    const authHeader = req.header('Authorization');
    // if (!authHeader || typeof (authHeader) !== 'string' || authHeader.slice(0, 6) !== 'Basic ') {
    //   return;
    // }
    const authHeaderData = authHeader.split(' ')[1];
    const decoded = Buffer.from(authHeaderData, 'base64').toString('utf8');
    const data = decoded.split(':'); // user data
    if (data.length !== 2) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const hashedPassword = sha1(data[1]);
    const users = dbClient.db.collection('users');
    const user = await users.findOne({ email: data[0], password: hashedPassword });
    if (user) {
      const token = uuidv4();
      const key = `auth_${token}`;

      await redisClient.set(key, user._id.toString(), 60 * 60 * 24);
      res.status(200).json({ token });
    } else {
      res.status(401).json({ error: 'Unauthorized' });
    }
  }

  // sign-out the user based on the token
  static async getDisconnect(req, res) {
    const token = req.header('X-Token');
    const key = `auth_${token}`;
    const id = await redisClient.get(key);
    if (id) {
      await redisClient.del(key);
      res.status(204).json({});
    } else {
      res.status(401).json({ error: 'Unauthorized' });
    }
  }
}

module.exports = AuthController;
