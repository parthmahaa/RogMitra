import React, { useState } from "react";
import RegisterImage from "../assets/register.svg";
import { FaEye, FaEyeSlash, FaArrowRight } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import API from "../Services/api";
import useAuthStore from "../store/store";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, when: "beforeChildren" },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } },
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      const response = await API.post("/auth/register", {
        name,
        email,
        password,
      });
      setAuth(response.data.token, response.data.user);
      navigate("/appointment");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="flex flex-col md:flex-row-reverse min-h-screen font-poppins bg-gradient-to-br from-[#f0fdfa] to-[#ecfeff]">
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="hidden md:flex flex-1 justify-center items-center p-8 bg-gradient-to-br from-[#0891b2]/10 to-[#0e7490]/10"
      >
        <div className="relative w-full h-full max-w-lg flex flex-col items-center justify-center">
          <img
            src={RegisterImage}
            alt="Registration visual"
            className="w-full max-w-md transform hover:scale-105 transition-transform duration-500"
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="absolute bottom-10 left-0 right-0 text-center"
          >
            <h3 className="text-xl font-semibold text-[#155e75]">
              Join Our Healthcare Community
            </h3>
            <p className="text-[#0891b2] mt-2">Your journey to better health starts here</p>
          </motion.div>
          <motion.div
            className="mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <Link
              to="/login"
              className="px-6 py-2 rounded-full bg-white text-[#0891b2] font-medium shadow-md hover:bg-[#0891b2] hover:text-white transition-all"
            >
              Already have an account?
            </Link>
          </motion.div>
        </div>
      </motion.div>

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
            <motion.div variants={itemVariants} className="flex justify-center pt-4">
              <span className="text-3xl font-extrabold text-[#155e75] tracking-tight">
                <span className="text-[#0891b2]">Rog</span>
                <span className="text-[#0e7490]">Mitra</span>
              </span>
            </motion.div>

            <motion.div variants={itemVariants} className="text-center my-8">
              <h2 className="text-3xl font-bold text-[#155e75] mb-2">Create Account</h2>
              <p className="text-[#0891b2] mb-6">Fill in your details to get started</p>

              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-500 mb-4"
                >
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col space-y-5">
                <motion.div variants={itemVariants}>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0891b2] text-base bg-white text-gray-900 placeholder-[#0891b2]/50 transition-all"
                    required
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0891b2] text-base bg-white text-gray-900 placeholder-[#0891b2]/50 transition-all"
                    required
                  />
                </motion.div>

                <motion.div variants={itemVariants} className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0891b2] text-base bg-white text-gray-900 placeholder-[#0891b2]/50 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 bottom-3 text-[#0891b2]/50 hover:text-[#0891b2] transition-colors"
                  >
                    {showPassword ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
                  </button>
                </motion.div>

                <motion.div variants={itemVariants} className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0891b2] text-base bg-white text-gray-900 placeholder-[#0891b2]/50 transition-all"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 bottom-3 text-[#0891b2]/50 hover:text-[#0891b2] transition-colors"
                  >
                    {showConfirmPassword ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
                  </button>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="flex items-center text-sm text-[#0891b2]"
                >
                  <input
                    id="terms"
                    type="checkbox"
                    className="h-4 w-4 text-[#0891b2] focus:ring-[#0891b2] border-gray-300 rounded"
                    required
                  />
                  <label htmlFor="terms" className="ml-2">
                    I agree to the{" "}
                    <Link to="#" className="text-[#0e7490] hover:text-[#155e75]">
                      Terms and Conditions
                    </Link>
                  </label>
                </motion.div>

                <motion.div variants={itemVariants} className="flex flex-col gap-3 mt-2">
                  <button
                    type="submit"
                    className="relative flex items-center justify-center bg-[#0891b2] hover:bg-[#0e7490] text-white py-3 px-4 rounded-lg font-medium transition-all hover:shadow-lg"
                  >
                    <span className="flex items-center">
                      Register <FaArrowRight className="ml-2" />
                    </span>
                  </button>
                  <button
                    type="button"
                    className="flex items-center justify-center gap-3 py-3 px-4 rounded-lg font-medium transition-all border border-[#0891b2] hover:bg-[#ecfeff] text-[#0891b2] hover:shadow"
                  >
                    Continue with Google
                  </button>
                </motion.div>
              </form>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="text-center text-sm text-[#0891b2] pb-4"
            >
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-[#0e7490] hover:text-[#155e75] transition-colors"
              >
                Sign in
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Register;