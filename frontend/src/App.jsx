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
  const [alert,      setAlert]      = useState(null)

  const { streamingText, finalJoke, isLoading, error, startStream, reset } =
    useJokeStream()

  // Show backend errors cleanly
  useEffect(() => {
    if (error) {
      if (error.includes('Inappropriate')) {
        setAlert({ type: 'error', message: 'Inappropriate topic detected. Please try another.' })
      } else if (error.includes('Could not generate')) {
        setAlert({ type: 'warning', message: "Couldn't generate a suitable joke. Try a different topic or style." })
      } else {
        setAlert({ type: 'error', message: error })
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

  // Listen for regenerate event
  useEffect(() => {
    const handler = () => handleGenerate()
    window.addEventListener('joke:regenerate', handler)
    return () => window.removeEventListener('joke:regenerate', handler)
  }, [handleGenerate])

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 relative antialiased selection:bg-zinc-800 selection:text-white">

      {/* Main Page Layout */}
      <main className="relative z-10 flex flex-col items-center px-4 sm:px-6 py-10 sm:py-16 min-h-screen">
        <div className="w-full max-w-xl mx-auto">

          <Header />

          {/* Clean Alert */}
          {alert && (
            <div className={`mb-4 px-3.5 py-2.5 rounded-xl text-xs font-mono
                             border flex items-center gap-2.5
                             ${alert.type === 'error'
                               ? 'bg-rose-950/30 border-rose-800/50 text-rose-300'
                               : 'bg-amber-950/30 border-amber-800/50 text-amber-300'
                             }`}
                 role="alert">
              {alert.type === 'error' ? (
                <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
              )}
              <span>{alert.message}</span>
            </div>
          )}

          {/* Main Card */}
          <div className="bg-zinc-900/40 border border-zinc-800/80
                          rounded-2xl p-5 sm:p-7 shadow-2xl backdrop-blur-sm mb-5">
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

          {/* Result Card */}
          <JokeResult
            streamingText={streamingText}
            finalJoke={finalJoke}
            isLoading={isLoading}
          />

          {/* Minimalist Footer */}
          <footer className="text-center mt-12 text-zinc-600 text-xs font-mono">
            Fine-Tuned GPT-2 Medium · Hugging Face ZeroGPU
          </footer>
        </div>
      </main>

      <DeviceBadge />
    </div>
  )
}
