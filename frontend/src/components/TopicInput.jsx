import { Sparkles, CornerDownLeft } from 'lucide-react'

const QUICK_TOPICS = [
  '💻 Debugging',
  '☕ Monday Mornings',
  '🏋️ Gym Bro',
  '🍕 Late Night Pizza',
  '🤖 AI Taking Over',
  '💔 First Dates',
]

export default function TopicInput({ value, onChange, onEnter, disabled }) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <label
          htmlFor="topic-input"
          className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider
                     text-slate-400"
        >
          <Sparkles className="w-3.5 h-3.5 text-orange-400" />
          <span>Enter a Topic</span>
        </label>
        <span className="text-[11px] text-slate-500 font-medium">Be as specific as you like</span>
      </div>

      <div className="relative">
        <input
          id="topic-input"
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !disabled && onEnter()}
          disabled={disabled}
          placeholder="e.g. coding, exams, office meetings, coffee..."
          autoComplete="off"
          className="w-full bg-white/[0.04] border border-white/[0.09]
                     rounded-2xl text-slate-100 placeholder-slate-500
                     pl-4 pr-14 py-4 text-base outline-none
                     transition-all duration-300
                     focus:bg-white/[0.07] focus:border-orange-500/80
                     focus:ring-4 focus:ring-orange-500/15
                     disabled:opacity-50 disabled:cursor-not-allowed shadow-inner"
        />

        {/* Enter key badge */}
        <button
          type="button"
          onClick={onEnter}
          disabled={disabled || !value.trim()}
          title="Press Enter to generate"
          className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1
                     px-2.5 py-1.5 rounded-lg text-xs font-medium
                     bg-white/[0.06] border border-white/[0.1] text-slate-400
                     hover:text-white hover:bg-orange-500/20 hover:border-orange-500/40
                     transition-all duration-150 disabled:opacity-30 disabled:pointer-events-none"
        >
          <span>Enter</span>
          <CornerDownLeft className="w-3 h-3" />
        </button>
      </div>

      {/* Quick topic suggestion pills */}
      <div className="mt-3 flex items-center gap-1.5 flex-wrap">
        <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mr-1">
          Try:
        </span>
        {QUICK_TOPICS.map(topic => (
          <button
            key={topic}
            type="button"
            disabled={disabled}
            onClick={() => onChange(topic.replace(/^[^\s]+\s/, ''))}
            className="text-xs px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.07]
                       text-slate-400 hover:text-orange-300 hover:border-orange-500/40 hover:bg-orange-500/10
                       active:scale-95 transition-all duration-150 cursor-pointer disabled:opacity-40"
          >
            {topic}
          </button>
        ))}
      </div>
    </div>
  )
}
