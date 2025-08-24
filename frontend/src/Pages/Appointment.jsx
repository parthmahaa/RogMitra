// Update src/Pages/Appointment.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaHistory, FaDownload, FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Appointment = () => {
  const [symptoms, setSymptoms] = useState('');
  const [output, setOutput] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  // Simulated history data
  const mockHistory = [
    {
      date: 'August 23, 2025',
      symptoms: 'Headache, fatigue',
      diagnosis: 'Possible migraine',
      recommendations: 'Rest, hydrate, consult doctor if persists'
    },
    {
      date: 'August 20, 2025',
      symptoms: 'Cough, sore throat',
      diagnosis: 'Common cold',
      recommendations: 'Warm fluids, rest'
    }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setOutput({
      diagnosis: 'Possible condition based on symptoms',
      recommendations: 'Sample recommendations: Rest, medication, etc.',
      report: 'Detailed report content here...'
    });
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
      {/* History Button with Dropdown */}
      <div className="fixed top-20 right-4 z-50">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center bg-[#0891b2] hover:bg-[#0e7490] text-white py-2 px-4 rounded-lg font-medium transition-all hover:shadow-lg"
        >
          <FaHistory className="" />
        </button>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-lg p-4 z-50"
          >
            <h2 className="text-xl font-bold text-[#155e75] mb-2">History</h2>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {mockHistory.map((item, index) => (
                <div key={index} className="border-b border-gray-200 pb-2 last:border-0">
                  <h3 className="font-semibold text-[#0891b2]">{item.date}</h3>
                  <p className="text-gray-700 text-sm"><strong>Symptoms:</strong> {item.symptoms}</p>
                  <p className="text-gray-700 text-sm"><strong>Diagnosis:</strong> {item.diagnosis}</p>
                  <p className="text-gray-700 text-sm"><strong>Recommendations:</strong> {item.recommendations}</p>
                </div>
              ))}
              {mockHistory.length === 0 && (
                <p className="text-gray-600 text-center text-sm">No history available yet.</p>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Main Content */}
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
                <h3 className="text-lg font-semibold text-[#0891b2]">Possible Diagnosis</h3>
                <p className="text-gray-700">{output.diagnosis}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#0891b2]">Recommendations</h3>
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