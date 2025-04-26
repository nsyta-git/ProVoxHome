// src/components/ThemeToggleBubble.jsx

import { useTheme } from '../context/ThemeContext'
import { FaPaintBrush } from 'react-icons/fa'
import { BsSunFill, BsMoonStarsFill } from 'react-icons/bs'

export default function ThemeToggleBubble() {
  const { mode, toggleMode, cycleTheme } = useTheme()

  return (
    <div className="fixed bottom-4 right-4 flex flex-col items-center space-y-2 z-50">
      <button
        onClick={toggleMode}
        title="Toggle light/dark mode"
        className="bg-[var(--color-primary)] text-[var(--color-button-text)] p-3 rounded-full shadow hover:scale-110 transition"
      >
        {mode === 'light' ? (
          <BsMoonStarsFill className="text-lg" />
        ) : (
          <BsSunFill className="text-lg" />
        )}
      </button>

      <button
        onClick={cycleTheme}
        title="Switch theme"
        className="bg-[var(--color-accent)] text-[var(--color-button-text)] p-3 rounded-full shadow hover:scale-110 transition"
      >
        <FaPaintBrush className="text-lg" />
      </button>
    </div>
  )
}

