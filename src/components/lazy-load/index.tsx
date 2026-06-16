import {
  useEffect,
  useRef,
  useState,
  ReactNode,
  CSSProperties,
  useLayoutEffect,
} from 'react'

interface LazyLoadProps {
  children: ReactNode
  rootMargin?: string
  threshold?: number
  placeholder?: ReactNode
  style?: CSSProperties
  className?: string
  /**
   * @deprecated Unused
   */
  height?: number
}

const isInViewport = (element: HTMLElement, rootMargin: string) => {
  const rect = element.getBoundingClientRect()
  const margin = parseInt(rootMargin) || 0
  return rect.top < window.innerHeight + margin && rect.bottom > -margin
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

  useLayoutEffect(() => {
    if (!ref.current) return

    if (isInViewport(ref.current, rootMargin)) {
      setInView(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { rootMargin, threshold }
    )

    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} style={style} className={className}>
      {inView ? children : placeholder}
    </div>
  )
}

export default LazyLoad
