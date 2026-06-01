import mongoose from 'mongoose';

const LocationSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g. "Tirupati"
  district: { type: String },
  state: { type: String, default: 'Andhra Pradesh' },
  isFixedPrice: { type: Boolean, default: true },
  fixedTransportPrice: { type: Number, default: 0 }, // for fixed locations
  distanceKm: { type: Number }, // from company location
  isActive: { type: Boolean, default: true },
  coordinates: {
    lat: { type: Number },
    lng: { type: Number },
  },
}, { timestamps: true });

export default mongoose.models.Location || mongoose.model('Location', LocationSchema);
