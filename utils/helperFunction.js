import { ObjectId } from 'mongodb';
import redisClient from './redis';
import dbClient from './db';

// function getIdAndKey
const getIdAndKey = async (req) => {
  const result = { userId: null, key: null };
  const token = req.header('X-Token');
  if (!token) return result;
  result.key = `auth_${token}`;
  result.userId = await redisClient.get(result.key);
  return result;
};

/// //// function getUser
const getUser = async (req) => {
  const user = await dbClient.usersCollection.findOne(req);
  return user;
};

/// //// function basicUtils
const checker = async (id) => {
  try {
    ObjectId(id);
  } catch (err) {
    return false;
  }
  return true;
};

module.exports = {
  getIdAndKey,
  getUser,
  checker,
};
