import { useState } from 'react'
import { Copy, Check, RotateCcw, Share2 } from 'lucide-react'

export default function JokeResult({ streamingText, finalJoke, isLoading }) {
  const [copied, setCopied] = useState(false)
  const [shared, setShared] = useState(false)

  if (!isLoading && !streamingText && !finalJoke) return null

  const displayText = finalJoke ?? streamingText

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
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Joke Generator',
          text: displayText,
          url: window.location.href,
        })
        return
      } catch (err) {
        // Fallback to copy
      }
    }
    handleCopy()
    setShared(true)
    setTimeout(() => setShared(false), 2000)
  }

  return (
    <div
      className="mt-5 bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 sm:p-6 shadow-xl"
      role="region"
      aria-label="Generated joke"
      aria-live="polite"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-zinc-800/80">
        <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
          {finalJoke ? 'Output' : 'Generating...'}
        </span>
        {finalJoke && (
          <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Complete
          </span>
        )}
      </div>

      {/* Joke Display */}
      {setupText && punchlineText ? (
        <div className="space-y-3 my-2">
          <div className="text-sm sm:text-base text-zinc-300 leading-relaxed">
            {setupText}
          </div>
          <div className="pt-2 text-base sm:text-lg text-white font-medium leading-relaxed border-t border-zinc-850">
            {punchlineText}
          </div>
        </div>
      ) : (
        <p className="text-sm sm:text-base text-zinc-100 leading-relaxed whitespace-pre-line py-1">
          {displayText}
          {!finalJoke && <span className="cursor-blink" aria-hidden="true" />}
        </p>
      )}

      {/* Action Row */}
      {finalJoke && (
        <div className="flex items-center justify-end gap-2 mt-5 pt-3.5 border-t border-zinc-800/80">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono
                       bg-zinc-800/70 border border-zinc-700/60 text-zinc-300 hover:text-white hover:bg-zinc-700
                       transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-zinc-400" />
                <span>Copy</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono
                       bg-zinc-800/70 border border-zinc-700/60 text-zinc-300 hover:text-white hover:bg-zinc-700
                       transition-colors cursor-pointer"
          >
            {shared ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Shared</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-zinc-400" />
                <span>Share</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('joke:regenerate'))}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono
                       bg-zinc-800/70 border border-zinc-700/60 text-zinc-300 hover:text-white hover:bg-zinc-700
                       transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-zinc-400" />
            <span>Regenerate</span>
          </button>
        </div>
      )}
    </div>
  )
}
