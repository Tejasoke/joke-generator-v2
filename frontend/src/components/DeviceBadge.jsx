import { useEffect, useState } from 'react'
import { fetchHealth } from '../api/jokeApi'

export default function DeviceBadge() {
  const [info, setInfo] = useState(null)

  useEffect(() => {
    fetchHealth()
      .then(data => setInfo(data))
      .catch(() => setInfo({ status: 'error' }))
  }, [])

  if (!info) return null

  const isError = info.status === 'error'

  return (
    <div className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 inline-flex items-center gap-2
                    px-2.5 py-1 rounded-md text-[11px] font-mono border border-zinc-850
                    bg-zinc-900/90 text-zinc-400 backdrop-blur-md shadow-md z-50">
      <span className={`w-1.5 h-1.5 rounded-full ${isError ? 'bg-rose-500' : 'bg-emerald-400'}`} />
      <span>{isError ? 'API Offline' : 'ZeroGPU · Online'}</span>
    </div>
  )
}
