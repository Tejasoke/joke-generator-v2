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
  const isCuda = info.device === 'CUDA' || info.device?.includes('CUDA')

  return (
    <div className="fixed bottom-3 right-3 sm:bottom-5 sm:right-5 inline-flex items-center gap-1.5
                    px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full
                    text-[10px] sm:text-xs font-semibold border border-white/[0.1]
                    bg-[#0a0a14]/80 backdrop-blur-xl z-50 text-slate-400 shadow-xl shadow-black/50">
      {isError ? (
        <>
          <AlertTriangle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-400 shrink-0" />
          <span className="text-rose-400">Offline</span>
        </>
      ) : isCuda ? (
        <>
          <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 shrink-0" />
          <span>ZeroGPU · GPT-2</span>
        </>
      ) : (
        <>
          <Cpu className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-400 shrink-0" />
          <span>{info.device || 'CPU'} · GPT-2</span>
        </>
      )}
    </div>
  )
}
