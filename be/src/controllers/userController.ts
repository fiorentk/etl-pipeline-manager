import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../prisma';

// GET /api/users — list all active users
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      where: { isactive: true },
      select: { id: true, username: true, role: true, created_at: true, updated_at: true, isactive: true },
      orderBy: { created_at: 'desc' },
    });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /api/users — create a new user
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
      res.status(400).json({ error: 'username, password and role are required' });
      return;
    }

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      res.status(409).json({ error: 'Username already exists' });
      return;
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username, password: hashed, role },
      select: { id: true, username: true, role: true, created_at: true },
    });

    res.status(201).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// PUT /api/users/:id — update user (role and/or password)
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { username, password, role } = req.body;

    const updateData: Record<string, unknown> = {};
    if (username) updateData.username = username;
    if (role) updateData.role = role;
    if (password) updateData.password = await bcrypt.hash(password, 10);

    const user = await prisma.user.update({
      where: { id: parseInt(String(id)) },
      data: updateData,
      select: { id: true, username: true, role: true, updated_at: true },
    });

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// DELETE /api/users/:id — soft delete
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.user.update({
      where: { id: parseInt(String(id)) },
      data: { isactive: false },
    });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
