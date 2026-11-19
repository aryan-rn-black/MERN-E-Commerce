import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import { AppProvider } from './context/AppContext.jsx'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppProvider>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            className: '!rounded-xl !font-medium !text-sm',
            style: {
              background: '#0f172a',
              color: '#fff',
            },
            success: { iconTheme: { primary: '#ec4899', secondary: '#fff' } },
          }}
        />
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
