import { v4 as uuidv4 } from 'uuid';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

const { ObjectId } = require('mongodb');
const fs = require('fs');
// const mime = require('mime-types');
const Bull = require('bull');

class FilesController {
  // create a new file in DB and in disk
  static async postUpload(req, res) {
    const fileQueue = new Bull('fileQueue');
    // check token
    const token = req.header('X-Token') || null;
    if (!token) return res.status(401).send({ error: 'Unauthorized' });
    // Bearer key
    const redisToken = await redisClient.get(`auth_${token}`);
    if (!redisToken)
      return res.status(401).send({ error: 'Unauthorized' });

    const user = await dbClient.db
      .collection('users')
      .findOne({ _id: ObjectId(redisToken) });
    if (!user)
      return res.status(401).send({ error: 'Unauthorized' });

    const fileName = req.body.name;
    if (!fileName)
      return res.status(400).send({ error: 'Missing name' });

    const fileType = req.body.type;
    if (!fileType || !['folder', 'file', 'image'].includes(fileType)) return res.status(400).send({ error: 'Missing type' });

    const fileData = req.body.data;
    if (!fileData && ['file', 'image'].includes(fileType))
      return res.status(400).send({ error: 'Missing data' });

    const fileIsPublic = req.body.isPublic || false;
    let idParent = req.body.parentId || 0;
    idParent = idParent === '0' ? 0 : idParent;
    if (idParent !== 0) {
      const parentFile = await dbClient.db
        .collection('files')
        .findOne({ _id: ObjectId(idParent) });
      if (!parentFile)
        return res.status(400).send({ error: 'Parent not found' });
      if (!['folder'].includes(parentFile.type))
        return res.status(400).send({ error: 'Parent is not a folder' });
    }

    const dbFile = {
      userId: user._id,
      name: fileName,
      type: fileType,
      isPublic: fileIsPublic,
      parentId: idParent,
    };

    if (['folder'].includes(fileType)) {
      await dbClient.db.collection('files').insertOne(dbFile);
      return res.status(201).send({
        id: dbFile._id,
        userId: dbFile.userId,
        name: dbFile.name,
        type: dbFile.type,
        isPublic: dbFile.isPublic,
        parentId: dbFile.parentId,
      });
    }

    const pathDir = process.env.FOLDER_PATH || '/tmp/files_manager';
    const uuidFile = uuidv4();

    const buff = Buffer.from(fileData, 'base64');
    const pathFile = `${pathDir}/${uuidFile}`;

    await fs.mkdir(pathDir, { recursive: true }, (error) => {
      if (error)
        return res.status(400).send({ error: error.message });
      return true;
    });

    await fs.writeFile(pathFile, buff, (error) => {
      if (error)
        return res.status(400).send({ error: error.message });
      return true;
    })

    dbFile.localPath = pathFile;
    await dbClient.db.collection('files').insertOne(dbFile);

    fileQueue.add({
      userId: dbFile.userId,
      fileId: dbFile._id,
    });

    return res.status(201).send({
      id: dbFile._id,
      userId: dbFile.userId,
      name: dbFile.name,
      type: dbFile.type,
      isPublic: dbFile.isPublic,
      parentId: dbFile.parentId,
    });
  }
}

module.exports = FilesController;
