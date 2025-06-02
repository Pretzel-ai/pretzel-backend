import express from 'express';
import compression from 'compression';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/auth.routes.js';
import fileRoutes from './routes/file.routes.js';
import utilsRoutes from './routes/utils.routes.js';
import errorMiddleware from './middleware/error.middleware.js';

const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ extended: true, limit: '200mb' }));

// Routes
app.get('/', (req, res) => res.send('Hello World'));
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/utils', utilsRoutes);

// Error Handling
app.use(errorMiddleware);

export default app;