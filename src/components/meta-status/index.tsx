import React from 'react'
import { makeStyles } from '@mui/styles'
import {
  AccessStatus,
  ApprovalStatus,
  FeaturedStatus,
  PublishStatus,
} from '@/modules/common'
import { colorPalette } from '@/config'
import { UserFromView } from '@/modules/users'
import UsernameLink from '../username-link'

const useStyles = makeStyles({
  status: {
    fontWeight: 'bold',
  },
  good: {
    color: colorPalette.positive,
  },
  average: {
    color: colorPalette.warning,
  },
  bad: {
    color: colorPalette.negative,
  },
})

interface Meta {
  positivity: -1 | 0 | 1
  label: string
}

const approvalStatusMetas: { [key in ApprovalStatus]: Meta } = {
  [ApprovalStatus.Approved]: {
    positivity: 1,
    label: 'Approved',
  },
  [ApprovalStatus.Waiting]: {
    positivity: 0,
    label: 'Queued',
  },
  [ApprovalStatus.Quarantined]: {
    positivity: 0,
    label: 'Quarantined',
  },
  [ApprovalStatus.Declined]: {
    positivity: -1,
    label: 'Declined',
  },
  [ApprovalStatus.AutoApproved]: {
    positivity: 0,
    label: 'Auto-Approved',
  },
}

const accessStatusMetas: { [key in AccessStatus]: Meta } = {
  [AccessStatus.Archived]: {
    positivity: -1,
    label: 'Archived',
  },
  [AccessStatus.Deleted]: {
    positivity: -1,
    label: 'Deleted',
  },
  [AccessStatus.Public]: {
    positivity: 1,
    label: 'Not Deleted', // "Public" is confusing with actually visible to everyone
  },
}

const publishStatusMetas: { [key in PublishStatus]: Meta } = {
  [PublishStatus.Draft]: {
    positivity: -1, // negative to hint to user
    label: 'Draft',
  },
  [PublishStatus.Published]: {
    positivity: 1,
    label: 'Published',
  },
}

const featuredStatusMetas: { [key in FeaturedStatus]: Meta } = {
  [FeaturedStatus.Featured]: {
    positivity: 1,
    label: 'Featured',
  },
  [FeaturedStatus.Unfeatured]: {
    positivity: 0,
    label: 'Unfeatured',
  },
}

const MetaStatus = ({
  status,
  type,
  byUser,
}: {
  status: any
  type: any
  byUser?: UserFromView
}) => {
  const classes = useStyles()

  if (!status) {
    return <div>Unknown status: {status}</div>
  }

  const metas =
    type === ApprovalStatus
      ? approvalStatusMetas
      : type === AccessStatus
      ? accessStatusMetas
      : type === PublishStatus
      ? publishStatusMetas
      : type === FeaturedStatus
      ? featuredStatusMetas
      : undefined

  if (!metas) {
    throw new Error('Invalid type')
  }

  const meta: Meta = (metas as any)[status]

  const className =
    meta.positivity === 1
      ? classes.good
      : meta.positivity === 0
      ? classes.average
      : meta.positivity === -1
      ? classes.bad
      : ''

  return (
    <div className={`${classes.status} ${className}`}>
      {meta.label}
      {byUser ? (
        <>
          {' '}
          by <UsernameLink id={byUser.id} username={byUser.username} />
        </>
      ) : (
        ''
      )}
    </div>
  )
}

export default MetaStatus
