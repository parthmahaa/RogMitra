import mongoose from "mongoose";

const historySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  symptoms: { type: String, required: true },
  diagnosis: { type: String, required: true },
  recommendations: { type: String, required: true },
  report: { type: String },
});

const History = mongoose.model('History', historySchema);
export default History;