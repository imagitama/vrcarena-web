import React from 'react'
import Link from '../../components/link'
import { makeStyles } from '@material-ui/core/styles'
import useDatabaseQuery, {
  AssetFieldNames,
  CollectionNames,
  UploadItemFieldNames,
  UploadItemTypes,
  UserFieldNames
} from '../../hooks/useDatabaseQuery'
import * as routes from '../../routes'
import VideoPlayer from '../video-player'

const useStyles = makeStyles({
  caption: {
    marginTop: '0.5rem'
  }
})

function Output({ uploadItem: { type, url } }) {
  switch (type) {
    case UploadItemTypes.IMAGE:
      return <img src={url} />
    case UploadItemTypes.VIDEO:
    case UploadItemTypes.YOUTUBE_VIDEO:
      return (
        <VideoPlayer
          url={url}
          config={{
            youtube: { playerVars: { autoplay: 1 } },
            file: { attributes: { autoPlay: true } }
          }}
        />
      )
    default:
      throw new Error(`Cannot render upload item: unknown type "${type}"!`)
  }
}

export default ({ uploadItem, user }) => {
  const [, , asset] = useDatabaseQuery(
    CollectionNames.Assets,
    uploadItem[UploadItemFieldNames.parent]
      ? uploadItem[UploadItemFieldNames.parent].id
      : false
  )
  const classes = useStyles()
  return (
    <div>
      <Output uploadItem={uploadItem} />
      <div className={classes.caption}>
        Uploaded by{' '}
        <Link to={routes.viewUserWithVar.replace(':userId', user.id)}>
          {user[UserFieldNames.username]}
        </Link>{' '}
        {asset ? (
          <>
            for{' '}
            <Link
              to={routes.viewAssetWithVar.replace(
                ':assetId',
                asset.slug || asset.id
              )}>
              {asset[AssetFieldNames.title]}
            </Link>
          </>
        ) : null}
      </div>
    </div>
  )
}
