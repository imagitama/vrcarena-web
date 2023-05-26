import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Tooltip from '@material-ui/core/Tooltip'
import HelpIcon from '@material-ui/icons/Help'
import { featureMeta } from '../../features'
import LoadingShimmer from '../loading-shimmer'
import { colorPalette } from '../../config'

const useStyles = makeStyles({
  items: {
    margin: '2rem 0'
  },
  item: {
    width: '100%',
    marginTop: '1rem',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center'
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

const Feature = ({ featureName, matchedTags, isBad = false, tip = '' }) => {
  const classes = useStyles()
  const feature = featureMeta[featureName]
  const Icon = feature.icon
  return (
    <div className={`${classes.item} ${isBad ? classes.bad : ''}`}>
      <div className={classes.icon}>
        <Icon />
      </div>
      <div className={classes.label}>
        {feature.label}
        {tip ? (
          <div className={classes.tipIcon}>
            <Tooltip title={tip}>
              <HelpIcon />
            </Tooltip>
          </div>
        ) : null}
      </div>
    </div>
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

const getFeaturesFromTags = tags => {
  const matches = []
  const featureEntries = Object.entries(featureMeta)

  for (const [featureName, feature] of featureEntries) {
    for (const tag of tags) {
      if (feature.tags.includes(tag)) {
        const match = matches.find(item => item.featureName === featureName)

        if (match) {
          match.matchedTags.push(tag)
        } else {
          matches.push({
            featureName,
            matchedTags: [tag],
            ...feature
          })
        }
      }
    }
  }

  return matches
}

export default ({ tags = [], shimmer = false }) => {
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
      {getFeaturesFromTags(tags).map(feature => (
        <Feature key={feature.featureName} {...feature} />
      ))}
    </div>
  )
}
