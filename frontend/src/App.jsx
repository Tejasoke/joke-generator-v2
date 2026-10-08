import { useState, useEffect, useCallback } from 'react'
import { AlertCircle, AlertTriangle } from 'lucide-react'
import Header         from './components/Header'
import TopicInput     from './components/TopicInput'
import StylePicker    from './components/StylePicker'
import StrictToggle   from './components/StrictToggle'
import GenerateButton from './components/GenerateButton'
import JokeResult     from './components/JokeResult'
import DeviceBadge    from './components/DeviceBadge'
import { useJokeStream } from './hooks/useJokeStream'

export default function App() {
  const [topic,      setTopic]      = useState('')
  const [style,      setStyle]      = useState('Normal')
  const [strictMode, setStrictMode] = useState(false)
  const [alert,      setAlert]      = useState(null)   // { type, message }

  const { streamingText, finalJoke, reaction, isLoading, error, startStream, reset } =
    useJokeStream()

  // Show backend errors as alerts
  useEffect(() => {
    if (error) {
      if (error.includes('Inappropriate')) {
        setAlert({ type: 'error', message: 'Inappropriate topic detected. Try a different one.' })
      } else if (error.includes('Could not generate')) {
        setAlert({ type: 'warning', message: "Couldn't produce a good joke. Try a different topic or style!" })
      } else {
        setAlert({ type: 'error', message: `Error: ${error}` })
      }
    }
  }, [error])

  const handleGenerate = useCallback(() => {
    setAlert(null)
    if (!topic.trim()) {
      setAlert({ type: 'warning', message: 'Please enter a topic first.' })
      return
    }
    reset()
    startStream({ topic: topic.trim(), style, strictMode })
  }, [topic, style, strictMode, startStream, reset])

  // Listen for the "Again" custom event from JokeResult
  useEffect(() => {
    const handler = () => handleGenerate()
    window.addEventListener('joke:regenerate', handler)
    return () => window.removeEventListener('joke:regenerate', handler)
  }, [handleGenerate])

  return (
    <div className="min-h-screen bg-[#07070d] bg-grid-pattern relative overflow-x-hidden selection:bg-orange-500/30 selection:text-orange-200">

      {/* ── Ambient background glow (optimized for mobile) ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute -top-32 -left-32 w-72 sm:w-[500px] h-72 sm:h-[500px] rounded-full
                        bg-orange-600/15 blur-[80px] sm:blur-[100px]"
             style={{ animation: 'float 14s ease-in-out infinite' }} />
        <div className="absolute top-1/3 -right-32 w-64 sm:w-96 h-64 sm:h-96 rounded-full
                        bg-purple-600/10 blur-[80px] sm:blur-[100px]"
             style={{ animation: 'float 14s ease-in-out infinite 5s' }} />
        <div className="absolute -bottom-20 left-1/4 w-60 sm:w-80 h-60 sm:h-80 rounded-full
                        bg-amber-500/10 blur-[80px] sm:blur-[90px]"
             style={{ animation: 'float 14s ease-in-out infinite 9s' }} />
      </div>

      {/* ── Page content ── */}
      <main className="relative z-10 flex flex-col items-center
                       px-3.5 sm:px-6 py-6 sm:py-14 pb-20 sm:pb-24 min-h-screen">
        <div className="w-full max-w-xl mx-auto">

          <Header />

          {/* Alert with Lucide icon */}
          {alert && (
            <div className={`mb-4 px-3.5 py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-medium
                             border flex items-center gap-2.5 backdrop-blur-md
                             ${alert.type === 'error'
                               ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                               : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                             }`}
                 style={{ animation: 'slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
                 role="alert">
              {alert.type === 'error' ? (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
              )}
              <span>{alert.message}</span>
            </div>
          )}

          {/* Form card */}
          <div className="bg-white/[0.04] backdrop-blur-2xl border border-white/[0.09]
                          rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-2xl shadow-black/70 mb-4 sm:mb-6">
            <TopicInput
              value={topic}
              onChange={setTopic}
              onEnter={handleGenerate}
              disabled={isLoading}
            />
            <StylePicker
              selected={style}
              onChange={setStyle}
              disabled={isLoading}
            />
            <StrictToggle
              checked={strictMode}
              onChange={setStrictMode}
              disabled={isLoading}
            />
            <GenerateButton
              onClick={handleGenerate}
              isLoading={isLoading}
            />
          </div>

          {/* Result */}
          <JokeResult
            streamingText={streamingText}
            finalJoke={finalJoke}
            reaction={reaction}
            isLoading={isLoading}
          />

          {/* Footer */}
          <footer className="text-center mt-8 sm:mt-12 text-slate-500 text-[11px] sm:text-xs">
            Powered by Fine-Tuned GPT-2 Medium · Served on Hugging Face ZeroGPU
          </footer>
        </div>
      </main>

      <DeviceBadge />
    </div>
  )
}
