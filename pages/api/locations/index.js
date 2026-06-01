import dbConnect from '../../../lib/dbConnect';
import Location from '../../../models/Location';
import { isAdminAuthenticated } from '../../../lib/auth';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    const query = req.query.admin ? {} : { isActive: true };
    const locations = await Location.find(query).sort({ name: 1 });
    return res.status(200).json({ success: true, data: locations });
  }

  if (!isAdminAuthenticated(req)) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  if (req.method === 'POST') {
    const location = await Location.create(req.body);
    return res.status(201).json({ success: true, data: location });
  }

  if (req.method === 'PUT') {
    const { id, ...update } = req.body;
    const location = await Location.findByIdAndUpdate(id, update, { new: true });
    return res.status(200).json({ success: true, data: location });
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    await Location.findByIdAndDelete(id);
    return res.status(200).json({ success: true });
  }

  res.status(405).end();
}
