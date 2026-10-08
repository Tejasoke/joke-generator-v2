import { useState, useCallback } from 'react'
import { generateJokeStream, generateJoke } from '../api/jokeApi'

/**
 * Custom hook that manages the joke generation lifecycle.
 * Automatically attempts real-time streaming, and falls back to standard
 * JSON generation if streaming is not supported (HTTP 405/404).
 */
export function useJokeStream() {
  const [streamingText, setStreamingText] = useState('')
  const [finalJoke,     setFinalJoke]     = useState(null)
  const [reaction,      setReaction]      = useState(null)
  const [isLoading,     setIsLoading]     = useState(false)
  const [error,         setError]         = useState(null)

  const reset = useCallback(() => {
    setStreamingText('')
    setFinalJoke(null)
    setReaction(null)
    setError(null)
  }, [])

  const startStream = useCallback(async ({ topic, style, strictMode }) => {
    reset()
    setIsLoading(true)

    try {
      let isStreamSupported = true
      let response = null

      try {
        response = await generateJokeStream({ topic, style, strictMode })
      } catch (streamErr) {
        // If 405 (Method Not Allowed) or 404 (Not Found), fallback to /api/generate
        if (streamErr.status === 405 || streamErr.status === 404) {
          isStreamSupported = false
        } else {
          throw streamErr
        }
      }

      // Fallback: Use standard /api/generate endpoint
      if (!isStreamSupported) {
        const data = await generateJoke({ topic, style, strictMode })
        setFinalJoke(data.joke)
        setReaction(data.reaction || '😂')
        return
      }

      // Stream handling for SSE
      const reader   = response.body.getReader()
      const decoder  = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const parts = buffer.split('\n\n')
        buffer = parts.pop()

        for (const part of parts) {
          if (!part.startsWith('data: ')) continue

          try {
            const payload = JSON.parse(part.slice(6))

            if (payload.done) {
              setFinalJoke(payload.joke)
              setReaction(payload.reaction)
              setStreamingText('')
            } else if (payload.token) {
              setStreamingText(prev => prev + payload.token)
            }
          } catch (e) {
            console.error('Error parsing SSE event:', e, part)
          }
        }
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [reset])

  return { streamingText, finalJoke, reaction, isLoading, error, startStream, reset }
}
