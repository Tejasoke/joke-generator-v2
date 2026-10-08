import { useState, useCallback } from 'react'
import { generateJokeStream } from '../api/jokeApi'

/**
 * Custom hook that manages the entire SSE streaming lifecycle.
 *
 * Returns:
 *   streamingText  — live token-by-token text being built
 *   finalJoke      — fully post-processed joke (set on [done] event)
 *   reaction       — emoji reaction (set on [done] event)
 *   isLoading      — true while model is generating
 *   error          — error string or null
 *   startStream    — function({ topic, style, strictMode }) to kick off generation
 *   reset          — clears all state
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
      const response = await generateJokeStream({ topic, style, strictMode })
      const reader   = response.body.getReader()
      const decoder  = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        // Decode the chunk and append to buffer
        buffer += decoder.decode(value, { stream: true })

        // SSE messages are separated by double newlines
        const parts = buffer.split('\n\n')
        buffer = parts.pop()  // incomplete trailing chunk

        for (const part of parts) {
          if (!part.startsWith('data: ')) continue

          try {
            const payload = JSON.parse(part.slice(6))

            if (payload.done) {
              // Final processed joke from backend
              setFinalJoke(payload.joke)
              setReaction(payload.reaction)
              setStreamingText('')  // clear raw stream, show final
            } else if (payload.token) {
              // Append token to live display
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
