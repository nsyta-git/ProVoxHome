import { Link, Outlet } from "react-router-dom"

export default function Layout() {
  return (
    <div>
      <nav className="bg-gray-800 text-white p-4 flex gap-4">
        <Link to="/" className="hover:text-yellow-300">Home</Link>
        <Link to="/login" className="hover:text-yellow-300">Login</Link>
        <Link to="/signup" className="hover:text-yellow-300">Signup</Link>
      </nav>

      <main className="p-6">
        <Outlet />
      </main>
    </div>
  )
}
