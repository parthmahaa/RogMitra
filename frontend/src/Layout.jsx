import React from 'react'
import Header from './Components/Navbar/Navbar'
import Footer from './Components/Footer/Footer'
import { Outlet } from 'react-router-dom'

function Layout() {
  return (
    <>
    <Header />
    <Outlet/>
    <Footer />
    </>
  )
}

export default Layout