import React, { useState } from 'react'
import LazyLoad from 'react-lazyload'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import Typography from '@mui/material/Typography'
import { makeStyles } from '@mui/styles'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import Chip from '@mui/material/Chip'

import { mediaQueryForTabletsOrBelow } from '../../media-queries'
import FormattedDate from '../formatted-date'
import defaultAvatarImageUrl from '../../assets/images/default-avatar.png'
import { handleError } from '../../error-handling'
import { callFunction } from '../../firebase'
import Button from '../button'
import { viewVrchatAvatarUrlWithVar } from '../../config'
import { UnityPackage, VrchatAvatar } from '../../vrchat'
import { VRCArenaTheme } from '../../themes'

const chipMargin = '0.25rem'

const useStyles = makeStyles<VRCArenaTheme>((theme) => ({
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

const getDateFromVrchatApiDate = (vrchatApiDate: string): Date =>
  new Date(vrchatApiDate)

const getIsQuestCompatible = (unityPackages: UnityPackage[]): boolean =>
  unityPackages.find(({ platform }) => platform === 'android') !== undefined
const getIsPcCompatible = (unityPackages: UnityPackage[]): boolean =>
  unityPackages.find(({ platform }) => platform === 'standalonewindows') !==
  undefined

// TODO: Move to module
enum FunctionNames {
  GetVrchatAvatarDetails = 'getVrchatAvatarDetails',
}

export default ({
  avatarId,
  avatarData,
  thumbnailUrl,
  allowFetch = false,
}: {
  avatarId: string
  avatarData?: VrchatAvatar
  thumbnailUrl?: string
  allowFetch?: boolean
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [lastError, setLastError] = useState<null | Error>(null)
  const [newData, setNewData] = useState<
    null | (VrchatAvatar & { thumbnailUrl: string })
  >(null)

  const {
    id,
    name,
    authorName,
    created_at,
    updated_at,
    description,
    release_status,
    unityPackages = [],
  } = newData || avatarData || {}

  const imageUrl =
    newData?.thumbnailUrl ||
    thumbnailUrl ||
    newData?.imageUrl ||
    avatarData?.imageUrl

  const fetchData = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      setIsLoading(true)
      setLastError(null)

      // NOTE: This function also dumps it into a cache for later retrieval
      const {
        data: { avatar, thumbnailUrl },
      } = await callFunction<
        { avatarId: string },
        { avatar: VrchatAvatar; thumbnailUrl: string }
      >(FunctionNames.GetVrchatAvatarDetails, {
        avatarId,
      })

      setNewData({
        ...avatar,
        thumbnailUrl,
      })
      setIsLoading(false)
      setLastError(null)
    } catch (err) {
      console.error(err)
      handleError(err)
      setLastError(err as Error)
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
              {lastError ? lastError.message : ''}
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
