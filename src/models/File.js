import mongoose from 'mongoose';

const FileSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  filename: { type: String, required: true },
  contentType: { type: String, required: true }, // MIME 类型，如 application/pdf、application/zip、application/msword、application/vnd.openxmlformats-officedocument.wordprocessingml.document、application/vnd.ms-excel、application/vnd.openxmlformats-officedocument.spreadsheetml.sheet 等
  data: { type: Buffer, required: true }, // 文件二进制内容
  size: { type: Number, required: true }, // 文件大小（字节）
  ext: { type: String }, // 文件扩展名（可选）
  description: { type: String }, // 文件描述（可选）
}, { timestamps: true });

export default mongoose.models.File || mongoose.model('File', FileSchema);
