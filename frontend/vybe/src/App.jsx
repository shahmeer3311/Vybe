import React from 'react'
import AppRoutes from './routes/AppRoutes'
import { RouterProvider } from 'react-router-dom';

const App = () => {
  const router=AppRoutes();
  return <RouterProvider router={router} />
}

export default App