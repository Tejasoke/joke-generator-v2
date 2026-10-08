import {
  SlidersHorizontal,
  Smile,
  Flame,
  Skull,
  MessageSquareCode,
  ShieldAlert,
  Target,
} from 'lucide-react'

const STYLES = [
  { key: 'Normal',    label: 'Normal',    Icon: Smile },
  { key: 'Roast',     label: 'Roast',     Icon: Flame },
  { key: 'Brutal',    label: 'Brutal',    Icon: Skull },
  { key: 'Sarcastic', label: 'Sarcastic', Icon: MessageSquareCode },
  { key: 'Adult',     label: 'Adult',     Icon: ShieldAlert },
  { key: 'Pun',       label: 'Pun',       Icon: Target },
]

export default function StylePicker({ selected, onChange, disabled }) {
  return (
    <div className="mb-6">
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest
                    text-slate-400 mb-2">
        <SlidersHorizontal className="w-3.5 h-3.5 text-orange-400" />
        <span>Joke Style</span>
      </p>

      <div className="flex flex-wrap gap-2.5" role="group" aria-label="Joke style">
        {STYLES.map(({ key, label, Icon }) => {
          const isSelected = selected === key
          return (
            <button
              key={key}
              type="button"
              onClick={() => !disabled && onChange(key)}
              disabled={disabled}
              aria-pressed={isSelected}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-sm font-medium
                          transition-all duration-200 cursor-pointer
                          disabled:opacity-50 disabled:cursor-not-allowed
                          ${isSelected
                            ? `border-orange-500 bg-orange-500/20 text-orange-200
                               shadow-lg shadow-orange-500/20`
                            : `border-white/[0.08] text-slate-400
                               hover:border-orange-400 hover:text-orange-300`
                          }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-orange-400' : 'text-slate-500'}`} />
              <span>{label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
