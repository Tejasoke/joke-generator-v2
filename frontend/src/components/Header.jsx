import { Laugh, Sparkles, Zap } from 'lucide-react'

export default function Header() {
  return (
    <header className="text-center mb-6 sm:mb-10 px-1">
      {/* Top Status Pill */}
      <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full
                      bg-white/[0.04] border border-white/[0.1] backdrop-blur-md mb-4 sm:mb-6
                      shadow-inner shadow-white/5 max-w-full">
        <span className="flex h-2 w-2 relative shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-slate-300 truncate">
          GPT-2 Medium
        </span>
        <span className="text-slate-600">·</span>
        <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-amber-400 shrink-0">
          <Zap className="w-3 h-3 text-amber-400" />
          ZeroGPU
        </span>
      </div>

      {/* Main Avatar / Icon */}
      <div className="flex justify-center mb-4 sm:mb-5">
        <div className="relative group">
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-orange-500 via-pink-500 to-amber-500
                          opacity-75 blur-lg group-hover:opacity-100 transition-opacity duration-500 animate-pulse-glow" />
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#0c0c16] border border-white/15
                          flex items-center justify-center shadow-2xl">
            <Laugh className="w-8 h-8 sm:w-10 sm:h-10 text-orange-400 transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300" />
            <div className="absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500
                            flex items-center justify-center shadow-md">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Title */}
      <h1 className="font-display text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight
                     bg-gradient-to-r from-white via-slate-100 to-orange-300
                     bg-clip-text text-transparent leading-[1.15]">
        AI Joke Generator
      </h1>

      <p className="mt-2.5 sm:mt-3.5 text-slate-400 text-xs sm:text-base max-w-md mx-auto leading-relaxed px-2">
        Drop any topic — our fine-tuned AI model will craft the setup and punchline in real-time.
      </p>

      <div className="mt-3 sm:mt-4 flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs text-slate-500 font-medium">
        <span>Made with ❤️ by</span>
        <span className="text-slate-300 font-semibold px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.08]">
          Tejas Oke
        </span>
        <span>&amp;</span>
        <span className="text-slate-300 font-semibold px-2 py-0.5 rounded-md bg-white/[0.05] border border-white/[0.08]">
          Kartikey Singh
        </span>
      </div>
    </header>
  )
}
