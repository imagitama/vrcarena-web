import React, { useState } from 'react'
import LazyLoad from 'react-lazyload'
import Card from '@material-ui/core/Card'
import CardActionArea from '@material-ui/core/CardActionArea'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import Typography from '@material-ui/core/Typography'
import { makeStyles } from '@material-ui/core/styles'
import OpenInNewIcon from '@material-ui/icons/OpenInNew'
import Chip from '@material-ui/core/Chip'

import { mediaQueryForTabletsOrBelow } from '../../media-queries'
import FormattedDate from '../formatted-date'
import defaultAvatarImageUrl from '../../assets/images/default-avatar.png'
import { handleError } from '../../error-handling'
import { callFunction } from '../../firebase'
import Button from '../button'
import { viewVrchatAvatarUrlWithVar } from '../../config'

const chipMargin = '0.25rem'

const useStyles = makeStyles((theme) => ({
  root: {
    width: '200px',
    margin: '0.5rem',
    position: 'relative',
    [mediaQueryForTabletsOrBelow]: {
      width: '160px',
      margin: '0.25rem',
    },
    overflow: 'visible',
  },
  media: {
    height: '200px',
  },
  chips: {
    position: 'absolute',
    top: 0,
    right: 0,
    padding: chipMargin,
  },
  chip: {
    cursor: 'pointer',
    marginLeft: chipMargin,
  },
  date: {
    margin: '0.25rem 0 0.5rem',
    color: theme.palette.text.secondary,
  },
  icon: {
    '& svg': {
      fontSize: '1rem',
    },
  },
}))

// avatar: https://vrchatapi.github.io/docs/api#get-/avatars/-avatarId-

const getDateFromVrchatApiDate = (vrchatApiDate: string): Date =>
  new Date(vrchatApiDate)

const getIsQuestCompatible = (unityPackages: UnityPackage[]): boolean =>
  unityPackages.find(({ platform }) => platform === 'android') !== undefined
const getIsPcCompatible = (unityPackages: UnityPackage[]): boolean =>
  unityPackages.find(({ platform }) => platform === 'standalonewindows') !==
  undefined

interface UnityPackage {
  platform: 'android' | 'standalonewindows'
}

export interface VrchatAvatar {
  id: string
  imageUrl: string
  name: string
  authorName: string
  created_at: string
  updated_at: string
  description: string
  release_status: string
  unityPackages: UnityPackage[]
}

export default ({
  avatarId,
  avatarData,
  allowFetch = false,
}: {
  avatarId: string
  avatarData?: VrchatAvatar
  allowFetch?: boolean
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [newData, setNewData] = useState(null)

  const {
    id,
    imageUrl,
    name,
    authorName,
    created_at,
    updated_at,
    description,
    release_status,
    unityPackages = [],
  } = newData || avatarData || {}

  const fetchData = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      setIsLoading(true)

      // NOTE: This function also dumps it into a cache for later retrieval
      const {
        data: { avatar },
      } = await callFunction('getVrchatAvatarDetails', {
        avatarId,
      })

      setNewData(avatar)
      setIsLoading(false)
    } catch (err) {
      console.error(err)
      handleError(err)
      setIsLoading(false)
    }
  }

  const classes = useStyles()

  return (
    <Card className={classes.root}>
      <CardActionArea>
        <a
          href={viewVrchatAvatarUrlWithVar.replace(':avatarId', avatarId)}
          target="_blank"
          rel="noopener noreferrer">
          <div className={classes.chips}>
            {getIsQuestCompatible(unityPackages) && (
              <Chip label="Quest" className={classes.chip} />
            )}
            {getIsPcCompatible(unityPackages) && (
              <Chip label="PC" className={classes.chip} />
            )}
          </div>
          <LazyLoad height={200}>
            <CardMedia
              image={imageUrl || defaultAvatarImageUrl}
              className={classes.media}
            />
          </LazyLoad>
          <CardContent>
            <Typography variant="h5" component="h2">
              {name || avatarId}{' '}
              <span className={classes.icon}>
                <OpenInNewIcon />
              </span>
            </Typography>
            {created_at && (
              <div className={classes.date}>
                <FormattedDate date={getDateFromVrchatApiDate(created_at)} />
              </div>
            )}
            <Typography variant="body2" color="textSecondary" component="p">
              {description}
              {isLoading ? 'Fetching...' : ''}
              {allowFetch && !avatarData ? (
                <Button onClick={fetchData}>Fetch</Button>
              ) : null}
            </Typography>
          </CardContent>
        </a>
      </CardActionArea>
    </Card>
  )
}
