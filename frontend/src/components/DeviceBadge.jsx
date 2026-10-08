import { useEffect, useState } from 'react'
import { Cpu, Zap, AlertTriangle } from 'lucide-react'
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
  const isCuda = info.device === 'CUDA'

  return (
    <div className="fixed bottom-5 right-5 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full
                    text-xs font-medium border border-white/[0.08]
                    bg-black/60 backdrop-blur-xl z-50 text-slate-400 shadow-lg">
      {isError ? (
        <>
          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
          <span className="text-rose-400">API offline</span>
        </>
      ) : isCuda ? (
        <>
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>CUDA · GPT-2 Medium</span>
        </>
      ) : (
        <>
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span>{info.device || 'CPU'} · GPT-2 Medium</span>
        </>
      )}
    </div>
  )
}
