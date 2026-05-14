import { VRCArenaTheme } from '@/themes'
import { makeStyles } from '@mui/styles'
import { cloneElement, createElement } from 'react'

const useStyles = makeStyles<VRCArenaTheme>((theme) => ({
  root: {
    display: 'flex',
    // alignItems: 'flex-end',
  },
  flip: {
    flexDirection: 'row-reverse',
    '& $senderInfo': {
      marginLeft: '0.2rem',
      marginRight: 0,
    },
  },
  chatBubble: {
    width: '100%',
    borderRadius: theme.shape.borderRadius,
    border: '1px solid rgba(255,255,255,0.25)',
    padding: '0.15rem 0.3rem',
  },
  avatar: {
    borderRadius: theme.shape.borderRadius,
    width: '20px',
    height: '20px',
    fontSize: '1rem', // fix icons
    display: 'flex',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  username: {
    // fontSize: '75%',
    textAlign: 'center',
  },
  fakeAvatarImage: {
    width: '100%',
    height: '100%',
    background: '#000',
  },
  senderInfo: {
    marginRight: '0.2rem',
  },
}))

export interface ChatMessageInfo {
  message?: string
  senderavatarurl?: string
  senderusername?: string
  senderavatar?: React.ComponentType<{}>
}

const ChatBubble = ({
  children,
}: {
  children: React.ReactNode | React.ReactNode[]
}) => {
  const classes = useStyles()
  return <div className={classes.chatBubble}>{children}</div>
}

const ChatMessage = ({
  message,
  children,
  className,
  flip,
}: {
  message: ChatMessageInfo
  children: React.ReactNode | React.ReactNode[]
  className?: string
  flip?: boolean
}) => {
  const classes = useStyles()
  return (
    <div className={`${classes.root} ${flip ? classes.flip : ''} ${className}`}>
      <div className={classes.senderInfo}>
        <div className={classes.avatar}>
          {message.senderavatarurl ? (
            <img src={message.senderavatarurl} />
          ) : message.senderavatar ? (
            createElement(message.senderavatar)
          ) : (
            <div className={classes.fakeAvatarImage} />
          )}
        </div>
        <div className={classes.username}>{message.senderusername}</div>
      </div>
      <ChatBubble>{children || message.message}</ChatBubble>
    </div>
  )
}

export default ChatMessage
