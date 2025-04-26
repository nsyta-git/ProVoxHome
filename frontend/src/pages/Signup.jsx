// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';

// export default function Signup() {
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     password: '',
//   });
//   const [error, setError] = useState('');
//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');

//     try {
//       const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/signup`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(formData),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         throw new Error(data.message || 'Signup failed');
//       }

//       navigate('/verify-email', { state: { email: formData.email } });
//     } catch (err) {
//       setError(err.message);
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-background text-text p-4">
//       <form onSubmit={handleSubmit} className="w-full max-w-md bg-[var(--color-surface)] shadow-md rounded p-6 space-y-4">
//         <h2 className="text-2xl font-bold text-center text-primary">Create Account</h2>

//         <input
//           type="text"
//           name="name"
//           placeholder="Full Name"
//           value={formData.name}
//           onChange={handleChange}
//           required
//           className="w-full px-4 py-2 rounded bg-[var(--color-input-bg)] text-text border border-[var(--color-border)]"
//         />

//         <input
//           type="email"
//           name="email"
//           placeholder="Email Address"
//           value={formData.email}
//           onChange={handleChange}
//           required
//           className="w-full px-4 py-2 rounded bg-[var(--color-input-bg)] text-text border border-[var(--color-border)]"
//         />

//         <input
//           type="password"
//           name="password"
//           placeholder="Create Password"
//           value={formData.password}
//           onChange={handleChange}
//           required
//           className="w-full px-4 py-2 rounded bg-[var(--color-input-bg)] text-text border border-[var(--color-border)]"
//         />

//         {error && <p className="text-red-500 text-sm text-center">{error}</p>}

//         <button
//           type="submit"
//           className="w-full py-2 rounded bg-primary text-white hover:bg-secondary transition"
//         >
//           Sign Up
//         </button>

//         <p className="text-sm text-center text-secondary">
//           Already have an account? <a href="/login" className="underline text-accent">Log in</a>
//         </p>
//       </form>
//     </div>
//   );
// }

// ____________________________________________________________

// import { useState } from 'react';
// import { Link } from 'react-router-dom';
// import { FaEye, FaEyeSlash } from 'react-icons/fa';

// const Signup = () => {
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     password: '',
//     confirmPassword: ''
//   });

//   const [showPassword, setShowPassword] = useState(false);
//   const [error, setError] = useState('');

//   const handleChange = (e) => {
//     setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
//     setError('');
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     const { name, email, password, confirmPassword } = formData;

//     if (password !== confirmPassword) {
//       setError("Passwords do not match.");
//       return;
//     }

//     // TODO: Send formData to backend (use axios/fetch here)
//     console.log("Signup data:", { name, email, password });
//   };

//   return (
//     <div className="min-h-screen bg-background text-text flex items-center justify-center px-4 py-12 transition-colors duration-300">
//       <div className="w-full max-w-md bg-[var(--color-surface)] p-8 rounded-lg shadow-md">
//         <h2 className="text-2xl font-bold mb-6 text-center">Create your account</h2>
        
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="block mb-1" htmlFor="name">Name</label>
//             <input
//               type="text"
//               id="name"
//               name="name"
//               value={formData.name}
//               onChange={handleChange}
//               required
//               className="w-full px-3 py-2 rounded bg-[var(--color-input-bg)] text-[var(--color-text)] border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
//             />
//           </div>

//           <div>
//             <label className="block mb-1" htmlFor="email">Email</label>
//             <input
//               type="email"
//               id="email"
//               name="email"
//               value={formData.email}
//               onChange={handleChange}
//               required
//               className="w-full px-3 py-2 rounded bg-[var(--color-input-bg)] text-[var(--color-text)] border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
//             />
//           </div>

//           <div className="relative">
//             <label className="block mb-1" htmlFor="password">Password</label>
//             <input
//               type={showPassword ? 'text' : 'password'}
//               id="password"
//               name="password"
//               value={formData.password}
//               onChange={handleChange}
//               required
//               className="w-full px-3 py-2 rounded bg-[var(--color-input-bg)] text-[var(--color-text)] border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
//             />
//             <button
//               type="button"
//               className="absolute top-9 right-3 text-[var(--color-secondary)]"
//               onClick={() => setShowPassword(prev => !prev)}
//               tabIndex={-1}
//             >
//               {showPassword ? <FaEyeSlash /> : <FaEye />}
//             </button>
//           </div>

//           <div>
//             <label className="block mb-1" htmlFor="confirmPassword">Confirm Password</label>
//             <input
//               type="password"
//               id="confirmPassword"
//               name="confirmPassword"
//               value={formData.confirmPassword}
//               onChange={handleChange}
//               required
//               className="w-full px-3 py-2 rounded bg-[var(--color-input-bg)] text-[var(--color-text)] border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
//             />
//           </div>

//           {error && (
//             <p className="text-red-500 text-sm">{error}</p>
//           )}

//           <button
//             type="submit"
//             className="w-full py-2 rounded bg-[var(--color-primary)] text-[var(--color-button-text)] font-semibold hover:opacity-90 transition"
//           >
//             Sign Up
//           </button>
//         </form>

//         <p className="text-center text-sm mt-6">
//           Already have an account?{' '}
//           <Link to="/login" className="text-[var(--color-primary)] hover:underline">
//             Log In
//           </Link>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default Signup;

//________________________________________________________________________________________________________________________________
// import { useState } from 'react';
// import { postRequest } from '../utils/api';
// import { useNavigate } from 'react-router-dom';

// export default function Signup() {
//   const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
//   const [showPassword, setShowPassword] = useState(false);
//   const [error, setError] = useState('');
//   const navigate = useNavigate();

//   const handleChange = e => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//     setError('');
//   };

//   const handleSubmit = async e => {
//     e.preventDefault();

//     if (form.password !== form.confirmPassword) {
//       setError("Passwords don't match");
//       return;
//     }

//     try {
//       const result = await postRequest('/auth/signup', {
//         name: form.name,
//         email: form.email,
//         password: form.password
//       });
//       console.log('Signup success:', result);
//       localStorage.setItem('signupEmail', email);
//       navigate('/verify-otp');

//       //navigate('/verify'); // assuming you have a verify page
//     } catch (err) {
//       setError(err.message || 'Something went wrong');
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-background text-text">
//       <form onSubmit={handleSubmit} className="bg-[var(--color-card)] p-6 rounded shadow w-full max-w-md">
//         <h2 className="text-2xl font-bold mb-4 text-center">Sign Up</h2>

//         <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required className="input" />
//         <input name="email" placeholder="Email" type="email" value={form.email} onChange={handleChange} required className="input mt-4" />

//         <input name="password" placeholder="Password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={handleChange} required className="input mt-4" />
//         <input name="confirmPassword" placeholder="Confirm Password" type="password" value={form.confirmPassword} onChange={handleChange} required className="input mt-4" />

//         <label className="block text-sm mt-2">
//           <input type="checkbox" onChange={() => setShowPassword(!showPassword)} className="mr-2" />
//           Show Password
//         </label>

//         {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

//         <button type="submit" className="mt-4 w-full bg-[var(--color-primary)] text-[var(--color-button-text)] py-2 rounded">
//           Sign Up
//         </button>
//       </form>
//     </div>
//   );
// }



import { useState } from 'react';
import { postRequest } from '../utils/api';
import { useNavigate } from 'react-router-dom';

export default function Signup() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user', // default role
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleRoleToggle = () => {
    setForm(prev => ({
      ...prev,
      role: prev.role === 'user' ? 'creator' : 'user',
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    try {
      const result = await postRequest('/auth/signup', {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      });

      console.log('Signup success:', result);

      localStorage.setItem('signupEmail', form.email);
      navigate('/verify-otp');
    } catch (err) {
      setError(err.message || 'Something went wrong');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-text">
      <form onSubmit={handleSubmit} className="bg-[var(--color-card)] p-6 rounded shadow w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Sign Up</h2>

        <input name="name" placeholder="Name" value={form.name} onChange={handleChange} required className="input" />
        <input name="email" placeholder="Email" type="email" value={form.email} onChange={handleChange} required className="input mt-4" />

        <input name="password" placeholder="Password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={handleChange} required className="input mt-4" />
        <input name="confirmPassword" placeholder="Confirm Password" type="password" value={form.confirmPassword} onChange={handleChange} required className="input mt-4" />

        <label className="block text-sm mt-2">
          <input type="checkbox" onChange={() => setShowPassword(!showPassword)} className="mr-2" />
          Show Password
        </label>

        <div className="mt-4">
          <label className="text-sm font-medium mr-4">Signup as:</label>
          <button
            type="button"
            onClick={handleRoleToggle}
            className="px-3 py-1 bg-[var(--color-accent)] text-white rounded"
          >
            {form.role}
          </button>
        </div>

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

        <button type="submit" className="mt-4 w-full bg-[var(--color-primary)] text-[var(--color-button-text)] py-2 rounded">
          Sign Up
        </button>
      </form>
    </div>
  );
}


