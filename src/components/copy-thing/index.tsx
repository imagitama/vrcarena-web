import React, { useState } from 'react'
import { copyTextToClipboard } from '@/utils'
import useTimer from '@/hooks/useTimer'
import Tooltip from '@/components/tooltip'

const CopyThing = ({
  text,
  children,
  title,
}: {
  text: string
  children: React.ReactNode
  title?: string | React.ReactElement
}) => {
  const [hasCopied, setHasCopied] = useState(false)
  const startTimer = useTimer(() => setHasCopied(false), 2000)

  const onClick = (e: React.MouseEvent) => {
    copyTextToClipboard(text)
    setHasCopied(true)
    startTimer()
    e.preventDefault()
    e.stopPropagation()
    return false
  }

  const child = (
    <span onClick={onClick} style={{ cursor: 'pointer' }}>
      {children}
    </span>
  )

  if (hasCopied) {
    return (
      <Tooltip title={'Copied!'} open={true}>
        {child}
      </Tooltip>
    )
  }

  return <Tooltip title={title || 'Click here to copy'}>{child}</Tooltip>
}

export default CopyThing
