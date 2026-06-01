import dbConnect from '../../../lib/dbConnect';
import Product from '../../../models/Product';
import { isAdminAuthenticated } from '../../../lib/auth';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    // Public: get all available products
    const query = req.query.admin ? {} : { isAvailable: true };
    const products = await Product.find(query).sort({ sortOrder: 1, createdAt: -1 });
    return res.status(200).json({ success: true, data: products });
  }

  // All write operations require admin auth
  if (!isAdminAuthenticated(req)) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  if (req.method === 'POST') {
    const product = await Product.create(req.body);
    return res.status(201).json({ success: true, data: product });
  }

  if (req.method === 'PUT') {
    const { id, ...update } = req.body;
    const product = await Product.findByIdAndUpdate(id, update, { new: true });
    return res.status(200).json({ success: true, data: product });
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    await Product.findByIdAndDelete(id);
    return res.status(200).json({ success: true });
  }

  res.status(405).end();
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

