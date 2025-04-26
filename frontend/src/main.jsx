// src/main.jsx

// import { StrictMode } from 'react'
// import { createRoot } from 'react-dom/client'
// import App from './App.jsx'
// import './index.css'
// import { ThemeProvider } from './context/ThemeContext'

// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <ThemeProvider>
//       <App />
//     </ThemeProvider>
//   </StrictMode>
// )

// import React from 'react'
// import ReactDOM from 'react-dom/client'
// import App from './App.jsx'
// import './index.css'
// import { BrowserRouter } from 'react-router-dom'
// import { ThemeProvider } from './context/ThemeContext'

// ReactDOM.createRoot(document.getElementById('root')).render(
//   <React.StrictMode>
//     <BrowserRouter>
//       <ThemeProvider>
//         <App />
//       </ThemeProvider>
//     </BrowserRouter>
//   </React.StrictMode>
// )

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { ThemeProvider } from './context/ThemeContext';
import { BrowserRouter } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);


