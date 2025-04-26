
// frontend/src/pages/ForgotPassword.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(60);

  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    if (resendDisabled) {
      timer = setInterval(() => {
        setResendCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setResendDisabled(false);
            return 60;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendDisabled]);

  const sendOtp = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      setOtpSent(true);
      setMessage({ type: 'success', text: res.data.message || 'OTP sent to your email.' });
      setResendDisabled(true);
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to send OTP.',
      });
    }
  };

  const verifyOtp = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/verify-reset-otp', {
        email,
        otp,
      });

      setMessage({ type: 'success', text: 'OTP verified! Redirecting to reset password page...' });

      setTimeout(() => {
        navigate('/reset-password', {
          state: { email, otp },
        });
      }, 2500);
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'OTP verification failed.',
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-text p-4">
      <div className="w-full max-w-md p-6 rounded-xl shadow-xl border border-border bg-surface">
        <h2 className="text-2xl font-semibold mb-6 text-center">Forgot Password</h2>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Enter your registered email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded border border-border bg-background text-text placeholder:text-gray-500"
          />

          <button
            onClick={sendOtp}
            disabled={!email || resendDisabled}
            className="w-full bg-primary text-white font-semibold py-3 px-4 rounded hover:opacity-90 transition"
          >
            {resendDisabled ? `Resend OTP in ${resendCountdown}s` : 'Send OTP'}
          </button>

          {otpSent && (
            <>
              <input
                type="text"
                placeholder="Enter OTP received"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-3 rounded border border-border bg-background text-text placeholder:text-gray-500"
              />
              <button
                onClick={verifyOtp}
                disabled={!otp}
                className="w-full bg-accent text-white font-semibold py-3 px-4 rounded hover:opacity-90 transition"
              >
                Verify OTP
              </button>
              <p className="text-xs text-center mt-2 text-gray-500">You will be redirected shortly after verifying OTP.</p>
            </>
          )}

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
              Remembered your password?{' '}
              <a href="/login" className="text-primary hover:underline font-medium">
                Login
              </a>
            </p>
            <p>
              New user?{' '}
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

export default ForgotPassword;



// frontend/src/pages/ForgotPassword.jsx

// // frontend/src/pages/ForgotPassword.jsx
// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';

// const ForgotPassword = () => {
//   const [email, setEmail] = useState('');
//   const [otp, setOtp] = useState('');
//   const [otpSent, setOtpSent] = useState(false);
//   const [message, setMessage] = useState({ type: '', text: '' });
//   const [resendDisabled, setResendDisabled] = useState(false);
//   const [countdown, setCountdown] = useState(60);
//   const navigate = useNavigate();

//   useEffect(() => {
//     let timer;
//     if (resendDisabled) {
//       timer = setInterval(() => {
//         setCountdown((prev) => {
//           if (prev <= 1) {
//             clearInterval(timer);
//             setResendDisabled(false);
//             return 60;
//           }
//           return prev - 1;
//         });
//       }, 1000);
//     }
//     return () => clearInterval(timer);
//   }, [resendDisabled]);

//   const handleSendOtp = async () => {
//     try {
//       await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
//       setOtpSent(true);
//       setResendDisabled(true);
//       setMessage({ type: 'success', text: 'OTP sent successfully.' });
//     } catch (error) {
//       setMessage({ type: 'error', text: error.response?.data?.message || 'Error sending OTP.' });
//     }
//   };

//   const handleVerifyOtp = async () => {
//     try {
//       await axios.post('http://localhost:5000/api/auth/verify-reset-password-otp', {
//         email,
//         otp,
//       });
//       navigate('/reset-password', { state: { email, otp } });
//     } catch (error) {
//       setMessage({ type: 'error', text: error.response?.data?.message || 'Invalid OTP.' });
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-background text-text p-4">
//       <div className="w-full max-w-md p-6 rounded-xl shadow-xl border border-border bg-surface">
//         <h2 className="text-2xl font-semibold text-center mb-6">Forgot Password</h2>

//         <div className="space-y-4">
//           <input
//             type="email"
//             placeholder="Enter your email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             className="w-full px-3 py-2 rounded border border-border bg-background text-text placeholder:text-gray-500"
//           />
//           <button
//             onClick={handleSendOtp}
//             disabled={!email || resendDisabled}
//             className="w-full bg-primary text-white py-2 px-4 rounded hover:opacity-90 transition"
//           >
//             {resendDisabled ? `Resend in ${countdown}s` : 'Send OTP'}
//           </button>

//           {otpSent && (
//             <>
//               <input
//                 type="text"
//                 placeholder="Enter OTP"
//                 value={otp}
//                 onChange={(e) => setOtp(e.target.value)}
//                 className="w-full px-3 py-2 rounded border border-border bg-background text-text placeholder:text-gray-500"
//               />
//               <button
//                 onClick={handleVerifyOtp}
//                 disabled={!otp}
//                 className="w-full bg-accent text-white py-2 px-4 rounded hover:opacity-90 transition"
//               >
//                 Verify OTP
//               </button>
//             </>
//           )}

//           {message.text && (
//             <div className={`p-2 text-sm rounded ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
//               {message.text}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ForgotPassword;



// import { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';

// const ForgotPassword = () => {
//   const [email, setEmail] = useState('');
//   const [otp, setOtp] = useState('');
//   const [otpSent, setOtpSent] = useState(false);
//   const [message, setMessage] = useState({ type: '', text: '' });

//   const [resendDisabled, setResendDisabled] = useState(false);
//   const [resendCountdown, setResendCountdown] = useState(60);

//   const navigate = useNavigate();

//   // Countdown timer effect
//   useEffect(() => {
//     let timer;
//     if (resendDisabled) {
//       timer = setInterval(() => {
//         setResendCountdown((prev) => {
//           if (prev <= 1) {
//             clearInterval(timer);
//             setResendDisabled(false);
//             return 60;
//           }
//           return prev - 1;
//         });
//       }, 1000);
//     }
//     return () => clearInterval(timer);
//   }, [resendDisabled]);

//   const sendOtp = async () => {
//     try {
//       const res = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
//       setOtpSent(true);
//       setMessage({ type: 'success', text: res.data.message || 'OTP sent to your email.' });

//       setResendDisabled(true);
//     } catch (err) {
//       setMessage({
//         type: 'error',
//         text: err.response?.data?.message || 'Failed to send OTP.',
//       });
//     }
//   };

//   const verifyOtp = async () => {
//     try {
//       const res = await axios.post('http://localhost:5000/api/auth/verify-email-otp', {
//         email,
//         code: otp,
//       });

//       setMessage({ type: 'success', text: 'OTP verified! Redirecting to reset password...' });

//       setTimeout(() => {
//         navigate('/reset-password', {
//           state: { email, otp },
//         });
//       }, 2000);
//     } catch (err) {
//       setMessage({
//         type: 'error',
//         text: err.response?.data?.message || 'OTP verification failed.',
//       });
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-background text-text p-4">
//       <div className="w-full max-w-md p-6 rounded-xl shadow-xl border border-border bg-surface">
//         <h2 className="text-2xl font-semibold mb-4 text-center">Forgot Password</h2>

//         <div className="space-y-4">
//           <input
//             type="email"
//             placeholder="Enter your email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             className="w-full px-3 py-2 rounded border border-border bg-background text-text placeholder:text-gray-500"
//           />

//           <button
//             onClick={sendOtp}
//             disabled={!email || resendDisabled}
//             className="w-full bg-primary text-white py-2 px-4 rounded hover:opacity-90 transition"
//           >
//             {resendDisabled ? `Resend OTP in ${resendCountdown}s` : 'Send OTP'}
//           </button>

//           {otpSent && (
//             <>
//               <input
//                 type="text"
//                 placeholder="Enter OTP"
//                 value={otp}
//                 onChange={(e) => setOtp(e.target.value)}
//                 className="w-full px-3 py-2 rounded border border-border bg-background text-text placeholder:text-gray-500"
//               />
//               <button
//                 onClick={verifyOtp}
//                 disabled={!otp}
//                 className="w-full bg-accent text-white py-2 px-4 rounded hover:opacity-90 transition"
//               >
//                 Verify OTP
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

//           <div className="mt-4 text-sm text-center">
//             <p>
//               Remembered password?{' '}
//               <a href="/login" className="text-primary hover:underline">
//                 Login
//               </a>
//             </p>
//             <p>
//               New here?{' '}
//               <a href="/signup" className="text-primary hover:underline">
//                 Signup
//               </a>
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ForgotPassword;


// import { useState } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';

// const ForgotPassword = () => {
//   const [email, setEmail] = useState('');
//   const [otp, setOtp] = useState('');
//   const [otpSent, setOtpSent] = useState(false);
//   const [message, setMessage] = useState({ type: '', text: '' });
//   const [resendDisabled, setResendDisabled] = useState(false);
//   const navigate = useNavigate();

//   const sendOtp = async () => {
//     try {
//       const res = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
//       setOtpSent(true);
//       setMessage({ type: 'success', text: res.data.message || 'OTP sent to your email.' });

//       setResendDisabled(true);
//       setTimeout(() => setResendDisabled(false), 60000); // Enable resend after 60s
//     } catch (err) {
//       setMessage({
//         type: 'error',
//         text: err.response?.data?.message || 'Failed to send OTP.',
//       });
//     }
//   };

//   const verifyOtp = async () => {
//     try {
//       const res = await axios.post('http://localhost:5000/api/auth/verify-otp', {
//         email,
//         code: otp,
//       });

//       setMessage({ type: 'success', text: 'OTP verified! Redirecting to reset page...' });

//       // Delay and then navigate to reset page with email and otp in state
//       setTimeout(() => {
//         navigate('/reset-password', {
//           state: { email, otp }, // 🟢 important: pass otp and email here
//         });
//       }, 2000);
//     } catch (err) {
//       setMessage({
//         type: 'error',
//         text: err.response?.data?.message || 'OTP verification failed.',
//       });
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-background text-text p-4">
//       <div className="w-full max-w-md p-6 rounded-xl shadow-xl border border-[var(--color-border)] bg-[var(--color-card)]">
//         <h2 className="text-2xl font-semibold mb-4 text-center">Forgot Password</h2>

//         <div className="space-y-4">
//           <input
//             type="email"
//             placeholder="Enter your email"
//             value={email}
//             onChange={(e) => setEmail(e.target.value)}
//             className="w-full px-3 py-2 rounded border border-[var(--color-border)] bg-[var(--color-input)] text-[var(--color-text)] placeholder:text-[var(--color-placeholder)]"
//           />

//           <button
//             onClick={sendOtp}
//             disabled={!email || resendDisabled}
//             className="w-full bg-[var(--color-primary)] text-[var(--color-button-text)] py-2 px-4 rounded hover:opacity-90 transition"
//           >
//             {resendDisabled ? 'Wait 60s to Resend OTP' : 'Send OTP'}
//           </button>

//           {otpSent && (
//             <>
//               <input
//                 type="text"
//                 placeholder="Enter OTP"
//                 value={otp}
//                 onChange={(e) => setOtp(e.target.value)}
//                 className="w-full px-3 py-2 rounded border border-[var(--color-border)] bg-[var(--color-input)] text-[var(--color-text)] placeholder:text-[var(--color-placeholder)]"
//               />
//               <button
//                 onClick={verifyOtp}
//                 disabled={!otp}
//                 className="w-full bg-[var(--color-accent)] text-[var(--color-button-text)] py-2 px-4 rounded hover:opacity-90 transition"
//               >
//                 Verify OTP
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

//           <div className="mt-4 text-sm text-center">
//             <p>
//               Remembered password?{' '}
//               <a href="/login" className="text-[var(--color-primary)] hover:underline">
//                 Login
//               </a>
//             </p>
//             <p>
//               Not registered?{' '}
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

// export default ForgotPassword;




// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';

// const ForgotPassword = () => {
//   const navigate = useNavigate();
//   const [email, setEmail] = useState('');
//   const [otp, setOtp] = useState('');
//   const [step, setStep] = useState('email'); // or 'otp'
//   const [message, setMessage] = useState({ type: '', text: '' });
//   const [timer, setTimer] = useState(0);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (timer > 0) {
//       const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
//       return () => clearInterval(interval);
//     }
//   }, [timer]);

//   const sendOrVerifyOtp = async () => {
//     setLoading(true);
//     try {
//       const payload = step === 'email' ? { email } : { email, code: otp };
//       const res = await axios.post('http://localhost:5000/api/auth/forgot-password', payload);

//       if (step === 'email') {
//         setStep('otp');
//         setTimer(60);
//         setMessage({ type: 'success', text: res.data.message || 'OTP sent!' });
//       } else {
//         setMessage({ type: 'success', text: 'OTP verified! Redirecting...' });
//         setTimeout(() => {
//           navigate('/reset-password', { state: { email } });
//         }, 2500);
//       }
//     } catch (err) {
//       setMessage({
//         type: 'error',
//         text: err.response?.data?.message || 'Something went wrong.',
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-background text-text p-4">
//       <div className="w-full max-w-md p-6 rounded-xl shadow-xl border border-[var(--color-border)] bg-[var(--color-card)]">
//         <h2 className="text-2xl font-semibold mb-4 text-center">Forgot Password</h2>

//         <div className="space-y-4">
//           {step === 'email' && (
//             <>
//               <input
//                 type="email"
//                 placeholder="Enter your email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className="w-full px-3 py-2 rounded border border-[var(--color-border)] bg-[var(--color-input)] text-[var(--color-text)]"
//               />
//               <button
//                 onClick={sendOrVerifyOtp}
//                 disabled={!email || loading}
//                 className="w-full bg-[var(--color-primary)] text-[var(--color-button-text)] py-2 px-4 rounded hover:opacity-90 transition"
//               >
//                 {loading ? 'Sending...' : 'Send OTP'}
//               </button>
//             </>
//           )}

//           {step === 'otp' && (
//             <>
//               <input
//                 type="text"
//                 placeholder="Enter OTP"
//                 value={otp}
//                 onChange={(e) => setOtp(e.target.value)}
//                 className="w-full px-3 py-2 rounded border border-[var(--color-border)] bg-[var(--color-input)] text-[var(--color-text)] placeholder:text-[var(--color-placeholder)]"
//               />
//               <button
//                 onClick={sendOrVerifyOtp}
//                 disabled={!otp || loading}
//                 className="w-full bg-[var(--color-primary)] text-[var(--color-button-text)] py-2 px-4 rounded hover:opacity-90 transition"
//               >
//                 {loading ? 'Verifying...' : 'Verify OTP'}
//               </button>

//               <button
//                 onClick={() => sendOrVerifyOtp()}
//                 disabled={timer > 0}
//                 className="w-full mt-2 text-sm underline text-[var(--color-primary)]"
//               >
//                 {timer > 0 ? `Resend OTP in ${timer}s` : 'Resend OTP'}
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

//           <div className="mt-4 text-sm text-center">
//             <p>
//               Remember your password?{' '}
//               <a href="/login" className="text-[var(--color-primary)] hover:underline">
//                 Login
//               </a>
//             </p>
//             <p>
//               New here?{' '}
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

// export default ForgotPassword;


// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';

// const ForgotPassword = () => {
//   const navigate = useNavigate();
//   const [email, setEmail] = useState('');
//   const [otp, setOtp] = useState('');
//   const [step, setStep] = useState('email'); // or 'otp'
//   const [message, setMessage] = useState({ type: '', text: '' });
//   const [timer, setTimer] = useState(0);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (timer > 0) {
//       const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
//       return () => clearInterval(interval);
//     }
//   }, [timer]);

//   const sendOrVerifyOtp = async () => {
//     setLoading(true);
//     try {
//       const payload = step === 'email' ? { email } : { email, code: otp };
//       const res = await axios.post('http://localhost:5000/api/auth/forgot-password', payload);

//       if (step === 'email') {
//         setStep('otp');
//         setTimer(60);
//         setMessage({ type: 'success', text: res.data.message || 'OTP sent!' });
//       } else {
//         setMessage({ type: 'success', text: 'OTP verified! Redirecting...' });
//         setTimeout(() => {
//           navigate('/reset-password', { state: { email } });
//         }, 2500);
//       }
//     } catch (err) {
//       setMessage({
//         type: 'error',
//         text: err.response?.data?.message || 'Something went wrong.',
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-background text-text p-4">
//       <div className="w-full max-w-md p-6 rounded-xl shadow-xl border border-[var(--color-border)] bg-[var(--color-card)]">
//         <h2 className="text-2xl font-semibold mb-4 text-center">Forgot Password</h2>

//         <div className="space-y-4">
//           {step === 'email' && (
//             <>
//               <input
//                 type="email"
//                 placeholder="Enter your email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className="w-full px-3 py-2 rounded border border-[var(--color-border)] bg-[var(--color-input)] text-[var(--color-text)]"
//               />
//               <button
//                 onClick={sendOrVerifyOtp}
//                 disabled={!email || loading}
//                 className="w-full bg-[var(--color-primary)] text-[var(--color-button-text)] py-2 px-4 rounded hover:opacity-90 transition"
//               >
//                 {loading ? 'Sending...' : 'Send OTP'}
//               </button>
//             </>
//           )}

//           {step === 'otp' && (
//             <>
//               <input
//                 type="text"
//                 placeholder="Enter OTP"
//                 value={otp}
//                 onChange={(e) => setOtp(e.target.value)}
//                 className="w-full px-3 py-2 rounded border border-[var(--color-border)] bg-[var(--color-input)] text-[var(--color-text)] placeholder:text-[var(--color-placeholder)]"
//               />
//               <button
//                 onClick={sendOrVerifyOtp}
//                 disabled={!otp || loading}
//                 className="w-full bg-[var(--color-primary)] text-[var(--color-button-text)] py-2 px-4 rounded hover:opacity-90 transition"
//               >
//                 {loading ? 'Verifying...' : 'Verify OTP'}
//               </button>

//               <button
//                 onClick={() => sendOrVerifyOtp()}
//                 disabled={timer > 0}
//                 className="w-full mt-2 text-sm underline text-[var(--color-primary)]"
//               >
//                 {timer > 0 ? `Resend OTP in ${timer}s` : 'Resend OTP'}
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

//           <div className="mt-4 text-sm text-center">
//             <p>
//               Remember your password?{' '}
//               <a href="/login" className="text-[var(--color-primary)] hover:underline">
//                 Login
//               </a>
//             </p>
//             <p>
//               New here?{' '}
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

// export default ForgotPassword;




// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';

// const ForgotPassword = () => {
//   const navigate = useNavigate();
//   const [email, setEmail] = useState('');
//   const [otp, setOtp] = useState('');
//   const [step, setStep] = useState('email'); // 'email' or 'otp'
//   const [message, setMessage] = useState({ type: '', text: '' });
//   const [timer, setTimer] = useState(0);
//   const [loading, setLoading] = useState(false);

//   const sendOtp = async () => {
//     setLoading(true);
//     try {
//       const res = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
//       setMessage({ type: 'success', text: res.data.message || 'OTP sent successfully!' });
//       setStep('otp');
//       setTimer(60);
//     } catch (err) {
//       setMessage({
//         type: 'error',
//         text: err.response?.data?.message || 'Failed to send OTP.',
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const verifyOtp = async () => {
//     setLoading(true);
//     try {
//       const res = await axios.post('http://localhost:5000/api/auth/verify-otp', {
//         email,
//         code: otp,
//       });

//       setMessage({
//         type: 'success',
//         text: 'OTP Verified! Redirecting to reset password...',
//       });

//       setTimeout(() => {
//         navigate('/reset-password', { state: { email } });
//       }, 2500);
//     } catch (err) {
//       setMessage({
//         type: 'error',
//         text: err.response?.data?.message || 'OTP verification failed.',
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (timer > 0) {
//       const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
//       return () => clearInterval(interval);
//     }
//   }, [timer]);

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-background text-text p-4">
//       <div className="w-full max-w-md p-6 rounded-xl shadow-xl border border-[var(--color-border)] bg-[var(--color-card)]">
//         <h2 className="text-2xl font-semibold mb-4 text-center">Forgot Password</h2>

//         <div className="space-y-4">
//           {step === 'email' && (
//             <>
//               <input
//                 type="email"
//                 placeholder="Enter your registered email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//                 className="w-full px-3 py-2 rounded border border-[var(--color-border)] bg-[var(--color-input)] text-[var(--color-text)]"
//               />
//               <button
//                 onClick={sendOtp}
//                 disabled={!email || loading}
//                 className="w-full bg-[var(--color-primary)] text-[var(--color-button-text)] py-2 px-4 rounded hover:opacity-90 transition"
//               >
//                 {loading ? 'Sending OTP...' : 'Send OTP'}
//               </button>
//             </>
//           )}

//           {step === 'otp' && (
//             <>
//               <input
//                 type="text"
//                 placeholder="Enter OTP"
//                 value={otp}
//                 onChange={(e) => setOtp(e.target.value)}
//                 required
//                 className="w-full px-3 py-2 rounded border border-[var(--color-border)] bg-[var(--color-input)] text-[var(--color-text)]"
//               />
//               <button
//                 onClick={verifyOtp}
//                 disabled={!otp || loading}
//                 className="w-full bg-[var(--color-primary)] text-[var(--color-button-text)] py-2 px-4 rounded hover:opacity-90 transition"
//               >
//                 {loading ? 'Verifying...' : 'Verify OTP'}
//               </button>
//               <button
//                 disabled={timer > 0}
//                 onClick={sendOtp}
//                 className="w-full mt-2 text-sm underline text-[var(--color-primary)]"
//               >
//                 {timer > 0 ? `Resend OTP in ${timer}s` : 'Resend OTP'}
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

//           <div className="mt-4 text-sm text-center">
//             <p>
//               Remembered your password?{' '}
//               <a href="/login" className="text-[var(--color-primary)] hover:underline">
//                 Login
//               </a>
//             </p>
//             <p>
//               New here?{' '}
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

// export default ForgotPassword;





// import { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';

// const ForgotPassword = () => {
//   const navigate = useNavigate();
//   const [email, setEmail] = useState('');
//   const [message, setMessage] = useState({ type: '', text: '' });
//   const [loading, setLoading] = useState(false);
//   const [timer, setTimer] = useState(0);

//   useEffect(() => {
//     let countdown;
//     if (timer > 0) {
//       countdown = setTimeout(() => setTimer((prev) => prev - 1), 1000);
//     }
//     return () => clearTimeout(countdown);
//   }, [timer]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setMessage({ type: '', text: '' });

//     try {
//       const res = await axios.post(
//         'http://localhost:5000/api/auth/forgot-password',
//         { email }
//       );

//       setMessage({
//         type: 'success',
//         text: 'OTP sent! We’ll take you to the reset page shortly…'
//       });

//       setTimer(60); // Start 60s timer for "Reset OTP"
//       setTimeout(() => {
//         navigate('/reset-password');
//       }, 3500);
//     } catch (err) {
//       setMessage({
//         type: 'error',
//         text: err.response?.data?.message || 'Something went wrong'
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-background text-text p-4">
//       <div className="w-full max-w-md p-6 rounded-xl shadow-xl border border-[var(--color-border)] bg-[var(--color-card)]">
//         <h2 className="text-2xl font-semibold mb-4 text-center">Forgot Password</h2>

//         <form onSubmit={handleSubmit} className="space-y-4">
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
//             {loading ? 'Sending OTP...' : 'Send Reset OTP'}
//           </button>

//           <button
//             type="button"
//             disabled={timer > 0}
//             onClick={handleSubmit}
//             className={`w-full mt-2 border text-[var(--color-primary)] border-[var(--color-primary)] py-2 px-4 rounded transition ${
//               timer > 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[var(--color-primary-muted)]'
//             }`}
//           >
//             {timer > 0 ? `Reset OTP in ${timer}s` : 'Resend OTP'}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default ForgotPassword;


// import { useState } from 'react';
// import axios from 'axios';

// const ForgotPassword = () => {
//   const [email, setEmail] = useState('');
//   const [message, setMessage] = useState({ type: '', text: '' });
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setMessage({ type: '', text: '' });
//     setLoading(true);

//     try {
//       const res = await axios.post(
//         'http://localhost:5000/api/auth/forgot-password',
//         { email }
//       );
//       setMessage({ type: 'success', text: res.data.message || 'OTP sent to email' });
//     } catch (err) {
//       setMessage({
//         type: 'error',
//         text: err.response?.data?.message || 'Failed to send OTP'
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-background text-text p-4">
//       <div className="w-full max-w-md p-6 rounded-xl shadow-xl border border-[var(--color-border)] bg-[var(--color-card)]">
//         <h2 className="text-2xl font-semibold mb-4 text-center">Forgot Password</h2>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium mb-1">Email Address</label>
//             <input
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//               className="w-full px-3 py-2 rounded border border-[var(--color-border)] bg-[var(--color-input)] text-[var(--color-text)]"
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
//             {loading ? 'Sending...' : 'Send Reset OTP'}
//           </button>
//         </form>

//         <div className="mt-4 text-sm text-center">
//           <a href="/login" className="text-[var(--color-primary)] hover:underline">
//             Back to login
//           </a>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ForgotPassword;
