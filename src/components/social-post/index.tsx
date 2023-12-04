import React, { useEffect, useRef, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'

import Avatar, { sizes } from '../avatar'
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
  content: {},
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
    '& $text': {
      margin: '0.5rem 0 0.25rem',
    },
    '& $avatar': {
      marginRight: '0.5rem',
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

const Line = ({ line, mentions }: { line: string; mentions: string[] }) => {
  const regex = /\[user:(\w+)\]/g
  let mentionIdx = 0

  // Split the input string based on the regex
  const parts = line.split(regex)

  // Map each part to a React element
  const elements = parts.map((part, index) => {
    if (index % 2 === 1) {
      // If it's an odd index, it's a user ID, so render a React element
      const userId = part
      const username = mentions[mentionIdx]
      mentionIdx++
      return (
        <UsernameLink key={index} id={userId}>
          @{username}
        </UsernameLink>
      )
    } else {
      // If it's an even index, it's just plain text
      return part
    }
  })

  return <>{elements}</>
}

const InternalTextToHtml = ({
  string,
  mentions,
}: {
  string: string
  mentions: string[]
}) => {
  let elements: React.ReactElement[] = []

  const lines = string.split('\n')

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    if (lineIdx > 0) {
      elements.push(<br />)
    }

    const line = lines[lineIdx]

    elements.push(<Line key={lineIdx} line={line} mentions={mentions} />)
  }

  return <>{elements}</>
}

const SocialPostContents = ({
  text,
  mentions,
}: {
  text: string
  mentions: string[]
}) => <InternalTextToHtml string={text} mentions={mentions} />

const SocialPost = ({
  socialPost,
  hydrate,
  small = false,
}: {
  socialPost: FullSocialPost
  hydrate?: () => void
  small?: boolean
}) => {
  const classes = useStyles()
  const [isExpanded, setIsExpanded] = useState(false)
  const isEditor = useIsEditor()
  const [isEditorControlsVisible, setIsEditorControlsVisible] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const activePostId = useQueryParam('post')

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
      title={socialPost.id}>
      <div className={classes.avatar}>
        <UsernameLink id={socialPost.createdby}>
          <Avatar url={socialPost.createdbyavatarurl} size={sizes.TINY} />
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
                color="default"
                onClick={() =>
                  setIsEditorControlsVisible((currentVal) => !currentVal)
                }
                className={classes.controls}>
                Toggle Controls
              </Button>
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
          <SocialPostContents
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
                color="default"
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
        <SocialReactions
          socialPostId={socialPost.id}
          myReactionEmoji={socialPost.myreactionemoji}
          reactionSummaries={socialPost.reactionsummaries}
          hydrate={hydrate}
          small={small}
        />
      </div>
    </div>
  )
}

export default SocialPost
