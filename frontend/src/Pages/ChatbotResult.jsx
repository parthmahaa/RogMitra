import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FaArrowLeft, FaPaperPlane, FaUser, FaHistory, FaPlus, FaSpinner } from 'react-icons/fa';
import { BsRobot } from 'react-icons/bs';
import API from '../Services/api';
import useAuthStore from '../store/store';
import Navbar from '../Components/Navbar/Navbar';

// Helper function to format time
function formatTime(date) {
  if (!date) return '';
  const d = new Date(date);
  let hours = d.getHours();
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${hours}:${minutes} ${ampm}`;
}

/* ✅ ChatMessage moved outside and memoized */
const ChatMessage = React.memo(({ text, isBot, timestamp }) => (
  <motion.div
    layout
    className={`flex ${isBot ? 'justify-start' : 'justify-end'} mb-3`}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <div
      className={`flex ${isBot ? 'flex-row' : 'flex-row-reverse'} max-w-[85%] gap-2`}
    >
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isBot
            ? 'bg-blue-100 text-blue-600 shadow-sm'
            : 'bg-teal-100 text-teal-600 shadow-sm'
        }`}
      >
        {isBot ? <BsRobot size={14} /> : <FaUser size={12} />}
      </div>
      <div className="flex flex-col">
        <div
          className={`px-3 py-2 rounded-xl shadow-sm text-sm whitespace-pre-line ${
            isBot
              ? 'bg-white text-gray-800 rounded-bl-sm border border-gray-100'
              : 'bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-br-sm'
          }`}
        >
          {text.split('**').map((part, i) =>
            i % 2 === 1 ? <strong key={i}>{part}</strong> : part
          )}
        </div>
        <span
          className={`text-xs text-gray-500 mt-1 ${
            isBot ? 'text-left' : 'text-right'
          }`}
        >
          {formatTime(timestamp)}
        </span>
      </div>
    </div>
  </motion.div>
));

const ChatbotResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialSession = location.state?.session || null;

  // State declarations
  const [session, setSession] = useState(initialSession);
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shouldAutoScroll, setShouldAutoScroll] = useState(false);

  const { token } = useAuthStore();
  const messageIdRef = useRef(0);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Helper to compare history items
  const isSelectedHistory = (item) => {
    if (!selectedHistory) return false;
    return item.id === selectedHistory.id;
  };

  // Load conversation when a history item is clicked
  const loadSessionConversation = async (historyItem) => {
    if (!historyItem?.id) return;
    
    // Don't reload if already selected
    if (selectedHistory?.id === historyItem.id) return;
    
    setLoading(true);
    setError('');
    
    try {
      console.log('Loading session:', historyItem.id);
      
      // Fetch the session data
      const response = await API.get(`/appointment/session/${historyItem.id}`);
      const sessionData = response.data;
      
      console.log('Session data loaded:', sessionData);
      
      if (sessionData && sessionData.conversation?.length > 0) {
        // Transform conversation to message format with consistent timestamps and IDs
        const conversationMessages = sessionData.conversation.map((msg, index) => ({
          isBot: msg.role === 'ai',
          text: msg.content,
          timestamp: sessionData.updatedAt || sessionData.createdAt,
          messageId: `${sessionData._id}-${index}-${msg.role}`,
        }));
        
        // Update messages with the loaded conversation
        setMessages(conversationMessages);
        
        // Set the selected history item
        setSelectedHistory(historyItem);
        
        // Update current session state
        setSession({
          ...sessionData,
          _id: sessionData._id
        });

        // Update URL to include session ID for refresh persistence
        const newUrl = `${location.pathname}?sessionId=${sessionData._id}`;
        window.history.replaceState(null, '', newUrl);
      }
    } catch (error) {
      console.error('Error loading session:', error);
      setError('Failed to load conversation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch user history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await API.get('/appointment/history');
        setHistory(response.data);
      } catch {
        setHistory([]);
      }
    };
    if (token) fetchHistory();
  }, [token]);

  // Redirect if no session, but try to restore from URL params first
  useEffect(() => {
    const handleSessionRestore = async () => {
      // If no session but we have URL params, try to restore the session
      const urlParams = new URLSearchParams(location.search);
      const sessionId = urlParams.get('sessionId');
      
      if (!session && sessionId) {
        try {
          const response = await API.get(`/appointment/session/${sessionId}`);
          const sessionData = response.data;
          setSession({
            ...sessionData,
            _id: sessionData._id
          });
          return; // Don't navigate away if we successfully restored
        } catch (error) {
          console.error('Failed to restore session:', error);
        }
      }
      
      // Only redirect if we still don't have a session after attempting restore
      if (!session) {
        navigate('/appointment');
      }
    };
    
    handleSessionRestore();
  }, [session, navigate, location.search]);

  // Initialize messages from session conversation on component mount
  useEffect(() => {
    if (session && session.conversation?.length > 0) {
      const conversationMessages = session.conversation.map((msg, index) => ({
        isBot: msg.role === 'ai',
        text: msg.content,
        timestamp: session.updatedAt || session.createdAt || new Date(session.createdAt), // Use consistent timestamp
        messageId: `${session._id}-${index}-${msg.role}`, // Use session ID for consistent messageId
      }));
      
      setMessages(conversationMessages);
      
      // If we have a session ID, try to find it in the history for selection
      if (session._id && history.length > 0) {
        const matchingHistory = history.find(h => h.id === session._id);
        if (matchingHistory) {
          setSelectedHistory(matchingHistory);
        }
      }
    }
  }, [session, history]);

  // Scroll to bottom only when shouldAutoScroll is true - target the chat container specifically
  useEffect(() => {
    if (shouldAutoScroll && chatContainerRef.current) {
      // Scroll the chat container to bottom, not the whole page
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      setShouldAutoScroll(false); // Reset after scrolling
    }
  }, [messages, shouldAutoScroll]);

  // Handle send
  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    setError('');
    
    // Add user message to the conversation
    const userMessage = {
      isBot: false,
      text: input,
      timestamp: new Date(),
      messageId: `user-${Date.now()}`,
    };
    
    setMessages(prev => [...prev, userMessage]);
    const userInput = input;
    setInput('');
    setLoading(true);
    
    // Enable auto-scroll for new messages
    setShouldAutoScroll(true);
    
    try {
      // Send message to backend using /analyze endpoint with sessionId
      const response = await API.post('/appointment/analyze', {
        userInput: userInput,
        sessionId: session?._id // Ensure the current session ID is sent
      });

      // Update the entire conversation from backend response
      if (response.data?.conversation?.length > 0) {
        // Transform the entire conversation to message format with consistent IDs
        const updatedMessages = response.data.conversation.map((msg, index) => ({
          isBot: msg.role === 'ai',
          text: msg.content,
          timestamp: response.data.updatedAt || new Date(),
          messageId: `${response.data._id}-${index}-${msg.role}`,
        }));
        
        // Replace all messages with the updated conversation
        setMessages(updatedMessages);
        
        // Update session data with the response
        // Crucially, update the session state with the full response from the backend.
        // This ensures the session._id is available for the *next* message.
        setSession(response.data);
        
        // Enable auto-scroll for AI responses
        setShouldAutoScroll(true);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
      
      // Remove the user message that was optimistically added
      setMessages(prev => prev.slice(0, -1));
      
      // Add error message
      const errorMessage = {
        isBot: true,
        text: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
        messageId: `error-${Date.now()}`,
      };
      setMessages(prev => [...prev, errorMessage]);
      setShouldAutoScroll(true);
    } finally {
      setLoading(false);
      setInput(''); // Clear input in finally block
    }
  };

  if (!session) return null;

  return (
    <>
      <Navbar />
      {/* Full height after Navbar */}
      <main className="flex flex-1 h-[calc(100vh-64px)] bg-gradient-to-br from-gray-50 to-blue-50">
        {/* History Sidebar */}
        <aside className="w-64 bg-white border-t border-r border-gray-200 flex flex-col h-full">
          <div className="p-5 border-b border-gray-200 flex-shrink-0">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <FaHistory className="text-teal-500" />
              History
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center text-center text-gray-500 h-full">
                <div className="bg-gray-100 p-3 rounded-full mb-3">
                  <FaHistory size={20} />
                </div>
                <p className="mb-3 text-sm">No history available.</p>
                <button
                  onClick={() => navigate('/appointment')}
                  className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-3 py-1.5 rounded-lg text-sm transition-colors"
                >
                  <FaPlus size={10} /> New Consultation
                </button>
              </div>
            ) : (
              <ul className="space-y-2">
                {history.map((item, idx) => (
                  <li key={item.id || idx}>
                    <button
                      className={`w-full text-left p-3 rounded-lg border transition-all hover:border-teal-300 hover:shadow-sm ${
                        isSelectedHistory(item)
                          ? 'bg-teal-50 border-teal-300 ring-1 ring-teal-100'
                          : 'bg-white border-gray-200'
                      } ${
                        loading && isSelectedHistory(item) ? 'opacity-70' : ''
                      }`}
                      disabled={loading}
                      onClick={() => loadSessionConversation(item)}
                    >
                      <div className="font-semibold text-gray-800 text-sm mb-1 line-clamp-1">
                        {Array.isArray(item.title)
                          ? item.title.join(', ')
                          : item.title}
                      </div>
                      <div className="text-xs text-gray-500 flex justify-between items-center">
                        <span className="flex items-center gap-1">
                          {loading && isSelectedHistory(item) && (
                            <FaSpinner className="animate-spin" size={10} />
                          )}
                          {new Date(item.date).toLocaleDateString()}
                        </span>
                        <span>
                          {new Date(item.date).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="p-3 border-t border-gray-200 flex-shrink-0">
            <button
              onClick={() => navigate('/appointment')}
              className="w-full flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-3 py-2 rounded-lg text-sm transition-colors"
            >
              <FaPlus size={12} /> New Consultation
            </button>
          </div>
        </aside>

        {/* Main Chat Content */}
        <div className="flex-1 flex flex-col bg-white h-full">
          {/* Header */}
          <div className="flex items-center justify-between gap-3 p-3 border-t border-gray-200">
            <button
              onClick={() => navigate('/appointment')}
              className="flex items-center gap-2 text-gray-600 hover:text-teal-600 font-medium transition-colors hover:bg-gray-100 p-1.5 rounded-lg"
            >
              <FaArrowLeft size={14} />
              <span className="hidden sm:inline text-sm">Back</span>
            </button>
          </div>

          {/* Chat Section */}
          <div className="flex-1 flex flex-col p-3 relative overflow-hidden">
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto pr-1 custom-scrollbar"
              style={{ height: '100%' }}
            >
              {messages.map((msg) => (
                <AnimatePresence key={msg.messageId}>
                  <ChatMessage
                    text={msg.text}
                    isBot={msg.isBot}
                    timestamp={msg.timestamp}
                  />
                </AnimatePresence>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Error */}
            {error && (
              <motion.div
                className="text-red-500 text-xs mb-2 bg-red-50 py-1.5 px-3 rounded-lg border border-red-100 flex items-center"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <svg
                  className="w-3 h-3 mr-1.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
                </motion.div>
            )}

            {/* Input */}
            <form onSubmit={handleSend} className="w-full mt-2">
              <div className="flex gap-2 items-center bg-white p-1.5 rounded-lg border border-gray-200 shadow-sm">
                <input
                  type="text"
                  className="flex-1 border-0 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-0 transition-all"
                  placeholder="Ask a follow-up question..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={loading}
                  maxLength={500}
                  autoFocus
                />
                <button
                  type="submit"
                  className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white p-2 rounded-lg font-semibold flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow"
                  disabled={loading || !input.trim()}
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <FaPaperPlane size={12} />
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Custom CSS */}
        <style>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 5px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #f8fafc;
            border-radius: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
          }
          .line-clamp-1 {
            display: -webkit-box;
            -webkit-line-clamp: 1;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        `}</style>
      </main>
    </>
  );
};

export default ChatbotResult;