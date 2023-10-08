import React, { useRef } from 'react'
import Link from '../../components/link'
import { makeStyles } from '@material-ui/core/styles'

import twitterImageUrl from '../../assets/images/logos/twitter_square_transparent.webp'
import youtubeImageUrl from '../../assets/images/logos/youtube_square_transparent.webp'
import uploadImageUrl from '../../assets/images/logos/external_square_transparent.webp'

import useDatabaseQuery, {
  CollectionNames,
  Operators,
  options
} from '../../hooks/useDatabaseQuery'

import * as routes from '../../routes'

import ErrorMessage from '../error-message'
import NoResultsMessage from '../no-results-message'
import AttachmentItem from '../attachment'
import LoadingShimmer from '../loading-shimmer'

import ImageGallery from '../image-gallery'
import { isUrlATweet, isUrlAYoutubeVideo, getRandomInt } from '../../utils'
import {
  AttachmentsFieldNames,
  attachmentTypes,
  FullAttachment
} from '../../modules/attachments'

const useStyles = makeStyles({
  caption: {
    marginTop: '0.5rem'
  },
  thumbnail: {
    background: 'rgba(0, 0, 0, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    fontSize: '125%',
    '& img': {
      width: '150px !important',
      marginRight: '1rem'
    }
  }
})

const GetFullAttachmentsFieldNames = {
  createdByUsername: 'createdbyusername'
}

const getImageUrl = (url: string): string => {
  if (isUrlATweet(url)) {
    return twitterImageUrl
  } else if (isUrlAYoutubeVideo(url)) {
    return youtubeImageUrl
  } else {
    return uploadImageUrl
  }
}

const getLabel = (url: string): string => {
  if (isUrlATweet(url)) {
    return 'Tweet'
  } else if (isUrlAYoutubeVideo(url)) {
    return 'YouTube Video'
  } else {
    return 'URL'
  }
}

const Thumbnail = ({ url }: { url: string }) => {
  const classes = useStyles()
  return (
    <div className={classes.thumbnail}>
      <img src={getImageUrl(url)} /> {getLabel(url)}
    </div>
  )
}

const LoadingGallery = () => {
  // store as ref to avoid re-drawing each re-render
  const sizesRefs = useRef([
    getRandomInt(200, 300),
    getRandomInt(200, 300),
    getRandomInt(200, 300)
  ])

  return (
    <ImageGallery
      showLoadingCount={3}
      // thumbnailUrls={[
      //   <LoadingShimmer height={sizesRefs.current[0]} />,
      //   <LoadingShimmer height={sizesRefs.current[1]} />,
      //   <LoadingShimmer height={sizesRefs.current[2]} />
      // ]}
      // isStatic
    />
  )
}

const getParentLink = (parentTable: string, parentId: string) => {
  switch (parentTable) {
    case CollectionNames.Assets:
      return routes.viewAssetWithVar.replace(':assetId', parentId)
    default:
      return '#error'
  }
}

const getParentLabel = (parentTable: string, parentId: string) => {
  switch (parentTable) {
    case CollectionNames.Assets:
      return 'asset'
    default:
      return 'error'
  }
}

export default ({
  parentTable,
  parentId,
  createdBy = undefined,
  includeParents = false
}: {
  parentTable: string
  parentId: string
  createdBy?: string // id
  includeParents?: boolean
}) => {
  const [isLoading, isError, attachments] = useDatabaseQuery<FullAttachment>(
    'getPublicAttachments',
    createdBy
      ? [[AttachmentsFieldNames.createdBy, Operators.EQUALS, createdBy]]
      : [
          [AttachmentsFieldNames.parentTable, Operators.EQUALS, parentTable],
          [AttachmentsFieldNames.parentId, Operators.EQUALS, parentId]
        ],
    {
      [options.queryName]: 'attachments',
      [options.subscribe]: true
    }
  )
  const classes = useStyles()

  if (isLoading) {
    return <LoadingGallery />
  }

  if (isError || !Array.isArray(attachments)) {
    return <ErrorMessage>Failed to load attachments</ErrorMessage>
  }

  if (!attachments.length) {
    return <NoResultsMessage>No user attachments found</NoResultsMessage>
  }

  return (
    <div>
      <ImageGallery
        images={attachments.map(attachment => ({
          url: attachment.url,
          caption: (
            <>
              Posted by{' '}
              <Link
                to={routes.viewUserWithVar.replace(
                  ':userId',
                  attachment.createdby
                )}>
                {attachment.createdbyusername}
              </Link>
              {includeParents ? (
                <>
                  {' '}
                  for{' '}
                  <Link
                    to={getParentLink(
                      attachment.parenttable,
                      attachment.parentid
                    )}>
                    {getParentLabel(
                      attachment.parenttable,
                      attachment.parentid
                    )}
                  </Link>
                </>
              ) : null}
            </>
          )
        }))}

        // renderer={({ url, index }) => {
        //   const attachment = attachments[index]
        //   return (
        //     <div>
        //       <AttachmentItem attachment={attachment} />
        //       <div className={classes.caption}>

        //       </div>
        //     </div>
        //   )
        // }}
        // thumbnailUrls={attachments.map(attachment =>
        //   attachment.thumbnailurl ? (
        //     attachment.thumbnailurl
        //   ) : attachment.type === attachmentTypes.image ? (
        //     attachment.url
        //   ) : (
        //     <Thumbnail url={attachment.url} />
        //   )
        // )}
      />
    </div>
  )
}
