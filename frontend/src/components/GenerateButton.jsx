import { Loader2, ArrowRight } from 'lucide-react'

export default function GenerateButton({ onClick, isLoading }) {
  return (
    <button
      id="generate-btn"
      type="button"
      onClick={onClick}
      disabled={isLoading}
      className="w-full py-3.5 px-4 rounded-xl font-medium text-sm
                 bg-white text-zinc-950 hover:bg-zinc-200
                 active:scale-[0.99]
                 transition-all duration-150 cursor-pointer
                 disabled:opacity-50 disabled:cursor-not-allowed
                 disabled:active:scale-100 flex items-center justify-center gap-2 shadow-sm"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
          <span>Generating joke...</span>
        </>
      ) : (
        <>
          <span>Generate Joke</span>
          <ArrowRight className="w-4 h-4 text-zinc-700" />
        </>
      )}
    </button>
  )
}
