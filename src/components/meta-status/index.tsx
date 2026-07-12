import React from 'react'
import { makeStyles } from '@mui/styles'
import InfoIcon from '@mui/icons-material/Info'

import {
  AccessStatus,
  ApprovalStatus,
  FeaturedStatus,
  PublishStatus,
} from '@/modules/common'
import { ActionUser, AssetAction } from '@/modules/assets'
import { colorPalette } from '@/config'

import UsernameLink from '@/components/username-link'
import FormattedDate from '@/components/formatted-date'
import Link from '@/components/link'
import Tooltip from '../tooltip'
import { routes } from '@/routes'
import HintText from '../hint-text'

const useStyles = makeStyles({
  status: {
    fontWeight: 'bold',
    '& a': {
      color: 'inherit',
    },
  },
  good: {
    color: colorPalette.positive,
  },
  average: {},
  bad: {
    color: colorPalette.warning,
  },
  verybad: {
    color: colorPalette.negative,
  },
})

interface Meta {
  positivity: -1 | -0.5 | 0 | 1
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
    positivity: -0.5,
    label: 'Quarantined',
  },
  [ApprovalStatus.Declined]: {
    positivity: -1,
    label: 'Declined',
  },
  [ApprovalStatus.AutoApproved]: {
    positivity: 1, // emphasise as important
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
    positivity: 0,
    label: 'Not Deleted', // "Public" is confusing with actually visible to everyone
  },
}

const publishStatusMetas: { [key in PublishStatus]: Meta } = {
  [PublishStatus.Draft]: {
    positivity: 0,
    label: 'Draft',
  },
  [PublishStatus.Published]: {
    positivity: 0, // dont highlight unimportant things
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
  action,
  parentType,
  parentId,
  reasonOrReasons,
}: {
  status: any
  type: any
  parentType?: string
  parentId?: string
  action?: AssetAction
  reasonOrReasons?: string | string[]
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
      : meta.positivity === -0.5
      ? classes.bad
      : meta.positivity === -1
      ? classes.verybad
      : ''

  return (
    <div
      className={`${classes.status} ${className}`}
      title={action ? action.at : ''}>
      {meta.label}
      {reasonOrReasons ? (
        <>
          :{' '}
          {Array.isArray(reasonOrReasons)
            ? reasonOrReasons.length
              ? reasonOrReasons.join('')
              : '(no reason)'
            : reasonOrReasons}
        </>
      ) : null}
      {action ? (
        <small>
          <br />
          <FormattedDate date={action.at} />
          {action.by ? (
            <>
              {' '}
              by{' '}
              <UsernameLink id={action.by.id} username={action.by.username} />
            </>
          ) : null}
          {parentId && parentType && (
            <Tooltip title="View history entry">
              <Link
                to={`${routes.adminWithTabNameVar.replace(
                  ':tabName',
                  'history'
                )}?parentType=${parentType}&parentId=${parentId}&entryId=${
                  action.history
                }`}>
                <InfoIcon />
              </Link>
            </Tooltip>
          )}
        </small>
      ) : (
        ''
      )}
    </div>
  )
}

export default MetaStatus
