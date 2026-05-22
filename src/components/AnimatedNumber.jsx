import { useEffect, useRef, useState } from 'react'

export default function AnimatedNumber({ value, prefix = '', suffix = '', decimals = 2, className = '' }) {
  const [display, setDisplay] = useState(value)
  const animRef = useRef(null)
  const startRef = useRef(display)

  useEffect(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current)
    const start = startRef.current
    const end = value
    const duration = 600
    const startTime = performance.now()

    const tick = (now) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      setDisplay(start + (end - start) * eased)
      if (progress < 1) animRef.current = requestAnimationFrame(tick)
      else startRef.current = end
    }
    animRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animRef.current)
  }, [value])

  const formatted = parseFloat(display).toLocaleString('en-PH', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })

  return (
    <span className={className}>
      {prefix}{formatted}{suffix}
    </span>
  )
}
