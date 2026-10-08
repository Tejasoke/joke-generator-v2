import { Sparkles, Loader2 } from 'lucide-react'

export default function GenerateButton({ onClick, isLoading }) {
  return (
    <button
      id="generate-btn"
      type="button"
      onClick={onClick}
      disabled={isLoading}
      className="w-full py-4 rounded-xl font-display font-bold text-white text-base
                 bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-500
                 relative overflow-hidden cursor-pointer
                 transition-all duration-200
                 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-orange-500/40
                 active:translate-y-0
                 disabled:opacity-60 disabled:cursor-not-allowed
                 disabled:hover:translate-y-0 disabled:hover:shadow-none"
    >
      {/* Shine overlay on hover */}
      <span className="absolute inset-0 bg-gradient-to-r from-white/25
                       to-transparent opacity-0 hover:opacity-100
                       transition-opacity duration-200 pointer-events-none" />

      <span className="relative flex items-center justify-center gap-2">
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin text-white" />
            <span>Generating Joke...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 text-amber-100" />
            <span>Generate Joke</span>
          </>
        )}
      </span>
    </button>
  )
}
