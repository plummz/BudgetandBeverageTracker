import { useEffect, useRef, useState } from 'react'

export default function AnimatedNumber({
  value,
  prefix = '',
  suffix = '',
  decimals = 2,
  className = '',
  style,
}) {
  const [display, setDisplay] = useState(value)
  const animRef = useRef(null)
  const startRef = useRef(value)

  useEffect(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current)
    const start = startRef.current
    const end = value
    const duration = 500
    const startTime = performance.now()

    const tick = (now) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(start + (end - start) * eased)
      if (progress < 1) {
        animRef.current = requestAnimationFrame(tick)
      } else {
        startRef.current = end
      }
    }
    animRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animRef.current)
  }, [value])

  const formatted = parseFloat(display).toLocaleString('en-PH', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })

  return (
    <span className={className} style={style}>
      {prefix}{formatted}{suffix}
    </span>
  )
}
