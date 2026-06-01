import { isAdminAuthenticated, verifyToken, getTokenFromRequest } from '../../../lib/auth';

export default function handler(req, res) {
  if (isAdminAuthenticated(req)) {
    const token = getTokenFromRequest(req);
    const decoded = verifyToken(token);
    return res.status(200).json({ authenticated: true, email: decoded?.email || '' });
  }
  return res.status(401).json({ authenticated: false });
}
