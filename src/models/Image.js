import mongoose from 'mongoose';

const ImageSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  filename: { type: String, required: true },
  contentType: { type: String, required: true },
  data: { type: Buffer, required: true },
}, { timestamps: true });

export default mongoose.models.Image || mongoose.model('Image', ImageSchema);