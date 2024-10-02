import sha1 from 'sha1';
import dbClient from '../utils/db';

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
    const result = dbClient.db.collection('users');
    if (await result.findOne({ email })) {
      res.status(400).json({ error: 'Already exist' });
    }
    const hashPass = sha1(password);
    const userId = await result.createUser({ email, password: hashPass });
    res.status(201).json({ id: userId.insertedId, email });
  }
}

export default UsersController;
