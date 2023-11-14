import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'

import Avatar, { sizes } from '../avatar'
import {
  CollectionNames,
  FullSocialPost,
  SocialAttachment,
} from '../../modules/social'
import { trimDescription } from '../../utils/formatting'
import useIsEditor from '../../hooks/useIsEditor'

import Markdown from '../markdown'
import FormattedDate from '../formatted-date'
import UsernameLink from '../username-link'
import Button from '../button'
import EditorRecordManager from '../editor-record-manager'
import Paper from '../paper'
import SocialReactions from '../social-reactions'

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
}: {
  socialPost: FullSocialPost
  hydrate?: () => void
}) => {
  const classes = useStyles()
  const [isExpanded, setIsExpanded] = useState(false)
  const isEditor = useIsEditor()
  const [isEditorControlsVisible, setIsEditorControlsVisible] = useState(false)

  return (
    <div className={classes.root}>
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
          {isEditor && (
            <>
              {socialPost.editornotes && (
                <Paper>
                  <strong>Editor Notes (not public yet): </strong>
                  {socialPost.editornotes}
                </Paper>
              )}
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
          <Markdown
            source={
              isExpanded
                ? socialPost.text
                : trimDescription(socialPost.text, limitBeforeCollapse)
            }
          />
          {socialPost.text.length > limitBeforeCollapse && (
            <Button color="default" onClick={() => setIsExpanded(false)}>
              View More
            </Button>
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
        />
      </div>
    </div>
  )
}

export default SocialPost
