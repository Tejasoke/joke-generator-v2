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
  { key: 'Normal',    label: 'Normal',    desc: 'Everyday humor',    Icon: Smile,              accent: 'from-amber-500 to-orange-500' },
  { key: 'Roast',     label: 'Roast',     desc: 'Spicy burn',        Icon: Flame,              accent: 'from-orange-500 to-red-600' },
  { key: 'Brutal',    label: 'Brutal',    desc: 'Zero chill',        Icon: Skull,              accent: 'from-red-600 to-purple-600' },
  { key: 'Sarcastic', label: 'Sarcastic', desc: 'Passive-aggressive',Icon: MessageSquareCode,  accent: 'from-purple-500 to-indigo-600' },
  { key: 'Adult',     label: 'Adult',     desc: '18+ Uncensored',    Icon: ShieldAlert,        accent: 'from-pink-500 to-rose-600' },
  { key: 'Pun',       label: 'Pun',       desc: 'Play on words',     Icon: Target,             accent: 'from-teal-400 to-emerald-500' },
]

export default function StylePicker({ selected, onChange, disabled }) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2.5">
        <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider
                      text-slate-400">
          <SlidersHorizontal className="w-3.5 h-3.5 text-orange-400" />
          <span>Joke Style</span>
        </p>
        <span className="text-[11px] font-semibold text-orange-400/90 uppercase tracking-wider">
          {STYLES.find(s => s.key === selected)?.desc}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5" role="group" aria-label="Joke style">
        {STYLES.map(({ key, label, desc, Icon, accent }) => {
          const isSelected = selected === key
          return (
            <button
              key={key}
              type="button"
              onClick={() => !disabled && onChange(key)}
              disabled={disabled}
              aria-pressed={isSelected}
              className={`relative overflow-hidden flex items-center gap-2.5 px-3.5 py-3 rounded-2xl border text-left
                          transition-all duration-200 cursor-pointer group
                          disabled:opacity-50 disabled:cursor-not-allowed
                          ${isSelected
                            ? `border-white/20 bg-white/[0.08] shadow-lg shadow-black/40 ring-2 ring-orange-500/40`
                            : `border-white/[0.06] bg-white/[0.02] text-slate-400
                               hover:border-white/15 hover:bg-white/[0.05] hover:text-slate-200`
                          }`}
            >
              {/* Highlight gradient band if selected */}
              {isSelected && (
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${accent}`} />
              )}

              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110
                              ${isSelected 
                                ? `bg-gradient-to-br ${accent} text-white shadow-md` 
                                : 'bg-white/[0.04] text-slate-400 border border-white/[0.06]'}`}>
                <Icon className="w-4 h-4" />
              </div>

              <div className="min-w-0">
                <span className={`block text-xs font-bold tracking-tight truncate ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                  {label}
                </span>
                <span className="block text-[10px] text-slate-500 truncate">
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
