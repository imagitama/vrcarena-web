import React from 'react'
import { AttachmentType, AttachmentFields } from '../../modules/attachments'
import { isUrlATweet, isUrlAYoutubeVideo } from '../../utils'
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
      if (isUrlAYoutubeVideo(url)) {
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
            <Button url={url}>Visit Link</Button>
          </>
        )
      }
    default:
      return <Button url={url}>View File</Button>
  }
}

export default Attachment
