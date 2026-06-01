import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  orderCode: { type: String, required: true, unique: true },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  customerEmail: { type: String },
  deliveryLocation: { type: String, required: true },
  deliveryAddress: { type: String },
  isCustomLocation: { type: Boolean, default: false },
  customLocationDetails: { type: String }, // typed address or GPS coords
  locationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
  
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    productName: { type: String },
    quantity: { type: Number },
    pricePerUnit: { type: Number },
    price: { type: Number }, // total for this item
  }],
  
  productTotal: { type: Number, default: 0 },
  transportCharge: { type: Number, default: 0 },
  labourCharge: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },
  
  requiresLabour: { type: Boolean, default: false },
  labourDays: { type: Number, default: 0 },
  
  paymentMode: { type: String, enum: ['COD', 'UPI_ADVANCE', 'UPI_FULL'], default: 'COD' },
  paymentStatus: { type: String, enum: ['pending', 'advance_paid', 'fully_paid', 'refunded'], default: 'pending' },
  advanceAmount: { type: Number, default: 0 },
  upiTransactionId: { type: String },
  
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'dispatched', 'delivered', 'cancelled'],
    default: 'pending'
  },
  
  statusHistory: [{
    status: String,
    note: String,
    updatedAt: { type: Date, default: Date.now },
  }],
  
  notes: { type: String },
  adminNotes: { type: String },
  deliveryDate: { type: Date },
  
  // For custom location requests
  customLocationReviewed: { type: Boolean, default: false },
  customTransportQuote: { type: Number },
}, { timestamps: true });

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
