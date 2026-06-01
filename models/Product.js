import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  pricePerUnit: { type: Number, required: true },
  unit: { type: String, default: 'piece' }, // piece, sq ft, etc.
  minOrderQty: { type: Number, default: 100 },
  maxOrderQty: { type: Number, default: 100000 },
  stock: { type: Number, default: -1 }, // -1 = unlimited
  imageUrl: { type: String },
  category: { type: String, default: 'Standard' },
  specifications: { type: Object, default: {} }, // size, weight, strength etc.
  isAvailable: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  sortOrder: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);
