import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Tooltip from '@material-ui/core/Tooltip'
import HelpIcon from '@material-ui/icons/Help'
import {
  allTags as tagDetails,
  TagDetails,
  getLabelForTagDetails
} from '../../utils/tags'
import LoadingShimmer from '../loading-shimmer'
import { colorPalette } from '../../config'
import * as routes from '../../routes'
import Link from '../link'

const useStyles = makeStyles({
  items: {
    margin: '2rem 0'
  },
  item: {
    width: '100%',
    marginTop: '1rem',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    color: 'inherit'
  },
  icon: {
    width: '25px',
    display: 'flex',
    justifyContent: 'center',
    marginRight: '1rem',
    fontSize: '1.5rem',
    '& svg': {
      width: '1em',
      height: '1em',
      fill: '#FFF',
      '& path:not([fill*=none])': {
        fill: 'inherit'
      }
    }
  },
  label: {
    display: 'flex'
  },
  bad: {
    color: colorPalette.negative,
    '& svg': {
      fill: colorPalette.negative
    }
  },
  tipIcon: {
    margin: '-0.25rem 0 0 0.25rem',
    '& svg': {
      fontSize: '75%'
    }
  }
})

const Feature = ({ tagDetails }: { tagDetails: TagDetails }) => {
  const classes = useStyles()
  const Icon = tagDetails.icon || null
  return (
    <Link
      to={routes.queryWithVar.replace(':query', tagDetails.tag)}
      className={classes.item}>
      {Icon ? (
        <div className={classes.icon}>
          <Icon />
        </div>
      ) : null}
      <div className={classes.label}>
        {getLabelForTagDetails(tagDetails)}
        {tagDetails.tip ? (
          <div className={classes.tipIcon}>
            <Tooltip title={tagDetails.tip}>
              <HelpIcon />
            </Tooltip>
          </div>
        ) : null}
      </div>
    </Link>
  )
}

const LoadingFeature = () => {
  const classes = useStyles()
  return (
    <div className={classes.item}>
      <div className={classes.icon}>
        <LoadingShimmer width={20} height={20} />
      </div>
      <div className={classes.label}>
        <LoadingShimmer width={100} height={20} />
      </div>
    </div>
  )
}

const getTagDetailsFromTags = (tags: string[]): TagDetails[] => {
  const newTagDetails: TagDetails[] = []

  for (const tag of tags) {
    const match = tagDetails.find(tagDetail => tagDetail.tag === tag)

    if (match && match.icon) {
      newTagDetails.push(match)
    }
  }

  return newTagDetails
}

export default ({
  tags = [],
  shimmer = false
}: {
  tags?: string[]
  shimmer?: boolean
}) => {
  const classes = useStyles()

  if (shimmer) {
    return (
      <div className={classes.items}>
        <LoadingFeature />
        <LoadingFeature />
        <LoadingFeature />
      </div>
    )
  }

  if (!tags || !tags.length) {
    return null
  }

  return (
    <div className={classes.items}>
      {getTagDetailsFromTags(tags).map(tagDetails => (
        <Feature key={tagDetails.tag} tagDetails={tagDetails} />
      ))}
    </div>
  )
}