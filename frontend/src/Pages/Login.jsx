import React, { useState } from 'react';
import Image from '../assets/log.svg';
import { FaEye, FaEyeSlash, FaArrowRight } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../Services/api';
import useAuthStore from '../store/store';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, when: 'beforeChildren' },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 },
    },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await API.post('/auth/login', { email, password });
      const { token, user } = response.data;
      setAuth(token, user); 
      localStorage.setItem('token', token);
      navigate('/');
    } catch (err) {
      console.error('Login error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen font-poppins bg-gradient-to-br from-[#f0fdfa] to-[#ecfeff]">
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="hidden md:flex flex-1 justify-center items-center p-8 bg-gradient-to-br from-[#0891b2]/10 to-[#0e7490]/10"
      >
        <div className="relative w-full h-full max-w-lg flex flex-col items-center justify-center">
          <img
            src={Image}
            alt="Login visual"
            className="w-full max-w-md transform hover:scale-105 transition-transform duration-500"
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute bottom-10 left-0 right-0 text-center"
          >
            <h3 className="text-xl font-semibold text-[#155e75]">
              Healthcare with Compassion
            </h3>
            <p className="text-[#0891b2] mt-2">Your health is our priority</p>
          </motion.div>
        </div>
      </motion.div>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 flex items-center justify-center p-4 md:p-8"
      >
        <div className="w-full max-w-md">
          <motion.div variants={itemVariants} className="text-center mb-6">
            <h2 className="text-3xl font-bold text-[#155e75]">Welcome Back</h2>
            <p className="text-[#0891b2]">Please sign in to your account</p>
          </motion.div>
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-center"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>
          <form onSubmit={handleSubmit} className="space-y-4">
            <motion.div variants={itemVariants}>
              <label className="block text-[#0891b2] font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0891b2] text-base bg-white text-gray-700 placeholder-[#0891b2]/50 transition-all"
                placeholder="Enter your email"
                required
              />
            </motion.div>
            <motion.div variants={itemVariants} className="relative">
              <label className="block text-[#0891b2] font-medium mb-2">Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0891b2] text-base bg-white text-gray-700 placeholder-[#0891b2]/50 transition-all pr-10"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-10 text-gray-500 hover:text-[#0891b2]"
              >
                {showPassword ? (
                  <FaEyeSlash className="text-lg" />
                ) : (
                  <FaEye className="text-lg" />
                )}
              </button>
            </motion.div>
            <motion.div
              variants={itemVariants}
              className="flex justify-between items-center text-sm text-[#0891b2]"
            >
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-[#0891b2] focus:ring-[#0891b2] border-gray-300 rounded"
                />
                <span>Remember me</span>
              </label>
              <Link to="#" className="hover:text-[#0e7490] transition-colors">
                Forgot password?
              </Link>
            </motion.div>
            <motion.div variants={itemVariants} className="flex flex-col gap-3 mt-2">
              <button
                type="submit"
                className="relative flex items-center justify-center bg-[#0891b2] hover:bg-[#0e7490] text-white py-3 px-4 rounded-lg font-medium transition-all hover:shadow-lg"
              >
                <span className="flex items-center">
                  Sign In <FaArrowRight className="ml-2" />
                </span>
              </button>
              {/* <button
                type="button"
                className="flex items-center justify-center gap-3 py-3 px-4 rounded-lg font-medium transition-all border border-[#0891b2] hover:bg-[#ecfeff] text-[#0891b2] hover:shadow"
              >
                Continue with Google
              </button> */}
            </motion.div>
          </form>
          <motion.div
            variants={itemVariants}
            className="text-center text-sm text-[#0891b2] pb-4"
          >
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="font-medium text-[#0e7490] hover:text-[#155e75] transition-colors"
            >
              Sign up for free
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;