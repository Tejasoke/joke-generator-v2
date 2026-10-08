export default function Header() {
  return (
    <header className="text-center mb-8 sm:mb-10 pt-2">
      {/* Main Title */}
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-white mb-2.5">
        Joke Generator
      </h1>

      <p className="text-zinc-400 text-sm sm:text-base max-w-sm mx-auto font-normal leading-relaxed">
        Prompt our custom model with any topic or scenario.
      </p>

      {/* Clean Attribution */}
      <div className="mt-3.5 flex items-center justify-center gap-1.5 text-xs text-zinc-500 font-mono">
        <span>Built by</span>
        <span className="text-zinc-300 font-medium">Tejas Oke</span>
        <span>&amp;</span>
        <span className="text-zinc-300 font-medium">Kartikey Singh</span>
      </div>
    </header>
  )
}
