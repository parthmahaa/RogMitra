import React from 'react';
import { Link } from 'react-router-dom';
import '../Styles/Home.css';
import useAuthStore from '../store/store';
import Navbar from '../Components/Navbar/Navbar';
const Home = () => {
  const { user } = useAuthStore();

  return (
    <div className="bg-gray-50 overflow-hidden">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-[#ecfeff] to-[#a5f3fc]" style={{ minHeight: 'calc(100vh)' }}>
        <Navbar />
        {/* Animated Background Waves */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="wave-bg-1 animate-wave"></div>
          <div className="wave-bg-2 animate-wave-delayed"></div>
          <div className="wave-bg-3 animate-wave-slow"></div>
        </div>

        {/* Main Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto flex flex-col-reverse md:flex-row items-center justify-between pt-16 pb-24 px-6">
          {/* Text Section */}
          <div className="flex-1 text-center md:text-left animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
              Your Trusted <span className="text-[#0891b2]">Health</span>{' '}
              <span className="text-[#0e7490]">Companion</span>
            </h1>
            <p className="text-lg text-gray-700 mb-8 max-w-lg mx-auto md:mx-0">
              Empowering you with AI-driven symptom analysis and personalized health recommendations to take control of your wellbeing.
            </p>
            <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-4">
              <Link to={user ? "/appointment" : "/login"}>
                <button className="px-8 py-3 bg-gradient-to-r from-[#0891b2] to-[#0e7490] text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  {user ? "Get Started" : "Log In"}
                </button>
              </Link>
              <Link to="/our-team">
                <button className="px-8 py-3 border-2 border-[#0891b2] text-[#0891b2] rounded-lg font-semibold hover:bg-[#ecfeff] transition-all duration-300 transform hover:-translate-y-1">
                  Meet Our Experts
                </button>
              </Link>
            </div>
            {/* Trust Indicators */}
            {/* <div className="mt-12 flex flex-col sm:flex-row items-center gap-6 justify-center md:justify-start">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-10 h-10 bg-[#ecfeff] rounded-full">
                  <svg className="w-5 h-5 text-[#0891b2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <span className="ml-3 text-sm text-gray-600">
                  <span className="font-semibold">99%</span> Accuracy Rate
                </span>
              </div>
            </div> */}
          </div>
          {/* Hero Illustration */}
          <div className="flex-1 flex justify-center mb-10 md:mb-0 relative animate-slide-in">
            <div className="relative w-full max-w-md">
              <div className="relative z-10 bg-white p-6 rounded-2xl shadow-2xl border border-gray-100 transform hover:scale-105 transition-transform duration-500">
                <div className="bg-gradient-to-br from-[#a5f3fc] to-[#0ea5e9] rounded-xl h-72 flex items-center justify-center p-4">
                  <svg className="w-40 h-40 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                  </svg>
                </div>
              </div>
              {/* Decorative Elements */}
              <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-[#a5f3fc] opacity-20 -z-10"></div>
              <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-[#0ea5e9] opacity-20 -z-10"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;