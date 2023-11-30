import { makeStyles } from '@material-ui/styles'
import EmojiPicker, { EmojiStyle } from 'emoji-picker-react'
import { useState } from 'react'

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

export default (props: { onSelectEmoji: (emoji: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false)
  const classes = useStyles()
  return (
    <span className={classes.root}>
      <span
        className={classes.btn}
        onClick={() => setIsOpen((currentVal) => !currentVal)}>
        😀
      </span>
      {isOpen && (
        <div className={classes.picker}>
          <EmojiPicker
            onEmojiClick={(emojiClickData) =>
              props.onSelectEmoji(emojiClickData.emoji)
            }
            previewConfig={{ showPreview: false }}
            emojiStyle={EmojiStyle.NATIVE}
          />
        </div>
      )}
    </span>
  )
}
