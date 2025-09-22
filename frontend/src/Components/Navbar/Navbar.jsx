// src/Components/Navbar/Navbar.jsx
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../../Styles/Navbar.css';
import { FaStethoscope, FaSignOutAlt } from 'react-icons/fa';
import useAuthStore from '../../store/store';

const Navbar = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    if (mobileMenuOpen) toggleMobileMenu();
  };

  return (
    <nav className="top-0 left-0 w-full">
      <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="relative flex-shrink-0 flex items-center ml-2">
            <Link to="/" className="flex items-center space-x-2 focus:outline-none">
              <FaStethoscope className="text-[#0891b2] text-2xl mr-2" />
              <span className="text-3xl font-extrabold tracking-tight">
                <span className="text-[#0891b2]">Rog</span>
                <span className="text-[#0e7490]">Mitra</span>
              </span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="relative hidden md:flex items-center space-x-6">
            {/* <Link
              to="/"
              className={`flex items-center space-x-1 text-gray-700 ${
                location.pathname === '/' ? 'font-semibold text-[#0891b2]' : ''
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              <span className="text-sm font-medium">Home</span>
            </Link> */}

            {children}

            {user && (
              <div className="relative group">
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-full text-gray-700 focus:outline-none flex items-center"
                >
                  <FaSignOutAlt className="h-6 w-6" />
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="relative md:hidden flex items-center space-x-4">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#0891b2]"
              aria-expanded={mobileMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
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
            {/* <Link
              to="/"
              className={`block px-3 py-3 rounded-md text-base font-medium ${
                location.pathname === '/'
                  ? 'text-[#0891b2] font-semibold bg-[#ecfeff]'
                  : 'text-gray-700'
              }`}
              onClick={toggleMobileMenu}
            >
              Home
            </Link> */}
            {user ? (
              <button
                onClick={handleLogout}
                className="block px-3 py-3 rounded-md text-base font-medium text-gray-700"
              >
                Logout
              </button>
            ) : (
              <>
                <Link
                  to="/signup"
                  className={`block px-3 py-3 rounded-md text-base font-medium ${
                    location.pathname === '/signup'
                      ? 'text-[#0891b2] font-semibold bg-[#ecfeff]'
                      : 'text-gray-700'
                  }`}
                  onClick={toggleMobileMenu}
                >
                  Sign Up
                </Link>
                <Link
                  to="/login"
                  className={`block px-3 py-3 rounded-md text-base font-medium ${
                    location.pathname === '/login'
                      ? 'text-[#0891b2] font-semibold bg-[#ecfeff]'
                      : 'text-gray-700'
                  }`}
                  onClick={toggleMobileMenu}
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
