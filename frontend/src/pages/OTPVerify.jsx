// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';

// const OTPVerify = () => {
//   const navigate = useNavigate();
//   const [email, setEmail] = useState(localStorage.getItem('signupEmail') || '');
//   const [otp, setOtp] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState({ type: '', text: '' });

//   const handleVerify = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setMessage({ type: '', text: '' });

//     try {
//       const res = await axios.post(
//         'http://localhost:5000/api/auth/verify-email',
//         { email, otp },
//         { withCredentials: true }
//       );

//       setMessage({ type: 'success', text: res.data.message });
//       setTimeout(() => navigate('/login'), 1500);
//     } catch (err) {
//       setMessage({
//         type: 'error',
//         text: err.response?.data?.message || 'Verification failed'
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-bg-base text-text-base p-4">
//       <div className="w-full max-w-md p-6 rounded-xl shadow-xl border border-border-base bg-bg-card">
//         <h2 className="text-2xl font-semibold mb-4 text-center">Verify Email</h2>

//         <form onSubmit={handleVerify} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium mb-1">Email</label>
//             <input
//               type="email"
//               className="w-full px-3 py-2 rounded border border-border-base bg-bg-input text-text-base"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium mb-1">OTP</label>
//             <input
//               type="text"
//               className="w-full px-3 py-2 rounded border border-border-base bg-bg-input text-text-base"
//               value={otp}
//               onChange={(e) => setOtp(e.target.value)}
//               required
//             />
//           </div>

//           {message.text && (
//             <div
//               className={`text-sm p-2 rounded ${
//                 message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
//               }`}
//             >
//               {message.text}
//             </div>
//           )}

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full bg-primary text-white py-2 px-4 rounded hover:bg-primary-hover transition"
//           >
//             {loading ? 'Verifying...' : 'Verify'}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default OTPVerify;





// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';

// const OTPVerify = () => {
//   const navigate = useNavigate();
//   const [email, setEmail] = useState(localStorage.getItem('signupEmail') || '');
//   const [otp, setOtp] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState({ type: '', text: '' });
//   const [resendTimer, setResendTimer] = useState(45);

//   useEffect(() => {
//     if (resendTimer > 0) {
//       const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
//       return () => clearTimeout(timer);
//     }
//   }, [resendTimer]);

//   const handleVerify = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setMessage({ type: '', text: '' });

//     try {
//       const res = await axios.post(
//         'http://localhost:5000/api/auth/verify-email',
//         { email, otp },
//         { withCredentials: true }
//       );

//       setMessage({ type: 'success', text: res.data.message });
//       setTimeout(() => navigate('/login'), 1500);
//     } catch (err) {
//       setMessage({
//         type: 'error',
//         text: err.response?.data?.message || 'Verification failed'
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleResend = async () => {
//     try {
//       await axios.post('http://localhost:5000/api/auth/resend-otp', { email }, { withCredentials: true });
//       setMessage({ type: 'success', text: 'OTP resent to your email.' });
//       setResendTimer(45);
//     } catch (err) {
//       setMessage({
//         type: 'error',
//         text: err.response?.data?.message || 'Resend failed'
//       });
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-bg-base text-text-base p-4">
//       <div className="w-full max-w-md p-6 rounded-xl shadow-xl border border-border-base bg-bg-card">
//         <h2 className="text-2xl font-semibold mb-4 text-center">Verify Email</h2>

//         <form onSubmit={handleVerify} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium mb-1">Email</label>
//             <input
//               type="email"
//               className="w-full px-3 py-2 rounded border border-border-base bg-bg-input text-text-base"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium mb-1">OTP</label>
//             <input
//               type="text"
//               className="w-full px-3 py-2 rounded border border-border-base bg-bg-input text-text-base"
//               value={otp}
//               onChange={(e) => setOtp(e.target.value)}
//               required
//             />
//           </div>

//           {message.text && (
//             <div
//               className={`text-sm p-2 rounded ${
//                 message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
//               }`}
//             >
//               {message.text}
//             </div>
//           )}

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full bg-primary text-white py-2 px-4 rounded hover:bg-primary-hover transition"
//           >
//             {loading ? 'Verifying...' : 'Verify'}
//           </button>

//           <div className="text-sm text-center mt-3">
//             Didn’t get the code?{' '}
//             {resendTimer > 0 ? (
//               <span className="text-muted">Resend in {resendTimer}s</span>
//             ) : (
//               <button type="button" onClick={handleResend} className="text-primary hover:underline">
//                 Resend OTP
//               </button>
//             )}
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default OTPVerify;

// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';

// const OTPVerify = () => {
//   const navigate = useNavigate();
//   const [email, setEmail] = useState(localStorage.getItem('signupEmail') || '');
//   const [otp, setOtp] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [resendTimer, setResendTimer] = useState(45);
//   const [message, setMessage] = useState({ type: '', text: '' });

//   // Countdown timer for resend
//   useEffect(() => {
//     let timer;
//     if (resendTimer > 0) {
//       timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
//     }
//     return () => clearTimeout(timer);
//   }, [resendTimer]);

//   const handleVerify = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setMessage({ type: '', text: '' });

//     try {
//       const res = await axios.post(
//         'http://localhost:5000/api/auth/verify-email',
//         { email, otp },
//         { withCredentials: true }
//       );

//       setMessage({ type: 'success', text: res.data.message });
//       setTimeout(() => navigate('/login'), 1500);
//     } catch (err) {
//       setMessage({
//         type: 'error',
//         text: err.response?.data?.message || 'Verification failed'
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleResend = async () => {
//     try {
//       const res = await axios.post(
//         'http://localhost:5000/api/auth/resend-otp',
//         { email },
//         { withCredentials: true }
//       );
//       setMessage({ type: 'success', text: res.data.message });
//       setResendTimer(45); // Restart timer
//     } catch (err) {
//       setMessage({
//         type: 'error',
//         text: err.response?.data?.message || 'Could not resend OTP'
//       });
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-bg-base text-text-base p-4">
//       <div className="w-full max-w-md p-6 rounded-xl shadow-xl border border-border-base bg-bg-card">
//         <h2 className="text-2xl font-semibold mb-4 text-center">Verify Email</h2>

//         <form onSubmit={handleVerify} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium mb-1">Email</label>
//             <input
//               type="email"
//               className="w-full px-3 py-2 rounded border border-border-base bg-bg-input text-text-base"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium mb-1">OTP</label>
//             <input
//               type="text"
//               className="w-full px-3 py-2 rounded border border-border-base bg-bg-input text-text-base"
//               value={otp}
//               onChange={(e) => setOtp(e.target.value)}
//               required
//             />
//           </div>

//           {message.text && (
//             <div
//               className={`text-sm p-2 rounded ${
//                 message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
//               }`}
//             >
//               {message.text}
//             </div>
//           )}

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full bg-primary text-white py-2 px-4 rounded hover:bg-primary-hover transition"
//           >
//             {loading ? 'Verifying...' : 'Verify OTP'}
//           </button>
//         </form>

//         <div className="mt-4 text-center">
//           <button
//             onClick={handleResend}
//             disabled={resendTimer > 0}
//             className={`px-4 py-2 rounded text-sm font-medium ${
//               resendTimer > 0
//                 ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
//                 : 'bg-primary text-white hover:bg-primary-hover'
//             }`}
//           >
//             {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default OTPVerify;



// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';

// const OTPVerify = () => {
//   const navigate = useNavigate();
//   const [email, setEmail] = useState(localStorage.getItem('signupEmail') || '');
//   const [otp, setOtp] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [resendTimer, setResendTimer] = useState(45);
//   const [message, setMessage] = useState({ type: '', text: '' });

//   useEffect(() => {
//     let timer;
//     if (resendTimer > 0) {
//       timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
//     }
//     return () => clearTimeout(timer);
//   }, [resendTimer]);

//   const handleVerify = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setMessage({ type: '', text: '' });

//     try {
//       const res = await axios.post(
//         'http://localhost:5000/api/auth/verify-email',
//         { email, otp },
//         { withCredentials: true }
//       );

//       setMessage({ type: 'success', text: res.data.message });
//       setTimeout(() => navigate('/login'), 1500);
//     } catch (err) {
//       setMessage({
//         type: 'error',
//         text: err.response?.data?.message || 'Verification failed'
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleResend = async () => {
//     try {
//       const res = await axios.post(
//         'http://localhost:5000/api/auth/resend-otp',
//         { email },
//         { withCredentials: true }
//       );
//       setMessage({ type: 'success', text: res.data.message });
//       setResendTimer(45);
//     } catch (err) {
//       setMessage({
//         type: 'error',
//         text: err.response?.data?.message || 'Could not resend OTP'
//       });
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-background text-text p-4">
//       <div className="w-full max-w-md p-6 rounded-xl shadow-xl border border-[var(--color-border)] bg-[var(--color-card)]">
//         <h2 className="text-2xl font-semibold mb-4 text-center">Verify Email</h2>

//         <form onSubmit={handleVerify} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium mb-1">Email</label>
//             <input
//               type="email"
//               className="w-full px-3 py-2 rounded border border-[var(--color-border)] bg-[var(--color-input)] text-[var(--color-text)]"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium mb-1">OTP</label>
//             <input
//               type="text"
//               className="w-full px-3 py-2 rounded border border-[var(--color-border)] bg-[var(--color-input)] text-[var(--color-text)]"
//               value={otp}
//               onChange={(e) => setOtp(e.target.value)}
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
//             {loading ? 'Verifying...' : 'Verify OTP'}
//           </button>
//         </form>

//         <div className="mt-4 text-center">
//           <button
//             onClick={handleResend}
//             disabled={resendTimer > 0}
//             className={`w-full py-2 px-4 rounded text-sm font-medium transition ${
//               resendTimer > 0
//                 ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
//                 : 'bg-[var(--color-primary)] text-[var(--color-button-text)] hover:opacity-90'
//             }`}
//           >
//             {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default OTPVerify;











import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const OTPVerify = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState(localStorage.getItem('signupEmail') || '');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(45);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const res = await axios.post(
        'http://localhost:5000/api/auth/verify-email',
        { email, otp },
        { withCredentials: true }
      );

      setMessage({ type: 'success', text: res.data.message });
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Verification failed'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      const res = await axios.post(
        'http://localhost:5000/api/auth/resend-otp',
        { email, purpose: 'verifyEmail' },
        { withCredentials: true }
      );
      setMessage({ type: 'success', text: 'Resent OTP successfully. Please enter the new OTP below.' });
      setResendTimer(45);
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Could not resend OTP'
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-text p-4">
      <div className="w-full max-w-md p-6 rounded-xl shadow-xl border border-[var(--color-border)] bg-[var(--color-card)]">
        <h2 className="text-2xl font-semibold mb-4 text-center">Verify Email</h2>

        {message.text && (
          <div
            className={`text-sm p-2 mb-3 rounded text-center ${
              message.type === 'success'
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              className="w-full px-3 py-2 rounded border border-[var(--color-border)] bg-[var(--color-input)] text-[var(--color-text)]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">OTP</label>
            <input
              type="text"
              className="w-full px-3 py-2 rounded border border-[var(--color-border)] bg-[var(--color-input)] text-[var(--color-text)]"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[var(--color-primary)] text-[var(--color-button-text)] py-2 px-4 rounded hover:opacity-90 transition"
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={handleResend}
            disabled={resendTimer > 0}
            className={`w-full py-2 px-4 rounded text-sm font-medium transition ${
              resendTimer > 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-[var(--color-primary)] text-[var(--color-button-text)] hover:opacity-90'
            }`}
          >
            {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OTPVerify;










