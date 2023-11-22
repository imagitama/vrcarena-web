import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Tooltip from '@material-ui/core/Tooltip'
import { getLabelForTag } from '../../utils/tags'
import LoadingShimmer from '../loading-shimmer'
import * as routes from '../../routes'
import Link from '../link'
import { CollectionNames, Tag } from '../../modules/tags'
import useDataStoreItems from '../../hooks/useDataStoreItems'
import * as icons from '../../icons'

const useStyles = makeStyles((theme) => ({
  root: {
    margin: '2rem 0',
  },
  items: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  feature: {
    width: '2.5rem',
    height: '2.5rem',
    margin: '0rem 0.25rem 0.25rem 0',
    border: '1px solid rgba(255, 255, 255, 0.5)',
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
      padding: '0.5rem',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      '& > div': {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      },
    },
    '& svg': {
      width: '100%',
      height: '100%',
      fill: '#FFF',
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
}: // hasTag,
{
  tag: string
  data?: Tag
  hasTag?: boolean
}) => {
  if (!data) {
    throw new Error(`Tag ${tag} has no data`)
  }

  const classes = useStyles()
  const Icon =
    data.icon in icons
      ? // @ts-ignore
        icons[data.icon]
      : () => <span>{tag.substring(0, 3)}</span>

  return (
    <div
      // TODO: Show it is bad
      className={`${classes.feature}`}>
      <Tooltip
        title={`${data.label || getLabelForTag(tag)} - ${data.description}`}>
        <div>
          <Link to={routes.queryWithVar.replace(':query', tag)}>
            <Icon />
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
    'tags-for-features',
    'id'
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

  const tagsDataToUse =
    tagsData && tagsData.length
      ? tagsData
      : existingTagsData.length
      ? existingTagsData
      : []

  if (!tagsDataToUse.length) {
    return null
  }

  const tagsDataToDisplay = tagsDataToUse.filter((tagsData) =>
    tags.length ? tags.find((tag) => tagsData.id === tag) : true
  )

  const tagDataByCategory = tagsDataToDisplay.reduce<{
    [categoryName: string]: Tag[]
  }>(
    (result, tagData) => ({
      ...result,
      [tagData.category]: result[tagData.category]
        ? result[tagData.category].concat([tagData])
        : [tagData],
    }),
    {}
  )

  return (
    <div className={classes.root}>
      {Object.entries(tagDataByCategory).map(([categoryName, tagsData]) => (
        <div key={categoryName} className={classes.items}>
          {tagsData.map((tagsData) => (
            <Feature key={tagsData.id} tag={tagsData.id} data={tagsData} />
          ))}
        </div>
      ))}
    </div>
  )
}

export default FeatureList
