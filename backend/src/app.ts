import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middleware/error.ts';

if (!process.env.JWT_SECRET) {
  console.warn('⚠️  WARNING: JWT_SECRET is not set. Using insecure default.');
}


// Routes
import authRoutes from './routes/auth.routes.ts';
import projectRoutes from './routes/project.routes.ts';
import taskRoutes from './routes/task.routes.ts';
import teamRoutes from './routes/team.routes.ts';

const app = express();

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    const allowed = [
      process.env.FRONTEND_URL,
      'http://localhost:3000',
      'http://localhost:3001',
    ].filter(Boolean);
    // Allow any *.railway.app domain automatically
    if (allowed.includes(origin) || origin.endsWith('.railway.app') || origin.endsWith('.up.railway.app')) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));
app.use(helmet());
app.use(morgan('dev'));

// Health check
app.get('/', (_req, res) => {
  res.json({ status: 'ok', message: '🚀 TASKO API is running!', version: '1.0.0' });
});

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/team', teamRoutes);

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

export default app;
