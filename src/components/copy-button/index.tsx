import React, { useState } from 'react'
import FileCopyIcon from '@mui/icons-material/FileCopy'
import Button, { ButtonProps } from '@/components/button'
import { copyTextToClipboard } from '@/utils'
import useTimer from '@/hooks/useTimer'

const CopyButton = ({
  text,
  ...buttonProps
}: { text: string } & ButtonProps) => {
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
      isDisabled={!text}
      {...buttonProps}>
      {hasCopied ? 'Copied!' : 'Copy'}
    </Button>
  )
}

export default CopyButton
