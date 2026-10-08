import { useState } from 'react'
import { Copy, Check, RotateCcw, Sparkles, CheckCircle2, MessageSquare } from 'lucide-react'

export default function JokeResult({ streamingText, finalJoke, reaction, isLoading }) {
  const [copied, setCopied] = useState(false)

  if (!isLoading && !streamingText && !finalJoke) return null

  const displayText = finalJoke ?? streamingText

  async function handleCopy() {
    if (!finalJoke) return
    try {
      await navigator.clipboard.writeText(finalJoke)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (e) {
      console.error('Failed to copy text', e)
    }
  }

  return (
    <div
      className="mt-6 bg-white/[0.05] backdrop-blur-xl
                 border border-orange-500/30 rounded-3xl p-6 sm:p-8
                 shadow-2xl shadow-black/50"
      style={{ animation: 'slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
      role="region"
      aria-label="Generated joke"
      aria-live="polite"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-5 pb-4 border-b border-white/[0.08]">
        <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center">
          {reaction ? (
            <span className="text-xl" role="img" aria-label="Reaction">
              {reaction}
            </span>
          ) : (
            <MessageSquare className="w-5 h-5 text-orange-400 animate-pulse" />
          )}
        </div>

        <div className="flex-1">
          <p className="text-slate-100 font-semibold text-sm">Here's your joke!</p>
          <p className="text-slate-500 text-xs">
            {finalJoke ? 'Generation complete' : 'Streaming response...'}
          </p>
        </div>

        {finalJoke && (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold uppercase
                           tracking-wider bg-emerald-500/10 border border-emerald-500/30
                           text-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Done</span>
          </span>
        )}
      </div>

      {/* Joke text */}
      <p className="font-display text-lg sm:text-xl leading-relaxed text-slate-100 whitespace-pre-line">
        {displayText}
        {/* Blinking cursor while streaming */}
        {!finalJoke && <span className="cursor-blink" aria-hidden="true" />}
      </p>

      {/* Actions — only shown when generation complete */}
      {finalJoke && (
        <div className="flex gap-2.5 mt-6 pt-4 border-t border-white/[0.08]">
          <button
            type="button"
            onClick={handleCopy}
            className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 text-sm font-medium
                       bg-white/[0.04] border border-white/[0.08] rounded-xl
                       text-slate-300 hover:text-white hover:border-orange-500/50 hover:bg-orange-500/10
                       cursor-pointer transition-all duration-200"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-400" />
                <span>Copy Joke</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('joke:regenerate'))}
            className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 text-sm font-medium
                       bg-white/[0.04] border border-white/[0.08] rounded-xl
                       text-slate-300 hover:text-white hover:border-orange-500/50 hover:bg-orange-500/10
                       cursor-pointer transition-all duration-200"
          >
            <RotateCcw className="w-4 h-4 text-slate-400" />
            <span>Generate Again</span>
          </button>
        </div>
      )}
    </div>
  )
}
