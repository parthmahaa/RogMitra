import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaHistory } from 'react-icons/fa';
import { Send, Stethoscope, Heart, Brain, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API from '../Services/api';
import useAuthStore from '../store/store';
import Navbar from '../Components/Navbar/Navbar';

// Utility to combine Tailwind classes
const cn = (...classes) => classes.filter(Boolean).join(' ');

// PlaceholdersAndVanishInput Component
const PlaceholdersAndVanishInput = ({ placeholders, onChange, onSubmit, disabled }) => {
  const [currentPlaceholder, setCurrentPlaceholder] = useState(0);
  const [value, setValue] = useState('');
  const [animating, setAnimating] = useState(false);
  const canvasRef = useRef(null);
  const inputRef = useRef(null);
  const newDataRef = useRef([]);
  const intervalRef = useRef(null);

  // Animation for placeholder rotation
  const startAnimation = useCallback(() => {
    intervalRef.current = window.setInterval(() => {
      setCurrentPlaceholder((prev) => (prev + 1) % placeholders.length);
    }, 3000);
  }, [placeholders.length]);

  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState !== 'visible' && intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    } else if (document.visibilityState === 'visible') {
      startAnimation();
    }
  }, [startAnimation]);

  useEffect(() => {
    startAnimation();
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [startAnimation, handleVisibilityChange]);

  // Canvas drawing logic
  const draw = useCallback(() => {
    if (!inputRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    canvas.width = 800;
    canvas.height = 800;
    ctx.clearRect(0, 0, 800, 800);
    const computedStyles = getComputedStyle(inputRef.current);
    const fontSize = parseFloat(computedStyles.getPropertyValue('font-size'));
    ctx.font = `${fontSize * 2}px ${computedStyles.fontFamily}`;
    ctx.fillStyle = '#FFF';
    ctx.fillText(value, 16, 40);

    const imageData = ctx.getImageData(0, 0, 800, 800);
    const pixelData = imageData.data;
    const newData = [];

    for (let t = 0; t < 800; t++) {
      let i = 4 * t * 800;
      for (let n = 0; n < 800; n++) {
        let e = i + 4 * n;
        if (pixelData[e] !== 0 && pixelData[e + 1] !== 0 && pixelData[e + 2] !== 0) {
          newData.push({
            x: n,
            y: t,
            color: [pixelData[e], pixelData[e + 1], pixelData[e + 2], pixelData[e + 3]],
          });
        }
      }
    }

    newDataRef.current = newData.map(({ x, y, color }) => ({
      x,
      y,
      r: 1,
      color: `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]})`,
    }));
  }, [value]);

  useEffect(() => {
    draw();
  }, [value, draw]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !animating) {
      onSubmit(e);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(e);
  };

  return (
    <form
      className={cn(
        'w-full relative max-w-2xl mx-auto bg-background border border-border h-14 rounded-full overflow-hidden shadow-lg transition duration-200',
        value && 'bg-muted/50'
      )}
      onSubmit={handleSubmit}
    >
      <canvas
        className={cn(
          'absolute pointer-events-none text-base transform scale-50 top-[20%] left-2 sm:left-8 origin-top-left filter invert dark:invert-0 pr-20',
          !animating ? 'opacity-0' : 'opacity-100'
        )}
        ref={canvasRef}
      />
      <input
        onChange={(e) => {
          if (!animating) {
            setValue(e.target.value);
            onChange(e);
          }
        }}
        onKeyDown={handleKeyDown}
        ref={inputRef}
        value={value}
        type='text'
        disabled={disabled}
        className={cn(
          'w-full relative text-sm sm:text-base z-50 border-none bg-transparent text-foreground h-full rounded-full focus:outline-none focus:ring-0 pl-4 sm:pl-10 pr-20',
          animating && 'text-transparent',
          disabled && 'cursor-not-allowed opacity-50'
        )}
      />
      <button
        disabled={disabled || !value}
        type='submit'
        className={cn(
          'absolute right-2 top-1/2 z-50 -translate-y-1/2 h-10 w-10 rounded-full transition duration-200 flex items-center justify-center',
          disabled || !value ? 'bg-muted' : 'bg-primary hover:bg-primary/90'
        )}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0.5 }}
          animate={{ scale: value && !disabled ? 1 : 0.8, opacity: value && !disabled ? 1 : 0.5 }}
          transition={{ duration: 0.2 }}
        >
          {disabled ? (
            <svg className="animate-spin h-4 w-4 text-primary-foreground" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
          ) : (
            <Send className='text-primary-foreground h-4 w-4' />
          )}
        </motion.div>
      </button>
      <div className='absolute inset-0 flex items-center rounded-full pointer-events-none'>
        <AnimatePresence mode='wait'>
          {!value && (
            <motion.p
              initial={{ y: 5, opacity: 0 }}
              key={`current-placeholder-${currentPlaceholder}`}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -15, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'linear' }}
              className='text-muted-foreground text-sm sm:text-base font-normal pl-4 sm:pl-12 text-left w-[calc(100%-2rem)] truncate'
            >
              {placeholders[currentPlaceholder]}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </form>
  );
};

// Main Appointment Component
const Appointment = () => {
  const [symptoms, setSymptoms] = useState('');
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  const [showHistoryDropdown, setShowHistoryDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { token, user } = useAuthStore();

  // Ref for the history button and dropdown
  const historyRef = useRef(null);

  // Symptom placeholders
  const symptomPlaceholders = [
    'Describe your headache symptoms...',
    'Tell me about your fever and chills...',
    'What kind of pain are you experiencing?',
    'Describe your digestive issues...',
    'How long have you had these symptoms?',
    'Any chest pain or breathing difficulties?',
    'Describe your fatigue or weakness...',
    'Any skin rashes or changes?',
    'Joint pain or muscle aches?',
    'Sleep problems or insomnia?',
  ];

  // Fetch history
  const fetchHistory = async () => {
    try {
      const response = await API.get('/appointment/history');
      setHistory(response.data);
      setError('');
    } catch (err) {
      console.error(
        'History fetch error:',
        err.response?.data || err.message,
        'Status:',
        err.response?.status
      );
      if (err.response?.status === 401) {
        setError('Authentication required to fetch history. Please log in again.');
        useAuthStore.getState().logout();
        navigate('/login');
      } else {
        setError('Error fetching history. Please try again.');
      }
    }
  };

  useEffect(() => {
    if (token) {
      fetchHistory();
    }
  }, [token]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (historyRef.current && !historyRef.current.contains(event.target)) {
        setShowHistoryDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (!symptoms.trim()) {
      setError('Please enter your symptoms.');
      setLoading(false);
      return;
    }
    try {
      const response = await API.post('/appointment/analyze', { shivangNoLodo: symptoms });
      if (token) {
        await fetchHistory();
      }
      navigate('/chatbot-result', { state: { output: response.data, symptoms } });
    } catch (err) {
      console.error(
        'Analyze error:',
        err.response?.data || err.message,
        'Status:',
        err.response?.status
      );
      if (err.response?.status === 401) {
        if (err.response?.data?.message.includes('Google API key')) {
          setError('API configuration error. Please contact support.');
        } else {
          setError('Session expired. Please log in again.');
          useAuthStore.getState().logout();
          navigate('/login');
        }
      } else if (err.response?.status === 429) {
        setError('Daily request limit reached (3 requests per day).');
      } else if (err.response?.status === 403 && !token) {
        setError('Guest users are limited to one request. Please log in.');
        navigate('/login');
      } else if (err.response?.status === 400) {
        setError(err.response?.data?.message || 'Invalid symptoms provided. Please try again.');
      } else {
        setError(err.response?.data?.message || 'Error analyzing symptoms. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Medical icons for header
  const medicalIcons = [
    { icon: Stethoscope, color: 'text-[#0891b2]', delay: 0 },
    { icon: Heart, color: 'text-red-500', delay: 0.2 },
    { icon: Brain, color: 'text-purple-500', delay: 0.4 },
    { icon: Activity, color: 'text-green-500', delay: 0.6 },
  ];

  return (
    <div className="min-h-screen w-full bg-white relative overflow-hidden">
      {/* Blue Corner Glow Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
            radial-gradient(circle 600px at 0% 200px, #bfdbfe, transparent),
            radial-gradient(circle 600px at 100% 200px, #bfdbfe, transparent)
          `,
        }}
      />
      {/* Navbar always on top */}
      <Navbar />

      {/* History Button + Dropdown */}
      <div className="absolute top-26 right-6 z-50" ref={historyRef}>
        <button
          onClick={() => {
            if (token) {
              fetchHistory();
              setShowHistoryDropdown((s) => !s);
            } else {
              navigate('/login');
            }
          }}
          disabled={!token}
          className={cn(
            'flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-[#0891b2] to-[#0e7490] text-white shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0891b2]',
            !token && 'opacity-50 cursor-not-allowed'
          )}
          aria-label="View history"
        >
          <FaHistory className="text-xl" />
        </button>

        {showHistoryDropdown && token && (
  <motion.div
    initial={{ opacity: 0, y: -10, scale: 0.98 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, y: -10, scale: 0.98 }}
    transition={{ duration: 0.2, ease: 'easeOut' }}
    className="absolute top-full right-0 mt-2 w-96 bg-white rounded-xl shadow-xl border border-gray-100 p-0 z-50 overflow-hidden"
  >
    {/* Header */}
    <div className="bg-gradient-to-r from-[#0891b2] to-[#0e7490] p-4 text-white">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <FaHistory className="text-sm" />
           History
        </h2>
        <span className="text-sm bg-white/20 px-2 py-1 rounded-full">
          {history?.length || 0} {history?.length === 1 ? 'entry' : 'entries'}
        </span>
      </div>
    </div>
    
    {/* Content */}
    <div className="max-h-80 overflow-y-auto p-2">
      {history.length > 0 ? (
        <div className="space-y-3">
          {history.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200 border border-gray-100"
            >
              {/* Date */}
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
                <span className="font-medium text-gray-700 text-sm">
                  {new Date(item.date).toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(item.date).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
              
              {/* Symptoms */}
              <div className="mb-3">
                <p className="text-xs font-medium text-[#155e75] mb-1">Symptoms:</p>
                <p className="text-sm text-gray-700 line-clamp-2">
                  {Array.isArray(item.symptoms) ? item.symptoms.join(', ') : item.symptoms}
                </p>
              </div>
              
              {/* Diagnosis Preview */}
              <div className="mb-3">
                <p className="text-xs font-medium text-[#155e75] mb-1">Assessment:</p>
                {Array.isArray(item.diagnosis) && item.diagnosis.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {item.diagnosis.slice(0, 2).map((diag, i) => (
                      <span 
                        key={i} 
                        className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full"
                      >
                        {diag.condition}
                      </span>
                    ))}
                    {item.diagnosis.length > 2 && (
                      <span className="text-xs text-gray-500">
                        +{item.diagnosis.length - 2} more
                      </span>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500">No diagnosis recorded</p>
                )}
              </div>
              
              {/* View Details Button */}
              <button 
                className="text-xs text-[#0891b2] hover:text-[#0e7490] font-medium flex items-center gap-1 mt-2"
                onClick={() => {
                  navigate('/chatbot-result', { 
                    state: { output: item, symptoms: item.symptoms } 
                  });
                  setShowHistoryDropdown(false);
                }}
              >
                View full details
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
            <FaHistory className="text-gray-400 text-xl" />
          </div>
          <p className="text-sm text-gray-500">No consultation history yet</p>
          <p className="text-xs text-gray-400 mt-1">Your symptom analyses will appear here</p>
        </div>
      )}
    </div>
    
    {/* Footer */}
    {history.length > 0 && (
      <div className="border-t border-gray-200 p-3 bg-gray-50">
        <button 
          className="w-full text-center text-xs text-[#0891b2] hover:text-[#0e7490] font-medium"
          onClick={() => setShowHistoryDropdown(false)}
        >
          Close history
        </button>
      </div>
    )}
  </motion.div>
)}
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto relative z-10 mt-20">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <div className="flex justify-center items-center gap-4 mb-6">
            {medicalIcons.map(({ icon: Icon, color, delay }, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  duration: 0.5,
                  delay,
                  type: 'spring',
                  stiffness: 200,
                }}
                whileHover={{
                  scale: 1.2,
                  rotate: 10,
                  transition: { duration: 0.2 },
                }}
              >
                <Icon className={cn('h-8 w-8', color)} />
              </motion.div>
            ))}
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-5">
            Symptom Checker
          </h1>
          <p className="text-primary text-lg sm:text-xl max-w-2xl mx-auto mt-2">
            Describe your symptoms in detail to get personalized health insights
          </p>
        </motion.div>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="rounded-xl border border-destructive bg-destructive/10 text-destructive px-4 py-3 text-sm shadow-sm">
              {error}
            </div>
          </motion.div>
        )}

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card  p-6 sm:p-8 mb-8"
        >
          <PlaceholdersAndVanishInput
            placeholders={symptomPlaceholders}
            onChange={(e) => setSymptoms(e.target.value)}
            onSubmit={handleSubmit}
            disabled={loading}
          />
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center space-y-4"
        >
          <p className="text-sm text-muted-foreground mb-5">
            💡 Be as specific as possible about your symptoms, duration, and severity
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground mb-10">
            <span className="bg-muted px-3 py-1 rounded-full">🔒 Confidential</span>
            <span className="bg-muted px-3 py-1 rounded-full">⚡ Instant Analysis</span>
            <span className="bg-muted px-3 py-1 rounded-full">🩺 AI-Powered</span>
          </div>
        </motion.div>

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="max-w-xl mx-auto"
        >
          <div className="bg-muted/50 border border-border rounded-lg p-4">
            <p className="text-xs text-muted-foreground">
              <strong>Medical Disclaimer:</strong> This tool is for informational purposes only and
              should not replace professional medical advice. Always consult with a healthcare provider
              for proper diagnosis and treatment.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Appointment;