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

const Feature = ({ tag, data }: { tag: string; data?: Tag }) => {
  if (!data) {
    throw new Error(`Tag ${tag} has no data`)
  }

  const classes = useStyles()
  // const Icon = tagDetails.icon || null
  return (
    <Link
      to={routes.queryWithVar.replace(':query', tag)}
      className={classes.item}>
      {/* {Icon ? (
        <div className={classes.icon}>
          <Icon />
        </div>
      ) : null} */}
      <div className={classes.label}>
        {data.label || getLabelForTag(tag)}
        {data.description ? (
          <div className={classes.tipIcon}>
            <Tooltip title={data.description}>
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

const useTags = (existingTagsData?: Tag[]) =>
  existingTagsData && existingTagsData.length
    ? []
    : useDataStoreItems<Tag>(CollectionNames.Tags, 'tags-for-features')

const AssetFeatures = ({
  tags = [],
  existingTagsData = [],
  shimmer = false
}: {
  tags?: string[]
  existingTagsData?: Tag[]
  shimmer?: boolean
}) => {
  const classes = useStyles()
  const [isLoadingFeatures, isErrorLoadingFeatures, tagsData] = useTags(
    existingTagsData
  )

  if (shimmer) {
    return (
      <div className={classes.items}>
        <LoadingFeature />
        <LoadingFeature />
        <LoadingFeature />
      </div>
    )
  }

  const tagsDataToUse = existingTagsData || tagsData

  if (!tags || !tags.length || !tagsDataToUse || !tagsDataToUse.length) {
    return null
  }

  return (
    <div className={classes.items}>
      {tagsDataToUse
        .filter(tagsData => tags.find(tag => tagsData.id === tag))
        .map(tagsData => (
          <Feature key={tagsData.id} tag={tagsData.id} data={tagsData} />
        ))}
    </div>
  )
}

export default AssetFeatures
