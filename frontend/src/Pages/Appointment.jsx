import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaHistory, FaDownload, FaArrowRight } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import API from '../Services/api';
import useAuthStore from '../store/store';

const Appointment = () => {
  const [symptoms, setSymptoms] = useState('');
  const [output, setOutput] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { token, user } = useAuthStore();

  // Move fetchHistory outside useEffect so it can be called anywhere
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
        setError(
          'Authentication required to fetch history. Please log in again.'
        );
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!symptoms.trim()) {
      setError('Please enter your symptoms.');
      return;
    }
    try {
      const response = await API.post('/appointment/analyze', { symptoms });
      setOutput(response.data);
      if (token) {
        fetchHistory();
      }
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
        setError(
          err.response?.data?.message ||
            'Invalid symptoms provided. Please try again.'
        );
      } else {
        setError(
          err.response?.data?.message ||
            'Error analyzing symptoms. Please try again.'
        );
      }
    }
  };

  const handleDownload = () => {
    if (!output) return;
    const blob = new Blob([output.report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'health_report.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f0fdfa] to-[#ecfeff] py-12 px-4 relative">
      <div className="fixed top-20 right-4 z-50">
        <button
          onClick={() => (token ? fetchHistory() : navigate('/login'))}
          disabled={!token}
          className={`flex items-center py-2 px-4 rounded-lg font-medium transition-all hover:shadow-lg ${
            token
              ? 'bg-[#0891b2] hover:bg-[#0e7490] text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <FaHistory className="" />
        </button>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-[#155e75] mb-2">
            Symptom Checker
          </h1>
          <p className="text-[#0891b2] text-lg">
            Enter your symptoms for AI-driven analysis
          </p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-500 text-center mb-8"
          >
            {error}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[#0891b2] font-medium mb-2">
                Describe your symptoms
              </label>
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="e.g., headache, fever, fatigue..."
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0891b2] text-base bg-white text-gray-700 placeholder-[#0891b2]/50 transition-all"
                rows={4}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full flex items-center justify-center bg-[#0891b2] hover:bg-[#0e7490] text-white py-3 px-4 rounded-lg font-medium transition-all hover:shadow-lg"
            >
              Analyze Symptoms <FaArrowRight className="ml-2" />
            </button>
          </form>
        </motion.div>

        {output && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-[#155e75] mb-4">
              Analysis Results
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-[#0891b2]">
                  Possible Diagnosis
                </h3>
                <p className="text-gray-700">{output.diagnosis}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#0891b2]">
                  Recommendations
                </h3>
                <p className="text-gray-700">{output.recommendations}</p>
              </div>
            </div>
            <button
              onClick={handleDownload}
              className="mt-6 flex items-center justify-center bg-[#0891b2] hover:bg-[#0e7490] text-white py-3 px-4 rounded-lg font-medium transition-all hover:shadow-lg w-full md:w-auto"
            >
              Download Report <FaDownload className="ml-2" />
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Appointment;
