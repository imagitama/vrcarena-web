import React, { useEffect, useRef } from 'react'
import Markdown from '../markdown'
import Link from '../../components/link'
import { makeStyles } from '@material-ui/core/styles'

import useUserRecord from '../../hooks/useUserRecord'
import {
  CollectionNames as OldCollectionNames,
  AccessStatuses,
} from '../../hooks/useDatabaseQuery'
import { CollectionNames } from '../../data-store'

import { canEditComments } from '../../permissions'
import * as routes from '../../routes'
import { getIsRoleAStaffMember } from '../../utils/users'
import { scrollToElement } from '../../utils'

import FormattedDate from '../formatted-date'
import Avatar from '../avatar'
import StaffBadge from '../staff-badge'
import LoadingShimmer from '../loading-shimmer'
import EditorRecordManager from '../editor-record-manager'
import useIsLoggedIn from '../../hooks/useIsLoggedIn'
import { FullComment } from '../../modules/comments'
import ReportButton from '../report-button'
import { mediaQueryForTabletsOrBelow } from '../../media-queries'
import MentionsOutput from '../mentions-output'

const useStyles = makeStyles({
  cols: {
    marginBottom: '1rem',
    position: 'relative',
    display: 'flex',
  },
  deleted: {
    opacity: '0.5',
  },
  colLeft: {
    width: '50px',
    marginRight: '1rem',
    [mediaQueryForTabletsOrBelow]: {
      marginRight: '0.5rem',
    },
  },
  colRight: {
    flex: 1,
  },
  content: {
    marginTop: '0.25rem',
    flex: 1,
    '& p:first-child': {
      marginTop: 0,
    },
    '& p:last-child': {
      marginBottom: 0,
    },
  },
  deletedMessage: {
    fontStyle: 'italic',
  },
  date: {},
  contentWrapper: {
    display: 'flex',
  },
  controls: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  control: {},
  meta: {
    display: 'inline-block',
  },
  metaItems: {
    marginLeft: '0.25rem',
    fontSize: '75%',
    display: 'flex',
    alignItems: 'center',
    '& > div': {
      display: 'inline-block',
      marginRight: '1rem',
    },
  },
  highlighted: {
    border: '1px dashed rgb(255, 255, 0)',
    padding: '0.25rem',
  },
})

const maxLength = 100

const shortenComment = (contents: string): string => {
  if (contents.length >= maxLength) {
    return `${contents.substr(0, maxLength)}...`
  }
  return contents
}

export default ({
  comment,
  isHighlighted = false,
  performScroll = false,
  shimmer = false,
  hydrate = undefined,
  showControls = true,
  shorten = false,
}: {
  comment: FullComment
  isHighlighted?: boolean
  performScroll?: boolean
  shimmer?: boolean
  hydrate?: () => void
  showControls?: boolean
  shorten?: boolean
}) => {
  const [, , user] = useUserRecord()
  const classes = useStyles()
  const htmlElementRef = useRef(null)
  const isLoggedIn = useIsLoggedIn()

  useEffect(() => {
    if (!performScroll) {
      return
    }

    console.debug(`Scrolling to comment "${id}"...`)

    if (htmlElementRef.current) {
      scrollToElement(htmlElementRef.current)
    }
  }, [performScroll])

  const {
    id,
    comment: commentText,
    // meta
    accessstatus: accessStatus,
    editornotes: editorNotes,
    createdat: createdAt,
    createdby: createdBy,
    // view
    mentions,
    createdbyusername: createdByUsername,
    createdbyavatarurl: createdByAvatarUrl,
    createdbyrole: createdByRole,
  } = comment

  const isDeleted = accessStatus === AccessStatuses.Deleted

  return (
    <div
      className={`${classes.cols} ${isDeleted ? classes.deleted : ''} ${
        isHighlighted ? classes.highlighted : ''
      }`}
      title={id}
      ref={htmlElementRef}>
      <div className={classes.colLeft}>
        {shimmer ? (
          <LoadingShimmer width={50} height={50} />
        ) : (
          /* @ts-ignore */
          <Avatar url={createdByAvatarUrl} size={null} />
        )}
      </div>
      <div className={classes.colRight}>
        {shimmer ? (
          <LoadingShimmer width={100} height={25} />
        ) : createdBy ? (
          <Link to={routes.viewUserWithVar.replace(':userId', createdBy)}>
            {createdByUsername || 'User'}
          </Link>
        ) : (
          '(no creator)'
        )}{' '}
        {getIsRoleAStaffMember(createdByRole) && <StaffBadge isSmall />}
        {shimmer ? null : (
          <div className={classes.meta}>
            <div className={classes.metaItems}>
              <div className={classes.date}>
                {createdAt ? <FormattedDate date={createdAt} /> : null}
              </div>
            </div>
          </div>
        )}
        <div className={classes.contentWrapper}>
          {shimmer ? (
            <LoadingShimmer width={400} height={25} />
          ) : (!isDeleted || canEditComments(user)) && commentText ? (
            <div className={classes.content}>
              <MentionsOutput
                text={shorten ? shortenComment(commentText) : commentText}
                mentions={mentions}
              />
            </div>
          ) : null}
          {showControls && isLoggedIn && id ? (
            <ReportButton id={id} type={OldCollectionNames.Comments} small />
          ) : null}
          {showControls && !shimmer && canEditComments(user) && id && (
            <div className={classes.controls}>
              <div className={classes.control}>
                <EditorRecordManager
                  id={id}
                  metaCollectionName={CollectionNames.CommentsMeta}
                  existingAccessStatus={accessStatus}
                  existingEditorNotes={editorNotes}
                  showApprovalButtons={false}
                  showPublishButtons={false}
                  showEditorNotes={false}
                  onDone={hydrate ? () => hydrate() : undefined}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
