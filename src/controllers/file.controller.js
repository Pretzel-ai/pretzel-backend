import bcrypt from 'bcrypt';
import { createCRUD } from '../services/crud.service.js';
import { client } from '../services/db.service.js';
import logger from '../config/logger.js';

const userCRUD = createCRUD({ GET: 'users', FROM: 'pretzel' });
const fileCRUD = createCRUD({ GET: 'files', FROM: 'pretzel' });

export const uploadFile = async (req, res, next) => {
  const { owner, authToken, name, size, type, lastModified, created, content } = req.body;

  try {
    if (!name || !size || !type || !lastModified || !created || !content) {
      return res.status(400).json({ error: true, message: 'Missing required fields' });
    }

    const fileId = String(Date.now() + 1);
    await fileCRUD.insert(client, { _id: fileId, content });

    if (!owner || !authToken) {
      const id = String(Date.now());
      const hash = bcrypt.hashSync('guest', 10);
      await userCRUD.insert(client, {
        _id: id,
        name: 'Guest',
        email: 'guest',
        password: hash,
        files: [{ name, size, type, lastModified, created, fileId }],
      });
      return res.json({ _id: id, authToken: hash, fileId, success: true });
    }

    const user = await client.db('pretzel').collection('users').findOne({ _id: owner });
    if (!user || authToken !== user.password) {
      return res.status(401).json({ error: true, message: 'Unable to authenticate user' });
    }

    await userCRUD.update(client, owner, {
      files: [...(user?.files || []), { name, size, type, lastModified, created, fileId }],
    });

    res.json({ _id: user._id, authToken: user.password, fileId, success: true });
  } catch (err) {
    logger.error('Upload file error:', err);
    next(err);
  }
};

export const getFile = async (req, res, next) => {
  const { fileId } = req.params;

  try {
    if (!fileId) {
      return res.status(400).json({ error: true, message: 'Missing required fields' });
    }

    const file = await fileCRUD.get(client, String(fileId));
    if (!file) {
      return res.status(404).json({ error: true, message: 'File not found' });
    }

    res.json(file);
  } catch (err) {
    logger.error('Get file error:', err);
    next(err);
  }
};

export const updateFile = async (req, res, next) => {
  const { fileId, content } = req.body;

  try {
    if (!fileId || !content) {
      return res.status(400).json({ error: true, message: 'Missing required fields' });
    }

    const result = await fileCRUD.update(client, String(fileId), { content });
    res.json(result);
  } catch (err) {
    logger.error('Update file error:', err);
    next(err);
  }
};

export const deleteFile = async (req, res, next) => {
  const { fileId, owner, authToken } = req.body;

  try {
    const user = await client.db('pretzel').collection('users').findOne({ _id: owner });
    if (!user || authToken !== user.password) {
      return res.status(401).json({ error: true, message: 'Unable to authenticate user' });
    }

    await fileCRUD.delete(client, String(fileId));
    const files = user.files.filter((file) => String(file.fileId) !== String(fileId));
    await userCRUD.update(client, owner, { files });

    res.json({ success: true });
  } catch (err) {
    logger.error('Delete file error:', err);
    next(err);
  }
};