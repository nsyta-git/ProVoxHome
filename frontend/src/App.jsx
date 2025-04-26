// src/App.jsx

import { Routes, Route } from 'react-router-dom';
import { useTheme } from './context/ThemeContext';
import ThemeToggleBubble from './components/ThemeToggleBubble';
import Navbar from './components/Navbar';

// Pages
import Home from './pages/Home';
import Signup from './pages/Signup';
import Login from './pages/Login';
import OTPVerify from './pages/OTPVerify';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';


function App() {
  const { theme, mode, toggleMode, cycleTheme } = useTheme();

  return (
    <div className="min-h-screen pt-20 bg-background text-text transition-colors duration-500">
      <Navbar />

      <main className="flex flex-col items-center justify-center p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify-otp" element={<OTPVerify />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </main>

      <ThemeToggleBubble />
    </div>
  );
}

export default App;


// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import { useTheme } from './context/ThemeContext';
// import ThemeToggleBubble from './components/ThemeToggleBubble';
// import Navbar from './components/Navbar';

// // Import Pages
// import Home from './pages/Home';
// import Signup from './pages/Signup';
// import Login from './pages/Login';

// function App() {
//   const { theme, mode, toggleMode, cycleTheme } = useTheme();

//   return (
//     <Router>
//       <div className="min-h-screen pt-20 bg-background text-text transition-colors duration-500">
//         <Navbar />

//         <main className="flex flex-col items-center justify-center p-4">
//           <Routes>
//             <Route path="/" element={<Home />} />
//             <Route path="/signup" element={<Signup />} />
//             <Route path="/login" element={<Login />} />
//           </Routes>
//         </main>

//         <ThemeToggleBubble />
//       </div>
//     </Router>
//   );
// }

// export default App;


// import { useTheme } from './context/ThemeContext'
// import ThemeToggleBubble from './components/ThemeToggleBubble'
// import Navbar from './components/Navbar'

// function App() {
//   const { theme, mode, toggleMode, cycleTheme } = useTheme()

//   return (
//     <div className="min-h-screen pt-20 bg-background text-text transition-colors duration-500">
//       <Navbar />
//       <main className="flex flex-col items-center justify-center p-4">
//         <h1 className="text-3xl font-bold mb-4">Ellu-1 Theme System</h1>
//         <p className="mb-4">Current theme: <b>{theme}</b> / <b>{mode}</b></p>
//         <div className="space-x-4">
//           <button
//             onClick={cycleTheme}
//             className="bg-[var(--color-primary)] text-[var(--color-button-text)] px-4 py-2 rounded"
//           >
//             Change Theme
//           </button>
//           <button
//             onClick={toggleMode}
//             className="bg-[var(--color-secondary)] text-[var(--color-button-text)] px-4 py-2 rounded"
//           >
//             Toggle Mode
//           </button>
//         </div>
//       </main>

//       <ThemeToggleBubble />
//     </div>
//   )
// }

// export default App




// import { useTheme } from "./context/ThemeContext";
// import ThemeToggleBubble from "./components/ThemeToggleBubble";
// import "./App.css";

// function App() {
//   const { theme, mode } = useTheme();

//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-500">
//       <h1 className="text-3xl font-bold mb-4">Ellu-1 Theme Tester</h1>
//       <p className="mb-4">
//         Current theme: <b>{theme}</b> / <b>{mode}</b>
//       </p>
//       <div className="space-x-4">
//         <button className="bg-[var(--color-primary)] text-[var(--color-button-text)] px-4 py-2 rounded">
//           A Button
//         </button>
//         <button className="bg-[var(--color-secondary)] text-[var(--color-button-text)] px-4 py-2 rounded">
//           Another
//         </button>
//       </div>

//       <ThemeToggleBubble />
//     </div>
//   );
// }

// export default App;

