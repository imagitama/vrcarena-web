import React, { useState } from 'react'
import { copyTextToClipboard } from '../../utils'
import useTimer from '../../hooks/useTimer'
import Tooltip from '../tooltip'

const CopyThing = ({
  text,
  children,
  title,
}: {
  text: string
  children: React.ReactChild
  title?: string | React.ReactElement
}) => {
  const [hasCopied, setHasCopied] = useState(false)
  const startTimer = useTimer(() => setHasCopied(false), 2000)

  const onClick = () => {
    copyTextToClipboard(text)
    setHasCopied(true)
    startTimer()
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

  return <Tooltip title={title || ''}>{child}</Tooltip>
}

export default CopyThing
