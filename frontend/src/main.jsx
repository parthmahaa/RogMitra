import { createRoot } from 'react-dom/client';
import './index.css';
import {
  createBrowserRouter,
  RouterProvider,
  Route,
  Navigate,
  createRoutesFromElements
} from 'react-router-dom';
import Layout from './Layout.jsx';
import React, { useEffect } from 'react';
import Login from './Pages/Login.jsx';
import Signup from './Pages/Signup.jsx';
import Home from './Pages/Home.jsx';
import Appointment from './Pages/Appointment.jsx';
import { AnimatePresence } from 'framer-motion';
import useAuthStore from "./store/store";
import ChatbotResult from './Pages/ChatbotResult.jsx';

const AppRouter = () => {
  const user = useAuthStore((state) => state.user);
  const isLoading = useAuthStore((state) => state.isLoading);
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  if (isLoading) {
    return <div>Loading...</div>; // ADD A LOADER HERE AND ENSURE LAZY LOADING IN EACH COMPONENT
  }


  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="" element={<Layout />}>
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to="/" /> : <Signup />} />
        <Route path="/" element={<Home />} />
        <Route path="/appointment" element={user ? <Appointment /> : <Navigate to="/login" />} />
        <Route path="/chatbot-result" element={<ChatbotResult />} />
      </Route>
    )
  );

  return <RouterProvider router={router} />;
};

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AnimatePresence mode='wait'>
      <AppRouter />
    </AnimatePresence>
  </React.StrictMode>
);
