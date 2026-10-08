import { ShieldCheck, ShieldOff } from 'lucide-react'

export default function StrictToggle({ checked, onChange, disabled }) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between
                      bg-white/[0.04] border border-white/[0.08]
                      rounded-xl px-4 py-3.5">
        <div className="flex items-center gap-2">
          {checked ? (
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          ) : (
            <ShieldOff className="w-4 h-4 text-amber-400" />
          )}
          <span className="text-slate-300 text-sm font-medium">
            Strict Mode <span className="text-slate-500 font-normal">({checked ? 'Safe Content' : 'Unfiltered'})</span>
          </span>
        </div>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={checked}
            onChange={e => onChange(e.target.checked)}
            disabled={disabled}
            className="sr-only"
            aria-label="Strict mode"
          />
          {/* Track */}
          <div className={`w-11 h-6 rounded-full transition-colors duration-200
                           ${checked
                             ? 'bg-gradient-to-r from-orange-600 to-amber-500'
                             : 'bg-white/10'
                           }`}>
            {/* Thumb */}
            <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white
                             rounded-full shadow transition-transform duration-200
                             ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
          </div>
        </label>
      </div>
    </div>
  )
}
