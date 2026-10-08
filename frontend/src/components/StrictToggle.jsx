export default function StrictToggle({ checked, onChange, disabled }) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between
                      bg-zinc-900/50 border border-zinc-800
                      rounded-xl px-4 py-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-zinc-200 text-xs font-medium font-mono uppercase tracking-wide">
              Safe Content Filter
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-zinc-700/60 text-zinc-400">
              {checked ? 'Safe' : 'Unfiltered'}
            </span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-0.5">
            {checked ? 'Removes explicit sexual and offensive keywords' : 'Allows full uncensored model generation'}
          </p>
        </div>

        <label className="relative inline-flex items-center cursor-pointer ml-3 shrink-0">
          <input
            type="checkbox"
            checked={checked}
            onChange={e => onChange(e.target.checked)}
            disabled={disabled}
            className="sr-only"
            aria-label="Strict mode"
          />
          {/* Switch track */}
          <div className={`w-10 h-5.5 rounded-full transition-colors duration-200
                           ${checked ? 'bg-zinc-200' : 'bg-zinc-800'}`}>
            {/* Switch thumb */}
            <div className={`absolute top-0.5 left-0.5 w-4.5 h-4.5 rounded-full shadow-sm transition-transform duration-200
                             ${checked ? 'translate-x-4.5 bg-zinc-950' : 'translate-x-0 bg-zinc-400'}`} />
          </div>
        </label>
      </div>
    </div>
  )
}
