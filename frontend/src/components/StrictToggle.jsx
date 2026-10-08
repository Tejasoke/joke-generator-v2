import { ShieldCheck, ShieldAlert } from 'lucide-react'

export default function StrictToggle({ checked, onChange, disabled }) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between
                      bg-white/[0.03] border border-white/[0.08]
                      rounded-2xl px-4 py-3.5 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors
                          ${checked ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400' : 'bg-rose-500/15 border border-rose-500/30 text-rose-400'}`}>
            {checked ? (
              <ShieldCheck className="w-4 h-4" />
            ) : (
              <ShieldAlert className="w-4 h-4" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-slate-200 text-sm font-semibold">Strict Filter</span>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border
                               ${checked 
                                 ? 'bg-emerald-500/10 border-emerald-500/25 text-emerald-300' 
                                 : 'bg-rose-500/10 border-rose-500/25 text-rose-300'}`}>
                {checked ? 'Family Friendly' : 'Unfiltered (18+)'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {checked ? 'Blocks explicit adult language and topics' : 'Full uncensored output allowed'}
            </p>
          </div>
        </div>

        <label className="relative inline-flex items-center cursor-pointer ml-3">
          <input
            type="checkbox"
            checked={checked}
            onChange={e => onChange(e.target.checked)}
            disabled={disabled}
            className="sr-only"
            aria-label="Strict mode"
          />
          {/* Track */}
          <div className={`w-12 h-6 rounded-full transition-colors duration-300
                           ${checked
                             ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                             : 'bg-white/10'
                           }`}>
            {/* Thumb */}
            <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white
                             rounded-full shadow-md transition-transform duration-300
                             ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
          </div>
        </label>
      </div>
    </div>
  )
}
