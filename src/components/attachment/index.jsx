import React from 'react'
import {
  AttachmentsFieldNames,
  attachmentTypes
} from '../../modules/attachments'
import { isUrlATweet, isUrlAYoutubeVideo } from '../../utils'
import VideoPlayer from '../video-player'
import Tweet from '../tweet'
import Button from '../button'

export default ({
  attachment: {
    [AttachmentsFieldNames.type]: type,
    [AttachmentsFieldNames.url]: url
  }
}) => {
  switch (type) {
    case attachmentTypes.image:
      return <img src={url} />
    case attachmentTypes.url:
      if (isUrlATweet(url)) {
        return <Tweet url={url} />
      } else if (isUrlAYoutubeVideo(url)) {
        return (
          <VideoPlayer
            url={url}
            config={{
              youtube: { playerVars: { autoplay: 1 } },
              file: { attributes: { autoPlay: true } }
            }}
          />
        )
      } else {
        return <Button url={url}>Visit Link</Button>
      }
    default:
      throw new Error(`Cannot render upload item: unknown type "${type}"!`)
  }
}
