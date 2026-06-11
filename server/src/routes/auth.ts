import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../data-source';
import { User } from '../entity/User';
import { Farmer } from '../entity/Farmer';

const router = Router();

function signToken(id: string, role: 'user' | 'farmer') {
  return jwt.sign(
    { sub: id, role },
    process.env.JWT_SECRET ?? 'organic-app-jwt-secret-2024',
    { expiresIn: '7d' }
  );
}

/**
 * POST /api/v1/auth/register
 * body: { role: 'user'|'farmer', name?, email, password }
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { role, email, name, phone, password } = req.body;

    if (!role || !email || !password) {
      return res.status(400).json({ error: 'role, email and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const hash = await bcrypt.hash(password, 10);

    if (role === 'user') {
      // Check if user already exists
      const exists = await AppDataSource.getRepository(User).findOne({ where: { email } });
      if (exists) return res.status(409).json({ error: 'Email already registered' });

      const user = AppDataSource.getRepository(User).create({
        email,
        name: name ?? undefined,
        phone: phone ?? undefined,
        passwordHash: hash,
      });
      await AppDataSource.getRepository(User).save(user);
      const token = signToken(user.id, 'user');
      return res.status(201).json({ token, role: 'user', userId: user.id, name: user.name, email: user.email });
    }

    // Farmer registration
    const exists = await AppDataSource.getRepository(Farmer).findOne({ where: { email } });
    if (exists) return res.status(409).json({ error: 'Email already registered' });

    const farmer = AppDataSource.getRepository(Farmer).create({
      name: name ?? 'Organic Farmer',
      email,
      phone: phone ?? undefined,
      passwordHash: hash,
      rating: 0,
      reviewCount: 0,
      lat: 0,
      lon: 0,
    });
    await AppDataSource.getRepository(Farmer).save(farmer);
    const token = signToken(farmer.id, 'farmer');
    return res.status(201).json({ token, role: 'farmer', farmerId: farmer.id, name: farmer.name, email: farmer.email });

  } catch (err: any) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Registration failed', detail: err.message });
  }
});

/**
 * POST /api/v1/auth/login
 * body: { role: 'user'|'farmer', email, password }
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { role, email, phone, password } = req.body;

    if (!role || !password || (!email && !phone)) {
      return res.status(400).json({ error: 'role, email and password are required' });
    }

    if (role === 'user') {
      const user = await AppDataSource.getRepository(User).findOne({
        where: email ? { email } : { phone },
      });
      if (!user) return res.status(401).json({ error: 'Invalid email or password' });

      const ok = await bcrypt.compare(password, user.passwordHash);
      if (!ok) return res.status(401).json({ error: 'Invalid email or password' });

      const token = signToken(user.id, 'user');
      return res.json({ token, role: 'user', userId: user.id, name: user.name, email: user.email });
    }

    // Farmer login
    const farmer = await AppDataSource.getRepository(Farmer).findOne({
      where: email ? { email } : { phone },
    });
    if (!farmer) return res.status(401).json({ error: 'Invalid email or password' });
    if (!farmer.passwordHash) return res.status(401).json({ error: 'Account not set up for login' });

    const ok = await bcrypt.compare(password, farmer.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid email or password' });

    const token = signToken(farmer.id, 'farmer');
    return res.json({ token, role: 'farmer', farmerId: farmer.id, name: farmer.name, email: farmer.email });

  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Login failed', detail: err.message });
  }
});

/**
 * GET /api/v1/auth/me
 * Returns current authenticated user info
 */
router.get('/me', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  try {
    const token = authHeader.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET ?? 'organic-app-jwt-secret-2024') as any;
    if (payload.role === 'user') {
      const user = await AppDataSource.getRepository(User).findOne({ where: { id: payload.sub } });
      if (!user) return res.status(404).json({ error: 'User not found' });
      return res.json({ id: user.id, role: 'user', email: user.email, name: user.name });
    } else {
      const farmer = await AppDataSource.getRepository(Farmer).findOne({ where: { id: payload.sub } });
      if (!farmer) return res.status(404).json({ error: 'Farmer not found' });
      return res.json({ id: farmer.id, role: 'farmer', email: farmer.email, name: farmer.name });
    }
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
