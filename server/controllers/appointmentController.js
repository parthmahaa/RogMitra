import axios from 'axios';
import Session from '../models/Session.js';
import { GoogleGenerativeAI } from '@google/generative-ai';



const analyzeSymptoms = async (req, res) => {
  const { userInput, sessionId } = req.body;  
  const userId = req.isGuest ? null : req.user?._id;
  
  if (!userInput || typeof userInput !== 'string') {  //"symptoms" TO BE CHANGED TO "userInput"
    return res.status(400).json({ message: 'Symptoms are required and must be a string' });
  }
  
  const genAI=new GoogleGenerativeAI(process.env.GEMINI_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite"});

  
  const initialPromptTemplate = `
  You are an advanced medical AI. Analyze the user's first symptom message and return one JSON with keys: "symptoms", "diagnosis", "recommendations", "report", "conversation", "sessionTitle".
  
  Main Logic:
  - If input is clear: fill all fields.
  - If unclear: set symptoms/diagnosis/recommendations/report = null and ask one clarifying question.
  
  Field Rules:
  - symptoms: array of extracted symptoms.
  - diagnosis: up to 2 objects {condition, likelihood: High/Medium/Low, reasoning}.
  - recommendations: up to 4 steps, first = IMPORTANT disclaimer to consult a provider.
  - report: one-sentence summary of most likely condition.
  - conversation: always 2 objects → {"user": input}, {"ai": response}.
     - If clear: response = empathetic, natural, detailed explanation + advice, 20-50 words, no JSON jargon.
     - If unclear: response = one clarifying question.
  - sessionTitle: short (3–5 words) summary of main complaint.
  
  Example JSON (for sufficient input):
  {
    "symptoms": ["Stomach pain", "Bloating", "Nausea"],
    "diagnosis": [
      {"condition": "Indigestion", "likelihood": "High", "reasoning": "Symptoms align with indigestion."}
    ],
    "recommendations": [
      "IMPORTANT: Please consult a healthcare provider.",
      "Avoid spicy or fatty foods.",
      "Drink peppermint tea."
    ],
    "report": "The symptoms strongly suggest indigestion.",
    "conversation": [
      {"user": "For two days, I’ve had stomach pain, bloating, and nausea."},
      {"ai": "Based on what you've described, it's very likely indigestion. To help manage this, avoid spicy or fatty foods, drink peppermint tea, and rest. Most importantly, please see a healthcare provider. This analysis is not a substitute for professional care."}
    ],
    "sessionTitle": "Stomach Pain and Nausea"
  }
  
  Now process this:
  User Input: {{USER_INPUT}}
  
  Return only the JSON.
  `;
  
  
  const contextPromptTemplate = `
  You are a medical AI maintaining a diagnostic session JSON. Input: existing JSON + latest user message. Output: updated JSON only.
  
  Main Logic:
  - If message clear: update symptoms, diagnosis, recommendations, report.
  - If unclear: leave them unchanged, only ask one clarifying question.
  
  Field Rules:
  - symptoms: array of extracted symptoms.
  - diagnosis: up to 2 objects {condition, likelihood: High/Medium/Low, reasoning}.
  - recommendations: up to 4 steps, first = IMPORTANT disclaimer to consult a provider.
  - report: one-sentence summary of most likely condition.
  - conversation: always append {"user": message}, then {"ai": response}.
     - If clear: response must be empathetic, natural, and around 20–50 words. Include:
        1) Acknowledge new info,
        2) Explain most likely condition(s) with likelihood + reasoning,
        3) Give actionable advice (first = consult provider),
        4) End with a short summary.
     - If unclear: response = one clarifying question.
  - sessionTitle: usually same, change only if main topic shifts.
  
  Now process:
  Existing JSON: {{EXISTING_JSON_DATA}}
  Latest User Message: {{USER_INPUT}}
  
  Return only the JSON.
  `;
  

  try {
    let finalPrompt;
    let existingSession = null;
    if (sessionId) {
      existingSession = await Session.findById(sessionId);
      if (!existingSession) {
        return res.status(404).json({ message: 'Session not found' });
      }

      const existingDataForPrompt = {
        symptoms: existingSession.symptoms,
        diagnosis: existingSession.diagnosis,
        recommendations: existingSession.recommendations,
        report: existingSession.report,
        conversation: existingSession.conversation.map(msg => ({ [msg.role]: msg.content })),
        sessionTitle: existingSession.sessionTitle
      };

      finalPrompt = contextPromptTemplate
        .replace('{{EXISTING_JSON_DATA}}', JSON.stringify(existingDataForPrompt))
        .replace('{{USER_INPUT}}', userInput);

    } else {
      finalPrompt = initialPromptTemplate.replace('{{USER_INPUT}}', userInput);
    }

    const result = await model.generateContent(finalPrompt);
    const response = await result.response;
    const text = response.text();

    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace === -1 || lastBrace === -1 || lastBrace < firstBrace) {
      throw new Error('Could not find valid JSON object in Gemini response');
    }
    const cleanedJsonString = text.substring(firstBrace, lastBrace + 1);
    const parsedData = JSON.parse(cleanedJsonString);

    let savedSession;
    const { symptoms, diagnosis, recommendations, report, conversation, sessionTitle } = parsedData;

    const conversationForDb = conversation.map(msg => {
      const role = Object.keys(msg)[0];
      const content = Object.values(msg)[0];
      return { role, content };
    });

    const dataToSave = {
      userId,
      symptoms,
      diagnosis,
      recommendations,
      report,
      conversation: conversationForDb,
      sessionTitle
    };

    if (existingSession) {
      savedSession = await Session.findByIdAndUpdate(sessionId, dataToSave, { new: true, runValidators: true });
    } else {
      const newSession = new Session(dataToSave);
      savedSession = await newSession.save();
    }
    
    res.json(savedSession);

  } catch (error) {
    console.error('API or processing error:', error);
    res.status(500).json({ message: 'Error processing your request.' });
  }
};

const getHistory = async (req, res) => {
  // Check for authenticated user
  if (req.isGuest || !req.user || !req.user._id) {
    return res.status(401).json({ message: 'Authentication required to view history' });
  }

  try {
    console.log(req.user);
    const sessions = await Session.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .select('sessionTitle createdAt');

    const sessionList = sessions.map(session => ({
      id: session._id,
      title: session.sessionTitle || 'Untitled Session',
      date: session.createdAt
    }));

    res.json(sessionList);

  } catch (error) {
    console.error('Error fetching history:', error.message);
    res.status(500).json({ message: 'Error fetching history' });
  }
};

const getSession = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate session ID
    if (!id) {
      return res.status(400).json({ message: 'Session ID is required' });
    }

    // Remove any non-alphanumeric characters (like colons) from the ID
    const cleanId = id.replace(/[^a-f0-9]/g, '');
    
    // Check if the ID is a valid MongoDB ObjectId (24 hex characters)
    if (!/^[0-9a-fA-F]{24}$/.test(cleanId)) {
      return res.status(400).json({ message: 'Invalid session ID format' });
    }

    const session = await Session.findById(cleanId);
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Check if the authenticated user owns this session
    if (req.user && session.userId && !session.userId.equals(req.user._id)) {
      return res.status(403).json({ message: 'Not authorized to access this session' });
    }

    res.json(session);
  } catch (error) {
    console.error('Error fetching session:', error);
    res.status(500).json({ message: 'Error fetching session', error: error.message });
  }
};


export { analyzeSymptoms, getHistory, getSession };