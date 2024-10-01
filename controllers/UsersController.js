import dbClient from '../utils/db';
import redisClient from '../utils/redis';
import sha1 from 'sha1';

class UsersController {
  // return if Redis is alive and if the DB is alive too
  static async postNew(req, res) {
    // recieve data
    const { email, password } = req.body;
    // validate data
    if (!email) {
      res.status(400).json({ error: 'Missing email' });
    }
    if (!password) {
      res.status(400).json({ error: 'Missing password' });
    }
    if (await UsersCollection.getUser({ email })) {
      res.status(400).json({ error: 'Already exist' });
    }
    const hashPass = sha1(password);
    const user = await UsersCollection.insertOne({email, password: hashPass});
    res.status(201).json({ id: user._id, email });
  }
}

export default UsersController;
