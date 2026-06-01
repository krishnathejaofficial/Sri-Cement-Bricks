import { serialize } from 'cookie';

export default function handler(req, res) {
  res.setHeader('Set-Cookie', serialize('admin_token', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  }));
  return res.status(200).json({ success: true });
}
