import dbConnect from '../../../lib/dbConnect';
import Admin from '../../../models/Admin';
import { signToken } from '../../../lib/auth';
import { serialize } from 'cookie';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  await dbConnect();
  const { email, password } = req.body;

  // Check if any admin exists in the database
  let adminCount = await Admin.countDocuments();
  if (adminCount === 0) {
    // Auto-seed the first admin from environment variables or safe defaults
    const defaultEmail = process.env.ADMIN_EMAIL || 'admin@yourbrickcompany.com';
    const defaultPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    await Admin.create({ email: defaultEmail, password: hashedPassword });
  }

  // Find admin in the database
  const admin = await Admin.findOne({ email });
  if (!admin) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  // Compare passwords
  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const token = signToken({ email: admin.email, role: 'admin' });

  res.setHeader('Set-Cookie', serialize('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  }));

  return res.status(200).json({ success: true, message: 'Logged in successfully' });
}
