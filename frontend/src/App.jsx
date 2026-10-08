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
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-x-hidden">

      {/* ── Animated background orbs ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute -top-48 -left-48 w-[600px] h-[600px] rounded-full
                        bg-orange-600 opacity-15 blur-[90px]"
             style={{ animation: 'float 12s ease-in-out infinite' }} />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full
                        bg-amber-500 opacity-15 blur-[90px]"
             style={{ animation: 'float 12s ease-in-out infinite 4s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                        w-72 h-72 rounded-full bg-red-500 opacity-10 blur-[90px]"
             style={{ animation: 'float 12s ease-in-out infinite 8s' }} />
      </div>

      {/* ── Page content ── */}
      <main className="relative z-10 flex flex-col items-center
                       px-5 py-14 pb-24 min-h-screen">
        <div className="w-full max-w-xl">

          <Header />

          {/* Alert with Lucide icon */}
          {alert && (
            <div className={`mb-4 px-4 py-3.5 rounded-xl text-sm font-medium
                             border flex items-center gap-2.5
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
          <div className="bg-white/[0.05] backdrop-blur-xl border border-white/[0.08]
                          rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/60 mb-6">
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
          <footer className="text-center mt-8 text-slate-600 text-xs">
            Powered by fine-tuned GPT-2 Medium · FastAPI backend
          </footer>
        </div>
      </main>

      <DeviceBadge />
    </div>
  )
}
