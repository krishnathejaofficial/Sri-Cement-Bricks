import dbConnect from '../../../lib/dbConnect';
import { signToken } from '../../../lib/auth';
import { serialize } from 'cookie';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  await dbConnect();
  const { email, password } = req.body;

  // Check against env variables (simple admin auth)
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (email !== adminEmail || password !== adminPassword) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const token = signToken({ email, role: 'admin' });

  res.setHeader('Set-Cookie', serialize('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  }));

  return res.status(200).json({ success: true, message: 'Logged in successfully' });
}
