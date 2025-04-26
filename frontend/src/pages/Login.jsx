// src/pages/Login.jsx



// frontend/src/pages/Login.jsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await axios.post(
        'http://localhost:5000/api/auth/login',
        form,
        { withCredentials: true }
      );

      // ==== Store token locally ====
      const token = res.data.token;
      if (token) {
        localStorage.setItem('authToken', token);
      }

      setMessage({ type: 'success', text: 'Login successful!' });
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Login failed'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-text p-4">
      <div className="w-full max-w-md p-6 rounded-xl shadow-xl border border-[var(--color-border)] bg-[var(--color-card)]">
        <h2 className="text-2xl font-semibold mb-4 text-center">Login</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              className="w-full px-3 py-2 rounded border border-[var(--color-border)] bg-[var(--color-input)] text-[var(--color-text)]"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              name="password"
              className="w-full px-3 py-2 rounded border border-[var(--color-border)] bg-[var(--color-input)] text-[var(--color-text)]"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          {message.text && (
            <div
              className={`text-sm p-2 rounded ${
                message.type === 'success'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--color-primary)] text-[var(--color-button-text)] py-2 px-4 rounded hover:opacity-90 transition"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="mt-4 text-sm text-center">
          <p>
            Forgot password?{' '}
            <a href="/forgot-password" className="text-[var(--color-primary)] hover:underline">
              Reset here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;


// // frontend/src/pages/Login.jsx

// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';

// const Login = () => {
//   const navigate = useNavigate();
//   const [form, setForm] = useState({ email: '', password: '' });
//   const [message, setMessage] = useState({ type: '', text: '' });
//   const [loading, setLoading] = useState(false);

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//     setMessage({ type: '', text: '' });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setMessage({ type: '', text: '' });

//     try {
//       const res = await axios.post(
//         'http://localhost:5000/api/auth/login',
//         form,
//         { withCredentials: true }
//       );
//       setMessage({ type: 'success', text: 'Login successful!' });
//       setTimeout(() => navigate('/dashboard'), 1500); // Adjust as needed
//     } catch (err) {
//       setMessage({
//         type: 'error',
//         text: err.response?.data?.message || 'Login failed'
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-background text-text p-4">
//       <div className="w-full max-w-md p-6 rounded-xl shadow-xl border border-[var(--color-border)] bg-[var(--color-card)]">
//         <h2 className="text-2xl font-semibold mb-4 text-center">Login</h2>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium mb-1">Email</label>
//             <input
//               type="email"
//               name="email"
//               className="w-full px-3 py-2 rounded border border-[var(--color-border)] bg-[var(--color-input)] text-[var(--color-text)]"
//               value={form.email}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium mb-1">Password</label>
//             <input
//               type="password"
//               name="password"
//               className="w-full px-3 py-2 rounded border border-[var(--color-border)] bg-[var(--color-input)] text-[var(--color-text)]"
//               value={form.password}
//               onChange={handleChange}
//               required
//             />
//           </div>

//           {message.text && (
//             <div
//               className={`text-sm p-2 rounded ${
//                 message.type === 'success'
//                   ? 'bg-green-100 text-green-700'
//                   : 'bg-red-100 text-red-700'
//               }`}
//             >
//               {message.text}
//             </div>
//           )}

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full bg-[var(--color-primary)] text-[var(--color-button-text)] py-2 px-4 rounded hover:opacity-90 transition"
//           >
//             {loading ? 'Logging in...' : 'Login'}
//           </button>
//         </form>

//         <div className="mt-4 text-sm text-center">
//           <p>
//             Forgot password?{' '}
//             <a href="/forgot-password" className="text-[var(--color-primary)] hover:underline">
//               Reset here
//             </a>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;


//___________________________________________________________________
// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { FaEye, FaEyeSlash } from "react-icons/fa";

// const Login = () => {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [showPass, setShowPass] = useState(false);
//   const [message, setMessage] = useState({ text: "", type: "" });
//   const navigate = useNavigate();

//   const handleLogin = async (e) => {
//     e.preventDefault();

//     if (!email || !password) {
//       setMessage({ text: "Please fill all fields.", type: "error" });
//       return;
//     }

//     try {
//       const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, password }),
//       });

//       const data = await res.json();

//       if (res.ok) {
//         setMessage({ text: "Login successful!", type: "success" });
//         setTimeout(() => navigate("/dashboard"), 1000);
//       } else {
//         setMessage({ text: data?.message || "Login failed", type: "error" });
//       }
//     } catch (err) {
//       setMessage({ text: "Something went wrong.", type: "error" });
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-background text-text transition-colors px-4">
//       <div className="bg-[var(--color-surface)] p-8 rounded-lg shadow-md w-full max-w-md">
//         <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
//         <form onSubmit={handleLogin} className="space-y-4">
//           <div>
//             <label className="block mb-1">Email</label>
//             <input
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               className="w-full p-2 rounded border bg-[var(--color-input-bg)] text-text"
//               placeholder="you@example.com"
//               required
//             />
//           </div>

//           <div>
//             <label className="block mb-1">Password</label>
//             <div className="relative">
//               <input
//                 type={showPass ? "text" : "password"}
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 className="w-full p-2 rounded border pr-10 bg-[var(--color-input-bg)] text-text"
//                 placeholder="••••••••"
//                 required
//               />
//               <span
//                 onClick={() => setShowPass(!showPass)}
//                 className="absolute top-1/2 right-3 -translate-y-1/2 text-[var(--color-text-muted)] cursor-pointer"
//               >
//                 {showPass ? <FaEyeSlash /> : <FaEye />}
//               </span>
//             </div>
//           </div>

//           {message.text && (
//             <div
//               className={`text-sm ${
//                 message.type === "error"
//                   ? "text-red-500"
//                   : "text-green-500"
//               }`}
//             >
//               {message.text}
//             </div>
//           )}

//           <button
//             type="submit"
//             className="w-full bg-[var(--color-primary)] text-[var(--color-button-text)] py-2 rounded hover:opacity-90 transition"
//           >
//             Login
//           </button>
//         </form>

//         <div className="mt-4 text-sm text-center">
//           Forgot your password?{" "}
//           <a
//             href="/forgot-password"
//             className="text-[var(--color-link)] hover:underline"
//           >
//             Reset it
//           </a>
//         </div>

//         <div className="mt-2 text-sm text-center">
//           Don't have an account?{" "}
//           <a
//             href="/signup"
//             className="text-[var(--color-link)] hover:underline"
//           >
//             Sign up
//           </a>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Login;

  