import React from 'react'
import Nav from '../components/Nav'
import {Outlet, useLocation} from 'react-router-dom'

const Layout = () => {
    const location = useLocation();

    const hideNavbar =
    location.pathname === "/loop" ||
    location.pathname.startsWith("/story/") ||
    location.pathname.startsWith("/messageArea/");

  return (
    <div>
    {!hideNavbar && <Nav />}
      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default Layout
