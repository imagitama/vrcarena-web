import React, { useEffect, useRef, useState } from 'react'
import Link from '../../../../components/link'
import { makeStyles } from '@material-ui/core/styles'

import { AssetFieldNames } from '../../../../hooks/useDatabaseQuery'
import Heading from '../../../../components/heading'
import Button from '../../../../components/button'
import * as routes from '../../../../routes'
import { trackAction } from '../../../../analytics'
import { trimDescription } from '../../../../utils/formatting'
import { mediaQueryForMobiles } from '../../../../media-queries'
import useSupabaseView from '../../../../hooks/useSupabaseView'

const useStyles = makeStyles({
  root: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    background: 'rgba(0, 0, 0, 0.1)',
    padding: '2rem',
    borderRadius: '0.5rem',
    opacity: 0,
    transition: 'all 200ms',
    [mediaQueryForMobiles]: {
      flexWrap: 'wrap',
      padding: '1rem'
    }
  },
  visible: {
    opacity: 1
  },
  thumbnailWrapper: {
    perspective: '1000px',
    textAlign: 'center',
    padding: '1rem 0'
  },
  thumbnailImage: {
    width: '100%',
    animation: '20s $spinThumbnail infinite linear',
    transition: 'all 100ms',
    '&:hover': {
      animation: 'none'
    }
  },
  controls: {
    textAlign: 'center',
    marginTop: '2rem',
    [mediaQueryForMobiles]: {
      marginTop: '1rem'
    }
  },
  heading: {
    margin: '0 0 1rem',
    fontSize: '175%'
  },
  bg: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%'
  },
  '@keyframes spinThumbnail': {
    from: {
      transform: 'rotateY(0deg)'
    },
    to: {
      transform: 'rotateY(360deg)'
    }
  },
  media: {
    width: '30%',
    marginRight: '1rem',
    [mediaQueryForMobiles]: {
      marginRight: 0,
      width: '50%'
    }
  },
  video: {
    display: 'flex',
    transform: 'scale(1.9)',
    transition: 'all 100ms',
    [mediaQueryForMobiles]: {
      transform: 'scale(1)'
    }
  },
  text: {
    [mediaQueryForMobiles]: {
      width: '100%'
    }
  },
  newIndicator: {
    backgroundColor: 'rgb(255, 0, 0)',
    color: '#FFF',
    borderRadius: '1rem',
    position: 'absolute',
    top: 0,
    left: 0,
    padding: '0.25rem 1rem',
    textTransform: 'uppercase',
    fontWeight: 'bold',
    transform: 'translate(-50%, -50%)',
    cursor: 'default',
    fontSize: '150%'
  }
})

export default () => {
  const [isLoading, , results] = useSupabaseView(
    'getFeaturedAsset',
    null,
    'featured-asset'
  )
  const [isVisible, setIsVisible] = useState(false)
  const timeoutRef = useRef()
  const classes = useStyles()

  useEffect(() => {
    if (timeoutRef.current) {
      return
    }

    if (!isLoading && results) {
      timeoutRef.current = setTimeout(() => setIsVisible(true), 100)
    }

    return () => clearTimeout(timeoutRef.current)
  }, [isLoading])

  if (!results || results.length === 0) {
    return null
  }

  const asset = results[0]

  const {
    id: assetId,
    [AssetFieldNames.title]: title,
    [AssetFieldNames.description]: description,
    [AssetFieldNames.shortDescription]: shortDescription,
    [AssetFieldNames.thumbnailUrl]: thumbnailUrl,
    [AssetFieldNames.pedestalVideoUrl]: pedestalVideoUrl,
    [AssetFieldNames.pedestalFallbackImageUrl]: pedestalFallbackImageUrl
  } = asset

  const viewUrl = routes.viewAssetWithVar.replace(':assetId', assetId)

  return (
    <div className={`${classes.root} ${isVisible ? classes.visible : ''}`}>
      <div className={classes.media}>
        <Link
          to={viewUrl}
          onClick={() => trackAction('Home', 'Click featured asset thumbnail')}
        />
      </div>
      <div className={classes.text}>
        <Heading variant="h1" className={classes.heading}>
          <Link
            to={viewUrl}
            onClick={() => trackAction('Home', 'Click featured asset title')}>
            {title}
          </Link>
        </Heading>
        {trimDescription(shortDescription || description || '')}
        <div className={classes.controls}>
          <Button
            url={viewUrl}
            size="large"
            icon={<ChevronRightIcon />}
            onClick={() =>
              trackAction('Home', 'Click view featured asset button')
            }>
            View Featured Asset
          </Button>
        </div>
      </div>
    </div>
  )
}
