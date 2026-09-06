import { Computer, Moon, Sun } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

const options = [
  { value: 'system', label: 'System', icon: Computer },
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
]

export default function ThemeSwitcher() {
  const { mode, setMode } = useTheme()

  return (
    <div className="theme-switcher" aria-label="Color theme">
      {options.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          className={mode === value ? 'theme-option active' : 'theme-option'}
          onClick={() => setMode(value)}
          aria-label={`${label} theme`}
          aria-pressed={mode === value}
          title={`${label} theme`}
        >
          <Icon size={15} aria-hidden="true" />
          <span>{label}</span>
        </button>
      ))}
    </div>
  )
}
