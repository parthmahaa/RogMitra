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
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});

  const initialPromptTemplate = 
  `
  You are an advanced AI medical assistant. Your task is to perform an initial analysis of a user's first message about their symptoms. Your first step is to evaluate the user's input for clarity and sufficiency. Based on this evaluation, you will either perform a full analysis or ask a clarifying follow-up question.
  Your output MUST be a single, valid JSON object with the following six keys: "symptoms", "diagnosis", "recommendations", "report", "conversation", and "sessionTitle".

  Primary Logic Path:
  IF the user's input is sufficient to make a preliminary diagnosis: You will populate all fields with your analysis and generate a comprehensive summary.
  ELSE IF the user's input is insufficient or ambiguous: You will populate the main analysis fields with null and ask a clarifying follow-up question.

  Field-by-Field Instructions:
  symptoms, diagnosis, recommendations, report:
  If the input is sufficient, populate these fields according to the detailed rules below.
  If the input is insufficient, these four fields must be set to null.
  
  conversation:
  This field must always be populated with an array containing two objects:
  The user's initial input: { "user": "{{USER_INPUT}}" }.
  Your AI response. The content of this response depends on the primary logic path:
  If the input was sufficient, this must be a comprehensive and detailed explanation for the user, written in simple, natural language, covering the diagnosis and recommendations in depth. Do not mention JSON field names.
  If the input was insufficient, this must be a specific, clarifying follow-up question.

  sessionTitle:
  A short, concise title (3-5 words) summarizing the user's main complaint.

  Detailed Field Rules (for Sufficient Input):
  symptoms: An array of strings listing key identified symptoms.
  diagnosis: An array of up to 2 objects, each with "condition", "likelihood" (High, Medium, Low), and "reasoning".
  recommendations: An array of up to 4 actionable recommendations, with the disclaimer to consult a provider listed first.
  report: A single-sentence summary of the most likely condition.
  
  EXAMPLE 1 (Sufficient Input)
  User Input: "For two days, I've had a sharp pain in my stomach, and I feel really bloated and nauseous."
  Your JSON Output: 
  {
	  "symptoms": [
		  "Stomach Pain", "Bloating", "Nausea"],
		"diagnosis": [
			{
				"condition": "Indigestion",
				"likelihood": "High",
				"reasoning": "The combination of stomach pain, bloating, and nausea is characteristic of indigestion."
        }
        ],
        "recommendations": [
			"IMPORTANT: ...consult a healthcare provider.",
			"Avoid spicy or fatty foods for a day or two.",
			"Try drinking peppermint tea to soothe your stomach."
      ],
      "report": "The symptoms strongly suggest a case of indigestion.",
      "conversation": [
        {"user": "For two days, I've had a sharp pain in my stomach, and I feel really bloated and nauseous."},
        {"ai": "Based on what you've described, it sounds very likely that you are experiencing indigestion. To help manage this, I would recommend avoiding spicy or fatty foods for the next couple of days and trying some peppermint tea to help soothe your stomach. Most importantly, please remember this is not a formal diagnosis, and it's always best to consult a healthcare provider."}
        ],
		"sessionTitle": "Stomach Pain and Nausea"
    }
    
    EXAMPLE 2 (Insufficient Input)
    User Input: "I don't feel well."
    Your JSON Output: {"symptoms": null, "diagnosis": null, "recommendations": null, "report": null, "conversation": [{"user": "I don't feel well."}, {"ai": "I'm sorry to hear that. Could you please tell me more about your symptoms? For example, where in your body do you feel discomfort, and for how long have you been feeling this way?"}], "sessionTitle": "General Malaise"}

    Now, process the following user input:
    User Input: {{USER_INPUT}}
  Your JSON Output:
  `;
  
  const contextPromptTemplate = 
  `
  You are an advanced AI medical assistant responsible for maintaining and updating a patient's diagnostic session data.
  Your primary function is to act as a stateful JSON processor. You will be given two inputs:
  Existing Session JSON: The complete JSON object representing the current state of the conversation.
  Latest User Message: A string containing the user's most recent input.
  Your first and most important task is to evaluate the user's latest message. Decide if it contains enough clear, new information to update the diagnosis, or if it is ambiguous and requires a clarifying question.
  Based on your evaluation, you will return one single, complete, and valid JSON object representing the updated state.

  Primary Logic Path:
  IF the user's message is sufficient and clear: You must update the JSON fields according to the rules below and generate a detailed, comprehensive response for the user.
  ELSE IF the user's message is insufficient or ambiguous: You must ask a follow-up question and leave the main diagnostic fields and report unchanged.

  Field-by-Field Update Instructions:
  symptoms, diagnosis, recommendations, report:
  Only update these fields if the user's input is sufficient. If you decide to ask a follow-up question, you must return these fields exactly as you received them in the input JSON, without any changes.

  conversation:
  This update is always performed. You must append two new objects in this exact order:
  First, append the user's latest message: { "user": "{{USER_INPUT}}" }.
  Second, append your AI response. The content of this response depends on the primary logic path:
  If you are updating the diagnosis, this response must be a comprehensive and detailed explanation for the user, written in simple, natural, and empathetic language. This is the only output the user will see, so it must be complete and leave no important information out. Your response must cover these points in a conversational flow:

  Acknowledge and Explain in Depth: Start by acknowledging the user's new information. Then, explain the most likely condition(s) from the diagnosis field. Clearly state the reasoning for each diagnosis in easy-to-understand terms, and mention how likely each condition is (e.g., "Based on what you've described, it's highly likely that you're dealing with... because...", or "Another possible but less likely cause could be...").

  Provide Detailed, Actionable Advice: Thoroughly explain each of the key recommendations. Present them as helpful, actionable steps. You must clearly state the critical advice to consult a healthcare provider, explaining that this analysis is not a substitute for professional medical care.

  Summarize the Overall Situation: Conclude with a simple, clear summary that captures the essence of the report, giving the user a final takeaway.
  Crucially, do not use any technical jargon or mention the names of the JSON fields (like "diagnosis" or "recommendations"). You are acting as a helpful medical assistant communicating directly with a person.

  If you need more information, this response must be a specific, clarifying follow-up question.
  Your final output must be only the updated and perfectly formatted JSON object. Do not include any explanatory text, markdown formatting like json, or anything outside of the JSON structure itself.

  sessionTitle:
  This field should generally remain unchanged from the input JSON. Only update it if the user's new message dramatically changes the primary topic of the conversation.

  Now, process the following:
  Existing Session JSON:
  {{EXISTING_JSON_DATA}}

  Latest User Message:
  {{USER_INPUT}}

  Your JSON Output:
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
    console.log(userInput);

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

export { analyzeSymptoms, getHistory };