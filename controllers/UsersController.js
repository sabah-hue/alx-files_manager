import sha1 from 'sha1';
import { ObjectID } from 'mongodb';
import Queue from 'bull/lib/queue';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

const userQueue = new Queue('email sending');
class UsersController {
  // return if Redis is alive and if the DB is alive too
  static async postNew(request, response) {
    const { email, password } = request.body;
    if (!email) {
      response.status(400).json({ error: 'Missing email' });
      return;
    }
    if (!password) {
      response.status(400).json({ error: 'Missing password' });
      return;
    }
    const usersCollection = dbClient.db.collection('users');
    const existingEmail = await usersCollection.findOne({ email });
    if (existingEmail) {
      response.status(400).json({ error: 'Already exist' });
      return;
    }

    const shaHashedPw = sha1(password);
    const inserted = await usersCollection.insertOne({ email, password: shaHashedPw });
    const userId = inserted.insertedId;
    userQueue.add({ userId });
    response.status(201).json({ id: userId, email });
  }
  // static async postNew(req, res) {
  //   // recieve data
  //   const { email, password } = req.body;
  //   // validate data
  //   if (!email) {
  //     return res.status(400).json({ error: 'Missing email' });
  //   }
  //   if (!password) {
  //     return res.status(400).json({ error: 'Missing password' });
  //   }
  //   const users = dbClient.db.collection('users');
  //   users.findOne({ email }, (err, data) => {
  //     if (data) {
  //       return res.status(400).json({ error: 'Already exist' });
  //     }
  //     const hashPass = sha1(password);
  //     users.insertOne({ email, password: hashPass })
  //       .then((user) => res.status(201).json({ id: user.insertedId, email }))
  //       .catch((e) => console.log(e));
  //   });
  // }

  // retrieve the user base on the token used
  // static async getMe(req, res) {
  //   const token = req.headers['X-Token'];
  //   if (!token) {
  //     return res.status(401).json({ error: 'Unauthorized' });
  //   }
  //   const userId = await redisClient.get(`auth_${token}`);
  //   if (userId) {
  //     const users = dbClient.db.collection('users');
  //     const user = await users.findOne({ _id: ObjectID(userId) });
  //     if (user) {
  //       res.status(200).json({ id: user._id, email: user.email });
  //     } else {
  //       res.status(401).json({ error: 'Unauthorized' });
  //     }
  //   }
  // }
  static async getMe(req, res) {
    const token = req.headers['X-Token'];
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const users = dbClient.db.collection('users');
    const user = await users.findOne({ _id: ObjectID(userId) });
    if (user) {
      return res.status(200).json({ id: user._id, email: user.email });
    }
    return res.status(404).json({ error: 'User not found' });
  }
}

export default UsersController;
