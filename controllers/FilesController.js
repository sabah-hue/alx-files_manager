import { ObjectId } from 'mongodb';
import mime from 'mime-types';
import Queue from 'bull';
import * as helper from '../utils/helperFunction';
import fileFunctions from '../utils/helperFiles';
// directory
const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';
const fileQueue = new Queue('fileQueue');

class FilesController {
  //  create a new file in DB and in disk
  static async postUpload(req, res) {
    const { userId } = await helper.getIdAndKey(req);

    if (!helper.checker(userId)) {
      return res.status(401).send({ error: 'Unauthorized' });
    }
    if (!userId && req.body.type === 'image') {
      await fileQueue.add({});
    }

    const user = await helper.getUser({ _id: ObjectId(userId) });
    // check if user found
    if (!user) return res.status(401).send({ error: 'Unauthorized' });

    const { error: validationError, fileParams } = await fileFunctions.validateBody(req);

    if (validationError) return res.status(400).send({ error: validationError });
    if (fileParams.parentId !== 0 && !helper.checker(fileParams.parentId)) return res.status(400).send({ error: 'Parent not found' });

    const { error, code, newFile } = await fileFunctions.saveFile(userId, fileParams, FOLDER_PATH);

    if (error) {
      if (res.body.type === 'image') await fileQueue.add({ userId });
      return res.status(code).send(error);
    }

    if (fileParams.type === 'image') {
      await fileQueue.add({
        fileId: newFile.id.toString(),
        userId: newFile.userId.toString(),
      });
    }

    return res.status(201).send(newFile);
  }

  //  retrieve the file document based on the ID
  static async getShow(req, res) {
    // get id from params
    const fileId = req.params.id;

    const { userId } = await helper.getIdAndKey(req);
    const user = await helper.getUser({ _id: ObjectId(userId) });

    if (!user) return res.status(401).send({ error: 'Unauthorized' });
    // Mongo Condition for Id
    if (!helper.checker(fileId) || !helper.checker(userId)) return res.status(404).send({ error: 'Not found' });

    const result = await fileFunctions.getFile({ _id: ObjectId(fileId), userId: ObjectId(userId) });

    if (!result) return res.status(404).send({ error: 'Not found' });

    const file = fileFunctions.processFile(result);
    return res.status(200).send(file);
  }

  // retrieve all users file documents
  // for a specific parentId and with pagination
  static async getIndex(req, res) {
    const { userId } = await helper.getIdAndKey(req);

    const user = await helper.getUser({ _id: ObjectId(userId) });

    if (!user) return res.status(401).send({ error: 'Unauthorized' });

    let parentId = req.query.parentId || '0';

    if (parentId === '0') parentId = 0;

    let page = Number(req.query.page) || 0;

    if (Number.isNaN(page)) page = 0;

    if (parentId !== 0 && parentId !== '0') {
      if (!helper.checker(parentId)) return res.status(401).send({ error: 'Unauthorized' });

      parentId = ObjectId(parentId);
      const folder = await fileFunctions.getFile({ _id: ObjectId(parentId) });

      if (!folder || folder.type !== 'folder') return res.status(200).send([]);
    }
    // pagenation
    const pipeline = [
      { $match: { parentId } },
      { $skip: page * 20 },
      {
        $limit: 20,
      },
    ];

    const fileCursor = await fileFunctions.getFilesOfParentId(pipeline);

    const fileList = [];
    await fileCursor.forEach((doc) => {
      const document = fileFunctions.processFile(doc);
      fileList.push(document);
    });

    return res.status(200).send(fileList);
  }

  // Retrieve the user based on the token
  static async putPublish(req, res) {
    const { error, code, updatedFile } = await fileFunctions.publishUnpublish(req, true);

    if (error) return res.status(code).send({ error });
    return res.status(code).send(updatedFile);
  }

  // Retrieve the user based on the token
  static async putUnpublish(req, res) {
    const { error, code, updatedFile } = await fileFunctions.publishUnpublish(req, false);

    if (error) return res.status(code).send({ error });
    return res.status(code).send(updatedFile);
  }

  // return the content of the file document based on the ID
  static async getFile(req, res) {
    const { userId } = await helper.getIdAndKey(req);
    const { id: fileId } = req.params;
    const size = req.query.size || 0;

    // Mongo Condition for Id
    if (!helper.checker(fileId)) { return res.status(404).send({ error: 'Not found' }); }

    const file = await fileFunctions.getFile({ _id: ObjectId(fileId) });

    if (!file || !fileFunctions.isOwnerAndPublic(file, userId)) return res.status(404).send({ error: 'Not found' });

    if (file.type === 'folder') {
      return res.status(400).send({ error: "A folder doesn't have content" });
    }

    const { error, code, data } = await fileFunctions.getFileData(file, size);

    if (error) return res.status(code).send({ error });

    const mimeType = mime.contentType(file.name);
    res.setHeader('Content-Type', mimeType);
    return res.status(200).send(data);
  }
}

export default FilesController;
