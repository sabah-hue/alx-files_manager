import sha1 from 'sha1';
import dbClient from '../utils/db';
import redisClient from '../utils/redis'

class UsersController {
  // return if Redis is alive and if the DB is alive too
  static async postNew(req, res) {
    // recieve data
    const { email, password } = req.body;
    // validate data
    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }
    const result = dbClient.db.collection('users');
    if (await result.findOne({ email })) {
      return res.status(400).json({ error: 'Already exist' });
    }
    const hashPass = sha1(password);
    const userId = await result.createUser({ email, password: hashPass });
    return res.status(201).json({ id: userId.insertedId, email });
  }

  // retrieve the user base on the token used
  static async getMe(request, response) {
    const token = request.headers['X-Token'];
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' })
    }else{
      const userId = await redisClient.get(`auth_${token}`);
      if (userId) {
        const users = dbClient.db.collection('users');
        const user = await users.findOne({_id: ObjectID(id)});
        if (user) {
          res.status(200).json({id: user._id, email: user.email});
        } else {
          res.status(401).json({error: 'Unauthorized'});
        }
      }
    }
  }
}

export default UsersController;
