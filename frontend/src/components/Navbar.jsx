// import { Link } from 'react-router-dom';

// function Navbar() {
//   return (
//     <nav className="bg-gray-800 text-white px-6 py-4 flex justify-between">
//       <div className="text-xl font-bold">ProVoxHome</div>
//       <div className="space-x-4">
//         <Link to="/" className="hover:underline">Home</Link>
//         <Link to="/login" className="hover:underline">Login</Link>
//         <Link to="/signup" className="hover:underline">Signup</Link>
//       </div>
//     </nav>
//   );
// }

// export default Navbar;


import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaBars, FaTimes } from 'react-icons/fa'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="w-full bg-background text-text shadow-md fixed top-0 left-0 z-50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Logo + Name */}
        <Link to="/" className="flex items-center gap-2 text-primary font-bold text-xl">
          <img
            src="https://img.icons8.com/ios-filled/50/000000/home.png"
            alt="Logo"
            className="w-6 h-6"
          />
          ProVoxHome
        </Link>

        {/* Desktop Links */}
        <ul className="hidden md:flex space-x-6 font-medium">
          <li><Link to="/" className="hover:text-primary transition">Home</Link></li>
          <li><Link to="/login" className="hover:text-primary transition">Login</Link></li>
          <li><Link to="/signup" className="hover:text-primary transition">Signup</Link></li>
        </ul>

        {/* Hamburger */}
        <button
          className="md:hidden text-primary focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <FaTimes size={22} /> : <FaBars size={22} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`md:hidden bg-background border-t border-primary px-4 pb-4 transition-all duration-300 ease-in-out ${
          menuOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        <ul className="flex flex-col gap-4 pt-4 font-medium">
          <li><Link to="/" onClick={() => setMenuOpen(false)}>Home</Link></li>
          <li><Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link></li>
          <li><Link to="/signup" onClick={() => setMenuOpen(false)}>Signup</Link></li>
        </ul>
      </div>
    </header>
  )
}
