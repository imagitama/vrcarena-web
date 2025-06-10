import React, { useEffect, useRef, useState } from 'react'
import { makeStyles } from '@mui/styles'

const heightBeforeCollapsed = 300

const useStyles = makeStyles({
  root: {
    position: 'relative',
  },
  collapsed: {
    height: `${heightBeforeCollapsed}px`,
    overflow: 'hidden',
  },
  overlay: {
    height: '100%',
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 10,
    background: 'linear-gradient(rgba(0, 0, 0, 0) 0%, #282828 75%)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '& span': {
      textShadow: '1px 1px 1px #000',
      textAlign: 'center',
      fontWeight: 'bold',
      padding: '2rem',
      background: 'rgba(0, 0, 0, 0.25)',
    },
  },
})

const Expander = ({
  message = 'Click to expand description',
  children,
  isLoaded,
}: {
  message: string
  children: React.ReactNode
  isLoaded?: boolean
}) => {
  const classes = useStyles()
  const [isExpanded, setIsExpanded] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  const expand = () => setIsExpanded((currentVal) => !currentVal)

  useEffect(() => {
    if (isLoaded === false) {
      return
    }

    const elem = contentRef.current

    if (elem && elem.offsetHeight < heightBeforeCollapsed) {
      setIsExpanded(true)
    }
  }, [isLoaded === false])

  return (
    <div className={`${classes.root} ${isExpanded ? '' : classes.collapsed}`}>
      <div ref={contentRef}>{children}</div>
      {!isExpanded && (
        <div className={classes.overlay} onClick={expand}>
          {isLoaded !== false ? <span>{message}</span> : null}
        </div>
      )}
    </div>
  )
}

export default Expander
