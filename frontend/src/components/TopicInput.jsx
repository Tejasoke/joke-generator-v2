import { Sparkles } from 'lucide-react'

export default function TopicInput({ value, onChange, onEnter, disabled }) {
  return (
    <div className="mb-6">
      <label
        htmlFor="topic-input"
        className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest
                   text-slate-400 mb-2"
      >
        <Sparkles className="w-3.5 h-3.5 text-orange-400" />
        <span>Enter a Topic</span>
      </label>

      <input
        id="topic-input"
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && !disabled && onEnter()}
        disabled={disabled}
        placeholder="e.g. coding, exams, office life, gym..."
        autoComplete="off"
        className="w-full bg-white/[0.04] border border-white/[0.08]
                   rounded-xl text-slate-100 placeholder-slate-600
                   px-4 py-3.5 text-base outline-none
                   transition-all duration-200
                   focus:bg-white/[0.08] focus:border-orange-500/60
                   focus:ring-2 focus:ring-orange-500/20
                   disabled:opacity-50 disabled:cursor-not-allowed"
      />
    </div>
  )
}
