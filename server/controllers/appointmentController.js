import axios from 'axios';
import History from '../models/History.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
const genAI=new GoogleGenerativeAI(process.env.GEMINI_KEY);
const analyzeSymptoms = async (req, res) => {
  const { symptoms } = req.body;
  const userId = req.isGuest ? null : req.user?._id;
  if (!symptoms || typeof symptoms !== 'string') {
    return res.status(400).json({ message: 'Symptoms are required and must be a string' });
  }
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

  try {
    /*
      1. Create a prompt here using the model or change the model if needed.
      2. filter out the response from the model and send it to the client according to the history schema given belwo
      3. save the history to the database
      4. return the response
    */
    
    if (userId) {
      const history = new History({
        userId,
        symptoms,
        diagnosis,
        recommendations,
        report,
      });
      await history.save();
    }

    res.json({ diagnosis, recommendations, report });
  } catch (error) {
    console.error('Gemini API error:', error.response?.data || error.message);
    if (error.response?.status === 401) {
      return res.status(401).json({ message: 'Invalid or missing Gemini API key. Please contact support.' });
    }
    if (error.response?.status === 429) {
      return res.status(429).json({ message: 'Gemini API rate limit exceeded. Try again later.' });
    }
    if (error.response?.status === 404) {
      return res.status(500).json({ message: 'Gemini model not found or endpoint is incorrect. Please check your API configuration.' });
    }
    res.status(500).json({ message: 'Error analyzing symptoms' });
  }
};

const getHistory = async (req, res) => {
  if (!req.user || !req.user._id) {
    console.log('User object:', req.user, 'Headers:', req.headers);
    return res.status(401).json({ message: 'Authentication required to view history' });
  }
  try {
    const history = await History.find({ userId: req.user._id }).sort({ date: -1 });
    res.json(history);
  } catch (error) {
    console.error('Error fetching history:', error.message);
    res.status(500).json({ message: 'Error fetching history' });
  }
};

export { analyzeSymptoms, getHistory };