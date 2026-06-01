import dbConnect from '../../../lib/dbConnect';
import Admin from '../../../models/Admin';
import { isAdminAuthenticated, signToken, getTokenFromRequest } from '../../../lib/auth';
import { serialize } from 'cookie';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).end();
  }

  // Ensure admin is authenticated
  if (!isAdminAuthenticated(req)) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  await dbConnect();
  const { email, password, newPassword, confirmPassword } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email is required' });
  }

  // Find the admin record
  const admin = await Admin.findOne();
  if (!admin) {
    return res.status(404).json({ success: false, message: 'Admin not found' });
  }

  // Verify current password first for security
  if (!password) {
    return res.status(400).json({ success: false, message: 'Current password is required to save changes' });
  }

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    return res.status(400).json({ success: false, message: 'Incorrect current password' });
  }

  // Handle password update if provided
  if (newPassword) {
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'New passwords do not match' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long' });
    }
    admin.password = await bcrypt.hash(newPassword, 10);
  }

  admin.email = email.toLowerCase();
  await admin.save();

  // Re-sign JWT token since email might have changed to avoid session stale
  const token = signToken({ email: admin.email, role: 'admin' });

  res.setHeader('Set-Cookie', serialize('admin_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  }));

  return res.status(200).json({ success: true, message: 'Credentials updated successfully' });
}
