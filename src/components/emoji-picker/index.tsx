import React from 'react'
import { makeStyles } from '@mui/styles'
import EmojiPickerReact, { EmojiStyle } from 'emoji-picker-react'
import { useCallback, useRef, useState } from 'react'
import useClickAway from '../../hooks/useClickAway'

const useStyles = makeStyles({
  root: {
    position: 'relative',
  },
  btn: {
    cursor: 'pointer',
    transition: '100ms all',
    '&:hover': {
      transform: 'scale(1.1)',
    },
  },
  picker: {
    position: 'absolute',
    top: '100%',
    left: 0,
    zIndex: 100,
  },
  fromRight: {
    left: 'auto',
    right: 0,
  },
})

const EmojiPicker = ({
  onSelectEmoji,
  className,
  fromRight = false,
}: {
  onSelectEmoji: (emoji: string) => void
  className?: string
  fromRight?: boolean
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const classes = useStyles()
  const rootRef = useRef<HTMLDivElement | null>(null)

  const onClickAway = useCallback(() => setIsOpen(false), [])

  useClickAway(rootRef, onClickAway)

  return (
    <div className={`${classes.root}`} ref={rootRef}>
      <div
        className={`${classes.btn} ${className}`}
        onClick={() => setIsOpen((currentVal) => !currentVal)}>
        😀
      </div>
      {isOpen && (
        <div
          className={`${classes.picker} ${fromRight ? classes.fromRight : ''}`}>
          <EmojiPickerReact
            onEmojiClick={(emojiClickData) =>
              onSelectEmoji(emojiClickData.emoji)
            }
            previewConfig={{ showPreview: false }}
            emojiStyle={EmojiStyle.NATIVE}
          />
        </div>
      )}
    </div>
  )
}

export default EmojiPicker
