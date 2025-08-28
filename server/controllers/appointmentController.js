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
  `You are an advanced AI medical assistant. Your task is to analyze a user's description of their symptoms, extract them, provide a potential diagnosis with a rationale, offer recommendations, and generate a concise report.

  Your output MUST be a single, valid JSON object with the following four keys: "symptoms", "diagnosis", "recommendations", and "report".

  - **symptoms**: An array of strings, listing the identified symptoms. Use clear medical or common terms.
  - **diagnosis**: An array of objects. Each object should have three keys: "condition" (the possible disease), "likelihood" (e.g., "High", "Medium", "Low"), and "reasoning" (a brief explanation of why this condition fits the symptoms). List the most likely diagnosis first.
  - **recommendations**: An array of strings, providing actionable advice. **Crucially, the VERY FIRST recommendation must be a disclaimer advising the user to consult a healthcare professional.**
  - **report**: A single string containing a brief, easy-to-understand narrative summary of the analysis.

  ---
  **EXAMPLE**

  **User Input:** "For the last three days, I've had a killer headache right behind my eyes. My nose is constantly running, I'm sneezing a ton, and I just feel achy and totally wiped out. No fever though."

  **Your JSON Output:**
  \`\`\`json
  {
    "symptoms": [
      "Headache (behind eyes)",
      "Rhinorrhea (Runny Nose)",
      "Sneezing",
      "Myalgia (Body Aches)",
      "Fatigue",
      "Absence of fever"
    ],
    "diagnosis": [
      {
        "condition": "Common Cold (Viral Rhinitis)",
        "likelihood": "High",
        "reasoning": "The combination of upper respiratory symptoms like runny nose and sneezing with systemic symptoms like body aches and fatigue, in the absence of a high fever, is highly characteristic of a common cold."
      },
      {
        "condition": "Sinusitis",
        "likelihood": "Medium",
        "reasoning": "The headache localized behind the eyes can be a strong indicator of sinus inflammation (sinusitis), which often accompanies or follows a cold."
      }
    ],
    "recommendations": [
      "IMPORTANT: This is an AI-generated analysis and not a substitute for professional medical advice. Please consult a qualified healthcare provider for an accurate diagnosis and treatment plan.",
      "Rest as much as possible to allow your body to recover.",
      "Stay hydrated by drinking plenty of fluids like water, broth, or herbal tea."
    ],
    "report": "Based on your symptoms of a headache, runny nose, sneezing, and body aches without a fever, the most likely cause is a common cold. There is also a possibility of sinus inflammation. It is recommended to rest, stay hydrated, and use over-the-counter remedies for symptom relief. Please consult a doctor for a formal diagnosis and if your symptoms worsen or do not improve."
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