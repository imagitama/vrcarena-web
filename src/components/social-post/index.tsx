import React, { useEffect, useRef, useState } from 'react'
import { makeStyles } from '@mui/styles'
import SecurityIcon from '@mui/icons-material/Security'

import Avatar, { AvatarSize } from '../avatar'
import {
  CollectionNames,
  FullSocialPost,
  SocialAttachment,
} from '../../modules/social'
import { trimDescription } from '../../utils/formatting'
import useIsEditor from '../../hooks/useIsEditor'

import FormattedDate from '../formatted-date'
import UsernameLink from '../username-link'
import Button from '../button'
import EditorRecordManager from '../editor-record-manager'
import Paper from '../paper'
import SocialReactions from '../social-reactions'
import useQueryParam from '../../hooks/useQueryParam'
import { scrollToElement } from '../../utils'
import MentionsOutput from '../mentions-output'
import useIsLoggedIn from '../../hooks/useIsLoggedIn'
import ReplyToSocialPostForm from '../reply-to-social-post-form'
import SocialPostReplies from '../social-post-replies'

const useStyles = makeStyles({
  root: {
    position: 'relative',
    marginTop: '1rem',
    '&:first-child': {
      marginTop: 0,
    },
    display: 'flex',
    padding: '1rem',
    background: 'rgba(0, 0, 0, 0.2)',
  },
  content: {
    width: '100%',
  },
  avatar: {
    marginRight: '1rem',
  },
  meta: {
    fontSize: '80%',
  },
  text: {
    margin: '0.5rem 0',
    '& p:first-child': {
      marginTop: 0,
    },
    '& p:last-child': {
      marginBottom: 0,
    },
  },
  controls: {
    position: 'absolute',
    top: '1rem',
    right: '1rem',
  },
  attachments: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  attachmentImage: {
    width: '150px',
    margin: '0 0.25rem 0.25rem 0',
    padding: '0.25rem',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    '& img': {
      width: '100%',
      display: 'block',
    },
    '& a': {
      display: 'block',
    },
  },
  isActive: {
    outline: '1px solid rgba(255, 255, 255, 0.9)',
  },
  small: {
    marginTop: '0.5rem',
    padding: '0.5rem',
    '& .text': {
      margin: '0.5rem 0 0.25rem',
      wordBreak: 'break-all', // fix homepage width fuckery
    },
    '& .avatar': {
      marginRight: '0.5rem',
    },
  },
  options: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
  },
  option: {
    padding: '0.5rem',
    opacity: 0.5,
    transition: '100ms all',
    cursor: 'pointer',
    '&:hover': {
      opacity: 1,
    },
  },
})

const limitBeforeCollapse = 300

const Attachment = ({ attachment }: { attachment: SocialAttachment }) => {
  const classes = useStyles()

  // TODO: Other types
  return (
    <div className={classes.attachmentImage}>
      <a href={attachment.url} target="_blank" rel="noopener noreferrer">
        <img src={attachment.url} />
      </a>
    </div>
  )
}

const SocialPost = ({
  socialPost,
  hydrate,
  small = false,
  allowReplies = true,
}: {
  socialPost: FullSocialPost
  hydrate?: () => void
  small?: boolean
  allowReplies?: boolean
}) => {
  const classes = useStyles()
  const [isExpanded, setIsExpanded] = useState(false)
  const isEditor = useIsEditor()
  const [isEditorControlsVisible, setIsEditorControlsVisible] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const activePostId = useQueryParam('post')
  const isLoggedIn = useIsLoggedIn()
  const [isRepliesVisible, setIsRepliesVisible] = useState(false)
  const [isAddReplyFormVisible, setIsAddReplyFormVisible] = useState(false)

  const isActive = activePostId === socialPost.id

  useEffect(() => {
    if (!isActive || !rootRef.current) {
      return
    }

    scrollToElement(rootRef.current)
  }, [isActive])

  return (
    <div
      className={`${classes.root} ${isActive ? classes.isActive : ''} ${
        small ? classes.small : ''
      }`}
      ref={rootRef}
      data-id={socialPost.id}>
      <div className={classes.avatar}>
        <UsernameLink id={socialPost.createdby}>
          <Avatar
            url={socialPost.createdbyavatarurl}
            username={socialPost.createdbyusername}
            size={AvatarSize.Tiny}
          />
        </UsernameLink>
      </div>
      <div className={classes.content}>
        <div className={classes.meta}>
          <UsernameLink
            id={socialPost.createdby}
            username={socialPost.createdbyusername}>
            {socialPost.createdbyusername}
          </UsernameLink>
          {' ... '}
          <FormattedDate date={new Date(socialPost.createdat)} />
          {socialPost.isadult ? ' 🔞' : ''}
          {socialPost.editornotes && (
            <Paper>
              <strong>Editor Notes: </strong>
              {socialPost.editornotes}
            </Paper>
          )}
          {isEditor && (
            <>
              <Button
                color="secondary"
                onClick={() =>
                  setIsEditorControlsVisible((currentVal) => !currentVal)
                }
                className={classes.controls}
                icon={<SecurityIcon />}
                iconOnly
                size="small"
              />
              {isEditorControlsVisible && (
                <EditorRecordManager
                  id={socialPost.id}
                  metaCollectionName={CollectionNames.SocialPostMeta}
                  existingAccessStatus={socialPost.accessstatus}
                  showApprovalButtons={false}
                  onDone={hydrate}
                />
              )}
            </>
          )}
        </div>
        <div className={classes.text}>
          <MentionsOutput
            text={
              isExpanded
                ? socialPost.text
                : trimDescription(socialPost.text, limitBeforeCollapse)
            }
            mentions={socialPost.mentions}
          />
          {socialPost.text.length > limitBeforeCollapse && (
            <>
              <br />
              <Button
                color="secondary"
                onClick={() => setIsExpanded((currentVal) => !currentVal)}>
                Expand
              </Button>
            </>
          )}
        </div>
        <div className={classes.attachments}>
          {socialPost.attachments.map((attachment) => (
            <Attachment key={attachment.url} attachment={attachment} />
          ))}
        </div>
        <div className={classes.options}>
          <SocialReactions
            socialPostId={socialPost.id}
            myReactionEmoji={socialPost.myreactionemoji}
            reactionSummaries={socialPost.reactionsummaries}
            hydrate={hydrate}
            small={small}
          />
          {allowReplies && socialPost.replycount > 0 ? (
            <span
              onClick={() => setIsRepliesVisible((currentVal) => !currentVal)}
              className={classes.option}>
              {socialPost.replycount} replies
            </span>
          ) : null}
          {!small && allowReplies && isLoggedIn ? (
            <span
              onClick={() =>
                setIsAddReplyFormVisible((currentVal) => !currentVal)
              }
              className={classes.option}>
              Reply
            </span>
          ) : null}
        </div>
        {isAddReplyFormVisible && (
          <ReplyToSocialPostForm
            postId={socialPost.id}
            originalUserId={socialPost.createdby}
            originalUsername={socialPost.createdbyusername}
            hydrate={() => {
              setIsAddReplyFormVisible(false)
              setIsRepliesVisible(true)
              if (hydrate) {
                hydrate()
              }
            }}
          />
        )}
        {isRepliesVisible && <SocialPostReplies postId={socialPost.id} />}
      </div>
    </div>
  )
}

export default SocialPost
