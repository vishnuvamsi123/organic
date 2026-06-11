import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../entity/User';
import { Farmer } from '../entity/Farmer';
import { AppDataSource } from '../data-source';

export interface AuthPayload {
  sub: string; // ID of user or farmer
  role: 'user' | 'farmer';
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing token' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET ?? 'super-secret'
    ) as AuthPayload;

    const repo =
      payload.role === 'user'
        ? AppDataSource.getRepository(User)
        : AppDataSource.getRepository(Farmer);
    const principal = await repo.findOne({ where: { id: payload.sub } });
    if (!principal) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    (req as any).principal = principal;
    (req as any).role = payload.role;
    next();
  } catch (e) {
    console.error('🔐 Auth error', e);
    res.status(401).json({ error: 'Invalid token' });
  }
};
