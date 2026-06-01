import jwt from 'jsonwebtoken';
import { parse } from 'cookie';

export function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

export function getTokenFromRequest(req) {
  const cookies = req.headers.cookie ? parse(req.headers.cookie) : {};
  return cookies.admin_token || null;
}

export function isAdminAuthenticated(req) {
  const token = getTokenFromRequest(req);
  if (!token) return false;
  const decoded = verifyToken(token);
  return decoded && decoded.role === 'admin';
}
