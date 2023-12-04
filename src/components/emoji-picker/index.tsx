import { makeStyles } from '@material-ui/styles'
import EmojiPicker, { EmojiStyle } from 'emoji-picker-react'
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
})

export default ({
  onSelectEmoji,
  className,
}: {
  onSelectEmoji: (emoji: string) => void
  className?: string
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
        <div className={classes.picker}>
          <EmojiPicker
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
