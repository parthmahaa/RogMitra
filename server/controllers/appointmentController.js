import axios from 'axios';
import History from '../models/History.js';
import { GoogleGenerativeAI } from '@google/generative-ai';



const analyzeSymptoms = async (req, res) => {
  const { shivangNoLodo } = req.body;  
  const userId = req.isGuest ? null : req.user?._id;
  
  if (!shivangNoLodo || typeof shivangNoLodo !== 'string') {  //"symptoms" TO BE CHANGED TO "userInput"
    return res.status(400).json({ message: 'Symptoms are required and must be a string' });
  }
  
  const genAI=new GoogleGenerativeAI(process.env.GEMINI_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

  const promptTemplate = 
  `You are an advanced AI medical assistant. Your task is to analyze a user's description of their symptoms and provide a concise analysis.

Your output MUST be a single, valid JSON object with the following four keys: "symptoms", "diagnosis", "recommendations", and "report".

- **symptoms**: An array of strings, listing the key identified symptoms. Use simple, common terms.
- **diagnosis**: An array of objects, limited to the top 2 most likely conditions. Each object must have three keys: "condition", "likelihood" (High, Medium, or Low), and "reasoning" (a brief, one-sentence explanation).
- **recommendations**: An array of up to 4 short, actionable recommendations. **The VERY FIRST recommendation must be a disclaimer to consult a healthcare professional.**
- **report**: A single, one-sentence summary of the most likely condition.

---
**EXAMPLE**

**User Input:** "For the last three days, I've had a killer headache right behind my eyes. My nose is constantly running, I'm sneezing a ton, and I just feel achy and totally wiped out. No fever though."

**Your JSON Output:**
\`\`\`json
{
  "symptoms": [
    "Headache",
    "Runny Nose",
    "Sneezing",
    "Body Aches",
    "Fatigue"
  ],
  "diagnosis": [
    {
      "condition": "Common Cold",
      "likelihood": "High",
      "reasoning": "Respiratory and systemic symptoms without a high fever are characteristic of a common cold."
    },
    {
      "condition": "Sinusitis",
      "likelihood": "Medium",
      "reasoning": "The headache localized behind the eyes suggests possible sinus inflammation."
    }
  ],
  "recommendations": [
    "IMPORTANT: This AI analysis is not a substitute for professional medical advice. Please consult a healthcare provider.",
    "Get adequate rest to help your body recover.",
    "Stay hydrated by drinking plenty of fluids.",
    "Consider over-the-counter medication for symptom relief."
  ],
  "report": "The symptoms are highly indicative of a common cold, with a potential for sinus involvement."
}
\`\`\`
---

**Now, process the following user input:**

**User Input:** {{USER_INPUT}}

**Your JSON Output:**
  `;

  try {
    const finalprompt = promptTemplate.replace('{{USER_INPUT}}', shivangNoLodo /* "symptoms" TO BE CHANGED TO "userInput"*/);

    const result = await model.generateContent(finalprompt);
    const response = await result.response;
    const text = response.text();

    // Improved JSON extraction: find the first '{' and last '}' and parse only that substring
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
      throw new Error('Could not find valid JSON object in Gemini response');
    }
    const cleanedJsonString = text.substring(firstBrace, lastBrace + 1);
    const parsedData = JSON.parse(cleanedJsonString);

    const { symptoms, diagnosis, recommendations, report } = parsedData;
    
    if (userId) {
      const history = new History({
        userId,
        symptoms: JSON.stringify(symptoms), 
        diagnosis: JSON.stringify(diagnosis), 
        recommendations: JSON.stringify(recommendations), 
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
    // Parse JSON strings back to arrays/objects for frontend, with error handling
    const parsedHistory = history.map(item => {
      let symptoms = [];
      let diagnosis = [];
      let recommendations = [];
      try {
        symptoms = item.symptoms ? JSON.parse(item.symptoms) : [];
      } catch (e) {
        console.error('Error parsing symptoms JSON:', e.message, item.symptoms);
        symptoms = item.symptoms;
      }
      try {
        diagnosis = item.diagnosis ? JSON.parse(item.diagnosis) : [];
      } catch (e) {
        console.error('Error parsing diagnosis JSON:', e.message, item.diagnosis);
        diagnosis = item.diagnosis;
      }
      try {
        recommendations = item.recommendations ? JSON.parse(item.recommendations) : [];
      } catch (e) {
        console.error('Error parsing recommendations JSON:', e.message, item.recommendations);
        recommendations = item.recommendations;
      }
      return {
        ...item.toObject(),
        symptoms,
        diagnosis,
        recommendations,
      };
    });
    res.json(parsedHistory);
  } catch (error) {
    console.error('Error fetching history:', error.message);
    res.status(500).json({ message: 'Error fetching history' });
  }
};

export { analyzeSymptoms, getHistory };