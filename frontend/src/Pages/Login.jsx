import React from "react";
import Image from "../assets/log.svg";
import { FaEye, FaEyeSlash, FaArrowRight } from "react-icons/fa";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const Login = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, when: "beforeChildren" }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen font-poppins bg-gradient-to-br from-[#f0fdfa] to-[#ecfeff]">
      {/* Left Side Image */}
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
            <p className="text-[#0891b2] mt-2">
              Your health is our priority
            </p>
          </motion.div>
          <motion.div 
            className="mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <Link
              to="/signup"
              className="px-6 py-2 rounded-full bg-white text-[#0891b2] font-medium shadow-md hover:bg-[#0891b2] hover:text-white transition-all"
            >
              Create Account
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Side Form */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex-1 flex justify-center items-center px-4 py-8 md:p-8"
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          <div className="p-8 sm:p-10">
            {/* Logo */}
            <motion.div variants={itemVariants} className="flex justify-center pt-4">
              <span className="text-3xl font-extrabold text-[#155e75] tracking-tight">
                <span className="text-[#0891b2]">Rog</span>
                <span className="text-[#0e7490]">Mitra</span>
              </span>
            </motion.div>

            {/* Form Content */}
            <motion.div variants={itemVariants} className="text-center my-8">
              <h2 className="text-3xl font-bold text-[#155e75] mb-2">
                Welcome back!
              </h2>
              <p className="text-[#0891b2] mb-6">
                Please enter your details
              </p>

              <div className="flex flex-col space-y-5">
                <motion.div variants={itemVariants}>
                  <input
                    type="email"
                    placeholder="Email"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0891b2] text-base bg-white text-gray-900 placeholder-[#0891b2]/50 transition-all"
                  />
                </motion.div>

                <motion.div variants={itemVariants} className="relative">
                  <input
                    type="password"
                    placeholder="Password"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0891b2] text-base bg-white text-gray-900 placeholder-[#0891b2]/50 transition-all"
                  />
                  <button
                    type="button"
                    className="absolute right-3 bottom-3 text-[#0891b2]/50 hover:text-[#0891b2] transition-colors"
                  >
                    <FaEye className="text-lg" />
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
                  <Link
                    to="#"
                    className="hover:text-[#0e7490] transition-colors"
                  >
                    Forgot password?
                  </Link>
                </motion.div>

                <motion.div variants={itemVariants} className="flex flex-col gap-3 mt-2">
                  <button className="relative flex items-center justify-center bg-[#0891b2] hover:bg-[#0e7490] text-white py-3 px-4 rounded-lg font-medium transition-all hover:shadow-lg">
                    <span className="flex items-center">
                      Sign In <FaArrowRight className="ml-2" />
                    </span>
                  </button>
                  <button
                    type="button"
                    className="flex items-center justify-center gap-3 py-3 px-4 rounded-lg font-medium transition-all border border-[#0891b2] hover:bg-[#ecfeff] text-[#0891b2] hover:shadow"
                  >
                    Continue with Google
                  </button>
                </motion.div>
              </div>
            </motion.div>

            {/* Bottom Text */}
            <motion.div
              variants={itemVariants}
              className="text-center text-sm text-[#0891b2] pb-4"
            >
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="font-medium text-[#0e7490] hover:text-[#155e75] transition-colors"
              >
                Sign up for free
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;