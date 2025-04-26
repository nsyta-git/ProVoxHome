// frontend/src/pages/ResetPassword.jsx
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { email, otp } = location.state || {};

  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!email || !otp) {
      navigate('/forgot-password');
    }
  }, [email, otp]);

  const handleSubmit = async () => {
    if (newPass !== confirmPass) {
      setMessage({ type: 'error', text: "Passwords don't match!" });
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/reset-password', {
        email,
        otp,
        newPassword: newPass,
      });

      setMessage({ type: 'success', text: res.data.message || 'Password reset successful!' });

      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to reset password.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-text p-4">
      <div className="w-full max-w-md p-6 rounded-xl shadow-xl border border-border bg-surface">
        <h2 className="text-2xl font-semibold mb-6 text-center">Reset Password</h2>

        <div className="space-y-4">
          <input
            type="email"
            value={email}
            disabled
            className="w-full px-4 py-3 rounded border border-border bg-background text-text"
          />

          <input
            type="password"
            placeholder="New Password"
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
            className="w-full px-4 py-3 rounded border border-border bg-background text-text placeholder:text-gray-500"
          />

          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPass}
            onChange={(e) => setConfirmPass(e.target.value)}
            className="w-full px-4 py-3 rounded border border-border bg-background text-text placeholder:text-gray-500"
          />

          <button
            onClick={handleSubmit}
            disabled={!newPass || !confirmPass || loading}
            className="w-full bg-primary text-white font-semibold py-3 px-4 rounded hover:opacity-90 transition"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>

          {message.text && (
            <div
              className={`text-sm p-3 rounded ${
                message.type === 'success'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="mt-6 text-sm text-center">
            <p>
              Ready to login?{' '}
              <a href="/login" className="text-primary hover:underline font-medium">
                Login Now
              </a>
            </p>
            <p>
              Need a new account?{' '}
              <a href="/signup" className="text-primary hover:underline font-medium">
                Sign Up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;

// // frontend/src/pages/ResetPassword.jsx
// import { useState } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import axios from 'axios';

// const ResetPassword = () => {
//   const navigate = useNavigate();
//   const { state } = useLocation();
//   const { email, otp } = state || {};

//   const [newPassword, setNewPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [message, setMessage] = useState({ type: '', text: '' });
//   const [loading, setLoading] = useState(false);

//   if (!email || !otp) {
//     navigate('/forgot-password');
//     return null;
//   }

//   const handleResetPassword = async () => {
//     if (newPassword !== confirmPassword) {
//       setMessage({ type: 'error', text: "Passwords don't match!" });
//       return;
//     }

//     try {
//       setLoading(true);
//       await axios.post('http://localhost:5000/api/auth/reset-password', {
//         email,
//         otp,
//         newPassword,
//       });

//       setMessage({ type: 'success', text: 'Password reset successfully!' });
//       setTimeout(() => navigate('/login'), 2000);
//     } catch (error) {
//       setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to reset.' });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-background p-4">
//       <div className="w-full max-w-md bg-surface p-6 rounded-xl shadow-lg border border-border">
//         <h2 className="text-2xl font-semibold mb-6 text-center">Reset Password</h2>

//         <input
//           type="email"
//           value={email}
//           disabled
//           className="w-full px-3 py-2 mb-4 rounded border border-border bg-background text-text"
//         />

//         <input
//           type="password"
//           placeholder="New Password"
//           value={newPassword}
//           onChange={(e) => setNewPassword(e.target.value)}
//           className="w-full px-3 py-2 mb-4 rounded border border-border bg-background text-text placeholder:text-gray-500"
//         />

//         <input
//           type="password"
//           placeholder="Confirm New Password"
//           value={confirmPassword}
//           onChange={(e) => setConfirmPassword(e.target.value)}
//           className="w-full px-3 py-2 mb-6 rounded border border-border bg-background text-text placeholder:text-gray-500"
//         />

//         <button
//           onClick={handleResetPassword}
//           disabled={loading}
//           className="w-full bg-primary text-white py-2 px-4 rounded hover:opacity-90 transition"
//         >
//           {loading ? 'Resetting...' : 'Reset Password'}
//         </button>

//         {message.text && (
//           <div className={`mt-4 p-2 text-center text-sm rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
//             {message.text}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ResetPassword;





// import { useLocation, useNavigate } from 'react-router-dom';
// import { useEffect, useState } from 'react';
// import axios from 'axios';

// const ResetPassword = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { email, otp } = location.state || {};

//   const [newPass, setNewPass] = useState('');
//   const [confirmPass, setConfirmPass] = useState('');
//   const [message, setMessage] = useState({ type: '', text: '' });
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (!email || !otp) {
//       navigate('/forgot-password');
//     }
//   }, [email, otp]);

//   const handleSubmit = async () => {
//     if (newPass !== confirmPass) {
//       setMessage({ type: 'error', text: "Passwords don't match!" });
//       return;
//     }

//     setLoading(true);
//     try {
//       const res = await axios.post('http://localhost:5000/api/auth/reset-password', {
//         email,
//         code: otp,
//         newPassword: newPass,
//       });

//       setMessage({ type: 'success', text: res.data.message || 'Password reset successful!' });

//       setTimeout(() => {
//         navigate('/login');
//       }, 2500);
//     } catch (err) {
//       setMessage({
//         type: 'error',
//         text: err.response?.data?.message || 'Failed to reset password.',
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-background text-text p-4">
//       <div className="w-full max-w-md p-6 rounded-xl shadow-xl border border-[var(--color-border)] bg-[var(--color-card)]">
//         <h2 className="text-2xl font-semibold mb-4 text-center">Reset Password</h2>

//         <div className="space-y-4">
//           <input
//             type="email"
//             value={email}
//             disabled
//             className="w-full px-3 py-2 rounded border border-[var(--color-border)] bg-[var(--color-input)] text-[var(--color-text)]"
//           />

//           <input
//             type="password"
//             placeholder="New Password"
//             value={newPass}
//             onChange={(e) => setNewPass(e.target.value)}
//             className="w-full px-3 py-2 rounded border border-[var(--color-border)] bg-[var(--color-input)] text-[var(--color-text)] placeholder:text-[var(--color-placeholder)]"
//           />

//           <input
//             type="password"
//             placeholder="Confirm New Password"
//             value={confirmPass}
//             onChange={(e) => setConfirmPass(e.target.value)}
//             className="w-full px-3 py-2 rounded border border-[var(--color-border)] bg-[var(--color-input)] text-[var(--color-text)] placeholder:text-[var(--color-placeholder)]"
//           />

//           <button
//             onClick={handleSubmit}
//             disabled={!newPass || !confirmPass || loading}
//             className="w-full bg-[var(--color-primary)] text-[var(--color-button-text)] py-2 px-4 rounded hover:opacity-90 transition"
//           >
//             {loading ? 'Resetting...' : 'Reset Password'}
//           </button>

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

//           <div className="mt-4 text-sm text-center">
//             <p>
//               Remembered it?{' '}
//               <a href="/login" className="text-[var(--color-primary)] hover:underline">
//                 Login
//               </a>
//             </p>
//             <p>
//               Mistaken identity?{' '}
//               <a href="/signup" className="text-[var(--color-primary)] hover:underline">
//                 Signup
//               </a>
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ResetPassword;


// import { useState } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import axios from 'axios';

// const ResetPassword = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const email = location.state?.email || '';
//   const [form, setForm] = useState({ password: '', confirm: '' });
//   const [message, setMessage] = useState({ type: '', text: '' });
//   const [loading, setLoading] = useState(false);

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//     setMessage({ type: '', text: '' });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (form.password !== form.confirm) {
//       return setMessage({ type: 'error', text: 'Passwords do not match' });
//     }

//     try {
//       setLoading(true);
//       const res = await axios.post('http://localhost:5000/api/auth/reset-password', {
//         email,
//         password: form.password,
//       });

//       setMessage({
//         type: 'success',
//         text: 'Password reset successful! Redirecting to login...',
//       });

//       setTimeout(() => {
//         navigate('/login');
//       }, 3000);
//     } catch (err) {
//       setMessage({
//         type: 'error',
//         text: err.response?.data?.message || 'Password reset failed.',
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-background text-text p-4">
//       <div className="w-full max-w-md p-6 rounded-xl shadow-xl border border-[var(--color-border)] bg-[var(--color-card)]">
//         <h2 className="text-2xl font-semibold mb-4 text-center">Reset Password</h2>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium mb-1">Email</label>
//             <input
//               type="email"
//               value={email}
//               disabled
//               className="w-full px-3 py-2 rounded border border-[var(--color-border)] bg-[var(--color-input)] text-[var(--color-text)] opacity-80"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium mb-1">New Password</label>
//             <input
//               type="password"
//               name="password"
//               value={form.password}
//               onChange={handleChange}
//               required
//               className="w-full px-3 py-2 rounded border border-[var(--color-border)] bg-[var(--color-input)] text-[var(--color-text)]"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium mb-1">Confirm Password</label>
//             <input
//               type="password"
//               name="confirm"
//               value={form.confirm}
//               onChange={handleChange}
//               required
//               className="w-full px-3 py-2 rounded border border-[var(--color-border)] bg-[var(--color-input)] text-[var(--color-text)]"
//             />
//           </div>

//           <button
//             type="submit"
//             disabled={
//               loading || !form.password || form.password !== form.confirm
//             }
//             className="w-full bg-[var(--color-primary)] text-[var(--color-button-text)] py-2 px-4 rounded hover:opacity-90 transition"
//           >
//             {loading ? 'Resetting...' : 'Reset Password'}
//           </button>

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
//         </form>

//         <div className="mt-4 text-sm text-center text-[var(--color-text)]">
//           <p>
//             Oh, you remembered?{' '}
//             <a href="/login" className="text-[var(--color-primary)] hover:underline">
//               Login
//             </a>
//           </p>
//           <p>
//             New here?{' '}
//             <a href="/signup" className="text-[var(--color-primary)] hover:underline">
//               Signup
//             </a>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ResetPassword;



// import { useState } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import axios from 'axios';

// const ResetPassword = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const email = location.state?.email || ''; // From forgot password
//   const [otp, setOtp] = useState('');
//   const [verified, setVerified] = useState(false);

//   const [form, setForm] = useState({ password: '', confirm: '' });
//   const [message, setMessage] = useState({ type: '', text: '' });
//   const [loading, setLoading] = useState(false);

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//     setMessage({ type: '', text: '' });
//   };

//   const verifyOtp = async () => {
//     try {
//       setLoading(true);
//       const res = await axios.post('http://localhost:5000/api/auth/verify-otp', {
//         email,
//         code: otp,
//       });

//       setVerified(true);
//       setMessage({ type: 'success', text: 'OTP verified! You can now reset your password.' });
//     } catch (err) {
//       setMessage({
//         type: 'error',
//         text: err.response?.data?.message || 'OTP verification failed.',
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (form.password !== form.confirm) {
//       return setMessage({ type: 'error', text: 'Passwords do not match' });
//     }

//     try {
//       setLoading(true);
//       const res = await axios.post('http://localhost:5000/api/auth/reset-password', {
//         email,
//         password: form.password,
//       });

//       setMessage({
//         type: 'success',
//         text: 'Password updated! Redirecting to login...',
//       });

//       setTimeout(() => {
//         navigate('/login');
//       }, 3000);
//     } catch (err) {
//       setMessage({
//         type: 'error',
//         text: err.response?.data?.message || 'Reset failed',
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-background text-text p-4">
//       <div className="w-full max-w-md p-6 rounded-xl shadow-xl border border-[var(--color-border)] bg-[var(--color-card)]">
//         <h2 className="text-2xl font-semibold mb-4 text-center">Reset Password</h2>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium mb-1">Email</label>
//             <input
//               type="email"
//               value={email}
//               disabled
//               className="w-full px-3 py-2 rounded border border-[var(--color-border)] bg-[var(--color-input)] text-[var(--color-text)] opacity-60"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium mb-1">OTP</label>
//             <input
//               type="text"
//               value={otp}
//               onChange={(e) => setOtp(e.target.value)}
//               className="w-full px-3 py-2 rounded border border-[var(--color-border)] bg-[var(--color-input)] text-[var(--color-text)]"
//               disabled={verified}
//               required
//             />
//             {!verified && (
//               <button
//                 type="button"
//                 onClick={verifyOtp}
//                 className="mt-2 w-full bg-[var(--color-primary)] text-[var(--color-button-text)] py-2 px-4 rounded hover:opacity-90 transition"
//               >
//                 {loading ? 'Verifying...' : 'Verify OTP'}
//               </button>
//             )}
//           </div>

//           {verified && (
//             <>
//               <div>
//                 <label className="block text-sm font-medium mb-1">New Password</label>
//                 <input
//                   type="password"
//                   name="password"
//                   value={form.password}
//                   onChange={handleChange}
//                   required
//                   className="w-full px-3 py-2 rounded border border-[var(--color-border)] bg-[var(--color-input)] text-[var(--color-text)]"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium mb-1">Confirm Password</label>
//                 <input
//                   type="password"
//                   name="confirm"
//                   value={form.confirm}
//                   onChange={handleChange}
//                   required
//                   className="w-full px-3 py-2 rounded border border-[var(--color-border)] bg-[var(--color-input)] text-[var(--color-text)]"
//                 />
//               </div>

//               <button
//                 type="submit"
//                 disabled={
//                   loading || !form.password || form.password !== form.confirm
//                 }
//                 className="w-full bg-[var(--color-primary)] text-[var(--color-button-text)] py-2 px-4 rounded hover:opacity-90 transition"
//               >
//                 {loading ? 'Updating...' : 'Reset Password'}
//               </button>
//             </>
//           )}

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
//         </form>

//         <div className="mt-4 text-sm text-center text-[var(--color-text)]">
//           <p>
//             Remembered password?{' '}
//             <a href="/login" className="text-[var(--color-primary)] hover:underline">
//               Login
//             </a>
//           </p>
//           <p>
//             New here by mistake?{' '}
//             <a href="/signup" className="text-[var(--color-primary)] hover:underline">
//               Signup
//             </a>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ResetPassword;
