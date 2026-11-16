import { useEffect, useState } from 'react'

const colorPhases = [
  'bg-orange-500 text-white ring-orange-200',
  'bg-amber-950 text-orange-100 ring-amber-800',
  'bg-white text-orange-700 ring-orange-200',
]

export default function Loader() {
  const [phase, setPhase] = useState(0)

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setPhase((currentPhase) => (currentPhase + 1) % colorPhases.length)
    }, 800)

    return () => window.clearInterval(intervalId)
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex min-h-screen items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div
          aria-label="Loading"
          className={`flex h-[100px] w-[100px] items-center justify-center rounded-[28px] shadow-[0_12px_35px_rgba(120,53,15,0.18)] ring-1 transition-colors duration-700 ease-in-out ${colorPhases[phase]}`}
          role="status"
        >
          <span className="sr-only">Loading</span>
          <span className="h-12 w-12 animate-spin rounded-full border-[3px] border-current border-t-transparent motion-reduce:animate-none" />
        </div>
        <p className="text-sm font-medium tracking-[0.18em] text-amber-950">
          LOADING
        </p>
        <div className="flex gap-1.5" aria-hidden="true">
          {colorPhases.map((_, index) => (
            <span
              className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${
                phase === index ? 'bg-orange-500' : 'bg-orange-200'
              }`}
              key={index}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
