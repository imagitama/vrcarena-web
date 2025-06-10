import React, { useState } from 'react'
import FileCopyIcon from '@mui/icons-material/FileCopy'
import Button from '../button'
import { copyTextToClipboard } from '../../utils'
import useTimer from '../../hooks/useTimer'

const CopyButton = ({ text }: { text: string }) => {
  const [hasCopied, setHasCopied] = useState(false)
  const startTimer = useTimer(() => setHasCopied(false), 2000)

  return (
    <Button
      icon={<FileCopyIcon />}
      color="secondary"
      onClick={() => {
        copyTextToClipboard(text)
        setHasCopied(true)
        startTimer()
      }}
      isDisabled={!text}>
      {hasCopied ? 'Copied!' : 'Copy'}
    </Button>
  )
}

export default CopyButton
