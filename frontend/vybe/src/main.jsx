import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import { IKContext } from "imagekitio-react";

const queryClient=new QueryClient();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <IKContext
        publicKey="public_3Av7UFe1guOm6TP0eA5nAIOVVqs="
        urlEndpoint="https://ik.imagekit.io/crhjmvdeo"
        authenticationEndpoint="http://localhost:3001/api/imagekit/auth"
      >
        <App />
      </IKContext>
    </QueryClientProvider>
  </StrictMode>,
)
