import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Tooltip from '@material-ui/core/Tooltip'
import HelpIcon from '@material-ui/icons/Help'
import { getLabelForTag } from '../../utils/tags'
import LoadingShimmer from '../loading-shimmer'
import { colorPalette } from '../../config'
import * as routes from '../../routes'
import Link from '../link'
import { CollectionNames, FullTag, Tag } from '../../modules/tags'
import useDataStoreItems from '../../hooks/useDataStoreItems'

const useStyles = makeStyles((theme) => ({
  items: {
    margin: '2rem 0',
    display: 'flex',
    flexWrap: 'wrap',
  },
  feature: {
    width: '2.5rem',
    height: '2.5rem',
    margin: '0rem 0.25rem 0.25rem 0',
    border: '1px solid rgba(255, 255, 255, 0.5)',
    // color: 'rgba(255, 255, 255, 0.75)',
    borderRadius: theme.shape.borderRadius,
    overflow: 'hidden',
    textTransform: 'uppercase',
    lineHeight: 1.6,
    '& > div': {
      width: '100%',
      height: '100%',
    },
    '& a': {
      color: 'inherit',
      width: '100%',
      height: '100%',
      display: 'block',
      padding: '0.5rem',
      '& > div': {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      },
    },
    '& svg': {
      width: '100%',
      height: '100%',
    },
  },
  loading: {
    border: 'none',
  },
  good: {
    // borderColor: 'rgba(100, 255, 100, 0.5)',
  },
  bad: {
    borderColor: 'rgba(255, 100, 100, 0.5)',
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
        fill: 'inherit',
      },
    },
  },
  label: {
    display: 'flex',
  },
  tipIcon: {
    margin: '-0.25rem 0 0 0.25rem',
    '& svg': {
      fontSize: '75%',
    },
  },
}))

const Feature = ({
  tag,
  data,
  hasTag,
}: {
  tag: string
  data?: Tag
  hasTag: boolean
}) => {
  if (!data) {
    throw new Error(`Tag ${tag} has no data`)
  }

  const classes = useStyles()
  const iconString = data.icon || `<span>${tag.substring(0, 3)}</div>`

  return (
    <div
      className={`${classes.feature} ${hasTag ? classes.good : classes.bad}`}>
      <Tooltip
        title={`${data.label || getLabelForTag(tag)} - ${data.description}`}>
        <div>
          <Link to={routes.queryWithVar.replace(':query', tag)}>
            <div dangerouslySetInnerHTML={{ __html: iconString }}></div>{' '}
          </Link>
        </div>
      </Tooltip>
    </div>
  )
}

const LoadingFeature = () => {
  const classes = useStyles()
  return (
    <div className={`${classes.feature} ${classes.loading}`}>
      <LoadingShimmer width="100%" height="100%" />
    </div>
  )
}

const useTags = (existingTagsData?: Tag[]) =>
  useDataStoreItems<Tag>(
    existingTagsData && existingTagsData.length ? '' : CollectionNames.Tags,
    'tags-for-features'
  )

const FeatureList = ({
  tags = [],
  existingTagsData = [],
  shimmer = false,
}: {
  tags?: string[]
  existingTagsData?: Tag[]
  shimmer?: boolean
}) => {
  const classes = useStyles()
  const [isLoadingFeatures, , tagsData] = useTags(existingTagsData)

  if (shimmer || isLoadingFeatures) {
    return (
      <div className={classes.items}>
        <LoadingFeature />
        <LoadingFeature />
        <LoadingFeature />
        <LoadingFeature />
        <LoadingFeature />
      </div>
    )
  }

  const tagsDataToUse = tagsData || existingTagsData

  if (!tags || !tags.length || !tagsDataToUse || !tagsDataToUse.length) {
    return null
  }

  return (
    <div className={classes.items}>
      {tagsDataToUse
        .filter((tagsData) => tags.find((tag) => tagsData.id === tag))
        .map((tagsData) => (
          <Feature
            key={tagsData.id}
            tag={tagsData.id}
            data={tagsData}
            hasTag={tags.includes(tagsData.id)}
          />
        ))}
    </div>
  )
}

export default FeatureList
