import mongoose from "mongoose";

const diagnosisSchema = new mongoose.Schema({
  condition: {
    type: String,
    required: true,
    trim: true
  },
  likelihood: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    required: true
  },
  reasoning: {
    type: String,
    required: true,
    trim: true
  }
}, { _id: false });

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'ai'],
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  }
}, { _id: false });

const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  symptoms: {
    type: [String],
    default: []
  },
  diagnosis: {
    type: [diagnosisSchema],
    default: []
  },
  recommendations: {
    type: [String],
    default: []
  },
  report: {
    type: String,
    trim: true
  },
  conversation: {
    type: [messageSchema],
    default: []
  },
  sessionTitle: {
    type: String,
    default: []
  }
}, {
  timestamps: true
});

const Session = mongoose.model('Session', sessionSchema);

export default Session;