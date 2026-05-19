import { useEffect, useRef, useState, ReactNode, CSSProperties } from 'react'

interface LazyLoadProps {
  children: ReactNode
  rootMargin?: string
  threshold?: number
  placeholder?: ReactNode
  style?: CSSProperties
  className?: string
}

const LazyLoad = ({
  children,
  rootMargin = '200px',
  threshold = 0,
  placeholder = null,
  style,
  className,
}: LazyLoadProps) => {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { rootMargin, threshold }
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} style={style} className={className}>
      {inView ? children : placeholder}
    </div>
  )
}

export default LazyLoad
