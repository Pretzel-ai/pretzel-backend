import bcrypt from 'bcrypt';
import { createCRUD } from '../services/crud.service.js';
import { client } from '../services/db.service.js';
import logger from '../config/logger.js';

const userCRUD = createCRUD({ GET: 'users', FROM: 'pretzel' });

export const register = async (req, res, next) => {
  const { name, password, email } = req.body;
  const id = String(Date.now());

  try {
    if (!name || !password || !email) {
      return res.status(400).json({ error: true, message: 'Missing required fields' });
    }

    const user = await client.db('pretzel').collection('users').findOne({ email });
    if (user) {
      return res.status(409).json({ error: true, message: 'A user has already registered with this email' });
    }

    const hash = await bcrypt.hash(password, 10);
    await userCRUD.insert(client, { _id: id, name, email, password: hash });

    res.json({ name, email, _id: id, authToken: hash, success: true });
  } catch (err) {
    logger.error('Register error:', err);
    next(err);
  }
};

export const verifyUser = async (req, res, next) => {
  const { email, _id, password, authToken } = req.body;

  try {
    const user = await client
      .db('pretzel')
      .collection('users')
      .findOne({ [_id ? '_id' : 'email']: _id || email });

    if (email) {
      if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: true, message: 'Unable to authenticate user' });
      }
      res.json({ ...user, success: true, authToken: user.password });
    } else if (_id) {
      if (!user || authToken !== user.password) {
        return res.status(401).json({ error: true, message: 'Unable to authenticate user' });
      }
      res.json({ ...user, success: true, authToken: user.password });
    }
  } catch (err) {
    logger.error('Verify user error:', err);
    next(err);
  }
};