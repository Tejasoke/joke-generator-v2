import { CornerDownLeft } from 'lucide-react'

const SUGGESTIONS = [
  'Debugging',
  'Monday Standup',
  'Job Interviews',
  'First Dates',
  'Gym Life',
  'Coffee Addiction',
]

export default function TopicInput({ value, onChange, onEnter, disabled }) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <label
          htmlFor="topic-input"
          className="text-xs font-medium text-zinc-300 tracking-wide uppercase font-mono"
        >
          Topic
        </label>
        <span className="text-[11px] text-zinc-500 font-mono">Press ↵ to run</span>
      </div>

      <div className="relative">
        <input
          id="topic-input"
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !disabled && onEnter()}
          disabled={disabled}
          placeholder="e.g. software engineering, corporate meetings, gym..."
          autoComplete="off"
          className="w-full bg-zinc-900/60 border border-zinc-800
                     rounded-xl text-zinc-100 placeholder-zinc-600
                     px-4 py-3 text-sm outline-none
                     transition-all duration-200
                     focus:border-zinc-500 focus:bg-zinc-900
                     focus:ring-1 focus:ring-zinc-500
                     disabled:opacity-50 disabled:cursor-not-allowed"
        />

        {value.trim() && (
          <button
            type="button"
            onClick={onEnter}
            disabled={disabled}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1
                       px-2 py-1 rounded-md text-[11px] font-mono
                       bg-zinc-800 border border-zinc-700/60 text-zinc-300
                       hover:text-white hover:bg-zinc-700
                       transition-colors duration-150"
          >
            <span>Run</span>
            <CornerDownLeft className="w-2.5 h-2.5" />
          </button>
        )}
      </div>

      {/* Clean text pills without emojis */}
      <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
        <span className="text-[11px] text-zinc-500 font-mono mr-1">Suggestions:</span>
        {SUGGESTIONS.map(topic => (
          <button
            key={topic}
            type="button"
            disabled={disabled}
            onClick={() => onChange(topic)}
            className="text-xs px-2.5 py-1 rounded-lg bg-zinc-900/70 border border-zinc-800/80
                       text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 hover:bg-zinc-800/60
                       active:scale-[0.98] transition-all duration-150 cursor-pointer disabled:opacity-40"
          >
            {topic}
          </button>
        ))}
      </div>
    </div>
  )
}
