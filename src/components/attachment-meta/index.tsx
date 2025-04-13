import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import LaunchIcon from '@material-ui/icons/Launch'
import FormattedDate from '../formatted-date'
import {
  Attachment,
  AttachmentType,
  FullAttachment,
  isFullAttachment,
} from '../../modules/attachments'
import TagChips from '../tag-chips'
import useUserId from '../../hooks/useUserId'
import Link from '../link'
import * as routes from '../../routes'

const useStyles = makeStyles({
  paper: {
    maxWidth: '500px',
    cursor: 'default',
    padding: '0.5rem',
    fontSize: '75%',
    '& dl': {
      display: 'flex',
      flexWrap: 'wrap',
      margin: 0,
      padding: 0,
    },
    '& dt': {
      width: '40%',
      margin: 0,
      padding: 0,
    },
    '& dd': {
      width: '60%',
      margin: 0,
      padding: 0,
    },
    '& svg': {
      fontSize: '100%',
    },
  },
})

const Type = ({ type }: { type: AttachmentType }) => {
  switch (type) {
    case AttachmentType.File:
      return <>File</>
    case AttachmentType.Image:
      return <>Image</>
    case AttachmentType.Url:
      return <>URL</>
    default:
      return <>unknown</>
  }
}

const AttachmentMeta = ({
  attachment,
}: {
  attachment: FullAttachment | Attachment
}) => {
  const classes = useStyles()
  const userId = useUserId()

  if (!attachment) {
    return <>No attachment for meta</>
  }

  return (
    <div className={classes.paper}>
      <dl>
        <dt>Type</dt>
        <dd>
          {attachment.type ? <Type type={attachment.type} /> : '(none)'}{' '}
          <a href={attachment.url} target="_blank" rel="noopener noreferrer">
            <LaunchIcon />
          </a>
        </dd>
        <dt>Title</dt>
        <dd>{attachment.title || '(none)'}</dd>
        <dt>Description</dt>
        <dd>{attachment.description || '(none)'}</dd>
        <dt>Adult</dt>
        <dd>
          {attachment.isadult ? '🔞 Flagged adult' : 'Not flagged adult'}{' '}
        </dd>
        <dt>Uploaded</dt>
        <dd>
          <FormattedDate date={new Date(attachment.createdat)} /> by{' '}
          {isFullAttachment(attachment) && attachment.createdbyusername
            ? attachment.createdbyusername
            : attachment.createdby
            ? attachment.createdby === userId
              ? '(you)'
              : '(user)'
            : '(no user)'}
        </dd>
        {attachment.lastmodifiedat &&
        attachment.lastmodifiedat !== attachment.createdat ? (
          <>
            <dt>Last modified at</dt>
            <dd>
              <FormattedDate date={new Date(attachment.lastmodifiedat)} /> by{' '}
              {isFullAttachment(attachment) && attachment.lastmodifiedbyusername
                ? attachment.lastmodifiedbyusername
                : attachment.lastmodifiedby
                ? attachment.lastmodifiedby === userId
                  ? '(you)'
                  : '(user)'
                : '(no user)'}
            </dd>
          </>
        ) : null}
        <dt>Tags</dt>
        <dd>
          {attachment.tags && attachment.tags.length ? (
            <TagChips tags={attachment.tags} />
          ) : (
            '(none)'
          )}
        </dd>
      </dl>
      <Link
        to={routes.viewAttachmentWithVar.replace(
          ':attachmentId',
          attachment.id
        )}>
        View Full
      </Link>
    </div>
  )
}

export default AttachmentMeta
