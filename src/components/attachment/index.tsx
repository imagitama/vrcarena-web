import React from 'react'
import LaunchIcon from '@material-ui/icons/Launch'
import { AttachmentType, AttachmentFields } from '../../modules/attachments'
import { getIsUrlAYoutubeVideo } from '../../utils'
import VideoPlayer from '../video-player'
import Button from '../button'

const Attachment = ({
  attachment: { type, url },
  showFileUrls = false,
  width = undefined,
}: {
  attachment: AttachmentFields
  showFileUrls?: boolean
  width?: string | number
}) => {
  switch (type) {
    case AttachmentType.Image:
      return <img src={url} width={width} />
    case AttachmentType.Url:
      if (getIsUrlAYoutubeVideo(url)) {
        return (
          <VideoPlayer
            url={url}
            config={{
              youtube: { playerVars: { autoplay: 1 } },
              file: { attributes: { autoPlay: true } },
            }}
            width={width}
          />
        )
      } else {
        return (
          <>
            {showFileUrls ? url : null}
            <Button
              url={url}
              size="large"
              icon={<LaunchIcon />}
              color="tertiary">
              Visit Link
            </Button>
          </>
        )
      }
    default:
      return <Button url={url}>View File</Button>
  }
}

export default Attachment
