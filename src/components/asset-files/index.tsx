import React from 'react'

import { isUrlAnImage, isUrlAVideo, isUrlAYoutubeVideo } from '../../utils'
import { trackAction } from '../../analytics'

import FileList from '../asset-overview/components/file-list'
import VideoList from '../asset-overview/components/video-list'
import ImageGallery from '../image-gallery'

export default ({
  assetId,
  fileUrls,
  thumbnailUrl = '',
  analyticsCategoryName = '',
}: {
  assetId: string
  thumbnailUrl?: string
  fileUrls: string[]
  analyticsCategoryName?: string
}) => {
  const downloadUrls = fileUrls
    .filter(
      (fileUrl) =>
        !isUrlAnImage(fileUrl) &&
        !isUrlAVideo(fileUrl) &&
        !isUrlAYoutubeVideo(fileUrl)
    )
    .filter((fileUrl) => fileUrl !== thumbnailUrl)

  const imageUrls = fileUrls
    .filter(isUrlAnImage)
    .filter((fileUrl) => fileUrl !== thumbnailUrl)

  const videoUrls = fileUrls
    .filter((url) => isUrlAVideo(url) || isUrlAYoutubeVideo(url))
    .filter((fileUrl) => fileUrl !== thumbnailUrl)

  return (
    <>
      {downloadUrls.length === 0 &&
        videoUrls.length === 0 &&
        imageUrls.length === 0 &&
        'No attached files'}
      {downloadUrls.length ? (
        <>
          <FileList assetId={assetId} fileUrls={downloadUrls} />
        </>
      ) : null}
      {videoUrls.length ? (
        <>
          <VideoList assetId={assetId} urls={videoUrls} />
        </>
      ) : null}
      {imageUrls.length ? (
        <>
          <ImageGallery
            images={imageUrls.map((url) => ({
              url,
            }))}
            onClickImage={() =>
              analyticsCategoryName &&
              trackAction(
                analyticsCategoryName,
                'Click attached image thumbnail to open gallery'
              )
            }
            onMoveNext={() =>
              analyticsCategoryName &&
              trackAction(
                analyticsCategoryName,
                'Click go next image in gallery'
              )
            }
            onMovePrev={() =>
              analyticsCategoryName &&
              trackAction(
                analyticsCategoryName,
                'Click go prev image in gallery'
              )
            }
          />
        </>
      ) : null}
    </>
  )
}
