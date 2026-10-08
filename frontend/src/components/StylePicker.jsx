import {
  Smile,
  Flame,
  Skull,
  MessageSquare,
  Shield,
  Target,
} from 'lucide-react'

const STYLES = [
  { key: 'Normal',    label: 'Standard',  desc: 'General humor',       Icon: Smile },
  { key: 'Roast',     label: 'Roast',     desc: 'Direct roast',        Icon: Flame },
  { key: 'Brutal',    label: 'Dark',      desc: 'Cynical & dry',       Icon: Skull },
  { key: 'Sarcastic', label: 'Sarcasm',   desc: 'Deadpan humor',       Icon: MessageSquare },
  { key: 'Adult',     label: 'Uncensored',desc: '18+ humor',           Icon: Shield },
  { key: 'Pun',       label: 'Pun',       desc: 'Wordplay & wit',      Icon: Target },
]

export default function StylePicker({ selected, onChange, disabled }) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-medium text-zinc-300 tracking-wide uppercase font-mono">
          Tone &amp; Style
        </label>
        <span className="text-[11px] text-zinc-500 font-mono">
          {STYLES.find(s => s.key === selected)?.desc}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2" role="group" aria-label="Joke style">
        {STYLES.map(({ key, label, desc, Icon }) => {
          const isSelected = selected === key
          return (
            <button
              key={key}
              type="button"
              onClick={() => !disabled && onChange(key)}
              disabled={disabled}
              aria-pressed={isSelected}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left
                          transition-all duration-150 cursor-pointer
                          disabled:opacity-50 disabled:cursor-not-allowed
                          ${isSelected
                            ? 'border-zinc-300 bg-zinc-100 text-zinc-950 font-medium shadow-sm'
                            : 'border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200 hover:bg-zinc-800/40'
                          }`}
            >
              <Icon className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-zinc-900' : 'text-zinc-500'}`} />

              <div className="min-w-0">
                <span className="block text-xs leading-none truncate font-semibold">
                  {label}
                </span>
                <span className={`block text-[10px] leading-tight truncate mt-0.5 ${isSelected ? 'text-zinc-700' : 'text-zinc-500'}`}>
                  {desc}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
