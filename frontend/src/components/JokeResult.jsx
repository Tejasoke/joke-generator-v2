import { useState } from 'react'
import { Copy, Check, RotateCcw, CheckCircle2, MessageSquare, Share2, Sparkles } from 'lucide-react'

export default function JokeResult({ streamingText, finalJoke, reaction, isLoading }) {
  const [copied, setCopied] = useState(false)
  const [shared, setShared] = useState(false)

  if (!isLoading && !streamingText && !finalJoke) return null

  const displayText = finalJoke ?? streamingText

  // Parse Setup & Punchline if formatted
  let setupText = null
  let punchlineText = null

  if (displayText) {
    if (displayText.includes('Punchline:')) {
      const parts = displayText.split('Punchline:')
      setupText = parts[0].replace(/^Setup:\s*/i, '').trim()
      punchlineText = parts[1].trim()
    } else if (displayText.startsWith('Setup:')) {
      setupText = displayText.replace(/^Setup:\s*/i, '').trim()
    }
  }

  async function handleCopy() {
    if (!displayText) return
    try {
      await navigator.clipboard.writeText(displayText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (e) {
      console.error('Failed to copy', e)
    }
  }

  async function handleShare() {
    if (!displayText) return
    const shareData = {
      title: 'AI Joke Generator',
      text: displayText,
      url: window.location.href,
    }
    if (navigator.share) {
      try {
        await navigator.share(shareData)
        return
      } catch (err) {
        // User cancelled or share failed, fallback to copy
      }
    }
    handleCopy()
    setShared(true)
    setTimeout(() => setShared(false), 2000)
  }

  return (
    <div
      className="mt-6 bg-white/[0.05] backdrop-blur-2xl
                 border border-orange-500/30 rounded-2xl sm:rounded-3xl p-4 sm:p-7
                 shadow-2xl shadow-black/60 relative overflow-hidden"
      style={{ animation: 'slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
      role="region"
      aria-label="Generated joke"
      aria-live="polite"
    >
      {/* Top ambient glow */}
      <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-24 bg-orange-500/20 blur-2xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex items-center justify-between gap-3 mb-4 sm:mb-5 pb-3 sm:pb-4 border-b border-white/[0.08]">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-orange-500/15 border border-orange-500/30
                          flex items-center justify-center shrink-0 shadow-inner">
            {reaction ? (
              <span className="text-lg sm:text-2xl animate-bounce" role="img" aria-label="Reaction">
                {reaction}
              </span>
            ) : (
              <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400 animate-pulse" />
            )}
          </div>

          <div className="min-w-0">
            <p className="text-slate-100 font-bold text-xs sm:text-sm truncate">
              {finalJoke ? "Here's your joke!" : 'AI is crafting your joke...'}
            </p>
            <p className="text-slate-400 text-[11px] sm:text-xs truncate">
              {finalJoke ? 'Fine-tuned GPT-2' : 'Streaming live tokens...'}
            </p>
          </div>
        </div>

        {finalJoke && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase
                           tracking-wider bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 shrink-0">
            <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span>Ready</span>
          </span>
        )}
      </div>

      {/* Joke Content Display */}
      {setupText && punchlineText ? (
        <div className="space-y-3 sm:space-y-4 my-2">
          {/* Setup block */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-white/[0.03] border border-white/[0.07]">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-orange-400/90 block mb-1">
              Setup
            </span>
            <p className="font-display text-base sm:text-lg text-slate-100 leading-snug">
              {setupText}
            </p>
          </div>

          {/* Punchline block */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-gradient-to-r from-orange-500/15 to-amber-500/10 border border-orange-500/30">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-amber-300 block mb-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-300" />
              Punchline
            </span>
            <p className="font-display text-base sm:text-xl font-bold text-amber-100 leading-snug">
              {punchlineText}
            </p>
          </div>
        </div>
      ) : (
        <div className="p-3 sm:p-4 rounded-xl bg-white/[0.02]">
          <p className="font-display text-base sm:text-xl leading-relaxed text-slate-100 whitespace-pre-line">
            {displayText}
            {!finalJoke && <span className="cursor-blink" aria-hidden="true" />}
          </p>
        </div>
      )}

      {/* Action buttons (Mobile-first responsive row) */}
      {finalJoke && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5 mt-5 pt-4 border-t border-white/[0.08]">
          {/* Copy button */}
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center justify-center gap-1.5 py-2.5 sm:py-3 px-3 text-xs sm:text-sm font-semibold
                       bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-200
                       hover:text-white hover:border-orange-500/50 hover:bg-orange-500/15
                       active:scale-[0.98] transition-all duration-150 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
                <span>Copy</span>
              </>
            )}
          </button>

          {/* Share button */}
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center justify-center gap-1.5 py-2.5 sm:py-3 px-3 text-xs sm:text-sm font-semibold
                       bg-white/[0.05] border border-white/[0.1] rounded-xl text-slate-200
                       hover:text-white hover:border-orange-500/50 hover:bg-orange-500/15
                       active:scale-[0.98] transition-all duration-150 cursor-pointer"
          >
            {shared ? (
              <>
                <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
                <span className="text-emerald-400">Shared!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
                <span>Share</span>
              </>
            )}
          </button>

          {/* Again button (col-span-2 on mobile, single on desktop) */}
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('joke:regenerate'))}
            className="col-span-2 sm:col-span-1 inline-flex items-center justify-center gap-1.5 py-2.5 sm:py-3 px-3 text-xs sm:text-sm font-bold
                       bg-gradient-to-r from-orange-600/30 to-amber-600/30 border border-orange-500/40 rounded-xl
                       text-orange-200 hover:text-white hover:border-orange-400 hover:bg-orange-500/25
                       active:scale-[0.98] transition-all duration-150 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>Generate Again</span>
          </button>
        </div>
      )}
    </div>
  )
}
