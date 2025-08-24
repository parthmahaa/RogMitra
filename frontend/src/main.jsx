// Update src/main.jsx to include the new route
import { createRoot } from 'react-dom/client';
import './index.css';
import {
  createBrowserRouter,
  RouterProvider,
  Route,
  createRoutesFromElements
} from 'react-router-dom';
import Layout from './Layout.jsx';
import React from 'react';
import Login from './Pages/Login.jsx';
import Signup from './Pages/Signup.jsx';
import Home from './Pages/Home.jsx';
import Appointment from './Pages/Appointment.jsx'; // Add this import
import { AnimatePresence } from 'framer-motion';

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path='' element={<Layout />}>
      <Route path='/login' element={<Login />} />
      <Route path='/signup' element={<Signup />} />
      <Route path='/' element={<Home />} />
      <Route path='/appointment' element={<Appointment />} /> {/* Add this route */}
    </Route>
  )
);

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AnimatePresence mode='wait'>
      <RouterProvider router={router} />
    </AnimatePresence>
  </React.StrictMode>
);