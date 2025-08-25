import React from 'react'
import { makeStyles } from '@mui/styles'
import {
  AccessStatus,
  ApprovalStatus,
  PublishStatus,
} from '../../modules/common'
import { colorPalette } from '../../config'

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
    label: 'Waiting For Approval',
  },
  [ApprovalStatus.Declined]: {
    positivity: -1,
    label: 'Declined',
  },
  [ApprovalStatus.AutoApproved]: {
    positivity: 0,
    label: 'Waiting For Approval (Auto)',
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

const MetaStatus = ({ status, type }: { status: any; type: any }) => {
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

  return <div className={`${classes.status} ${className}`}>{meta.label}</div>
}

export default MetaStatus
