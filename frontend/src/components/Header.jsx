import { Laugh, Sparkles } from 'lucide-react'

export default function Header() {
  return (
    <header className="text-center mb-10">
      <div className="inline-flex relative mb-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-500 via-amber-500 to-yellow-400 p-0.5 shadow-lg shadow-orange-500/25">
          <div className="w-full h-full bg-[#0d0d15] rounded-[14px] flex items-center justify-center">
            <Laugh className="w-8 h-8 text-orange-400" />
          </div>
        </div>
        <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-5 w-5 bg-orange-500 items-center justify-center">
            <Sparkles className="w-3 h-3 text-white" />
          </span>
        </span>
      </div>

      <h1 className="font-display text-4xl sm:text-5xl font-bold bg-gradient-to-r
                     from-orange-400 via-amber-300 to-yellow-300
                     bg-clip-text text-transparent leading-tight tracking-tight">
        AI Joke Generator
      </h1>

      <p className="mt-3 text-slate-400 text-sm sm:text-base">
        Give me a topic — I'll try to be funny.
      </p>

      <p className="mt-2 text-slate-600 text-xs uppercase tracking-widest font-medium">
        Made by Tejas Oke &amp; Kartikey Singh
      </p>
    </header>
  )
}
