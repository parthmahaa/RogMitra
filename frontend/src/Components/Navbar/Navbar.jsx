import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../../Styles/Navbar.css';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <nav className="bg-white/90 backdrop-blur-lg shadow-md sticky top-0 z-50 border-b border-gray-200/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex-shrink-0 flex items-center">
            <Link 
              to="/" 
              className="group flex items-center space-x-2 focus:outline-none animate-logo"
            >
              <span className="text-3xl font-extrabold tracking-tight">
                <span className="text-[#0891b2] group-hover:text-[#0e7490] transition-colors duration-300">Rog</span>
                <span className="text-[#0e7490] group-hover:text-[#155e75] transition-colors duration-300">Mitra</span>
              </span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => navigate('/')}
              className="flex items-center space-x-1 text-gray-700 hover:text-[#0891b2] transition-colors duration-300 group"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-sm font-medium"></span>
            </button>
            
            <div className="relative group">
              <button
                onClick={() => navigate('/signup')}
                className="p-2 rounded-full text-gray-700 hover:text-[#0891b2] hover:bg-gray-100 focus:outline-none transition-all duration-300 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-full text-gray-700 hover:text-[#0891b2] hover:bg-gray-100 transition-colors duration-300"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </button>
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-[#0891b2] hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#0891b2] transition-all duration-300 transform hover:scale-110"
              aria-expanded={mobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-sm shadow-lg animate-mobile-menu">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/"
              className={`block px-3 py-3 rounded-md text-base font-medium transition-all duration-300 ${
                location.pathname === '/' 
                  ? 'text-[#0891b2] font-semibold bg-[#ecfeff]' 
                  : 'text-gray-700 hover:text-[#0891b2] hover:bg-[#f0fdfa]'
              }`}
              onClick={toggleMobileMenu}
            >
              Home
            </Link>
            <Link
              to="/signup"
              className={`block px-3 py-3 rounded-md text-base font-medium transition-all duration-300 ${
                location.pathname === '/signup' 
                  ? 'text-[#0891b2] font-semibold bg-[#ecfeff]' 
                  : 'text-gray-700 hover:text-[#0891b2] hover:bg-[#f0fdfa]'
              }`}
              onClick={toggleMobileMenu}
            >
              Sign Up
            </Link>
            <Link
              to="/login"
              className={`block px-3 py-3 rounded-md text-base font-medium transition-all duration-300 ${
                location.pathname === '/login' 
                  ? 'text-[#0891b2] font-semibold bg-[#ecfeff]' 
                  : 'text-gray-700 hover:text-[#0891b2] hover:bg-[#f0fdfa]'
              }`}
              onClick={toggleMobileMenu}
            >
              Login
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;